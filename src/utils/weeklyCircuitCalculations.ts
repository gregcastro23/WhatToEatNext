/**
 * Weekly Circuit Calculations
 *
 * Calculates complete weekly menu circuit network metrics.
 * Treats the 28 meal slots (7 days × 4 meals) as an interconnected circuit network.
 *
 * @file src/utils/weeklyCircuitCalculations.ts
 * @created 2026-01-11
 */

import type { WeeklyMenu, DayOfWeek } from "@/types/menuPlanner";
import type {
  WeeklyMenuCircuitMetrics,
  DayCircuitMetrics,
  CircuitBottleneck,
  CircuitImprovementSuggestion,
} from "@/types/kinetics";
import type { PlanetaryPositions } from "@/types/astrology";
import type { Element } from "@/types/celestial";
import {
  calculateAllDayCircuits,
  getMealsForDay,
} from "./dayCircuitCalculations";
import { getWeekEndDate } from "@/types/menuPlanner";

/**
 * Helper to sum array of numbers safely
 */
function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + (isNaN(n) ? 0 : n), 0);
}

/**
 * Aggregate elemental vectors across all days
 */
function aggregateWeeklyElements(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
): Record<Element, number> {
  const result: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  for (const day of Object.values(dayCircuits)) {
    result.Fire += day.netMomentum.Fire || 0;
    result.Water += day.netMomentum.Water || 0;
    result.Earth += day.netMomentum.Earth || 0;
    result.Air += day.netMomentum.Air || 0;
  }

  return result;
}

/**
 * Calculate elemental harmony score
 * Higher score = more balanced elemental distribution
 */
function calculateElementalHarmony(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
): number {
  const weekly = aggregateWeeklyElements(dayCircuits);

  // Calculate total
  const total = weekly.Fire + weekly.Water + weekly.Earth + weekly.Air;
  if (total === 0) return 0;

  // Calculate ideal (25% each element)
  const ideal = total / 4;

  // Calculate deviation from ideal
  const deviations = [
    Math.abs(weekly.Fire - ideal),
    Math.abs(weekly.Water - ideal),
    Math.abs(weekly.Earth - ideal),
    Math.abs(weekly.Air - ideal),
  ];

  const maxDeviation = ideal; // Maximum possible deviation
  const avgDeviation = sum(deviations) / 4;

  // Convert to 0-1 score (lower deviation = higher harmony)
  const harmonyScore = 1 - avgDeviation / maxDeviation;

  return Math.max(0, Math.min(1, harmonyScore));
}

/**
 * Aggregate weekly momentum
 */
function aggregateWeeklyMomentum(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
): Record<Element, number> {
  return aggregateWeeklyElements(dayCircuits);
}

/**
 * Aggregate weekly force
 */
function aggregateWeeklyForce(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
): Record<Element, number> {
  const result: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  for (const day of Object.values(dayCircuits)) {
    result.Fire += day.netForce.Fire || 0;
    result.Water += day.netForce.Water || 0;
    result.Earth += day.netForce.Earth || 0;
    result.Air += day.netForce.Air || 0;
  }

  return result;
}

/**
 * Determine weekly thermal direction
 */
function aggregateThermalDirection(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
): "heating" | "cooling" | "stable" {
  const thermalCounts = {
    heating: 0,
    cooling: 0,
    stable: 0,
  };

  for (const day of Object.values(dayCircuits)) {
    thermalCounts[day.thermalBalance]++;
  }

  if (thermalCounts.heating > thermalCounts.cooling) {
    return "heating";
  } else if (thermalCounts.cooling > thermalCounts.heating) {
    return "cooling";
  } else {
    return "stable";
  }
}

/**
 * Calculate network complexity metric
 * Higher = more interconnected/complex meal patterns
 */
function calculateNetworkComplexity(currentMenu: WeeklyMenu): number {
  const filledSlots = currentMenu.meals.filter((m) => m.recipe).length;
  const totalSlots = 28; // 7 days × 4 meals

  // Complexity increases with number of filled slots
  // and variety of recipes
  const fillRatio = filledSlots / totalSlots;

  const uniqueRecipes = new Set(
    currentMenu.meals.filter((m) => m.recipe).map((m) => m.recipe!.id),
  ).size;

  const varietyScore = filledSlots > 0 ? uniqueRecipes / filledSlots : 0;

  // Combine fill ratio and variety
  return (fillRatio + varietyScore) / 2;
}

