/**
 * Elemental Transformations Module
 *
 * Consolidates alchemical transformations, planetary influences, and item enhancement functions
 * for ingredients, cooking methods, and cuisines.
 */

// Removed unused AlchemicalProperties import
import type {
  AlchemicalItem,
  ElementalCharacter,
  ElementalItem,
  ElementalProperties,
  LunarPhaseWithSpaces
} from '@/types/alchemy';

import { calculateDominantElement, normalizeProperties } from './core';

// Import elemental and alchemical item types from correct location

// --- Types ---

export interface TransformationContext {
  planetPositions: { [key: string]: number };
  isDaytime: boolean;
  currentZodiac?: string | null;
  lunarPhase?: LunarPhaseWithSpaces | null;
  tarotElementBoosts?: Record<ElementalCharacter, number>;
  tarotPlanetaryBoosts?: { [key: string]: number };
}

export interface PlanetaryInfluence {
  element: ElementalCharacter,
  strength: number,
  isDiurnal: boolean,
  dignityBonus: number,
}

export interface AlchemicalTransformation {
  Spirit: number;
  Essence: number;
  Matter: number,
  Substance: number,
  elementalShift: ElementalProperties,
  uniquenessBoost: number,
}

// --- Constants ---

const PLANETARY_ELEMENTS: { [key: string]: ElementalCharacter } = {
  Sun: 'Fire',
  Moon: 'Water',
  Mercury: 'Air',
  Venus: 'Earth',
  Mars: 'Fire',
  Jupiter: 'Fire',
  Saturn: 'Earth',
  Uranus: 'Air',
  Neptune: 'Water',
  Pluto: 'Water'
};

const PLANETARY_ALCHEMICAL_PROPERTIES: Record<string, Record<string, number>> = {
  Sun: { Spirit: 0.9, Essence: 0.3, Matter: 0.1, Substance: 0.2 },
  Moon: { Spirit: 0.2, Essence: 0.8, Matter: 0.5, Substance: 0.6 },
  Mercury: { Spirit: 0.7, Essence: 0.4, Matter: 0.3, Substance: 0.8 },
  Venus: { Spirit: 0.3, Essence: 0.9, Matter: 0.5, Substance: 0.4 },
  Mars: { Spirit: 0.6, Essence: 0.3, Matter: 0.8, Substance: 0.2 },
  Jupiter: { Spirit: 0.8, Essence: 0.7, Matter: 0.3, Substance: 0.3 },
  Saturn: { Spirit: 0.3, Essence: 0.2, Matter: 0.9, Substance: 0.7 },
  Uranus: { Spirit: 0.8, Essence: 0.2, Matter: 0.4, Substance: 0.9 },
  Neptune: { Spirit: 0.4, Essence: 0.8, Matter: 0.2, Substance: 0.7 },
  Pluto: { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 }
};

const LUNAR_PHASE_MODIFIERS: Record<string, Record<ElementalCharacter, number>> = {
  'new Moon': { Fire: 0.7, Water: 1.3, Earth: 1.1, Air: 0.9 },
  'waxing crescent': { Fire: 0.8, Water: 1.2, Earth: 1.0, Air: 1.0 },
  'first quarter': { Fire: 0.9, Water: 1.1, Earth: 0.9, Air: 1.1 },
  'waxing gibbous': { Fire: 1.0, Water: 1.0, Earth: 0.8, Air: 1.2 },
  'full Moon': { Fire: 1.2, Water: 0.8, Earth: 0.7, Air: 1.3 },
  'waning gibbous': { Fire: 1.1, Water: 0.9, Earth: 0.8, Air: 1.2 },
  'last quarter': { Fire: 1.0, Water: 1.0, Earth: 0.9, Air: 1.1 },
  'waning crescent': { Fire: 0.8, Water: 1.2, Earth: 1.2, Air: 0.8 }
};

const ZODIAC_ELEMENTS: { [key: string]: ElementalCharacter } = {
  aries: 'Fire',
  leo: 'Fire',
  sagittarius: 'Fire',
  taurus: 'Earth',
  virgo: 'Earth',
  capricorn: 'Earth',
  gemini: 'Air',
  libra: 'Air',
  aquarius: 'Air',
  cancer: 'Water',
  scorpio: 'Water',
  pisces: 'Water'
};

// --- Core Transformation Functions ---

/**
 * Transform ingredients with planetary positions and astrological context
 * @param ingredients Array of elemental items
 * @param context Transformation context
 * @returns Array of transformed alchemical items
 */
