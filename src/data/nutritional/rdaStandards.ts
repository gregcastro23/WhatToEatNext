/**
 * RDA (Recommended Dietary Allowance) Standards
 * Based on FDA Daily Values (2020 regulations) and DRI tables
 */

import type {
  NutritionalSummary,
  NutritionalTargets,
  NutrientPriority,
  NutrientRange,
  UserNutritionProfile,
  ActivityLevel,
  NutritionGoal,
} from "@/types/nutrition";
import { createEmptyNutritionalSummary } from "@/types/nutrition";

export interface RDAStandard {
  nutrient: keyof NutritionalSummary;
  unit: string;
  adult_male: number;
  adult_female: number;
  pregnant?: number;
  lactating?: number;
  upper_limit?: number;
  notes?: string;
}

export const RDA_STANDARDS: RDAStandard[] = [
  // Macronutrients
  { nutrient: 'calories', unit: 'kcal', adult_male: 2500, adult_female: 2000, pregnant: 2200, lactating: 2500 },
  { nutrient: 'protein', unit: 'g', adult_male: 56, adult_female: 46, pregnant: 71, lactating: 71 },
  { nutrient: 'carbs', unit: 'g', adult_male: 130, adult_female: 130, pregnant: 175, lactating: 210 },
  { nutrient: 'fiber', unit: 'g', adult_male: 38, adult_female: 25, pregnant: 28, lactating: 29 },
  { nutrient: 'fat', unit: 'g', adult_male: 78, adult_female: 65 },
  { nutrient: 'saturatedFat', unit: 'g', adult_male: 20, adult_female: 20, upper_limit: 22 },
  { nutrient: 'sugar', unit: 'g', adult_male: 36, adult_female: 25 },
  { nutrient: 'transFat', unit: 'g', adult_male: 0, adult_female: 0, upper_limit: 2 },
  { nutrient: 'cholesterol', unit: 'mg', adult_male: 300, adult_female: 300, upper_limit: 300 },

  // Vitamins
  { nutrient: 'vitaminA', unit: 'μg RAE', adult_male: 900, adult_female: 700, pregnant: 770, lactating: 1300, upper_limit: 3000 },
  { nutrient: 'vitaminC', unit: 'mg', adult_male: 90, adult_female: 75, pregnant: 85, lactating: 120, upper_limit: 2000 },
  { nutrient: 'vitaminD', unit: 'μg', adult_male: 15, adult_female: 15, pregnant: 15, lactating: 15, upper_limit: 100 },
  { nutrient: 'vitaminE', unit: 'mg', adult_male: 15, adult_female: 15, pregnant: 15, lactating: 19, upper_limit: 1000 },
  { nutrient: 'vitaminK', unit: 'μg', adult_male: 120, adult_female: 90, pregnant: 90, lactating: 90 },
  { nutrient: 'thiamin', unit: 'mg', adult_male: 1.2, adult_female: 1.1, pregnant: 1.4, lactating: 1.4 },
  { nutrient: 'riboflavin', unit: 'mg', adult_male: 1.3, adult_female: 1.1, pregnant: 1.4, lactating: 1.6 },
  { nutrient: 'niacin', unit: 'mg', adult_male: 16, adult_female: 14, pregnant: 18, lactating: 17, upper_limit: 35 },
  { nutrient: 'vitaminB6', unit: 'mg', adult_male: 1.3, adult_female: 1.3, pregnant: 1.9, lactating: 2.0, upper_limit: 100 },
  { nutrient: 'folate', unit: 'μg DFE', adult_male: 400, adult_female: 400, pregnant: 600, lactating: 500, upper_limit: 1000 },
  { nutrient: 'vitaminB12', unit: 'μg', adult_male: 2.4, adult_female: 2.4, pregnant: 2.6, lactating: 2.8 },

  // Minerals
  { nutrient: 'calcium', unit: 'mg', adult_male: 1000, adult_female: 1000, pregnant: 1000, lactating: 1000, upper_limit: 2500 },
  { nutrient: 'iron', unit: 'mg', adult_male: 8, adult_female: 18, pregnant: 27, lactating: 9, upper_limit: 45 },
  { nutrient: 'magnesium', unit: 'mg', adult_male: 420, adult_female: 320, pregnant: 350, lactating: 310 },
  { nutrient: 'phosphorus', unit: 'mg', adult_male: 700, adult_female: 700, pregnant: 700, lactating: 700, upper_limit: 4000 },
  { nutrient: 'potassium', unit: 'mg', adult_male: 3400, adult_female: 2600, pregnant: 2900, lactating: 2800 },
  { nutrient: 'sodium', unit: 'mg', adult_male: 1500, adult_female: 1500, upper_limit: 2300 },
  { nutrient: 'zinc', unit: 'mg', adult_male: 11, adult_female: 8, pregnant: 11, lactating: 12, upper_limit: 40 },
];

/**
 * Get unit string for a given nutrient
 */
export function getNutrientUnit(nutrient: keyof NutritionalSummary): string {
  const standard = RDA_STANDARDS.find((s) => s.nutrient === nutrient);
  return standard?.unit ?? '';
}

