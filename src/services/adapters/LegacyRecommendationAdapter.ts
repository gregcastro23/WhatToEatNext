/**
 * LegacyRecommendationAdapter.ts
 * 
 * This adapter provides a bridge between legacy recommendation services and the
 * modern UnifiedRecommendationService. It allows components that still rely on
 * legacy recommendation service methods to work with the new service architecture.
 * 
 * The adapter implements legacy methods but delegates to modern services.
 */

import { unifiedRecommendationService } from '../UnifiedRecommendationService';
import { Recipe } from '@/types/recipe';
import { alchemicalRecommendationService } from '../AlchemicalRecommendationService';
import { createLogger } from '../../utils/logger';
import { Element , ElementalProperties } from "@/types/alchemy";
import { PlanetaryAlignment } from "@/types/celestial";
import { UnifiedIngredient } from '@/types/ingredient';
import { CookingMethod } from '@/types/cooking';

import type {
  ScoredRecipe 
} from "@/types/recipe";

import type {
  ThermodynamicProperties,
  Planet,
  Season,
  ZodiacSign,
  LunarPhase,
  PlanetName
} from '@/types/alchemy';
import type { RecommendationResult, 
  RecipeRecommendationCriteria,
  IngredientRecommendationCriteria,
  CuisineRecommendationCriteria,
  CookingMethodRecommendationCriteria } from '../interfaces/RecommendationServiceInterface';

// Initialize logger
const logger = createLogger('LegacyRecommendationAdapter');

/**
 * LegacyRecommendationAdapter
 * 
 * Adapter that emulates legacy recommendation service behavior but uses
 * the modern UnifiedRecommendationService internally.
 */
export class LegacyRecommendationAdapter {
  private static _instance: LegacyRecommendationAdapter;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    logger.info('LegacyRecommendationAdapter initialized');
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): LegacyRecommendationAdapter {
    if (!LegacyRecommendationAdapter._instance) {
      LegacyRecommendationAdapter._instance = new LegacyRecommendationAdapter();
    }
    return LegacyRecommendationAdapter._instance;
  }
  
  /**
   * Get recommended recipes using modern service
   */
  public async getRecommendedRecipes(
    criteria: RecipeRecommendationCriteria,
  ): Promise<RecommendationResult<Recipe>> {
    try {
      return await unifiedRecommendationService.getRecommendedRecipes(criteria);
    } catch (error) {
      logger.error('Error in getRecommendedRecipes:', error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Get recommended ingredients using modern service
   */
  public async getRecommendedIngredients(
    criteria: IngredientRecommendationCriteria,
  ): Promise<RecommendationResult<UnifiedIngredient>> {
    try {
      return await unifiedRecommendationService.getRecommendedIngredients(criteria);
    } catch (error) {
      logger.error('Error in getRecommendedIngredients:', error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Get recommended cuisines using modern service
   */
  public async getRecommendedCuisines(
    criteria: CuisineRecommendationCriteria,
  ): Promise<RecommendationResult<string>> {
    try {
      return await unifiedRecommendationService.getRecommendedCuisines(criteria);
    } catch (error) {
      logger.error('Error in getRecommendedCuisines:', error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Get recommended cooking methods using modern service
   */
  public async getRecommendedCookingMethods(
    criteria: CookingMethodRecommendationCriteria,
  ): Promise<RecommendationResult<CookingMethod>> {
    try {
      return await unifiedRecommendationService.getRecommendedCookingMethods(criteria);
    } catch (error) {
      logger.error('Error in getRecommendedCookingMethods:', error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Calculate elemental compatibility using modern service
   */
  public calculateElementalCompatibility(
    source: ElementalProperties, 
    target: ElementalProperties,
  ): number {
    try {
      return unifiedRecommendationService.calculateElementalCompatibility(source, target);
    } catch (error) {
      logger.error('Error in calculateElementalCompatibility:', error);
      // Simple fallback calculation
      const euclideanDistance = Math.sqrt(
        Math.pow(source.Fire - target.Fire, 2) +
        Math.pow(source.Water - target.Water, 2) +
        Math.pow(source.Earth - target.Earth, 2) +
        Math.pow(source.Air - target.Air, 2)
      );
      return Math.max(0, 1 - euclideanDistance);
    }
  }
  
  /**
   * Get recommendations for elements using modern service
   */
  public async getRecommendationsForElements(
    elementalProperties: ElementalProperties,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number
  ): Promise<RecommendationResult<any>> {
    try {
      return await unifiedRecommendationService.getRecommendationsForElements(
        elementalProperties,
        type,
        limit
      );
    } catch (error) {
      logger.error(`Error in getRecommendationsForElements for type "${type}":`, error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Get recommendations for planetary alignment using modern service
   */
  public async getRecommendationsForPlanetaryAlignment(
    planetaryPositions: Record<string, { sign: string; degree: number }>,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number
  ): Promise<RecommendationResult<any>> {
    try {
      return await unifiedRecommendationService.getRecommendationsForPlanetaryAlignment(
        planetaryPositions,
        type,
        limit
      );
    } catch (error) {
      logger.error(`Error in getRecommendationsForPlanetaryAlignment for type "${type}":`, error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }
  
  /**
   * Generate alchemical recommendations using AlchemicalRecommendationService
   */
  public generateAlchemicalRecommendations(
    planetaryPositions: Record<Planet, ZodiacSign>,
    ingredients: UnifiedIngredient[],
    cookingMethods: CookingMethod[],
  ) {
    try {
      return alchemicalRecommendationService.generateRecommendations(
        planetaryPositions,
        ingredients,
        cookingMethods
      );
    } catch (error) {
      logger.error('Error in generateAlchemicalRecommendations:', error);
      // Return minimal result with default values
      const defaultElementalBalance = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
      };
      
      const defaultThermodynamics = {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        energy: 0.5
      } as ThermodynamicProperties;
      
      return {
        dominantElement: 'Fire' as keyof ElementalProperties,
        thermodynamics: defaultThermodynamics,
        recommendedIngredients: [],
        recommendedCookingMethods: [],
        recommendations: ['Unable to generate recommendations.'],
        warnings: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
  
  /**
   * Get recipe recommendations using AlchemicalRecommendationService
   */
  public getRecipeRecommendations(
    recipe: Recipe,
    planetaryPositions: Record<Planet, ZodiacSign>
  ) {
    try {
      return alchemicalRecommendationService.getRecipeRecommendations(
        recipe,
        planetaryPositions
      );
    } catch (error) {
      logger.error(`Error in getRecipeRecommendations for recipe "${recipe.name}":`, error);
      // Return minimal result with default values
      return {
        compatibility: 0.5,
        suggestions: ['Unable to generate recipe recommendations.'],
        adjustments: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
  
  /**
   * Calculate thermodynamics using modern service
   */
  public calculateThermodynamics(elementalProperties: ElementalProperties): ThermodynamicProperties {
    try {
      return unifiedRecommendationService.calculateThermodynamics(elementalProperties);
    } catch (error) {
      logger.error('Error in calculateThermodynamics:', error);
      // Return default thermodynamic properties
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        energy: 0.5
      };
    }
  }
}

// Export singleton instance
export const legacyRecommendationAdapter = LegacyRecommendationAdapter.getInstance();

// Export default for compatibility with existing code
export default legacyRecommendationAdapter; 