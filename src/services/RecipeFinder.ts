import type { Recipe } from '@/types/recipe';
import type { ElementalProperties } from '@/types/alchemy';

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
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      return await this.recipeService.getAllRecipes();
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
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
      return await this.recipeService.searchRecipes(criteria, options);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'searchRecipes',
        data: criteria,
      });
      return [];
    }
  }
  
  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(cuisine: string): Promise<Recipe[]> {
    try {
      return await this.recipeService.getRecipesByCuisine(cuisine);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getRecipesByCuisine',
        data: cuisine,
      });
      return [];
    }
  }
  
  /**
   * Get recipes by zodiac sign
   */
  async getRecipesByZodiac(currentZodiacSign: ZodiacSign): Promise<Recipe[]> {
    try {
      return await this.recipeService.getRecipesByZodiac(currentZodiacSign);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getRecipesByZodiac',
        data: currentZodiacSign,
      });
      return [];
    }
  }
  
  /**
   * Get recipes by season
   */
  async getRecipesBySeason(season: Season): Promise<Recipe[]> {
    try {
      return await this.recipeService.getRecipesBySeason(season);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getRecipesBySeason',
        data: season,
      });
      return [];
    }
  }
  
  /**
   * Get recipes by lunar phase
   */
  async getRecipesByLunarPhase(lunarPhase: LunarPhase): Promise<Recipe[]> {
    try {
      return await this.recipeService.getRecipesByLunarPhase(lunarPhase);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getRecipesByLunarPhase',
        data: lunarPhase,
      });
      return [];
    }
  }
  
  /**
   * Get recipes by meal type
   */
  async getRecipesByMealType(mealType: string): Promise<Recipe[]> {
    try {
      return await this.recipeService.getRecipesByMealType(mealType);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getRecipesByMealType',
        data: mealType,
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
      return await this.recipeService.getRecipesForPlanetaryAlignment(
        planetaryInfluences,
        minMatchScore
      );
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getRecipesForPlanetaryAlignment',
        data: { planetaryInfluences, minMatchScore }
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
      return await this.recipeService.getRecipesForFlavorProfile(
        flavorProfile,
        minMatchScore
      );
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getRecipesForFlavorProfile',
        data: { flavorProfile, minMatchScore }
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
    }
  ): Promise<Recipe[]> {
    try {
      return await this.recipeService.getBestRecipeMatches(criteria, criteria.maxResults || 10);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getBestRecipeMatches',
        data: { criteria }
      });
      return [];
    }
  }
  
  /**
   * Generate a recipe based on criteria
   */
  async generateRecipe(criteria: RecipeSearchCriteria): Promise<Recipe> {
    try {
      return await this.recipeService.generateRecipe(criteria);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'generateRecipe',
        data: criteria,
      });
      // Return an empty recipe on error
      return {
        id: 'error',
        name: 'Error generating recipe',
        ingredients: [],
        instructions: [],
        cuisine: 'Unknown',
        elementalProperties: { Fire: 0, Water: 0, Earth: 0, Air: 0 }
      };
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
      return await this.recipeService.generateFusionRecipe(cuisines, criteria);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'generateFusionRecipe',
        data: { cuisines, criteria }
      });
      // Return an empty recipe on error
      return {
        id: 'error',
        name: 'Error generating fusion recipe',
        ingredients: [],
        instructions: [],
        cuisine: cuisines?.join('-'),
        elementalProperties: { Fire: 0, Water: 0, Earth: 0, Air: 0 }
      };
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
      return await this.recipeService.adaptRecipeForSeason(recipe, season);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'adaptRecipeForSeason',
        data: { recipeId: recipe?.id || 'unknown', season }
      });
      // Return the original recipe on error
      return recipe;
    }
  }
  
  /**
   * Calculate the elemental properties of a recipe
   */
  calculateElementalProperties(recipe: Partial<Recipe>): ElementalProperties {
    try {
      return this.recipeService.calculateElementalProperties(recipe);
    } catch (error) {
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'calculateElementalProperties',
        data: { recipeId: recipe?.id || 'unknown' }
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
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'getDominantElement',
        data: { recipeId: recipe?.id || 'unknown' }
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
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'calculateSimilarity',
        data: { recipe1Id: recipe1?.id || 'unknown', recipe2Id: recipe2?.id || 'unknown' }
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
      errorHandler.log(error, {
        context: 'RecipeFinder',
        action: 'clearCache',
      });
    }
  }
}

// Export standalone function for compatibility
export const getAllRecipes = async (): Promise<Recipe[]> => {
  return await RecipeFinder.getInstance().getAllRecipes();
}; 