/**
 * Circuit Optimization Utilities
 *
 * Advanced bottleneck detection and improvement suggestions for circuit-optimized menus.
 * Analyzes power flow, efficiency, and balance to recommend optimal meal selections.
 *
 * @file src/utils/circuitOptimization.ts
 * @created 2026-01-11
 */

import type { PlanetaryPositions } from "@/types/astrology";
import type {
  DayCircuitMetrics,
  CircuitBottleneck,
  CircuitImprovementSuggestion,
  MealCircuitMetrics,
} from "@/types/kinetics";
import type { WeeklyMenu, MealSlot, DayOfWeek } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";

/**
 * Helper to calculate mean
 */
function mean(numbers: number[]): number {
  const valid = numbers.filter((n) => !isNaN(n) && isFinite(n));
  if (valid.length === 0) return 0;
  return valid.reduce((sum, n) => sum + n, 0) / valid.length;
}

/**
 * Find all circuit bottlenecks in the weekly menu
 *
 * Identifies meals that:
 * 1. Have high resistance (low efficiency)
 * 2. Have low power output
 * 3. Are missing (empty slots) - ONLY when actively planning (10+ meals) or disrupting flow
 * 4. Create elemental imbalance
 *
 * @param dayCircuits - Circuit metrics for all 7 days
 * @param currentMenu - Complete weekly menu
 * @returns Array of bottlenecks sorted by impact (highest first)
 */
export function findCircuitBottlenecks(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
  currentMenu: WeeklyMenu,
): CircuitBottleneck[] {
  const bottlenecks: CircuitBottleneck[] = [];

  // Calculate total filled meal count (for smart empty slot detection)
  const totalFilledMeals = currentMenu.meals.filter((m) => m.recipe).length;
  const isActivelyPlanning = totalFilledMeals >= 10; // User has planned at least 10 meals

  // Calculate average power across all meals
  const allMealPowers: number[] = [];
  for (const day of Object.values(dayCircuits)) {
    for (const meal of Object.values(day.meals)) {
      if (meal) {
        allMealPowers.push(meal.power);
      }
    }
  }
  const avgPower = mean(allMealPowers);

  // 1. Find high-resistance meals (low efficiency)
  for (const day of Object.values(dayCircuits)) {
    for (const mealKey of ["breakfast", "lunch", "dinner", "snack"] as const) {
      const meal = day.meals[mealKey];
      if (!meal) continue;

      if (meal.efficiency < 0.6) {
        // Below 60% efficiency
        bottlenecks.push({
          mealSlotId: meal.mealSlotId,
          reason: `High resistance (${meal.resistance.toFixed(2)}Ω) causing ${((1 - meal.efficiency) * 100).toFixed(0)}% power loss`,
          impactScore: 1 - meal.efficiency,
        });
      }
    }
  }

  // 2. Find low-power meals (not contributing much)
  for (const day of Object.values(dayCircuits)) {
    for (const mealKey of ["breakfast", "lunch", "dinner", "snack"] as const) {
      const meal = day.meals[mealKey];
      if (!meal) continue;

      if (avgPower > 0 && meal.power < avgPower * 0.3) {
        // Less than 30% of average
        bottlenecks.push({
          mealSlotId: meal.mealSlotId,
          reason: `Low power output (${meal.power.toFixed(1)}W) - consider more energetic recipe`,
          impactScore: (avgPower - meal.power) / avgPower,
        });
      }
    }
  }

  // 3. Find empty slots (power flow discontinuity) - SMART DETECTION
  // Only flag empty slots as bottlenecks when:
  // - User is actively planning (10+ meals filled), OR
  // - Empty slot disrupts flow (has adjacent filled meals on same day)
  if (isActivelyPlanning) {
    // User is actively planning - flag strategic empty slots
    for (const mealSlot of currentMenu.meals) {
      if (!mealSlot.recipe) {
        // Check if this empty slot disrupts flow on its day
        const dayMeals = currentMenu.meals.filter(
          (m) => m.dayOfWeek === mealSlot.dayOfWeek,
        );
        const hasAdjacentMeals = dayMeals.some(
          (m) => m.recipe && m.id !== mealSlot.id,
        );

        if (hasAdjacentMeals) {
          bottlenecks.push({
            mealSlotId: mealSlot.id,
            reason: `Empty ${mealSlot.mealType} slot disrupts ${getDayName(mealSlot.dayOfWeek)}'s power flow`,
            impactScore: 0.4,
          });
        }
      }
    }
  }
  // If user has < 10 meals, don't flag empty slots as bottlenecks
  // This prevents overwhelming new users with 28 empty slot warnings

  // 4. Find days with poor power balance
  for (const [dayKey, day] of Object.entries(dayCircuits)) {
    if (!day.isPowerBalanced && day.balanceDeviation > 0.1) {
      bottlenecks.push({
        mealSlotId: `day-${dayKey}`,
        reason: `Poor power balance (${(day.balanceDeviation * 100).toFixed(0)}% deviation)`,
        impactScore: day.balanceDeviation,
      });
    }
  }

  // Sort by impact score (highest impact first)
  return bottlenecks.sort((a, b) => b.impactScore - a.impactScore);
}