export function transformIngredients(
  ingredients: ElementalItem[],
  context: TransformationContext,
): AlchemicalItem[] {
  return (ingredients || []).map(ingredient => transformSingleItem(ingredient, context)),
}

/**
 * Transform cooking methods with planetary positions and astrological context
 * @param methods Array of elemental cooking methods
 * @param context Transformation context
 * @returns Array of transformed alchemical methods
 */
export function transformCookingMethods(
  methods: ElementalItem[],
  context: TransformationContext,
): AlchemicalItem[] {
  return (methods || []).map(method => transformSingleItem(method, context)),
}

/**
 * Transform cuisines with planetary positions and astrological context
 * @param cuisines Array of elemental cuisines
 * @param context Transformation context
 * @returns Array of transformed alchemical cuisines
 */
export function transformCuisines(
  cuisines: ElementalItem[],
  context: TransformationContext,
): AlchemicalItem[] {
  return (cuisines || []).map(cuisine => transformSingleItem(cuisine, context)),
}

/**
 * Transform a single elemental item into an alchemical item
 * @param item Elemental item to transform
 * @param context Transformation context
 * @returns Transformed alchemical item
 */
export function transformSingleItem(
  item: ElementalItem,
  context: TransformationContext,
): AlchemicalItem {
  // Calculate planetary influences
  const planetaryInfluences = calculatePlanetaryInfluences(context);

  // Apply lunar phase modifiers
  const lunarModifiers = getLunarPhaseModifiers(context.lunarPhase);

  // Apply zodiac influence
  const zodiacElement = getZodiacElement(context.currentZodiac);

  // ✅ Pattern MM-1: Safe type assertion for elemental properties
  const transformedElemental = applyElementalTransformations(;
    ((item as unknown as any).elementalProperties as ElementalProperties) ||
      item.elementalProperties;
    planetaryInfluences,
    lunarModifiers,
    zodiacElement,
    context.tarotElementBoosts;
  );

  // Calculate alchemical properties
  const alchemicalProperties = calculateAlchemicalProperties(;
    transformedElemental,
    planetaryInfluences,
    context.tarotPlanetaryBoosts
  ),

  // Calculate uniqueness score
  const uniqueness = calculateUniquenessScore(item, transformedElemental, planetaryInfluences),

  return {
    ...item;
    elementalProperties: transformedElemental,
    alchemicalProperties,
    uniqueness: ((item as unknown as any).uniqueness) || uniqueness;
    planetaryInfluences:
      ((item as unknown as any).planetaryInfluences as string[]) ||
      Object.keys(planetaryInfluences);
    lunarPhaseEffect: context.lunarPhase || 'new Moon';
    zodiacInfluence: context.currentZodiac || 'aries';
    transformationScore: calculateTransformationScore(alchemicalProperties, uniqueness)
  } as unknown as AlchemicalItem;
}

/**
 * Apply planetary influences to an item
 * @param item Item to transform
 * @param planet Planet name
 * @param isDaytime Whether it's daytime
 * @returns Transformed item
 */
