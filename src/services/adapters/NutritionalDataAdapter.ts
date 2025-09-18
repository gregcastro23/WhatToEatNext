/**
 * NutritionalDataAdapter
 *
 * Provides a consistent interface for accessing nutritional data
 * in the WhatToEatNext system with proper error handling and type safety.
 */

import { Element } from '@/types/alchemy';
import type {
  NutritionalProfile,
  ElementalProperties,
  ZodiacSign,
  PlanetName,
  Season,
} from '@/types/alchemy';

import {
  fetchNutritionalData,
  calculateNutritionalBalance,
  nutritionalToElemental,
  getZodiacNutritionalRecommendations,
  getPlanetaryNutritionalRecommendations,
  getSeasonalNutritionalRecommendations,
  evaluateNutritionalElementalBalance,
  getEnhancedPlanetaryNutritionalRecommendations,
} from '../../data/nutritional';
import { createElementalProperties } from '../../utils/elemental/elementalUtils';
import { errorHandler } from '../errorHandler';

/**
 * Interface for the NutritionalDataAdapter
 */
export interface NutritionalDataAdapterInterface {
  // Core nutritional data operations
  getNutritionalData(foodName: string): Promise<NutritionalProfile | null>;
  calculateNutritionalBalance(ingredients: ElementalProperties[]): NutritionalProfile;
  convertNutritionalToElemental(profile: NutritionalProfile): ElementalProperties;

  // Astrological nutrition recommendations
  getZodiacNutritionalRecommendations(sign: any | string): {
    focusNutrients: string[],
    recommendedFoods: string[],
    avoidFoods: string[]
  };

  getPlanetaryNutritionalRecommendations(planets: PlanetName[] | string[]): {
    focusNutrients: string[],
    healthAreas: string[],
    recommendedFoods: string[]
  };

  getEnhancedPlanetaryNutritionalRecommendations(
    planetaryDay: PlanetName | string,
    planetaryHour: PlanetName | string,
    currentTime?: Date,
  ): {
    elements: ElementalProperties,
    focusNutrients: string[],
    healthAreas: string[],
    recommendedFoods: string[],
  };

  // Seasonal nutrition recommendations
  getSeasonalNutritionalRecommendations(season: Season | string): {
    element: Element,
    focusNutrients: string[],
    seasonalFoods: string[]
  };

  // Evaluation
  evaluateNutritionalElementalBalance(
    profile: NutritionalProfile,
    targetElements: ElementalProperties,
  ): {
    score: number,
    imbalances: string[],
    recommendations: string[]
  };
}

/**
 * NutritionalDataAdapter implementation
 */
class NutritionalDataAdapter implements NutritionalDataAdapterInterface {
  /**
   * Get nutritional data for a food
   */
  async getNutritionalData(foodName: string): Promise<NutritionalProfile | null> {
    try {
      return (await fetchNutritionalData(
        foodName,
      )) as unknown as import('@/types/alchemy').NutritionalProfile;
    } catch (error) {
      // Use safe type casting for errorHandler service access
      const errorHandlerService = errorHandler as unknown as any;
      const logError = errorHandlerService.logError as Function;
      if (typeof logError === 'function') {
        logError(error, {
          context: 'NutritionalDataAdapter',
          action: 'getNutritionalData',
          foodName,
        });
      }
      return null;
    }
  }

