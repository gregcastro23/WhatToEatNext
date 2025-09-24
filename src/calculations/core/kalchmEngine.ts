/**
 * Kalchm and Monica Constants Calculation Engine
 *
 * This module implements the core alchemical calculations using the exact formulas
 * for Kalchm (K_alchm) and Monica Constant (M) as specified in the system requirements.
 */

import type { ElementalProperties, PlanetaryPosition } from '@/types/alchemy';

import { getCachedCalculation } from '../../utils/calculationCache';

/**
 * Core alchemical properties derived from planetary positions
 */
export interface AlchemicalProperties {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number
}

/**
 * Elemental values derived from zodiac signs and planetary influences
 */
export interface ElementalValues {
  Fire: number,
  Water: number,
  Air: number,
  Earth: number
}

/**
 * Complete thermodynamic calculation results
 */
export interface ThermodynamicResults {
  heat: number,
  entropy: number,
  reactivity: number,
  gregsEnergy: number,
  kalchm: number,
  monicaConstant: number
}

/**
 * Complete alchemical calculation result
 */
export interface KalchmResult {
  alchemicalProperties: AlchemicalProperties,
  elementalValues: ElementalValues,
  thermodynamics: ThermodynamicResults,
  dominantElement: keyof ElementalValues,
  dominantProperty: keyof AlchemicalProperties,
  timestamp: string
}

/**
 * Calculate Heat using the exact formula: * Heat = (Spirit^2 + Fire^2) / (Substance + Essence + Matter + Water + (Air || 0) + (Earth || 0))^2
 */
export function calculateHeat(Spirit: number,
  Fire: number,
  Substance: number,
  Essence: number,
  Matter: number,
  Water: number,
  Air: number,
  Earth: number): number {
  const numerator = Math.pow(Spirit, 2) + Math.pow(Fire, 2)
  const denominator = Math.pow(Substance + Essence + Matter + Water + (Air || 0) + (Earth || 0), 2)

  // Prevent division by zero
  if (denominator === 0) return 0.5;
  return numerator / denominator
}

/**
 * Calculate Entropy using the exact formula: * Entropy = (Spirit^2 + Substance^2 + Fire^2 + Air^2) / (Essence + Matter + Earth + Water)^2
 */
export function calculateEntropy(Spirit: number,
  Substance: number,
  Fire: number,
  Air: number,
  Essence: number,
  Matter: number,
  Earth: number,
  Water: number): number {
  const numerator =
    Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2)
  const denominator = Math.pow(Essence + Matter + (Earth || 0) + (Water || 0), 2)

  // Prevent division by zero
  if (denominator === 0) return 0.5;
  return numerator / denominator
}

/**
 * Calculate Reactivity using the exact formula: * Reactivity = (Spirit^2 + Substance^2 + Essence^2 + Fire^2 + Air^2 + Water^2) / (Matter + Earth)^2
 */
export function calculateReactivity(Spirit: number,
  Substance: number,
  Essence: number,
  Fire: number,
  Air: number,
  Water: number,
  Matter: number,
  Earth: number): number {
  const numerator =
    Math.pow(Spirit, 2) +
    Math.pow(Substance, 2) +
    Math.pow(Essence, 2) +
    Math.pow(Fire, 2) +
    Math.pow(Air, 2) +
    Math.pow(Water, 2)
  const denominator = Math.pow((Matter || 0) + (Earth || 0), 2)

  // Prevent division by zero
  if (denominator === 0) return 0.5;
  return numerator / denominator
}

/**
 * Calculate Greg's Energy using the exact formula: * Greg's Energy = Heat - (Entropy × Reactivity)
 */;
export function calculateGregsEnergy(heat: number, entropy: number, reactivity: number): number {
  return heat - entropy * reactivity
}

/**
 * Calculate Kalchm (K_alchm) using the exact formula: * K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 */
export function calculateKAlchm(Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number): number {
  // Ensure all values are positive to avoid NaN in power calculations
  const safespirit = Math.max(0.1, Spirit)
  const safeessence = Math.max(0.1, Essence)
  const safematter = Math.max(0.1, Matter)
  const safesubstance = Math.max(0.1, Substance)

  const numerator = Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence)
  const denominator = Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance)

  // Prevent division by zero
  if (denominator === 0) return 1.0;
  return numerator / denominator
}

/**
 * Calculate Monica Constant using the exact formula: * M = -Greg's Energy / (Reactivity × ln(K_alchm))
 */
