type Season = 'spring' | 'summer' | 'autumn' | 'winter';

const logger = {
  info: (message: string, ...args: any[]) => console.log('[INFO]', message, ...args),
  warn: (message: string, ...args: any[]) => console.warn('[WARN]', message, ...args),
  error: (message: string, ...args: any[]) => console.error('[ERROR]', message, ...args),
  debug: (message: string, ...args: any[]) => console.debug('[DEBUG]', message, ...args)
};
/**
 * ConsolidatedRecipeService.ts
 * 
 * A consolidated implementation of the RecipeServiceInterface that combines
 * functionality from LocalRecipeService, UnifiedRecipeService, and RecipeElementalService.
 * 
 * This service serves as the primary entry point for all recipe-related operations
 * in the WhatToEatNext application.
 */


import type {
         getRecipesForPlanetaryAlignment, 
         getRecipesForFlavorProfile, 
         getBestRecipeMatches 
} from '../data/recipes';
import { logger } from '../utils/logger';


import type { 
  Element, 
  Season, 
  ZodiacSign, 
  LunarPhase, 
  PlanetName 
} from '@/types/alchemy';

import type {
  RecipeSearchCriteria, 
  RecipeRecommendationOptions 
} from './interfaces/RecipeServiceInterface';

/**
 * Implementation of the RecipeServiceInterface that delegates to specialized services
 * and consolidates their functionality into a single, consistent API.
 */
export class ConsolidatedRecipeService implements RecipeServiceInterface {
  private static instance: ConsolidatedRecipeService;
  private recipeCache: Map<string, Recipe[]> = new Map();
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Private constructor
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ConsolidatedRecipeService {
    if (!ConsolidatedRecipeService.instance) {
      ConsolidatedRecipeService.instance = new ConsolidatedRecipeService();
    }
    return ConsolidatedRecipeService.instance;
  }
  
