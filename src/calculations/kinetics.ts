/**
 * 🌟 Planetary Kinetics Calculation Engine
 * Adapts kinetics system to Alchm Kitchen with P=IV fluid dynamics
 *
 * Implements charge (Q), potential (V), current (I), power (P), force (F),
 * momentum, inertia, and aspect phase calculations.
 */

import type { Element } from '@/types/celestial';
import type { AspectPhase, KineticMetrics } from '@/types/kinetics';
import { alchemize, planetInfo } from './core/alchemicalEngine';

export interface KineticsCalculationInput {
  currentPlanetaryPositions: Record<string, string>;
  previousPlanetaryPositions?: Record<string, string>;
  timeInterval: number; // in seconds
  currentPlanet?: string,
  previousMetrics?: KineticMetrics;
}

/**
 * Calculate planetary kinetics metrics from planetary positions
 */
export function calculateKinetics(input: KineticsCalculationInput): KineticMetrics {
  const {
    currentPlanetaryPositions,
    previousPlanetaryPositions,
    timeInterval,
    currentPlanet = 'Sun',
    previousMetrics
  } = input;

  // Get current thermodynamic metrics using alchemize
  const currentThermo = alchemize(currentPlanetaryPositions);
  const { heat: currentHeat, entropy, reactivity, gregsEnergy, kalchm, monica } = currentThermo;

  // Get previous thermodynamic metrics if available
  const previousThermo = previousPlanetaryPositions ? alchemize(previousPlanetaryPositions) : null;
  const previousHeat = previousThermo?.heat || currentHeat;

  // Aggregate current alchemical properties
  const currentTotals = aggregateAlchemicalProperties(currentPlanetaryPositions);

  // Aggregate previous alchemical properties if available
  const previousTotals = previousPlanetaryPositions
    ? aggregateAlchemicalProperties(previousPlanetaryPositions)
    : { Spirit: 0, Essence: 0, Matter: 0, Substance: 0, Fire: 0, Water: 0, Air: 0, Earth: 0 };

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
    Air: 0
};

  (Object.keys(velocity) as Element[]).forEach(element => {
    const currentValue = currentTotals[element] || 0;
    const previousValue = previousTotals[element] || 0;
    velocity[element] = timeInterval > 0
      ? ((currentValue - previousValue) / timeInterval) * modifiers.velocity
      : 0;
  });

  // 3. Inertia
  const inertia = Math.max(1, currentTotals.Matter + currentTotals.Earth + (currentTotals.Substance / 2)) *
    modifiers.inertia;

  // 4. Momentum per element
  const momentum: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
};

  (Object.keys(momentum) as Element[]).forEach(element => {
    momentum[element] = inertia * velocity[element];
  });

  // 5. Potential Difference (V) = Greg's Energy / Q
  const potentialDifference = charge > 0 ? gregsEnergy / charge : 0;

  // 6. Current Flow (I) = Reactivity × (dQ/dt)
  const chargeVelocity = timeInterval > 0 ? (charge - previousCharge) / timeInterval : 0;
  const currentFlow = reactivity * chargeVelocity * modifiers.current;

  // 7. Force calculation
  const force: Record<Element, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
};

  let forceMagnitude = 0;

  (Object.keys(force) as Element[]).forEach(element => {
    // Kinetic force: dp/dt
    const currentMomentum = momentum[element];
    const previousMomentum = previousMetrics?.momentum[element] || 0;
    const kineticForce = timeInterval > 0 ? (currentMomentum - previousMomentum) / timeInterval : 0;

    // Electromagnetic force: Q × (V + v × B), where B = Monica
    const electromagneticForce = charge * (potentialDifference + (velocity[element] * monica));

    // Combined force
    force[element] = ((kineticForce + electromagneticForce) / 2) * modifiers.force;

    // Accumulate for magnitude
    forceMagnitude += force[element] ** 2;
  });

  forceMagnitude = Math.sqrt(forceMagnitude);

  // 8. Power (P) = I × V, boosted by force magnitude
  const power = currentFlow * potentialDifference * (1 + forceMagnitude / 10);

  // 9. Force Classification
  let forceClassification: 'accelerating' | 'decelerating' | 'balanced'
  if (forceMagnitude > 5) {
    forceClassification = 'accelerating';
  } else if (forceMagnitude < -5) {
    forceClassification = 'decelerating';
  } else {
    forceClassification = 'balanced';
  }

  // 10. Aspect Phase - determine based on power trend (simplified)
  const aspectPhase = determineAspectPhase(currentThermo, previousThermo);

  // 11. Thermal Direction
  const heatRate = timeInterval > 0 ? (currentHeat - previousHeat) / timeInterval : 0;
  let thermalDirection: 'heating' | 'cooling' | 'stable'
  if (heatRate > 0.001) {
    thermalDirection = 'heating';
  } else if (heatRate < -0.001) {
    thermalDirection = 'cooling';
  } else {
    thermalDirection = 'stable';
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
    thermalDirection
  };
}

