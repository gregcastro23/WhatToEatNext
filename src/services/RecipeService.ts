import { cuisinesMap } from "@/data/cuisines";
import type {
  ElementalProperties,
  LunarPhase,
  ZodiacSign,
} from "@/types/alchemy";
import type { Cuisine } from "@/types/cuisine";
import type { Recipe, ScoredRecipe } from "@/types/recipe";
import { logger } from "@/utils/logger";

// Import recipe service interface
import type {
  RecipeRecommendationOptions,
  RecipeSearchCriteria,
  RecipeServiceInterface,
} from "./interfaces/RecipeServiceInterface";

// Extended cuisine interface for internal use
interface ExtendedCuisine extends Cuisine {
  dishes?: Record<string, unknown>[];
  [key: string]: unknown;
}

// Recipe search criteria interface
interface RecipeSearchCriteriaInternal extends RecipeSearchCriteria {
  elementalProperties?: ElementalProperties;
  zodiacSign?: ZodiacSign;
  lunarPhase?: LunarPhase;
  planetaryAlignment?: Record<string, { sign: string; degree: number }>;
}

/**
 * Consolidated Recipe Service
 *
 * A unified service for all recipe-related operations, combining functionality
 * from LocalRecipeService, UnifiedRecipeService, and other recipe services.
 *
 * This service provides:
 * - Recipe retrieval from local cuisine data
 * - Search and filtering capabilities
 * - Elemental and astrological compatibility matching
 * - Recipe recommendations based on various criteria
 */
export class RecipeService implements RecipeServiceInterface {
  private static instance: RecipeService;
  private static _allRecipes: Recipe[] | null = null;
  private recipeCache: Map<string, Recipe[]> = new Map();

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Private constructor
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RecipeService {
    if (!RecipeService.instance) {
      RecipeService.instance = new RecipeService();
    }
    return RecipeService.instance;
  }

  /**
   * Get all available recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    // Return cached recipes if available
    if (RecipeService._allRecipes) {
      return RecipeService._allRecipes;
    }

    try {
      const recipes: Recipe[] = [];

      // Get recipes from all available cuisines
      for (const cuisine of Object.values(cuisinesMap)) {
        if (cuisine) {
          const cuisineRecipes = await this.getRecipesFromCuisine(
            cuisine as ExtendedCuisine,
          );
          recipes.push(...cuisineRecipes);
        }
      }

      logger.debug(`Loaded ${recipes.length} total recipes`);

      // Cache the recipes for future use
      RecipeService._allRecipes = recipes;

      return recipes;
    } catch (error) {
      logger.error("Error getting all recipes:", error);
      return [];
    }
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      logger.debug("Getting recipe by ID:", id);

      const allRecipes = await this.getAllRecipes();
      const recipe = allRecipes.find((r) => r.id === id);

      if (recipe) {
        logger.debug("Found recipe:", recipe.name);
        return recipe;
      }

      logger.debug("Recipe not found with ID:", id);
      return null;
    } catch (error) {
      logger.error("Error getting recipe by ID:", error);
      return null;
    }
  }

  /**
   * Search recipes based on criteria
   */
  async searchRecipes(
    criteria: RecipeSearchCriteria,
    options: RecipeRecommendationOptions = {},
  ): Promise<Recipe[]> {
    try {
      logger.debug("Searching recipes with criteria:", criteria);

      const allRecipes = await this.getAllRecipes();
      let filteredRecipes = [...allRecipes];

      // Filter by cuisine
      if (criteria.cuisine) {
        filteredRecipes = filteredRecipes.filter((recipe) =>
          recipe.cuisine
            ?.toLowerCase()
            .includes(criteria.cuisine!.toLowerCase()),
        );
      }

      // Filter by max prep time
      if (criteria.maxPrepTime) {
        filteredRecipes = filteredRecipes.filter((recipe) => {
          const prepTime = this.parseTimeToMinutes(recipe.timeToMake);
          return prepTime <= criteria.maxPrepTime!;
        });
      }

      // Filter by dietary restrictions
      if (
        criteria.dietaryRestrictions &&
        criteria.dietaryRestrictions.length > 0
      ) {
        filteredRecipes = filteredRecipes.filter((recipe) => {
          return criteria.dietaryRestrictions!.every((restriction) => {
            switch (restriction.toLowerCase()) {
              case "vegetarian":
                return recipe.isVegetarian === true;
              case "vegan":
                return recipe.isVegan === true;
              case "gluten-free":
                return recipe.isGlutenFree === true;
              case "dairy-free":
                return recipe.isDairyFree === true;
              default:
                return true;
            }
          });
        });
      }

      // Apply limit
      if (criteria.limit && criteria.limit > 0) {
        filteredRecipes = filteredRecipes.slice(0, criteria.limit);
      }

      logger.debug(`Found ${filteredRecipes.length} recipes matching criteria`);
      return filteredRecipes;
    } catch (error) {
      logger.error("Error searching recipes:", error);
      return [];
    }
  }

  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(cuisineName: string): Promise<Recipe[]> {
    if (!cuisineName) {
      logger.warn("No cuisine name provided to getRecipesByCuisine");
      return [];
    }

    try {
      logger.debug(`Getting recipes for cuisine: ${cuisineName}`);

      // Normalize cuisine name for comparison
      const normalizedName = cuisineName.toLowerCase().trim();

      // Handle special cases
      if (normalizedName === "african" || normalizedName === "american") {
        return [];
      }

      // Find matching cuisine
      const cuisine = Object.values(cuisinesMap).find(
        (c: any) =>
          c?.name?.toLowerCase().includes(normalizedName) ||
          c?.key?.toLowerCase().includes(normalizedName),
      ) as ExtendedCuisine;

      if (!cuisine) {
        logger.debug(`No cuisine found for ${cuisineName}`);
        return [];
      }

      return await this.getRecipesFromCuisine(cuisine);
    } catch (error) {
      logger.error(`Error getting recipes for cuisine ${cuisineName}:`, error);
      return [];
    }
  }