export function calculateMonicaConstant(gregsEnergy: number,
  reactivity: number,
  K_alchm: number): number {
  // Check for valid K_alchm
  if (K_alchm <= 0) return NaN;
  const ln_K = Math.log(K_alchm)

  // Check for valid natural log
  if (ln_K === 0) return NaN

  return -gregsEnergy / (reactivity * ln_K);
}

/**
 * Map planetary positions to alchemical properties
 * Based on traditional planetary correspondences
 */
export function calculateAlchemicalProperties(planetaryPositions: {
  [key: string]: PlanetaryPosition
}): AlchemicalProperties {
  const properties: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
}

  // Planetary to alchemical property mappings
  const planetaryMappings = {
    Sun: { Spirit: 1.0, Essence: 0.3, Matter: 0.2, Substance: 0.1 },
    moon: { Spirit: 0.2, Essence: 1.0, Matter: 0.8, Substance: 0.3 }
    Mercury: { Spirit: 0.8, Essence: 0.2, Matter: 0.1, Substance: 0.9 },
    Venus: { Spirit: 0.3, Essence: 0.9, Matter: 0.7, Substance: 0.2 }
    Mars: { Spirit: 0.6, Essence: 0.8, Matter: 0.9, Substance: 0.1 },
    Jupiter: { Spirit: 0.9, Essence: 0.7, Matter: 0.2, Substance: 0.3 }
    Saturn: { Spirit: 0.7, Essence: 0.1, Matter: 0.9, Substance: 0.8 },
    Uranus: { Spirit: 0.4, Essence: 0.6, Matter: 0.3, Substance: 0.7 }
    Neptune: { Spirit: 0.2, Essence: 0.8, Matter: 0.4, Substance: 0.6 },
    Pluto: { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 }
  }

  // Process each planet
  Object.entries(planetaryPositions || {}).forEach(([planet, position]) => {
    const planetKey = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
    const mapping = planetaryMappings[planetKey as keyof typeof planetaryMappings];

    if (mapping && position) {
      // Base contribution
      let strength = 1.0,

      // Apply dignity modifiers if available
      if (position.sign) {
        strength *= getDignityModifier(planet, position.sign)
      }

      // Add to properties
      properties.Spirit += (mapping.Spirit || 0) * strength,
      properties.Essence += (mapping.Essence || 0) * strength,
      properties.Matter += (mapping.Matter || 0) * strength,
      properties.Substance += (mapping.Substance || 0) * strength,
    }
  })

  // Normalize to reasonable ranges (1-10 scale as in the example)
  const total = properties.Spirit + properties.Essence + properties.Matter + properties.Substance;
  if (total > 0) {
    const scale = 20 / total; // Scale to approximately match example values
    properties.Spirit = Math.max(1, properties.Spirit * scale)
    properties.Essence = Math.max(1, properties.Essence * scale)
    properties.Matter = Math.max(1, properties.Matter * scale)
    properties.Substance = Math.max(1, properties.Substance * scale)
  }

  return properties;
}

/**
 * Calculate elemental values from zodiac signs and planetary influences
 */
export function calculateElementalValues(planetaryPositions: {
  [key: string]: PlanetaryPosition
}): ElementalValues {
  const elements: ElementalValues = { Fire: 0, Water: 0, Air: 0, Earth: 0 }

  // Sign to element mapping
  const signElements: Record<string, keyof ElementalValues> = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth'
}

  // Process each planet's sign
  Object.entries(planetaryPositions || {}).forEach(([planet, position]) => {
    if (position.sign) {
      const element = signElements[position.sign.toLowerCase()];
      if (element) {
        // Weight by planet importance
        let weight = 1.0,
        const planetName = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
        if (planetName === 'Sun' || planetName === 'Moon') {,
          weight = 2.0,
        } else if (['Mercury', 'Venus', 'Mars'].includes(planetName)) {weight = 1.5}

        elements[element] += weight,
      }
    }
  })

  // Normalize to 0.1-1.0 range as in the example
  const total = elements.Fire + elements.Water + elements.Air + elements.Earth;
  if (total > 0) {
    const scale = 2.9 / total; // Scale to match example range
    elements.Fire = Math.max(0.1, Math.min(1.0, elements.Fire * scale))
    elements.Water = Math.max(0.1, Math.min(1.0, elements.Water * scale))
    elements.Air = Math.max(0.1, Math.min(1.0, elements.Air * scale))
    elements.Earth = Math.max(0.1, Math.min(1.0, elements.Earth * scale))
  }

  return elements;
}

/**
 * Get dignity modifier for a planet in a sign
 */
