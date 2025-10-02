/**
 * Planetary Alchemy Mapping - Authoritative Source
 *
 * This module contains the ONLY correct method for calculating ESMS properties
 * (Spirit, Essence, Matter, Substance) from planetary positions.
 *
 * CRITICAL: ESMS values CANNOT be derived from elemental properties (Fire/Water/Earth/Air).
 * They MUST be calculated from planetary alchemy values.
 *
 * Based on the core alchemizer engine specification.
 */

import type { ElementalProperties } from '@/types/alchemy';

export interface AlchemicalProperties {
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number;
}

/**
 * Planetary Alchemy Values (Authoritative from Alchemizer Engine)
 *
 * Each planet contributes specific ESMS values:
 * - Sun: Pure Spirit (consciousness, vitality)
 * - Moon: Essence + Matter (emotion, substance)
 * - Mercury: Spirit + Substance (intellect, communication)
 * - Venus: Essence + Matter (beauty, harmony)
 * - Mars: Essence + Matter (action, energy)
 * - Jupiter: Spirit + Essence (expansion, wisdom)
 * - Saturn: Spirit + Matter (structure, discipline)
 * - Uranus: Essence + Matter (innovation, change)
 * - Neptune: Essence + Substance (intuition, dissolution)
 * - Pluto: Essence + Matter (transformation, power)
 */
export const PLANETARY_ALCHEMY = {
  Sun: { Spirit: 1, Essence: 0, Matter: 0, Substance: 0 },
  Moon: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mercury: { Spirit: 1, Essence: 0, Matter: 0, Substance: 1 },
  Venus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Mars: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Jupiter: { Spirit: 1, Essence: 1, Matter: 0, Substance: 0 },
  Saturn: { Spirit: 1, Essence: 0, Matter: 1, Substance: 0 },
  Uranus: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 },
  Neptune: { Spirit: 0, Essence: 1, Matter: 0, Substance: 1 },
  Pluto: { Spirit: 0, Essence: 1, Matter: 1, Substance: 0 }
} as const;

/**
 * Zodiac Sign to Element Mapping
 *
 * Used to aggregate elemental properties from planetary positions.
 * Each planet's sign contributes its element to the total.
 */
export const ZODIAC_ELEMENTS = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water'
} as const;

export type ZodiacSign = keyof typeof ZODIAC_ELEMENTS;
export type PlanetName = keyof typeof PLANETARY_ALCHEMY;

/**
 * Calculate ESMS (Alchemical) Properties from Planetary Positions
 *
 * This is the ONLY correct method for deriving Spirit, Essence, Matter, and Substance.
 *
 * @param planetaryPositions - Map of planet names to zodiac sign positions
 * @returns Alchemical properties (Spirit, Essence, Matter, Substance)
 *
 * @example
 * const positions = {
 *   Sun: 'Gemini',
 *   Moon: 'Leo',
 *   Mercury: 'Taurus',
 *   Venus: 'Gemini',
 *   Mars: 'Aries',
 *   Jupiter: 'Gemini',
 *   Saturn: 'Pisces',
 *   Uranus: 'Taurus',
 *   Neptune: 'Aries',
 *   Pluto: 'Aquarius'
 * };
 * const alchemical = calculateAlchemicalFromPlanets(positions);
 * // Result: { Spirit: 4, Essence: 6, Matter: 6, Substance: 2 }
 */
export function calculateAlchemicalFromPlanets(
  planetaryPositions: { [planet: string]: string }
): AlchemicalProperties {
  const totals: AlchemicalProperties = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
};

  for (const planet in planetaryPositions) {
    const planetData = PLANETARY_ALCHEMY[planet as PlanetName];
    if (!planetData) {
      console.warn(`Unknown planet in alchemical calculation: ${planet}`),
      continue;
    }

    // Sum each planetary contribution
    totals.Spirit += planetData.Spirit;
    totals.Essence += planetData.Essence;
    totals.Matter += planetData.Matter;
    totals.Substance += planetData.Substance;
  }

  return totals;
}

/**
 * Aggregate Elemental Properties from Zodiac Sign Positions
 *
 * Each planet's zodiac sign contributes its element to the total.
 * Results are normalized to sum to 1.0.
 *
 * @param planetaryPositions - Map of planet names to zodiac sign positions
 * @returns Normalized elemental properties (Fire, Water, Earth, Air)
 *
 * @example
 * const positions = { Sun: 'Gemini', Moon: 'Leo', Mercury: 'Taurus' };
 * const elementals = aggregateZodiacElementals(positions);
 * // Result: { Fire: 0.33, Water: 0, Earth: 0.33, Air: 0.33 }
 */
export function aggregateZodiacElementals(
  planetaryPositions: { [planet: string]: string }
): ElementalProperties {
  const totals = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
};

  let count = 0;

  for (const planet in planetaryPositions) {
    const sign = planetaryPositions[planet] as ZodiacSign;
    const element = ZODIAC_ELEMENTS[sign];

    if (!element) {
      console.warn(`Unknown zodiac sign in elemental aggregation: ${sign}`),
      continue;
    }

    // Each planet in a sign contributes 1 to that sign's element
    totals[element] += 1;
    count += 1;
  }

  // Normalize to sum = 1.0
  if (count === 0) {
    // Default to balanced if no valid positions
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: totals.Fire / count,
    Water: totals.Water / count,
    Earth: totals.Earth / count,
    Air: totals.Air / count
  };
}

/**
 * Get the dominant alchemical property
 *
 * @param alchemical - Alchemical properties
 * @returns The name of the dominant property
 */
export function getDominantAlchemicalProperty(
  alchemical: AlchemicalProperties
): keyof AlchemicalProperties {
  const entries = Object.entries(alchemical) as [keyof AlchemicalProperties, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Get the dominant element from elemental properties
 *
 * @param elemental - Elemental properties
 * @returns The name of the dominant element
 */
export function getDominantElement(
  elemental: ElementalProperties
): keyof ElementalProperties {
  const entries = Object.entries(elemental) as [keyof ElementalProperties, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Validate planetary positions object
 *
 * @param positions - Object to validate
 * @returns True if valid, false otherwise
 */
export function validatePlanetaryPositions(
  positions: unknown
): positions is { [planet: string]: string } {
  if (typeof positions !== 'object' || positions === null) {
    return false;
  }

  const posObj = positions as { [key: string]: unknown };

  // Check that all values are strings
  for (const key in posObj) {
    if (typeof posObj[key] !== 'string') {
      return false;
    }
  }

  return true;
}
