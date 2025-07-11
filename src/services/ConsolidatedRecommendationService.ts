import { 
  ElementalProperties, 
  _Planet, 
  ZodiacSign, 
  ThermodynamicProperties,
  Element
} from '../types';

// Additional type definitions
export type ElementalProperties = ElementalProperties;
export type ThermodynamicMetrics = {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
  kalchm: number;
  monica: number;
};

import { Recipe } from '../types/recipe';
import { Ingredient } from '../types/ingredient';
import { CookingMethod } from '@/types/cooking';
import { 
  RecommendationServiceInterface, 
  RecipeRecommendationCriteria, 
  IngredientRecommendationCriteria,
  CuisineRecommendationCriteria,
  CookingMethodRecommendationCriteria,
  RecommendationResult
} from './interfaces/RecommendationServiceInterface';
import { PlanetaryAlignment } from "@/types/celestial";
import { unifiedIngredientService } from './UnifiedIngredientService';
import alchemicalEngine from '@/calculations/core/alchemicalEngine';
import { recipeDataService } from '@/services/recipeData';

// Import utility functions
import { calculateElementalCompatibility } from '../utils/elemental/elementalUtils';
import { getCuisineRecommendations } from '../utils/recommendation/cuisineRecommendation';
import { getIngredientRecommendations } from '../utils/recommendation/foodRecommendation';
import { getCookingMethodRecommendations } from '../utils/recommendation/methodRecommendation';

