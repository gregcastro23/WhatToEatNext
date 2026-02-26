import type { ThermodynamicMetrics } from "@/types/alchemical";
import type { ElementalProperties } from "@/types/alchemy";
import type { Ingredient } from "@/types/ingredient";
import type { Recipe } from "@/types/recipe";
import { logger } from "@/utils/logger";

// Import recommendation criteria and result interfaces
import { RecipeService } from "./RecipeService";
import type {
  CookingMethodRecommendationCriteria,
  CuisineRecommendationCriteria,
  IngredientRecommendationCriteria,
  RecipeRecommendationCriteria,
  RecommendationResult,
  RecommendationServiceInterface,
} from "./interfaces/RecommendationServiceInterface";

// Import data services

/**
 * Consolidated Recommendation Service
 *
 * A unified service that provides all recommendation functionality
 * based on astrological and elemental harmony principles.
 *
 * This service implements the RecommendationServiceInterface and provides:
 * - Recipe recommendations based on elemental compatibility
 * - Ingredient recommendations for elemental balance
 * - Cuisine recommendations based on planetary alignment
 * - Cooking method recommendations based on elemental properties
 */
export class RecommendationService implements RecommendationServiceInterface {
  private static instance: RecommendationService;
  private recipeService: RecipeService;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.recipeService = RecipeService.getInstance();
  }

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Get recommended recipes based on criteria
   */
  async getRecommendedRecipes(
    criteria: RecipeRecommendationCriteria,
  ): Promise<RecommendationResult<Recipe>> {
    try {
      logger.info("Getting recommended recipes with criteria:", criteria);

      // Get all recipes from the recipe service
      const allRecipes = await this.recipeService.getAllRecipes();

      if (!allRecipes || allRecipes.length === 0) {
        logger.warn("No recipes available for recommendations");
        return {
          items: [],
          scores: {},
          context: { criteria, totalRecipes: 0, filteredCount: 0 },
        };
      }

      let filteredRecipes = [...allRecipes];

      // Filter by elemental properties compatibility
      if (criteria.elementalProperties) {
        filteredRecipes = filteredRecipes.filter((recipe) => {
          if (!recipe.elementalProperties) return false;

          const compatibility = this.calculateElementalCompatibility(
            criteria.elementalProperties!,
            recipe.elementalProperties,
          );
          return compatibility >= (criteria.minCompatibility || 0.3);
        });
      }

      // Filter by planetary positions if provided
      if (criteria.planetaryPositions) {
        // For now, use elemental properties as proxy for planetary influence
        // TODO: Implement direct planetary compatibility calculation
        filteredRecipes = filteredRecipes.filter((recipe) => {
          return recipe.elementalProperties !== undefined;
        });
      }

      // Filter by cooking method
      if (criteria.cookingMethod) {
        const targetMethod = criteria.cookingMethod.toLowerCase();
        filteredRecipes = filteredRecipes.filter((recipe) => {
          const methods = recipe.cookingMethod;
          if (!methods) return false;
          if (Array.isArray(methods)) {
            return methods.some((m: string) => m.toLowerCase() === targetMethod);
          }
          return String(methods).toLowerCase() === targetMethod;
        });
      }

      // Filter by cuisine
      if (criteria.cuisine) {
        const targetCuisine = criteria.cuisine.toLowerCase();
        filteredRecipes = filteredRecipes.filter(
          (recipe) =>
            recipe.cuisine?.toLowerCase() === targetCuisine,
        );
      }

      // Filter by included ingredients
      if (
        criteria.includeIngredients &&
        criteria.includeIngredients.length > 0
      ) {
        filteredRecipes = filteredRecipes.filter((recipe) => {
          const recipeIngredients = recipe.ingredients || [];
          return criteria.includeIngredients!.every((ingredient) =>
            recipeIngredients.some((recipeIngredient: any) =>
              String(recipeIngredient.name || "")
                .toLowerCase()
                .includes(String(ingredient || "").toLowerCase()),
            ),
          );
        });
      }

      // Filter by excluded ingredients
      if (
        criteria.excludeIngredients &&
        criteria.excludeIngredients.length > 0
      ) {
        filteredRecipes = filteredRecipes.filter((recipe) => {
          const recipeIngredients = recipe.ingredients || [];
          return !criteria.excludeIngredients!.some((ingredient) =>
            recipeIngredients.some((recipeIngredient: any) =>
              String(recipeIngredient.name || "")
                .toLowerCase()
                .includes(String(ingredient || "").toLowerCase()),
            ),
          );
        });
      }

      // Calculate scores for each recipe
      const scores: { [key: string]: number } = {};
      const elementalState = criteria.elementalProperties;

      filteredRecipes.forEach((recipe) => {
        if (recipe.elementalProperties && elementalState) {
          scores[recipe.id] = this.calculateElementalCompatibility(
            elementalState,
            recipe.elementalProperties,
          );
        } else {
          scores[recipe.id] = 0.5; // Default score if we can't calculate compatibility
        }
      });

      // Sort recipes by score (highest first)
      filteredRecipes.sort((a, b) => scores[b.id] - scores[a.id]);

      // Apply limit if specified
      if (criteria.limit && criteria.limit > 0) {
        filteredRecipes = filteredRecipes.slice(0, criteria.limit);
      }

      logger.info(`Returning ${filteredRecipes.length} recommended recipes`);

      return {
        items: filteredRecipes,
        scores,
        context: {
          criteria,
          totalRecipes: allRecipes.length,
          filteredCount: filteredRecipes.length,
        },
      };
    } catch (error) {
      logger.error("Error getting recommended recipes:", error);
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Get recommended ingredients based on criteria
   */
  async getRecommendedIngredients(
    criteria: IngredientRecommendationCriteria,
  ): Promise<RecommendationResult<Ingredient>> {
    try {
      logger.info("Getting recommended ingredients with criteria:", criteria);

      // Get all ingredients
      const allIngredients: Ingredient[] = []; // ingredientService.getAllIngredientsFlat();

      if (!allIngredients || allIngredients.length === 0) {
        logger.warn("No ingredients available for recommendations");
        return {
          items: [],
          scores: {},
          context: { criteria, totalIngredients: 0, filteredCount: 0 },
        };
      }

      // Score ingredients based on criteria
      const scoredIngredients = allIngredients.map((ingredient) => {
        let score = 0;

        // Calculate elemental compatibility if criteria includes elemental properties
        if (criteria.elementalProperties && ingredient.elementalProperties) {
          const elementalScore = this.calculateElementalCompatibility(
            criteria.elementalProperties,
            ingredient.elementalProperties,
          );
          score += elementalScore * 0.7; // Elemental compatibility is weighted heavily
        }

        // Check for category match
        if (criteria.categories && criteria.categories.length > 0) {
          const categoryMatch = criteria.categories.some((cat) =>
            ingredient.category?.toLowerCase().includes(cat.toLowerCase()),
          );
          score += categoryMatch ? 0.2 : 0;
        }

        // Check for exclusion
        if (
          criteria.excludeIngredients &&
          criteria.excludeIngredients.length > 0
        ) {
          const excluded = criteria.excludeIngredients.some((excludedItem) =>
            ingredient.name?.toLowerCase().includes(excludedItem.toLowerCase()),
          );
          if (excluded) {
            score = 0; // Automatic disqualification
          }
        }

        // Check for planetary ruler match (simplified)
        if (criteria.planetaryRuler && ingredient.planetaryRuler) {
          const rulerMatch =
            ingredient.planetaryRuler === criteria.planetaryRuler;
          score += rulerMatch ? 0.1 : 0;
        }

        // Check for season match
        if (criteria.season && ingredient.season) {
          const seasonMatch = Array.isArray(ingredient.season)
            ? ingredient.season.includes(criteria.season)
            : ingredient.season === criteria.season;
          score += seasonMatch ? 0.1 : 0;
        }

        return {
          ingredient,
          score,
        };
      });

      // Filter by minimum compatibility score
      const minScore = criteria.minCompatibility || 0.3;
      const filteredIngredients = scoredIngredients.filter(
        (item) => item.score >= minScore,
      );

      // Sort by score (highest first)
      filteredIngredients.sort((a, b) => b.score - a.score);

      // Apply limit if specified
      const limit = criteria.limit || 10;
      const limitedIngredients = filteredIngredients.slice(0, limit);

      // Build scores record
      const scores: { [key: string]: number } = {};
      limitedIngredients.forEach((item) => {
        scores[item.ingredient.id || item.ingredient.name] = item.score;
      });

      logger.info(
        `Returning ${limitedIngredients.length} recommended ingredients`,
      );

      return {
        items: limitedIngredients.map((item) => item.ingredient),
        scores,
        context: {
          criteria,
          totalIngredients: allIngredients.length,
          filteredCount: limitedIngredients.length,
        },
      };
    } catch (error) {
      logger.error("Error getting recommended ingredients:", error);
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Get recommended cuisines based on criteria
   */
  async getRecommendedCuisines(
    criteria: CuisineRecommendationCriteria,
  ): Promise<RecommendationResult<string>> {
    try {
      logger.info("Getting recommended cuisines with criteria:", criteria);

      // For now, return some default cuisines based on elemental properties
      // TODO: Implement full cuisine recommendation logic
      const defaultCuisines = [
        "Italian",
        "Mexican",
        "Indian",
        "Japanese",
        "Mediterranean",
        "Thai",
        "French",
        "Chinese",
        "Greek",
        "Middle-Eastern",
      ];

      let filteredCuisines = [...defaultCuisines];
      const scores: { [key: string]: number } = {};

      // Apply elemental filtering (simplified)
      if (criteria.elementalProperties) {
        // For now, assign random-ish scores based on elemental properties
        // TODO: Implement proper cuisine-elemental mapping
        filteredCuisines.forEach((cuisine) => {
          scores[cuisine] = Math.random() * 0.5 + 0.5; // Random score between 0.5-1.0
        });

        // Sort by score
        filteredCuisines.sort((a, b) => scores[b] - scores[a]);
      } else {
        // Default scores
        filteredCuisines.forEach((cuisine) => {
          scores[cuisine] = 0.8;
        });
      }

      // Apply exclusions
      if (criteria.excludeCuisines && criteria.excludeCuisines.length > 0) {
        filteredCuisines = filteredCuisines.filter(
          (cuisine) =>
            !criteria.excludeCuisines!.some((excluded) =>
              cuisine.toLowerCase().includes(excluded.toLowerCase()),
            ),
        );
      }

      // Apply limit
      if (criteria.limit && criteria.limit > 0) {
        filteredCuisines = filteredCuisines.slice(0, criteria.limit);
      }

      logger.info(`Returning ${filteredCuisines.length} recommended cuisines`);

      return {
        items: filteredCuisines,
        scores,
        context: {
          criteria,
          totalCuisines: defaultCuisines.length,
          filteredCount: filteredCuisines.length,
        },
      };
    } catch (error) {
      logger.error("Error getting recommended cuisines:", error);
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Get recommended cooking methods based on criteria
   */
  async getRecommendedCookingMethods(
    criteria: CookingMethodRecommendationCriteria,
  ): Promise<RecommendationResult<string>> {
    try {
      logger.info(
        "Getting recommended cooking methods with criteria:",
        criteria,
      );

      const defaultMethods: string[] = [
        "Grilling",
        "Baking",
        "Stir-frying",
        "Steaming",
        "Roasting",
        "Braising",
        "Sautéing",
        "Boiling",
        "Frying",
        "Slow-cooking",
      ];

      let filteredMethods = [...defaultMethods];
      const scores: { [key: string]: number } = {};

      // Apply elemental filtering (simplified)
      if (criteria.elementalProperties) {
        filteredMethods.forEach((method) => {
          scores[method] = Math.random() * 0.5 + 0.5;
        });

        // Sort by score
        filteredMethods.sort((a, b) => scores[b] - scores[a]);
      } else {
        // Default scores
        filteredMethods.forEach((method) => {
          scores[method] = 0.8;
        });
      }

      // Apply exclusions
      if (criteria.excludeMethods && criteria.excludeMethods.length > 0) {
        filteredMethods = filteredMethods.filter(
          (method) =>
            !criteria.excludeMethods!.some((excluded) =>
              method.toLowerCase().includes(excluded.toLowerCase()),
            ),
        );
      }

      // Apply limit
      if (criteria.limit && criteria.limit > 0) {
        filteredMethods = filteredMethods.slice(0, criteria.limit);
      }

      logger.info(
        `Returning ${filteredMethods.length} recommended cooking methods`,
      );

      return {
        items: filteredMethods,
        scores,
        context: {
          criteria,
          totalMethods: defaultMethods.length,
          filteredCount: filteredMethods.length,
        },
      };
    } catch (error) {
      logger.error("Error getting recommended cooking methods:", error);
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Calculate compatibility score between elemental properties
   */
  calculateElementalCompatibility(
    source: ElementalProperties,
    target: ElementalProperties,
  ): number {
    // Simple compatibility calculation based on elemental balance
    // Elements work best when they complement each other, not oppose
    const elements = ["Fire", "Water", "Earth", "Air"] as const;

    let totalCompatibility = 0;
    let elementCount = 0;

    for (const element of elements) {
      const sourceValue = source[element] || 0;
      const targetValue = target[element] || 0;

      if (sourceValue > 0 && targetValue > 0) {
        // Same element reinforcement (like strengthens like)
        totalCompatibility += Math.min(sourceValue, targetValue);
        elementCount++;
      }
    }

    // Return average compatibility or minimum score
    return elementCount > 0 ? totalCompatibility / elementCount : 0.5;
  }

  /**
   * Get recommendations based on elemental properties
   */
  async getRecommendationsForElements(
    elementalProperties: ElementalProperties,
    type: "recipe" | "ingredient" | "cuisine" | "cookingMethod",
    limit?: number,
  ): Promise<RecommendationResult<unknown>> {
    try {
      logger.info(
        `Getting ${type} recommendations for elemental properties:`,
        elementalProperties,
      );

      switch (type) {
        case "recipe":
          return await this.getRecommendedRecipes({
            elementalProperties,
            limit,
          });

        case "ingredient":
          return await this.getRecommendedIngredients({
            elementalProperties,
            limit,
          });

        case "cuisine":
          return await this.getRecommendedCuisines({
            elementalProperties,
            limit,
          });

        case "cookingMethod":
          return await this.getRecommendedCookingMethods({
            elementalProperties,
            limit,
          });

        default:
          throw new Error(`Unknown recommendation type: ${type}`);
      }
    } catch (error) {
      logger.error(
        `Error getting ${type} recommendations for elements:`,
        error,
      );
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Get recommendations based on planetary alignment
   */
  async getRecommendationsForPlanetaryAlignment(
    planetaryPositions: Record<string, { sign: string; degree: number }>,
    type: "recipe" | "ingredient" | "cuisine" | "cookingMethod",
    limit?: number,
  ): Promise<RecommendationResult<unknown>> {
    try {
      logger.info(
        `Getting ${type} recommendations for planetary alignment:`,
        planetaryPositions,
      );

      // For now, convert planetary positions to elemental properties
      // TODO: Implement direct planetary compatibility calculation
      const elementalProperties =
        this.planetaryPositionsToElemental(planetaryPositions);

      return await this.getRecommendationsForElements(
        elementalProperties,
        type,
        limit,
      );
    } catch (error) {
      logger.error(
        `Error getting ${type} recommendations for planetary alignment:`,
        error,
      );
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Calculate thermodynamic metrics based on elemental properties
   */
  calculateThermodynamics(
    elementalProperties: ElementalProperties,
  ): ThermodynamicMetrics {
    // Simplified thermodynamic calculation
    // In a full implementation, this would use the alchemizer engine
    const { Fire = 0, Water = 0, Earth = 0, Air = 0 } = elementalProperties;

    // Heat: Fire + Air (active elements)
    const heat = (Fire + Air) / 2;

    // Entropy: Air + Fire (chaotic elements)
    const entropy = (Air + Fire) / 2;

    // Reactivity: Fire + Water (opposing elements create reactivity)
    const reactivity = Math.abs(Fire - Water) / 2;

    // Greg's Energy: Balance between heat and entropy
    const gregsEnergy = heat - entropy * reactivity;

    return {
      heat,
      entropy,
      reactivity,
      gregsEnergy,
      kalchm: 0, // Placeholder
      monica: 0, // Placeholder
    };
  }

  /**
   * Convert planetary positions to elemental properties (simplified)
   */
  private planetaryPositionsToElemental(
    positions: Record<string, { sign: string; degree: number }>,
  ): ElementalProperties {
    // Simplified conversion - in reality this would use the planetary alchemy mapping
    const elements: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0,
    };

    // Count planets in each element's signs
    const elementSigns = {
      Fire: ["aries", "leo", "sagittarius"],
      Water: ["cancer", "scorpio", "pisces"],
      Earth: ["taurus", "virgo", "capricorn"],
      Air: ["gemini", "libra", "aquarius"],
    };

    let totalPlanets = 0;

    Object.values(positions).forEach((position) => {
      const sign = position.sign.toLowerCase();
      totalPlanets++;

      for (const [element, signs] of Object.entries(elementSigns)) {
        if (signs.includes(sign)) {
          elements[element as keyof ElementalProperties] += 1;
        }
      }
    });

    // Normalize to sum to 1
    if (totalPlanets > 0) {
      Object.keys(elements).forEach((key) => {
        elements[key as keyof ElementalProperties] /= totalPlanets;
      });
    } else {
      // Default balanced distribution
      Object.keys(elements).forEach((key) => {
        elements[key as keyof ElementalProperties] = 0.25;
      });
    }

    return elements;
  }
}

// Export singleton instance
export const recommendationService = RecommendationService.getInstance();