/**
 * Aggregate alchemical properties from planetary positions
 */
function aggregateAlchemicalProperties(planetaryPositions: Record<string, string>) {
  const totals = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0
};

  for (const planet in planetaryPositions) {
    const sign = planetaryPositions[planet];
    const planetData = planetInfo[planet];
    if (!planetData) continue;

    // Sum alchemical properties
    totals.Spirit += planetData.Alchemy.Spirit;
    totals.Essence += planetData.Alchemy.Essence;
    totals.Matter += planetData.Alchemy.Matter;
    totals.Substance += planetData.Alchemy.Substance;

    // Sum elemental properties from sign
    const signElement = getElementFromSign(sign);
    if (signElement && totals[signElement] !== undefined) {
      totals[signElement] += 1;
    }
  }

  return totals;
}

/**
 * Get element from zodiac sign
 */
function getElementFromSign(sign: string): Element | null {
  const signToElement: Record<string, Element> = {
    aries: 'Fire', taurus: 'Earth', gemini: 'Air', cancer: 'Water',
    leo: 'Fire', virgo: 'Earth', libra: 'Air', scorpio: 'Water',
    sagittarius: 'Fire', capricorn: 'Earth', aquarius: 'Air', pisces: 'Water'
};
  return signToElement[sign] || null;
}

/**
 * Get planetary modifiers for kinetics calculations
 */
function getPlanetaryModifiers(planet: string) {
  // Base modifiers
  const baseModifiers = {
    velocity: 1.0,
    inertia: 1.0,
    current: 1.0,
    force: 1.0
};

  // Planet-specific boosts
  const planetBoosts: Record<string, Partial<typeof baseModifiers>> = {
    Sun: { velocity: 1.1, force: 1.1 },
    Moon: { inertia: 1.05, current: 1.05 },
    Mercury: { velocity: 1.15, current: 1.15 },
    Venus: { force: 1.08, inertia: 1.08 },
    Mars: { force: 1.2, velocity: 1.1 },
    Jupiter: { inertia: 1.15, current: 1.1 },
    Saturn: { inertia: 1.1 }, // Already handled in inertia formula
    Uranus: { current: 1.12, velocity: 1.08 },
    Neptune: { force: 1.1, current: 1.1 },
    Pluto: { force: 1.15, inertia: 1.1 }
  };

  const boosts = planetBoosts[planet] || {};
  return {
    velocity: baseModifiers.velocity * (boosts.velocity || 1),
    inertia: baseModifiers.inertia * (boosts.inertia || 1),
    current: baseModifiers.current * (boosts.current || 1),
    force: baseModifiers.force * (boosts.force || 1)
  };
}

/**
 * Determine aspect phase based on thermodynamic trends
 */
function determineAspectPhase(currentThermo: any, previousThermo: any): AspectPhase | null {
  if (!previousThermo) return null;

  // Simplified aspect phase determination based on power trend
  const currentPower = currentThermo.heat - currentThermo.entropy * currentThermo.reactivity;
  const previousPower = previousThermo.heat - previousThermo.entropy * previousThermo.reactivity;

  const powerChange = currentPower - previousPower;

  if (Math.abs(powerChange) < 0.01) {
    return {
      type: 'exact',
      description: 'Peak energy - maximum transformation potential',
      powerBoost: 0.25
};
  } else if (powerChange > 0) {
    return {
      type: 'applying',
      description: 'Building energy - enhanced creativity',
      velocityBoost: 0.15,
      powerBoost: 0.25
};
  } else {
    return {
      type: 'separating',
      description: 'Releasing energy - stabilization and integration'
};
  }
}
