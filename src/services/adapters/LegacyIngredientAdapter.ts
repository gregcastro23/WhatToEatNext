/**
 * LegacyIngredientAdapter.ts
 * 
 * This adapter provides a bridge between the legacy IngredientService and the
 * modern UnifiedIngredientService. It allows components that still rely on the
 * legacy service methods to work with the new service architecture.
 * 
 * The adapter implements the legacy interface but delegates to modern services.
 */

import { IngredientService } from '../IngredientService';
import { RecipeIngredient } from '@/types/recipe';
import { unifiedIngredientService } from '../UnifiedIngredientService';
import { createLogger } from '../../utils/logger';
import type { UnifiedIngredient } from '@/types/unified';
import type { 
  Season,
  ZodiacSign,
  PlanetName } from '@/types/alchemy';
import type { ElementalProperties } from '@/types/celestial';
import type { ThermodynamicMetrics } from '@/types/alchemical';
import type { Recipe } from "@/types/recipe";
import type { IngredientFilter, IngredientRecommendationOptions } from '../interfaces/IngredientServiceInterface';


// Initialize logger
const logger = createLogger('LegacyIngredientAdapter');

/**
 * LegacyIngredientAdapter
 * 
 * Adapter that implements the legacy IngredientService interface but uses
 * the modern UnifiedIngredientService internally.
 */
export class LegacyIngredientAdapter {
  private static _instance: LegacyIngredientAdapter;
  
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
      const result = unifiedIngredientService.getAllIngredients() as unknown as Record<string, UnifiedIngredient[]>;
      return result;
    } catch (error) {
      logger.error('Error in getAllIngredients:', error);
      return {};
    }
  }
  
  /**
   * Override getAllIngredientsFlat to use modern service
   */
  public getAllIngredientsFlat(): UnifiedIngredient[] {
    try {
      const result = unifiedIngredientService.getAllIngredientsFlat() as unknown as UnifiedIngredient[];
      return result;
    } catch (error) {
      logger.error('Error in getAllIngredientsFlat:', error);
      return [];
    }
  }
  
  /**
   * Override getIngredientByName to use modern service
   */
  public getIngredientByName(name: string): UnifiedIngredient | undefined {
    try {
      const result = unifiedIngredientService.getIngredientByName(name) as unknown as UnifiedIngredient | undefined;
      return result;
    } catch (error) {
      logger.error(`Error in getIngredientByName for "${name}":`, error);
      return undefined;
    }
  }
  
  /**
   * Override getIngredientsByCategory to use modern service
   */
  public getIngredientsByCategory(category: string): UnifiedIngredient[] {
    try {
      const result = unifiedIngredientService.getIngredientsByCategory(category) as unknown as UnifiedIngredient[];
      return result;
    } catch (error) {
      logger.error(`Error in getIngredientsByCategory for "${category}":`, error);
      return [];
    }
  }
  
  /**
   * Override filterIngredients to use modern service
   */
  public filterIngredients(filter: IngredientFilter = {}): Record<string, UnifiedIngredient[]> {
    try {
      const result = unifiedIngredientService.filterIngredients(filter as unknown) as unknown as Record<string, UnifiedIngredient[]>;
      return result;
    } catch (error) {
      logger.error('Error in filterIngredients:', error);
      return {};
    }
  }
  
  /**
   * Override getIngredientsByElement to use modern service
   */
  public getIngredientsByElement(elementalFilter: Record<string, unknown>): UnifiedIngredient[] {
    try {
      const result = unifiedIngredientService.getIngredientsByElement(elementalFilter) as unknown as UnifiedIngredient[];
      return result;
    } catch (error) {
      logger.error('Error in getIngredientsByElement:', error);
      return [];
    }
  }
  
  /**
   * Override findComplementaryIngredients to use modern service
   */
  public findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults: number = 5
  ): UnifiedIngredient[] {
    try {
      const result = unifiedIngredientService.findComplementaryIngredients(ingredient as any, maxResults) as unknown as UnifiedIngredient[];
      return result;
    } catch (error) {
      logger.error(`Error in findComplementaryIngredients for "${typeof ingredient === 'string' ? ingredient : ingredient.name}":`, error);
      return [];
    }
  }
  
  /**
   * Override calculateElementalProperties to use modern service
   */
  public calculateElementalProperties(ingredient: Record<string, unknown>): ElementalProperties {
    try {
      const result = unifiedIngredientService.calculateElementalProperties(ingredient as any);
      return result as unknown as ElementalProperties;
    } catch (error) {
      logger.error(`Error in calculateElementalProperties for "${ingredient.name || 'unknown'}":`, error);
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
  }
  
  /**
   * Override getRecommendedIngredients to use modern service
   */
  public getRecommendedIngredients(
    elementalState: ElementalProperties,
    options: IngredientRecommendationOptions = {}
  ): UnifiedIngredient[] {
    try {
      const result = unifiedIngredientService.getRecommendedIngredients(elementalState as any, options as any) as unknown as UnifiedIngredient[];
      return result;
    } catch (error) {
      logger.error('Error in getRecommendedIngredients:', error);
      return [];
    }
  }
  
  /**
   * Override analyzeRecipeIngredients to use modern service
   */
  public analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number;flavorProfile: { [key: string]: number };
    strongPAirings: Array<{ ingredients: string[]; score: number }>;
    weakPAirings: Array<{ ingredients: string[]; score: number }>;
  } {
    try {
      return unifiedIngredientService.analyzeRecipeIngredients(recipe);
    } catch (error) {
      logger.error(`Error in analyzeRecipeIngredients for "${recipe.name}":`, error);
      return {
        overallHarmony: 0.5,
        flavorProfile: {},
        strongPAirings: [],
        weakPAirings: []
      };
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
    }
  }
}

// Export singleton instance
export const legacyIngredientAdapter = LegacyIngredientAdapter.getInstance();

// Export default for compatibility with existing code
export default legacyIngredientAdapter; 