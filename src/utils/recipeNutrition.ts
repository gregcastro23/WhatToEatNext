// src/utils/recipeNutrition.ts
//
// Normalizes the different nutrition shapes we see in cuisine dish data down
// to the flat shape that NutritionTrackingService.extractMealNutrition reads
// (calories / protein / carbs / fat / fiber / sodium / sugar / ...).
//
// Cuisine files follow the AlchemicalRecipe schema and store nutrition under
// `nutritionPerServing` with gram-suffixed keys (proteinG, carbsG, ...).
// Legacy dishes may use `nutritionalProfile` or `nutrition`. This helper
// accepts all three and produces a single canonical object.

/**
 * Flat nutrition shape consumed by NutritionTrackingService.extractMealNutrition.
 * Only the fields we actually read from recipes are declared here; anything
 * else on the object is tolerated.
 */
export interface NormalizedRecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat?: number;

  // Micronutrients — included when available on the source.
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  thiamin?: number;
  riboflavin?: number;
  niacin?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  folate?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  phosphorus?: number;
  potassium?: number;
  zinc?: number;
  copper?: number;
  manganese?: number;
  selenium?: number;

  // Raw tags for downstream display (some callers show the literal
  // vitamin/mineral lists unchanged).
  vitamins?: string[];
  minerals?: string[];
}

/**
 * Map common vitamin/mineral display names to the NutritionalSummary field
 * name. When a dish only lists vitamins by string (no numeric amount), we
 * can't attach a real quantity, but we can still surface the presence flag
 * so downstream UI knows the micronutrient is in the recipe.
 */
const VITAMIN_KEY_MAP: Record<string, keyof NormalizedRecipeNutrition> = {
  a: "vitaminA",
  "vitamin a": "vitaminA",
  c: "vitaminC",
  "vitamin c": "vitaminC",
  d: "vitaminD",
  "vitamin d": "vitaminD",
  e: "vitaminE",
  "vitamin e": "vitaminE",
  k: "vitaminK",
  "vitamin k": "vitaminK",
  b1: "thiamin",
  thiamin: "thiamin",
  b2: "riboflavin",
  riboflavin: "riboflavin",
  b3: "niacin",
  niacin: "niacin",
  b6: "vitaminB6",
  "vitamin b6": "vitaminB6",
  b12: "vitaminB12",
  "vitamin b12": "vitaminB12",
  folate: "folate",
};

const MINERAL_KEY_MAP: Record<string, keyof NormalizedRecipeNutrition> = {
  calcium: "calcium",
  iron: "iron",
  magnesium: "magnesium",
  phosphorus: "phosphorus",
  potassium: "potassium",
  sodium: "sodium",
  zinc: "zinc",
  copper: "copper",
  manganese: "manganese",
  selenium: "selenium",
};

function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const strs = value.filter((v): v is string => typeof v === "string");
    return strs.length ? strs : undefined;
  }
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>);
  }
  return undefined;
}

/**
 * Pull numeric vitamin/mineral values from a record that may be keyed by
 * symbol ("A", "K"), name ("Vitamin C"), or short form ("b12").
 */
function applyMicroMap(
  source: Record<string, unknown> | null | undefined,
  keyMap: Record<string, keyof NormalizedRecipeNutrition>,
  target: NormalizedRecipeNutrition,
): void {
  if (!source) return;
  for (const [rawKey, rawValue] of Object.entries(source)) {
    const lc = rawKey.toLowerCase().trim();
    const mapped = keyMap[lc];
    if (!mapped) continue;
    const n = typeof rawValue === "number" ? rawValue : Number(rawValue);
    if (Number.isFinite(n) && n > 0) {
      (target as unknown as Record<string, unknown>)[mapped] = n;
    }
  }
}

/**
 * Normalize a dish's nutrition payload to the canonical shape.
 *
 * Accepts any of:
 *  - `dish.nutritionPerServing` with gram-suffixed keys (canonical AlchemicalRecipe)
 *  - `dish.nutritionalProfile` with nested `macros` (USDA-style ingredient profile)
 *  - `dish.nutrition` already in flat shape (legacy)
 *
 * Returns `null` if no source produces any non-zero macros, so callers can
 * trigger an ingredient-based fallback.
 */