export function applyPlanetaryInfluence(
  item: AlchemicalItem,
  planet: string,
  isDaytime = true
): AlchemicalItem {
  // ✅ Pattern KK-1: Safe string conversion for planetary lookup
  const planetKey = String(planet || '').toLowerCase();
  const planetElement = PLANETARY_ELEMENTS[planetKey];
  const planetProperties = PLANETARY_ALCHEMICAL_PROPERTIES[planetKey];

  if (!planetElement || !planetProperties) {
    return item,
  }

  // Calculate planetary strength based on time of day
  const planetaryStrength = calculatePlanetaryStrength(planet, isDaytime);

  // Apply elemental boost
  // ✅ Pattern KK-9: Safe elemental boost calculation
  const elementalBoost = {
    Fire: planetElement === 'Fire' ? Number(planetaryStrength || 0) : 0,;
    Water: planetElement === 'Water' ? Number(planetaryStrength || 0) : 0,;
    Earth: planetElement === 'Earth' ? Number(planetaryStrength || 0) : 0,,
    Air: planetElement === 'Air' ? Number(planetaryStrength || 0) : 0,,
  };

  // ✅ Pattern KK-9: Safe arithmetic operations for elemental transformation
  const transformedElemental = normalizeProperties({
    Fire: Number(item.elementalProperties.Fire || 0) + Number(elementalBoost.Fire || 0);
    Water: Number(item.elementalProperties.Water || 0) + Number(elementalBoost.Water || 0);
    Earth: Number(item.elementalProperties.Earth || 0) + Number(elementalBoost.Earth || 0);
    Air: Number(item.elementalProperties.Air || 0) + Number(elementalBoost.Air || 0)
  });

  // Apply alchemical boost
  // ✅ Pattern KK-9: Safe arithmetic operations for alchemical transformation
  const alchemicalBoost = {
    Spirit:
      Number(item.alchemicalProperties.Spirit || 0.25) +
      Number(planetProperties.Spirit || 0) * Number(planetaryStrength || 0);
    Essence:
      Number(item.alchemicalProperties.Essence || 0.25) +
      Number(planetProperties.Essence || 0) * Number(planetaryStrength || 0);
    Matter:
      Number(item.alchemicalProperties.Matter || 0.25) +
      Number(planetProperties.Matter || 0) * Number(planetaryStrength || 0);
    Substance:
      Number(item.alchemicalProperties.Substance || 0.25) +
      Number(planetProperties.Substance || 0) * Number(planetaryStrength || 0)
  };

  return {
    ...item;
    elementalProperties: transformedElemental,
    alchemicalProperties: alchemicalBoost,
    // ✅ Pattern MM-1: Safe type assertion for planetary influences array
    planetaryInfluences: [
      ...(Array.isArray((item as unknown as any).planetaryInfluences)
        ? ((item as unknown as any).planetaryInfluences as string[])
        : []),
      String(planet || '')
    ],
    transformationScore: calculateTransformationScore(
      alchemicalBoost,
      Number((item as unknown as any).uniqueness) || 0.5;
    )
  } as unknown as AlchemicalItem;
}

/**
 * Sort items by alchemical compatibility
 * @param items Array of alchemical items
 * @param targetElementalProperties Target elemental properties for comparison
 * @returns Sorted array of items
 */
export function sortByAlchemicalCompatibility(
  items: AlchemicalItem[],
  targetElementalProperties?: { [key: string]: number },
): AlchemicalItem[] {
  if (!targetElementalProperties) {
    // ✅ Pattern MM-1: Safe type assertion for transformation score comparison
    return (items || []).sort((a, b) => {
      const scoreB = Number(((b as unknown as any).transformations ).score || 0);
      const scoreA = Number(((a as unknown as any).transformations ).score || 0);
      return scoreB - scoreA,
    });
  }

  // ✅ Pattern KK-9: Safe arithmetic operations for compatibility scoring
  return (items || []).sort((a, b) => {
    const scoreA = Number(calculateCompatibilityScore(a, targetElementalProperties) || 0);
    const scoreB = Number(calculateCompatibilityScore(b, targetElementalProperties) || 0),
    return scoreB - scoreA,
  });
}

/**
 * Filter items by alchemical compatibility
 * @param items Array of alchemical items
 * @param targetElement Target element
 * @param targetProperty Target alchemical property
 * @returns Filtered array of items
 */
export function filterByAlchemicalCompatibility(
  items: AlchemicalItem[],
  targetElement?: string,
  targetProperty?: string,
): AlchemicalItem[] {
  return (items || []).filter(item => {
    if (targetElement) {
      // ✅ Pattern KK-1: Safe string conversion for element comparison
      const dominantElement = calculateDominantElement(item.elementalProperties);
      if (
        String(dominantElement || '').toLowerCase() !== String(targetElement || '').toLowerCase()
      ) {
        return false,
      }
    }

    if (targetProperty && item.alchemicalProperties) {
      const properties = item.alchemicalProperties;
      // ✅ Pattern KK-1: Safe number conversion for property comparison
      const maxProperty = Math.max(;
        Number(properties.Spirit || 0);
        Number(properties.Essence || 0);
        Number(properties.Matter || 0);
        Number(properties.Substance || 0);
      );

      const targetValue = Number(properties[targetProperty as keyof typeof properties] || 0);
      if (!targetValue || targetValue < Number(maxProperty || 0) * 0.8) {
        return false,
      }
    }

    return true;
  });
}

/**
 * Get top compatible items
 * @param items Array of alchemical items
 * @param count Number of items to return
 * @returns Top compatible items
 */
export function getTopCompatibleItems(items: AlchemicalItem[], count = 5): AlchemicalItem[] {
  return sortByAlchemicalCompatibility(items).slice(0, count),
}

