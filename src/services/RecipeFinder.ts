import type { Recipe, ScoredRecipe } from '@/types/recipe';
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
  RecipeRecommendationOptions
} from './interfaces/RecipeServiceInterface';

import type {
  ApiResponse,
  SearchRecipesParams,
  GetRecipesByCuisineParams,
  GetRecipesByZodiacParams,
  GetRecipesBySeasonParams,
  GetRecipesByLunarPhaseParams,
  GetRecipesByMealTypeParams,
  GetRecipesForPlanetaryAlignmentParams,
  GetRecipesForFlavorProfileParams,
  GetBestRecipeMatchesParams,
  GetRecipeByIdParams,
  GenerateRecipeParams,
  GenerateFusionRecipeParams,
  AdaptRecipeForSeasonParams
} from './interfaces/RecipeApiInterfaces';

// Missing service imports
import type { RecipeServiceInterface } from './interfaces/RecipeServiceInterface';
import { ConsolidatedRecipeService } from './ConsolidatedRecipeService';
import { errorHandler } from '@/utils/errorHandler';

// Type guard functions for safe parameter validation
function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidZodiacSign(value: unknown): value is ZodiacSign {
  if (!isValidString(value)) return false;
  const validSigns: ZodiacSign[] = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
  return validSigns.includes(value as ZodiacSign);
}

function isValidSeason(value: unknown): value is Season {
  if (!isValidString(value)) return false;
  const validSeasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
  return validSeasons.includes(value as Season);
}

function isValidLunarPhase(value: unknown): value is LunarPhase {
  if (!isValidString(value)) return false;
  const validPhases: LunarPhase[] = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon', 'waning gibbous', 'last quarter', 'waning crescent'];
  return validPhases.includes(value as LunarPhase);
}

function isValidRecipeSearchCriteria(value: unknown): value is RecipeSearchCriteria {
  return typeof value === 'object' && value !== null;
}