/**
 * Calculate ideal recipe properties for a given meal slot
 * based on the day's circuit balance needs
 */
function calculateIdealRecipeProperties(
  mealSlot: MealSlot,
  dayCircuit: DayCircuitMetrics,
): {
  targetPower: number;
  targetResistance: number;
  targetEfficiency: number;
} {
  // For balanced day, aim for equal power distribution across meals
  const filledMealsCount = Object.values(dayCircuit.meals).filter(
    (m) => m !== null,
  ).length;

  const targetPower =
    filledMealsCount > 0 ? dayCircuit.totalPower / filledMealsCount : 30; // Default 30W

  // Target resistance should be low to minimize losses
  const targetResistance =
    dayCircuit.totalResistance / Math.max(filledMealsCount, 4);

  // Target efficiency: aim for 80%+
  const targetEfficiency = 0.8;

  return {
    targetPower,
    targetResistance,
    targetEfficiency,
  };
}

/**
 * Score a recipe for circuit compatibility with a meal slot
 *
 * Higher score = better fit for the slot based on circuit optimization
 *
 * @param recipe - Recipe to evaluate
 * @param mealSlot - Target meal slot
 * @param dayCircuit - Current day circuit metrics
 * @param planetaryPositions - Planetary positions for alignment
 * @returns Compatibility score (0-1)
 */
export function scoreRecipeCircuitCompatibility(
  recipe: Recipe,
  mealSlot: MealSlot,
  dayCircuit: DayCircuitMetrics,
  planetaryPositions?: PlanetaryPositions,
): number {
  if (!recipe.alchemicalProperties || !recipe.elementalProperties) {
    return 0;
  }

  // Type assertions for recipe properties (checked above)
  const alchemicalProps = recipe.alchemicalProperties as AlchemicalProperties;
  const elementalProps = recipe.elementalProperties as ElementalProperties;

  let score = 0;

  // 1. Power contribution (30% of score)
  const idealProps = calculateIdealRecipeProperties(mealSlot, dayCircuit);
  // Estimate recipe power (simplified - would need full circuit calc)
  const estimatedPower =
    (alchemicalProps.Spirit + alchemicalProps.Essence) * 10;

  const powerScore =
    idealProps.targetPower > 0
      ? 1 -
        Math.abs(estimatedPower - idealProps.targetPower) /
          idealProps.targetPower
      : 0.5;
  score += Math.max(0, powerScore) * 0.3;

  // 2. Efficiency (30% of score)
  // Lower entropy (resistance) = higher efficiency
  const estimatedEntropy =
    (alchemicalProps.Matter + alchemicalProps.Substance) * 0.1;
  const efficiencyScore = Math.max(0, 1 - estimatedEntropy);
  score += efficiencyScore * 0.3;

  // 3. Elemental balance (20% of score)
  // Check if recipe helps balance day's elements
  const dayElements = dayCircuit.netMomentum;
  const total =
    Math.abs(dayElements.Fire) +
    Math.abs(dayElements.Water) +
    Math.abs(dayElements.Earth) +
    Math.abs(dayElements.Air);

  if (total > 0) {
    // Find which element is deficient
    const avg = total / 4;
    const recipeElements = elementalProps;

    let balanceScore = 0;
    if (dayElements.Fire < avg && recipeElements.Fire > 0.3)
      balanceScore += 0.25;
    if (dayElements.Water < avg && recipeElements.Water > 0.3)
      balanceScore += 0.25;
    if (dayElements.Earth < avg && recipeElements.Earth > 0.3)
      balanceScore += 0.25;
    if (dayElements.Air < avg && recipeElements.Air > 0.3) balanceScore += 0.25;

    score += balanceScore * 0.2;
  }

  // 4. Meal type appropriateness (10% of score)
  // Breakfast: lighter (higher Air/Fire)
  // Dinner: heavier (higher Earth/Water)
  let mealTypeScore = 0.5; // Default neutral
  if (mealSlot.mealType === "breakfast") {
    mealTypeScore = (elementalProps.Fire + elementalProps.Air) / 2;
  } else if (mealSlot.mealType === "dinner") {
    mealTypeScore = (elementalProps.Earth + elementalProps.Water) / 2;
  } else if (mealSlot.mealType === "lunch") {
    // Balanced
    const balance = Math.abs(
      elementalProps.Fire +
        elementalProps.Air -
        elementalProps.Earth -
        elementalProps.Water,
    );
    mealTypeScore = 1 - Math.min(balance, 1);
  }
  score += mealTypeScore * 0.1;

  // 5. Planetary alignment (10% of score)
  if (planetaryPositions && mealSlot.planetarySnapshot) {
    const alignmentScore =
      mealSlot.planetarySnapshot.dominantPlanet ===
      planetaryPositions.dominantPlanet
        ? 1
        : 0.5;
    score += alignmentScore * 0.1;
  }

  return Math.max(0, Math.min(1, score));
}

