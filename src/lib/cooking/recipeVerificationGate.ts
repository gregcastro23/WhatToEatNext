/**
 * Deterministic Recipe Verification Gate
 *
 * Implements WTEN's culinary authority gate for AI-generated recipes:
 * 1. Resolves every ingredient against the ~1,100+ ingredient catalog.
 * 2. Parses quantities to mass/volume via countToMass and volumetrics.
 * 3. Evaluates dietary compliance via authoritative `classifyIngredientDiet`.
 * 4. Checks step methods, times, and temperatures against method physics and food safety.
 * 5. Partitions findings into BLOCKING (fails recipe, triggers retry) and ADVISORY (delivered as annotations).
 * 6. Findings are reported without corrupting delivered recipes with fabricated nutrition or false allergen tags.
 *
 * @file src/lib/cooking/recipeVerificationGate.ts
 */

import type { CosmicRecipe } from "@/data/featuredRecipe";
import { classifyIngredientDiet } from "@/utils/ingredientDietaryClassification";
import {
  isKnownGlutenSource,
  normalizeUnit,
  parseFractionalQuantity,
  resolveSingleIngredient,
  type ResolvedIngredientResult,
} from "./recipeGateHelpers";
import { validateSingleStep } from "./recipeGateSteps";

export * from "./recipeGateHelpers";
export * from "./recipeGateSteps";
export type { CosmicRecipe } from "@/data/featuredRecipe";

export interface GateFinding {
  code: string;
  message: string;
  path?: string;
  severity: "blocking" | "advisory";
}

export interface GateAudit {
  resolvedIngredientsCount: number;
  unresolvedIngredients: string[];
  totalEstimatedGrams: number;
  nonCompliantDietItems: string[];
  identifiedGlutenSources: string[];
}

export interface RecipeVerificationOutcome {
  valid: boolean;
  repaired: boolean;
  blockingFindings: GateFinding[];
  advisoryFindings: GateFinding[];
  recipe: CosmicRecipe;
  audit: GateAudit;
}

export interface VerifyCosmicRecipeOptions {
  requestedDiet?: string | undefined;
  disallowedIngredients?: string[] | undefined;
}

interface IngredientValidationState {
  repaired: boolean;
  totalEstimatedGrams: number;
  unresolvedIngredients: string[];
  resolvedCatalogEntries: ResolvedIngredientResult[];
}

function checkDisallowed(
  name: string,
  index: number,
  disallowedList: string[],
  blockingFindings: GateFinding[],
): void {
  const lowerName = name.toLowerCase();
  for (const disallowed of disallowedList) {
    if (lowerName.includes(disallowed.trim().toLowerCase())) {
      blockingFindings.push({
        code: "DISALLOWED_INGREDIENT_FOUND",
        message: `Recipe contains disallowed ingredient "${name}" matching restriction "${disallowed}".`,
        path: `ingredients.${index}.name`,
        severity: "blocking",
      });
    }
  }
}

