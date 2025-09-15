import type { ZodiacSign, _, Element } from '@/types/alchemy';
import type { CookingMethodData } from '@/types/cookingMethod';

import { dryCookingMethods } from './dry';
import { molecularCookingMethods } from './molecular';
import { rawCookingMethods } from './raw';
import { traditionalCookingMethods } from './traditional';
// Import other method categories as they are added
import { transformationMethods } from './transformation';
import { wetCookingMethods } from './wet';

/**
 * Collection of all cooking methods from all categories
 */
export const allCookingMethods = {
  ...dryCookingMethods;
  ...wetCookingMethods;
  ...molecularCookingMethods;
  ...traditionalCookingMethods;
  ...rawCookingMethods;
  // Add other method categories as they are implemented
  ...transformationMethods
};

/**
 * Get cooking methods that are favorable for a specific zodiac sign
 * @param sign The zodiac sign to check
 * @returns Object containing cooking methods favorable for the sign
 */
export const _getMethodsForZodiacSign = (sign: any): Record<string, CookingMethodData> => {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method ;
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
export const _getMethodsByElement = (;
  element: Element,
  threshold = 0.4
): Record<string, CookingMethodData> => {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method ;
      return (methodData?.elementalEffect?.[element] || 0) >= threshold;
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

/**
 * Get cooking methods suitable for a specific ingredient type
 * @param ingredientType The type of ingredient (e.g., 'meat', 'vegetables')
 * @returns Object containing suitable cooking methods
 */
export const _getMethodsForIngredientType = (;
  ingredientType: string,
): Record<string, CookingMethodData> => {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method ;
      return (methodData?.suitable_for || []).some((type: string) =>
        type?.toLowerCase()?.includes(ingredientType.toLowerCase());
      )
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

/**
 * Get cooking methods influenced by a specific planet
 * @param planet The planet to check for influence
 * @returns Object containing methods influenced by the planet
 */
export const _getMethodsByPlanet = (planet: string): Record<string, CookingMethodData> => {
  return Object.entries(allCookingMethods)
    .filter(([_, method]) => {
      // Apply safe type casting for method property access
      const methodData = method ;
      return (
        methodData?.astrologicalInfluences?.dominantPlanets?.includes(planet) ||
        methodData?.astrologicalInfluences?.rulingPlanets?.includes(planet)
      )
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
  transformationMethods
};