/**
 * Generate improvement suggestions for circuit optimization
 *
 * Analyzes bottlenecks and recommends specific actions:
 * 1. Fill empty slots
 * 2. Replace high-resistance meals
 * 3. Boost low-power meals
 * 4. Balance elemental distribution
 *
 * @param dayCircuits - Circuit metrics for all 7 days
 * @param currentMenu - Complete weekly menu
 * @param planetaryPositions - Planetary positions
 * @param recipeDatabase - Optional array of recipes to suggest (defaults to empty for now)
 * @returns Array of improvement suggestions sorted by expected impact
 */
export function generateCircuitSuggestions(
  dayCircuits: Record<DayOfWeek, DayCircuitMetrics>,
  currentMenu: WeeklyMenu,
  planetaryPositions?: PlanetaryPositions,
  recipeDatabase?: Recipe[],
): CircuitImprovementSuggestion[] {
  const suggestions: CircuitImprovementSuggestion[] = [];
  const bottlenecks = findCircuitBottlenecks(dayCircuits, currentMenu);

  // 1. Suggest filling empty slots (highest priority)
  const emptyBottlenecks = bottlenecks.filter((b) =>
    b.reason.includes("Empty slot"),
  );
  for (const bottleneck of emptyBottlenecks.slice(0, 5)) {
    // Top 5
    const mealSlot = currentMenu.meals.find(
      (m) => m.id === bottleneck.mealSlotId,
    );
    if (!mealSlot) continue;

    const dayCircuit = dayCircuits[mealSlot.dayOfWeek];

    suggestions.push({
      type: "add_meal",
      targetSlotId: mealSlot.id,
      expectedImprovement: 15, // Empty slots have ~15% impact
      reason: `Fill empty ${mealSlot.mealType} slot to complete ${getDayName(mealSlot.dayOfWeek)}'s power circuit`,
    });
  }

  // 2. Suggest replacing high-resistance meals
  const highResistanceBottlenecks = bottlenecks.filter((b) =>
    b.reason.includes("High resistance"),
  );
  for (const bottleneck of highResistanceBottlenecks.slice(0, 3)) {
    // Top 3
    const mealSlot = currentMenu.meals.find(
      (m) => m.id === bottleneck.mealSlotId,
    );
    if (!mealSlot || !mealSlot.recipe) continue;

    const currentEfficiency =
      dayCircuits[mealSlot.dayOfWeek].meals[mealSlot.mealType]?.efficiency || 0;
    const targetEfficiency = 0.8;
    const expectedImprovement =
      ((targetEfficiency - currentEfficiency) / currentEfficiency) * 100;

    suggestions.push({
      type: "swap_meals",
      targetSlotId: mealSlot.id,
      expectedImprovement: Math.min(expectedImprovement, 50), // Cap at 50%
      reason: `Replace with lower resistance recipe to improve efficiency from ${(currentEfficiency * 100).toFixed(0)}% to ~${(targetEfficiency * 100).toFixed(0)}%`,
    });
  }

  // 3. Suggest boosting low-power meals via servings adjustment
  const lowPowerBottlenecks = bottlenecks.filter((b) =>
    b.reason.includes("Low power output"),
  );
  for (const bottleneck of lowPowerBottlenecks.slice(0, 3)) {
    // Top 3
    const mealSlot = currentMenu.meals.find(
      (m) => m.id === bottleneck.mealSlotId,
    );
    if (!mealSlot || !mealSlot.recipe) continue;

    const currentServings = mealSlot.servings;
    const suggestedServings = Math.ceil(currentServings * 1.5); // 50% increase

    suggestions.push({
      type: "adjust_servings",
      targetSlotId: mealSlot.id,
      expectedImprovement: 30, // Servings boost ~30%
      reason: `Increase servings from ${currentServings} to ${suggestedServings} to boost power output`,
    });
  }

  // Sort by expected improvement (highest first)
  return suggestions.sort(
    (a, b) => b.expectedImprovement - a.expectedImprovement,
  );
}

/**
 * Calculate expected improvement from applying all suggestions
 *
 * @param suggestions - Array of improvement suggestions
 * @param currentEfficiency - Current weekly efficiency (0-1)
 * @returns Predicted new efficiency (0-1)
 */
export function predictImprovementImpact(
  suggestions: CircuitImprovementSuggestion[],
  currentEfficiency: number,
): number {
  // Each suggestion contributes to overall improvement
  // Diminishing returns: first suggestions have more impact
  let totalImprovement = 0;

  for (let i = 0; i < suggestions.length; i++) {
    const suggestion = suggestions[i];
    const weight = 1 / (i + 1); // Diminishing weight
    totalImprovement += (suggestion.expectedImprovement / 100) * weight;
  }

  // Apply improvement to current efficiency
  const predictedEfficiency = Math.min(
    1,
    currentEfficiency + totalImprovement * (1 - currentEfficiency),
  );

  return predictedEfficiency;
}

/**
 * Helper to get day name from DayOfWeek
 */
function getDayName(day: DayOfWeek): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day];
}
