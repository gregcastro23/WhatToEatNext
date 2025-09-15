import type { ElementalProperties } from '@/types/alchemy';
import type { Recipe, ScoredRecipe } from '@/types/recipe';

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

import { errorHandler } from '@/utils/errorHandler';

import { ConsolidatedRecipeService } from './ConsolidatedRecipeService';
import type {
  AdaptRecipeForSeasonParams,
  ApiResponse,
  GenerateFusionRecipeParams,
  GenerateRecipeParams,
  GetBestRecipeMatchesParams,
  GetRecipeByIdParams,
  GetRecipesByCuisineParams,
  GetRecipesByLunarPhaseParams,
  GetRecipesByMealTypeParams,
  GetRecipesBySeasonParams,
  GetRecipesByZodiacParams,
  GetRecipesForFlavorProfileParams,
  GetRecipesForPlanetaryAlignmentParams,
  SearchRecipesParams
} from './interfaces/RecipeApiInterfaces';
import type { RecipeServiceInterface } from './interfaces/RecipeServiceInterface';

// Missing service imports

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
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: { service: 'RecipeFinder', action: 'getAllRecipes', data: {} }
      });
      return {
        success: false,
        error: {
          code: 'DATA_SOURCE_ERROR',
          message: 'Failed to retrieve recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Search for recipes based on criteria
   */
  async searchRecipes(params: SearchRecipesParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.searchRecipes(params.criteria, params.options);
      return {
        success: true,
        data: recipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: { service: 'RecipeFinder', action: 'searchRecipes', data: params.criteria }
      });
      return {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to search recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(params: GetRecipesByCuisineParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesByCuisine(params.cuisine);
      return {
        success: true,
        data: recipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: { service: 'RecipeFinder', action: 'getRecipesByCuisine', data: params.cuisine }
      });
      return {
        success: false,
        error: {
          code: 'DATA_SOURCE_ERROR',
          message: 'Failed to retrieve cuisine recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recipes by zodiac sign
   */
  async getRecipesByZodiac(params: GetRecipesByZodiacParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesByZodiac(params.currentZodiacSign);
      return {
        success: true,
        data: recipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'getRecipesByZodiac',
          data: params.currentZodiacSign
        }
      });
      return {
        success: false,
        error: {
          code: 'DATA_SOURCE_ERROR',
          message: 'Failed to retrieve zodiac recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recipes by season
   */
  async getRecipesBySeason(params: GetRecipesBySeasonParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesBySeason(params.season);
      return {
        success: true,
        data: recipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: { service: 'RecipeFinder', action: 'getRecipesBySeason', data: params.season }
      });
      return {
        success: false,
        error: {
          code: 'DATA_SOURCE_ERROR',
          message: 'Failed to retrieve seasonal recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recipes by lunar phase
   */
  async getRecipesByLunarPhase(
    params: GetRecipesByLunarPhaseParams,
  ): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesByLunarPhase(params.lunarPhase);
      return {
        success: true,
        data: recipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'getRecipesByLunarPhase',
          data: params.lunarPhase
        }
      });
      return {
        success: false,
        error: {
          code: 'DATA_SOURCE_ERROR',
          message: 'Failed to retrieve lunar phase recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recipes by meal type
   */
  async getRecipesByMealType(params: GetRecipesByMealTypeParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesByMealType(params.mealType);
      return {
        success: true,
        data: recipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: { service: 'RecipeFinder', action: 'getRecipesByMealType', data: params.mealType }
      });
      return {
        success: false,
        error: {
          code: 'DATA_SOURCE_ERROR',
          message: 'Failed to retrieve meal type recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recipes that match current planetary alignments
   */
  async getRecipesForPlanetaryAlignment(
    params: GetRecipesForPlanetaryAlignmentParams,
  ): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesForPlanetaryAlignment(;
        params.planetaryInfluences,
        params.minMatchScore,
      );
      return {
        success: true,
        data: recipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'getRecipesForPlanetaryAlignment',
          data: {
            planetaryInfluences: params.planetaryInfluences,
            minMatchScore: params.minMatchScore
          }
        }
      });
      return {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to retrieve planetary alignment recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recipes that match a given flavor profile
   */
  async getRecipesForFlavorProfile(
    params: GetRecipesForFlavorProfileParams,
  ): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesForFlavorProfile(;
        params.flavorProfile,
        params.minMatchScore,
      );
      return {
        success: true,
        data: recipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: recipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'getRecipesForFlavorProfile',
          data: { flavorProfile: params.flavorProfile, minMatchScore: params.minMatchScore }
        }
      });
      return {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to retrieve flavor profile recipes',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get best recipe matches based on multiple criteria
   */
  async getBestRecipeMatches(
    params: GetBestRecipeMatchesParams,
  ): Promise<ApiResponse<ScoredRecipe[]>> {
    try {
      const recipes = await this.recipeService.getBestRecipeMatches(params.criteria, 10);
      // Convert recipes to scored recipes if they don't already have scores
      const scoredRecipes: ScoredRecipe[] = recipes.map((recipe, index) => ({
        ...recipe,
        score: recipe.score ?? 1 - index * 0.1, // Assign decreasing scores if not present
      }));

      return {
        success: true,
        data: scoredRecipes,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          count: scoredRecipes.length
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'getBestRecipeMatches',
          data: { criteria: params.criteria }
        }
      });
      return {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to get best recipe matches',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get a recipe by its ID
   */
  async getRecipeById(params: GetRecipeByIdParams): Promise<ApiResponse<Recipe>> {
    try {
      // Since ConsolidatedRecipeService doesn't have getRecipeById, we'll search for it
      const allRecipes = await this.recipeService.getAllRecipes();
      const recipe = allRecipes.find(r => r.id === params.id);

      if (!recipe) {
        return {
          success: false,
          error: {
            code: 'RECIPE_NOT_FOUND',
            message: `Recipe with ID ${params.id} not found`,
            details: 'The requested recipe does not exist in the database'
          }
        };
      }

      return {
        success: true,
        data: recipe,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0'
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: { service: 'RecipeFinder', action: 'getRecipeById', data: { id: params.id } }
      });
      return {
        success: false,
        error: {
          code: 'RECIPE_NOT_FOUND',
          message: 'Failed to retrieve recipe',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Generate a recipe based on criteria
   */
  async generateRecipe(params: GenerateRecipeParams): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await this.recipeService.generateRecipe(params.criteria);
      return {
        success: true,
        data: recipe,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0'
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: { service: 'RecipeFinder', action: 'generateRecipe', data: params.criteria }
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
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to generate recipe',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Generate a fusion recipe combining multiple cuisines
   */
  async generateFusionRecipe(params: GenerateFusionRecipeParams): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await this.recipeService.generateFusionRecipe(;
        params.cuisines,
        params.criteria,
      );
      return {
        success: true,
        data: recipe,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0'
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'generateFusionRecipe',
          data: { cuisines: params.cuisines, criteria: params.criteria }
        }
      });
      return {
        success: false,
        data: {
          id: 'error',
          name: 'Error generating fusion recipe',
          ingredients: [],
          instructions: [],
          cuisine: params.cuisines.join('-'),
          elementalProperties: { Fire: 0, Water: 0, Earth: 0, Air: 0 }
        },
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to generate fusion recipe',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Adapt a recipe for the current season
   */
  async adaptRecipeForSeason(params: AdaptRecipeForSeasonParams): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await this.recipeService.adaptRecipeForSeason(;
        { id: params.recipeId } as Recipe,
        params.season,
      );
      return {
        success: true,
        data: recipe,
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0'
        }
      };
    } catch (error) {
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'adaptRecipeForSeason',
          data: { recipeId: params.recipeId, season: params.season }
        }
      });
      return {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to adapt recipe',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
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
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'calculateElementalProperties',
          data: { recipeId: recipe.id || 'unknown' }
        }
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
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'getDominantElement',
          data: { recipeId: recipe.id || 'unknown' }
        }
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
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: {
          service: 'RecipeFinder',
          action: 'calculateSimilarity',
          data: { recipe1Id: recipe1.id || 'unknown', recipe2Id: recipe2.id || 'unknown' }
        }
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
      errorHandler.log(error instanceof Error ? error : new Error(String(error)), {
        context: { service: 'RecipeFinder', action: 'clearCache' }
      });
    }
  }
}

// Export standalone function for compatibility
export const getAllRecipes = async (): Promise<Recipe[]> => {;
  const response = await RecipeFinder.getInstance().getAllRecipes();
  return response.success ? response.data || [] : [];
};
