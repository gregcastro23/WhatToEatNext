/**
 * Day Circuit Calculations
 *
 * Calculates aggregate circuit metrics for all 4 meals in a day (series connection).
 * Treats the day as a temporal power circuit with meals in sequence.
 *
 * @file src/utils/dayCircuitCalculations.ts
 * @created 2026-01-11
 */

import type { MealSlot, DayOfWeek } from "@/types/menuPlanner";
import type {
  DayCircuitMetrics,
  MealCircuitMetrics,
  KineticMetrics,
} from "@/types/kinetics";
import type { PlanetaryPositions } from "@/types/astrology";
import type { Element } from "@/types/celestial";
import { calculateMealCircuit } from "./mealCircuitCalculations";
import { PLANETARY_DAY_RULERS } from "@/types/menuPlanner";

/**
 * Helper to sum array of numbers safely
 */
function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + (isNaN(n) ? 0 : n), 0);
}

/**
 * Helper to calculate mean of array safely
 */
function mean(numbers: number[]): number {
  const validNumbers = numbers.filter((n) => !isNaN(n) && isFinite(n));
  if (validNumbers.length === 0) return 0;
  return sum(validNumbers) / validNumbers.length;
}

/**
 * Aggregate elemental vectors (momentum, force) across meals
 */
function aggregateElementalVectors(
  vectors: (Record<Element, number> | undefined)[]
): Record<Element, number> {
  const result: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  for (const vector of vectors) {
    if (!vector) continue;
    result.Fire += vector.Fire || 0;
    result.Water += vector.Water || 0;
    result.Earth += vector.Earth || 0;
    result.Air += vector.Air || 0;
  }

  return result;
}

/**
 * Calculate planetary harmony score for a day
 * Higher score = meals align with day's planetary ruler
 */
function calculatePlanetaryHarmony(
  meals: MealSlot[],
  dayOfWeek: DayOfWeek
): number {
  const dominantPlanet = PLANETARY_DAY_RULERS[dayOfWeek];
  let harmonyScore = 0;
  let totalMeals = 0;

  for (const meal of meals) {
    if (!meal.recipe) continue;
    totalMeals++;

    // Check if meal's planetary snapshot matches day's ruler
    if (meal.planetarySnapshot.dominantPlanet === dominantPlanet) {
      harmonyScore += 1;
    }

    // Partial credit for zodiac element alignment
    // (This is a simplification - could be more sophisticated)
    const mealElements = meal.recipe.elementalProperties;
    if (mealElements) {
      // Fire signs (Aries, Leo, Sagittarius) align with Fire element
      // Earth signs (Taurus, Virgo, Capricorn) align with Earth element
      // Air signs (Gemini, Libra, Aquarius) align with Air element
      // Water signs (Cancer, Scorpio, Pisces) align with Water element
      harmonyScore += 0.1; // Small bonus for having elemental data
    }
  }

  return totalMeals > 0 ? harmonyScore / totalMeals : 0;
}

/**
 * Calculate circuit metrics for all 4 meals in a day
 *
 * Models the day as a series electrical circuit:
 * - Breakfast → Lunch → Dinner → Snack (temporal sequence)
 * - Series connection: Resistances add (R_total = R₁ + R₂ + R₃ + R₄)
 * - Current averages across all meals
 * - Voltages add up
 *
 * @param meals - Array of meal slots for the day (up to 4: breakfast, lunch, dinner, snack)
 * @param dayOfWeek - Day of the week (0=Sunday, 6=Saturday)
 * @param planetaryPositions - Current planetary positions
 * @returns Day circuit metrics with aggregate properties
 */
