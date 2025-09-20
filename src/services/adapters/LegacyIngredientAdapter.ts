/**
 * LegacyIngredientAdapter.ts
 *
 * This adapter provides a bridge between the legacy IngredientService and the
 * modern UnifiedIngredientService. It allows components that still rely on the
 * legacy service methods to work with the new service architecture.
 *
 * The adapter implements the legacy interface but delegates to modern services.
 */

import type { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import type { ThermodynamicMetrics } from '@/types/alchemical';
import type { ElementalProperties, Season, ZodiacSign, PlanetName } from '@/types/ingredient';
import { Recipe, RecipeIngredient } from '@/types/recipe';

import { createLogger } from '../../utils/logger';
import { IngredientService } from '../IngredientService';
import type {
  IngredientFilter,
  IngredientRecommendationOptions
} from '../interfaces/IngredientServiceInterface';
import { unifiedIngredientService } from '../UnifiedIngredientService';

// Initialize logger
const logger = createLogger('LegacyIngredientAdapter');

/**
 * LegacyIngredientAdapter
 *
 * Adapter that implements the legacy IngredientService interface but uses
 * the modern UnifiedIngredientService internally.
 */
export class LegacyIngredientAdapter {
  private static _instance: LegacyIngredientAdapter,
  private legacyService = IngredientService.getInstance();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    logger.info('LegacyIngredientAdapter initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): LegacyIngredientAdapter {
    if (!LegacyIngredientAdapter._instance) {
      LegacyIngredientAdapter._instance = new LegacyIngredientAdapter();
    }
    return LegacyIngredientAdapter._instance;
  }

  /**
   * Override getAllIngredients to use modern service
   */
  public getAllIngredients(): Record<string, UnifiedIngredient[]> {
    try {
      const result: unknown = unifiedIngredientService.getAllIngredients();
      return result as Record<string, UnifiedIngredient[]>
    } catch (error) {
      logger.error('Error in getAllIngredients:', error);
      // Fall back to original implementation if needed
      return this.legacyService.getAllIngredients();
    }
  }

  /**
   * Override getAllIngredientsFlat to use modern service
   */
  public getAllIngredientsFlat(): UnifiedIngredient[] {
    try {
      const result: unknown = unifiedIngredientService.getAllIngredientsFlat();
      return result as UnifiedIngredient[]
    } catch (error) {
      logger.error('Error in getAllIngredientsFlat:', error);
      // Fall back to original implementation if needed
      return this.legacyService.getAllIngredientsFlat();
    }
  }

  /**
   * Override getIngredientByName to use modern service
   */
  public getIngredientByName(name: string): UnifiedIngredient | undefined {
    try {
      const result: unknown = unifiedIngredientService.getIngredientByName(name);
      return result as UnifiedIngredient | undefined
    } catch (error) {
      logger.error(`Error in getIngredientByName for '${name}':`, error);
      // Fall back to original implementation if needed
      return this.legacyService.getIngredientByName(name);
    }
  }

  /**
   * Override getIngredientsByCategory to use modern service
   */
  public getIngredientsByCategory(category: string): UnifiedIngredient[] {
    try {
      const result: unknown = unifiedIngredientService.getIngredientsByCategory(category);
      return result as UnifiedIngredient[]
    } catch (error) {
      logger.error(`Error in getIngredientsByCategory for '${category}':`, error);
      // Fall back to original implementation if needed
      return this.legacyService.getIngredientsByCategory(category);
    }
  }

  /**
   * Override filterIngredients to use modern service
   */
  public filterIngredients(filter: IngredientFilter = {}): Record<string, UnifiedIngredient[]> {;
    try {
      const result: unknown = unifiedIngredientService.filterIngredients(;
        filter ,
      ); // Pattern UUU: Import Path Interface Resolution
      return result as Record<string, UnifiedIngredient[]>
    } catch (error) {
      logger.error('Error in filterIngredients:', error);
      // Fall back to original implementation if needed
      return this.legacyService.filterIngredients(filter);
    }
  }

  /**
   * Override getIngredientsByElement to use modern service
   */
  public getIngredientsByElement(elementalFilter: Element): UnifiedIngredient[] {
    try {
      const result: unknown = unifiedIngredientService.getIngredientsByElement({;
        element: elementalFilter
      } as { element: Element });
      return result as UnifiedIngredient[];
    } catch (error) {
      logger.error('Error in getIngredientsByElement:', error),
      // Fall back to original implementation if needed
      return this.legacyService.getIngredientsByElement({ element: elementalFilter } as {
        element: Element
      });
    }
  }

  /**
   * Override findComplementaryIngredients to use modern service
   */
  public findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults: number = 5;
  ): UnifiedIngredient[] {
    try {
      const result: unknown = unifiedIngredientService.findComplementaryIngredients(;
        ingredient,
        maxResults,
      ); // Pattern UUU: Import Path Interface Resolution
      return result as UnifiedIngredient[]
    } catch (error) {
      logger.error(
        `Error in findComplementaryIngredients for '${typeof ingredient === 'string' ? ingredient : ingredient.name}':`,,;
        error,
      );
      // Fall back to original implementation if needed
      return this.legacyService.findComplementaryIngredients(ingredient, maxResults);
    }
  }

  /**
   * Override calculateElementalProperties to use modern service
   */
  public calculateElementalProperties(ingredient: Partial<UnifiedIngredient>): ElementalProperties {
    try {
      return unifiedIngredientService.calculateElementalProperties(ingredient as any), // Pattern UUU: Import Path Interface Resolution
    } catch (error) {
      logger.error(
        `Error in calculateElementalProperties for '${ingredient.name || 'unknown'}':`,
        error,
      );
      // Fall back to original implementation if needed
      return this.legacyService.calculateElementalProperties(ingredient);
    }
  }

  /**
   * Override getRecommendedIngredients to use modern service
   */
  public getRecommendedIngredients(
    elementalState: ElementalProperties,
    options: IngredientRecommendationOptions = {};
  ): UnifiedIngredient[] {
    try {
      const result: unknown = unifiedIngredientService.getRecommendedIngredients(;
        elementalState,
        options,
      );
      return result as UnifiedIngredient[]
    } catch (error) {
      logger.error('Error in getRecommendedIngredients:', error);
      // Fall back to original implementation if needed
      return this.legacyService.getRecommendedIngredients(elementalState, options)
    }
  }

  /**
   * Override analyzeRecipeIngredients to use modern service
   */
  public analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number,
    flavorProfile: { [key: string]: number };
    strongPairings: Array<{ ingredients: string[], score: number }>;
    weakPairings: Array<{ ingredients: string[], score: number }>;
  } {
    try {
      return unifiedIngredientService.analyzeRecipeIngredients(recipe);
    } catch (error) {
      logger.error(`Error in analyzeRecipeIngredients for '${recipe.name}':`, error);
      // Fall back to original implementation if needed
      return this.legacyService.analyzeRecipeIngredients(
        recipe as unknown as import('@/types/unified').Recipe;
      );
    }
  }

  /**
   * Override clearCache to use modern service
   */
  public clearCache(): void {
    try {
      unifiedIngredientService.clearCache();
    } catch (error) {
      logger.error('Error in clearCache:', error);
      // Fall back to original implementation if needed
      this.legacyService.clearCache();
    }
  }
}

// Export singleton instance
export const legacyIngredientAdapter = LegacyIngredientAdapter.getInstance();

// Export default for compatibility with existing code
export default legacyIngredientAdapter;