/**
 * Validate Kirchhoff's Circuit Laws for the weekly menu
 *
 * KCL (Current Law): Sum of currents at a node = 0
 * KVL (Voltage Law): Sum of voltages in a loop = 0
 */
function validateWeeklyCircuitLaws(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
): {
  isValid: boolean;
  kclViolations: number;
  kvlViolations: number;
} {
  let kclViolations = 0;
  let kvlViolations = 0;

  // Check each day for power balance (simplified KCL/KVL)
  for (const day of Object.values(dayCircuits)) {
    if (!day.isPowerBalanced) {
      if (day.balanceDeviation > 0.1) {
        // >10% deviation
        kclViolations++;
      }
    }
  }

  // For a complete week, check if total input = total output + losses
  const totalInput = sum(Object.values(dayCircuits).map((d) => d.inputEnergy));
  const totalOutput = sum(
    Object.values(dayCircuits).map((d) => d.outputEnergy),
  );
  const totalLosses = sum(Object.values(dayCircuits).map((d) => d.totalLosses));

  const expectedOutput = totalInput - totalLosses;
  const weeklyDeviation =
    totalInput > 0 ? Math.abs(expectedOutput - totalOutput) / totalInput : 0;

  if (weeklyDeviation > 0.05) {
    // >5% deviation
    kvlViolations++;
  }

  const isValid = kclViolations === 0 && kvlViolations === 0;

  return { isValid, kclViolations, kvlViolations };
}

/**
 * Find circuit bottlenecks in the weekly menu
 * (Placeholder - full implementation in circuitOptimization.ts)
 */
function findWeeklyBottlenecks(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
  currentMenu: WeeklyMenu,
): CircuitBottleneck[] {
  const bottlenecks: CircuitBottleneck[] = [];

  // Find days with low efficiency
  for (const [dayKey, day] of Object.entries(dayCircuits)) {
    if (day.dayEfficiency < 0.6) {
      // Below 60%
      bottlenecks.push({
        mealSlotId: `day-${dayKey}`,
        reason: `Low daily efficiency (${(day.dayEfficiency * 100).toFixed(0)}%)`,
        impactScore: 1 - day.dayEfficiency,
      });
    }
  }

  // Find empty slots
  const emptySlots = currentMenu.meals.filter((m) => !m.recipe);
  for (const slot of emptySlots) {
    bottlenecks.push({
      mealSlotId: slot.id,
      reason: "Empty slot creates power flow discontinuity",
      impactScore: 0.5,
    });
  }

  return bottlenecks.sort((a, b) => b.impactScore - a.impactScore);
}

/**
 * Generate circuit improvement suggestions
 * (Placeholder - full implementation in circuitOptimization.ts)
 */
function generateWeeklySuggestions(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
  currentMenu: WeeklyMenu,
  planetaryPositions?: PlanetaryPositions,
): CircuitImprovementSuggestion[] {
  const suggestions: CircuitImprovementSuggestion[] = [];

  // Suggest filling empty slots
  const emptySlots = currentMenu.meals.filter((m) => !m.recipe);
  for (const slot of emptySlots.slice(0, 3)) {
    // Top 3 suggestions
    suggestions.push({
      type: "add_meal",
      targetSlotId: slot.id,
      expectedImprovement: 15,
      reason: "Fill empty slot to complete daily power circuit",
    });
  }

  return suggestions;
}

/**
 * Calculate complete weekly menu circuit metrics
 *
 * Analyzes all 28 meal slots as an interconnected circuit network:
 * - 7 days running in parallel
 * - Each day has 4 meals in series
 * - Power flow, efficiency, and balance across the week
 *
 * @param currentMenu - Complete weekly menu
 * @param planetaryPositions - Current planetary positions
 * @returns Weekly circuit metrics with optimization suggestions
 */
