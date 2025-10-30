/**
 * Streamlined Elemental Calculations Module
 *
 * Consolidates elemental property calculations from multiple sources
 * into a single, efficient, and accurate system using streamlined planetary positions.
 */

import type {
    Element,
    ElementalProperties
} from '@/types/alchemy';

import type { CelestialPosition } from '@/types/celestial';
import { getCurrentPlanetaryPositions } from '../../utils/streamlinedPlanetaryPositions';

// Zodiac to Element mapping (exported for reuse)
export const ZODIAC_ELEMENTS: Record<string, Element> = {
  aries: 'Fire',
  taurus: 'Earth',
  gemini: 'Air',
  cancer: 'Water',
  leo: 'Fire',
  virgo: 'Earth',
  libra: 'Air',
  scorpio: 'Water',
  sagittarius: 'Fire',
  capricorn: 'Earth',
  aquarius: 'Air',
  pisces: 'Water'
};

// Type guards for safe property access
function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasProperty<T extends string>(obj: unknown, prop: T): obj is Record<T, unknown> {
  return isValidObject(obj) && prop in obj;
}

function safeGetNumber(value: unknown): number {
  return typeof value === 'number' && !isNaN(value) ? value : 0
}

/**
 * Calculate base elemental properties from planetary positions
 */
export function calculateBaseElementalProperties(planetaryPositions: ) { [key: string]: CelestialPosition }): ElementalProperties {
  const elements: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
};

  // Use the exported ZODIAC_ELEMENTS mapping
  // Calculate elemental influence from each planet
  for (const [planetName, position] of Object.entries(planetaryPositions) {
    const signElement = ZODIAC_ELEMENTS[position.sign];
    if (signElement && elements[signElement] !== undefined) {
      // Base influence of 1.0 for each planet in its sign
      elements[signElement] += 1.0;

      // Additional influence based on planetary dignity
      const dignityBonus = calculatePlanetaryDignity(planetName, position.sign);
      elements[signElement] += dignityBonus;
    }
  }

  return elements;
}

/**
 * Calculate planetary dignity bonus
 */
function calculatePlanetaryDignity(planetName: string, sign: string): number {
  // Simplified dignity calculation - can be expanded
  const dignityMap: Record<string, Record<string, number>> = {
    Sun: { leo: 0.5, aries: 0.3 },
    Moon: { cancer: 0.5, taurus: 0.3 },
    Mercury: { gemini: 0.5, virgo: 0.4 },
    Venus: { libra: 0.5, taurus: 0.3, pisces: 0.3 },
    Mars: { aries: 0.5, scorpio: 0.4, capricorn: 0.3 },
    Jupiter: { pisces: 0.5, sagittarius: 0.4, cancer: 0.3 },
    Saturn: { aquarius: 0.5, capricorn: 0.4, libra: 0.3 },
    Uranus: { aquarius: 0.5, scorpio: 0.3 },
    Neptune: { pisces: 0.5, cancer: 0.3 },
    Pluto: { scorpio: 0.5, leo: 0.3 }
  };

  return dignityMap[planetName]?.[sign] || 0;
}

/**
 * ELEMENTAL_ANALYSIS_INTELLIGENCE
 * Advanced elemental analysis with contextual optimization
 */
