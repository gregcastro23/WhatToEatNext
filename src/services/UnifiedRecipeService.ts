/**
 * Unified Recipe Service
 * Provides a unified interface for recipe operations
 */

import type { Recipe } from '@/types/alchemy';
// Add missing imports for TS2304 fixes
import { errorHandler } from '@/services/errorHandler';
import type { ExtendedRecipe } from '@/types/ExtendedRecipe';
// Using local error handler implementation

export class UnifiedRecipeService {
  private static instance: UnifiedRecipeService;

  private constructor() {}

  public static getInstance(): UnifiedRecipeService {
    if (!UnifiedRecipeService.instance) {
      UnifiedRecipeService.instance = new UnifiedRecipeService();
    }
    return UnifiedRecipeService.instance;
  }

  /**
   * Get all recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      // Import actual recipe data
      const { allRecipes } = await import('@/data/recipes');
      return Object.values(allRecipes || {});
    } catch (error) {
      errorHandler.log(error, { context: 'UnifiedRecipeService.getAllRecipes' });
      return [];
    }
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const { allRecipes } = await import('@/data/recipes');
      const recipes = Object.values(allRecipes || {});
      return recipes.find(recipe => recipe.id === id) || null;
    } catch (error) {
      errorHandler.log(error, { context: 'UnifiedRecipeService.getRecipeById' });
      return null;
    }
  }

  /**
   * Search recipes
   */
  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      const { allRecipes } = await import('@/data/recipes');
      const recipes = Object.values(allRecipes || {});
      
      if (!query || query.trim() === '') {
        return recipes.slice(0, 20); // Return first 20 recipes if no query
      }
      
      const searchTerm = query.toLowerCase().trim();
      
      return recipes.filter(recipe => {
        // Search in recipe name
        if (recipe.name?.toLowerCase().includes(searchTerm)) return true;
        
        // Search in cuisine
        if (recipe.cuisine?.toLowerCase().includes(searchTerm)) return true;
        
        // Search in tags
        if (recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
        
        // Search in ingredients
        if (recipe.ingredients?.some(ingredient => 
          typeof ingredient === 'string' 
            ? ingredient.toLowerCase().includes(searchTerm)
            : ingredient.name?.toLowerCase().includes(searchTerm)
        )) return true;
        
        return false;
      }).slice(0, 50); // Return max 50 results
    } catch (error) {
      errorHandler.log(error, { context: 'UnifiedRecipeService.searchRecipes' });
      return [];
    }
  }
  /**
   * Get recipes for a specific cuisine (Phase 11 addition)
   */
  async getRecipesForCuisine(cuisine: string): Promise<ExtendedRecipe[]> {
    try {
      const allRecipes = await this.getAllRecipes();
      const filtered = (allRecipes || []).filter(recipe => {
        const recipeCuisine = recipe.cuisine && typeof recipe.cuisine === 'string' ? recipe.cuisine.toLowerCase() : recipe.cuisine;
        const targetCuisine = cuisine && typeof cuisine === 'string' ? cuisine.toLowerCase() : cuisine;
        return recipeCuisine === targetCuisine;
      });
      return filtered as unknown as ExtendedRecipe[];
    } catch (error) {
      // console.error('Error getting recipes for cuisine:', error);
      return [];
    }
  }

  /**
   * Get recipes by cuisine (alias for compatibility)
   */
  async getRecipesByCuisine(cuisine: string): Promise<ExtendedRecipe[]> {
    return this.getRecipesForCuisine(cuisine);
  }

  /**
   * Get best recipe matches (Phase 11 addition)
   */
  async getBestRecipeMatches(criteria: Record<string, unknown>): Promise<ExtendedRecipe[]> {
    try {
      const allRecipes = await this.getAllRecipes();
      // Simple implementation for now
      const matches = allRecipes?.slice(0, 10);
      return matches as unknown as ExtendedRecipe[];
    } catch (error) {
      // console.error('Error getting best recipe matches:', error);
      return [];
    }
  }

}

// Export singleton instance
export const unifiedRecipeService = UnifiedRecipeService.getInstance();

// Export default
export default unifiedRecipeService; 