export function calculateDayCircuit(
  meals: MealSlot[],
  dayOfWeek: DayOfWeek,
  planetaryPositions?: PlanetaryPositions
): DayCircuitMetrics {
  // Calculate individual meal circuits
  const breakfastMeal = meals.find((m) => m.mealType === "breakfast");
  const lunchMeal = meals.find((m) => m.mealType === "lunch");
  const dinnerMeal = meals.find((m) => m.mealType === "dinner");
  const snackMeal = meals.find((m) => m.mealType === "snack");

  const mealCircuits = {
    breakfast: breakfastMeal
      ? calculateMealCircuit(breakfastMeal, planetaryPositions)
      : null,
    lunch: lunchMeal ? calculateMealCircuit(lunchMeal, planetaryPositions) : null,
    dinner: dinnerMeal
      ? calculateMealCircuit(dinnerMeal, planetaryPositions)
      : null,
    snack: snackMeal ? calculateMealCircuit(snackMeal, planetaryPositions) : null,
  };

  // Extract valid circuits (non-null)
  const validCircuits = Object.values(mealCircuits).filter(
    (c): c is MealCircuitMetrics => c !== null
  );

  // Series connection aggregation
  const totalCharge = sum(validCircuits.map((c) => c.charge));
  const totalResistance = sum(validCircuits.map((c) => c.resistance));
  const averageCurrent =
    validCircuits.length > 0
      ? mean(validCircuits.map((c) => c.currentFlow))
      : 0;
  const totalVoltage = sum(validCircuits.map((c) => c.potentialDifference));
  const totalPower = sum(validCircuits.map((c) => c.power));
  const totalLosses = sum(validCircuits.map((c) => c.powerLosses));
  const dayEfficiency =
    totalPower > 0 ? (totalPower - totalLosses) / totalPower : 0;

  // Energy balance
  const inputEnergy = totalPower;
  const outputEnergy = totalPower - totalLosses;
  const netEnergy = totalLosses; // Net energy lost to resistance

  // Kinetic aggregation
  const netMomentum = aggregateElementalVectors(
    validCircuits.map((c) => c.kinetics.momentum)
  );
  const netForce = aggregateElementalVectors(
    validCircuits.map((c) => c.kinetics.force)
  );

  // Thermal balance classification
  const heatingMeals = validCircuits.filter(
    (c) => c.kinetics.thermalDirection === "heating"
  ).length;
  const coolingMeals = validCircuits.filter(
    (c) => c.kinetics.thermalDirection === "cooling"
  ).length;
  const thermalBalance: "heating" | "cooling" | "stable" =
    heatingMeals > coolingMeals
      ? "heating"
      : coolingMeals > heatingMeals
        ? "cooling"
        : "stable";

  // Planetary influence
  const dominantPlanet = PLANETARY_DAY_RULERS[dayOfWeek];
  const planetaryHarmony = calculatePlanetaryHarmony(meals, dayOfWeek);

  // Power balance validation (KCL/KVL)
  // For series circuit: P_total should equal sum of individual powers
  // Allow 5% tolerance for floating point errors
  const expectedPower = averageCurrent * totalVoltage;
  const actualPower = totalPower;
  const balanceDeviation =
    expectedPower > 0 ? Math.abs(expectedPower - actualPower) / expectedPower : 0;
  const isPowerBalanced = balanceDeviation < 0.05; // 5% tolerance

  // Get date from first meal or use current date
  const date = meals[0]?.planetarySnapshot.timestamp || new Date();

  return {
    // Identity
    dayOfWeek,
    date,

    // Meal circuits
    meals: mealCircuits,

    // Series connection properties
    totalCharge,
    totalResistance,
    averageCurrent,
    totalVoltage,
    totalPower,
    totalLosses,
    dayEfficiency: Math.max(0, Math.min(1, dayEfficiency)), // Clamp to 0-1

    // Energy balance
    inputEnergy,
    outputEnergy,
    netEnergy,

    // Kinetic aggregate
    netMomentum,
    netForce,
    thermalBalance,

    // Planetary influence
    dominantPlanet,
    planetaryHarmony,

    // Validation
    isPowerBalanced,
    balanceDeviation,

    calculatedAt: new Date(),
  };
}

/**
 * Get meals for a specific day from a list of meal slots
 */
export function getMealsForDay(
  allMeals: MealSlot[],
  dayOfWeek: DayOfWeek
): MealSlot[] {
  return allMeals.filter((meal) => meal.dayOfWeek === dayOfWeek);
}

/**
 * Calculate circuit metrics for all 7 days
 *
 * @param allMeals - All meal slots in the weekly menu
 * @param planetaryPositions - Current planetary positions
 * @returns Map of DayOfWeek to DayCircuitMetrics
 */
export function calculateAllDayCircuits(
  allMeals: MealSlot[],
  planetaryPositions?: PlanetaryPositions
): Record<DayOfWeek, DayCircuitMetrics> {
  const dayCircuits: Record<DayOfWeek, DayCircuitMetrics> = {} as any;

  for (let day = 0; day < 7; day++) {
    const dayOfWeek = day as DayOfWeek;
    const dayMeals = getMealsForDay(allMeals, dayOfWeek);
    dayCircuits[dayOfWeek] = calculateDayCircuit(
      dayMeals,
      dayOfWeek,
      planetaryPositions
    );
  }

  return dayCircuits;
}

/**
 * Get day circuit health classification
 */
export function getDayCircuitHealth(efficiency: number): {
  classification: "excellent" | "good" | "moderate" | "poor";
  color: "green" | "yellow" | "orange" | "red";
  description: string;
} {
  if (efficiency >= 0.75) {
    return {
      classification: "excellent",
      color: "green",
      description: "Highly balanced day with efficient power flow",
    };
  } else if (efficiency >= 0.6) {
    return {
      classification: "good",
      color: "yellow",
      description: "Well-balanced day with acceptable losses",
    };
  } else if (efficiency >= 0.4) {
    return {
      classification: "moderate",
      color: "orange",
      description: "Moderate efficiency, room for optimization",
    };
  } else {
    return {
      classification: "poor",
      color: "red",
      description: "Low efficiency, significant improvements recommended",
    };
  }
}
