/**
 * Nutritional Calculator
 * Functions for calculating nutritional totals and alchemical metrics for menu planning
 *
 * @file src/utils/menuPlanner/nutritionalCalculator.ts
 * @created 2026-01-11 (Phase 3)
 */

import type { AlchemicalProperties } from "@/calculations/core/kalchmEngine";
import {
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
  calculateKAlchm,
  calculateMonicaConstant,
} from "@/calculations/core/kalchmEngine";
import type {
  MealSlot,
  DayOfWeek,
  DailyNutritionTotals,
  WeeklyNutritionTotals,
  AlchemicalMetrics,
  MacronutrientBreakdown,
  NutritionalGoals,
  NutritionalProgress,
  ChartDataPoint,
  NutritionalChart,
} from "@/types/menuPlanner";
import type { ElementalProperties, EnhancedRecipe } from "@/types/recipe";
import { createLogger } from "@/utils/logger";

const logger = createLogger("NutritionalCalculator");

/**
 * Default empty daily nutrition totals
 */
export const EMPTY_DAILY_TOTALS: DailyNutritionTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  gregsEnergy: 0,
  monicaConstant: 0,
  kalchm: 1.0,
  elementalBalance: {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  },
};

/**
 * Calculate nutritional totals for a single day
 *
 * @param meals - Array of meal slots for the day
 * @returns Daily nutrition totals
 */
export function calculateDailyTotals(meals: MealSlot[]): DailyNutritionTotals {
  if (meals.length === 0) return { ...EMPTY_DAILY_TOTALS };

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  const elementalAccumulator: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };
  const alchemicalAccumulator: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
  };

  // Accumulate nutrition from each meal
  meals.forEach((meal) => {
    if (!meal.recipe) return;

    const recipe = meal.recipe;

    // Safe check for ingredients and instructions
    if (!recipe.ingredients || recipe.ingredients.length === 0 || !recipe.instructions || recipe.instructions.length === 0) {
      logger.warn(`Recipe ${recipe.id} is incomplete (missing ingredients or instructions). Skipping nutrition calculation.`);
      return; // Skip nutrition calculation for incomplete recipes
    }
    const servings = meal.servings || 1;

    // Basic nutrition
    const nutrition = recipe.nutritionalProfile as any;
    if (nutrition) {
      totalCalories += (nutrition.calories || 0) * servings;
      totalProtein += (nutrition.protein || 0) * servings;
      totalCarbs += (nutrition.carbs || 0) * servings;
      totalFat += (nutrition.fat || 0) * servings;
      totalFiber += (nutrition.fiber || 0) * servings;
    }

    // Elemental properties
    if (recipe.elementalProperties) {
      elementalAccumulator.Fire += recipe.elementalProperties.Fire * servings;
      elementalAccumulator.Water += recipe.elementalProperties.Water * servings;
      elementalAccumulator.Earth += recipe.elementalProperties.Earth * servings;
      elementalAccumulator.Air += recipe.elementalProperties.Air * servings;
    }

    // Alchemical properties (ESMS)
    if (recipe.alchemicalProperties) {
      console.log(`Auditing alchemical properties for recipe: ${recipe.id}`, recipe.alchemicalProperties);
      // Map properties from recipe.alchemicalProperties (heat, entropy, reactivity, stability)
      // to AlchemicalProperties (Spirit, Essence, Matter, Substance)
      const mappedAlchemicalProps: AlchemicalProperties = {
        Spirit: (recipe.alchemicalProperties as any).reactivity || 0,
        Essence: (recipe.alchemicalProperties as any).entropy || 0,
        Matter: (recipe.alchemicalProperties as any).heat || 0,
        Substance: (recipe.alchemicalProperties as any).stability || 0,
      };
      alchemicalAccumulator.Spirit += (mappedAlchemicalProps.Spirit || 0) * servings;
      alchemicalAccumulator.Essence += (mappedAlchemicalProps.Essence || 0) * servings;
      alchemicalAccumulator.Matter += (mappedAlchemicalProps.Matter || 0) * servings;
      alchemicalAccumulator.Substance += (mappedAlchemicalProps.Substance || 0) * servings;
    }
  });

  // Normalize elemental properties (average across meals)
  const mealCount = meals.filter((m) => m.recipe).length;
  if (mealCount > 0) {
    elementalAccumulator.Fire /= mealCount;
    elementalAccumulator.Water /= mealCount;
    elementalAccumulator.Earth /= mealCount;
    elementalAccumulator.Air /= mealCount;
  }

  // Calculate alchemical metrics
  const alchemicalMetrics = calculateAlchemicalMetrics(
    alchemicalAccumulator,
    elementalAccumulator,
  );

  return {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    fiber: totalFiber,
    gregsEnergy: alchemicalMetrics.gregsEnergy,
    monicaConstant: alchemicalMetrics.monica,
    kalchm: alchemicalMetrics.kalchm,
    elementalBalance: elementalAccumulator,
  };
}

