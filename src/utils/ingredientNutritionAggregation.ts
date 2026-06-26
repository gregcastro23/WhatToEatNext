// src/utils/ingredientNutritionAggregation.ts
//
// Fallback path for recipes that arrive without a populated
// `nutritionPerServing`. Resolves each recipe ingredient against the unified
// ingredient catalog (see `resolveIngredientByName` below), scales the
// ingredient's nutritional profile to the recipe's actual amount, sums the
// results, and divides by the recipe's serving count to produce a per-serving
// nutrition payload.
//
// The aggregator is intentionally forgiving: missing or unrecognised
// ingredients are skipped. When fewer than half of the ingredients resolve,
// the aggregator declines to produce a result (returns `null`) rather than
// report a misleadingly low total.

import { unifiedIngredients } from "@/data/unified/ingredients";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import type { Recipe } from "@/types/recipe";
import { UNIT_CONVERSIONS, convertToGrams } from "./unitConversion";
import type { NormalizedRecipeNutrition } from "./recipeNutrition";

// ---------------------------------------------------------------------------
// Ingredient-name resolution
//
// Recipe ingredient names are free-text and messy ("extra virgin olive oil",
// "eggs", "minced garlic", "pinch sea salt", "1-2 tablespoons vanilla"). The
// catalog keys are clean ("Olive Oil", "Chicken Egg", "garlic", "sea salt").
// An exact-match lookup resolves under half of all recipe ingredient
// occurrences, which starves the nutrition aggregator (and forces recipes
// below the >=50% resolution bar into "no nutrition"). This resolver closes
// that gap with conservative normalization: strip leading quantities/units,
// take the first option of "X or Y", drop preparation adjectives, singularize,
// then match by exact-normalized form and finally by token-subset (every word
// of the query noun-phrase present in the catalog entry). Token-subset matching
// is whole-word, so "egg" resolves "Chicken Egg" but "rice" never resolves
// "ice".
// ---------------------------------------------------------------------------

/** Preparation/qualifier words that carry no identity and should be dropped. */
const PREP_WORDS = new Set([
  "pinch", "dash", "large", "small", "medium", "fresh", "freshly", "dried",
  "ground", "minced", "chopped", "diced", "sliced", "grated", "melted",
  "toasted", "warm", "boiling", "cold", "hot", "ripe", "raw", "cooked",
  "whole", "blanched", "peeled", "crushed", "extra", "virgin", "of", "a",
  "finely", "roughly", "thinly", "thick", "thin", "light", "dark", "plain",
  "pure", "organic", "free", "range", "boneless", "skinless", "unsalted",
  "granulated", "packed", "softened", "beaten", "cubed", "shredded", "halved",
  "quartered", "seeded", "stemmed", "trimmed", "rinsed", "drained", "to",
  "taste", "and",
]);

/** Common irregular plurals worth handling explicitly. */
const IRREGULAR_PLURALS: Record<string, string> = {
  leaves: "leaf",
  loaves: "loaf",
  halves: "half",
  knives: "knife",
  potatoes: "potato",
  tomatoes: "tomato",
};

function normName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip a leading quantity + optional unit fragment ("1-2 tablespoons ..."). */
function stripLeadingQuantity(s: string): string {
  return s.replace(
    /^[-\d/.\s]+(tablespoons?|teaspoons?|tbsp|tsp|cups?|grams?|g|kg|oz|ounces?|lb|lbs?|pounds?|ml|l|cloves?|pieces?|slices?|pinch(?:es)?)?\b/i,
    " ",
  );
}

function singularizeWord(w: string): string {
  if (IRREGULAR_PLURALS[w]) return IRREGULAR_PLURALS[w];
  if (w.length <= 3) return w;
  if (w.endsWith("ies")) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ves")) return `${w.slice(0, -3)}f`;
  if (w.endsWith("oes")) return w.slice(0, -2);
  if (/(ches|shes|xes|sses)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

/** Produce the cleaned core noun-phrase tokens for a free-text ingredient name. */
function coreTokens(name: string): string[] {
  let base = normName(stripLeadingQuantity(name));
  // "X or Y" / "X and Y" → take the first option.
  base = base.split(/\b(?:or)\b/)[0].trim();
  return base
    .split(" ")
    .filter((w) => w && !PREP_WORDS.has(w))
    .map(singularizeWord);
}

interface TokenEntry {
  tokens: Set<string>;
  count: number;
  ingredient: UnifiedIngredient;
}

let exactIndex: Map<string, UnifiedIngredient> | null = null;
let tokenIndex: TokenEntry[] | null = null;

function buildIndex(): void {
  exactIndex = new Map();
  tokenIndex = [];
  for (const ingredient of Object.values(unifiedIngredients)) {
    const name = ingredient?.name;
    if (typeof name !== "string" || !name) continue;
    const norm = normName(name);
    if (!exactIndex.has(norm)) exactIndex.set(norm, ingredient);
    const singular = norm.split(" ").map(singularizeWord).join(" ");
    if (!exactIndex.has(singular)) exactIndex.set(singular, ingredient);
    const tokens = new Set(coreTokens(name));
    if (tokens.size > 0) {
      tokenIndex.push({ tokens, count: tokens.size, ingredient });
    }
  }
  // Stable order so token-subset ties resolve deterministically (fewest tokens,
  // then alphabetical) regardless of catalog iteration order.
  tokenIndex.sort((a, b) =>
    a.count !== b.count
      ? a.count - b.count
      : a.ingredient.name.localeCompare(b.ingredient.name),
  );
}

/**
 * Resolve a free-text recipe ingredient name to a catalog ingredient.
 * Exact-normalized matches always win (preserving prior behavior); the
 * normalization fallbacks only ever turn a previous miss into a hit.
 */
export function resolveIngredientByName(
  name: string | undefined | null,
): UnifiedIngredient | undefined {
  if (!name || typeof name !== "string") return undefined;
  if (!exactIndex || !tokenIndex) buildIndex();
  const idx = exactIndex!;

  const norm = normName(name);
  const exact = idx.get(norm);
  if (exact) return exact;

  const tokens = coreTokens(name);
  if (tokens.length === 0) return undefined;

  const cleaned = tokens.join(" ");
  const cleanedHit = idx.get(cleaned);
  if (cleanedHit) return cleanedHit;

  // Token-subset: every query token must appear (whole-word) in the candidate.
  const query = new Set(tokens);
  for (const entry of tokenIndex!) {
    let all = true;
    for (const t of query) {
      if (!entry.tokens.has(t)) {
        all = false;
        break;
      }
    }
    if (all) return entry.ingredient;
  }
  return undefined;
}

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

interface IngredientLike {
  nutritionalProfile?: unknown;
}

interface NutritionalMacros {
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  saturatedFat?: number;
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
  const microKeys: Array<keyof NormalizedRecipeNutrition> = [
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

  const microKeys: Array<keyof NormalizedRecipeNutrition> = [
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
    const vits = profile.vitamins;
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
    const min = profile.minerals;
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

  const total = emptyNutrition();
  let resolved = 0;

  for (const ing of ingredients) {
    if (!ing?.name) continue;
    const found = resolveIngredientByName(ing.name);
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
