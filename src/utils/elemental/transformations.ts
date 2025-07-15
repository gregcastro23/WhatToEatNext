/**
 * Elemental Transformations Module
 * 
 * Consolidates alchemical transformations, planetary influences, and item enhancement functions
 * for ingredients, cooking methods, and cuisines.
 */

import type { ElementalProperties, 
  Element, 
  ElementalCharacter,
  LunarPhase,
  LunarPhaseWithSpaces,
  ZodiacSign } from "@/types/alchemy";

import { normalizeProperties, calculateDominantElement } from './core';

import { AlchemicalProperties } from "@/types/alchemy";

// Import elemental and alchemical item types from correct location
import type { 
  ElementalItem,
  AlchemicalItem 
} from '@/types/alchemy';


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
  element: ElementalCharacter;
  strength: number;
  isDiurnal: boolean;
  dignityBonus: number;
}

export interface AlchemicalTransformation {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  elementalShift: ElementalProperties;
  uniquenessBoost: number;
}

// --- Constants ---

const PLANETARY_ELEMENTS: { [key: string]: ElementalCharacter } = {
  'Sun': 'Fire',
  'Moon': 'Water',
  'Mercury': 'Air',
  'Venus': 'Earth',
  'Mars': 'Fire',
  'Jupiter': 'Fire',
  'Saturn': 'Earth',
  'Uranus': 'Air',
  'Neptune': 'Water',
  'Pluto': 'Water'
};

const PLANETARY_ALCHEMICAL_PROPERTIES: Record<string, Record<string, number>> = {
  'Sun': { Spirit: 0.9, Essence: 0.3, Matter: 0.1, Substance: 0.2 },
  'Moon': { Spirit: 0.2, Essence: 0.8, Matter: 0.5, Substance: 0.6 },
  'Mercury': { Spirit: 0.7, Essence: 0.4, Matter: 0.3, Substance: 0.8 },
  'Venus': { Spirit: 0.3, Essence: 0.9, Matter: 0.5, Substance: 0.4 },
  'Mars': { Spirit: 0.6, Essence: 0.3, Matter: 0.8, Substance: 0.2 },
  'Jupiter': { Spirit: 0.8, Essence: 0.7, Matter: 0.3, Substance: 0.3 },
  'Saturn': { Spirit: 0.3, Essence: 0.2, Matter: 0.9, Substance: 0.7 },
  'Uranus': { Spirit: 0.8, Essence: 0.2, Matter: 0.4, Substance: 0.9 },
  'Neptune': { Spirit: 0.4, Essence: 0.8, Matter: 0.2, Substance: 0.7 },
  'Pluto': { Spirit: 0.5, Essence: 0.7, Matter: 0.9, Substance: 0.4 }
};

const LUNAR_PHASE_MODIFIERS: Record<string, Record<ElementalCharacter, number>> = {
  'new Moon': { Fire: 0.7, Water: 1.3, Earth: 1.1, Air: 0.9  },
  'waxing crescent': { Fire: 0.8, Water: 1.2, Earth: 1.0, Air: 1.0  },
  'first quarter': { Fire: 0.9, Water: 1.1, Earth: 0.9, Air: 1.1  },
  'waxing gibbous': { Fire: 1.0, Water: 1.0, Earth: 0.8, Air: 1.2  },
  'full Moon': { Fire: 1.2, Water: 0.8, Earth: 0.7, Air: 1.3  },
  'waning gibbous': { Fire: 1.1, Water: 0.9, Earth: 0.8, Air: 1.2  },
  'last quarter': { Fire: 1.0, Water: 1.0, Earth: 0.9, Air: 1.1  },
  'waning crescent': { Fire: 0.8, Water: 1.2, Earth: 1.2, Air: 0.8  }
};

const ZODIAC_ELEMENTS: { [key: string]: ElementalCharacter } = {
  'aries': 'Fire', 'leo': 'Fire', 'sagittarius': 'Fire',
  'taurus': 'Earth', 'virgo': 'Earth', 'capricorn': 'Earth',
  'gemini': 'Air', 'libra': 'Air', 'aquarius': 'Air',
  'cancer': 'Water', 'scorpio': 'Water', 'pisces': 'Water'
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
  context: TransformationContext
): AlchemicalItem[] {
  return (ingredients || []).map(ingredient => transformSingleItem(ingredient, context));
}