/**
 * Calculate nutritional totals for entire week
 *
 * @param mealsByDay - Meals grouped by day of week
 * @returns Weekly nutrition totals
 */
export function calculateWeeklyTotals(
  mealsByDay: Record<DayOfWeek, MealSlot[]>,
): WeeklyNutritionTotals {
  const dailyBreakdown: Record<DayOfWeek, DailyNutritionTotals> = {} as any;

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let gregsEnergySum = 0;
  let monicaSum = 0;
  let kalchmSum = 0;
  const weeklyElemental: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  let daysWithMeals = 0;

  // Calculate daily totals for each day
  ([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).forEach((day) => {
    const meals = mealsByDay[day] || [];
    const dailyTotal = calculateDailyTotals(meals);
    dailyBreakdown[day] = dailyTotal;

    if (meals.filter((m) => m.recipe).length > 0) {
      totalCalories += dailyTotal.calories;
      totalProtein += dailyTotal.protein;
      totalCarbs += dailyTotal.carbs;
      totalFat += dailyTotal.fat;
      totalFiber += dailyTotal.fiber;
      gregsEnergySum += dailyTotal.gregsEnergy;
      monicaSum += dailyTotal.monicaConstant;
      kalchmSum += dailyTotal.kalchm;
      weeklyElemental.Fire += dailyTotal.elementalBalance.Fire;
      weeklyElemental.Water += dailyTotal.elementalBalance.Water;
      weeklyElemental.Earth += dailyTotal.elementalBalance.Earth;
      weeklyElemental.Air += dailyTotal.elementalBalance.Air;
      daysWithMeals++;
    }
  });

  // Average elemental balance across the week
  if (daysWithMeals > 0) {
    weeklyElemental.Fire /= daysWithMeals;
    weeklyElemental.Water /= daysWithMeals;
    weeklyElemental.Earth /= daysWithMeals;
    weeklyElemental.Air /= daysWithMeals;
  }

  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    averageGregsEnergy: daysWithMeals > 0 ? gregsEnergySum / daysWithMeals : 0,
    averageMonica: daysWithMeals > 0 ? monicaSum / daysWithMeals : 0,
    averageKalchm: daysWithMeals > 0 ? kalchmSum / daysWithMeals : 1.0,
    weeklyElementalBalance: weeklyElemental,
    dailyBreakdown,
  };
}

/**
 * Calculate alchemical metrics from ESMS and elemental properties
 *
 * @param alchemical - Alchemical properties (Spirit, Essence, Matter, Substance)
 * @param elemental - Elemental properties (Fire, Water, Earth, Air)
 * @returns Alchemical metrics
 */
export function calculateAlchemicalMetrics(
  alchemical: AlchemicalProperties,
  elemental: ElementalProperties,
): AlchemicalMetrics {
  const { Spirit, Essence, Matter, Substance } = alchemical;
  const { Fire, Water, Earth, Air } = elemental;

  // Calculate thermodynamic properties using existing functions
  const heat = calculateHeat(
    Spirit,
    Fire,
    Substance,
    Essence,
    Matter,
    Water,
    Air,
    Earth,
  );

  const entropy = calculateEntropy(
    Spirit,
    Substance,
    Fire,
    Air,
    Essence,
    Matter,
    Earth,
    Water,
  );

  const reactivity = calculateReactivity(
    Spirit,
    Substance,
    Essence,
    Fire,
    Air,
    Water,
    Matter,
    Earth,
  );

  const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity);

  const kalchm = calculateKAlchm(Spirit, Essence, Matter, Substance);

  const monica = calculateMonicaConstant(gregsEnergy, reactivity, kalchm);

  return {
    heat,
    entropy,
    reactivity,
    gregsEnergy,
    monica: Number.isFinite(monica) ? monica : 0.73, // Default to approximate Monica
    kalchm,
  };
}

