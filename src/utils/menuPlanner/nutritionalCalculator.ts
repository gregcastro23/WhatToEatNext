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
  ChartDataPoint as _ChartDataPoint,
  NutritionalChart,
} from "@/types/menuPlanner";
import type { NutritionCoverage, PlannerNutrientCoverage } from "@/types/nutrition";
import type { ElementalProperties, EnhancedRecipe } from "@/types/recipe";
import { createLogger } from "@/utils/logger";
import {
  coverageNote,
  coverageOf,
  formatCoveredTotal,
  NO_MEALS,
  NO_NUTRIENT_COVERAGE,
  NOT_STATED,
  nutrientCoverageOf,
  publishesCalories,
  statedBy,
  sumCoverage,
  sumNutrientCoverage,
  type StatedNutrients,
} from "./nutritionCoverage";

const logger = createLogger("NutritionalCalculator");

/**
 * Nutrition shapes read off meal payloads. `nutritionPerServing` is carried by
 * newer AlchemicalRecipe-format payloads and is not declared on EnhancedRecipe.
 * NutritionalProfileLike widens the declared recipe/sauce profile shapes with
 * the sodium/sugar fields this calculator reads — neither EnhancedRecipe's nor
 * MealSlotSauce's nutritionalProfile declares them today, so those reads fall
 * back to 0 via `|| 0` when the payload doesn't carry them.
 */
interface NutritionPerServingLike {
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sodiumMg?: number;
  sugarG?: number;
}
interface NutritionalProfileLike {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
}

/** The macros one serving of a planned recipe contributes to a day. */
interface MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  /** Absent where the recipe does not state it: absent is not 0. */
  sodium?: number;
  sugar?: number;
}

type PlannedRecipe = EnhancedRecipe & { nutritionPerServing?: NutritionPerServingLike };

/** Only what a recipe states: an absent sodium or sugar stays a missing key. */
function statedSodiumSugar(sodium: number | undefined, sugar: number | undefined): { sodium?: number; sugar?: number } {
  return {
    ...(sodium === undefined ? {} : { sodium }),
    ...(sugar === undefined ? {} : { sugar }),
  };
}

function macrosFromProfile(p: NutritionalProfileLike & { calories: number }): MealMacros {
  return {
    calories: p.calories,
    protein: p.protein ?? 0,
    carbs: p.carbs ?? 0,
    fat: p.fat ?? 0,
    fiber: p.fiber ?? 0,
    ...statedSodiumSugar(p.sodium, p.sugar),
  };
}

function macrosFromPerServing(p: NutritionPerServingLike & { calories: number }): MealMacros {
  return {
    calories: p.calories,
    protein: p.proteinG ?? 0,
    carbs: p.carbsG ?? 0,
    fat: p.fatG ?? 0,
    fiber: p.fiberG ?? 0,
    ...statedSodiumSugar(p.sodiumMg, p.sugarG),
  };
}

/**
 * What one serving of a planned recipe contributes, or null when it publishes
 * no calories: that meal is absent from the total, not 0 kcal. `nutrition` is
 * the field the recipe catalog and every stored menu carry (no static recipe
 * carries the two older shapes, so the day totals here used to read 0 kcal).
 */
export function plannedRecipeNutrition(recipe: PlannedRecipe): MealMacros | null {
  const { nutrition, nutritionPerServing, nutritionalProfile } = recipe;
  if (publishesCalories(nutrition)) return macrosFromProfile(nutrition);
  if (publishesCalories(nutritionPerServing)) return macrosFromPerServing(nutritionPerServing);
  if (publishesCalories(nutritionalProfile)) return macrosFromProfile(nutritionalProfile);
  return null;
}

/**
 * Default empty daily nutrition totals
 */
export const EMPTY_DAILY_TOTALS: DailyNutritionTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sodium: 0,
  sugar: 0,
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
 * @returns Daily nutrition totals. They sum only the meals with nutrition; use
 *   `calculateDayTotals` for the coverage that says how many that is.
 */
