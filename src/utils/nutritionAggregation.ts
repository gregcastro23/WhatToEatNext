/**
 * Nutrition Aggregation Utilities
 * Functions for aggregating, comparing, and analyzing nutritional data
 */

import type {
  NutritionalSummary,
  NutrientDeviation,
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
 * Find nutrient deficiencies (actual < 85% of target)
 */
export function findDeficiencies(
  actual: NutritionalSummary,
  target: NutritionalSummary,
): ComplianceDeficiency[] {
  const deficiencies: ComplianceDeficiency[] = [];
  for (const key of ALL_NUTRIENT_KEYS) {
    const a = actual[key];
    const t = target[key];
    if (typeof a === "number" && typeof t === "number" && t > 0) {
      const ratio = a / t;
      if (ratio < 0.85) {
        const severity =
          ratio < 0.5 ? "severe" : ratio < 0.7 ? "moderate" : "mild";
        deficiencies.push({
          nutrient: key,
          actual: a,
          target: t,
          delta: t - a,
          severity,
        });
      }
    }
  }
  return deficiencies.sort((x, y) => x.actual / x.target - y.actual / y.target);
}

/**
 * Find nutrient excesses (actual > 115% of target)
 */
export function findExcesses(
  actual: NutritionalSummary,
  target: NutritionalSummary,
): ComplianceDeficiency[] {
  const excesses: ComplianceDeficiency[] = [];
  for (const key of ALL_NUTRIENT_KEYS) {
    const a = actual[key];
    const t = target[key];
    if (typeof a === "number" && typeof t === "number" && t > 0) {
      const ratio = a / t;
      if (ratio > 1.15) {
        const severity =
          ratio > 2.0 ? "severe" : ratio > 1.5 ? "moderate" : "mild";
        excesses.push({
          nutrient: key,
          actual: a,
          target: t,
          delta: a - t,
          severity,
        });
      }
    }
  }
  return excesses.sort((x, y) => y.actual / y.target - x.actual / x.target);
}

/**
 * Generate human-readable suggestions based on deficiencies and excesses
 */
export function generateSuggestions(
  deficiencies: NutrientDeviation[],
  excesses: NutrientDeviation[],
): string[] {
  const suggestions: string[] = [];

  for (const d of deficiencies.slice(0, 3)) {
    const pct = Math.round((1 - d.actual / d.target) * 100);
    suggestions.push(
      `Increase ${formatNutrientName(d.nutrient)} intake (${pct}% below target)`,
    );
  }

  for (const e of excesses.slice(0, 3)) {
    const pct = Math.round((e.actual / e.target - 1) * 100);
    suggestions.push(
      `Reduce ${formatNutrientName(e.nutrient)} intake (${pct}% above target)`,
    );
  }

  return suggestions;
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
  const deficiencies = findDeficiencies(totals, goals);
  const excesses = findExcesses(totals, goals);

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
      deficiencies,
      excesses,
      suggestions: generateSuggestions(deficiencies, excesses),
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

  const deficiencies: WeeklyNutritionResult["weeklyCompliance"]["deficiencies"] =
    [];
  const excesses: WeeklyNutritionResult["weeklyCompliance"]["excesses"] = [];

  for (const key of ALL_NUTRIENT_KEYS) {
    const dailyTarget =
      days.length > 0 ? ((weeklyGoals[key] as number) ?? 0) / 7 : 0;
    if (dailyTarget <= 0) continue;

    const dailyValues = days.map((d) => (d.totals[key] as number) ?? 0);
    const avg = dailyValues.reduce((s, v) => s + v, 0) / (days.length || 1);
    const daysBelow = dailyValues.filter((v) => v < dailyTarget * 0.85).length;
    const daysAbove = dailyValues.filter((v) => v > dailyTarget * 1.15).length;

    if (avg < dailyTarget * 0.85) {
      deficiencies.push({
        nutrient: key,
        averageDaily: avg,
        targetDaily: dailyTarget,
        daysDeficient: daysBelow,
      });
    }
    if (avg > dailyTarget * 1.15) {
      excesses.push({
        nutrient: key,
        averageDaily: avg,
        targetDaily: dailyTarget,
        daysExceeded: daysAbove,
      });
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
    weeklyCompliance: { overall, byNutrient, deficiencies, excesses },
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