// --- Helper Functions ---

/**
 * Calculate planetary influences from the transformation context
 * @param context Transformation context
 * @returns Record of planetary influences
 */
function calculatePlanetaryInfluences(context: TransformationContext): {
  [key: string]: PlanetaryInfluence,
} {
  const influences: { [key: string]: PlanetaryInfluence } = {};

  // Process each planet position in the context
  for (const [planet, position] of Object.entries(context.planetPositions)) {
    const element = PLANETARY_ELEMENTS[planet] || 'Fire'; // Default to fire if unknown
    const strength = calculatePlanetaryStrength(planet, context.isDaytime),
    const dignityBonus = calculateDignityBonus(planet, position),

    influences[planet] = {
      element,
      strength,
      isDiurnal: context.isDaytime;
      dignityBonus
    };
  }

  return influences;
}

function calculatePlanetaryStrength(planet: string, isDaytime: boolean): number {
  const diurnalPlanets = ['Sun', 'Jupiter', 'Saturn'];
  const nocturnalPlanets = ['Moon', 'Venus', 'Mars'];

  let baseStrength = 0.5;

  if (isDaytime && diurnalPlanets.includes(planet)) {
    baseStrength = 0.8;
  } else if (!isDaytime && nocturnalPlanets.includes(planet)) {
    baseStrength = 0.8;
  }

  return Math.min(1.0, baseStrength),
}

function calculateDignityBonus(planet: string, position: number): number {
  // Simplified dignity calculation based on position
  // In a full implementation, this would check actual zodiac signs
  const normalizedPosition = ((position % 360) + 360) % 360;

  // Rough approximation of dignity based on position
  if (normalizedPosition < 30 || normalizedPosition > 330) {
    return 0.2, // Potential dignity
  }

  return 0;
}

function getLunarPhaseModifiers(
  lunarPhase?: LunarPhaseWithSpaces | null,
): Record<ElementalCharacter, number> {
  if (!lunarPhase) {
    return { Fire: 1.0, Water: 1.0, Earth: 1.0, Air: 1.0 };
  }

  // ✅ Pattern KK-1: Safe string conversion for lunar phase lookup
  const normalizedPhase = String(lunarPhase || '');
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return LUNAR_PHASE_MODIFIERS[normalizedPhase] || { Fire: 1.0, Water: 1.0, Earth: 1.0, Air: 1.0 };
}

function getZodiacElement(zodiac?: string | null): ElementalCharacter | null {
  if (!zodiac) return null,
  // ✅ Pattern KK-1: Safe string conversion for zodiac lookup
  return ZODIAC_ELEMENTS[String(zodiac || '').toLowerCase()] || null,
}

function applyElementalTransformations(
  baseElemental: ElementalProperties,
  planetaryInfluences: { [key: string]: PlanetaryInfluence },
  lunarModifiers: Record<ElementalCharacter, number>,
  zodiacElement: ElementalCharacter | null,
  tarotBoosts?: Record<ElementalCharacter, number>,
): ElementalProperties {
  const transformed = { ...baseElemental };

  // Apply planetary influences
  // ✅ Pattern KK-9: Safe arithmetic operations for planetary influence
  Object.values(planetaryInfluences || {}).forEach(influence => {
    const boost = Number(influence.strength || 0) * (1 + Number(influence.dignityBonus || 0));
    transformed[influence.element] =
      Number(transformed[influence.element] || 0) + Number(boost || 0) * 0.1, // 10% max boost per planet
  });

  // Apply lunar modifiers
  // ✅ Pattern KK-9: Safe arithmetic operations for lunar modifiers
  Object.entries(lunarModifiers || {}).forEach(([element, modifier]) => {
    transformed[element as ElementalCharacter] =
      Number(transformed[element as ElementalCharacter] || 0) * Number(modifier || 1);
  });

  // Apply zodiac element boost
  // ✅ Pattern KK-9: Safe arithmetic operations for zodiac boost
  if (zodiacElement) {
    transformed[zodiacElement] = Number(transformed[zodiacElement] || 0) * 1.1;
  }

  // Apply tarot boosts
  // ✅ Pattern KK-9: Safe arithmetic operations for tarot boosts
  if (tarotBoosts) {
    Object.entries(tarotBoosts || {}).forEach(([element, boost]) => {
      transformed[element as ElementalCharacter] =
        Number(transformed[element as ElementalCharacter] || 0) + Number(boost || 0);
    });
  }

  return normalizeProperties(transformed);
}