export function calculateWeeklyCircuit(
  currentMenu: WeeklyMenu,
  planetaryPositions?: PlanetaryPositions,
): WeeklyMenuCircuitMetrics {
  // 1. Calculate day circuits for all 7 days
  const dayCircuits = calculateAllDayCircuits(
    currentMenu.meals,
    planetaryPositions,
  );

  // 2. Weekly aggregates
  const totalWeekCharge = sum(
    Object.values(dayCircuits).map((d) => d.totalCharge),
  );
  const totalWeekPower = sum(
    Object.values(dayCircuits).map((d) => d.totalPower),
  );
  const totalWeekLosses = sum(
    Object.values(dayCircuits).map((d) => d.totalLosses),
  );
  const weekEfficiency =
    totalWeekPower > 0
      ? (totalWeekPower - totalWeekLosses) / totalWeekPower
      : 0;

  // 3. Power distribution analysis
  const breakfastPower = sum(
    Object.values(dayCircuits).map((d) => d.meals.breakfast?.power || 0),
  );
  const lunchPower = sum(
    Object.values(dayCircuits).map((d) => d.meals.lunch?.power || 0),
  );
  const dinnerPower = sum(
    Object.values(dayCircuits).map((d) => d.meals.dinner?.power || 0),
  );
  const snackPower = sum(
    Object.values(dayCircuits).map((d) => d.meals.snack?.power || 0),
  );
  const totalMealPower = breakfastPower + lunchPower + dinnerPower + snackPower;

  const powerDistribution = {
    morning: totalMealPower > 0 ? breakfastPower / totalMealPower : 0,
    midday: totalMealPower > 0 ? lunchPower / totalMealPower : 0,
    evening: totalMealPower > 0 ? dinnerPower / totalMealPower : 0,
    snacks: totalMealPower > 0 ? snackPower / totalMealPower : 0,
  };

  // 4. Elemental balance
  const weeklyElementalBalance = aggregateWeeklyElements(dayCircuits);
  const elementalHarmony = calculateElementalHarmony(dayCircuits);

  // 5. Kinetic summary
  const weeklyMomentum = aggregateWeeklyMomentum(dayCircuits);
  const weeklyForce = aggregateWeeklyForce(dayCircuits);
  const weeklyThermalDirection = aggregateThermalDirection(dayCircuits);

  // 6. Network topology
  const parallelDays = 7; // All days run in parallel
  const seriesDays = 0; // No strict series days (meals within day are series)
  const networkComplexity = calculateNetworkComplexity(currentMenu);

  // 7. Optimization analysis
  const bottlenecks = findWeeklyBottlenecks(dayCircuits, currentMenu);
  const improvementSuggestions = generateWeeklySuggestions(
    dayCircuits,
    currentMenu,
    planetaryPositions,
  );

  // 8. Validation
  const { isValid, kclViolations, kvlViolations } =
    validateWeeklyCircuitLaws(dayCircuits);

  return {
    // Identity
    weekStartDate: currentMenu.weekStartDate,
    weekEndDate: getWeekEndDate(currentMenu.weekStartDate),
    menuId: currentMenu.id,

    // Day circuits
    days: {
      sunday: dayCircuits[0],
      monday: dayCircuits[1],
      tuesday: dayCircuits[2],
      wednesday: dayCircuits[3],
      thursday: dayCircuits[4],
      friday: dayCircuits[5],
      saturday: dayCircuits[6],
    },

    // Weekly aggregates
    totalWeekCharge,
    totalWeekPower,
    totalWeekLosses,
    weekEfficiency: Math.max(0, Math.min(1, weekEfficiency)),

    // Network topology
    parallelDays,
    seriesDays,
    networkComplexity,

    // Power distribution
    powerDistribution,

    // Elemental balance
    weeklyElementalBalance,
    elementalHarmony,

    // Kinetic summary
    weeklyMomentum,
    weeklyForce,
    weeklyThermalDirection,

    // Optimization
    bottlenecks,
    improvementSuggestions,

    // Validation
    isFullyBalanced: isValid,
    weeklyKCLViolations: kclViolations,
    weeklyKVLViolations: kvlViolations,

    calculatedAt: new Date(),
  };
}

/**
 * Get weekly circuit health classification
 */
export function getWeeklyCircuitHealth(efficiency: number): {
  classification: "excellent" | "good" | "moderate" | "poor";
  color: "green" | "yellow" | "orange" | "red";
  description: string;
} {
  if (efficiency >= 0.75) {
    return {
      classification: "excellent",
      color: "green",
      description: "Highly optimized weekly menu with excellent power flow",
    };
  } else if (efficiency >= 0.6) {
    return {
      classification: "good",
      color: "yellow",
      description: "Well-balanced weekly menu with good efficiency",
    };
  } else if (efficiency >= 0.45) {
    return {
      classification: "moderate",
      color: "orange",
      description: "Moderate efficiency, optimization recommended",
    };
  } else {
    return {
      classification: "poor",
      color: "red",
      description: "Low efficiency, significant improvements needed",
    };
  }
}