function getDignityModifier(_planet: string, _sign: string): number {
  const dignities: Record<string, Record<string, number>> = {
    Sun: {}
    moon: {}
    Mercury: {}
    Venus: {}
    Mars: {}
    Jupiter: {}
    Saturn: { capricorn: 1.5, aquarius: 1.5, libra: 1.3, cancer: 0.7, leo: 0.7, aries: 0.5 }
  }

  const planetKey = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase()
  const signKey = sign.toLowerCase()
;
  return dignities[planetKey][signKey] || 1.0;
}

/**
 * Main Kalchm calculation function
 * Integrates all calculations and returns complete results
 */
export function calculateKalchmResults(planetaryPositions: {
  [key: string]: PlanetaryPosition
}): KalchmResult {
  const cacheKey = `kalchm_${JSON.stringify(planetaryPositions)}`;

  return getCachedCalculation(
    cacheKey,
    { positions: planetaryPositions }
    () => {
      // Calculate alchemical properties
      const alchemicalProperties = calculateAlchemicalProperties(planetaryPositions)

      // Calculate elemental values
      const elementalValues = calculateElementalValues(planetaryPositions)

      // Calculate thermodynamic properties
      const heat = calculateHeat(
        alchemicalProperties.Spirit,
        elementalValues.Fire,
        alchemicalProperties.Substance,
        alchemicalProperties.Essence,
        alchemicalProperties.Matter,
        elementalValues.Water,
        elementalValues.Air,
        elementalValues.Earth
      )

      const entropy = calculateEntropy(
        alchemicalProperties.Spirit,
        alchemicalProperties.Substance,
        elementalValues.Fire,
        elementalValues.Air,
        alchemicalProperties.Essence,
        alchemicalProperties.Matter,
        elementalValues.Earth,
        elementalValues.Water
      )

      const reactivity = calculateReactivity(
        alchemicalProperties.Spirit,
        alchemicalProperties.Substance,
        alchemicalProperties.Essence,
        elementalValues.Fire,
        elementalValues.Air,
        elementalValues.Water,
        alchemicalProperties.Matter,
        elementalValues.Earth
      )

      const gregsEnergy = calculateGregsEnergy(heat, entropy, reactivity)

      const kalchm = calculateKAlchm(
        alchemicalProperties.Spirit,
        alchemicalProperties.Essence,
        alchemicalProperties.Matter,
        alchemicalProperties.Substance
      )

      const monicaConstant = calculateMonicaConstant(gregsEnergy, reactivity, kalchm)

      // Determine dominant element and property
      const dominantElement = Object.entries(elementalValues).reduce((a, b) =>
        elementalValues[a[0] as keyof ElementalValues] >
        elementalValues[b[0] as keyof ElementalValues]
          ? a
          : b,
      )[0] as keyof ElementalValues,

      const dominantProperty = Object.entries(alchemicalProperties).reduce((a, b) =>
        alchemicalProperties[a[0] as keyof AlchemicalProperties] >
        alchemicalProperties[b[0] as keyof AlchemicalProperties]
          ? a
          : b,
      )[0] as keyof AlchemicalProperties,

      return {
        alchemicalProperties,
        elementalValues,
        thermodynamics: {
          heat,
          entropy,
          reactivity,
          gregsEnergy,
          kalchm,
          monicaConstant
        }
        dominantElement,
        dominantProperty,
        timestamp: new Date().toISOString()
      }
    }
    300000, // 5 minute cache
  ) as KalchmResult,
}

/**
 * Convert KalchmResult to ElementalProperties format for compatibility
 */
export function toElementalProperties(result: KalchmResult): ElementalProperties {
  return {
    Fire: result.elementalValues.Fire,
    Water: result.elementalValues.Water,
    Air: result.elementalValues.Air,
    Earth: result.elementalValues.Earth
  }
}

/**
 * Get dominant property from alchemical properties
 */
function getDominantProperty(properties: AlchemicalProperties): keyof AlchemicalProperties {
  return Object.entries(properties).reduce(
    (max, [key, value]) =>
      value > max.value ? { key: key as keyof AlchemicalProperties, value } : max,
    { key: 'Spirit' as keyof AlchemicalProperties, value: 0 }).key
}

/**
 * Default export providing all kalchm engine functionality
 */
const kalchmEngine = {
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
  calculateKAlchm,
  calculateMonicaConstant,
  calculateAlchemicalProperties,
  calculateElementalValues,
  calculateKalchmResults,
  toElementalProperties,
  getDominantProperty
}

export default kalchmEngine,
