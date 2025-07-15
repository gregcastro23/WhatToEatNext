import { dryCookingMethods } from './dry';
import { wetCookingMethods } from './wet';
import { molecularCookingMethods } from './molecular';
import { traditionalCookingMethods } from './traditional';
import { rawCookingMethods } from './raw';
// Import other method categories as they are added
import { transformationMethods } from './transformation';

import type { CookingMethodData } from '@/types/cookingMethod';
import type { ZodiacSign, AstrologicalState, Element } from '@/types/alchemy';

/**
 * Collection of all cooking methods from all categories
 */
export const allCookingMethods = {
  ...dryCookingMethods,
  ...wetCookingMethods,
  ...molecularCookingMethods,
  ...traditionalCookingMethods,
  ...rawCookingMethods,
  // Add other method categories as they are implemented
  ...transformationMethods,
};

/**
 * Get cooking methods that are favorable for a specific zodiac sign
 * @param sign The zodiac sign to check
 * @returns Object containing cooking methods favorable for the sign
 */
export const getMethodsForZodiacSign = (sign: ZodiacSign): Record<string, CookingMethodData> => {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method as any;
      return methodData?.astrologicalInfluences?.favorableZodiac?.includes(sign);
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

/**
 * Get cooking methods that have a specific dominant element
 * @param element The element to check for (Fire, Water, Earth, Air)
 * @param threshold The minimum value for that element (0.0-1.0)
 * @returns Object containing cooking methods with that elemental dominance
 */
export const getMethodsByElement = (element: Element, threshold = 0.4): Record<string, CookingMethodData> => {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method as any;
      return (methodData?.elementalEffect?.[element] || 0) >= threshold;
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

/**
 * Get cooking methods suitable for a specific ingredient type
 * @param ingredientType The type of ingredient (e.g., 'meat', 'vegetables')
 * @returns Object containing suitable cooking methods
 */
export const getMethodsForIngredientType = (ingredientType: string): Record<string, CookingMethodData> => {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method as any;
      return (methodData?.suitable_for || []).some((type: any) => 
        type?.toLowerCase()?.includes(ingredientType.toLowerCase())
      );
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

/**
 * Get cooking methods influenced by a specific planet
 * @param planet The planet to check for influence
 * @returns Object containing methods influenced by the planet
 */
export const getMethodsByPlanet = (planet: string): Record<string, CookingMethodData> => {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method as any;
      return methodData?.astrologicalInfluences?.dominantPlanets?.includes(planet) ||
             methodData?.astrologicalInfluences?.rulingPlanets?.includes(planet);
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Export individual categories
export {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  rawCookingMethods,
  transformationMethods,
}; 