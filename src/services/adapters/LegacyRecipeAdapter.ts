/**
 * LegacyRecipeAdapter.ts
 *
 * This adapter provides a bridge between legacy recipe-related services and the
 * modern UnifiedRecipeService. It allows components that still rely on the
 * legacy service methods to work with the new service architecture.
 *
 * The adapter implements legacy methods but delegates to modern services.
 */

// ← Pattern HH-2: Unified Recipe type imports from primary source (@/types/alchemy)
import type {
  Element,
  ElementalProperties,
  Season,
  ZodiacSign,
  LunarPhase,
  PlanetName,
} from "@/types/alchemy";
import type { Recipe } from "@/types/recipe";

// Import ScoredRecipe from correct location
import type { RecipeSearchCriteria, ScoredRecipe } from "@/types/recipe";

// Import recipe search criteria from recipe types if needed

import { createLogger } from "../../utils/logger";
import { LocalRecipeService } from "../LocalRecipeService";
import { unifiedRecipeService } from "../UnifiedRecipeService";
import type { RecipeRecommendationOptions } from "../interfaces/RecipeServiceInterface";

// Initialize logger
const logger = createLogger("LegacyRecipeAdapter");

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
    logger.info("LegacyRecipeAdapter initialized");
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
      logger.error("Error in getAllRecipes:", error);
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
    options: RecipeRecommendationOptions = {},
  ): Promise<Recipe[]> {
    try {
      // ✅ Pattern MM-1: Safe type conversion for search criteria
      const criteriaData = criteria as unknown as Record<string, unknown>;
      const searchQuery = String(
        criteriaData.query || JSON.stringify(criteria),
      );
      const recipes = await unifiedRecipeService.searchRecipes(searchQuery);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error("Error in searchRecipes:", error);
      // ✅ Pattern MM-1: Safe argument type conversion for string parameter
      const criteriaData = criteria as unknown as Record<string, unknown>;
      const queryValue = criteriaData.query;
      if (queryValue && typeof queryValue === "string") {
        const recipes = await LocalRecipeService.searchRecipes(queryValue);
        return recipes as unknown as Recipe[];
      } else if (criteria && typeof criteria === "object") {
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
      // ✅ Pattern MM-1: Safe string conversion for zodiac search
      const searchQuery = `zodiac:${String(zodiacSign || "")}`;
      const recipes = await unifiedRecipeService.searchRecipes(searchQuery);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error(`Error in getRecipesByZodiac for "${zodiacSign}":`, error);
      // Simple fallback - get all recipes and filter
      const allRecipes = await LocalRecipeService.getAllRecipes();
      const filtered = (allRecipes || []).filter((recipe) =>
        (recipe.astrologicalInfluences || []).some((influence) =>
          influence.toLowerCase().includes(zodiacSign.toLowerCase()),
        ),
      );
      return filtered as unknown as Recipe[];
    }
  }

  /**
   * Get recipes by season using modern service
   */
  public async getRecipesBySeason(season: Season): Promise<Recipe[]> {
    try {
      // ✅ Pattern MM-1: Safe type assertion for service access
      const serviceData = unifiedRecipeService as unknown as Record<
        string,
        unknown
      >;
      // ✅ Pattern GG-6: Safe method call with proper typing
      const methodCall = serviceData.getRecipesBySeason as
        | ((season: Season) => Promise<Recipe[]>)
        | undefined;
      if (methodCall) {
        const recipes = await methodCall(season);
        return recipes as unknown as Recipe[];
      }
      // ✅ Pattern MM-1: Safe string conversion for season search
      const searchQuery = `season:${String(season || "")}`;
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
  public async getRecipesByLunarPhase(
    lunarPhase: LunarPhase,
  ): Promise<Recipe[]> {
    try {
      // ✅ Pattern MM-1: Safe type assertion for service access (fixed type)
      const serviceData = unifiedRecipeService as unknown as Record<
        string,
        unknown
      >;
      // ✅ Pattern GG-6: Safe method call with proper typing
      const lunarMethod = serviceData.getRecipesByLunarPhase as
        | ((phase: LunarPhase) => Promise<Recipe[]>)
        | undefined;
      if (lunarMethod) {
        const recipes = await lunarMethod(lunarPhase);
        return recipes as unknown as Recipe[];
      }
      // ✅ Pattern MM-1: Safe string conversion for lunar search
      const searchQuery = `lunar:${String(lunarPhase || "").replace(" ", "-")}`;
      const recipes = await unifiedRecipeService.searchRecipes(searchQuery);
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error(
        `Error in getRecipesByLunarPhase for "${lunarPhase}":`,
        error,
      );
      // Simple fallback - get all recipes and filter
      const allRecipes = await LocalRecipeService.getAllRecipes();
      const filtered = (allRecipes || []).filter((recipe) =>
        (recipe.lunarPhaseInfluences || []).some((influence) =>
          influence
            .toLowerCase()
            .includes(lunarPhase.toLowerCase().replace(" ", "")),
        ),
      );
      return filtered as unknown as Recipe[];
    }
  }

  /**
   * Get recipes by meal type using modern service
   */
  public async getRecipesByMealType(mealType: string): Promise<Recipe[]> {
    try {
      // ✅ Pattern MM-1: Safe type assertion for service access
      const serviceData = unifiedRecipeService as unknown as Record<
        string,
        unknown
      >;
      // ✅ Pattern GG-6: Safe method call with proper typing
      const mealMethod = serviceData.getRecipesByMealType as
        | ((mealType: string) => Promise<Recipe[]>)
        | undefined;
      if (mealMethod) {
        const recipes = await mealMethod(mealType);
        return recipes as unknown as Recipe[];
      }
      // ✅ Pattern MM-1: Safe string conversion for meal search
      const searchQuery = `meal:${String(mealType || "")}`;
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
    limit = 10,
  ): Promise<ScoredRecipe[]> {
    try {
      // Add limit to criteria if needed
      const criteriaWithLimit = { ...criteria, maxResults: limit };
      const matches =
        await unifiedRecipeService.getBestRecipeMatches(criteriaWithLimit);
      return matches as unknown as ScoredRecipe[];
    } catch (error) {
      logger.error("Error in getBestRecipeMatches:", error);
      return [];
    }
  }

  /**
   * Generate recipe using modern service
   */
  public async generateRecipe(criteria: RecipeSearchCriteria): Promise<Recipe> {
    try {
      // ✅ Pattern MM-1: Safe type assertion for service access
      const serviceData = unifiedRecipeService as unknown as Record<
        string,
        unknown
      >;
      // ✅ Pattern GG-6: Safe method call with proper typing
      const generateMethod = serviceData.generateRecipe as
        | ((criteria: RecipeSearchCriteria) => Promise<Recipe>)
        | undefined;
      if (generateMethod) {
        return await generateMethod(criteria);
      }
      // ✅ Pattern MM-1: Safe type conversion for criteria search
      const criteriaData = criteria as unknown as Record<string, unknown>;
      const searchQuery = String(
        criteriaData.query || JSON.stringify(criteria),
      );
      const searchResults =
        await unifiedRecipeService.searchRecipes(searchQuery);
      if (searchResults.length > 0) {
        return searchResults[0];
      }
      throw new Error("No recipes found matching criteria");
    } catch (error) {
      logger.error("Error in generateRecipe:", error);
      throw new Error(
        `Recipe generation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Calculate elemental properties using modern service
   */
  public calculateElementalProperties(
    recipe: Partial<Recipe>,
  ): ElementalProperties {
    try {
      // ✅ Pattern MM-1: Safe type assertion for service access
      const serviceData = unifiedRecipeService as unknown as Record<
        string,
        unknown
      >;
      // ✅ Pattern GG-6: Safe method call with proper typing
      const calculateMethod = serviceData.calculateElementalProperties as
        | ((recipe: Partial<Recipe>) => ElementalProperties)
        | undefined;
      if (calculateMethod) {
        return calculateMethod(recipe);
      }
      // Enhanced fallback - calculate based on available recipe data
      const defaultProperties = {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };

      // Basic calculation based on recipe properties if available
      if (recipe.elementalState && typeof recipe.elementalState === "object") {
        // Ensure it has all required properties
        const state = recipe.elementalState as Record<string, unknown>;
        if (
          state.Fire !== undefined &&
          state.Water !== undefined &&
          state.Earth !== undefined &&
          state.Air !== undefined
        ) {
          return recipe.elementalState as ElementalProperties;
        }
      }

      return defaultProperties;
    } catch (error) {
      logger.error(
        `Error in calculateElementalProperties for "${recipe.name || "unknown"}":`,
        error,
      );
      // Default elemental properties as fallback
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
  }

  /**
   * Clear cache in modern service
   */
  public clearCache(): void {
    try {
      // ✅ Pattern MM-1: Safe type assertion for service access
      const serviceData = unifiedRecipeService as unknown as Record<
        string,
        unknown
      >;
      // ✅ Pattern GG-6: Safe method call with proper typing
      const clearMethod = serviceData.clearCache as (() => void) | undefined;
      if (clearMethod) {
        clearMethod();
      }
      logger.info("Recipe cache cleared (or not available)");
    } catch (error) {
      logger.error("Error in clearCache:", error);
    }
  }
}

// Export singleton instance

// Export default for compatibility with existing code

export default LegacyRecipeAdapter;
