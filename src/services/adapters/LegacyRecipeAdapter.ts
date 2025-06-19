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
import { LocalRecipeService } from '../LocalRecipeService';

// ← Pattern HH-2: Unified Recipe type imports from primary source (@/types/alchemy)
import type {
  Recipe,
  Element,
  ElementalProperties,
  Season,
  ZodiacSign,
  LunarPhase,
  PlanetName
} from '@/types/alchemy';

// Import ScoredRecipe from correct location
import type { ScoredRecipe } from '@/types/recipe';

// Import recipe search criteria from recipe types if needed
import type { RecipeSearchCriteria } from '@/types/recipe';

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
      // ← Pattern HH-3: Safe type conversion for Recipe array
      const recipes = await unifiedRecipeService.getAllRecipes();
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error('Error in getAllRecipes:', error);
      // Fall back to LocalRecipeService if needed
      const recipes = await LocalRecipeService.getAllRecipes();
      return recipes as unknown as Recipe[];
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
      // ✅ Pattern MM-1: Convert criteria object to string for searchRecipes
      const searchQuery = (criteria as any)?.query || JSON.stringify(criteria);
      const recipes = await unifiedRecipeService.searchRecipes(searchQuery);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error('Error in searchRecipes:', error);
      // ✅ Pattern MM-1: Safe argument type conversion for string parameter
      const queryValue = (criteria as any)?.query;
      if (queryValue && typeof queryValue === 'string') {
        const recipes = await LocalRecipeService.searchRecipes(queryValue);
        return recipes as unknown as Recipe[];
      } else if (criteria && typeof criteria === 'object') {
        // Convert criteria object to search string
        const searchString = JSON.stringify(criteria).toLowerCase();
        const recipes = await LocalRecipeService.searchRecipes(searchString);
        return recipes as unknown as Recipe[];
      }
      return [];
    }
  }
  
  /**
   * Get recipes by cuisine using modern service
   */
  public async getRecipesByCuisine(cuisine: string): Promise<Recipe[]> {
    try {
      // ← Pattern HH-3: Safe type conversion for Recipe array, fixed method name
      const recipes = await unifiedRecipeService.getRecipesForCuisine(cuisine);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error(`Error in getRecipesByCuisine for "${cuisine}":`, error);
      // Fall back to LocalRecipeService if needed
      const recipes = await LocalRecipeService.getRecipesByCuisine(cuisine);
      return recipes as unknown as Recipe[];
    }
  }
  
  /**
   * Get recipes by zodiac sign using modern service
   */
  public async getRecipesByZodiac(zodiacSign: ZodiacSign): Promise<Recipe[]> {
    try {
      // ✅ Pattern MM-1: Convert object argument to string for searchRecipes
      const searchQuery = `zodiac:${zodiacSign}`;
      const recipes = await unifiedRecipeService.searchRecipes(searchQuery);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error(`Error in getRecipesByZodiac for "${zodiacSign}":`, error);
      // Simple fallback - get all recipes and filter
      const allRecipes = await LocalRecipeService.getAllRecipes();
      const filtered = (allRecipes || []).filter(recipe => 
        (recipe.astrologicalInfluences || []).some(influence => 
          influence?.toLowerCase()?.includes(zodiacSign?.toLowerCase())
        )
      );
      return filtered as unknown as Recipe[];
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
        const recipes = await serviceData.getRecipesBySeason(season);
        return recipes as unknown as Recipe[];
      }
      // ✅ Pattern MM-1: Convert object argument to string for searchRecipes
      const searchQuery = `season:${season}`;
      const recipes = await unifiedRecipeService.searchRecipes(searchQuery);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error(`Error in getRecipesBySeason for "${season}":`, error);
      // Fall back to LocalRecipeService if needed
      const recipes = await LocalRecipeService.getRecipesBySeason(season);
      return recipes as unknown as Recipe[];
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
        const recipes = await serviceData.getRecipesByLunarPhase(lunarPhase);
        return recipes as unknown as Recipe[];
      }
      // ✅ Pattern MM-1: Convert object argument to string for searchRecipes
      const searchQuery = `lunar:${lunarPhase.replace(' ', '-')}`;
      const recipes = await unifiedRecipeService.searchRecipes(searchQuery);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error(`Error in getRecipesByLunarPhase for "${lunarPhase}":`, error);
      // Simple fallback - get all recipes and filter
      const allRecipes = await LocalRecipeService.getAllRecipes();
      const filtered = (allRecipes || []).filter(recipe => 
        (recipe.lunarPhaseInfluences || []).some(influence => 
          influence?.toLowerCase()?.includes(lunarPhase?.toLowerCase()?.replace(' ', ''))
        )
      );
      return filtered as unknown as Recipe[];
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
        const recipes = await serviceData.getRecipesByMealType(mealType);
        return recipes as unknown as Recipe[];
      }
      // ✅ Pattern MM-1: Convert object argument to string for searchRecipes
      const searchQuery = `meal:${mealType}`;
      const recipes = await unifiedRecipeService.searchRecipes(searchQuery);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error(`Error in getRecipesByMealType for "${mealType}":`, error);
      // Fall back to LocalRecipeService if needed
      const recipes = await LocalRecipeService.getRecipesByMealType(mealType);
      return recipes as unknown as Recipe[];
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
      return await unifiedRecipeService.getBestRecipeMatches(criteria, limit) as unknown as ScoredRecipe[];
    } catch (error) {
      logger.error('Error in getBestRecipeMatches:', error);
      // Minimal fallback
      const allRecipes = await LocalRecipeService.getAllRecipes();
      return (allRecipes || []).slice(0, limit).map(recipe => ({
        ...recipe,
        score: 0.5 // Default score
      } as ScoredRecipe));
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
      // ✅ Pattern MM-1: Convert criteria object to string for searchRecipes  
      const searchQuery = (criteria as any)?.query || JSON.stringify(criteria);
      const searchResults = await unifiedRecipeService.searchRecipes(searchQuery) as Recipe[];
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
        return serviceData.calculateElementalProperties(recipe) as unknown as ElementalProperties;
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
