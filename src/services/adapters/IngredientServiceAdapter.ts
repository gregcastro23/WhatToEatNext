/**
 * IngredientServiceAdapter.ts
 * 
 * An adapter for FoodAlchemySystem to use the consolidated ingredient service.
 * This adapter serves as a bridge between the FoodAlchemySystem and the
 * modern service architecture.
 */

import type { ElementalProperties, Season, ZodiacSign, PlanetName } from "@/types/alchemy";
import { consolidatedIngredientService } from '../ConsolidatedIngredientService';
import { FoodAlchemySystem, type SystemState } from '../FoodAlchemySystem';
import { createElementalProperties } from '../../utils/elemental/elementalUtils';
import { logger } from '../../utils/logger';

import type { UnifiedIngredient } from '@/types/unified';
import type { IngredientFilter } from '../interfaces/IngredientServiceInterface';

import { Element } from "@/types/alchemy";

/**
 * Enhanced food alchemy system that uses modern ingredient service
 */
export class EnhancedIngredientSystem {
  private static instance: EnhancedIngredientSystem;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): EnhancedIngredientSystem {
    if (!EnhancedIngredientSystem.instance) {
      EnhancedIngredientSystem.instance = new EnhancedIngredientSystem();
    }
    return EnhancedIngredientSystem.instance;
  }
  
  /**
   * Get recommended ingredients based on the current alchemical state
   * 
   * @param state The current system state
   * @param options Additional options
   * @returns Array of recommended ingredients
   */
  getRecommendedIngredients(
    state: SystemState,
    options: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      categories?: string[];
      dietaryPreferences?: {
        isVegetarian?: boolean;
        isVegan?: boolean;
        isGlutenFree?: boolean;
        isDAiryFree?: boolean;
      };
      maxResults?: number;
    } = {}
  ): UnifiedIngredient[] {
    try {
      logger.info('Getting recommended ingredients', { state, options });
      
      // Create elemental properties from the state - safe property access
      const elements = (state as any)?.elements || (state as any)?.elementalPreference || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      const elementalState = createElementalProperties({ 
        Fire: elements.Fire || 0.25, 
        Water: elements.Water || 0.25, 
        Earth: elements.Earth || 0.25, 
        Air: elements.Air || 0.25
      });
      
      // Get recommended ingredients
      const recommended = consolidatedIngredientService.getRecommendedIngredients(
        elementalState,
        {
          optimizeForSeason: true,
          maxResults: options.maxResults || 10
        } as any
      );
      
      // Apply additional filters
      let filtered = recommended;
      
      // Filter by season if specified - apply surgical type casting
      const optionsData = options as any;
      const currentSeason = optionsData?.currentSeason;
      if (currentSeason) {
        filtered = filtered.filter(ingredient => {
          const seasons = (ingredient as any).season || (ingredient as any).seasonality || [];
          const seasonArray = Array.isArray(seasons) ? seasons : [seasons];
          return seasonArray.some(s => typeof s === 'string' && 
                                       s?.toLowerCase() === currentSeason?.toLowerCase());
        });
      }
      
      // Filter by zodiac sign if specified
      if (options.currentZodiacSign) {
        filtered = filtered.filter(ingredient => {
          const zodiac = (ingredient as any).astrologicalPropertiesProfile?.zodiacAffinity || 
                        (ingredient as any).astrologicalPropertiesProfile?.favorableZodiac || [];
          const zodiacArray = Array.isArray(zodiac) ? zodiac : [zodiac];
          return zodiacArray.some(z => typeof z === 'string' && 
                                       z?.toLowerCase() === options.currentZodiacSign?.toLowerCase());
        });
      }
      
      // Filter by categories if specified
      if (options.categories && (options.categories || []).length > 0) {
        filtered = filtered.filter(ingredient => 
          Array.isArray(options.categories) ? options.categories.includes(ingredient.category) : options.categories === ingredient.category
        );
      }
      
      // Apply dietary filters
      if (options.dietaryPreferences) {
        const dietaryFilter = options.dietaryPreferences;
        
        if (dietaryFilter.isVegetarian) {
          filtered = filtered.filter(ingredient => {
            if (ingredient.category !== 'proteins') return true;
            const nonVegetarianCategories = ['meat', 'poultry', 'seafood'];
            return !nonVegetarianCategories.includes(ingredient.subcategory || '');
          });
        }
        
        if (dietaryFilter.isVegan) {
          filtered = filtered.filter(ingredient => {
            if (ingredient.category !== 'proteins') return true;
            const nonVeganCategories = ['meat', 'poultry', 'seafood', 'dAiry', 'eggs'];
            return !nonVeganCategories.includes(ingredient.subcategory || '');
          });
        }
        
        if (dietaryFilter.isGlutenFree) {
          filtered = filtered.filter(ingredient => {
            if (ingredient.category !== 'grains') return true;
            const glutenGrains = ['wheat', 'barley', 'rye', 'triticale'];
            return !glutenGrains.some(g => ingredient.name?.toLowerCase()?.includes(g));
          });
        }
        
        if (dietaryFilter.isDAiryFree) {
          filtered = filtered.filter(ingredient => 
            ingredient.subcategory !== 'dAiry'
          );
        }
      }
      
      // Return the filtered results, limited by maxResults
      const maxResults = options.maxResults || 10;
      return filtered?.slice(0, maxResults);
    } catch (error) {
      logger.error('Error getting recommended ingredients', error);
      return [];
    }
  }
  
  /**
   * Get ingredients by planetary influences
   * 
   * @param planets The planetary influences to filter by
   * @returns Array of ingredients ruled by the specified planets
   */
  getIngredientsByPlanetaryInfluence(planets: PlanetName[]): UnifiedIngredient[] {
    try {
      const results: UnifiedIngredient[] = [];
      
      // Get ingredients for each planet
      (planets || []).forEach(planet => {
        const planetaryIngredients = consolidatedIngredientService.getIngredientsByPlanet(planet);
        results?.push(...planetaryIngredients);
      });
      
      // Remove duplicates
      const uniqueIngredients = Array.from(
        new Map((results || []).map(item => [item.name, item])).values()
      );
      
      return uniqueIngredients;
    } catch (error) {
      logger.error('Error getting ingredients by planetary influence', error);
      return [];
    }
  }
  
  /**
   * Find complementary ingredients for a given set of ingredients
   * 
   * @param ingredients The base ingredients
   * @param maxResults Maximum number of results
   * @returns Array of complementary ingredients
   */
  findComplementaryIngredients(
    ingredients: string[],
    maxResults: number = 5
  ): UnifiedIngredient[] {
    try {
      // Get complementary ingredients for each base ingredient
      const allComplementary: UnifiedIngredient[] = [];
      
      (ingredients || []).forEach(ingredient => {
        const complementary = consolidatedIngredientService.findComplementaryIngredients(
          ingredient,
          maxResults * 2 // Get more than needed to allow for filtering
        );
        
        allComplementary?.push(...complementary);
      });
      
      // Filter out any ingredients already in the base list
      const baseIngredientNames = (ingredients || []).map(name => name?.toLowerCase());
      const filtered = (allComplementary || []).filter(ingredient => 
        !baseIngredientNames.includes(ingredient.name?.toLowerCase() || '')
      );
      
      // Remove duplicates and sort by calculated complementarity
      const uniqueMap = new Map<string, UnifiedIngredient>();
      (filtered || []).forEach(ingredient => {
        if (!uniqueMap.has(ingredient.name)) {
          uniqueMap.set(ingredient.name, ingredient);
        }
      });
      
      const unique = Array.from(uniqueMap.values());
      
      // Return the top results
      return unique?.slice(0, maxResults);
    } catch (error) {
      logger.error('Error finding complementary ingredients', error);
      return [];
    }
  }
  
  /**
   * Filter ingredients by seasonal availability
   * 
   * @param season The season to filter by
   * @param filter Additional filter criteria
   * @returns Record of filtered ingredients by category
   */
  getSeasonalIngredients(
    season: Season,
    filter: Partial<IngredientFilter> = {}
  ): Record<string, UnifiedIngredient[]> {
    try {
      // Create a combined filter with the season
      const combinedFilter: IngredientFilter = {
        ...filter,
        season: [season]
      };
      
      // Use the consolidated service to filter ingredients
      return consolidatedIngredientService.filterIngredients(combinedFilter);
    } catch (error) {
      logger.error('Error getting seasonal ingredients', error);
      return {};
    }
  }
}

// Export singleton instance
export const enhancedIngredientSystem = EnhancedIngredientSystem.getInstance();

// Default export
export default EnhancedIngredientSystem;
