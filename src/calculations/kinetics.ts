/**
 * 🌟 Planetary Kinetics Calculation Engine
 * Adapts kinetics system to Alchm Kitchen with P=IV fluid dynamics
 *
 * Implements charge (Q), potential (V), current (I), power (P), force (F),
 * momentum, inertia, and aspect phase calculations.
 */

import type { Element } from "@/types/celestial";
import type { AspectPhase, KineticMetrics } from "@/types/kinetics";
import { alchemize, planetInfo } from "./core/alchemicalEngine";
import { PLANET_WEIGHTS, normalizePlanetWeight } from "@/data/planets";

export type { KineticMetrics } from "@/types/kinetics";

export interface KineticsCalculationInput {
  currentPlanetaryPositions: Record<string, string>;
  previousPlanetaryPositions?: Record<string, string>;
  timeInterval: number; // in seconds
  currentPlanet?: string;
  previousMetrics?: KineticMetrics;
}

/**
 * Calculate planetary kinetics metrics from planetary positions
 */
export function calculateKinetics(
  input: KineticsCalculationInput,
): KineticMetrics {
  const {
    currentPlanetaryPositions,
    previousPlanetaryPositions,
    timeInterval,
    currentPlanet = "Sun",
    previousMetrics,
  } = input;

  // Get current thermodynamic metrics using alchemize
  const currentThermo = alchemize(currentPlanetaryPositions);
  const {
    heat: currentHeat,
    entropy,
    reactivity,
    gregsEnergy,
    kalchm,
    monica,
  } = currentThermo;

  // Get previous thermodynamic metrics if available
  const previousThermo = previousPlanetaryPositions
    ? alchemize(previousPlanetaryPositions)
    : null;
  const previousHeat = previousThermo?.heat || currentHeat;

  // Aggregate current alchemical properties
  const currentTotals = aggregateAlchemicalProperties(
    currentPlanetaryPositions,
  );

  // Aggregate previous alchemical properties if available
  const previousTotals = previousPlanetaryPositions
    ? aggregateAlchemicalProperties(previousPlanetaryPositions)
    : {
        Spirit: 0,
        Essence: 0,
        Matter: 0,
        Substance: 0,
        Fire: 0,
        Water: 0,
        Air: 0,
        Earth: 0,
      };

  // Planetary modifiers
  const modifiers = getPlanetaryModifiers(currentPlanet);

  // 1. Charge (Q) = Matter + Substance
  const charge = currentTotals.Matter + currentTotals.Substance;
  const previousCharge = previousTotals.Matter + previousTotals.Substance;

  // 2. Velocity: d(element)/dt per element
  const velocity: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  (Object.keys(velocity) as Element[]).forEach((element) => {
    const currentValue = currentTotals[element] || 0;
    const previousValue = previousTotals[element] || 0;
    velocity[element] =
      timeInterval > 0
        ? ((currentValue - previousValue) / timeInterval) * modifiers.velocity
        : 0;
  });

  // 3. Inertia
  const inertia =
    Math.max(
      1,
      currentTotals.Matter + currentTotals.Earth + currentTotals.Substance / 2,
    ) * modifiers.inertia;

  // 4. Momentum per element
  const momentum: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  (Object.keys(momentum) as Element[]).forEach((element) => {
    momentum[element] = inertia * velocity[element];
  });

  // 5. Potential Difference (V) = Greg's Energy / Q
  const potentialDifference = charge > 0 ? gregsEnergy / charge : 0;

  // 6. Current Flow (I) = Reactivity × (dQ/dt)
  const chargeVelocity =
    timeInterval > 0 ? (charge - previousCharge) / timeInterval : 0;
  const currentFlow = reactivity * chargeVelocity * modifiers.current;

  // 7. Force calculation
  const force: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  let forceMagnitude = 0;

  (Object.keys(force) as Element[]).forEach((element) => {
    // Kinetic force: dp/dt
    const currentMomentum = momentum[element];
    const previousMomentum = previousMetrics?.momentum[element] || 0;
    const kineticForce =
      timeInterval > 0
        ? (currentMomentum - previousMomentum) / timeInterval
        : 0;

    // Electromagnetic force: Q × (V + v × B), where B = Monica
    const electromagneticForce =
      charge * (potentialDifference + velocity[element] * monica);

    // Combined force
    force[element] =
      ((kineticForce + electromagneticForce) / 2) * modifiers.force;

    // Accumulate for magnitude
    forceMagnitude += force[element] ** 2;
  });

  forceMagnitude = Math.sqrt(forceMagnitude);

  // 8. Power (P) = I × V, boosted by force magnitude
  const power = currentFlow * potentialDifference * (1 + forceMagnitude / 10);

  // 9. Force Classification
  let forceClassification: "accelerating" | "decelerating" | "balanced";
  if (forceMagnitude > 5) {
    forceClassification = "accelerating";
  } else if (forceMagnitude < -5) {
    forceClassification = "decelerating";
  } else {
    forceClassification = "balanced";
  }

  // 10. Aspect Phase - determine based on power trend (simplified)
  const aspectPhase = determineAspectPhase(currentThermo, previousThermo);

  // 11. Thermal Direction
  const heatRate =
    timeInterval > 0 ? (currentHeat - previousHeat) / timeInterval : 0;
  let thermalDirection: "heating" | "cooling" | "stable";
  if (heatRate > 0.001) {
    thermalDirection = "heating";
  } else if (heatRate < -0.001) {
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
    aspectPhase,
    thermalDirection,
  };
}