function isValidRecipeRecommendationOptions(value: unknown): value is RecipeRecommendationOptions {
  return typeof value === 'object' && value !== null;
}

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
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getAllRecipes' },
          data: { service: 'RecipeFinder', method: 'getAllRecipes' }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Search for recipes based on criteria
   */
  async searchRecipes(
    params: SearchRecipesParams
  ): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.searchRecipes(params.criteria, params.options);
      return {
        success: true,
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.searchRecipes' },
          data: { service: 'RecipeFinder', method: 'searchRecipes', params: params as unknown as Record<string, unknown> }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
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
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getRecipesByCuisine' },
          data: { service: 'RecipeFinder', method: 'getRecipesByCuisine', cuisine: params.cuisine }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Get recipes by zodiac sign
   */
  async getRecipesByZodiac(params: GetRecipesByZodiacParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const zodiacSign = params.currentZodiacSign;
      if (!isValidZodiacSign(zodiacSign)) {
        return {
          success: false,
          data: [],
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Invalid zodiac sign parameter'
          }
        };
      }
      
      const recipes = await this.recipeService.getRecipesByZodiac(zodiacSign);
      return {
        success: true,
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getRecipesByZodiac' },
          data: { service: 'RecipeFinder', method: 'getRecipesByZodiac', zodiacSign: params.currentZodiacSign }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Get recipes by season
   */
  async getRecipesBySeason(params: GetRecipesBySeasonParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const season = params.season;
      if (!isValidSeason(season)) {
        return {
          success: false,
          data: [],
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Invalid season parameter'
          }
        };
      }
      
      const recipes = await this.recipeService.getRecipesBySeason(season);
      return {
        success: true,
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getRecipesBySeason' },
          data: { service: 'RecipeFinder', method: 'getRecipesBySeason', season: params.season }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Get recipes by lunar phase
   */
  async getRecipesByLunarPhase(params: GetRecipesByLunarPhaseParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const lunarPhase = params.lunarPhase;
      if (!isValidLunarPhase(lunarPhase)) {
        return {
          success: false,
          data: [],
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Invalid lunar phase parameter'
          }
        };
      }
      
      const recipes = await this.recipeService.getRecipesByLunarPhase(lunarPhase);
      return {
        success: true,
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getRecipesByLunarPhase' },
          data: { service: 'RecipeFinder', method: 'getRecipesByLunarPhase', lunarPhase: params.lunarPhase }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
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
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getRecipesByMealType' },
          data: { service: 'RecipeFinder', method: 'getRecipesByMealType', mealType: params.mealType }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Get recipes that match current planetary alignments
   */
  async getRecipesForPlanetaryAlignment(params: GetRecipesForPlanetaryAlignmentParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesForPlanetaryAlignment(
        params.planetaryInfluences,
        params.minMatchScore
      );
      return {
        success: true,
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getRecipesForPlanetaryAlignment' },
          data: { service: 'RecipeFinder', method: 'getRecipesForPlanetaryAlignment', planetaryInfluences: params.planetaryInfluences, minMatchScore: params.minMatchScore }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Get recipes that match a given flavor profile
   */
  async getRecipesForFlavorProfile(params: GetRecipesForFlavorProfileParams): Promise<ApiResponse<Recipe[]>> {
    try {
      const recipes = await this.recipeService.getRecipesForFlavorProfile(
        params.flavorProfile,
        params.minMatchScore
      );
      return {
        success: true,
        data: recipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getRecipesForFlavorProfile' },
          data: { service: 'RecipeFinder', method: 'getRecipesForFlavorProfile', flavorProfile: params.flavorProfile, minMatchScore: params.minMatchScore }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Get best recipe matches based on multiple criteria
   */
  async getBestRecipeMatches(params: GetBestRecipeMatchesParams): Promise<ApiResponse<ScoredRecipe[]>> {
    try {
      const recipes = await this.recipeService.getBestRecipeMatches(
        params.criteria,
        10 // Default limit since maxResults is not in the criteria
      );
      
      // Convert Recipe[] to ScoredRecipe[] by adding score property
      const scoredRecipes: ScoredRecipe[] = recipes.map(recipe => ({
        ...recipe,
        score: recipe.score || 0.5 // Default score if not present
      }));
      
      return {
        success: true,
        data: scoredRecipes
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getBestRecipeMatches' },
          data: { service: 'RecipeFinder', method: 'getBestRecipeMatches', criteria: params.criteria as unknown as Record<string, unknown> }
        }
      });
      return {
        success: false,
        data: [],
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Get recipe by ID
   */
  async getRecipeById(params: GetRecipeByIdParams): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await (this.recipeService as any).getRecipeById(params.id);
      return {
        success: true,
        data: recipe
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getRecipeById' },
          data: { service: 'RecipeFinder', method: 'getRecipeById', id: params.id }
        }
      });
      return {
        success: false,
        data: undefined,
        error: {
          code: 'RECIPE_NOT_FOUND',
          message: errorObj.message
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
        data: recipe
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.generateRecipe' },
          data: { service: 'RecipeFinder', method: 'generateRecipe', criteria: params.criteria }
        }
      });
      return {
        success: false,
        data: undefined,
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Generate a fusion recipe combining multiple cuisines
   */
  async generateFusionRecipe(params: GenerateFusionRecipeParams): Promise<ApiResponse<Recipe>> {
    try {
      const recipe = await this.recipeService.generateFusionRecipe(params.cuisines, params.criteria);
      return {
        success: true,
        data: recipe
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.generateFusionRecipe' },
          data: { service: 'RecipeFinder', method: 'generateFusionRecipe', cuisines: params.cuisines, criteria: params.criteria }
        }
      });
      return {
        success: false,
        data: undefined,
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
        }
      };
    }
  }
  
  /**
   * Adapt a recipe for the current season
   */
  async adaptRecipeForSeason(params: AdaptRecipeForSeasonParams): Promise<ApiResponse<Recipe>> {
    try {
      // Get the recipe first
      const recipeResponse = await this.getRecipeById({ id: params.recipeId });
      if (!recipeResponse.success || !recipeResponse.data) {
        return {
          success: false,
          data: undefined,
          error: {
            code: 'RECIPE_NOT_FOUND',
            message: 'Recipe not found for adaptation'
          }
        };
      }
      
      const adaptedRecipe = await this.recipeService.adaptRecipeForSeason(
        recipeResponse.data,
        params.season
      );
      return {
        success: true,
        data: adaptedRecipe
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.adaptRecipeForSeason' },
          data: { service: 'RecipeFinder', method: 'adaptRecipeForSeason', recipeId: params.recipeId, season: params.season }
        }
      });
      return {
        success: false,
        data: undefined,
        error: {
          code: 'PROCESSING_ERROR',
          message: errorObj.message
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
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.calculateElementalProperties' },
          data: { service: 'RecipeFinder', method: 'calculateElementalProperties', recipeId: recipe?.id || 'unknown' }
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
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.getDominantElement' },
          data: { service: 'RecipeFinder', method: 'getDominantElement', recipeId: recipe?.id || 'unknown' }
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
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.calculateSimilarity' },
          data: { service: 'RecipeFinder', method: 'calculateSimilarity', recipe1Id: recipe1?.id || 'unknown', recipe2Id: recipe2?.id || 'unknown' }
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
      const errorObj = error instanceof Error ? error : new Error(`Unknown error: ${String(error)}`);
      errorHandler.log(errorObj, {
        context: { 
          operation: { name: 'RecipeFinder.clearCache' },
          data: { service: 'RecipeFinder', method: 'clearCache' }
        }
      });
    }
  }
}

// Export standalone function for compatibility
export const getAllRecipes = async (): Promise<Recipe[]> => {
  const response = await RecipeFinder.getInstance().getAllRecipes();
  return response.data || [];
}; 