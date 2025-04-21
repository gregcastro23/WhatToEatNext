/**
 * Cooking methods with their elemental properties and astrological influences
 * This file provides a simplified overview of cooking methods
 * For more detailed information, see the methods directory
 */

import type { CookingMethodData, CookingMethodCollection } from '../../types/cookingMethod';
import type { ElementalProperties, ZodiacSign, PlanetName, LunarPhaseWithUnderscores } from '../../types/alchemy';
import { allCookingMethods } from './methods';

/**
 * Simplified cooking methods data for quick reference
 * Contains essential information about common cooking methods
 */
export const cookingMethods: Record<string, Partial<CookingMethodData>> = {
  roasting: {
    name: 'roasting',
    elementalEffect: {
      Fire: 0.8,
      Air: 0.5,
      Earth: 0.3,
      Water: 0.1
    },
    benefits: ['caramelization', 'flavor concentration', 'enhances texture contrast', 'tenderizes tough cuts'],
    astrologicalInfluences: {
      dominantPlanets: ['sun', 'mars'] as PlanetName[],
      favorableZodiac: ['aries', 'leo', 'sagittarius'] as ZodiacSign[],
      lunarPhaseEffect: {
        full_moon: 0.8,
        new_moon: 0.4
      } as Record<LunarPhaseWithUnderscores, number>
    }
  },
  steaming: {
    name: 'steaming',
    elementalEffect: {
      Water: 0.9,
      Air: 0.4,
      Earth: 0.2,
      Fire: 0.1
    },
    benefits: ['nutrient preservation', 'gentle cooking', 'maintains moisture', 'preserves color'],
    astrologicalInfluences: {
      dominantPlanets: ['moon', 'neptune'] as PlanetName[],
      favorableZodiac: ['cancer', 'pisces', 'scorpio'] as ZodiacSign[],
      lunarPhaseEffect: {
        waxing_crescent: 0.7,
        full_moon: 0.5
      } as Record<LunarPhaseWithUnderscores, number>
    }
  },
  grilling: {
    name: 'grilling',
    elementalEffect: {
      Fire: 0.9,
      Air: 0.6,
      Earth: 0.2,
      Water: 0.1
    },
    benefits: ['smoky flavor', 'char development', 'fat rendering', 'quick cooking'],
    astrologicalInfluences: {
      dominantPlanets: ['mars', 'sun'] as PlanetName[],
      favorableZodiac: ['aries', 'leo', 'sagittarius'] as ZodiacSign[],
      lunarPhaseEffect: {
        full_moon: 0.7,
        waxing_gibbous: 0.6
      } as Record<LunarPhaseWithUnderscores, number>
    }
  },
  frying: {
    name: 'frying',
    elementalEffect: {
      Fire: 0.8,
      Air: 0.3,
      Earth: 0.3,
      Water: 0.1
    },
    benefits: ['crispy texture', 'rapid cooking', 'flavor development', 'maillard reaction'],
    astrologicalInfluences: {
      dominantPlanets: ['mars', 'mercury'] as PlanetName[],
      favorableZodiac: ['aries', 'gemini', 'leo'] as ZodiacSign[],
      lunarPhaseEffect: {
        waxing_gibbous: 0.8,
        full_moon: 0.6
      } as Record<LunarPhaseWithUnderscores, number>
    }
  },
  baking: {
    name: 'baking',
    elementalEffect: {
      Fire: 0.7,
      Air: 0.6,
      Earth: 0.4,
      Water: 0.2
    },
    benefits: ['even cooking', 'structure development', 'caramelization', 'aroma enhancement'],
    astrologicalInfluences: {
      dominantPlanets: ['venus', 'jupiter'] as PlanetName[],
      favorableZodiac: ['taurus', 'libra', 'virgo'] as ZodiacSign[],
      lunarPhaseEffect: {
        first_quarter: 0.8,
        full_moon: 0.6
      } as Record<LunarPhaseWithUnderscores, number>
    }
  },
  simmering: {
    name: 'simmering',
    elementalEffect: {
      Water: 0.8,
      Fire: 0.4,
      Earth: 0.3,
      Air: 0.1
    },
    benefits: ['gentle heat', 'flavor infusion', 'tenderizing', 'sauce reduction'],
    astrologicalInfluences: {
      dominantPlanets: ['moon', 'venus'] as PlanetName[],
      favorableZodiac: ['cancer', 'taurus', 'pisces'] as ZodiacSign[],
      lunarPhaseEffect: {
        waning_gibbous: 0.7,
        new_moon: 0.5
      } as Record<LunarPhaseWithUnderscores, number>
    }
  },
  braising: {
    name: 'braising',
    elementalEffect: {
      Water: 0.6,
      Fire: 0.5,
      Earth: 0.4,
      Air: 0.1
    },
    benefits: ['tenderizes tough cuts', 'develops rich flavors', 'creates silky sauces', 'one-pot convenience'],
    astrologicalInfluences: {
      dominantPlanets: ['saturn', 'moon'] as PlanetName[],
      favorableZodiac: ['capricorn', 'cancer', 'taurus'] as ZodiacSign[],
      lunarPhaseEffect: {
        waning_crescent: 0.8,
        third_quarter: 0.6
      } as Record<LunarPhaseWithUnderscores, number>
    }
  },
  fermenting: {
    name: 'fermenting',
    elementalEffect: {
      Water: 0.5,
      Air: 0.4,
      Earth: 0.3,
      Fire: 0.1
    },
    benefits: ['probiotic development', 'flavor transformation', 'preservation', 'nutrient enhancement'],
    astrologicalInfluences: {
      dominantPlanets: ['mercury', 'pluto'] as PlanetName[],
      favorableZodiac: ['virgo', 'scorpio', 'aquarius'] as ZodiacSign[],
      lunarPhaseEffect: {
        new_moon: 0.9,
        waxing_crescent: 0.7
      } as Record<LunarPhaseWithUnderscores, number>
    }
  }
};

/**
 * Helper function to retrieve the detailed cooking method data by name
 * @param methodName Name of the cooking method to retrieve
 * @returns Detailed cooking method data or undefined if not found
 */
export const getDetailedCookingMethod = (methodName: string): CookingMethodData | undefined => {
  const normalizedName = methodName.toLowerCase().replace(/[\s-]/g, '_');
  return Object.values(allCookingMethods).find(method => 
    method.name === normalizedName ||
    method.name === methodName.toLowerCase()
  );
};

/**
 * Get an array of all available cooking method names
 * @returns Array of cooking method names
 */
export const getCookingMethodNames = (): string[] => {
  return Object.keys(cookingMethods).map(key => cookingMethods[key].name as string);
};

/**
 * Get cooking methods that are compatible with a specific element
 * @param element The element to check compatibility with
 * @param threshold Minimum elemental value (0-1) for compatibility
 * @returns Array of compatible cooking method names
 */
export const getCookingMethodsByElement = (element: keyof ElementalProperties, threshold = 0.4): string[] => {
  return Object.values(cookingMethods)
    .filter(method => ((method.elementalEffect?.[element] || 0) >= threshold))
    .map(method => method.name as string);
};

export default cookingMethods; 