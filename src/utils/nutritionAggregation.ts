/**
 * Nutrition Aggregation Utilities
 * Functions for aggregating, comparing, and analyzing nutritional data
 */

import {
  addNutrition,
  multiplyNutrition as _multiplyNutrition,
} from "@/data/nutritional/rdaStandards";
import type {
  NutritionalSummary,
  DailyNutritionResult,
  WeeklyNutritionResult,
} from "@/types/nutrition";
import { createEmptyNutritionalSummary } from "@/types/nutrition";
import {
  coverageOf,
  lowerBoundCoverageOf,
  sumCoverage,
  sumLowerBoundCoverage,
} from "@/utils/menuPlanner/nutritionCoverage";

/**
 * Key macronutrient fields for quick iteration
 */
const MACRO_KEYS: Array<keyof NutritionalSummary> = [
  "calories",
  "protein",
  "carbs",
  "fat",
  "fiber",
  "sugar",
  "saturatedFat",
  "transFat",
  "cholesterol",
];

/**
 * Key micronutrient fields
 */
const MICRO_KEYS: Array<keyof NutritionalSummary> = [
  "vitaminA",
  "vitaminC",
  "vitaminD",
  "vitaminE",
  "vitaminK",
  "thiamin",
  "riboflavin",
  "niacin",
  "vitaminB6",
  "folate",
  "vitaminB12",
  "calcium",
  "iron",
  "magnesium",
  "phosphorus",
  "potassium",
  "sodium",
  "zinc",
];

/**
 * All tracked nutrient keys
 */
export const ALL_NUTRIENT_KEYS: Array<keyof NutritionalSummary> = [
  ...MACRO_KEYS,
  ...MICRO_KEYS,
];

/**
 * Aggregate multiple NutritionalSummary objects into one total
 */
export function aggregateNutrition(
  summaries: NutritionalSummary[],
): NutritionalSummary {
  let result = createEmptyNutritionalSummary();
  for (const s of summaries) {
    result = addNutrition(result, s);
  }
  return result;
}

/**
 * Calculate compliance score (0-1) for a single nutrient
 * 1.0 = exactly at target, decreases as you move away
 */
export function nutrientComplianceScore(
  actual: number,
  target: number,
): number {
  if (target <= 0) return 1;
  const ratio = actual / target;
  // Score: 1.0 at ratio=1.0, drops off as ratio moves away
  if (ratio >= 0.85 && ratio <= 1.15) return 1.0;
  if (ratio < 0.85) return Math.max(0, ratio / 0.85);
  // Over target: penalize more gently
  return Math.max(0, 1 - (ratio - 1.15) * 2);
}

/**
 * The nutrients compliance is scored over (owner ruling 2026-09-27, option b):
 * the five the recipe catalog publishes for every recipe, and the food diary's set.
 *
 * [MEASURED 2026-09-27, 1,084 static recipes] Compliance used to average 26
 * nutrients and score each absent one as a deficit.
 * - 18 micronutrients: no authored recipe carries them as numbers. Computed
 *   recipes carry partial sums in Daily Value fractions, not the mg/µg of the
 *   targets.
 * - Sugar, sodium, saturated fat and cholesterol are upper limits that were
 *   scored as targets. They are mostly partial sums, and cholesterol is never
 *   published.
 * A 1,311 kcal day (Manakish Za'atar + Authentic Kofta Kebab) read 24.6%;
 * over these five it reads 69.7%.
 */
export const COMPLIANCE_NUTRIENTS: ReadonlyArray<keyof NutritionalSummary> = [
  "calories",
  "protein",
  "carbs",
  "fat",
  "fiber",
];

/** Human-readable basis for a compliance figure: "Calories, Protein, …". */
export function describeComplianceBasis(
  basis: ReadonlyArray<keyof NutritionalSummary> = COMPLIANCE_NUTRIENTS,
): string {
  return basis.map((key) => formatNutrientName(key)).join(", ");
}

