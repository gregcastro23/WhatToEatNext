// src/utils/ingredientNutritionAggregation.ts
//
// Fallback path for recipes that arrive without a populated
// `nutritionPerServing`. Resolves each recipe ingredient against the unified
// ingredient catalog (see `resolveIngredientByName` below), scales the
// ingredient's nutritional profile to the recipe's actual amount, sums the
// results, and divides by the recipe's serving count to produce a per-serving
// nutrition payload.
//
// A total is returned only when it accounts for the recipe: every resolved
// ingredient can be weighed, and unresolved ingredients are a small, known
// share of its mass (see `./nutritionCompleteness`). Otherwise it returns
// `null` rather than a misleadingly partial total.

import type { Recipe } from "@/types/recipe";
import {
  addDailyValueFractions,
  readDailyValueFractions,
  scaleDailyValueFractions,
} from "./dailyValueFractions";
import { resolveIngredientByName } from "./ingredientResolution";
import {
  foldCompleteOnly,
  MACROLESS_KEYS,
  macrolessContribution,
  readCompleteOnly,
  scaleCompleteOnly,
  type CompleteOnlyKey,
  type CompleteOnlySource,
} from "./nutrientCompleteness";
import { accountsForRecipe, type WeighedLine } from "./nutritionCompleteness";
import { UNIT_CONVERSIONS, convertToGrams } from "./unitConversion";
import type { NormalizedRecipeNutrition } from "./recipeNutrition";

// `resolveIngredientByName` (added here in #555) was lifted into the shared
// `./ingredientResolution` module so other consumers — notably
// `UnifiedIngredientService.getIngredientByName` — can use the same matching.
// Re-exported for backward compatibility with existing importers and tests.
export { resolveIngredientByName };

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

  // Prefer the explicit grams annotation — `(148g)` / `(148 g)` / `(1.5g)` /
  // `(~17g)`. Missing the `~` form scored a 17 g egg yolk's calories as 100 g.
  const explicit = servingSize.match(/\(~?\s*(\d+(?:\.\d+)?)\s*g\)/i);
  if (explicit) {
    const grams = Number(explicit[1]);
    if (Number.isFinite(grams) && grams > 0) return grams;
  }

  // Fall back to a leading amount + unit ("1 cup", "2 tbsp", "100 g").
  const leading = servingSize.match(/^\s*(\d+(?:\.\d+)?)\s*([a-z ]+?)\b/i);
  if (leading) {
    const amount = Number(leading[1]);
    const unit = (leading[2] ?? "").toLowerCase().trim();
    const grams = convertToGrams(amount, unit);
    if (grams != null && grams > 0) return grams;
  }

  return null;
}

interface IngredientLike {
  nutritionalProfile?: unknown;
  /**
   * Used to resolve a volume unit against USDA's MEASURED household weights.
   * Optional because not every caller has it — without it, a volume unit falls
   * back to the water approximation, which is frequently wrong by several fold.
   */
  name?: string;
}

interface NutritionalMacros {
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  saturatedFat?: number;
  potassium?: number;
  cholesterol?: number;
}

interface NutritionalProfileShape {
  calories?: number;
  macros?: NutritionalMacros;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  saturatedFat?: number;
  potassium?: number;
  cholesterol?: number;
  vitamins?: Record<string, number> | string[];
  minerals?: Record<string, number> | string[];
  serving_size?: string;
}

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
  };
}

/**
 * Add numeric nutrition fields from `b` onto `a` in place. Preserves
 * untouched fields. `gapKeys` are the complete-only fields `b` must state.
 */
function addNutrition(
  a: NormalizedRecipeNutrition,
  b: NormalizedRecipeNutrition,
  gapKeys?: readonly CompleteOnlyKey[],
): void {
  a.calories += b.calories;
  a.protein += b.protein;
  a.carbs += b.carbs;
  a.fat += b.fat;
  a.fiber += b.fiber;
  foldCompleteOnly(a, b, gapKeys);
  if (b.dailyValue) {
    a.dailyValue = a.dailyValue
      ? addDailyValueFractions(a.dailyValue, b.dailyValue)
      : b.dailyValue;
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
  };
  scaleCompleteOnly(n, factor, out);
  if (n.dailyValue) out.dailyValue = scaleDailyValueFractions(n.dailyValue, factor);
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
  } else {
    // Flat shape
    out.protein = readNum(profile.protein);
    out.carbs = readNum(profile.carbs);
    out.fat = readNum(profile.fat);
    out.fiber = readNum(profile.fiber);
  }

  const source: CompleteOnlySource = profile.macros ?? profile;
  Object.assign(out, readCompleteOnly(source));
  // Vitamins and minerals are Daily Value fractions, never amounts.
  out.dailyValue = readDailyValueFractions(profile);
  return out;
}

