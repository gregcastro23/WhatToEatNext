// src/utils/nutrientCompleteness.ts
//
// Amounts a recipe publishes only when every ingredient in the total states
// them. A missing value is not 0: one gap leaves the recipe's figure ABSENT
// rather than smaller.
//
// Owner rulings: potassium and cholesterol 2026-09-27; sugar, sodium and
// saturated fat 2026-09-29 (option a, with the derived zeros below).
//
// [MEASURED 2026-09-29, `getServerRecipes`, the 200 computed recipes] Before
// this rule every one published sugar and sodium and 170 published saturated
// fat, yet only 38, 36 and 4 had every counted ingredient stating it. Half the
// ingredient catalog states neither sugar nor sodium (477 and 498 of 1,002
// profiles) and 158 state saturated fat. `readNum(undefined)` had made each
// missing value a 0. Under the rule 40, 16 and 11 of the 200 publish them; with
// the 34 sodium profiles corrected from USDA, 40, 25 and 11.

import type { NormalizedRecipeNutrition } from "./recipeNutrition";

export const COMPLETE_ONLY = [
  "sugar",
  "sodium",
  "saturatedFat",
  "potassium",
  "cholesterol",
] as const;

export type CompleteOnlyKey = (typeof COMPLETE_ONLY)[number];

/**
 * What a line with no calories and no macros (salt, water, baking soda) can
 * still add. Its potassium and cholesterol were never counted, and stay so.
 */
export const MACROLESS_KEYS: readonly CompleteOnlyKey[] = [
  "sugar",
  "sodium",
  "saturatedFat",
];

/** The fields of an ingredient profile (its `macros`, or the flat profile) read here. */
export interface CompleteOnlySource {
  carbs?: number;
  fat?: number;
  sugar?: number;
  sodium?: number;
  saturatedFat?: number;
  potassium?: number;
  cholesterol?: number;
}

export type CompleteOnlyValues = Partial<Record<CompleteOnlyKey, number>>;

function stated(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * A sodium above 0 and below this is not a value in mg.
 *
 * [MEASURED 2026-09-29, 1,002 ingredient profiles] 56 stated a sodium between 0
 * and 1: 39 copied the profile's Daily Value fraction (salt 0.25), 17 stated
 * grams (kasha 0.005 for 43 g). 34 are corrected from USDA FoodData Central
 * (`data/ingredients/sodiumFdcBasis.ts`; salt is 581.4 mg in 1.5 g). 22 have no
 * SR Legacy record that is the same food and still state one
 * (`SODIUM_UNRESOLVED`: gochujang, black salt, jameed, ...). Three corrected
 * servings are truly under 1 mg (chives 3 g, arrowroot 8 g, maple crystals 4 g)
 * and are held out with them until the last unresolved profile is corrected.
 * An exact 0 still is a value: oil, sugar and pepper carry none.
 */
const SODIUM_MG_FLOOR = 1;

function statedIn(key: CompleteOnlyKey, value: unknown): number | undefined {
  const v = stated(value);
  if (key === "sodium" && v !== undefined && v > 0 && v < SODIUM_MG_FLOOR) return undefined;
  return v;
}

/**
 * The values one ingredient profile states, per serving.
 *
 * [BASIS] Two are also derived where the profile states the whole they belong
 * to as exactly 0: sugars are a component of total carbohydrate, and saturated
 * fat a component of total fat. So `carbs: 0` gives `sugar: 0` and `fat: 0`
 * gives `saturatedFat: 0`. A missing `carbs` or `fat` derives nothing. Sodium
 * has no such whole.
 */
export function readCompleteOnly(source: CompleteOnlySource): CompleteOnlyValues {
  const out: CompleteOnlyValues = {};
  for (const k of COMPLETE_ONLY) {
    const v = statedIn(k, source[k]);
    if (v !== undefined) out[k] = v;
  }
  if (out.sugar === undefined && source.carbs === 0) out.sugar = 0;
  if (out.saturatedFat === undefined && source.fat === 0) out.saturatedFat = 0;
  return out;
}

/**
 * Add the complete-only fields of `b` onto `a`. NaN marks a gap and stays NaN,
 * so one ingredient without a value leaves the total without one;
 * `scaleCompleteOnly` drops it.
 */
export function foldCompleteOnly(
  a: NormalizedRecipeNutrition,
  b: NormalizedRecipeNutrition,
  keys: readonly CompleteOnlyKey[] = COMPLETE_ONLY,
): void {
  for (const k of keys) {
    const bv = b[k];
    const sum = a[k] ?? 0;
    a[k] = typeof bv === "number" && !Number.isNaN(sum) ? sum + bv : NaN;
  }
}

/** Copy the complete-only fields of `n` that are whole, scaled, onto `out`. */
export function scaleCompleteOnly(
  n: NormalizedRecipeNutrition,
  factor: number,
  out: NormalizedRecipeNutrition,
): void {
  for (const k of COMPLETE_ONLY) {
    const v = n[k];
    if (typeof v === "number" && Number.isFinite(v)) out[k] = v * factor;
  }
}

/**
 * What a macroless line adds, from its per-mass nutrition `scaled`. With the
 * mass unknown, a value of 0 still adds 0 at any mass; anything else is a gap.
 */
export function macrolessContribution(
  scaled: NormalizedRecipeNutrition,
  massKnown: boolean,
): NormalizedRecipeNutrition {
  const out: NormalizedRecipeNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };
  for (const k of MACROLESS_KEYS) {
    const v = scaled[k];
    out[k] = massKnown ? (v ?? NaN) : v === 0 ? 0 : NaN;
  }
  return out;
}

/**
 * Set `out[key]` from the first of `candidates` that is present (`a ?? b`),
 * when it is a finite number. A value that is not stated leaves it absent.
 */
export function setStated(
  out: NormalizedRecipeNutrition,
  key: "sugar" | "sodium" | "saturatedFat",
  ...candidates: unknown[]
): void {
  const first = candidates.find((c) => c !== null && c !== undefined);
  if (first === undefined || first === "") return;
  const n = typeof first === "number" ? first : Number(first);
  if (Number.isFinite(n)) out[key] = n;
}