export function calculateDailyTotals(meals: MealSlot[]): DailyNutritionTotals {
  return calculateDayTotals(meals).totals;
}

/** A day's totals and how many of its planned meals entered them. */
export function calculateDayTotals(meals: MealSlot[]): {
  totals: DailyNutritionTotals;
  coverage: NutritionCoverage;
  /** `totals.sodium` and `totals.sugar` are lower bounds where a meal does not state them. */
  nutrientCoverage: PlannerNutrientCoverage;
} {
  if (meals.length === 0) {
    return { totals: { ...EMPTY_DAILY_TOTALS }, coverage: NO_MEALS, nutrientCoverage: NO_NUTRIENT_COVERAGE };
  }
  const entered: boolean[] = [];
  const stated: StatedNutrients[] = [];

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSodium = 0;
  let totalSugar = 0;
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

    const { recipe } = meal;

    // Safe check for ingredients and instructions
    if (
      !recipe.ingredients ||
      recipe.ingredients.length === 0 ||
      !recipe.instructions ||
      recipe.instructions.length === 0
    ) {
      logger.warn(
        `Recipe ${recipe.id} is incomplete (missing ingredients or instructions). Skipping nutrition calculation.`,
      );
      entered.push(false);
      stated.push(NOT_STATED);
      return; // Skip nutrition calculation for incomplete recipes
    }
    const servings = meal.servings || 1;

    const nutrition = plannedRecipeNutrition(recipe);
    entered.push(nutrition !== null);
    const sauceProfile: NutritionalProfileLike | undefined = meal.sauce?.nutritionalProfile;
    stated.push(statedBy(nutrition, sauceProfile));
    if (nutrition) {
      totalCalories += nutrition.calories * servings;
      totalProtein += nutrition.protein * servings;
      totalCarbs += nutrition.carbs * servings;
      totalFat += nutrition.fat * servings;
      totalFiber += nutrition.fiber * servings;
      totalSodium += (nutrition.sodium ?? 0) * servings;
      totalSugar += (nutrition.sugar ?? 0) * servings;
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
      // EnhancedRecipe declares only the thermodynamic snapshot
      // (heat/entropy/reactivity/stability); runtime payloads may carry ESMS
      // directly — the ?? remapping below handles both, preserved exactly.
      const ap = recipe.alchemicalProperties as {
        Spirit?: number;
        Essence?: number;
        Matter?: number;
        Substance?: number;
        heat?: number;
        entropy?: number;
        reactivity?: number;
        stability?: number;
      };
      const mappedAlchemicalProps: AlchemicalProperties = {
        Spirit: ap.Spirit ?? ap.reactivity ?? 0,
        Essence: ap.Essence ?? ap.entropy ?? 0,
        Matter: ap.Matter ?? ap.heat ?? 0,
        Substance: ap.Substance ?? ap.stability ?? 0,
      };
      alchemicalAccumulator.Spirit += mappedAlchemicalProps.Spirit * servings;
      alchemicalAccumulator.Essence += mappedAlchemicalProps.Essence * servings;
      alchemicalAccumulator.Matter += mappedAlchemicalProps.Matter * servings;
      alchemicalAccumulator.Substance +=
        mappedAlchemicalProps.Substance * servings;
    }

    // Sauce nutrition (adds to meal totals)
    if (meal.sauce?.nutritionalProfile) {
      const sauceServings = meal.sauce.servings || 1;
      const sauceNutrition = meal.sauce.nutritionalProfile as NutritionalProfileLike;
      totalCalories += (sauceNutrition.calories ?? 0) * sauceServings;
      totalProtein += (sauceNutrition.protein ?? 0) * sauceServings;
      totalCarbs += (sauceNutrition.carbs ?? 0) * sauceServings;
      totalFat += (sauceNutrition.fat ?? 0) * sauceServings;
      totalFiber += (sauceNutrition.fiber ?? 0) * sauceServings;
      totalSodium += (sauceNutrition.sodium ?? 0) * sauceServings;
      totalSugar += (sauceNutrition.sugar ?? 0) * sauceServings;
    }

    // Sauce elemental properties
    if (meal.sauce?.elementalProperties) {
      const sauceServings = meal.sauce.servings || 1;
      elementalAccumulator.Fire +=
        meal.sauce.elementalProperties.Fire * sauceServings;
      elementalAccumulator.Water +=
        meal.sauce.elementalProperties.Water * sauceServings;
      elementalAccumulator.Earth +=
        meal.sauce.elementalProperties.Earth * sauceServings;
      elementalAccumulator.Air +=
        meal.sauce.elementalProperties.Air * sauceServings;
    }
  });

  // Normalize elemental properties (average across meals)
  const mealCount = meals.filter((m) => m.recipe ?? m.sauce).length;
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

  const totals: DailyNutritionTotals = {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    fiber: totalFiber,
    sodium: totalSodium,
    sugar: totalSugar,
    gregsEnergy: alchemicalMetrics.gregsEnergy,
    monicaConstant: alchemicalMetrics.monica,
    kalchm: alchemicalMetrics.kalchm,
    elementalBalance: elementalAccumulator,
  };
  return { totals, coverage: coverageOf(entered), nutrientCoverage: nutrientCoverageOf(stated) };
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
  // Filled for all 7 days by the loop below before it is ever read.
  const dailyBreakdown = {} as Record<DayOfWeek, DailyNutritionTotals>;
  const dailyCoverage: Record<DayOfWeek, NutritionCoverage> = {
    0: NO_MEALS, 1: NO_MEALS, 2: NO_MEALS, 3: NO_MEALS, 4: NO_MEALS, 5: NO_MEALS, 6: NO_MEALS,
  };
  const dailyNutrientCoverage: PlannerNutrientCoverage[] = [];

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSodium = 0;
  let totalSugar = 0;
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
    const { totals: dailyTotal, coverage, nutrientCoverage } = calculateDayTotals(meals);
    dailyBreakdown[day] = dailyTotal;
    dailyCoverage[day] = coverage;
    dailyNutrientCoverage.push(nutrientCoverage);

    if (meals.filter((m) => m.recipe).length > 0) {
      totalCalories += dailyTotal.calories;
      totalProtein += dailyTotal.protein;
      totalCarbs += dailyTotal.carbs;
      totalFat += dailyTotal.fat;
      totalFiber += dailyTotal.fiber;
      totalSodium += dailyTotal.sodium;
      totalSugar += dailyTotal.sugar;
      gregsEnergySum += dailyTotal.gregsEnergy;
      if (typeof dailyTotal.monicaConstant === "number") {
        monicaSum += dailyTotal.monicaConstant;
      }
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
    totalSodium,
    totalSugar,
    averageGregsEnergy: daysWithMeals > 0 ? gregsEnergySum / daysWithMeals : 0,
    averageMonica: daysWithMeals > 0 ? monicaSum / daysWithMeals : 0,
    averageKalchm: daysWithMeals > 0 ? kalchmSum / daysWithMeals : 1.0,
    weeklyElementalBalance: weeklyElemental,
    dailyBreakdown,
    coverage: sumCoverage(Object.values(dailyCoverage)),
    dailyCoverage,
    nutrientCoverage: sumNutrientCoverage(dailyNutrientCoverage),
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
  const thermodynamicInputs = {
    Spirit,
    Substance,
    Essence,
    Matter,
    Fire,
    Water,
    Air,
    Earth,
  };

  const heat = calculateHeat(thermodynamicInputs);

  const entropy = calculateEntropy(thermodynamicInputs);

  const reactivity = calculateReactivity(thermodynamicInputs);

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
  if (!goals?.dailyCalories) {
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
    ...(goals !== undefined ? { goals } : {}),
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
  dailyCoverage: Record<DayOfWeek, NutritionCoverage>,
): NutritionalChart {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];

  return {
    type: "bar",
    title: "Daily Calories",
    unit: "kcal",
    legend: false,
    data: days.map((day) => {
      const value = dailyBreakdown[day]?.calories || 0;
      const note = coverageNote(dailyCoverage[day]);
      const name = dayNames[day] ?? "";
      return {
        label: note ? `${name} (${note})` : name,
        value,
        display: formatCoveredTotal(value, dailyCoverage[day], " kcal"),
        color: "#8b5cf6",
      };
    }),
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
      label: dayNames[day] ?? "",
      value: dailyBreakdown[day]?.gregsEnergy || 0,
      color: "#ec4899",
    })),
  };
}