/**
 * Calculate macronutrient breakdown with percentages
 *
 * @param protein - Grams of protein
 * @param carbs - Grams of carbs
 * @param fat - Grams of fat
 * @returns Macronutrient breakdown
 */
export function calculateMacroBreakdown(
  protein: number,
  carbs: number,
  fat: number,
): MacronutrientBreakdown {
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  const totalCalories = proteinCalories + carbsCalories + fatCalories;

  if (totalCalories === 0) {
    return {
      protein,
      carbs,
      fat,
      proteinPercentage: 0,
      carbsPercentage: 0,
      fatPercentage: 0,
    };
  }

  return {
    protein,
    carbs,
    fat,
    proteinPercentage: (proteinCalories / totalCalories) * 100,
    carbsPercentage: (carbsCalories / totalCalories) * 100,
    fatPercentage: (fatCalories / totalCalories) * 100,
  };
}

/**
 * Calculate nutritional progress toward goals
 *
 * @param actual - Actual daily nutrition totals
 * @param goals - Nutritional goals (optional)
 * @returns Nutritional progress
 */
export function calculateNutritionalProgress(
  actual: DailyNutritionTotals,
  goals?: NutritionalGoals,
): NutritionalProgress {
  const percentages = {
    calories: goals?.dailyCalories
      ? (actual.calories / goals.dailyCalories) * 100
      : 0,
    protein: goals?.dailyProtein
      ? (actual.protein / goals.dailyProtein) * 100
      : 0,
    carbs: goals?.dailyCarbs ? (actual.carbs / goals.dailyCarbs) * 100 : 0,
    fat: goals?.dailyFat ? (actual.fat / goals.dailyFat) * 100 : 0,
    fiber: goals?.dailyFiber ? (actual.fiber / goals.dailyFiber) * 100 : 0,
  };

  // Determine overall status
  let status: "under" | "on-track" | "over";
  if (!goals || !goals.dailyCalories) {
    status = "on-track";
  } else {
    const caloriePercentage = percentages.calories;
    if (caloriePercentage < 85) {
      status = "under";
    } else if (caloriePercentage > 115) {
      status = "over";
    } else {
      status = "on-track";
    }
  }

  return {
    actual,
    goals,
    percentages,
    status,
  };
}

/**
 * Generate chart data for macronutrient pie chart
 *
 * @param macros - Macronutrient breakdown
 * @returns Chart data points
 */
export function generateMacroChartData(
  macros: MacronutrientBreakdown,
): NutritionalChart {
  return {
    type: "pie",
    title: "Macronutrient Distribution",
    unit: "%",
    legend: true,
    data: [
      {
        label: "Protein",
        value: macros.proteinPercentage,
        color: "#ef4444",
        metadata: { grams: macros.protein },
      },
      {
        label: "Carbs",
        value: macros.carbsPercentage,
        color: "#3b82f6",
        metadata: { grams: macros.carbs },
      },
      {
        label: "Fat",
        value: macros.fatPercentage,
        color: "#eab308",
        metadata: { grams: macros.fat },
      },
    ],
  };
}

/**
 * Generate chart data for elemental balance radar chart
 *
 * @param elemental - Elemental properties
 * @returns Chart data points
 */
export function generateElementalChartData(
  elemental: ElementalProperties,
): NutritionalChart {
  return {
    type: "radar",
    title: "Elemental Balance",
    legend: false,
    data: [
      {
        label: "Fire",
        value: elemental.Fire,
        color: "#f97316",
      },
      {
        label: "Water",
        value: elemental.Water,
        color: "#06b6d4",
      },
      {
        label: "Earth",
        value: elemental.Earth,
        color: "#84cc16",
      },
      {
        label: "Air",
        value: elemental.Air,
        color: "#8b5cf6",
      },
    ],
  };
}

/**
 * Generate chart data for daily calories bar chart
 *
 * @param dailyBreakdown - Daily nutrition totals by day of week
 * @returns Chart data points
 */
