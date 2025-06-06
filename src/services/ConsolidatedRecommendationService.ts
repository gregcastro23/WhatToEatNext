import { ElementalProperties, ThermodynamicMetrics, Planet, CookingMethod } from '@/types/alchemy';
import { 
  RecommendationServiceInterface,
  RecipeRecommendationCriteria,
  IngredientRecommendationCriteria,
  CuisineRecommendationCriteria,
  CookingMethodRecommendationCriteria,
  RecommendationResult
} from './interfaces/RecommendationServiceInterface';

import { Recipe } from '../types/recipe';
import { Ingredient } from '../types/ingredient';

// Import utility functions
import { calculateElementalCompatibility } from '../utils/elemental/elementalUtils';
import { getCuisineRecommendations } from '../utils/recommendation/cuisineRecommendation';
import { getIngredientRecommendations } from '../utils/recommendation/foodRecommendation';
import { getCookingMethodRecommendations } from '../utils/recommendation/methodRecommendation';

// Import consolidated services

import { Element } from "@/types/alchemy";
import { PlanetaryAlignment } from "@/types/celestial";

/**
 * Consolidated Recommendation Service 
 * Integrates all recommendation functionalities into a single service
 * Provides a consistent API for recommendation operations
 */
export class ConsolidatedRecommendationService implements RecommendationServiceInterface {
  private static instance: ConsolidatedRecommendationService;
  private recipeService: ConsolidatedRecipeService;
  private ingredientService: ConsolidatedIngredientService;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.recipeService = ConsolidatedRecipeService.getInstance();
    this.ingredientService = ConsolidatedIngredientService.getInstance();
  }

  /**
   * Get singleton instance of the service
   */
  public static getInstance(): ConsolidatedRecommendationService {
    if (!ConsolidatedRecommendationService.instance) {
      ConsolidatedRecommendationService.instance = new ConsolidatedRecommendationService();
    }
    return ConsolidatedRecommendationService.instance;
  }

  /**
   * Get recommended recipes based on criteria
   */
  async getRecommendedRecipes(criteria: RecipeRecommendationCriteria): Promise<RecommendationResult<Recipe>> {
    try {
      // Get all recipes
      const allRecipes = await this.recipeService.getAllRecipes();
      
      // Apply elemental filtering
      let filteredRecipes = allRecipes;
      
      if (criteria.elementalState) {
        filteredRecipes = (allRecipes || []).filter(recipe => {
          if (!recipe.elementalState) return false;
          
          const compatibilityScore = this.calculateElementalCompatibility(
            criteria.elementalState!,
            recipe.elementalState
          );
          
          return compatibilityScore >= (criteria.minCompatibility || 0.6);
        });
      }
      
      // Apply additional filters
      if (criteria.cookingMethod) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.cookingMethods === criteria.cookingMethod
        );
      }
      
      if (criteria.cuisine) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.cuisine === criteria.cuisine
        );
      }
      
      if (criteria.includeIngredients && criteria.includeIngredients  || [].length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          criteria.includeIngredients!.every(ingredient => 
            recipe.ingredients  || [].some(recipeIngredient => 
              recipeIngredient.name?.toLowerCase()?.includes(ingredient?.toLowerCase())
            )
          )
        );
      }
      
      if (criteria.excludeIngredients && criteria.excludeIngredients  || [].length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => 
          !criteria.excludeIngredients!  || [].some(ingredient => 
            recipe.ingredients.some(recipeIngredient => 
              recipeIngredient.name?.toLowerCase()?.includes(ingredient?.toLowerCase())
            )
          )
        );
      }
      
      // Calculate scores for each recipe
      const scores: { [key: string]: number } = {};
      
      (filteredRecipes || []).forEach(recipe => {
        if (recipe.elementalState && criteria.elementalState) {
          scores[recipe.id] = this.calculateElementalCompatibility(
            criteria.elementalState,
            recipe.elementalState
          );
        } else {
          scores[recipe.id] = 0.5; // Default score if we can't calculate compatibility
        }
      });
      
      // Sort recipes by score
      filteredRecipes.sort((a, b) => scores[b.id] - scores[a.id]);
      
      // Apply limit if specified
      if (criteria.limit && criteria.limit > 0) {
        filteredRecipes = filteredRecipes?.slice(0, criteria.limit);
      }
      
      return {
        items: filteredRecipes,
        scores,
        context: {
          criteria,
          totalRecipes: (allRecipes || []).length,
          filteredCount: (filteredRecipes || []).length
        }
      };
    } catch (error) {
      console.error('Error getting recommended recipes:', error);
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recommended ingredients based on criteria
   */
  async getRecommendedIngredients(criteria: IngredientRecommendationCriteria): Promise<RecommendationResult<Ingredient>> {
    try {
      // Get all ingredients
      const allIngredients = await this.ingredientService.getAllIngredients();
      
      // Apply elemental filtering
      let filteredIngredients = allIngredients;
      
      if (criteria.elementalState) {
        filteredIngredients = (allIngredients || []).filter(ingredient => {
          if (!ingredient.elementalPropertiesState) return false;
          
          const compatibilityScore = this.calculateElementalCompatibility(
            criteria.elementalState!,
            ingredient.elementalPropertiesState
          );
          
          return compatibilityScore >= (criteria.minCompatibility || 0.6);
        });
      }
      
      // Apply additional filters
      if (criteria.categories && criteria.categories.length > 0) {
        filteredIngredients = filteredIngredients.filter(ingredient => 
          criteria.categories!.includes(ingredient.category || '')
        );
      }
      
      if (criteria.excludeIngredients && criteria.excludeIngredients.length > 0) {
        filteredIngredients = filteredIngredients.filter(ingredient => 
          !criteria.excludeIngredients!.some(excludeIngredient => 
            ingredient.name?.toLowerCase()?.includes(excludeIngredient?.toLowerCase())
          )
        );
      }
      
      if (criteria.planetaryRuler) {
        filteredIngredients = filteredIngredients.filter(ingredient => 
          ingredient.planetaryRuler === criteria.planetaryRuler
        );
      }
      
      if (criteria.currentSeason) {
        filteredIngredients = filteredIngredients.filter(ingredient => 
          ingredient.seasonality?.includes(criteria.currentSeason!)
        );
      }
      
      // Calculate scores for each ingredient
      const scores: { [key: string]: number } = {};
      
      filteredIngredients.forEach(ingredient => {
        if (ingredient.elementalPropertiesState && criteria.elementalState) {
          scores[ingredient.name] = this.calculateElementalCompatibility(
            criteria.elementalState,
            ingredient.elementalPropertiesState
          );
        } else {
          scores[ingredient.name] = 0.5; // Default score if we can't calculate compatibility
        }
      });
      
      // Sort ingredients by score
      filteredIngredients.sort((a, b) => scores[b.name] - scores[a.name]);
      
      // Apply limit if specified
      if (criteria.limit && criteria.limit > 0) {
        filteredIngredients = filteredIngredients.slice(0, criteria.limit);
      }
      
      return {
        items: filteredIngredients,
        scores,
        context: {
          criteria,
          totalIngredients: allIngredients.length,
          filteredCount: filteredIngredients.length
        }
      };
    } catch (error) {
      console.error('Error getting recommended ingredients:', error);
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recommended cuisines based on criteria
   */
  async getRecommendedCuisines(criteria: CuisineRecommendationCriteria): Promise<RecommendationResult<string>> {
    try {
      // Use existing utility function
      const cuisineRecommendations = await getCuisineRecommendations({
        elements: criteria.elementalState,
        planetaryPositions: criteria.planetaryPositions,
        limit: criteria.limit
      });
      
      // Transform to standardized result format
      const items = cuisineRecommendations.recommendations;
      const scores = cuisineRecommendations.scores || {};
      
      // Filter out excluded cuisines
      let filteredItems = items;
      if (criteria.excludeCuisines && criteria.excludeCuisines.length > 0) {
        filteredItems = items.filter(cuisine => 
          !criteria.excludeCuisines!.includes(cuisine)
        );
      }
      
      return {
        items: filteredItems,
        scores,
        context: {
          criteria,
          totalCuisines: items.length,
          filteredCount: filteredItems.length,
          details: cuisineRecommendations.details
        }
      };
    } catch (error) {
      console.error('Error getting recommended cuisines:', error);
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Get recommended cooking methods based on criteria
   */
  async getRecommendedCookingMethods(criteria: CookingMethodRecommendationCriteria): Promise<RecommendationResult<CookingMethod>> {
    try {
      // Use existing utility function
      const methodRecommendations = await getCookingMethodRecommendations({
        elementalPreference: criteria.elementalState,
        planetaryPositions: criteria.planetaryPositions,
        limit: criteria.limit
      });
      
      // Transform to standardized result format
      const items = (methodRecommendations || []).map(method => method.name as CookingMethod);
      
      // Calculate scores
      const scores: { [key: string]: number } = {};
      methodRecommendations.forEach(method => {
        scores[method.name] = method.score;
      });
      
      // Filter out excluded methods
      let filteredItems = items;
      if (criteria.excludeMethods && criteria.excludeMethods.length > 0) {
        filteredItems = items.filter(method => 
          !criteria.excludeMethods!.includes(method)
        );
      }
      
      return {
        items: filteredItems,
        scores,
        context: {
          criteria,
          totalMethods: items.length,
          filteredCount: filteredItems.length,
          details: methodRecommendations
        }
      };
    } catch (error) {
      console.error('Error getting recommended cooking methods:', error);
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Calculate compatibility score between elemental properties
   */
  calculateElementalCompatibility(source: ElementalProperties, target: ElementalProperties): number {
    return calculateElementalCompatibility(source, target);
  }

  /**
   * Get recommendations based on elemental properties
   */
  async getRecommendationsForElements(
    elementalProperties: ElementalProperties,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number
  ): Promise<RecommendationResult<any>> {
    switch (type) {
      case 'recipe':
        return this.getRecommendedRecipes({
          elementalProperties,
          limit
        });
      case 'ingredient':
        return this.getRecommendedIngredients({
          elementalProperties,
          limit
        });
      case 'cuisine':
        return this.getRecommendedCuisines({
          elementalProperties,
          limit
        });
      case 'cookingMethod':
        return this.getRecommendedCookingMethods({
          elementalProperties,
          limit
        });
      default:
        throw new Error(`Invalid recommendation type: ${type}`);
    }
  }

  /**
   * Get recommendations based on planetary alignment
   */
  async getRecommendationsForPlanetaryAlignment(
    planetaryPositions: Record<string, { sign: string; degree: number }>,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number
  ): Promise<RecommendationResult<any>> {
    switch (type) {
      case 'recipe':
        return this.getRecommendedRecipes({
          planetaryPositions,
          limit
        });
      case 'ingredient':
        // For ingredients, we don't directly use planetary positions
        // We could calculate elemental properties from planetary positions
        return this.getRecommendedIngredients({
          limit
        });
      case 'cuisine':
        return this.getRecommendedCuisines({
          planetaryPositions,
          limit
        });
      case 'cookingMethod':
        return this.getRecommendedCookingMethods({
          planetaryPositions,
          limit
        });
      default:
        throw new Error(`Invalid recommendation type: ${type}`);
    }
  }

  /**
   * Calculate thermodynamic metrics based on elemental properties
   */
  calculateThermodynamics(elementalProperties: ElementalProperties): ThermodynamicMetrics {
    // Calculate thermodynamic metrics based on elemental properties
    const { Fire, Water, Earth, Air } = elementalProperties;
    
    // Using formulas similar to alchemicalEngine.ts but simplified
    const heat = Fire / (Fire + Water + Earth + Air || 1);
    const entropy = (Fire + Air) / (Fire + Water + Earth + Air || 1);
    const reactivity = (Fire + Water) / (Fire + Water + Earth + Air || 1);
    const energy = heat * (1 - entropy) * reactivity;
    
    return {
      heat,
      entropy,
      reactivity,
      energy
    };
  }
}

// Export a singleton instance for use throughout the application
export const recommendationService = ConsolidatedRecommendationService.getInstance(); 