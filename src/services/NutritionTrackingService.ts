/**
 * NutritionTrackingService
 * Central service for tracking nutrition across the menu planner.
 * Bridges meal slot data with comprehensive nutritional analysis.
 */

import type {
  NutritionalSummary,
  NutritionalTargets,
  UserNutritionProfile,
  DailyNutritionResult,
  WeeklyNutritionResult,
  ComplianceSeverity,
} from "@/types/nutrition";
import {
  createEmptyNutritionalSummary,
  getComplianceSeverity,
} from "@/types/nutrition";
import type { MealSlot, DayOfWeek } from "@/types/menuPlanner";
import {
  calculatePersonalizedRDA,
  multiplyNutrition,
} from "@/data/nutritional/rdaStandards";
import {
  buildDailyResult,
  buildWeeklyResult,
  aggregateNutrition,
  formatNutrientName,
} from "@/utils/nutritionAggregation";

/**
 * Default daily targets (FDA 2000 kcal reference diet) used when no profile is set
 */
const DEFAULT_DAILY_TARGETS: NutritionalSummary = {
  calories: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
  sugar: 50,
  saturatedFat: 20,
  transFat: 0,
  cholesterol: 300,
  vitaminA: 900,
  vitaminD: 20,
  vitaminE: 15,
  vitaminK: 120,
  vitaminC: 90,
  thiamin: 1.2,
  riboflavin: 1.3,
  niacin: 16,
  vitaminB6: 1.7,
  folate: 400,
  vitaminB12: 2.4,
  calcium: 1300,
  phosphorus: 1250,
  magnesium: 420,
  sodium: 2300,
  potassium: 4700,
  iron: 18,
  zinc: 11,
};

export class NutritionTrackingService {
  private targets: NutritionalTargets;
  private profile: UserNutritionProfile | null = null;

  constructor(profile?: UserNutritionProfile) {
    if (profile) {
      this.profile = profile;
      this.targets = calculatePersonalizedRDA(profile);
    } else {
      this.targets = {
        daily: DEFAULT_DAILY_TARGETS,
        weekly: multiplyNutrition(DEFAULT_DAILY_TARGETS, 7),
        ranges: {},
        priorities: [
          {
            nutrient: "calories",
            importance: "critical",
            targetDirection: "maintain",
          },
          {
            nutrient: "protein",
            importance: "high",
            targetDirection: "maintain",
          },
          {
            nutrient: "fiber",
            importance: "high",
            targetDirection: "increase",
          },
        ],
      };
    }
  }

  /**
   * Update user profile and recalculate targets
   */
  updateProfile(profile: UserNutritionProfile): void {
    this.profile = profile;
    this.targets = calculatePersonalizedRDA(profile);
  }

  /**
   * Get current daily targets
   */
  getDailyTargets(): NutritionalSummary {
    return this.targets.daily;
  }

  /**
   * Get current weekly targets
   */
  getWeeklyTargets(): NutritionalSummary {
    return this.targets.weekly;
  }

  /**
   * Get full targets including ranges and priorities
   */
  getTargets(): NutritionalTargets {
    return this.targets;
  }

