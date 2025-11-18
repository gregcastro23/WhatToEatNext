/**
 * Unified Recipe Service
 * Provides a unified interface for recipe operations
 */

import { ErrorHandler } from "@/services/errorHandler";
import type { RecipeSearchCriteria } from "@/services/interfaces/RecipeServiceInterface";
import type { Recipe } from "@/types/alchemy";
// Add missing imports for TS2304 fixes
import type { ExtendedRecipe } from "@/types/ExtendedRecipe";
// Using local error handler implementation
import { allRecipes } from "@/data/recipes/index";
import { createLogger } from "@/utils/logger";

const logger = createLogger("UnifiedRecipeService");

export class UnifiedRecipeService {
  private static instance: UnifiedRecipeService;
  private recipesCache: Recipe[] | null = null;

  private constructor() {}

  public static getInstance(): UnifiedRecipeService {
    if (!UnifiedRecipeService.instance) {
      UnifiedRecipeService.instance = new UnifiedRecipeService();
    }
    return UnifiedRecipeService.instance;
  }

  /**
   * Get all recipes from the data layer
   */
  async getAllRecipes(): Promise<Recipe[]> {
    try {
      // Use cache if available
      if (this.recipesCache) {
        return this.recipesCache;
      }

      // Load recipes from data layer
      const recipes = allRecipes as unknown as Recipe[];

      // Cache for future requests
      this.recipesCache = recipes;

      logger.info(`Loaded ${recipes.length} recipes from data layer`);
      return recipes;
    } catch (error) {
      ErrorHandler.log(error, {
        context: "UnifiedRecipeService.getAllRecipes",
      });
      return [];
    }
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const recipes = await this.getAllRecipes();

      // Find recipe by id
      const recipe = recipes.find((r) => r.id === id);

      if (!recipe) {
        logger.warn(`Recipe not found with id: ${id}`);
        return null;
      }

      return recipe;
    } catch (error) {
      ErrorHandler.log(error, {
        context: `UnifiedRecipeService.getRecipeById (id: ${id})`,
      });
      return null;
    }
  }

  /**
   * Search recipes by name, description, cuisine, or ingredients
   */
  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      if (!query || query.trim().length === 0) {
        return this.getAllRecipes();
      }

      const recipes = await this.getAllRecipes();
      const searchTerm = query.toLowerCase().trim();

      // Search across multiple fields
      const matchedRecipes = recipes.filter((recipe) => {
        // Search in name
        if (recipe.name?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in description
        if (recipe.description?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in cuisine
        if (
          typeof recipe.cuisine === "string" &&
          recipe.cuisine.toLowerCase().includes(searchTerm)
        ) {
          return true;
        }

        // Search in ingredients
        if (Array.isArray(recipe.ingredients)) {
          const ingredientMatch = recipe.ingredients.some((ing: any) => {
            const ingName = typeof ing === "string" ? ing : ing.name;
            return ingName?.toLowerCase().includes(searchTerm);
          });
          if (ingredientMatch) {
            return true;
          }
        }

        // Search in tags
        if (Array.isArray(recipe.tags)) {
          const tagMatch = recipe.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm)
          );
          if (tagMatch) {
            return true;
          }
        }

        return false;
      });

      logger.info(
        `Search for "${query}" returned ${matchedRecipes.length} recipes`
      );
      return matchedRecipes;
    } catch (error) {
      ErrorHandler.log(error, {
        context: `UnifiedRecipeService.searchRecipes (query: ${query})`,
      });
      return [];
    }
  }
  /**
   * Get recipes for a specific cuisine (Phase 11 addition)
   */
  async getRecipesForCuisine(cuisine: string): Promise<ExtendedRecipe[]> {
    try {
      const allRecipes = await this.getAllRecipes();
      const filtered = (allRecipes || []).filter((recipe) => {
        const recipeCuisine =
          recipe.cuisine && typeof recipe.cuisine === "string"
            ? recipe.cuisine.toLowerCase()
            : recipe.cuisine;
        const targetCuisine =
          cuisine && typeof cuisine === "string"
            ? cuisine.toLowerCase()
            : cuisine;
        return recipeCuisine === targetCuisine;
      });
      return filtered as unknown as ExtendedRecipe[];
    } catch (error) {
      ErrorHandler.log(error, {
        context: "UnifiedRecipeService.getRecipesForCuisine",
      });
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
  async getBestRecipeMatches(
    criteria: RecipeSearchCriteria,
  ): Promise<ExtendedRecipe[]> {
    try {
      const allRecipes = await this.getAllRecipes();
      // Simple implementation for now
      const matches = allRecipes.slice(0, 10);
      return matches as unknown as ExtendedRecipe[];
    } catch (error) {
      ErrorHandler.log(error, {
        context: "UnifiedRecipeService.getBestRecipeMatches",
      });
      return [];
    }
  }
}

// Export singleton instance
export const unifiedRecipeService = UnifiedRecipeService.getInstance();

// Export default
export default unifiedRecipeService;