/**
 * Aggregate alchemical properties from planetary positions
 */
function aggregateAlchemicalProperties(
  planetaryPositions: Record<string, string>,
) {
  const totals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };

  for (const planet in planetaryPositions) {
    const sign = planetaryPositions[planet];
    const planetData = planetInfo[planet];
    if (!planetData) continue;

    // Weight each planet's contribution by its log-normalized physical mass.
    // Jupiter (w≈0.63) adds ~5× more than Mercury (w≈0.17) to alchemical totals.
    const relMass = PLANET_WEIGHTS[planet] ?? 1.0;
    const w = normalizePlanetWeight(relMass);

    // Sum mass-weighted alchemical properties
    totals.Spirit    += planetData.Alchemy.Spirit    * w;
    totals.Essence   += planetData.Alchemy.Essence   * w;
    totals.Matter    += planetData.Alchemy.Matter    * w;
    totals.Substance += planetData.Alchemy.Substance * w;

    // Sum mass-weighted elemental properties from sign
    const signElement = getElementFromSign(sign);
    if (signElement && totals[signElement] !== undefined) {
      totals[signElement] += w;
    }
  }

  return totals;
}

/**
 * Get element from zodiac sign
 */
function getElementFromSign(sign: string): Element | null {
  const signToElement: Record<string, Element> = {
    aries: "Fire",
    taurus: "Earth",
    gemini: "Air",
    cancer: "Water",
    leo: "Fire",
    virgo: "Earth",
    libra: "Air",
    scorpio: "Water",
    sagittarius: "Fire",
    capricorn: "Earth",
    aquarius: "Air",
    pisces: "Water",
  };
  return signToElement[sign] || null;
}

/**
 * Get planetary modifiers for kinetics calculations.
 *
 * All four modifiers are derived from the planet's actual relative-to-Earth
 * mass (stored in PLANET_WEIGHTS) normalized via log₁₀ to [0, 1].
 *
 * Each modifier uses a role-specific sensitivity constant:
 *   force    × 0.25  — mass most directly maps to gravitational force
 *   inertia  × 0.20  — heavier bodies are harder to accelerate / decelerate
 *   velocity × 0.15  — faster internal alchemical flow for massive planets
 *   current  × 0.15  — stronger energetic current from massive bodies
 *
 * Result range: ~1.01 (Pluto, w≈0) to ~1.25 (Sun, w=1.0) for force.
 */
function getPlanetaryModifiers(planet: string) {
  const relMass = PLANET_WEIGHTS[planet] ?? 1.0; // actual × Earth
  const w = normalizePlanetWeight(relMass);       // 0 (Pluto) → 1 (Sun)

  return {
    velocity: 1.0 + w * 0.15,
    inertia:  1.0 + w * 0.20,
    current:  1.0 + w * 0.15,
    force:    1.0 + w * 0.25,
  };
}

/**
 * Determine aspect phase based on thermodynamic trends
 */
function determineAspectPhase(
  currentThermo: any,
  previousThermo: any,
): AspectPhase | null {
  if (!previousThermo) return null;

  // Simplified aspect phase determination based on power trend
  const currentPower =
    currentThermo.heat - currentThermo.entropy * currentThermo.reactivity;
  const previousPower =
    previousThermo.heat - previousThermo.entropy * previousThermo.reactivity;

  const powerChange = currentPower - previousPower;

  if (Math.abs(powerChange) < 0.01) {
    return {
      type: "exact",
      description: "Peak energy - maximum transformation potential",
      powerBoost: 0.25,
    };
  } else if (powerChange > 0) {
    return {
      type: "applying",
      description: "Building energy - enhanced creativity",
      velocityBoost: 0.15,
      powerBoost: 0.25,
    };
  } else {
    return {
      type: "separating",
      description: "Releasing energy - stabilization and integration",
    };
  }
}
