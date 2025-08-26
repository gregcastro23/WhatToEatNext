/**
 * LegacyRecommendationAdapter.ts
 *
 * This adapter provides a bridge between legacy recommendation services and the
 * modern UnifiedRecommendationService. It allows components that still rely on
 * legacy recommendation service methods to work with the new service architecture.
 *
 * The adapter implements legacy methods but delegates to modern services.
 */

import type {
    ThermodynamicProperties,
    ZodiacSign,
} from '@/types/alchemy';
import { ElementalProperties } from '@/types/alchemy';
import { CookingMethod } from '@/types/cooking';
import { UnifiedIngredient } from '@/types/ingredient';
import { Recipe } from '@/types/recipe';

import { createLogger } from '../../utils/logger';
import { alchemicalRecommendationService } from '../AlchemicalRecommendationService';
import type {
    CookingMethodRecommendationCriteria,
    CuisineRecommendationCriteria,
    IngredientRecommendationCriteria,
    RecipeRecommendationCriteria,
    RecommendationResult,
} from '../interfaces/RecommendationServiceInterface';
import { unifiedRecommendationService } from '../UnifiedRecommendationService';

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
          error: error instanceof Error ? error.message : String(error),
        },
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
      return (await unifiedRecommendationService.getRecommendedIngredients(
        criteria,
      )) as unknown as RecommendationResult<UnifiedIngredient>;
    } catch (error) {
      logger.error('Error in getRecommendedIngredients:', error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error),
        },
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
          error: error instanceof Error ? error.message : String(error),
        },
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
          error: error instanceof Error ? error.message : String(error),
        },
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
          Math.pow(source.Air - target.Air, 2),
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
    limit?: number,
  ): Promise<RecommendationResult<unknown>> {
    try {
      return await unifiedRecommendationService.getRecommendationsForElements(
        elementalProperties,
        type,
        limit,
      );
    } catch (error) {
      logger.error(`Error in getRecommendationsForElements for type "${type}":`, error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Get recommendations for planetary alignment using modern service
   */
  public async getRecommendationsForPlanetaryAlignment(
    planetaryPositions: Record<string, { sign: string; degree: number }>,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number,
  ): Promise<RecommendationResult<unknown>> {
    try {
      return await unifiedRecommendationService.getRecommendationsForPlanetaryAlignment(
        planetaryPositions,
        type,
        limit,
      );
    } catch (error) {
      logger.error(`Error in getRecommendationsForPlanetaryAlignment for type "${type}":`, error);
      // Return minimal result
      return {
        items: [],
        scores: {},
        context: {
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Generate alchemical recommendations using AlchemicalRecommendationService
   */
  public generateAlchemicalRecommendations(
    planetaryPositions: Record<string, ZodiacSign>,
    ingredients: UnifiedIngredient[],
    cookingMethods: CookingMethod[],
  ) {
    try {
      return alchemicalRecommendationService.generateRecommendations(
        planetaryPositions as unknown,
        ingredients,
        cookingMethods as unknown,
      );
    } catch (error) {
      logger.error('Error in generateAlchemicalRecommendations:', error);
      // Return minimal result with default values
      const defaultThermodynamics = {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.5 - 0.5 * 0.2,
      } as ThermodynamicProperties;

      return {
        dominantElement: 'Fire' as keyof ElementalProperties,
        thermodynamics: defaultThermodynamics,
        recommendedIngredients: [],
        recommendedCookingMethods: [],
        recommendations: ['Unable to generate recommendations.'],
        warnings: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Get recipe recommendations using AlchemicalRecommendationService
   */
  public getRecipeRecommendations(recipe: Recipe, planetaryPositions: Record<string, ZodiacSign>) {
    try {
      return alchemicalRecommendationService.getRecipeRecommendations(
        recipe as unknown,
        planetaryPositions,
      );
    } catch (error) {
      logger.error(`Error in getRecipeRecommendations for recipe "${recipe.name}":`, error);
      // Return minimal result with default values
      return {
        compatibility: 0.5,
        suggestions: ['Unable to generate recipe recommendations.'],
        adjustments: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Calculate thermodynamics using modern service
   */
  public calculateThermodynamics(
    elementalProperties: ElementalProperties,
  ): ThermodynamicProperties {
    try {
      return unifiedRecommendationService.calculateThermodynamics(elementalProperties);
    } catch (error) {
      logger.error('Error in calculateThermodynamics:', error);
      // Return default thermodynamic properties
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.5 - 0.5 * 0.2,
      };
    }
  }
}

// Export singleton instance
export const legacyRecommendationAdapter = LegacyRecommendationAdapter.getInstance();

// Export default for compatibility with existing code
export default legacyRecommendationAdapter;
