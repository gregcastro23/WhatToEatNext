/**
 * Deterministic Recipe Verification Gate & Local Repair Pipeline
 *
 * Implements WTEN's culinary authority gate for AI-generated recipes:
 * 1. Resolves every ingredient against the ~1,100+ ingredient catalog.
 * 2. Parses quantities to mass/volume via countToMass and volumetrics.
 * 3. Deterministically recomputes nutrition and derives diet/allergen tags.
 * 4. Checks step methods, times, and temperatures against method physics and food safety.
 * 5. Partitions findings into BLOCKING (fails recipe, triggers retry) and ADVISORY (delivered as annotations).
 * 6. Deterministically repairs fixable issues (units, nutrition, derived tags) without extra model calls.
 *
 * @file src/lib/cooking/recipeVerificationGate.ts
 */

import { evaluateStepTemperature, SAFE_INTERNAL_TEMPERATURES } from "@/data/cooking/foodSafety";
import { METHOD_PHYSICS } from "@/data/cooking/methodPhysics";
import { countToMass } from "@/lib/cooking/countToMass";
import { MEASURE_ML, volumeToMass } from "@/lib/cooking/volumetrics";
import { resolveCatalogIngredient, type CatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import type { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import type { z } from "zod";

export type CosmicRecipe = z.infer<typeof cosmicRecipeSchema>;

export interface GateFinding {
  code: string;
  message: string;
  path?: string;
  severity: "blocking" | "advisory";
}

export interface GateAudit {
  resolvedIngredientsCount: number;
  unresolvedIngredients: string[];
  recomputedNutrition: CosmicRecipe["nutrition"];
  derivedDietTags: string[];
  derivedAllergens: string[];
}

export interface RecipeVerificationOutcome {
  valid: boolean;
  repaired: boolean;
  blockingFindings: GateFinding[];
  advisoryFindings: GateFinding[];
  recipe: CosmicRecipe;
  audit: GateAudit;
}

// ─── Unit Normalization ───────────────────────────────────────────────────────

const UNIT_MAP: Record<string, string> = {
  gram: "g",
  grams: "g",
  g: "g",
  kilogram: "kg",
  kilograms: "kg",
  kg: "kg",
  ounce: "oz",
  ounces: "oz",
  oz: "oz",
  pound: "lb",
  pounds: "lb",
  lb: "lb",
  lbs: "lb",
  milliliter: "ml",
  milliliters: "ml",
  ml: "ml",
  liter: "l",
  liters: "l",
  l: "l",
  cup: "cup",
  cups: "cup",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbsp: "tbsp",
  tbs: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tsp: "tsp",
  pinch: "pinch",
  pinches: "pinch",
  clove: "clove",
  cloves: "clove",
  piece: "piece",
  pieces: "piece",
  stalk: "stalk",
  stalks: "stalk",
  sprig: "sprig",
  sprigs: "sprig",
};

export function normalizeUnit(rawUnit: string): string {
  const cleaned = rawUnit.trim().toLowerCase();
  return UNIT_MAP[cleaned] ?? cleaned;
}

export function parseFractionalQuantity(rawQty: string): number {
  const trimmed = rawQty.trim();
  if (!trimmed) return 0;
  if (trimmed.includes("/")) {
    const parts = trimmed.split(/\s+/);
    if (parts.length === 2) {
      const whole = parseFloat(parts[0] ?? "0") || 0;
      const [num, den] = (parts[1] ?? "").split("/").map(Number);
      return den ? whole + num! / den : whole;
    }
    const [num, den] = trimmed.split("/").map(Number);
    return den ? num! / den : 0;
  }
  return parseFloat(trimmed) || 0;
}

// ─── Allergen & Diet Taxonomy ─────────────────────────────────────────────────

const ALLERGEN_TRIGGERS: Record<string, string[]> = {
  dairy: ["milk", "butter", "cheese", "cream", "yogurt", "ghee", "parmesan", "cheddar", "mozzarella"],
  eggs: ["egg", "eggs", "yolk", "egg_white", "mayonnaise"],
  fish: ["salmon", "tuna", "cod", "anchovy", "halibut", "fish", "trout", "sea_bass"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "scallop", "clam", "mussel", "oyster"],
  gluten: ["wheat", "flour", "bread", "soy_sauce", "barley", "rye", "pasta", "couscous"],
  peanuts: ["peanut", "peanuts", "peanut_butter"],
  tree_nuts: ["almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", "pine_nut"],
  soy: ["soy", "tofu", "tempeh", "edamame", "miso", "soy_sauce"],
  sesame: ["sesame", "tahini", "sesame_oil"],
};

const MEAT_POULTRY_TRIGGERS = [
  "chicken", "turkey", "duck", "beef", "pork", "lamb", "veal", "bacon", "prosciutto", "sausage", "ham",
];

// ─── Verification & Repair Gate ───────────────────────────────────────────────

export function verifyAndRepairCosmicRecipe(
  inputRecipe: CosmicRecipe,
  options?: {
    requestedDiet?: string | undefined;
    disallowedIngredients?: string[] | undefined;
  },
): RecipeVerificationOutcome {
  const blockingFindings: GateFinding[] = [];
  const advisoryFindings: GateFinding[] = [];
  let repaired = false;

  // Clone recipe for local repair
  const recipe: CosmicRecipe = structuredClone(inputRecipe);

  const resolvedCatalogEntries: Array<{ ingredientName: string; entry: CatalogIngredient | null }> = [];
  const unresolvedIngredients: string[] = [];
  let totalEstimatedGrams = 0;
  const detectedAllergens = new Set<string>();
  let hasAnimalFlesh = false;
  let hasAnimalProducts = false;

  // 1. Resolve ingredients and check quantities
  recipe.ingredients.forEach((ing, index) => {
    // Normalization repair
    const stdUnit = normalizeUnit(ing.unit);
    if (stdUnit !== ing.unit) {
      ing.unit = stdUnit;
      repaired = true;
    }

    const qty = parseFractionalQuantity(ing.quantity);
    if (qty <= 0) {
      blockingFindings.push({
        code: "IMPOSSIBLE_QUANTITY",
        message: `Ingredient "${ing.name}" has invalid or non-positive quantity: "${ing.quantity}".`,
        path: `ingredients.${index}.quantity`,
        severity: "blocking",
      });
    }

    // Resolve in catalog
    const resolved = resolveCatalogIngredient(ing.name);
    if (resolved) {
      resolvedCatalogEntries.push({ ingredientName: ing.name, entry: resolved.entry });
    } else {
      // Try stripping common culinary descriptors (chopped, minced, diced, fresh)
      const simplified = ing.name
        .toLowerCase()
        .replace(/\b(fresh|dried|chopped|minced|diced|sliced|crushed|ground|toasted|cooked|large|medium|small)\b/g, "")
        .trim();
      const secondTry = resolveCatalogIngredient(simplified);
      if (secondTry) {
        resolvedCatalogEntries.push({ ingredientName: ing.name, entry: secondTry.entry });
      } else {
        // Also strip common cuts, parts, and forms (breast, thigh, cutlet, fillet, steak, etc.)
        const partSimplified = simplified
          .replace(/\b(breast|thigh|thighs|wing|wings|drumstick|drumsticks|fillet|filet|cutlet|steak|chops?|roast|tenderloin)\b/g, "")
          .trim();
        const thirdTry = partSimplified ? resolveCatalogIngredient(partSimplified) : null;
        if (thirdTry) {
          resolvedCatalogEntries.push({ ingredientName: ing.name, entry: thirdTry.entry });
        } else {
          resolvedCatalogEntries.push({ ingredientName: ing.name, entry: null });
          unresolvedIngredients.push(ing.name);
          if (!ing.optional && index === 0) {
            blockingFindings.push({
              code: "UNRESOLVED_PRIMARY_INGREDIENT",
              message: `Primary ingredient "${ing.name}" could not be verified in the kitchen catalog.`,
              path: `ingredients.${index}.name`,
              severity: "blocking",
            });
          } else {
            advisoryFindings.push({
              code: "UNRESOLVED_CATALOG_INGREDIENT",
              message: `Ingredient "${ing.name}" is not mapped in the local verified database.`,
              path: `ingredients.${index}.name`,
              severity: "advisory",
            });
          }
        }
      }
    }

    // Estimate mass for nutrition check
    let gramWeight: number;
    if (ing.unit === "g") gramWeight = qty;
    else if (ing.unit === "kg") gramWeight = qty * 1000;
    else if (ing.unit === "oz") gramWeight = qty * 28.35;
    else if (ing.unit === "lb") gramWeight = qty * 453.59;
    else if (ing.unit === "cup" || ing.unit === "tbsp" || ing.unit === "tsp") {
      const volConversion = volumeToMass(ing.name, qty, ing.unit);
      gramWeight = volConversion?.grams ?? (qty * (MEASURE_ML[ing.unit] ?? 15));
    } else {
      const countConv = countToMass(ing.name, qty, ing.unit);
      gramWeight = countConv?.grams ?? (qty * 50); // safe generic fallback estimate
    }

    if (gramWeight > 10000) {
      blockingFindings.push({
        code: "EXCESSIVE_QUANTITY",
        message: `Quantity for "${ing.name}" (~${Math.round(gramWeight)}g) exceeds household batch limit (10 kg).`,
        path: `ingredients.${index}.quantity`,
        severity: "blocking",
      });
    }

    totalEstimatedGrams += gramWeight;

    // Detect allergens & dietary constraints
    const lowerName = ing.name.toLowerCase();
    for (const [allergen, keywords] of Object.entries(ALLERGEN_TRIGGERS)) {
      if (keywords.some((kw) => lowerName.includes(kw))) {
        detectedAllergens.add(allergen);
      }
    }

    if (
      MEAT_POULTRY_TRIGGERS.some((kw) => lowerName.includes(kw)) ||
      ALLERGEN_TRIGGERS.fish?.some((kw) => lowerName.includes(kw)) ||
      ALLERGEN_TRIGGERS.shellfish?.some((kw) => lowerName.includes(kw))
    ) {
      hasAnimalFlesh = true;
      hasAnimalProducts = true;
    }

    if (
      ALLERGEN_TRIGGERS.dairy?.some((kw) => lowerName.includes(kw)) ||
      ALLERGEN_TRIGGERS.eggs?.some((kw) => lowerName.includes(kw)) ||
      lowerName.includes("honey")
    ) {
      hasAnimalProducts = true;
    }

    // Disallowed ingredient check (blocking)
    if (options?.disallowedIngredients && options.disallowedIngredients.length > 0) {
      for (const disallowed of options.disallowedIngredients) {
        if (lowerName.includes(disallowed.trim().toLowerCase())) {
          blockingFindings.push({
            code: "DISALLOWED_INGREDIENT_FOUND",
            message: `Recipe contains disallowed ingredient "${ing.name}" matching restriction "${disallowed}".`,
            path: `ingredients.${index}.name`,
            severity: "blocking",
          });
        }
      }
    }
  });

  // 2. Dietary integrity checks
  const currentDietTags = (recipe.tags.diet ?? []).map((d) => d.toLowerCase());
  const requestedDiet = options?.requestedDiet?.toLowerCase() ?? "";

  if (currentDietTags.includes("vegan") || requestedDiet === "vegan") {
    if (hasAnimalProducts || hasAnimalFlesh) {
      blockingFindings.push({
        code: "DIET_VIOLATION_VEGAN",
        message: "Recipe is labeled or requested as vegan but contains animal-derived ingredients.",
        path: "tags.diet",
        severity: "blocking",
      });
    }
  }

  if (currentDietTags.includes("vegetarian") || requestedDiet === "vegetarian") {
    if (hasAnimalFlesh) {
      blockingFindings.push({
        code: "DIET_VIOLATION_VEGETARIAN",
        message: "Recipe is labeled or requested as vegetarian but contains meat, poultry, or seafood.",
        path: "tags.diet",
        severity: "blocking",
      });
    }
  }

  if (currentDietTags.includes("gluten-free") || requestedDiet === "gluten-free") {
    if (detectedAllergens.has("gluten")) {
      blockingFindings.push({
        code: "ALLERGEN_VIOLATION_GLUTEN",
        message: "Recipe is labeled or requested as gluten-free but contains wheat or gluten sources.",
        path: "tags.diet",
        severity: "blocking",
      });
    }
  }

  // 3. Step methods, times, temperatures, and food safety evaluation
  recipe.steps.forEach((step, idx) => {
    // Check cooking method against METHOD_PHYSICS
    const rawMethod = step.cooking_method.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const physicsProfile = METHOD_PHYSICS[rawMethod];

    if (!physicsProfile && rawMethod !== "no_cook" && rawMethod !== "mix" && rawMethod !== "prep") {
      advisoryFindings.push({
        code: "UNKNOWN_COOKING_METHOD",
        message: `Cooking method "${step.cooking_method}" in step ${step.step_number} is not formally profiled in the physics registry.`,
        path: `steps.${idx}.cooking_method`,
        severity: "advisory",
      });
    }

    // Extract explicit temperatures from step instruction (e.g. "400°F", "165 degrees")
    const tempMatch = step.instruction.match(/(\d{2,3})\s*(?:°\s*[Ff]|degrees?\s*[Ff]|°|F\b)/);
    const parsedTempF = tempMatch ? parseInt(tempMatch[1] ?? "0", 10) : undefined;

    // Check against protein safety
    const instructionLower = step.instruction.toLowerCase();
    const proteinTarget = recipe.ingredients.find((i) => {
      const n = i.name.toLowerCase();
      const tokens = n.split(/[\s-]+/).filter((t) => t.length > 2);
      const mentioned =
        instructionLower.includes(n) || tokens.some((t) => instructionLower.includes(t));
      return (
        mentioned &&
        (n.includes("chicken") ||
          n.includes("turkey") ||
          n.includes("poultry") ||
          n.includes("beef") ||
          n.includes("pork") ||
          n.includes("fish") ||
          SAFE_INTERNAL_TEMPERATURES.some((st) => n.includes(st.category)))
      );
    })?.name;

    const safetyVerdict = evaluateStepTemperature(rawMethod, parsedTempF, proteinTarget);
    if (!safetyVerdict.safe) {
      blockingFindings.push({
        code: "UNSAFE_TEMPERATURE",
        message: `Step ${step.step_number}: ${safetyVerdict.reason}`,
        path: `steps.${idx}.instruction`,
        severity: "blocking",
      });
    }

    // Negative or implausible times
    if (step.time_minutes < 0 || step.time_minutes > 1440) {
      blockingFindings.push({
        code: "IMPLAUSIBLE_STEP_TIME",
        message: `Step ${step.step_number} has implausible time duration (${step.time_minutes} minutes).`,
        path: `steps.${idx}.time_minutes`,
        severity: "blocking",
      });
    }
  });

  // 4. Deterministic Local Repair of Nutrition & Tags
  const yields = Math.max(1, recipe.yields || 1);
  const recomputedNutrition = {
    calories: Math.round((totalEstimatedGrams * 1.5) / yields), // ~1.5 kcal/g average food density
    protein: Math.round((totalEstimatedGrams * 0.1) / yields),
    carbohydrates: Math.round((totalEstimatedGrams * 0.15) / yields),
    fat: Math.round((totalEstimatedGrams * 0.05) / yields),
  };

  // If model asserted zero or implausible nutrition, repair it
  if (
    recipe.nutrition.calories <= 0 ||
    Math.abs(recipe.nutrition.calories - recomputedNutrition.calories) > 1000
  ) {
    recipe.nutrition = recomputedNutrition;
    repaired = true;
  }

  // Derive diet tags
  const derivedDietTags: string[] = [];
  if (!hasAnimalProducts) derivedDietTags.push("vegan");
  if (!hasAnimalFlesh) derivedDietTags.push("vegetarian");
  if (!detectedAllergens.has("gluten")) derivedDietTags.push("gluten-free");
  if (!detectedAllergens.has("dairy")) derivedDietTags.push("dairy-free");

  // Sync missing verified diet tags
  for (const tag of derivedDietTags) {
    if (!recipe.tags.diet.includes(tag)) {
      recipe.tags.diet.push(tag);
      repaired = true;
    }
  }

  const valid = blockingFindings.length === 0;

  return {
    valid,
    repaired,
    blockingFindings,
    advisoryFindings,
    recipe,
    audit: {
      resolvedIngredientsCount: resolvedCatalogEntries.filter((r) => r.entry !== null).length,
      unresolvedIngredients,
      recomputedNutrition,
      derivedDietTags,
      derivedAllergens: Array.from(detectedAllergens),
    },
  };
}
