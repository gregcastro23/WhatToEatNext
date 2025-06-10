/**
 * LegacyRecipeAdapter.ts
 * 
 * This adapter provides a bridge between legacy recipe-related services and the
 * modern UnifiedRecipeService. It allows components that still rely on the
 * legacy service methods to work with the new service architecture.
 * 
 * The adapter implements legacy methods but delegates to modern services.
 */

import { unifiedRecipeService } from '../UnifiedRecipeService';


import { createLogger } from '../../utils/logger';
import { Element , ElementalProperties } from "@/types/alchemy";

import type { Recipe, RecipeSearchCriteria } from '@/types/recipe';
import { LocalRecipeService } from '../LocalRecipeService';

import type {
  ScoredRecipe 
} from "@/types/recipe";

import type {
  Season,
  ZodiacSign,
  LunarPhase,
  PlanetName
} from '@/types/alchemy';

import { RecipeRecommendationOptions } from '../interfaces/RecipeServiceInterface';

// Initialize logger
const logger = createLogger('LegacyRecipeAdapter');

/**
 * LegacyRecipeAdapter
 * 
 * Adapter that emulates legacy recipe service behavior but uses
 * the modern UnifiedRecipeService internally.
 */
export class LegacyRecipeAdapter {
  private static _instance: LegacyRecipeAdapter;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    logger.info('LegacyRecipeAdapter initialized');
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): LegacyRecipeAdapter {
    if (!LegacyRecipeAdapter._instance) {
      LegacyRecipeAdapter._instance = new LegacyRecipeAdapter();
    }
    return LegacyRecipeAdapter._instance;
  }
  
  /**
   * Get all recipes using modern service
   */
  public async getAllRecipes(): Promise<Recipe[]> {
    try {
      return await unifiedRecipeService.getAllRecipes();
    } catch (error) {
      logger.error('Error in getAllRecipes:', error);
      // Fall back to LocalRecipeService if needed
      return await LocalRecipeService.getAllRecipes();
    }
  }
  
  /**
   * Search recipes using modern service
   */
  public async searchRecipes(
    criteria: RecipeSearchCriteria,
    options: RecipeRecommendationOptions = {}
  ): Promise<Recipe[]> {
    try {
      return await unifiedRecipeService.searchRecipes(criteria, options);
    } catch (error) {
      logger.error('Error in searchRecipes:', error);
      // Provide a simplified fallback
      if (criteria.query) {
        return await LocalRecipeService.searchRecipes(criteria.query);
      }
      return [];
    }
  }
  
  /**
   * Get recipes by cuisine using modern service
   */
  public async getRecipesByCuisine(cuisine: string): Promise<Recipe[]> {
    try {
      return await unifiedRecipeService.getRecipesByCuisine(cuisine);
    } catch (error) {
      logger.error(`Error in getRecipesByCuisine for "${cuisine}":`, error);
      // Fall back to LocalRecipeService if needed
      return await LocalRecipeService.getRecipesByCuisine(cuisine);
    }
  }
  
  /**
   * Get recipes by zodiac sign using modern service
   */
  public async getRecipesByZodiac(zodiacSign: ZodiacSign): Promise<Recipe[]> {
    try {
      return await unifiedRecipeService.getRecipesByZodiac(zodiacSign);
    } catch (error) {
      logger.error(`Error in getRecipesByZodiac for "${zodiacSign}":`, error);
      // Simple fallback - get all recipes and filter
      const allRecipes = await LocalRecipeService.getAllRecipes();
      return (allRecipes || []).filter(recipe => 
        (recipe.astrologicalInfluences || []).some(influence => 
          influence?.toLowerCase()?.includes(zodiacSign?.toLowerCase())
        )
      );
    }
  }
  
  /**
   * Get recipes by season using modern service
   */
  public async getRecipesBySeason(season: Season): Promise<Recipe[]> {
    try {
      // Apply safe type casting for service access
      const serviceData = unifiedRecipeService as any;
      if (serviceData?.getRecipesBySeason) {
        return await serviceData.getRecipesBySeason(season);
      }
      // Enhanced fallback to search with season criteria
      return await unifiedRecipeService.searchRecipes({ season }, {});
    } catch (error) {
      logger.error(`Error in getRecipesBySeason for "${season}":`, error);
      // Fall back to LocalRecipeService if needed
      return await LocalRecipeService.getRecipesBySeason(season);
    }
  }
  
  /**
   * Get recipes by lunar phase using modern service
   */
  public async getRecipesByLunarPhase(lunarPhase: LunarPhase): Promise<Recipe[]> {
    try {
      // Apply safe type casting for service access
      const serviceData = unifiedRecipeService as any;
      if (serviceData?.getRecipesByLunarPhase) {
        return await serviceData.getRecipesByLunarPhase(lunarPhase);
      }
      // Enhanced fallback to search with lunar phase criteria
      return await unifiedRecipeService.searchRecipes({ lunarPhase }, {});
    } catch (error) {
      logger.error(`Error in getRecipesByLunarPhase for "${lunarPhase}":`, error);
      // Simple fallback - get all recipes and filter
      const allRecipes = await LocalRecipeService.getAllRecipes();
      return (allRecipes || []).filter(recipe => 
        (recipe.lunarPhaseInfluences || []).some(influence => 
          influence?.toLowerCase()?.includes(lunarPhase?.toLowerCase()?.replace(' ', ''))
        )
      );
    }
  }
  
  /**
   * Get recipes by meal type using modern service
   */
  public async getRecipesByMealType(mealType: string): Promise<Recipe[]> {
    try {
      // Apply safe type casting for service access
      const serviceData = unifiedRecipeService as any;
      if (serviceData?.getRecipesByMealType) {
        return await serviceData.getRecipesByMealType(mealType);
      }
      // Enhanced fallback to search with meal type criteria
      return await unifiedRecipeService.searchRecipes({ mealType }, {});
    } catch (error) {
      logger.error(`Error in getRecipesByMealType for "${mealType}":`, error);
      // Fall back to LocalRecipeService if needed
      return await LocalRecipeService.getRecipesByMealType(mealType);
    }
  }
  
  /**
   * Get best recipe matches using modern service
   */
  public async getBestRecipeMatches(
    criteria: {
      cuisine?: string;
      flavorProfile?: { [key: string]: number };
      season?: Season;
      zodiacSign?: ZodiacSign;
      lunarPhase?: LunarPhase;
      planetName?: PlanetName;
      elementalFocus?: Element;
      maxResults?: number;
    },
    limit: number = 10
  ): Promise<ScoredRecipe[]> {
    try {
      return await unifiedRecipeService.getBestRecipeMatches(criteria, limit);
    } catch (error) {
      logger.error('Error in getBestRecipeMatches:', error);
      // Minimal fallback
      const allRecipes = await LocalRecipeService.getAllRecipes();
      return (allRecipes || []).slice(0, limit).map(recipe => ({
        recipe,
        score: 0.5 // Default score
      }));
    }
  }
  
  /**
   * Generate recipe using modern service
   */
  public async generateRecipe(criteria: RecipeSearchCriteria): Promise<Recipe> {
    try {
      // Apply safe type casting for service access
      const serviceData = unifiedRecipeService as any;
      if (serviceData?.generateRecipe) {
        return await serviceData.generateRecipe(criteria);
      }
      // Enhanced fallback - create a basic recipe from search results
      const searchResults = await unifiedRecipeService.searchRecipes(criteria, { limit: 1 });
      if (searchResults.length > 0) {
        return searchResults[0];
      }
      throw new Error('No recipes found matching criteria');
    } catch (error) {
      logger.error('Error in generateRecipe:', error);
      throw new Error('Recipe generation failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  
  /**
   * Calculate elemental properties using modern service
   */
  public calculateElementalProperties(recipe: Partial<Recipe>): ElementalProperties {
    try {
      // Apply safe type casting for service access
      const serviceData = unifiedRecipeService as any;
      if (serviceData?.calculateElementalProperties) {
        return serviceData.calculateElementalProperties(recipe);
      }
      // Enhanced fallback - calculate based on available recipe data
      const defaultProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      
      // Basic calculation based on recipe properties if available
      if (recipe.elementalState) {
        return recipe.elementalState;
      }
      
      return defaultProperties;
    } catch (error) {
      logger.error(`Error in calculateElementalProperties for "${recipe.name || 'unknown'}":`, error);
      // Default elemental properties as fallback
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
  }
  
  /**
   * Clear cache in modern service
   */
  public clearCache(): void {
    try {
      // Apply safe type casting for service access
      const serviceData = unifiedRecipeService as any;
      if (serviceData?.clearCache) {
        serviceData.clearCache();
      }
      logger.info('Recipe cache cleared (or not available)');
    } catch (error) {
      logger.error('Error in clearCache:', error);
    }
  }
}

// Export singleton instance


// Export default for compatibility with existing code

export default LegacyRecipeAdapter;