/** Per-nutrient compliance over `COMPLIANCE_NUTRIENTS` that have a target. */
export function scoreByNutrient(
  actual: NutritionalSummary,
  target: NutritionalSummary,
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const key of COMPLIANCE_NUTRIENTS) {
    const a = actual[key];
    const t = target[key];
    if (typeof a === "number" && typeof t === "number" && t > 0) {
      scores[key] = nutrientComplianceScore(a, t);
    }
  }
  return scores;
}

/** Overall compliance: the mean of `scoreByNutrient`. */
export function calculateOverallCompliance(
  actual: NutritionalSummary,
  target: NutritionalSummary,
): number {
  const scores = Object.values(scoreByNutrient(actual, target));
  return scores.length > 0
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;
}

/**
 * Build a DailyNutritionResult from meal nutrition data. `totals` sums only
 * the meals with nutrition; `coverage` says how many that is.
 */
export function buildDailyResult(
  date: Date,
  meals: DailyNutritionResult["meals"],
  goals: NutritionalSummary,
): DailyNutritionResult {
  const totals = aggregateNutrition(meals.map((m) => m.nutrition));
  const overall = calculateOverallCompliance(totals, goals);
  const byNutrient = scoreByNutrient(totals, goals);

  return {
    date,
    meals,
    totals,
    coverage: coverageOf(meals.map((m) => m.hasNutrition)),
    nutrientCoverage: lowerBoundCoverageOf(meals.map((m) => m.stated)),
    goals,
    compliance: {
      overall,
      byNutrient,
      basis: COMPLIANCE_NUTRIENTS,
      deficiencies: [],
      excesses: [],
      suggestions: [],
    },
  };
}

/**
 * Build a WeeklyNutritionResult from daily results
 */
export function buildWeeklyResult(
  weekStartDate: Date,
  days: DailyNutritionResult[],
  weeklyGoals: NutritionalSummary,
): WeeklyNutritionResult {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const weeklyTotals = aggregateNutrition(days.map((d) => d.totals));
  const overall = calculateOverallCompliance(weeklyTotals, weeklyGoals);
  const byNutrient = scoreByNutrient(weeklyTotals, weeklyGoals);

  const uniqueRecipes = new Set(
    days.flatMap((d) => d.meals.map((m) => m.recipeName)),
  ).size;

  return {
    weekStartDate,
    weekEndDate,
    days,
    weeklyTotals,
    coverage: sumCoverage(days.map((d) => d.coverage)),
    nutrientCoverage: sumLowerBoundCoverage(days.map((d) => d.nutrientCoverage)),
    weeklyGoals,
    weeklyCompliance: {
      overall,
      byNutrient,
      basis: COMPLIANCE_NUTRIENTS,
      deficiencies: [],
      excesses: [],
    },
    variety: {
      uniqueIngredients: 0, // Would require ingredient-level data
      uniqueRecipes,
      cuisineDiversity: 0,
      colorDiversity: 0,
    },
  };
}

/**
 * Convert camelCase nutrient key to human-readable name
 */
function formatNutrientName(key: keyof NutritionalSummary): string {
  const names: Partial<Record<keyof NutritionalSummary, string>> = {
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbohydrates",
    fat: "Fat",
    fiber: "Fiber",
    sugar: "Sugar",
    saturatedFat: "Saturated Fat",
    transFat: "Trans Fat",
    cholesterol: "Cholesterol",
    vitaminA: "Vitamin A",
    vitaminC: "Vitamin C",
    vitaminD: "Vitamin D",
    vitaminE: "Vitamin E",
    vitaminK: "Vitamin K",
    thiamin: "Thiamin (B1)",
    riboflavin: "Riboflavin (B2)",
    niacin: "Niacin (B3)",
    vitaminB6: "Vitamin B6",
    folate: "Folate",
    vitaminB12: "Vitamin B12",
    calcium: "Calcium",
    iron: "Iron",
    magnesium: "Magnesium",
    phosphorus: "Phosphorus",
    potassium: "Potassium",
    sodium: "Sodium",
    zinc: "Zinc",
  };
  return names[key] ?? String(key);
}
