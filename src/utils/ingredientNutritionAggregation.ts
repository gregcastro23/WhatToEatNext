// src/utils/ingredientNutritionAggregation.ts
//
// Fallback path for recipes that arrive without a populated
// `nutritionPerServing`. Looks each recipe ingredient up by name in the
// UnifiedIngredientService, scales the ingredient's nutritional profile to
// the recipe's actual amount, sums the results, and divides by the recipe's
// serving count to produce a per-serving nutrition payload.
//
// The aggregator is intentionally forgiving: missing or unrecognised
// ingredients are skipped. When fewer than half of the ingredients resolve,
// the aggregator declines to produce a result (returns `null`) rather than
// report a misleadingly low total.

import { UnifiedIngredientService } from "@/services/UnifiedIngredientService";
import type { Recipe, RecipeIngredient } from "@/types/recipe";

import type { NormalizedRecipeNutrition } from "./recipeNutrition";
import { UNIT_CONVERSIONS, convertToGrams } from "./unitConversion";

const DEFAULT_SERVING_GRAMS = 100;
const DEFAULT_RECIPE_SERVINGS = 4;

/**
 * Extract the grams-per-serving value from a human-readable serving size
 * string like "1 cup (148g)" or "1 tbsp (14g)".
 *
 * When the explicit grams annotation is missing, falls back to parsing the
 * leading amount + unit ("1 cup") and multiplying by UNIT_CONVERSIONS.
 */
export function parseServingSizeGrams(
  servingSize: string | undefined | null,
): number | null {
  if (!servingSize) return null;

  // Prefer the explicit grams annotation — `(148g)` / `(148 g)` / `(1.5g)`.
  const explicit = servingSize.match(/\((\d+(?:\.\d+)?)\s*g\)/i);
  if (explicit) {
    const grams = Number(explicit[1]);
    if (Number.isFinite(grams) && grams > 0) return grams;
  }

  // Fall back to a leading amount + unit ("1 cup", "2 tbsp", "100 g").
  const leading = servingSize.match(/^\s*(\d+(?:\.\d+)?)\s*([a-z ]+?)\b/i);
  if (leading) {
    const amount = Number(leading[1]);
    const unit = leading[2]?.toLowerCase().trim();
    const grams = convertToGrams(amount, unit ?? "");
    if (grams != null && grams > 0) return grams;
  }

  return null;
}

type IngredientLike = {
  nutritionalProfile?: unknown;
};

type NutritionalMacros = {
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  saturatedFat?: number;
};

type NutritionalProfileShape = {
  calories?: number;
  macros?: NutritionalMacros;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  vitamins?: Record<string, number> | string[];
  minerals?: Record<string, number> | string[];
  serving_size?: string;
};

