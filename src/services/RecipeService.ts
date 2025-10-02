/**
 * Recipe Service - Database Integration
 * Phase 3 Frontend Integration
 *
 * Service for recipe operations using PostgreSQL database
 */

import { RecipeService as DatabaseRecipeService } from '@/lib/database';
import type { ElementalProperties } from '@/types/alchemy';
import type { Recipe, ScoredRecipe } from '@/types/recipe';
import { logger } from '@/utils/logger';

export interface RecipeSearchCriteria {
  cuisine?: string,
  maxPrepTime?: number,
  dietaryRestrictions?: string[],
  limit?: number;
}

export interface RecipeRecommendation {
  recipe: Recipe,
  score: number,
  matchReasons: string[];
}

/**
 * Recipe Service using database queries
 */
export class RecipeService {
  private static instance: RecipeService,

  private constructor() {}

  public static getInstance(): RecipeService {
    if (!RecipeService.instance) {
      RecipeService.instance = new RecipeService();
    }
    return RecipeService.instance;
  }

  /**
   * Get recipe by ID from database
   */
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      logger.debug('Getting recipe by ID from database:', id);
      const recipe = await DatabaseRecipeService.getById(id);

      if (!recipe) {
        return null;
      }

      // Convert database format to application format
      return this.convertDatabaseRecipeToAppFormat(recipe);
    } catch (error) {
      logger.error('Failed to get recipe by ID:', error);
      return null;
    }
  }

  /**
   * Search recipes by criteria
   */
  async searchRecipes(criteria: RecipeSearchCriteria): Promise<ScoredRecipe[]> {
    try {
      logger.debug('Searching recipes with criteria:', criteria);

      const searchCriteria = {
        cuisine: criteria.cuisine,
        limit: criteria.limit || 20
      };

      const results = await DatabaseRecipeService.searchRecipes(
        criteria.cuisine || '',
        { limit: criteria.limit || 20 }
      );

      return results.data.map(result => ({
        recipe: this.convertDatabaseRecipeToAppFormat(result),
        score: 0.8, // Default score for now
        matchReasons: ['Database match']
      }));
    } catch (error) {
      logger.error('Failed to search recipes:', error);
      return [];
    }
  }

  /**
   * Get recipe recommendations based on elemental properties
   */
  async getRecipeRecommendations(
    elementalState: ElementalProperties,
    options: RecipeSearchCriteria = {}
  ): Promise<RecipeRecommendation[]> {
    try {
      logger.debug('Getting recipe recommendations for elemental state:', elementalState);

      // For now, return general recommendations
      // In Phase 4, this will use actual elemental matching
      const results = await DatabaseRecipeService.searchRecipes('', {
        limit: options.limit || 10
      });

      return results.data.map(result => ({
        recipe: this.convertDatabaseRecipeToAppFormat(result),
        score: 0.7,
        matchReasons: ['General recommendation']
      }));
    } catch (error) {
      logger.error('Failed to get recipe recommendations:', error);
      return [];
    }
  }

  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(cuisine: string, limit: number = 20): Promise<Recipe[]> {
    try {
      logger.debug('Getting recipes by cuisine:', cuisine);

      const results = await DatabaseRecipeService.getByCuisine(cuisine, { limit });
      return results.data.map(recipe => this.convertDatabaseRecipeToAppFormat(recipe));
    } catch (error) {
      logger.error('Failed to get recipes by cuisine:', error);
      return [];
    }
  }

  /**
   * Convert database recipe format to application format
   */
  private convertDatabaseRecipeToAppFormat(dbRecipe: any): Recipe {
    return {
      id: dbRecipe.id,
      name: dbRecipe.name,
      description: dbRecipe.description,
      cuisine: dbRecipe.cuisine,
      category: dbRecipe.category,
      instructions: Array.isArray(dbRecipe.instructions)
        ? dbRecipe.instructions
        : [dbRecipe.instructions || 'No instructions available'],
      prepTime: dbRecipe.prep_time_minutes || 30,
      cookTime: dbRecipe.cook_time_minutes || 30,
      servings: dbRecipe.servings || 4,
      difficulty: dbRecipe.difficulty_level || 2,
      dietaryTags: dbRecipe.dietary_tags || [],
      allergens: dbRecipe.allergens || [],
      nutritionalProfile: dbRecipe.nutritional_profile || {},
      popularityScore: dbRecipe.popularity_score || 0.5,
      alchemicalHarmonyScore: dbRecipe.alchemical_harmony_score || 0.5,
      culturalAuthenticityScore: dbRecipe.cultural_authenticity_score || 0.5,
      userRating: dbRecipe.user_rating || 0.0,
      ratingCount: dbRecipe.rating_count || 0,
      authorId: dbRecipe.author_id,
      source: dbRecipe.source,
      isPublic: dbRecipe.is_public !== false,
      isVerified: dbRecipe.is_verified || false,
      ingredients: [], // Will be populated separately if needed
      createdAt: new Date(dbRecipe.created_at),
      updatedAt: new Date(dbRecipe.updated_at)
    };
  }

  /**
   * Get recipe ingredients with full details
   */
  async getRecipeIngredients(recipeId: string): Promise<any[]> {
    try {
      const ingredients = await DatabaseRecipeService.getRecipeIngredients(recipeId);
      return ingredients;
    } catch (error) {
      logger.error('Failed to get recipe ingredients:', error);
      return [];
    }
  }

  /**
   * Get recipe contexts (seasonal, lunar, etc.)
   */
  async getRecipeContexts(recipeId: string): Promise<any> {
    try {
      const contexts = await DatabaseRecipeService.getRecipeContexts(recipeId);
      return contexts;
    } catch (error) {
      logger.error('Failed to get recipe contexts:', error);
      return null;
    }
  }
}

// Export singleton instance
export const recipeService = RecipeService.getInstance();
