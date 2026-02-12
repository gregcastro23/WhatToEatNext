/**
 * Nutrition Aggregation Utilities
 * Functions for aggregating, comparing, and analyzing nutritional data
 */

import type {
  NutritionalSummary,
  DailyNutritionResult,
  WeeklyNutritionResult,
} from "@/types/nutrition";
import { createEmptyNutritionalSummary } from "@/types/nutrition";
import {
  addNutrition,
  multiplyNutrition,
} from "@/data/nutritional/rdaStandards";

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
 * Calculate overall compliance across all tracked nutrients
 */
export function calculateOverallCompliance(
  actual: NutritionalSummary,
  target: NutritionalSummary,
): number {
  let totalScore = 0;
  let count = 0;
  for (const key of ALL_NUTRIENT_KEYS) {
    const a = actual[key];
    const t = target[key];
    if (typeof a === "number" && typeof t === "number" && t > 0) {
      totalScore += nutrientComplianceScore(a, t);
      count++;
    }
  }
  return count > 0 ? totalScore / count : 0;
}

/**
 * Build a DailyNutritionResult from meal nutrition data
 */
export function buildDailyResult(
  date: Date,
  meals: Array<{
    recipeName: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    nutrition: NutritionalSummary;
  }>,
  goals: NutritionalSummary,
): DailyNutritionResult {
  const totals = aggregateNutrition(meals.map((m) => m.nutrition));
  const overall = calculateOverallCompliance(totals, goals);

  const byNutrient: Record<string, number> = {};
  for (const key of ALL_NUTRIENT_KEYS) {
    const a = totals[key];
    const t = goals[key];
    if (typeof a === "number" && typeof t === "number" && t > 0) {
      byNutrient[key] = nutrientComplianceScore(a, t);
    }
  }

  return {
    date,
    meals,
    totals,
    goals,
    compliance: {
      overall,
      byNutrient,
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

  const byNutrient: Record<string, number> = {};
  for (const key of ALL_NUTRIENT_KEYS) {
    const a = weeklyTotals[key];
    const t = weeklyGoals[key];
    if (typeof a === "number" && typeof t === "number" && t > 0) {
      byNutrient[key] = nutrientComplianceScore(a, t);
    }
  }

  const uniqueRecipes = new Set(
    days.flatMap((d) => d.meals.map((m) => m.recipeName)),
  ).size;

  return {
    weekStartDate,
    weekEndDate,
    days,
    weeklyTotals,
    weeklyGoals,
    weeklyCompliance: {
      overall,
      byNutrient,
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
export function formatNutrientName(key: keyof NutritionalSummary): string {
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