  /**
   * Get recipes by zodiac sign
   */
  async getRecipesByZodiac(zodiacSign: ZodiacSign): Promise<Recipe[]> {
    try {
      logger.debug(`Getting recipes for zodiac sign: ${zodiacSign}`);

      const allRecipes = await this.getAllRecipes();

      return allRecipes.filter((recipe) => {
        const influences = recipe.astrologicalInfluences || [];
        return influences.some((influence: string) =>
          influence.toLowerCase().includes(zodiacSign.toLowerCase()),
        );
      });
    } catch (error) {
      logger.error(`Error getting recipes for zodiac ${zodiacSign}:`, error);
      return [];
    }
  }

  /**
   * Get recipes by lunar phase
   */
  async getRecipesByLunarPhase(lunarPhase: LunarPhase): Promise<Recipe[]> {
    try {
      logger.debug(`Getting recipes for lunar phase: ${lunarPhase}`);

      const allRecipes = await this.getAllRecipes();

      return allRecipes.filter((recipe) => {
        const influences = recipe.astrologicalInfluences || [];
        return influences.some((influence: string) =>
          influence.toLowerCase().includes(lunarPhase.toLowerCase()),
        );
      });
    } catch (error) {
      logger.error(
        `Error getting recipes for lunar phase ${lunarPhase}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Get recipes by season
   */
  async getRecipesBySeason(season: string): Promise<Recipe[]> {
    try {
      logger.debug(`Getting recipes for season: ${season}`);

      const allRecipes = await this.getAllRecipes();

      return allRecipes.filter((recipe) => {
        const recipeSeasons = recipe.season || [];
        return recipeSeasons.some((recipeSeason: string) =>
          recipeSeason.toLowerCase().includes(season.toLowerCase()),
        );
      });
    } catch (error) {
      logger.error(`Error getting recipes for season ${season}:`, error);
      return [];
    }
  }

  /**
   * Get recipes by planetary alignment
   */
  async getRecipesByPlanetaryAlignment(
    planetaryPositions: Record<string, { sign: string; degree: number }>,
  ): Promise<Recipe[]> {
    try {
      logger.debug(
        "Getting recipes for planetary alignment:",
        planetaryPositions,
      );

      // For now, return all recipes - full planetary matching would require
      // more complex alchemical calculations
      // TODO: Implement proper planetary recipe matching
      return await this.getAllRecipes();
    } catch (error) {
      logger.error("Error getting recipes for planetary alignment:", error);
      return [];
    }
  }

  /**
   * Get recipes by flavor profile
   */
  async getRecipesByFlavorProfile(
    flavorProfile: Record<string, number>,
  ): Promise<Recipe[]> {
    try {
      logger.debug("Getting recipes for flavor profile:", flavorProfile);

      // For now, return all recipes - full flavor profile matching would require
      // more complex flavor analysis
      // TODO: Implement proper flavor profile matching
      return await this.getAllRecipes();
    } catch (error) {
      logger.error("Error getting recipes for flavor profile:", error);
      return [];
    }
  }

  /**
   * Get best recipe matches based on criteria
   */
  async getBestRecipeMatches(
    criteria: RecipeSearchCriteriaInternal,
    options: RecipeRecommendationOptions = {},
  ): Promise<ScoredRecipe[]> {
    try {
      logger.debug("Getting best recipe matches with criteria:", criteria);

      const recipes = await this.searchRecipes(criteria, options);

      // For now, assign equal scores - full scoring would require
      // elemental compatibility calculations
      // TODO: Implement proper recipe scoring
      return recipes.map((recipe) => ({
        recipe,
        score: 0.8,
        matchReasons: ["Basic match"],
      }));
    } catch (error) {
      logger.error("Error getting best recipe matches:", error);
      return [];
    }
  }

  /**
   * Get recipes from a specific cuisine object
   */
  private async getRecipesFromCuisine(
    cuisine: ExtendedCuisine,
  ): Promise<Recipe[]> {
    try {
      const recipes: Recipe[] = [];
      const dishes = cuisine.dishes || [];

      for (const dish of dishes) {
        const recipe = await this.convertDishToRecipe(
          dish as Record<string, unknown>,
          cuisine,
        );
        if (recipe) {
          recipes.push(recipe);
        }
      }

      return recipes;
    } catch (error) {
      logger.error("Error getting recipes from cuisine:", error);
      return [];
    }
  }

  /**
   * Convert dish data to Recipe format
   */
  private async convertDishToRecipe(
    dish: Record<string, unknown>,
    cuisine: ExtendedCuisine,
  ): Promise<Recipe | null> {
    try {
      // Generate unique ID
      const dishName = String(dish.name || "Unknown Dish");
      const cuisineName = String(cuisine.name || "Unknown Cuisine");
      const id = `${cuisineName.toLowerCase().replace(/\s+/g, "-")}-${dishName.toLowerCase().replace(/\s+/g, "-")}`;

      // Convert ingredients
      const ingredients = Array.isArray(dish.ingredients)
        ? dish.ingredients.map((ing: any) => ({
            name: String(ing.name || ""),
            amount: typeof ing.amount === "number" ? ing.amount : 1,
            unit: String(ing.unit || "unit"),
            optional: Boolean(ing.optional),
            preparation: String(ing.preparation || ""),
            category: String(ing.category || ""),
          }))
        : [];

      // Convert instructions
      const instructions = Array.isArray(dish.instructions)
        ? dish.instructions.map((inst: any) => String(inst))
        : Array.isArray(dish.preparationSteps)
          ? dish.preparationSteps.map((step: any) => String(step))
          : [String(dish.instructions || dish.preparationSteps || "")];

      // Parse time
      const timeToMake = this.parseTime(
        String(dish.timeToMake || dish.prepTime || "30 minutes"),
      );
      const cookTime = this.parseTime(String(dish.cookTime || "0 minutes"));

      // Parse servings
      const numberOfServings =
        typeof dish.numberOfServings === "number"
          ? dish.numberOfServings
          : typeof dish.servings === "number"
            ? dish.servings
            : typeof dish.servingSize === "number"
              ? dish.servingSize
              : 2;

      // Elemental properties
      const elementalProperties =
        (dish.elementalProperties as ElementalProperties) ||
          (dish.elementalState as ElementalProperties) || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25,
          };

      const recipe: Recipe = {
        id,
        name: dishName,
        description: String(dish.description || ""),
        ingredients,
        instructions,
        timeToMake,
        cookTime,
        numberOfServings,
        elementalProperties,
        season: Array.isArray(dish.season)
          ? dish.season.map((s: any) => String(s))
          : ["all"],
        mealType: Array.isArray(dish.mealType)
          ? dish.mealType.map((m: any) => String(m))
          : ["dinner"],
        cuisine: cuisineName,
        isVegetarian: Boolean(dish.isVegetarian),
        isVegan: Boolean(dish.isVegan),
        isGlutenFree: Boolean(dish.isGlutenFree),
        isDairyFree: Boolean(dish.isDairyFree),
        astrologicalInfluences: Array.isArray(dish.astrologicalInfluences)
          ? dish.astrologicalInfluences.map((inf: any) => String(inf))
          : [],
      };

      return recipe;
    } catch (error) {
      logger.error("Error converting dish to recipe:", error);
      return null;
    }
  }

  /**
   * Parse time string to minutes
   */
  private parseTimeToMinutes(timeString: string): number {
    if (!timeString) return 30;

    const lower = timeString.toLowerCase();

    // Handle "X minutes" format
    const minutesMatch = lower.match(/(\d+)\s*minutes?/);
    if (minutesMatch) {
      return parseInt(minutesMatch[1], 10);
    }

    // Handle "X hours" format
    const hoursMatch = lower.match(/(\d+)\s*hours?/);
    if (hoursMatch) {
      return parseInt(hoursMatch[1], 10) * 60;
    }

    // Handle "X-X minutes" range
    const rangeMatch = lower.match(/(\d+)-(\d+)\s*minutes?/);
    if (rangeMatch) {
      return (parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2;
    }

    // Default
    return 30;
  }

  /**
   * Parse time for display
   */
  private parseTime(timeString: string): string {
    if (!timeString || timeString === "undefined") return "30 minutes";
    return timeString;
  }
}

// Export singleton instance
export const recipeService = RecipeService.getInstance();
