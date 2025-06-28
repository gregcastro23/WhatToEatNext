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
import type { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import type { 
  ElementalProperties, 
  Season,
  ZodiacSign,
  PlanetName } from '@/types/ingredient';
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
export class LegacyIngredientAdapter extends IngredientService {
  private static _instance: LegacyIngredientAdapter;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    super();
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
  public override getAllIngredients(): Record<string, UnifiedIngredient[]> {
    try {
      const result: any = unifiedIngredientService.getAllIngredients();
      return result as Record<string, UnifiedIngredient[]>;
    } catch (error) {
      logger.error('Error in getAllIngredients:', error);
      // Fall back to original implementation if needed
      return super.getAllIngredients();
    }
  }
  
  /**
   * Override getAllIngredientsFlat to use modern service
   */
  public override getAllIngredientsFlat(): UnifiedIngredient[] {
    try {
      const result: any = unifiedIngredientService.getAllIngredientsFlat();
      return result as UnifiedIngredient[];
    } catch (error) {
      logger.error('Error in getAllIngredientsFlat:', error);
      // Fall back to original implementation if needed
      return super.getAllIngredientsFlat();
    }
  }
  
  /**
   * Override getIngredientByName to use modern service
   */
  public override getIngredientByName(name: string): UnifiedIngredient | undefined {
    try {
      const result: any = unifiedIngredientService.getIngredientByName(name);
      return result as UnifiedIngredient | undefined;
    } catch (error) {
      logger.error(`Error in getIngredientByName for "${name}":`, error);
      // Fall back to original implementation if needed
      return super.getIngredientByName(name);
    }
  }
  
  /**
   * Override getIngredientsByCategory to use modern service
   */
  public override getIngredientsByCategory(category: string): UnifiedIngredient[] {
    try {
      const result: any = unifiedIngredientService.getIngredientsByCategory(category);
      return result as UnifiedIngredient[];
    } catch (error) {
      logger.error(`Error in getIngredientsByCategory for "${category}":`, error);
      // Fall back to original implementation if needed
      return super.getIngredientsByCategory(category);
    }
  }
  
  /**
   * Override filterIngredients to use modern service
   */
  public override filterIngredients(filter: IngredientFilter = {}): Record<string, UnifiedIngredient[]> {
    try {
      const result: any = unifiedIngredientService.filterIngredients(filter as any); // Pattern UUU: Import Path Interface Resolution
      return result as Record<string, UnifiedIngredient[]>;
    } catch (error) {
      logger.error('Error in filterIngredients:', error);
      // Fall back to original implementation if needed
      return super.filterIngredients(filter);
    }
  }
  
  /**
   * Override getIngredientsByElement to use modern service
   */
  public override getIngredientsByElement(elementalFilter: any): UnifiedIngredient[] {
    try {
      const result: any = unifiedIngredientService.getIngredientsByElement(elementalFilter);
      return result as UnifiedIngredient[];
    } catch (error) {
      logger.error('Error in getIngredientsByElement:', error);
      // Fall back to original implementation if needed
      return super.getIngredientsByElement(elementalFilter);
    }
  }
  
  /**
   * Override findComplementaryIngredients to use modern service
   */
  public override findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults: number = 5
  ): UnifiedIngredient[] {
    try {
      const result: any = unifiedIngredientService.findComplementaryIngredients(ingredient as any, maxResults); // Pattern UUU: Import Path Interface Resolution
      return result as UnifiedIngredient[];
    } catch (error) {
      logger.error(`Error in findComplementaryIngredients for "${typeof ingredient === 'string' ? ingredient : ingredient.name}":`, error);
      // Fall back to original implementation if needed
      return super.findComplementaryIngredients(ingredient, maxResults);
    }
  }
  
  /**
   * Override calculateElementalProperties to use modern service
   */
  public override calculateElementalProperties(ingredient: Partial<UnifiedIngredient>): ElementalProperties {
    try {
      return unifiedIngredientService.calculateElementalProperties(ingredient as any); // Pattern UUU: Import Path Interface Resolution
    } catch (error) {
      logger.error(`Error in calculateElementalProperties for "${ingredient.name || 'unknown'}":`, error);
      // Fall back to original implementation if needed
      return super.calculateElementalProperties(ingredient);
    }
  }
  
  /**
   * Override getRecommendedIngredients to use modern service
   */
  public override getRecommendedIngredients(
    elementalState: ElementalProperties,
    options: IngredientRecommendationOptions = {}
  ): UnifiedIngredient[] {
    try {
      const result: any = unifiedIngredientService.getRecommendedIngredients(elementalState, options);
      return result as UnifiedIngredient[];
    } catch (error) {
      logger.error('Error in getRecommendedIngredients:', error);
      // Fall back to original implementation if needed
      return super.getRecommendedIngredients(elementalState, options);
    }
  }
  
  /**
   * Override analyzeRecipeIngredients to use modern service
   */
  public override analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number;flavorProfile: { [key: string]: number };
    strongPAirings: Array<{ ingredients: string[]; score: number }>;
    weakPAirings: Array<{ ingredients: string[]; score: number }>;
  } {
    try {
      return unifiedIngredientService.analyzeRecipeIngredients(recipe);
    } catch (error) {
      logger.error(`Error in analyzeRecipeIngredients for "${recipe.name}":`, error);
      // Fall back to original implementation if needed
      return super.analyzeRecipeIngredients(recipe);
    }
  }
  
  /**
   * Override clearCache to use modern service
   */
  public override clearCache(): void {
    try {
      unifiedIngredientService.clearCache();
    } catch (error) {
      logger.error('Error in clearCache:', error);
      // Fall back to original implementation if needed
      super.clearCache();
    }
  }
}

// Export singleton instance
export const legacyIngredientAdapter = LegacyIngredientAdapter.getInstance();

// Export default for compatibility with existing code
export default legacyIngredientAdapter; 