function recordIngredientResolution(
  ing: CosmicRecipe["ingredients"][number],
  index: number,
  entry: ResolvedIngredientResult["entry"],
  state: IngredientValidationState,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
): void {
  if (entry) return;

  state.unresolvedIngredients.push(ing.name);
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

function validateSingleIngredient(
  ing: CosmicRecipe["ingredients"][number],
  index: number,
  options: VerifyCosmicRecipeOptions | undefined,
  blockingFindings: GateFinding[],
  advisoryFindings: GateFinding[],
  state: IngredientValidationState,
): void {
  const stdUnit = normalizeUnit(ing.unit);
  if (stdUnit !== ing.unit) {
    ing.unit = stdUnit;
    state.repaired = true;
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

  const { entry, gramWeight } = resolveSingleIngredient(ing);
  state.resolvedCatalogEntries.push({ ingredient: ing, entry, gramWeight });
  state.totalEstimatedGrams += gramWeight;

  recordIngredientResolution(ing, index, entry, state, blockingFindings, advisoryFindings);

  if (gramWeight > 10000) {
    blockingFindings.push({
      code: "EXCESSIVE_QUANTITY",
      message: `Quantity for "${ing.name}" (~${Math.round(gramWeight)}g) exceeds household batch limit (10 kg).`,
      path: `ingredients.${index}.quantity`,
      severity: "blocking",
    });
  }

  if (options?.disallowedIngredients && options.disallowedIngredients.length > 0) {
    checkDisallowed(ing.name, index, options.disallowedIngredients, blockingFindings);
  }
}

function validateDietaryCompliance(
  resolvedCatalogEntries: ResolvedIngredientResult[],
  currentDietTags: string[],
  requestedDiet: string,
  blockingFindings: GateFinding[],
): { nonCompliantDietItems: string[]; identifiedGlutenSources: string[] } {
  const nonCompliantDietItems: string[] = [];
  const identifiedGlutenSources: string[] = [];

  const checkVegan = currentDietTags.includes("vegan") || requestedDiet === "vegan";
  const checkVegetarian =
    checkVegan || currentDietTags.includes("vegetarian") || requestedDiet === "vegetarian";
  const checkGlutenFree =
    currentDietTags.includes("gluten-free") || requestedDiet === "gluten-free";

  for (const { ingredient } of resolvedCatalogEntries) {
    const classification = classifyIngredientDiet({ name: ingredient.name });

    if (checkVegan && classification.isVegan === "non-compliant") {
      nonCompliantDietItems.push(`${ingredient.name} (${classification.basis})`);
      blockingFindings.push({
        code: "DIET_VIOLATION_VEGAN",
        message: `Recipe labeled or requested as vegan contains non-vegan ingredient "${ingredient.name}".`,
        path: "tags.diet",
        severity: "blocking",
      });
    } else if (checkVegetarian && classification.isVegetarian === "non-compliant") {
      nonCompliantDietItems.push(`${ingredient.name} (${classification.basis})`);
      blockingFindings.push({
        code: "DIET_VIOLATION_VEGETARIAN",
        message: `Recipe labeled or requested as vegetarian contains meat/flesh ingredient "${ingredient.name}".`,
        path: "tags.diet",
        severity: "blocking",
      });
    }

    if (checkGlutenFree && isKnownGlutenSource(ingredient.name)) {
      identifiedGlutenSources.push(ingredient.name);
      blockingFindings.push({
        code: "ALLERGEN_VIOLATION_GLUTEN",
        message: `Recipe labeled or requested as gluten-free contains gluten source "${ingredient.name}".`,
        path: "tags.diet",
        severity: "blocking",
      });
    }
  }

  return { nonCompliantDietItems, identifiedGlutenSources };
}

function validateNutritionalContent(
  calories: number,
  advisoryFindings: GateFinding[],
): void {
  if (calories <= 0) {
    advisoryFindings.push({
      code: "MISSING_NUTRITION",
      message: "Recipe lacks valid positive calorie information.",
      path: "nutrition.calories",
      severity: "advisory",
    });
  }
}

export function verifyAndRepairCosmicRecipe(
  inputRecipe: CosmicRecipe,
  options?: VerifyCosmicRecipeOptions,
): RecipeVerificationOutcome {
  const blockingFindings: GateFinding[] = [];
  const advisoryFindings: GateFinding[] = [];
  const recipe: CosmicRecipe = structuredClone(inputRecipe);

  const state: IngredientValidationState = {
    repaired: false,
    totalEstimatedGrams: 0,
    unresolvedIngredients: [],
    resolvedCatalogEntries: [],
  };

  recipe.ingredients.forEach((ing, index) => {
    validateSingleIngredient(ing, index, options, blockingFindings, advisoryFindings, state);
  });

  const currentDietTags = recipe.tags.diet.map((d) => d.toLowerCase());
  const requestedDiet = options?.requestedDiet?.toLowerCase() ?? "";
  const { nonCompliantDietItems, identifiedGlutenSources } = validateDietaryCompliance(
    state.resolvedCatalogEntries,
    currentDietTags,
    requestedDiet,
    blockingFindings,
  );

  recipe.steps.forEach((step, idx) => {
    validateSingleStep(step, idx, recipe.ingredients, blockingFindings, advisoryFindings);
  });

  validateNutritionalContent(recipe.nutrition.calories, advisoryFindings);

  return {
    valid: blockingFindings.length === 0,
    repaired: state.repaired,
    blockingFindings,
    advisoryFindings,
    recipe,
    audit: {
      resolvedIngredientsCount: state.resolvedCatalogEntries.filter((r) => r.entry !== null).length,
      unresolvedIngredients: state.unresolvedIngredients,
      totalEstimatedGrams: Math.round(state.totalEstimatedGrams),
      nonCompliantDietItems,
      identifiedGlutenSources,
    },
  };
}
