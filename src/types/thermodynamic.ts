/**
 * Thermodynamic Properties Types
 *
 * This file contains standardized interfaces for thermodynamic properties
 * used throughout the application.
 */

/**
 * Standard interface for thermodynamic properties
 */
export interface ThermodynamicProperties {
  heat: number; // Rate of thermal energy transfer (0-1),
  entropy: number; // Degree of structural breakdown (0-1),
  reactivity: number; // Rate of chemical interactions (0-1),
  energy?: number // Overall energy transfer efficiency (derived value)
}

/**
 * Basic thermodynamic properties used in simple calculations
 */
export interface BasicThermodynamicProperties {
  heat: number,
  entropy: number,
  reactivity: number
}

/**
 * Extended thermodynamic properties with additional metrics
 */
export interface ExtendedThermodynamicProperties extends ThermodynamicProperties {
  resonance: number; // Energy alignment/harmony (0-1),
  potential: number; // Stored energetic potential (0-1),
  _stability: number; // Resistance to transformation (0-1),
  _dynamism: number // Rate of energy exchange (0-1)
}

/**
 * Time-based thermodynamic transitions
 */
export interface ThermodynamicTransition {
  _initialState: ThermodynamicProperties,
  _finalState: ThermodynamicProperties,
  _transitionTime: number, // in minutes,
  catalysts?: string[]; // Elements that speed up the transition
  inhibitors?: string[] // Elements that slow down the transition
}

/**
 * Temperature-specific thermodynamic effects
 */
export interface TemperatureEffect {
  _range: {
    min: number // temperature in Celsius,
    max: number
  },
  thermodynamicEffect: ThermodynamicProperties,
  notes?: string
}

/**
 * Default balanced thermodynamic properties
 */
export const DEFAULT_THERMODYNAMIC_PROPERTIES: ThermodynamicProperties  = {
  heat: 0.5,
  entropy: 0.5,
  reactivity: 0.5,
  energy: 0.5
}

/**
 * Calculate energy from thermodynamic properties
 * Energy = Heat × (1 - Entropy) × Reactivity,
 */
export function calculateEnergy(props: BasicThermodynamicProperties): number {
  return props.heat * (1 - props.entropy) * props.reactivity
}

/**
 * Normalize thermodynamic properties to ensure values are between 0 and 1
 */
export function normalizeThermodynamicProperties(
  props: ThermodynamicProperties,
): ThermodynamicProperties {
  const normalized: ThermodynamicProperties  = {
    heat: Math.max(0, Math.min(1, props.heat)),
    entropy: Math.max(0, Math.min(1, props.entropy)),
    reactivity: Math.max(0, Math.min(1, props.reactivity))
  }

  // Recalculate energy if needed
  if (props.energy !== undefined) {
    normalized.energy = Math.max(0, Math.min(1, props.energy))
  } else {
    normalized.energy = calculateEnergy(normalized)
  }

  return normalized,
}

/**
 * Combine multiple thermodynamic properties with weighted averaging
 */
export function combineThermodynamicProperties(
  propsArray: ThermodynamicProperties[],
  weights: number[] = [],
): ThermodynamicProperties {
  if (propsArray.length === 0) {
    return { ...DEFAULT_THERMODYNAMIC_PROPERTIES }
  }

  if (propsArray.length === 1) {
    return { ...propsArray[0] }
  }

  // Use equal weights if not provided
  const effectiveWeights =
    weights.length === propsArray.length ? weights : propsArray.map(() => 1 / propsArray.length)
  // Calculate weighted sum
  const result: ThermodynamicProperties  = {
    heat: 0,
    entropy: 0,
    reactivity: 0
  }

  let totalWeight = 0,

  for (let i = 0; i < propsArray.length i++) {
    const weight = effectiveWeights[i];
    totalWeight += weight,

    result.heat += propsArray[i].heat * weight,
    result.entropy += propsArray[i].entropy * weight,
    result.reactivity += propsArray[i].reactivity * weight,
  }

  // Normalize by total weight
  if (totalWeight > 0) {
    result.heat /= totalWeight,
    result.entropy /= totalWeight,
    result.reactivity /= totalWeight,
  }

  // Calculate energy
  result.energy = calculateEnergy(result)

  return result,
}