export function normalizeRecipeNutrition(
  dish: Record<string, unknown> | null | undefined,
): NormalizedRecipeNutrition | null {
  if (!dish) return null;

  const out: NormalizedRecipeNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
  };

  // --- Source 1: canonical AlchemicalRecipe.nutritionPerServing -----------
  const perServing = asRecord(dish.nutritionPerServing);
  if (perServing) {
    out.calories = num(perServing.calories);
    out.protein = num(perServing.proteinG ?? perServing.protein);
    out.carbs = num(perServing.carbsG ?? perServing.carbs);
    out.fat = num(perServing.fatG ?? perServing.fat);
    out.fiber = num(perServing.fiberG ?? perServing.fiber);
    out.sugar = num(perServing.sugarG ?? perServing.sugar);
    out.sodium = num(perServing.sodiumMg ?? perServing.sodium);
    if (perServing.saturatedFatG != null || perServing.saturatedFat != null) {
      out.saturatedFat = num(
        perServing.saturatedFatG ?? perServing.saturatedFat,
      );
    }
    out.vitamins = asStringArray(perServing.vitamins);
    out.minerals = asStringArray(perServing.minerals);
  }

  // --- Source 2: legacy flat `dish.nutrition` -----------------------------
  const flat = asRecord(dish.nutrition);
  if (flat && out.calories === 0) {
    out.calories = num(flat.calories);
    out.protein = num(flat.protein ?? flat.proteinG);
    out.carbs = num(flat.carbs ?? flat.carbsG);
    out.fat = num(flat.fat ?? flat.fatG);
    out.fiber = num(flat.fiber ?? flat.fiberG);
    out.sugar = num(flat.sugar ?? flat.sugarG);
    out.sodium = num(flat.sodium ?? flat.sodiumMg);
    if (flat.saturatedFat != null) out.saturatedFat = num(flat.saturatedFat);
    out.vitamins ??= asStringArray(flat.vitamins);
    out.minerals ??= asStringArray(flat.minerals);
    applyMicroMap(asRecord(flat.vitamins), VITAMIN_KEY_MAP, out);
    applyMicroMap(asRecord(flat.minerals), MINERAL_KEY_MAP, out);
  }

  // --- Source 3: USDA-style `dish.nutritionalProfile.macros` --------------
  const profile = asRecord(dish.nutritionalProfile);
  if (profile && out.calories === 0) {
    out.calories = num(profile.calories);
    const macros = asRecord(profile.macros);
    if (macros) {
      out.protein = num(macros.protein);
      out.carbs = num(macros.carbs);
      out.fat = num(macros.fat);
      out.fiber = num(macros.fiber);
      if (macros.sugar != null) out.sugar = num(macros.sugar);
      if (macros.sodium != null) out.sodium = num(macros.sodium);
      if (macros.saturatedFat != null) {
        out.saturatedFat = num(macros.saturatedFat);
      }
    }
    out.vitamins ??= asStringArray(profile.vitamins);
    out.minerals ??= asStringArray(profile.minerals);
    applyMicroMap(asRecord(profile.vitamins), VITAMIN_KEY_MAP, out);
    applyMicroMap(asRecord(profile.minerals), MINERAL_KEY_MAP, out);
  }

  // If every macro is still zero we have no meaningful data — tell the
  // caller so it can try the ingredient-based fallback path.
  if (
    out.calories === 0 &&
    out.protein === 0 &&
    out.carbs === 0 &&
    out.fat === 0
  ) {
    return null;
  }

  return out;
}

/**
 * Cheap predicate used by callers that just want to know whether a recipe
 * has *any* meaningful nutrition data attached.
 */
export function hasNutritionData(
  nutrition: Partial<NormalizedRecipeNutrition> | null | undefined,
): boolean {
  if (!nutrition) return false;
  return Boolean(
    (nutrition.calories ?? 0) > 0 ||
      (nutrition.protein ?? 0) > 0 ||
      (nutrition.carbs ?? 0) > 0 ||
      (nutrition.fat ?? 0) > 0,
  );
}