/**
 * Transform cooking methods with planetary positions and astrological context
 * @param methods Array of elemental cooking methods
 * @param context Transformation context
 * @returns Array of transformed alchemical methods
 */
export function transformCookingMethods(
  methods: ElementalItem[],
  context: TransformationContext
): AlchemicalItem[] {
  return (methods || []).map(method => transformSingleItem(method, context));
}

/**
 * Transform cuisines with planetary positions and astrological context
 * @param cuisines Array of elemental cuisines
 * @param context Transformation context
 * @returns Array of transformed alchemical cuisines
 */
export function transformCuisines(
  cuisines: ElementalItem[],
  context: TransformationContext
): AlchemicalItem[] {
  return (cuisines || []).map(cuisine => transformSingleItem(cuisine, context));
}

/**
 * Transform a single elemental item into an alchemical item
 * @param item Elemental item to transform
 * @param context Transformation context
 * @returns Transformed alchemical item
 */
export function transformSingleItem(
  item: ElementalItem,
  context: TransformationContext
): AlchemicalItem {
  // Calculate planetary influences
  const planetaryInfluences = calculatePlanetaryInfluences(context);
  
  // Apply lunar phase modifiers
  const lunarModifiers = getLunarPhaseModifiers(context.lunarPhase);
  
  // Apply zodiac influence
  const zodiacElement = getZodiacElement(context.currentZodiac);
  
  // Transform elemental properties
  const transformedElemental = applyElementalTransformations(
    (item as Record<string, unknown>).elementalProperties || item.elementalProperties,
    planetaryInfluences,
    lunarModifiers,
    zodiacElement,
    context.tarotElementBoosts
  );
  
  // Calculate alchemical properties
  const alchemicalProperties = calculateAlchemicalProperties(
    transformedElemental,
    planetaryInfluences,
    context.tarotPlanetaryBoosts
  );
  
  // Calculate uniqueness score
  const uniqueness = calculateUniquenessScore(item, transformedElemental, planetaryInfluences);
  
  return {
    ...item,
    elementalProperties: transformedElemental,
    alchemicalProperties,
    uniqueness: (item as Record<string, unknown>).uniqueness || uniqueness,
    planetaryInfluences: (item as Record<string, unknown>).planetaryInfluences || Object.keys(planetaryInfluences),
    lunarPhaseEffect: context.lunarPhase || 'new Moon',
    zodiacInfluence: context.currentZodiac || 'aries',
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
  const planetElement = PLANETARY_ELEMENTS[planet?.toLowerCase()];
  const planetProperties = PLANETARY_ALCHEMICAL_PROPERTIES[planet?.toLowerCase()];
  
  if (!planetElement || !planetProperties) {
    return item;
  }
  
  // Calculate planetary strength based on time of day
  const planetaryStrength = calculatePlanetaryStrength(planet, isDaytime);
  
  // Apply elemental boost
  const elementalBoost = { Fire: planetElement === 'Fire' ? planetaryStrength : 0, Water: planetElement === 'Water' ? planetaryStrength : 0, Earth: planetElement === 'Earth' ? planetaryStrength : 0, Air: planetElement === 'Air' ? planetaryStrength : 0
   };
  
  const transformedElemental = normalizeProperties({ Fire: item.elementalProperties.Fire + elementalBoost.Fire, Water: item.elementalProperties.Water + elementalBoost.Water, Earth: item.elementalProperties.Earth + elementalBoost.Earth, Air: item.elementalProperties.Air + elementalBoost.Air
   });
  
  // Apply alchemical boost
  const alchemicalBoost = {
    Spirit: (item.alchemicalProperties?.Spirit || 0.25) + (planetProperties.Spirit * planetaryStrength),
    Essence: (item.alchemicalProperties?.Essence || 0.25) + (planetProperties.Essence * planetaryStrength),
    Matter: (item.alchemicalProperties?.Matter || 0.25) + (planetProperties.Matter * planetaryStrength),
    Substance: (item.alchemicalProperties?.Substance || 0.25) + (planetProperties.Substance * planetaryStrength)
  };
  
  return {
    ...item,
    elementalProperties: transformedElemental,
    alchemicalProperties: alchemicalBoost,
    planetaryInfluences: [...((item as Record<string, unknown>).planetaryInfluences || []), planet],
    transformationScore: calculateTransformationScore(alchemicalBoost, (item as Record<string, unknown>).uniqueness || 0.5)
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
  targetElementalProperties?: { [key: string]: number }
): AlchemicalItem[] {
  if (!targetElementalProperties) {
    return items.sort((a, b) => ((b as Record<string, unknown>)?.transformations?.score || 0) - ((a as Record<string, unknown>)?.transformations?.score || 0));
  }
  
  return items.sort((a, b) => {
    const scoreA = calculateCompatibilityScore(a, targetElementalProperties);
    const scoreB = calculateCompatibilityScore(b, targetElementalProperties);
    return scoreB - scoreA;
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
  targetProperty?: string
): AlchemicalItem[] {
  return (items || []).filter(item => {
    if (targetElement) {
      const dominantElement = calculateDominantElement(item.elementalProperties);
      if (String(dominantElement)?.toLowerCase() !== targetElement?.toLowerCase()) {
        return false;
      }
    }
    
    if (targetProperty && item.alchemicalProperties) {
      const properties = item.alchemicalProperties;
      const maxProperty = Math.max(
        properties.Spirit || 0,
        properties.Essence || 0,
        properties.Matter || 0,
        properties.Substance || 0
      );
      
      const targetValue = properties[targetProperty as keyof typeof properties];
      if (!targetValue || targetValue < maxProperty * 0.8) {
        return false;
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
export function getTopCompatibleItems(
  items: AlchemicalItem[],
  count = 5
): AlchemicalItem[] {
  return sortByAlchemicalCompatibility(items)?.slice(0, count);
}

// --- Helper Functions ---

/**
 * Calculate planetary influences from the transformation context
 * @param context Transformation context
 * @returns Record of planetary influences
 */
function calculatePlanetaryInfluences(context: TransformationContext): { [key: string]: PlanetaryInfluence } {
  const influences: { [key: string]: PlanetaryInfluence } = {};
  
  // Process each planet position in the context
  for (const [planet, position] of Object.entries(context.planetPositions)) {
    const element = PLANETARY_ELEMENTS[planet] || 'Fire'; // Default to fire if unknown
    const strength = calculatePlanetaryStrength(planet, context.isDaytime);
    const dignityBonus = calculateDignityBonus(planet, position);
    
    influences[planet] = {
      element,
      strength,
      isDiurnal: context.isDaytime,
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
  
  return Math.min(1.0, baseStrength);
}

function calculateDignityBonus(planet: string, position: number): number {
  // Simplified dignity calculation based on position
  // In a full implementation, this would check actual zodiac signs
  const normalizedPosition = ((position % 360) + 360) % 360;
  
  // Rough approximation of dignity based on position
  if (normalizedPosition < 30 || normalizedPosition > 330) {
    return 0.2; // Potential dignity
  }
  
  return 0;
}

function getLunarPhaseModifiers(lunarPhase?: LunarPhaseWithSpaces | null): Record<ElementalCharacter, number> {
  if (!lunarPhase) {
    return { Fire: 1.0, Water: 1.0, Earth: 1.0, Air: 1.0  };
  }
  
  const normalizedPhase = lunarPhase?.toLowerCase()?.replace(/\s+/g, ' ').trim();
  return LUNAR_PHASE_MODIFIERS[normalizedPhase] || { Fire: 1.0, Water: 1.0, Earth: 1.0, Air: 1.0  };
}

function getZodiacElement(zodiac?: string | null): ElementalCharacter | null {
  if (!zodiac) return null;
  return ZODIAC_ELEMENTS[zodiac?.toLowerCase()] || null;
}

function applyElementalTransformations(
  baseElemental: ElementalProperties,
  planetaryInfluences: { [key: string]: PlanetaryInfluence },
  lunarModifiers: Record<ElementalCharacter, number>,
  zodiacElement: ElementalCharacter | null,
  tarotBoosts?: Record<ElementalCharacter, number>
): ElementalProperties {
  const transformed = { ...baseElemental };
  
  // Apply planetary influences
  Object.values(planetaryInfluences || {}).forEach(influence => {
    const boost = influence.strength * (1 + influence.dignityBonus);
    transformed[influence.element] += boost * 0.1; // 10% max boost per planet
  });
  
  // Apply lunar modifiers
  Object.entries(lunarModifiers || {}).forEach(([element, modifier]) => {
    transformed[element as ElementalCharacter] *= modifier;
  });
  
  // Apply zodiac element boost
  if (zodiacElement) {
    transformed[zodiacElement] *= 1.1;
  }
  
  // Apply tarot boosts
  if (tarotBoosts) {
    Object.entries(tarotBoosts || {}).forEach(([element, boost]) => {
      transformed[element as ElementalCharacter] += boost;
    });
  }
  
  return normalizeProperties(transformed);
}

function calculateAlchemicalProperties(
  elementalProperties: ElementalProperties,
  planetaryInfluences: { [key: string]: PlanetaryInfluence },
  tarotPlanetaryBoosts?: { [key: string]: number }
): { [key: string]: number } {
  const alchemicalProps = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
  };
  
  // Base contributions from elemental properties
  alchemicalProps.Spirit += elementalProperties.Fire * 0.7 + elementalProperties.Air * 0.3;
  alchemicalProps.Essence += elementalProperties.Water * 0.6 + elementalProperties.Fire * 0.2 + elementalProperties.Air * 0.2;
  alchemicalProps.Matter += elementalProperties.Earth * 0.7 + elementalProperties.Water * 0.3;
  alchemicalProps.Substance += elementalProperties.Earth * 0.5 + elementalProperties.Water * 0.3 + elementalProperties.Air * 0.2;
  
  // Contributions from planetary influences
  for (const [planet, influence] of Object.entries(planetaryInfluences)) {
    const planetProps = PLANETARY_ALCHEMICAL_PROPERTIES[planet];
    if (!planetProps) continue;
    
    const tarotBoost = (tarotPlanetaryBoosts && tarotPlanetaryBoosts[planet]) || 0;
    const totalStrength = influence.strength + influence.dignityBonus + tarotBoost;
    
    for (const [prop, value] of Object.entries(planetProps)) {
      alchemicalProps[prop] += value * totalStrength * 0.2; // Scale down the planetary effect
    }
  }
  
  // Normalize alchemical properties
  const sum = Object.values(alchemicalProps)?.reduce((acc, val) => acc + val, 0);
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
  planetaryInfluences: { [key: string]: PlanetaryInfluence }
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
  const squaredDiffs = (values || []).map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / (values || []).length;
}

function calculateTransformationScore(
  alchemicalProperties: { [key: string]: number },
  uniqueness: number
): number {
  const alchemicalSum = Object.values(alchemicalProperties)?.reduce((sum, val) => sum + val, 0);
  const alchemicalScore = alchemicalSum / Object.keys(alchemicalProperties || {}).length;
  
  return (alchemicalScore * 0.7) + (uniqueness * 0.3);
}

function calculateCompatibilityScore(
  item: AlchemicalItem,
  targetProperties: { [key: string]: number }
): number {
  let score = 0;
  let totalWeight = 0;
  
  // Elemental compatibility
  Object.entries(targetProperties || {}).forEach(([element, targetValue]) => {
    const itemValue = item.elementalProperties[element as "Fire" | "Water" | "Earth" | "Air"] || 0;
    const compatibility = 1 - Math.abs(targetValue - itemValue);
    score += compatibility * 0.6;
    totalWeight += 0.6;
  });
  
  // Transformation score
  score += ((item as Record<string, unknown>)?.transformations?.score || 0.5) * 0.4;
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