import type { Recipe } from '@/types/recipe';
import type { ElementalProperties , 
  Element, 
  Season, 
  ZodiacSign, 
  LunarPhase, 
  PlanetName 
} from '@/types/alchemy';

/**
 * RecipeFinder.ts
 * 
 * A service for finding recipes based on various criteria. This service implements
 * the RecipeServiceInterface and delegates to the ConsolidatedRecipeService.
 * 
 * This class is designed to provide a simplified recipe-finding experience with better
 * error handling and type safety.
 */


// Using local error handler implementation



import type {
  RecipeSearchCriteria, 
  RecipeRecommendationOptions,
  ApiResponse
} from './interfaces/RecipeServiceInterface';

// Missing service imports
import type { RecipeServiceInterface } from './interfaces/RecipeServiceInterface';
import { ConsolidatedRecipeService } from './ConsolidatedRecipeService';
import { errorHandler } from '@/utils/errorHandler';


/**
 * RecipeFinder class for finding recipes based on various criteria
 * Implements the RecipeServiceInterface and adds additional error handling
 */
export class RecipeFinder implements RecipeServiceInterface {
  private static instance: RecipeFinder;
  private recipeService: ConsolidatedRecipeService;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.recipeService = ConsolidatedRecipeService.getInstance();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): RecipeFinder {
    if (!RecipeFinder.instance) {
      RecipeFinder.instance = new RecipeFinder();
    }
    return RecipeFinder.instance;
  }
  
  /**
   * Get all available recipes
   */
  async getAllRecipes(): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getAllRecipes();
      return {
        success: true,
        data: recipes,
        message: 'Recipes retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getAllRecipes' },
        data: { service: 'RecipeFinder', method: 'getAllRecipes' }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Search for recipes based on criteria
   */
  async searchRecipes(
    params: any
  ): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.searchRecipes(params.criteria || {}, params.options || {});
      return {
        success: true,
        data: recipes,
        message: 'Recipes found successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.searchRecipes' },
        data: { service: 'RecipeFinder', method: 'searchRecipes', params }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(params: any): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesByCuisine(params.cuisine);
      return {
        success: true,
        data: recipes,
        message: 'Cuisine recipes retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getRecipesByCuisine' },
        data: { service: 'RecipeFinder', method: 'getRecipesByCuisine', cuisine: params.cuisine }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get recipes by zodiac sign
   */
  async getRecipesByZodiac(params: any): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesByZodiac(params.zodiacSign);
      return {
        success: true,
        data: recipes,
        message: 'Zodiac recipes retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getRecipesByZodiac' },
        data: { service: 'RecipeFinder', method: 'getRecipesByZodiac', zodiacSign: params.zodiacSign }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get recipes by season
   */
  async getRecipesBySeason(params: any): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesBySeason(params.season);
      return {
        success: true,
        data: recipes,
        message: 'Season recipes retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getRecipesBySeason' },
        data: { service: 'RecipeFinder', method: 'getRecipesBySeason', season: params.season }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get recipes by lunar phase
   */
  async getRecipesByLunarPhase(params: any): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesByLunarPhase(params.lunarPhase);
      return {
        success: true,
        data: recipes,
        message: 'Lunar phase recipes retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getRecipesByLunarPhase' },
        data: { service: 'RecipeFinder', method: 'getRecipesByLunarPhase', lunarPhase: params.lunarPhase }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get recipes by meal type
   */
  async getRecipesByMealType(params: any): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesByMealType(params.mealType);
      return {
        success: true,
        data: recipes,
        message: 'Meal type recipes retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getRecipesByMealType' },
        data: { service: 'RecipeFinder', method: 'getRecipesByMealType', mealType: params.mealType }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get recipes that match current planetary alignments
   */
  async getRecipesForPlanetaryAlignment(params: any): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesForPlanetaryAlignment(
        params.planetaryInfluences,
        params.minMatchScore
      );
      return {
        success: true,
        data: recipes,
        message: 'Planetary alignment recipes retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getRecipesForPlanetaryAlignment' },
        data: { service: 'RecipeFinder', method: 'getRecipesForPlanetaryAlignment', planetaryInfluences: params.planetaryInfluences, minMatchScore: params.minMatchScore }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get recipes that match a given flavor profile
   */
  async getRecipesForFlavorProfile(params: any): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesForFlavorProfile(
        params.flavorProfile,
        params.minMatchScore
      );
      return {
        success: true,
        data: recipes,
        message: 'Flavor profile recipes retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getRecipesForFlavorProfile' },
        data: { service: 'RecipeFinder', method: 'getRecipesForFlavorProfile', flavorProfile: params.flavorProfile, minMatchScore: params.minMatchScore }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get best recipe matches based on multiple criteria
   */
  async getBestRecipeMatches(params: any): Promise<ApiResponse<any[]>> {
    try {
      const recipes = await this.recipeService.getBestRecipeMatches(params.criteria, params.maxResults || 10);
      return {
        success: true,
        data: recipes,
        message: 'Best recipe matches retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getBestRecipeMatches' },
        data: { service: 'RecipeFinder', method: 'getBestRecipeMatches', criteria: params.criteria, maxResults: params.maxResults }
      });
      return {
        success: false,
        data: [],
        message: errorObj.message
      };
    }
  }
  
  /**
   * Get recipe by ID
   */
  async getRecipeById(params: any): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await (this.recipeService as any).getRecipeById(params.id);
      return {
        success: true,
        data: recipe,
        message: 'Recipe retrieved successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getRecipeById' },
        data: { service: 'RecipeFinder', method: 'getRecipeById', recipeId: params.id }
      });
      return {
        success: false,
        data: {} as Recipe,
        message: errorObj.message
      };
    }
  }
  
  /**
   * Generate a recipe based on criteria
   */
  async generateRecipe(params: any): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await this.recipeService.generateRecipe(params.criteria);
      return {
        success: true,
        data: recipe,
        message: 'Recipe generated successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.generateRecipe' },
        data: { service: 'RecipeFinder', method: 'generateRecipe', criteria: params.criteria }
      });
      return {
        success: false,
        data: {
          id: 'error',
          name: 'Error generating recipe',
          ingredients: [],
          instructions: [],
          cuisine: 'Unknown',
          elementalProperties: { Fire: 0, Water: 0, Earth: 0, Air: 0 }
        },
        message: errorObj.message
      };
    }
  }
  
  /**
   * Generate a fusion recipe combining multiple cuisines
   */
  async generateFusionRecipe(params: any): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await this.recipeService.generateFusionRecipe(params.cuisines, params.criteria);
      return {
        success: true,
        data: recipe,
        message: 'Fusion recipe generated successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.generateFusionRecipe' },
        data: { service: 'RecipeFinder', method: 'generateFusionRecipe', cuisines: params.cuisines, criteria: params.criteria }
      });
      return {
        success: false,
        data: {
          id: 'error',
          name: 'Error generating fusion recipe',
          ingredients: [],
          instructions: [],
          cuisine: params.cuisines?.join('-'),
          elementalProperties: { Fire: 0, Water: 0, Earth: 0, Air: 0 }
        },
        message: errorObj.message
      };
    }
  }
  
  /**
   * Adapt a recipe for the current season
   */
  async adaptRecipeForSeason(params: any): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await this.recipeService.adaptRecipeForSeason(params.recipe, params.season);
      return {
        success: true,
        data: recipe,
        message: 'Recipe adapted successfully'
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.adaptRecipeForSeason' },
        data: { service: 'RecipeFinder', method: 'adaptRecipeForSeason', recipeId: params.recipe?.id || 'unknown', season: params.season }
      });
      return {
        success: false,
        data: params.recipe,
        message: errorObj.message
      };
    }
  }
  
  /**
   * Calculate the elemental properties of a recipe
   */
  calculateElementalProperties(recipe: Partial<Recipe>): ElementalProperties {
    try {
      return this.recipeService.calculateElementalProperties(recipe);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.calculateElementalProperties' },
        data: { service: 'RecipeFinder', method: 'calculateElementalProperties', recipeId: recipe?.id || 'unknown' }
      });
      // Return balanced elemental properties on error
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
  }
  
  /**
   * Get the dominant element of a recipe
   */
  getDominantElement(recipe: Recipe): { element: keyof ElementalProperties; value: number } {
    try {
      return this.recipeService.getDominantElement(recipe);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.getDominantElement' },
        data: { service: 'RecipeFinder', method: 'getDominantElement', recipeId: recipe?.id || 'unknown' }
      });
      // Return a default element on error
      return { element: 'Fire', value: 0 };
    }
  }
  
  /**
   * Calculate the similarity between two recipes
   */
  calculateSimilarity(recipe1: Recipe, recipe2: Recipe): number {
    try {
      return this.recipeService.calculateSimilarity(recipe1, recipe2);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.calculateSimilarity' },
        data: { service: 'RecipeFinder', method: 'calculateSimilarity', recipe1Id: recipe1?.id || 'unknown', recipe2Id: recipe2?.id || 'unknown' }
      });
      // Return zero similarity on error
      return 0;
    }
  }
  
  /**
   * Clear the recipe cache
   */
  clearCache(): void {
    try {
      this.recipeService.clearCache();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { operation: 'RecipeFinder.clearCache' },
        data: { service: 'RecipeFinder', method: 'clearCache' }
      });
    }
  }
}

// Export standalone function for compatibility
export const getAllRecipes = async (): Promise<Recipe[]> => {
  return await RecipeFinder.getInstance().getAllRecipes();
}; 