  /**
   * Get all available recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      return await LocalRecipeService.getAllRecipes();
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getAllRecipes',
      });
      return [];
    }
  }
  
  /**
   * Search for recipes based on criteria
   */
  async searchRecipes(
    criteria: RecipeSearchCriteria, 
    options: RecipeRecommendationOptions = {}
  ): Promise<Recipe[]> {
    try {
      // Convert our criteria to UnifiedRecipeService format
      const unifiedResults = await unifiedRecipeService.searchRecipes(criteria, options);
      
      // Extract just the Recipe objects from the results
      return (unifiedResults || []).map(result => result.recipe);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'searchRecipes',
        criteria
      });
      return [];
    }
  }
  
  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(cuisine: string): Promise<Recipe[]> {
    try {
      return await LocalRecipeService.getRecipesByCuisine(cuisine);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getRecipesByCuisine',
        cuisine
      });
      return [];
    }
  }
  
  /**
   * Get recipes by zodiac sign
   */
  async getRecipesByZodiac(currentZodiacSign: ZodiacSign): Promise<Recipe[]> {
    try {
      const recipeData = await getRecipesForZodiac(currentZodiacSign);
      return adaptAllRecipes(recipeData);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getRecipesByZodiac',
        currentZodiacSign
      });
      return [];
    }
  }
  
  /**
   * Get recipes by season
   */
  async getRecipesBySeason(season: Season): Promise<Recipe[]> {
    try {
      const recipeData = await getRecipesForSeason(season);
      return adaptAllRecipes(recipeData);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getRecipesBySeason',
        season
      });
      return [];
    }
  }
  
  /**
   * Get recipes by lunar phase
   */
  async getRecipesByLunarPhase(lunarPhase: LunarPhase): Promise<Recipe[]> {
    try {
      const recipeData = await getRecipesForLunarPhase(lunarPhase);
      return adaptAllRecipes(recipeData);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getRecipesByLunarPhase',
        lunarPhase
      });
      return [];
    }
  }
  
  /**
   * Get recipes by meal type
   */
  async getRecipesByMealType(mealType: string): Promise<Recipe[]> {
    try {
      return await LocalRecipeService.getRecipesByMealType(mealType);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getRecipesByMealType',
        mealType
      });
      return [];
    }
  }
  
  /**
   * Get recipes that match current planetary alignments
   */
  async getRecipesForPlanetaryAlignment(
    planetaryInfluences: { [key: string]: number },
    minMatchScore: number = 0.6,
  ): Promise<Recipe[]> {
    try {
      return await getRecipesForPlanetaryAlignment(planetaryInfluences, minMatchScore);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getRecipesForPlanetaryAlignment',
      });
      return [];
    }
  }
  
  /**
   * Get recipes that match a given flavor profile
   */
  async getRecipesForFlavorProfile(
    flavorProfile: { [key: string]: number },
    minMatchScore: number = 0.7,
  ): Promise<Recipe[]> {
    try {
      return await getRecipesForFlavorProfile(flavorProfile, minMatchScore);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getRecipesForFlavorProfile',
      });
      return [];
    }
  }
  
  /**
   * Get best recipe matches based on multiple criteria
   */
  async getBestRecipeMatches(
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
  ): Promise<Recipe[]> {
    try {
      return await getBestRecipeMatches(criteria, limit);
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'getBestRecipeMatches',
        criteria
      });
      return [];
    }
  }
  
  /**
   * Generate a recipe based on criteria
   */
  async generateRecipe(criteria: RecipeSearchCriteria): Promise<Recipe> {
    try {
      // Convert criteria to unifiedRecipeService format
      const unifiedResult = await unifiedRecipeService.generateRecipe(criteria);
      return unifiedResult.recipe;
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'generateRecipe',
        criteria
      });
      throw error;
    }
  }
  
  /**
   * Generate a fusion recipe combining multiple cuisines
   */
  async generateFusionRecipe(
    cuisines: string[],
    criteria: RecipeSearchCriteria,
  ): Promise<Recipe> {
    try {
      // Convert criteria to unifiedRecipeService format
      const unifiedResult = await unifiedRecipeService.generateFusionRecipe(cuisines, criteria);
      return unifiedResult.recipe;
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'generateFusionRecipe',
        cuisines,
        criteria
      });
      throw error;
    }
  }
  
  /**
   * Adapt a recipe for the current season
   */
  async adaptRecipeForSeason(
    recipe: Recipe,
    season?: Season
  ): Promise<Recipe> {
    try {
      const unifiedResult = await unifiedRecipeService.adaptRecipeForCurrentSeason(recipe);
      return unifiedResult.recipe;
    } catch (error) {
      errorHandler.logError(error, {
        context: 'ConsolidatedRecipeService',
        action: 'adaptRecipeForSeason',
        recipe,
        season
      });
      return recipe; // Return original recipe on error
    }
  }
  
  /**
   * Calculate the elemental properties of a recipe
   */
  calculateElementalProperties(recipe: Partial<Recipe>): ElementalProperties {
    try {
      return recipeElementalService.deriveElementalProperties(recipe);
    } catch (error) {
      logger.error('Error calculating elemental properties', error);
      // Return balanced properties on error
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
      };
    }
  }
  
  /**
   * Get the dominant element of a recipe
   */
  getDominantElement(recipe: Recipe): { element: keyof ElementalProperties; value: number } {
    try {
      return recipeElementalService.getDominantElement(recipe);
    } catch (error) {
      logger.error('Error getting dominant element', error);
      // Return Earth as default
      return { element: 'Earth', value: 0.25 };
    }
  }
  
  /**
   * Calculate the similarity between two recipes based on their elemental properties
   */
  calculateSimilarity(recipe1: Recipe, recipe2: Recipe): number {
    try {
      const elementalProps1 = recipeElementalService.standardizeRecipe(recipe1)?.elementalState;
      const elementalProps2 = recipeElementalService.standardizeRecipe(recipe2)?.elementalState;
      
      return recipeElementalService.calculateSimilarity(elementalProps1, elementalProps2);
    } catch (error) {
      logger.error('Error calculating recipe similarity', error);
      return 0.5; // Return neutral similarity on error
    }
  }
  
  /**
   * Clear the recipe cache
   */
  clearCache(): void {
    this.recipeCache.clear();
    LocalRecipeService.clearCache();
  }
}

// Export singleton instance

export const consolidatedRecipeService = new ConsolidatedRecipeService();
