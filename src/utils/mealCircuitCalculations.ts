/**
 * Meal Circuit Calculations
 *
 * Calculates circuit metrics for individual meal slots using the P=IV model.
 * Extends the existing "recipe as circuit" concept to meal planning.
 *
 * @file src/utils/mealCircuitCalculations.ts
 * @created 2026-01-11
 */

import type { MealSlot } from "@/types/menuPlanner";
import type { MealCircuitMetrics, KineticMetrics } from "@/types/kinetics";
import type { PlanetaryPositions } from "@/types/astrology";
import type {
  AlchemicalProperties,
  ElementalProperties,
} from "@/types/alchemy";
import { calculateKineticProperties } from "./kineticCalculations";
import {
  calculateGregsEnergy,
  type ElementalAlchemicalCounts,
} from "@/calculations/gregsEnergy";
import { validateRecipeCircuit } from "./recipeCircuit";

/**
 * Count elemental and alchemical properties for thermodynamic calculations
 */
function countElementalAlchemical(
  elemental: ElementalProperties,
  alchemical: AlchemicalProperties,
): ElementalAlchemicalCounts {
  return {
    Spirit: alchemical.Spirit || 0,
    Essence: alchemical.Essence || 0,
    Matter: alchemical.Matter || 0,
    Substance: alchemical.Substance || 0,
    Fire: elemental.Fire || 0,
    Water: elemental.Water || 0,
    Earth: elemental.Earth || 0,
    Air: elemental.Air || 0,
  };
}

/**
 * Calculate circuit metrics for a single meal slot
 *
 * Uses existing implementations:
 * - calculateKineticProperties() for P=IV circuit model
 * - calculateGregsEnergy() for thermodynamics
 * - validateRecipeCircuit() for validation
 *
 * @param mealSlot - Meal slot with recipe
 * @param planetaryPositions - Current planetary positions for calculations
 * @returns Meal circuit metrics or null if slot is empty
 */
export function calculateMealCircuit(
  mealSlot: MealSlot,
  planetaryPositions?: PlanetaryPositions,
): MealCircuitMetrics | null {
  // Empty slot check
  if (!mealSlot.recipe) {
    return null;
  }

  const recipe = mealSlot.recipe;

  // Ensure we have required properties
  if (!recipe.alchemicalProperties || !recipe.elementalProperties) {
    console.warn(
      `Recipe ${recipe.id} missing alchemical or elemental properties`,
    );
    return null;
  }

  try {
    // Type assertions for recipe properties (checked above)
    const alchemicalProps: AlchemicalProperties = {
      Spirit: recipe.alchemicalProperties.reactivity || 0,
      Essence: recipe.alchemicalProperties.entropy || 0,
      Matter: recipe.alchemicalProperties.heat || 0,
      Substance: recipe.alchemicalProperties.stability || 0,
    };
    const elementalProps = recipe.elementalProperties as ElementalProperties;

    // 1. Calculate thermodynamic metrics (heat, entropy, reactivity, Greg's Energy)
    const elementalAlchemicalCounts = countElementalAlchemical(
      elementalProps,
      alchemicalProps,
    );

    const thermodynamics = calculateGregsEnergy(elementalAlchemicalCounts);

    // 2. Calculate kinetic metrics (P=IV circuit model)
    const kinetics: KineticMetrics = calculateKineticProperties(
      alchemicalProps,
      elementalProps,
      thermodynamics as any,
    );

    // 3. Extract circuit properties from kinetics
    const charge = kinetics.charge; // Q = Matter + Substance
    const potentialDifference = kinetics.potentialDifference; // V = Greg's Energy / Q
    const currentFlow = kinetics.currentFlow; // I = Reactivity × (dQ/dt)
    const power = kinetics.power; // P = I × V

    // 4. Calculate resistance and losses
    const resistance = thermodynamics.entropy; // Entropy as resistance (Ohms)
    const powerLosses = Math.pow(currentFlow, 2) * resistance; // I²R losses (Joule heating)
    const efficiency = power > 0 ? (power - powerLosses) / power : 0;

    // 5. Validate using existing recipe circuit validation
    const validation = validateRecipeCircuit(kinetics, recipe as any);

    // 6. Build meal circuit metrics
    const mealCircuit: MealCircuitMetrics = {
      // Identity
      mealSlotId: mealSlot.id,
      dayOfWeek: mealSlot.dayOfWeek,
      mealType: mealSlot.mealType,

      // Circuit properties
      charge,
      potentialDifference,
      currentFlow,
      power,
      resistance,
      powerLosses,
      efficiency: Math.max(0, Math.min(1, efficiency)), // Clamp to 0-1

      // Kinetic properties
      kinetics,

      // Validation
      isValid: validation.isValid,
      validationErrors: validation.error ? [validation.error] : [],

      // Timestamp
      calculatedAt: new Date(),
    };

    return mealCircuit;
  } catch (error) {
    console.error(
      `Error calculating meal circuit for slot ${mealSlot.id}:`,
      error,
    );
    return null;
  }
}

/**
 * Calculate circuit metrics for multiple meal slots
 *
 * @param mealSlots - Array of meal slots
 * @param planetaryPositions - Current planetary positions
 * @returns Map of mealSlotId to MealCircuitMetrics
 */
export function calculateMealCircuits(
  mealSlots: MealSlot[],
  planetaryPositions?: PlanetaryPositions,
): Record<string, MealCircuitMetrics | null> {
  const circuits: Record<string, MealCircuitMetrics | null> = {};

  for (const mealSlot of mealSlots) {
    circuits[mealSlot.id] = calculateMealCircuit(mealSlot, planetaryPositions);
  }

  return circuits;
}

/**
 * Get circuit health classification based on efficiency
 *
 * @param efficiency - Circuit efficiency (0-1)
 * @returns Health classification and color
 */
export function getCircuitHealth(efficiency: number): {
  classification: "excellent" | "good" | "moderate" | "poor";
  color: "green" | "yellow" | "orange" | "red";
  description: string;
} {
  if (efficiency >= 0.8) {
    return {
      classification: "excellent",
      color: "green",
      description: "High efficiency, minimal power losses",
    };
  } else if (efficiency >= 0.6) {
    return {
      classification: "good",
      color: "yellow",
      description: "Moderate efficiency, acceptable losses",
    };
  } else if (efficiency >= 0.4) {
    return {
      classification: "moderate",
      color: "orange",
      description: "Below optimal efficiency, consider improvements",
    };
  } else {
    return {
      classification: "poor",
      color: "red",
      description: "Low efficiency, significant power losses",
    };
  }
}

/**
 * Format circuit power for display
 *
 * @param power - Power in Watts
 * @returns Formatted string with units
 */
export function formatCircuitPower(power: number): string {
  if (power >= 1000) {
    return `${(power / 1000).toFixed(2)} kW`;
  } else if (power >= 1) {
    return `${power.toFixed(1)} W`;
  } else if (power >= 0.001) {
    return `${(power * 1000).toFixed(0)} mW`;
  } else {
    return `${(power * 1000000).toFixed(0)} μW`;
  }
}

/**
 * Format circuit efficiency for display
 *
 * @param efficiency - Efficiency (0-1)
 * @returns Formatted percentage string
 */
export function formatCircuitEfficiency(efficiency: number): string {
  return `${(efficiency * 100).toFixed(0)}%`;
}