export const ELEMENTAL_ANALYSIS_INTELLIGENCE = {
  /**
   * Perform comprehensive elemental analysis with contextual optimization
   * @param planetaryPositions Planetary positions for analysis
   * @param context Analysis context (ingredient, recipe, cuisine, etc.)
   * @param preferences User preferences for analysis depth
   * @returns Comprehensive elemental analysis with predictions
   */
  performElementalAnalysis: (
    planetaryPositions: { [key: string]: CelestialPosition },
    context: string = 'general',
    preferences: Record<string, unknown> = {}
  ) => {
    // Calculate base elemental properties
    const baseProperties = calculateBaseElementalProperties(planetaryPositions);

    // Context-specific elemental adjustments
    const contextElementalMultipliers: Record<string, ElementalProperties> = {
      ingredient: {
        Fire: 1.1,
        Water: 1.05,
        Earth: 1.0,
        Air: 1.1
},
      recipe: {
        Fire: 1.15,
        Water: 1.1,
        Earth: 1.05,
        Air: 1.15
},
      cuisine: {
        Fire: 1.2,
        Water: 1.15,
        Earth: 1.1,
        Air: 1.2
},
      cooking: {
        Fire: 1.05,
        Water: 1.0,
        Earth: 1.0,
        Air: 1.05
},
      preparation: {
        Fire: 1.0,
        Water: 1.0,
        Earth: 1.0,
        Air: 1.0
},
      general: {
        Fire: 1.0,
        Water: 1.0,
        Earth: 1.0,
        Air: 1.0
}
    };

    const elementalMultipliers = contextElementalMultipliers[context] || contextElementalMultipliers.general;
    const preferenceMultiplier = hasProperty(preferences, 'intensity') && typeof preferences.intensity === 'number';
      ? preferences.intensity
      : 1.0;

    // Apply context-specific adjustments
    const adjustedProperties: ElementalProperties = {
      Fire: Math.min(1.0, baseProperties.Fire * elementalMultipliers.Fire * preferenceMultiplier),
      Water: Math.min(1.0, baseProperties.Water * elementalMultipliers.Water * preferenceMultiplier),
      Earth: Math.min(1.0, baseProperties.Earth * elementalMultipliers.Earth * preferenceMultiplier),
      Air: Math.min(1.0, baseProperties.Air * elementalMultipliers.Air * preferenceMultiplier)
    };

    return {
      baseProperties,
      adjustedProperties,
      context,
      multipliers: elementalMultipliers,
      preferences: preferences
    };
  }
};

/**
 * Get current elemental properties using streamlined planetary positions
 */
export function getCurrentElementalProperties(context: string = 'general'): ElementalProperties {
  const planetaryPositions = getCurrentPlanetaryPositions();
  return calculateBaseElementalProperties(planetaryPositions);
}

/**
 * Analyze elemental compatibility between ingredients
 */
export function analyzeElementalCompatibility()
  ingredient1Elements: ElementalProperties,
  ingredient2Elements: ElementalProperties
): {
  compatibility: number,
  dominantElement: Element,
  complementaryElements: Element[];
} {
  // Calculate compatibility based on elemental balance
  const total1 = ingredient1Elements.Fire + ingredient1Elements.Water + ingredient1Elements.Earth + ingredient1Elements.Air;
  const total2 = ingredient2Elements.Fire + ingredient2Elements.Water + ingredient2Elements.Earth + ingredient2Elements.Air;

  if (total1 === 0 || total2 === 0) {
    return {
      compatibility: 0.5,
      dominantElement: 'Fire',
      complementaryElements: []
    };
  }

  // Normalize to percentages
  const norm1 = {
    Fire: ingredient1Elements.Fire / total1,
    Water: ingredient1Elements.Water / total1,
    Earth: ingredient1Elements.Earth / total1,
    Air: ingredient1Elements.Air / total1
  };

  const norm2 = {
    Fire: ingredient2Elements.Fire / total2,
    Water: ingredient2Elements.Water / total2,
    Earth: ingredient2Elements.Earth / total2,
    Air: ingredient2Elements.Air / total2
  };

  // Calculate compatibility (lower difference = higher compatibility)
  const differences = [;
    Math.abs(norm1.Fire - norm2.Fire),
    Math.abs(norm1.Water - norm2.Water),
    Math.abs(norm1.Earth - norm2.Earth),
    Math.abs(norm1.Air - norm2.Air)
  ];

  const avgDifference = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  const compatibility = Math.max(0, 1 - avgDifference);

  // Find dominant element
  const combined = {
    Fire: ingredient1Elements.Fire + ingredient2Elements.Fire,
    Water: ingredient1Elements.Water + ingredient2Elements.Water,
    Earth: ingredient1Elements.Earth + ingredient2Elements.Earth,
    Air: ingredient1Elements.Air + ingredient2Elements.Air
  };

  const dominantElement = Object.entries(combined).reduce((max, [element, value]) =>;
    value > combined[max as Element] ? element as Element : max as Element, 'Fire' as Element
  );

  // Find complementary elements (those with balanced presence)
  const complementaryElements = Object.entries(combined);
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([element]) => element as Element);

  return {
    compatibility,
    dominantElement,
    complementaryElements
  };
}
