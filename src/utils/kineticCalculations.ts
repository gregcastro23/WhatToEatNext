/**
 * Kinetic Calculations Utility
 *
 * Calculates kinetic properties (velocity, momentum, power, force)
 * from alchemical and elemental properties using the P=IV circuit model.
 */

import type { AlchemicalProperties, ElementalProperties } from "@/types/alchemy";

export interface KineticMetrics {
  velocity: Record<string, number>;
  momentum: Record<string, number>;
  charge: number;
  potentialDifference: number;
  currentFlow: number;
  power: number;
  inertia: number;
  forceMagnitude: number;
  forceClassification: string;
}

export interface ThermodynamicMetrics {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
}

/**
 * Calculate kinetic properties from alchemical, elemental, and thermodynamic data
 *
 * Uses the P=IV circuit model:
 * - Charge (Q) = Matter + Substance
 * - Potential Difference (V) = Greg's Energy / Charge
 * - Current Flow (I) = Reactivity × Charge × 0.1
 * - Power (P) = I × V
 *
 * @param alchemical - Alchemical properties (Spirit, Essence, Matter, Substance)
 * @param elemental - Elemental properties (Fire, Water, Earth, Air)
 * @param thermodynamics - Thermodynamic metrics
 * @returns Kinetic metrics including velocity, momentum, power, force
 */
export function calculateKineticProperties(
  alchemical: AlchemicalProperties,
  elemental: ElementalProperties,
  thermodynamics: ThermodynamicMetrics,
): KineticMetrics {
  const { Spirit, Essence, Matter, Substance } = alchemical;
  const { Fire, Water, Earth, Air } = elemental;
  const { heat, entropy, reactivity, gregsEnergy, monica } = thermodynamics;

  // Calculate elemental velocity (rate of elemental change per element)
  // Higher Spirit and Air = higher velocity
  const baseVelocity = (Spirit + Air) / 2;
  const velocity: Record<string, number> = {
    Fire: baseVelocity * (Fire + Spirit / 2),
    Water: baseVelocity * (Water + Essence / 2),
    Earth: baseVelocity * (Earth + Matter / 2),
    Air: baseVelocity * (Air + Substance / 2),
  };

  // Calculate inertia (resistance to change)
  // Higher Matter and Earth = higher inertia
  const inertia = Math.max(1, Matter + Earth + Substance / 2);

  // Calculate momentum (mass × velocity per element)
  const momentum: Record<string, number> = {
    Fire: inertia * velocity.Fire,
    Water: inertia * velocity.Water,
    Earth: inertia * velocity.Earth,
    Air: inertia * velocity.Air,
  };

  // Calculate charge (Q) = Matter + Substance
  const charge = Matter + Substance;

  // Calculate potential difference (V) = Greg's Energy / charge
  const potentialDifference = charge > 0 ? gregsEnergy / charge : 0;

  // Calculate current flow (I) = Reactivity × charge rate
  const currentFlow = reactivity * charge * 0.1;

  // Calculate power (P) = I × V
  const power = currentFlow * potentialDifference;

  // Calculate force magnitude from momentum
  const forceMagnitude = Math.sqrt(
    momentum.Fire ** 2 +
      momentum.Water ** 2 +
      momentum.Earth ** 2 +
      momentum.Air ** 2,
  );

  // Classify force based on magnitude
  let forceClassification: string;
  if (forceMagnitude > 5) {
    forceClassification = "accelerating";
  } else if (forceMagnitude < 2) {
    forceClassification = "decelerating";
  } else {
    forceClassification = "balanced";
  }

  return {
    velocity,
    momentum,
    charge,
    potentialDifference,
    currentFlow,
    power,
    inertia,
    forceMagnitude,
    forceClassification,
  };
}