export function generateDailyCaloriesChartData(
  dailyBreakdown: Record<DayOfWeek, DailyNutritionTotals>,
): NutritionalChart {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return {
    type: "bar",
    title: "Daily Calories",
    unit: "kcal",
    legend: false,
    data: ([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => ({
      label: dayNames[day],
      value: dailyBreakdown[day]?.calories || 0,
      color: "#8b5cf6",
    })),
  };
}

/**
 * Generate chart data for Greg's Energy trend line chart
 *
 * @param dailyBreakdown - Daily nutrition totals by day of week
 * @returns Chart data points
 */
export function generateGregsEnergyChartData(
  dailyBreakdown: Record<DayOfWeek, DailyNutritionTotals>,
): NutritionalChart {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return {
    type: "line",
    title: "Greg's Energy Trend",
    legend: false,
    data: ([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => ({
      label: dayNames[day],
      value: dailyBreakdown[day]?.gregsEnergy || 0,
      color: "#ec4899",
    })),
  };
}

/**
 * Get nutritional insights and recommendations
 *
 * @param weekly - Weekly nutrition totals
 * @param goals - Nutritional goals (optional)
 * @returns Array of insight strings
 */
export function getNutritionalInsights(
  weekly: WeeklyNutritionTotals,
  goals?: NutritionalGoals,
): string[] {
  const insights: string[] = [];

  // Average daily calories
  const avgDailyCalories = weekly.totalCalories / 7;
  insights.push(`Average daily calories: ${Math.round(avgDailyCalories)} kcal`);

  // Macronutrient balance
  const macros = calculateMacroBreakdown(
    weekly.totalProtein / 7,
    weekly.totalCarbs / 7,
    weekly.totalFat / 7,
  );

  if (macros.proteinPercentage < 15) {
    insights.push(
      "⚠️ Protein intake is low. Consider adding more protein-rich foods.",
    );
  } else if (macros.proteinPercentage > 35) {
    insights.push("ℹ️ Protein intake is high. Ensure adequate hydration.");
  }

  if (macros.carbsPercentage < 30) {
    insights.push(
      "⚠️ Carbohydrate intake is low. Consider adding more whole grains and fruits.",
    );
  }

  if (macros.fatPercentage < 20) {
    insights.push(
      "⚠️ Fat intake is low. Include healthy fats like nuts, avocado, and olive oil.",
    );
  } else if (macros.fatPercentage > 40) {
    insights.push(
      "ℹ️ Fat intake is high. Balance with more vegetables and lean proteins.",
    );
  }

  // Greg's Energy analysis
  if (weekly.averageGregsEnergy > 0.5) {
    insights.push(
      "✨ High Greg's Energy! Your meals are thermodynamically energizing.",
    );
  } else if (weekly.averageGregsEnergy < -0.5) {
    insights.push(
      "💤 Low Greg's Energy. Consider more Fire-element foods for vitality.",
    );
  }

  // Elemental balance
  const { Fire, Water, Earth, Air } = weekly.weeklyElementalBalance;
  const elements = [
    { name: "Fire", value: Fire },
    { name: "Water", value: Water },
    { name: "Earth", value: Earth },
    { name: "Air", value: Air },
  ];
  const dominant = elements.reduce((max, el) =>
    el.value > max.value ? el : max,
  );

  insights.push(
    `🔮 Dominant element: ${dominant.name} (${(dominant.value * 100).toFixed(0)}%)`,
  );

  // Goal progress (if goals provided)
  if (goals?.dailyCalories) {
    const avgProgress = (avgDailyCalories / goals.dailyCalories) * 100;
    if (avgProgress < 85) {
      insights.push(
        `📉 Below calorie target by ${Math.round(100 - avgProgress)}%`,
      );
    } else if (avgProgress > 115) {
      insights.push(
        `📈 Above calorie target by ${Math.round(avgProgress - 100)}%`,
      );
    } else {
      insights.push("✅ Calorie intake is on track with your goals!");
    }
  }

  return insights;
}

/**
 * Default export with all calculator functions
 */
export default {
  calculateDailyTotals,
  calculateWeeklyTotals,
  calculateAlchemicalMetrics,
  calculateMacroBreakdown,
  calculateNutritionalProgress,
  generateMacroChartData,
  generateElementalChartData,
  generateDailyCaloriesChartData,
  generateGregsEnergyChartData,
  getNutritionalInsights,
};