/**
 * Macro-balance insights. None when no planned meal publishes protein, carbs
 * or fat: with no macro energy there is no split to judge, and 0% protein is
 * not "low protein".
 */
function macroInsights(weekly: WeeklyNutritionTotals): string[] {
  if (weekly.totalProtein + weekly.totalCarbs + weekly.totalFat <= 0) return [];
  const macros = calculateMacroBreakdown(
    weekly.totalProtein / 7,
    weekly.totalCarbs / 7,
    weekly.totalFat / 7,
  );
  const insights: string[] = [];

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
  return insights;
}

function gregsEnergyInsights(averageGregsEnergy: number): string[] {
  if (averageGregsEnergy > 0.5) {
    return ["✨ High Greg's Energy! Your meals are thermodynamically energizing."];
  }
  if (averageGregsEnergy < -0.5) {
    return ["💤 Low Greg's Energy. Consider more Fire-element foods for vitality."];
  }
  return [];
}

/** The largest elemental share; none when no planned recipe carries one. */
function dominantElementInsights(balance: ElementalProperties): string[] {
  const elements = [
    { name: "Fire", value: balance.Fire },
    { name: "Water", value: balance.Water },
    { name: "Earth", value: balance.Earth },
    { name: "Air", value: balance.Air },
  ];
  const dominant = elements.reduce((max, el) =>
    el.value > max.value ? el : max,
  );
  if (dominant.value <= 0) return [];
  return [
    `🔮 Dominant element: ${dominant.name} (${(dominant.value * 100).toFixed(0)}%)`,
  ];
}