function readNum(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function emptyNutrition(): NormalizedRecipeNutrition {
  return {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };
}

/**
 * Add numeric nutrition fields from `b` onto `a` in place. Preserves
 * untouched fields.
 */
function addNutrition(
  a: NormalizedRecipeNutrition,
  b: NormalizedRecipeNutrition,
): void {
  a.calories += b.calories;
  a.protein += b.protein;
  a.carbs += b.carbs;
  a.fat += b.fat;
  a.fiber += b.fiber;
  a.sugar += b.sugar;
  a.sodium += b.sodium;
  if (b.saturatedFat != null) {
    a.saturatedFat = (a.saturatedFat ?? 0) + b.saturatedFat;
  }
  const microKeys: (keyof NormalizedRecipeNutrition)[] = [
    "vitaminA",
    "vitaminC",
    "vitaminD",
    "vitaminE",
    "vitaminK",
    "thiamin",
    "riboflavin",
    "niacin",
    "vitaminB6",
    "vitaminB12",
    "folate",
    "calcium",
    "iron",
    "magnesium",
    "phosphorus",
    "potassium",
    "zinc",
    "copper",
    "manganese",
    "selenium",
  ];
  for (const k of microKeys) {
    const bv = (b as unknown as Record<string, unknown>)[k];
    if (typeof bv === "number" && Number.isFinite(bv)) {
      const prev = (a as unknown as Record<string, unknown>)[k];
      (a as unknown as Record<string, unknown>)[k] =
        (typeof prev === "number" ? prev : 0) + bv;
    }
  }
}

function scaleNutrition(
  n: NormalizedRecipeNutrition,
  factor: number,
): NormalizedRecipeNutrition {
  if (!Number.isFinite(factor) || factor <= 0) return emptyNutrition();
  const out: NormalizedRecipeNutrition = {
    calories: n.calories * factor,
    protein: n.protein * factor,
    carbs: n.carbs * factor,
    fat: n.fat * factor,
    fiber: n.fiber * factor,
    sugar: n.sugar * factor,
    sodium: n.sodium * factor,
  };
  if (n.saturatedFat != null) out.saturatedFat = n.saturatedFat * factor;

  const microKeys: (keyof NormalizedRecipeNutrition)[] = [
    "vitaminA",
    "vitaminC",
    "vitaminD",
    "vitaminE",
    "vitaminK",
    "thiamin",
    "riboflavin",
    "niacin",
    "vitaminB6",
    "vitaminB12",
    "folate",
    "calcium",
    "iron",
    "magnesium",
    "phosphorus",
    "potassium",
    "zinc",
    "copper",
    "manganese",
    "selenium",
  ];
  for (const k of microKeys) {
    const v = (n as unknown as Record<string, unknown>)[k];
    if (typeof v === "number" && Number.isFinite(v)) {
      (out as unknown as Record<string, unknown>)[k] = v * factor;
    }
  }
  return out;
}

/**
 * Convert an ingredient's nutritionalProfile (which may use USDA-style
 * nested `macros` or a flat shape) into our canonical NormalizedRecipeNutrition.
 * The values represent one serving, i.e. the `serving_size` field on the
 * profile.
 */
function profileToNutrition(
  profile: NutritionalProfileShape,
): NormalizedRecipeNutrition {
  const out = emptyNutrition();
  out.calories = readNum(profile.calories);

  if (profile.macros) {
    out.protein = readNum(profile.macros.protein);
    out.carbs = readNum(profile.macros.carbs);
    out.fat = readNum(profile.macros.fat);
    out.fiber = readNum(profile.macros.fiber);
    out.sugar = readNum(profile.macros.sugar);
    out.sodium = readNum(profile.macros.sodium);
    if (profile.macros.saturatedFat != null) {
      out.saturatedFat = readNum(profile.macros.saturatedFat);
    }
  } else {
    // Flat shape
    out.protein = readNum(profile.protein);
    out.carbs = readNum(profile.carbs);
    out.fat = readNum(profile.fat);
    out.fiber = readNum(profile.fiber);
    out.sugar = readNum(profile.sugar);
    out.sodium = readNum(profile.sodium);
  }

  // Copy numeric vitamin/mineral records when present.
  if (profile.vitamins && !Array.isArray(profile.vitamins)) {
    const vits = profile.vitamins as Record<string, number>;
    const pick = (
      target: keyof NormalizedRecipeNutrition,
      ...keys: string[]
    ) => {
      for (const k of keys) {
        if (typeof vits[k] === "number") {
          (out as unknown as Record<string, unknown>)[target] = vits[k];
          return;
        }
      }
    };
    pick("vitaminA", "A", "a", "vitaminA");
    pick("vitaminC", "C", "c", "vitaminC");
    pick("vitaminD", "D", "d", "vitaminD");
    pick("vitaminE", "E", "e", "vitaminE");
    pick("vitaminK", "K", "k", "vitaminK");
    pick("vitaminB6", "B6", "b6", "vitaminB6");
    pick("vitaminB12", "B12", "b12", "vitaminB12");
    pick("folate", "folate", "Folate");
    pick("thiamin", "B1", "b1", "thiamin");
    pick("riboflavin", "B2", "b2", "riboflavin");
    pick("niacin", "B3", "b3", "niacin");
  }
  if (profile.minerals && !Array.isArray(profile.minerals)) {
    const min = profile.minerals as Record<string, number>;
    for (const key of [
      "calcium",
      "iron",
      "magnesium",
      "phosphorus",
      "potassium",
      "zinc",
      "copper",
      "manganese",
      "selenium",
    ] as const) {
      if (typeof min[key] === "number") {
        (out as unknown as Record<string, unknown>)[key] = min[key];
      }
    }
  }
  return out;
}

/**
 * Compute the nutrition contribution of a single recipe ingredient, scaled
 * to the amount + unit actually used in the recipe. Returns `null` when the
 * ingredient isn't recognised or has no usable nutritional profile.
 */
export function computeIngredientNutrition(
  ingredient: IngredientLike | undefined | null,
  amount: number,
  unit: string,
): NormalizedRecipeNutrition | null {
  if (!ingredient) return null;
  const profile = ingredient.nutritionalProfile as
    | NutritionalProfileShape
    | undefined;
  if (!profile) return null;

  const perServing = profileToNutrition(profile);
  if (
    perServing.calories === 0 &&
    perServing.protein === 0 &&
    perServing.carbs === 0 &&
    perServing.fat === 0
  ) {
    return null;
  }

  const servingGrams =
    parseServingSizeGrams(profile.serving_size) ?? DEFAULT_SERVING_GRAMS;

  const recipeGrams =
    convertToGrams(amount, unit) ?? amount * (UNIT_CONVERSIONS["each"] ?? 50);
  if (!Number.isFinite(recipeGrams) || recipeGrams <= 0) return null;

  const factor = recipeGrams / servingGrams;
  return scaleNutrition(perServing, factor);
}

/**
 * Compute recipe-level nutrition from the ingredients list. Returns `null`
 * when fewer than half of the ingredients resolved against the unified
 * ingredient DB — at that point the total would be misleadingly incomplete.
 *
 * The resulting nutrition is expressed per serving (divided by
 * `recipe.numberOfServings`, defaulting to 4 when the recipe doesn't state
 * one).
 */
export function computeRecipeNutritionFromIngredients(
  recipe: Pick<Recipe, "ingredients" | "numberOfServings"> & {
    servings?: number;
  },
): NormalizedRecipeNutrition | null {
  const ingredients = recipe.ingredients;
  if (!Array.isArray(ingredients) || ingredients.length === 0) return null;

  const service = UnifiedIngredientService.getInstance();
  const total = emptyNutrition();
  let resolved = 0;

  for (const ing of ingredients as RecipeIngredient[]) {
    if (!ing?.name) continue;
    const found = service.getIngredientByName(ing.name);
    if (!found) continue;

    const amount = Number(ing.amount) || 1;
    const unit = (ing.unit ?? "").toString();
    const contribution = computeIngredientNutrition(found, amount, unit);
    if (!contribution) continue;

    addNutrition(total, contribution);
    resolved++;
  }

  if (resolved === 0) return null;
  // Require at least half of the ingredients to resolve — otherwise the
  // total under-counts the recipe and would be more misleading than useful.
  if (resolved * 2 < ingredients.length) return null;

  const servings =
    (recipe as { numberOfServings?: number }).numberOfServings ??
    (recipe as { servings?: number }).servings ??
    DEFAULT_RECIPE_SERVINGS;

  return scaleNutrition(total, 1 / Math.max(1, servings));
}