  /**
   * Calculate nutritional balance from ingredients
   */
  calculateNutritionalBalance(ingredients: unknown[]): NutritionalProfile {
    try {
      return calculateNutritionalBalance(
        ingredients as unknown,
      ) as unknown as import('@/types/alchemy').NutritionalProfile;
    } catch (error) {
      // Use safe type casting for errorHandler service access
      const errorHandlerService = errorHandler as unknown as any;
      const logError = errorHandlerService.logError as Function;
      if (typeof logError === 'function') {
        logError(error, {
          context: 'NutritionalDataAdapter',
          action: 'calculateNutritionalBalance',
        });
      }
      return {
        calories: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        },
      } as import('@/types/alchemy').NutritionalProfile;
    }
  }

  /**
   * Convert nutritional profile to elemental properties
   */
  convertNutritionalToElemental(profile: NutritionalProfile): ElementalProperties {
    try {
      // The original function returns { Fire, Water, Earth, Air } with 'Earth' capitalized
      // We need to convert it to proper ElementalProperties
      const result = nutritionalToElemental(profile as any);

      // Create a proper ElementalProperties object
      return createElementalProperties({
        Fire: result.Fire,
        Water: result.Water,
        Earth: result.Earth,
        Air: result.Air,
      });
    } catch (error) {
      // Use safe type casting for errorHandler service access
      const errorHandlerService = errorHandler as unknown as any;
      const logError = errorHandlerService.logError as Function;
      if (typeof logError === 'function') {
        logError(error, {
          context: 'NutritionalDataAdapter',
          action: 'convertNutritionalToElemental',
        });
      }
      return createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
    }
  }

  /**
   * Get nutritional recommendations based on zodiac sign
   */
  getZodiacNutritionalRecommendations(sign: any | string): {
    focusNutrients: string[],
    recommendedFoods: string[],
    avoidFoods: string[]
  } {
    try {
      // Convert sign to string for the original function with safe type casting
      const signStr = typeof sign === 'string' ? sign.toLowerCase() : String(sign).toLowerCase();

      // Get recommendations
      const result = getZodiacNutritionalRecommendations(signStr);

      // Convert elementalBalance to proper ElementalProperties
      return {
        focusNutrients: result.focusNutrients,
        recommendedFoods: result.recommendedFoods,
        avoidFoods: result.avoidFoods,
      };
    } catch (error) {
      // Use safe type casting for errorHandler service access
      const errorHandlerService = errorHandler as unknown as any;
      const logError = errorHandlerService.logError as Function;
      if (typeof logError === 'function') {
        logError(error, {
          context: 'NutritionalDataAdapter',
          action: 'getZodiacNutritionalRecommendations',
          sign: String(sign),
        });
      }
      return {
        focusNutrients: [],
        recommendedFoods: [],
        avoidFoods: [],
      };
    }
  }

  /**
   * Get nutritional recommendations based on planetary influences
   */
  getPlanetaryNutritionalRecommendations(planets: PlanetName[] | string[]): {
    focusNutrients: string[],
    healthAreas: string[],
    recommendedFoods: string[]
  } {
    try {
      // Convert planets to strings for the original function
      const planetStrings = (planets || []).map(p => String(p));

      return getPlanetaryNutritionalRecommendations(planetStrings);
    } catch (error) {
      // Use safe type casting for errorHandler service access
      const errorHandlerService = errorHandler as unknown as any;
      const logError = errorHandlerService.logError as Function;
      if (typeof logError === 'function') {
        logError(error, {
          context: 'NutritionalDataAdapter',
          action: 'getPlanetaryNutritionalRecommendations',
        });
      }
      return {
        focusNutrients: [],
        healthAreas: [],
        recommendedFoods: [],
      };
    }
  }

  /**
   * Get enhanced nutritional recommendations based on planetary day and hour
   */
  getEnhancedPlanetaryNutritionalRecommendations(
    planetaryDay: PlanetName | string,
    planetaryHour: PlanetName | string,
    currentTime: Date = new Date(),
  ): {
    elements: ElementalProperties,
    focusNutrients: string[],
    healthAreas: string[],
    recommendedFoods: string[],
  } {
    try {
      // Convert planet names to strings for the original function
      const dayStr = String(planetaryDay);
      const hourStr = String(planetaryHour);

      // Get recommendations
      const result = getEnhancedPlanetaryNutritionalRecommendations(dayStr, hourStr, currentTime);

      // Convert elements to proper ElementalProperties
      const elements = createElementalProperties({
        Fire: result.elements.Fire || 0,
        Water: result.elements.Water || 0,
        Earth: result.elements.Earth || 0,
        Air: result.elements.Air || 0,
      });

      return {
        elements,
        focusNutrients: result.focusNutrients,
        healthAreas: result.healthAreas,
        recommendedFoods: result.recommendedFoods,
      };
    } catch (error) {
      // Use safe type casting for errorHandler service access
      const errorHandlerService = errorHandler as unknown as any;
      const logError = errorHandlerService.logError as Function;
      if (typeof logError === 'function') {
        logError(error, {
          context: 'NutritionalDataAdapter',
          action: 'getEnhancedPlanetaryNutritionalRecommendations',
          planetaryDay: String(planetaryDay),
          planetaryHour: String(planetaryHour),
        });
      }
      return {
        elements: createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
        focusNutrients: [],
        healthAreas: [],
        recommendedFoods: [],
      };
    }
  }

  /**
   * Get seasonal nutritional recommendations
   */
  getSeasonalNutritionalRecommendations(season: Season | string): {
    element: Element,
    focusNutrients: string[],
    seasonalFoods: string[]
  } {
    try {
      // Convert season to string for the original function
      const seasonStr = String(season);

      const result = getSeasonalNutritionalRecommendations(seasonStr);
      return {
        ...result,
        element: result.element as Element,
      };
    } catch (error) {
      // Use safe type casting for errorHandler service access
      type ErrorHandlerWithLogError = typeof errorHandler & {
        logError?: (error: unknown, context: unknown) => void
      };
      const errorHandlerService = errorHandler as ErrorHandlerWithLogError;
      errorHandlerService.logError?.(error, {
        context: 'NutritionalDataAdapter',
        action: 'getSeasonalNutritionalRecommendations',
        season: String(season),
      });
      return {
        element: 'Fire' as Element,
        focusNutrients: [],
        seasonalFoods: [],
      };
    }
  }

  /**
   * Evaluate nutritional elemental balance
   */
  evaluateNutritionalElementalBalance(
    profile: NutritionalProfile,
    targetElements: ElementalProperties,
  ): {
    score: number,
    imbalances: string[],
    recommendations: string[]
  } {
    try {
      // Convert targetElements to the format expected by the original function
      const legacyTargetElements = {
        Fire: targetElements.Fire,
        Water: targetElements.Water,
        Earth: targetElements.Earth, // Convert to legacy capitalization
        Air: targetElements.Air,
      };

      return evaluateNutritionalElementalBalance(profile as unknown, legacyTargetElements);
    } catch (error) {
      // Use safe type casting for errorHandler service access
      const errorHandlerService = errorHandler as unknown as any;
      const logError = errorHandlerService.logError as Function;
      if (typeof logError === 'function') {
        logError(error, {
          context: 'NutritionalDataAdapter',
          action: 'evaluateNutritionalElementalBalance',
        });
      }
      return {
        score: 0.5, // Default moderate score
        imbalances: [],
        recommendations: [],
      };
    }
  }
}

// Singleton instance
export const nutritionalDataAdapter = new NutritionalDataAdapter();

export default nutritionalDataAdapter;