  /**
   * Extract NutritionalSummary from a MealSlot's recipe.
   * Maps the existing recipe.nutrition structure to our comprehensive format.
   */
  extractMealNutrition(meal: MealSlot): NutritionalSummary {
    const base = createEmptyNutritionalSummary();
    if (!meal.recipe) return base;

    const recipe = meal.recipe;
    const nutrition = recipe.nutrition;
    const servings = meal.servings || 1;

    if (!nutrition) return base;

    // Map from recipe.nutrition to NutritionalSummary
    base.calories = (nutrition.calories ?? 0) * servings;
    base.protein = (nutrition.protein ?? 0) * servings;
    base.carbs = (nutrition.carbs ?? 0) * servings;
    base.fat = (nutrition.fat ?? 0) * servings;
    base.fiber = (nutrition.fiber ?? 0) * servings;

    // Map micronutrients if available
    base.vitaminA = (nutrition.vitaminA ?? 0) * servings;
    base.vitaminC = (nutrition.vitaminC ?? 0) * servings;
    base.vitaminD = (nutrition.vitaminD ?? 0) * servings;
    base.vitaminE = (nutrition.vitaminE ?? 0) * servings;
    base.vitaminK = (nutrition.vitaminK ?? 0) * servings;
    base.thiamin = (nutrition.thiamin ?? 0) * servings;
    base.riboflavin = (nutrition.riboflavin ?? 0) * servings;
    base.niacin = (nutrition.niacin ?? 0) * servings;
    base.pantothenicAcid = (nutrition.pantothenicAcid ?? 0) * servings;
    base.vitaminB6 = (nutrition.vitaminB6 ?? 0) * servings;
    base.biotin = (nutrition.biotin ?? 0) * servings;
    base.folate = (nutrition.folate ?? 0) * servings;
    base.vitaminB12 = (nutrition.vitaminB12 ?? 0) * servings;
    base.choline = (nutrition.choline ?? 0) * servings;

    base.calcium = (nutrition.calcium ?? 0) * servings;
    base.iron = (nutrition.iron ?? 0) * servings;
    base.magnesium = (nutrition.magnesium ?? 0) * servings;
    base.phosphorus = (nutrition.phosphorus ?? 0) * servings;
    base.potassium = (nutrition.potassium ?? 0) * servings;
    base.sodium = (nutrition.sodium ?? 0) * servings;
    base.zinc = (nutrition.zinc ?? 0) * servings;
    base.chloride = (nutrition.chloride ?? 0) * servings;
    base.copper = (nutrition.copper ?? 0) * servings;
    base.manganese = (nutrition.manganese ?? 0) * servings;
    base.selenium = (nutrition.selenium ?? 0) * servings;
    base.iodine = (nutrition.iodine ?? 0) * servings;
    base.chromium = (nutrition.chromium ?? 0) * servings;
    base.molybdenum = (nutrition.molybdenum ?? 0) * servings;
    base.fluoride = (nutrition.fluoride ?? 0) * servings;

    return base;
  }

  /**
   * Calculate daily nutrition result from a day's meal slots
   */
  calculateDailyNutrition(meals: MealSlot[], date: Date): DailyNutritionResult {
    const mealData = meals
      .filter((m) => m.recipe)
      .map((m) => ({
        recipeName: m.recipe!.name,
        mealType: m.mealType,
        nutrition: this.extractMealNutrition(m),
      }));

    return buildDailyResult(date, mealData, this.targets.daily);
  }

  /**
   * Calculate weekly nutrition result from all meal slots grouped by day
   */
  calculateWeeklyNutrition(
    mealsByDay: Record<DayOfWeek, MealSlot[]>,
    weekStartDate: Date,
  ): WeeklyNutritionResult {
    const days: DailyNutritionResult[] = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStartDate);
      dayDate.setDate(dayDate.getDate() + i);
      const dayMeals = mealsByDay[i as DayOfWeek] || [];
      days.push(this.calculateDailyNutrition(dayMeals, dayDate));
    }

    return buildWeeklyResult(weekStartDate, days, this.targets.weekly);
  }

  /**
   * Get compliance severity label for a score
   */
  getComplianceLabel(score: number): ComplianceSeverity {
    return getComplianceSeverity(score);
  }

  /**
   * Get a color string for a compliance score (for UI)
   */
  getComplianceColor(score: number): string {
    const severity = getComplianceSeverity(score);
    switch (severity) {
      case "excellent":
        return "#22c55e";
      case "good":
        return "#84cc16";
      case "fair":
        return "#eab308";
      case "poor":
        return "#f97316";
      case "critical":
        return "#ef4444";
    }
  }

  /**
   * Format a nutrient key for display
   */
  formatNutrient(key: string): string {
    return formatNutrientName(key as keyof NutritionalSummary);
  }
}

/**
 * Singleton default instance (can be replaced with user-specific instance)
 */
let defaultInstance: NutritionTrackingService | null = null;

export function getNutritionTrackingService(): NutritionTrackingService {
  if (!defaultInstance) {
    defaultInstance = new NutritionTrackingService();
  }
  return defaultInstance;
}

export function setNutritionTrackingProfile(
  profile: UserNutritionProfile,
): void {
  const service = getNutritionTrackingService();
  service.updateProfile(profile);
}