function calorieGoalInsights(
  avgDailyCalories: number,
  goals?: NutritionalGoals,
): string[] {
  if (!goals?.dailyCalories) return [];
  const avgProgress = (avgDailyCalories / goals.dailyCalories) * 100;
  if (avgProgress < 85) {
    return [`📉 Below calorie target by ${Math.round(100 - avgProgress)}%`];
  }
  if (avgProgress > 115) {
    return [`📈 Above calorie target by ${Math.round(avgProgress - 100)}%`];
  }
  return ["✅ Calorie intake is on track with your goals!"];
}

/**
 * Get nutritional insights and recommendations
 *
 * The daily average is a lower bound ("≥…") when some planned meals publish
 * no nutrition, like every other total drawn from the week.
 *
 * @param weekly - Weekly nutrition totals
 * @param goals - Nutritional goals (optional)
 * @returns Array of insight strings
 */
export function getNutritionalInsights(
  weekly: WeeklyNutritionTotals,
  goals?: NutritionalGoals,
): string[] {
  const avgDailyCalories = weekly.totalCalories / 7;
  return [
    `Average daily calories: ${formatCoveredTotal(avgDailyCalories, weekly.coverage, " kcal")}`,
    ...macroInsights(weekly),
    ...gregsEnergyInsights(weekly.averageGregsEnergy),
    ...dominantElementInsights(weekly.weeklyElementalBalance),
    ...calorieGoalInsights(avgDailyCalories, goals),
  ];
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
