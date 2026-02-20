/**
 * Kinetic Calculations Utility
 *
 * Calculates kinetic properties (velocity, momentum, power, force)
 * from alchemical and elemental properties using the P=IV circuit model.
 */

import type {
  AlchemicalProperties,
  ElementalProperties,
} from "@/types/alchemy";
import type { Element } from "@/types/celestial";
import type { KineticMetrics as KineticMetricsType } from "@/types/kinetics";

// Re-export KineticMetrics for backwards compatibility
export type { KineticMetrics } from "@/types/kinetics";

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
): KineticMetricsType {
  // Defensive checks for undefined/null inputs
  if (!alchemical || !elemental || !thermodynamics) {
    return {
      velocity: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      momentum: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      charge: 0,
      potentialDifference: 0,
      currentFlow: 0,
      power: 0,
      inertia: 1,
      force: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      forceMagnitude: 0,
      forceClassification: "balanced",
      aspectPhase: null,
      thermalDirection: "stable",
    };
  }

  // Defensive extraction with fallback values
  const Spirit =
    typeof alchemical.Spirit === "number" && !isNaN(alchemical.Spirit)
      ? alchemical.Spirit
      : 4;
  const Essence =
    typeof alchemical.Essence === "number" && !isNaN(alchemical.Essence)
      ? alchemical.Essence
      : 4;
  const Matter =
    typeof alchemical.Matter === "number" && !isNaN(alchemical.Matter)
      ? alchemical.Matter
      : 4;
  const Substance =
    typeof alchemical.Substance === "number" && !isNaN(alchemical.Substance)
      ? alchemical.Substance
      : 2;

  const Fire =
    typeof elemental.Fire === "number" && !isNaN(elemental.Fire)
      ? elemental.Fire
      : 0.25;
  const Water =
    typeof elemental.Water === "number" && !isNaN(elemental.Water)
      ? elemental.Water
      : 0.25;
  const Earth =
    typeof elemental.Earth === "number" && !isNaN(elemental.Earth)
      ? elemental.Earth
      : 0.25;
  const Air =
    typeof elemental.Air === "number" && !isNaN(elemental.Air)
      ? elemental.Air
      : 0.25;

  const heat =
    typeof thermodynamics.heat === "number" && !isNaN(thermodynamics.heat)
      ? thermodynamics.heat
      : 0.08;
  const entropy =
    typeof thermodynamics.entropy === "number" && !isNaN(thermodynamics.entropy)
      ? thermodynamics.entropy
      : 0.15;
  const reactivity =
    typeof thermodynamics.reactivity === "number" &&
    !isNaN(thermodynamics.reactivity)
      ? thermodynamics.reactivity
      : 0.45;
  const gregsEnergy =
    typeof thermodynamics.gregsEnergy === "number" &&
    !isNaN(thermodynamics.gregsEnergy)
      ? thermodynamics.gregsEnergy
      : -0.02;
  const monica =
    typeof thermodynamics.monica === "number" && !isNaN(thermodynamics.monica)
      ? thermodynamics.monica
      : 1.0;

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

  // Calculate force per element (F = dp/dt, approximated as momentum / inertia for elemental force)
  const force: Record<Element, number> = {
    Fire: momentum.Fire / inertia,
    Water: momentum.Water / inertia,
    Earth: momentum.Earth / inertia,
    Air: momentum.Air / inertia,
  };

  // Calculate force magnitude from momentum
  const forceMagnitude = Math.sqrt(
    momentum.Fire ** 2 +
      momentum.Water ** 2 +
      momentum.Earth ** 2 +
      momentum.Air ** 2,
  );

  // Classify force based on magnitude
  let forceClassification: "accelerating" | "decelerating" | "balanced";
  if (forceMagnitude > 5) {
    forceClassification = "accelerating";
  } else if (forceMagnitude < 2) {
    forceClassification = "decelerating";
  } else {
    forceClassification = "balanced";
  }

  // Determine thermal direction based on heat and entropy
  let thermalDirection: "heating" | "cooling" | "stable";
  if (heat > entropy) {
    thermalDirection = "heating";
  } else if (entropy > heat * 1.2) {
    thermalDirection = "cooling";
  } else {
    thermalDirection = "stable";
  }

  return {
    velocity,
    momentum,
    charge,
    potentialDifference,
    currentFlow,
    power,
    inertia,
    force,
    forceMagnitude,
    forceClassification,
    aspectPhase: null, // Aspect phase is calculated separately from planetary aspects
    thermalDirection,
  };
}