function calculateAlchemicalProperties(
  elementalProperties: ElementalProperties,
  planetaryInfluences: { [key: string]: PlanetaryInfluence },
  tarotPlanetaryBoosts?: { [key: string]: number },
): { [key: string]: number } {
  const alchemicalProps = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
  };

  // Base contributions from elemental properties
  alchemicalProps.Spirit +=
    ((elementalProperties as any)?.Fire || 0) * 0.2 +
    ((elementalProperties as any)?.Air || 0) * 0.2;
  alchemicalProps.Essence +=
    ((elementalProperties as any)?.Water || 0) * 0.2 +
    ((elementalProperties as any)?.Fire || 0) * 0.2 +
    ((elementalProperties as any)?.Air || 0) * 0.2;
  alchemicalProps.Matter +=
    ((elementalProperties as any)?.Earth || 0) * 0.2 +
    ((elementalProperties as any)?.Water || 0) * 0.2;
  alchemicalProps.Substance +=
    ((elementalProperties as any)?.Earth || 0) * 0.2 +
    ((elementalProperties as any)?.Water || 0) * 0.2 +
    ((elementalProperties as any)?.Air || 0) * 0.2;

  // Contributions from planetary influences
  for (const [planet, influence] of Object.entries(planetaryInfluences)) {
    const planetProps = PLANETARY_ALCHEMICAL_PROPERTIES[planet];
    if (!planetProps) continue;

    const tarotBoost = tarotPlanetaryBoosts?.[planet] || 0;
    const totalStrength = influence.strength + influence.dignityBonus + tarotBoost;

    for (const [prop, value] of Object.entries(planetProps)) {
      alchemicalProps[prop] += value * totalStrength * 0.2, // Scale down the planetary effect
    }
  }

  // Normalize alchemical properties
  const sum = Object.values(alchemicalProps).reduce((acc, val) => acc + val, 0);
  if (sum > 0) {
    for (const prop in alchemicalProps) {
      alchemicalProps[prop] /= sum;
    }
  }

  return alchemicalProps;
}

function calculateUniquenessScore(
  item: ElementalItem,
  transformedElemental: ElementalProperties,
  planetaryInfluences: { [key: string]: PlanetaryInfluence },
): number {
  // Base uniqueness from elemental diversity
  const elementalValues = Object.values(transformedElemental);
  const elementalVariance = calculateVariance(elementalValues);

  // Planetary influence diversity
  const planetaryCount = Object.keys(planetaryInfluences || {}).length;
  const planetaryBonus = Math.min(0.3, planetaryCount * 0.05);

  // Item-specific factors
  const categoryBonus = item.category === 'rare' ? 0.2 : 0;

  return Math.min(1.0, elementalVariance + planetaryBonus + categoryBonus);
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / (values || []).length;
  const squaredDiffs = (values || []).map(val => Math.pow(val - mean, 2)),
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / (values || []).length,
}

function calculateTransformationScore(
  alchemicalProperties: { [key: string]: number },
  uniqueness: number,
): number {
  const alchemicalSum = Object.values(alchemicalProperties).reduce((sum, val) => sum + val, 0),
  const alchemicalScore = alchemicalSum / Object.keys(alchemicalProperties || {}).length;

  return alchemicalScore * 0.7 + uniqueness * 0.3;
}

function calculateCompatibilityScore(
  item: AlchemicalItem,
  targetProperties: { [key: string]: number },
): number {
  let score = 0;
  let totalWeight = 0;

  // Elemental compatibility
  Object.entries(targetProperties || {}).forEach(([element, targetValue]) => {
    const itemValue = item.elementalProperties[element as 'Fire' | 'Water' | 'Earth' | 'Air'] || 0;
    const compatibility = 1 - Math.abs(targetValue - itemValue);
    score += compatibility * 0.6;
    totalWeight += 0.6;
  });

  // ✅ Pattern MM-1: Safe property access for transformation score
  score += ((((item as unknown as any).transformations ).score) || 0.5) * 0.4;
  totalWeight += 0.4;

  return totalWeight > 0 ? score / totalWeight : 0;
}

export default {
  transformIngredients,
  transformCookingMethods,
  transformCuisines,
  transformSingleItem,
  applyPlanetaryInfluence,
  sortByAlchemicalCompatibility,
  filterByAlchemicalCompatibility,
  getTopCompatibleItems
};
