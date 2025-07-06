/**
 * Streamlined Elemental Calculations Module
 * 
 * Consolidates elemental property calculations from multiple sources
 * into a single, efficient, and accurate system.
 */


import type { Element, ElementalProperties, PlanetaryPosition, ZodiacSign, LunarPhase } from "@/types/alchemy";
import { getCachedCalculation } from '../../utils/calculationCache';

/**
 * Seasonal modifiers for elemental properties
 */
export const SEASONAL_MODIFIERS: { [key: string]: ElementalProperties } = {
  spring: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25  },
  summer: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25  },
  autumn: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25  },
  fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3  }, // Alias for autumn
  winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3  }
};

/**
 * Lunar phase modifiers for elemental properties
 */
export const LUNAR_PHASE_MODIFIERS: { [key: string]: ElementalProperties } = {
  'new moon': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'waxing crescent': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'first quarter': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'waxing gibbous': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'full moon': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'waning gibbous': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'last quarter': { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  'waning crescent': { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3  }
};

/**
 * Zodiac sign to element mapping
 */
export const ZODIAC_ELEMENTS: Record<ZodiacSign, Element> = {
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

/**
 * Calculate base elemental properties from planetary positions
 */
export function calculateBaseElementalProperties(
  planetaryPositions: { [key: string]: PlanetaryPosition }
): ElementalProperties {
  const elements: ElementalProperties = { Fire: 0, Water: 0, Air: 0, Earth: 0
   };

  // Process each planet's contribution
  Object.entries(planetaryPositions || {}).forEach(([planet, position]) => {
    if (!position.sign) return;

    const element = ZODIAC_ELEMENTS[position.sign?.toLowerCase() as ZodiacSign];
    if (!element) return;

    // Weight by planet importance
    let weight = 1.0;
    const planetLower = planet?.toLowerCase();
    
    if (planetLower === 'Sun' || planetLower === 'Moon') {
      weight = 2.5;
    } else if (['Mercury', 'Venus', 'Mars'].includes(planetLower)) {
      weight = 1.5;
    } else if (['Jupiter', 'Saturn'].includes(planetLower)) {
      weight = 1.2;
    }

    // Apply dignity modifiers
    const dignityModifier = getDignityModifier(planet, position.sign);
    weight *= dignityModifier;

    elements[element] += weight;
  });

  // Normalize to sum to 1.0
  return normalizeElementalProperties(elements);
}

/**
 * Apply seasonal adjustments to elemental properties
 */
export function applySeasonalAdjustments(
  baseProperties: ElementalProperties,
  season: string
): ElementalProperties {
  const seasonalMod = SEASONAL_MODIFIERS[season?.toLowerCase()] || SEASONAL_MODIFIERS.spring;
  
  return { Fire: baseProperties.Fire * (1 + seasonalMod.Fire * 0.2), Water: baseProperties.Water * (1 + seasonalMod.Water * 0.2), Air: baseProperties.Air * (1 + seasonalMod.Air * 0.2), Earth: baseProperties.Earth * (1 + seasonalMod.Earth * 0.2)
   };
}

/**
 * Apply lunar phase adjustments to elemental properties
 */
export function applyLunarPhaseAdjustments(
  baseProperties: ElementalProperties,
  lunarPhase: string
): ElementalProperties {
  const lunarMod = LUNAR_PHASE_MODIFIERS[lunarPhase?.toLowerCase()] || LUNAR_PHASE_MODIFIERS['full moon'];
  
  return { Fire: baseProperties.Fire * (1 + lunarMod.Fire * 0.15), Water: baseProperties.Water * (1 + lunarMod.Water * 0.15), Air: baseProperties.Air * (1 + lunarMod.Air * 0.15), Earth: baseProperties.Earth * (1 + lunarMod.Earth * 0.15)
   };
}

/**
 * Calculate elemental compatibility between two sets of properties
 */
export function calculateElementalCompatibility(
  properties1: ElementalProperties,
  properties2: ElementalProperties
): number {
  let compatibility = 0;
  let totalWeight = 0;

  // Calculate weighted compatibility for each element
  Object.keys(properties1 || {}).forEach(element => {
    const key = element as "Fire" | "Water" | "Earth" | "Air";
    const value1 = properties1[key];
    const value2 = properties2[key];
    const weight = (value1 + value2) / 2;

    // Same element reinforces itself (following elemental principles)
    const elementCompatibility = 1 - Math.abs(value1 - value2);
    
    compatibility += elementCompatibility * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? compatibility / totalWeight : 0.7;
}

/**
 * Get the dominant element from elemental properties
 */
export function getDominantElement(properties: ElementalProperties): Element {
  let dominant: Element = 'Fire';
  let max = -Infinity;

  for (const [element, value] of Object.entries(properties) as [Element, number][]) {
    if (value > max) {
      dominant = element;
      max = value;
    }
  }

  return dominant;
}

/**
 * Calculate elemental balance score (lower is more balanced)
 */
export function calculateElementalBalance(properties: ElementalProperties): number {
  const values = Object.values(properties);
  const average = values.reduce((sum, val) => sum + val, 0) / (values || []).length;
  
  return values.reduce((acc, val) => acc + Math.abs(val - average), 0) / (values || []).length;
}

/**
 * Combine two sets of elemental properties
 */
export function combineElementalProperties(
  properties1: ElementalProperties,
  properties2: ElementalProperties,
  weight1: number = 0.5,
  weight2: number = 0.5
): ElementalProperties {
  const combined: ElementalProperties = { Fire: properties1.Fire * weight1 + properties2.Fire * weight2, Water: properties1.Water * weight1 + properties2.Water * weight2, Air: properties1.Air * weight1 + properties2.Air * weight2, Earth: properties1.Earth * weight1 + properties2.Earth * weight2
   };

  return normalizeElementalProperties(combined);
}

/**
 * Normalize elemental properties to sum to 1.0
 */
export function normalizeElementalProperties(properties: ElementalProperties): ElementalProperties {
  const total = Object.values(properties)?.reduce((sum, val) => sum + val, 0);
  
  if (total === 0) {
    return { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25  };
  }

  return { Fire: properties.Fire / total, Water: properties.Water / total, Air: properties.Air / total, Earth: properties.Earth / total
   };
}

/**
 * Get dignity modifier for a planet in a sign
 */
function getDignityModifier(planet: string, sign: string): number {
  const dignities: Record<string, Record<string, number>> = {
    Sun: {},
    moon: {},
    Mercury: {},
    Venus: {},
    Mars: {},
    Jupiter: {},
    Saturn: { capricorn: 1.5, aquarius: 1.5, libra: 1.3, cancer: 0.7, leo: 0.7, aries: 0.5 }
  };

  const planetKey = planet?.toLowerCase();
  const signKey = sign?.toLowerCase();
  
  return dignities[planetKey]?.[signKey] || 1.0;
}

/**
 * Calculate comprehensive elemental properties with all modifiers
 */
export function calculateComprehensiveElementalProperties(
  planetaryPositions: { [key: string]: PlanetaryPosition },
  season?: string,
  lunarPhase?: string,
  isDaytime: boolean = true
): ElementalProperties {
  const cacheKey = `elemental_${JSON.stringify(planetaryPositions)}_${season}_${lunarPhase}_${isDaytime}`;
  
  return getCachedCalculation(
    cacheKey,
    { positions: planetaryPositions, season, lunarPhase, isDaytime },
    () => {
      // Calculate base properties
      let properties = calculateBaseElementalProperties(planetaryPositions);

      // Apply seasonal adjustments
      if (season) {
        properties = applySeasonalAdjustments(properties, season);
      }

      // Apply lunar phase adjustments
      if (lunarPhase) {
        properties = applyLunarPhaseAdjustments(properties, lunarPhase);
      }

      // Apply day/night adjustments
      if (isDaytime) {
        properties.Fire *= 1.1;
        properties.Air *= 1.05;
      } else {
        properties.Water *= 1.1;
        properties.Earth *= 1.05;
      }

      // Final normalization
      return normalizeElementalProperties(properties);
    },
    300000 // 5 minute cache
  ) as ElementalProperties;
}

/**
 * Get elemental recommendations based on properties
 */
export function getElementalRecommendations(properties: ElementalProperties): {
  dominant: Element;
  balance: number;
  recommendations: string[];
} {
  const dominant = getDominantElement(properties);
  const balance = calculateElementalBalance(properties);
  
  const recommendations: string[] = [];
  
  // Generate recommendations based on dominant element
  switch (dominant) {
    case 'Fire':
      recommendations?.push('Foods that cool and ground: fresh vegetables, fruits, cooling herbs');
      recommendations?.push('Cooking methods: steaming, raw preparation, light sautéing');
      break;
    case 'Water':
      recommendations?.push('Foods that warm and stimulate: spicy dishes, roasted vegetables, warming spices');
      recommendations?.push('Cooking methods: roasting, grilling, stir-frying');
      break;
    case 'Air':
      recommendations?.push('Foods that ground and nourish: root vegetables, whole grains, proteins');
      recommendations?.push('Cooking methods: slow cooking, braising, stewing');
      break;
    case 'Earth':
      recommendations?.push('Foods that lighten and enliven: leafy greens, sprouted foods, aromatic herbs');
      recommendations?.push('Cooking methods: quick sautéing, blanching, light steaming');
      break;
  }

  // Add balance-specific recommendations
  if (balance < 0.1) {
    recommendations?.push('Your elements are well-balanced - maintain variety in your diet');
  } else if (balance > 0.3) {
    recommendations?.push('Consider foods from other elements to create better balance');
  }

  return { dominant, balance, recommendations };
}

export default {
  calculateBaseElementalProperties,
  calculateComprehensiveElementalProperties,
  applySeasonalAdjustments,
  applyLunarPhaseAdjustments,
  calculateElementalCompatibility,
  combineElementalProperties,
  normalizeElementalProperties,
  getDominantElement,
  calculateElementalBalance,
  getElementalRecommendations,
  SEASONAL_MODIFIERS,
  LUNAR_PHASE_MODIFIERS,
  ZODIAC_ELEMENTS
}; 