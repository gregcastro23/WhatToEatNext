import { ThermodynamicMetrics } from '@/types/alchemical';
import {
  ElementalProperties,
  Planet,
  ZodiacSign,
  PlanetaryAlignment,
  Element
} from '@/types/alchemy';
import { CookingMethod } from '@/types/cooking';
import { Ingredient } from '@/types/ingredient';
import { Recipe } from '@/types/recipe';

/**
 * Filter criteria for recipe recommendations
 */
export interface RecipeRecommendationCriteria {
  /** Elemental properties to consider for recommendation */
  elementalProperties?: ElementalProperties,
  /** Minimum compatibility score for recommendations */
  minCompatibility?: number,
  /** Preferred cooking method for recommendations */
  cookingMethod?: string,
  /** Preferred cuisine for recommendations */
  cuisine?: string,
  /** Specific ingredients to include */
  includeIngredients?: string[],
  /** Specific ingredients to exclude */
  excludeIngredients?: string[]
  /** Planetary positions to consider for recommendation */
  planetaryPositions?: Record<string, { sign: string, degree: number }>,
  /** Limit the number of recommendations */
  limit?: number
}

/**
 * Filter criteria for ingredient recommendations
 */
export interface IngredientRecommendationCriteria {
  /** Elemental properties to consider for recommendation */
  elementalProperties?: ElementalProperties,
  /** Minimum compatibility score for recommendations */
  minCompatibility?: number,
  /** Specific ingredient categories to include */
  categories?: string[],
  /** Specific ingredients to exclude */
  excludeIngredients?: string[],
  /** Planetary ruler to consider for recommendation */
  planetaryRuler?: Planet,
  /** Season to consider for recommendation */
  season?: string,
  /** Limit the number of recommendations */
  limit?: number
}

/**
 * Filter criteria for cuisine recommendations
 */
export interface CuisineRecommendationCriteria {
  /** Elemental properties to consider for recommendation */
  elementalProperties?: ElementalProperties,
  /** Minimum compatibility score for recommendations */
  minCompatibility?: number
  /** Planetary positions to consider for recommendation */
  planetaryPositions?: Record<string, { sign: string, degree: number }>,
  /** Specific cuisines to exclude */
  excludeCuisines?: string[],
  /** Limit the number of recommendations */
  limit?: number
}

/**
 * Filter criteria for cooking method recommendations
 */
export interface CookingMethodRecommendationCriteria {
  /** Elemental properties to consider for recommendation */
  elementalProperties?: ElementalProperties,
  /** Minimum compatibility score for recommendations */
  minCompatibility?: number
  /** Planetary positions to consider for recommendation */
  planetaryPositions?: Record<string, { sign: string, degree: number }>,
  /** Specific cooking methods to exclude */
  excludeMethods?: string[],
  /** Limit the number of recommendations */
  limit?: number
}

/**
 * Result of a recommendation operation
 */
export interface RecommendationResult<T> {
  /** Recommended items */
  items: T[]
  /** Compatibility scores for each recommended item */
  scores: { [key: string]: number }
  /** Additional context or explanation for recommendations */
  context?: Record<string, unknown>,
}

/**
 * Interface for recommendation services
 */
export interface RecommendationServiceInterface {
  /**
   * Get recommended recipes based on criteria
   */
  getRecommendedRecipes(
    criteria: RecipeRecommendationCriteria,
  ): Promise<RecommendationResult<Recipe>>

  /**
   * Get recommended ingredients based on criteria
   */
  getRecommendedIngredients(
    criteria: IngredientRecommendationCriteria,
  ): Promise<RecommendationResult<Ingredient>>

  /**
   * Get recommended cuisines based on criteria
   */
  getRecommendedCuisines(
    criteria: CuisineRecommendationCriteria,
  ): Promise<RecommendationResult<string>>

  /**
   * Get recommended cooking methods based on criteria
   */
  getRecommendedCookingMethods(
    criteria: CookingMethodRecommendationCriteria,
  ): Promise<RecommendationResult<CookingMethod>>

  /**
   * Calculate compatibility score between elemental properties
   */
  calculateElementalCompatibility(source: ElementalProperties, target: ElementalProperties): number

  /**
   * Get recommendations based on elemental properties
   */
  getRecommendationsForElements(
    elementalProperties: ElementalProperties,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number,
  ): Promise<RecommendationResult<unknown>>

  /**
   * Get recommendations based on planetary alignment
   */
  getRecommendationsForPlanetaryAlignment(
    planetaryPositions: Record<string, { sign: string, degree: number }>,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number,
  ): Promise<RecommendationResult<unknown>>

  /**
   * Calculate thermodynamic metrics based on elemental properties
   */
  calculateThermodynamics(elementalProperties: ElementalProperties): ThermodynamicMetrics
}