/**
 * Activity level calorie multipliers (Harris-Benedict)
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Select base RDA values based on sex
 */
function selectBaseRDA(sex: string): NutritionalSummary {
  const base = createEmptyNutritionalSummary();
  for (const std of RDA_STANDARDS) {
    const value = sex === 'male' ? std.adult_male : std.adult_female;
    (base as unknown as Record<string, number>)[std.nutrient] = value;
  }
  return base;
}

/**
 * Multiply all values in a NutritionalSummary by a factor
 */
export function multiplyNutrition(summary: NutritionalSummary, factor: number): NutritionalSummary {
  const result = createEmptyNutritionalSummary();
  for (const key of Object.keys(result) as Array<keyof NutritionalSummary>) {
    const val = summary[key];
    if (typeof val === 'number') {
      (result as unknown as Record<string, number>)[key] = val * factor;
    }
  }
  return result;
}

/**
 * Add two NutritionalSummary objects together
 */
export function addNutrition(a: NutritionalSummary, b: NutritionalSummary): NutritionalSummary {
  const result = createEmptyNutritionalSummary();
  for (const key of Object.keys(result) as Array<keyof NutritionalSummary>) {
    const va = a[key];
    const vb = b[key];
    if (typeof va === 'number' && typeof vb === 'number') {
      (result as unknown as Record<string, number>)[key] = va + vb;
    }
  }
  return result;
}

/**
 * Calculate personalized RDA targets from user profile
 */
export function calculatePersonalizedRDA(profile: UserNutritionProfile): NutritionalTargets {
  const sex = profile.sex === 'other' ? 'female' : profile.sex;
  const base = selectBaseRDA(sex);

  // Adjust calories for activity level
  const activityMult = ACTIVITY_MULTIPLIERS[profile.activityLevel];
  base.calories = base.calories * activityMult;

  // Adjust for goals
  base.calories = adjustCaloriesForGoal(base.calories, profile.primaryGoal);

  // Scale macros to calorie target
  const proteinMult = (profile.activityLevel === 'active' || profile.activityLevel === 'very_active') ? 1.3 : 1.0;
  base.protein = base.protein * proteinMult;
  base.carbs = (base.calories * 0.50) / 4;
  base.fat = (base.calories * 0.30) / 9;

  const weekly = multiplyNutrition(base, 7);

  const ranges = buildRanges(base);
  const priorities = determinePriorities(profile);

  return { daily: base, weekly, ranges, priorities };
}

function adjustCaloriesForGoal(calories: number, goal: NutritionGoal): number {
  switch (goal) {
    case 'lose_weight': return calories * 0.80;
    case 'gain_weight': return calories * 1.15;
    case 'gain_muscle': return calories * 1.10;
    case 'athletic_performance': return calories * 1.20;
    default: return calories;
  }
}

function buildRanges(daily: NutritionalSummary): Partial<Record<keyof NutritionalSummary, NutrientRange>> {
  const ranges: Partial<Record<keyof NutritionalSummary, NutrientRange>> = {};
  for (const std of RDA_STANDARDS) {
    const target = (daily as unknown as Record<string, number>)[std.nutrient] ?? 0;
    ranges[std.nutrient] = {
      min: target * 0.85,
      max: std.upper_limit ?? target * 1.15,
      optimal: target,
      unit: std.unit,
    };
  }
  return ranges;
}

function determinePriorities(profile: UserNutritionProfile): NutrientPriority[] {
  const priorities: NutrientPriority[] = [
    { nutrient: 'calories', importance: 'critical', targetDirection: 'maintain' },
    { nutrient: 'protein', importance: 'high', targetDirection: 'maintain' },
    { nutrient: 'fiber', importance: 'high', targetDirection: 'increase' },
    { nutrient: 'sodium', importance: 'high', targetDirection: 'decrease' },
    { nutrient: 'iron', importance: 'medium', targetDirection: 'maintain' },
    { nutrient: 'calcium', importance: 'medium', targetDirection: 'maintain' },
    { nutrient: 'vitaminD', importance: 'medium', targetDirection: 'increase' },
  ];

  if (profile.primaryGoal === 'gain_muscle' || profile.primaryGoal === 'athletic_performance') {
    priorities.find((p) => p.nutrient === 'protein')!.importance = 'critical';
    priorities.find((p) => p.nutrient === 'protein')!.targetDirection = 'increase';
  }

  if (profile.primaryGoal === 'lose_weight') {
    priorities.find((p) => p.nutrient === 'calories')!.targetDirection = 'decrease';
    priorities.push({ nutrient: 'sugar', importance: 'high', targetDirection: 'decrease' });
  }

  if (profile.sex === 'female' && profile.age < 51) {
    priorities.find((p) => p.nutrient === 'iron')!.importance = 'high';
    priorities.find((p) => p.nutrient === 'iron')!.targetDirection = 'increase';
  }

  // Add focus nutrients from profile
  if (profile.focusNutrients) {
    for (const n of profile.focusNutrients) {
      if (!priorities.find((p) => p.nutrient === n)) {
        priorities.push({ nutrient: n, importance: 'high', targetDirection: 'increase' });
      }
    }
  }

  return priorities;
}