// Import consolidated services
import { ConsolidatedRecipeService } from './ConsolidatedRecipeService';
import { ConsolidatedIngredientService } from './ConsolidatedIngredientService';

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
      
      // Use safe type casting for criteria access
      const criteriaData = criteria as Record<string, unknown>;
      const elementalState = criteriaData?.elementalState as ElementalProperties || criteriaData?.elementalProperties as ElementalProperties;
      
      if (elementalState) {
        filteredRecipes = (allRecipes || []).filter(recipe => {
          const recipeData = recipe as Record<string, unknown>;
          if (!recipeData?.elementalState) return false;
          
          const compatibilityScore = this.calculateElementalCompatibility(
            elementalState,
            recipeData.elementalState as ElementalProperties
          );
          
          return compatibilityScore >= (criteria.minCompatibility || 0.6);
        });
      }
      
      // Apply additional filters
      if (criteria.cookingMethod) {
        filteredRecipes = filteredRecipes.filter(recipe => {
          const recipeData = recipe as Record<string, unknown>;
          return recipeData?.cookingMethods === criteria.cookingMethod;
        });
      }
      
      if (criteria.cuisine) {
        filteredRecipes = filteredRecipes.filter(recipe => {
          const recipeData = recipe as Record<string, unknown>;
          return recipeData?.cuisine === criteria.cuisine;
        });
      }
      
      if (criteria.includeIngredients && criteria.includeIngredients.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => {
          const recipeData = recipe as Record<string, unknown>;
          const recipeIngredients = recipeData?.ingredients as Record<string, unknown>[] || [];
          
          return criteria.includeIngredients!.every(ingredient => 
            recipeIngredients.some((recipeIngredient: Record<string, unknown>) => 
              (recipeIngredient?.name as string)?.toLowerCase()?.includes(ingredient?.toLowerCase())
            )
          );
        });
      }
      
      if (criteria.excludeIngredients && criteria.excludeIngredients.length > 0) {
        filteredRecipes = filteredRecipes.filter(recipe => {
          const recipeData = recipe as Record<string, unknown>;
          const recipeIngredients = recipeData?.ingredients as Record<string, unknown>[] || [];
          
          return !criteria.excludeIngredients!.some(ingredient => 
            recipeIngredients.some((recipeIngredient: Record<string, unknown>) => 
              (recipeIngredient?.name as string)?.toLowerCase()?.includes(ingredient?.toLowerCase())
            )
          );
        });
      }
      
      // Calculate scores for each recipe
      const scores: { [key: string]: number } = {};
      
      (filteredRecipes || []).forEach(recipe => {
        const recipeData = recipe as Record<string, unknown>;
        if (recipeData?.elementalState && elementalState) {
          scores[recipeData.id as string] = this.calculateElementalCompatibility(
            elementalState,
            recipeData.elementalState as ElementalProperties
          );
        } else {
          scores[recipeData.id as string] = 0.5; // Default score if we can't calculate compatibility
        }
      });
      
      // Sort recipes by score
      filteredRecipes.sort((a, b) => {
        const recipeA = a as Record<string, unknown>;
        const recipeB = b as Record<string, unknown>;
        return scores[recipeB.id as string] - scores[recipeA.id as string];
      });
      
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
      // console.error('Error getting recommended recipes:', error);
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
      
      // Use safe type casting for criteria access
      const criteriaData = criteria as Record<string, unknown>;
      const elementalState = criteriaData?.elementalState as ElementalProperties || criteriaData?.elementalProperties as ElementalProperties;
      
      if (elementalState) {
        filteredIngredients = (allIngredients || []).filter(ingredient => {
          const ingredientData = ingredient as Record<string, unknown>;
          if (!ingredientData?.elementalPropertiesState) return false;
          
          const compatibilityScore = this.calculateElementalCompatibility(
            elementalState,
            ingredientData.elementalPropertiesState as ElementalProperties
          );
          
          return compatibilityScore >= (criteria.minCompatibility || 0.6);
        });
      }
      
      // Apply additional filters
      if (criteria.categories && criteria.categories.length > 0) {
        filteredIngredients = filteredIngredients.filter(ingredient => {
          const ingredientData = ingredient as Record<string, unknown>;
          return criteria.categories!.includes(ingredientData?.category as string || '');
        });
      }
      
      // Apply season filter with safe type casting
      const currentSeason = criteriaData?.currentSeason as string || criteriaData?.season as string;
      if (currentSeason) {
        filteredIngredients = filteredIngredients.filter(ingredient => {
          const ingredientData = ingredient as Record<string, unknown>;
          const ingredientSeasons = ingredientData?.seasons as string[] || [];
          return ingredientSeasons.includes(currentSeason);
        });
      }
      
      if (criteria.excludeIngredients && criteria.excludeIngredients.length > 0) {
        filteredIngredients = filteredIngredients.filter(ingredient => {
          const ingredientData = ingredient as Record<string, unknown>;
          return !criteria.excludeIngredients!.some(excludeIngredient => 
            (ingredientData?.name as string)?.toLowerCase()?.includes(excludeIngredient?.toLowerCase())
          );
        });
      }
      
      if (criteria.planetaryRuler) {
        filteredIngredients = filteredIngredients.filter(ingredient => {
          const ingredientData = ingredient as Record<string, unknown>;
          return ingredientData?.planetaryRuler === criteria.planetaryRuler;
        });
      }
      
      // Calculate scores for each ingredient
      const scores: { [key: string]: number } = {};
      
      (filteredIngredients || []).forEach(ingredient => {
        const ingredientData = ingredient as Record<string, unknown>;
        if (ingredientData?.elementalPropertiesState && elementalState) {
          scores[ingredientData.id as string] = this.calculateElementalCompatibility(
            elementalState,
            ingredientData.elementalPropertiesState as ElementalProperties
          );
        } else {
          scores[ingredientData.id as string] = 0.5; // Default score if we can't calculate compatibility
        }
      });
      
      // Sort ingredients by score
      filteredIngredients.sort((a, b) => {
        const ingredientA = a as Record<string, unknown>;
        const ingredientB = b as Record<string, unknown>;
        return scores[ingredientB.id as string] - scores[ingredientA.id as string];
      });
      
      // Apply limit if specified
      if (criteria.limit && criteria.limit > 0) {
        filteredIngredients = filteredIngredients?.slice(0, criteria.limit);
      }
      
      return {
        items: filteredIngredients,
        scores,
        context: {
          criteria,
          totalIngredients: (allIngredients || []).length,
          filteredCount: (filteredIngredients || []).length
        }
      };
    } catch (error) {
      // console.error('Error getting recommended ingredients:', error);
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
      // Use safe type casting for criteria access
      const criteriaData = criteria as Record<string, unknown>;
      const elementalState = criteriaData?.elementalState as ElementalProperties || criteriaData?.elementalProperties as ElementalProperties;
      
      // Use existing utility function
      const cuisineRecommendations = await getCuisineRecommendations({
        elements: elementalState,
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
      // console.error('Error getting recommended cuisines:', error);
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
      // Use safe type casting for criteria access
      const criteriaData = criteria as Record<string, unknown>;
      const elementalState = criteriaData?.elementalState as ElementalProperties || criteriaData?.elementalProperties as ElementalProperties;
      
      // ✅ Pattern MM-1: Type assertion to match AstrologicalState interface
      const methodRecommendations = await getCookingMethodRecommendations({
        elementalPreference: elementalState,
        planetaryPositions: criteria.planetaryPositions,
        limit: criteria.limit
      } as Record<string, unknown>);
      
      // Transform to standardized result format - return CookingMethod objects
      const items: CookingMethod[] = (methodRecommendations || []).map(method => {
        const methodData = method as Record<string, unknown>;
        return {
          id: methodData?.id as string || methodData?.name as string || 'unknown',
          name: methodData?.name as string || 'Unknown Method',
          description: methodData?.description as string || '',
          elementalProperties: methodData?.elementalProperties as ElementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
          difficulty: methodData?.difficulty as string || 'medium',
          timeRequired: methodData?.timeRequired as number || 30,
          equipment: methodData?.equipment as string[] || []
        };
      });
      
      // Calculate scores - safe property access
      const scores: { [key: string]: number } = {};
      methodRecommendations.forEach((method, index) => {
        const methodData = method as Record<string, unknown>;
        const methodName = methodData?.name as string || items[index]?.name;
        const methodScore = methodData?.score as number || 0.5;
        if (methodName) {
          scores[methodName] = methodScore;
        }
      });
      
      // Filter out excluded methods
      let filteredItems = items;
      if (criteria.excludeMethods && criteria.excludeMethods.length > 0) {
        filteredItems = items.filter(method => 
          !criteria.excludeMethods!.includes(method.name)
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
      // console.error('Error getting recommended cooking methods:', error);
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
  ): Promise<RecommendationResult<Recipe | Ingredient | string | CookingMethod>> {
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
  ): Promise<RecommendationResult<Recipe | Ingredient | string | CookingMethod>> {
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
      gregsEnergy: energy,
      kalchm: Math.pow(Fire * Water, Air) / (Earth || 1),
      monica: energy / (reactivity * heat || 1)
    };
  }
}

// Export a singleton instance for use throughout the application
export const recommendationService = ConsolidatedRecommendationService.getInstance(); 