/**
 * Compute the nutrition contribution of a single recipe ingredient, scaled
 * to the amount + unit actually used in the recipe. Returns `null` when the
 * ingredient isn't recognised or has no usable nutritional profile, or (unless
 * `keepMacroless`) states no calories or macros.
 */
export function computeIngredientNutrition(
  ingredient: IngredientLike | undefined | null,
  amount: number,
  unit: string,
  keepMacroless = false,
): NormalizedRecipeNutrition | null {
  if (!ingredient) return null;
  const profile = ingredient.nutritionalProfile as
    | NutritionalProfileShape
    | undefined;
  if (!profile) return null;

  const perServing = profileToNutrition(profile);
  if (
    !keepMacroless &&
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
    convertToGrams(amount, unit, ingredient.name) ??
    amount * (UNIT_CONVERSIONS["each"] ?? 50);
  if (!Number.isFinite(recipeGrams) || recipeGrams <= 0) return null;

  const factor = recipeGrams / servingGrams;
  return scaleNutrition(perServing, factor);
}

interface WeighedContribution {
  line: WeighedLine;
  nutrition: NormalizedRecipeNutrition | null;
  /** The complete-only fields `nutrition` must state; all of them when omitted. */
  gapKeys?: readonly CompleteOnlyKey[];
}

/**
 * What a line with no calories or macros (salt, water) adds: its sugar, sodium
 * and saturated fat. Salt is most of a recipe's sodium, so it is not skipped.
 */
function macrolessNutrition(
  found: IngredientLike,
  grams: number | null,
): NormalizedRecipeNutrition | null {
  const scaled = computeIngredientNutrition(found, grams ?? 1, "g", true);
  return scaled ? macrolessContribution(scaled, grams !== null) : null;
}

/** One ingredient line: how it was weighed, and what it adds to the total. */
function weighLine(ing: Recipe["ingredients"][number]): WeighedContribution {
  const amount = Number(ing.amount) || 1;
  const unit = String(ing.unit);
  const found = resolveIngredientByName(ing.name);
  if (!found?.nutritionalProfile) {
    return { line: { kind: "unresolved", grams: convertToGrams(amount, unit, ing.name) }, nutrition: null };
  }
  const grams = convertToGrams(amount, unit, found.name);
  // A profile with no calories or macros (water, salt) adds no energy at any mass, but sodium.
  if (!computeIngredientNutrition(found, 1, "g")) {
    return { line: { kind: "zero", grams }, nutrition: macrolessNutrition(found, grams), gapKeys: MACROLESS_KEYS };
  }
  if (grams === null) return { line: { kind: "unweighable" }, nutrition: null };
  return { line: { kind: "counted", grams }, nutrition: computeIngredientNutrition(found, grams, "g") };
}

/**
 * Compute recipe-level nutrition from the ingredients list, per serving
 * (divided by `numberOfServings`, defaulting to 4 when the recipe states
 * none). Returns `null` unless the total accounts for the recipe; see
 * `accountsForRecipe`.
 */
export function computeRecipeNutritionFromIngredients(
  recipe: Pick<Recipe, "ingredients" | "numberOfServings"> & {
    servings?: number;
  },
): NormalizedRecipeNutrition | null {
  const { ingredients } = recipe;
  if (!Array.isArray(ingredients) || ingredients.length === 0) return null;

  const total = emptyNutrition();
  const lines: WeighedLine[] = [];
  for (const ing of ingredients) {
    if (!ing.name) continue;
    const { line, nutrition, gapKeys } = weighLine(ing);
    lines.push(line);
    if (nutrition) addNutrition(total, nutrition, gapKeys);
  }
  if (!accountsForRecipe(lines)) return null;

  const servings = recipe.numberOfServings ?? recipe.servings ?? DEFAULT_RECIPE_SERVINGS;
  return scaleNutrition(total, 1 / Math.max(1, servings));
}
