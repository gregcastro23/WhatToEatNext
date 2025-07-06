/**
 * FoodAlchemySystemAdapter.ts
 * 
 * An adapter for FoodAlchemySystem to use the consolidated recipe service.
 * This adapter serves as a bridge between the FoodAlchemySystem and the
 * modern service architecture.
 */

import type { ElementalProperties, Season, ZodiacSign, LunarPhase, Recipe } from "@/types/alchemy";
import { consolidatedRecipeService } from '../ConsolidatedRecipeService';

import { FoodAlchemySystem } from '../FoodAlchemySystem';
import type { FoodCompatibility, SystemState } from '../../lib/FoodAlchemySystem';

import { logger } from '../../utils/logger';

// Add missing imports for TS2304 fixes
import type { ScoredRecipe } from '@/types/recipe';
import { enhancedIngredientSystem } from '@/services/adapters/IngredientServiceAdapter';

import type { UnifiedIngredient } from '@/types/unified';

import { _Element } from "@/types/alchemy";
import { PlanetaryAlignment } from "@/types/celestial";

/**
 * Enhanced food alchemy system that uses modern service architecture
 */
export class EnhancedFoodAlchemySystem extends FoodAlchemySystem {
  private static instance: EnhancedFoodAlchemySystem;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    super();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): EnhancedFoodAlchemySystem {
    if (!EnhancedFoodAlchemySystem.instance) {
      EnhancedFoodAlchemySystem.instance = new EnhancedFoodAlchemySystem();
    }
    return EnhancedFoodAlchemySystem.instance;
  }
  
  /**
   * Get recommended recipes based on the current alchemical state
   * 
   * @param state The current system state
   * @param criteria Additional search criteria
   * @param limit Maximum number of results
   * @returns Promise resolving to an array of scored recipes
   */
  async getRecommendedRecipes(
    state: SystemState,
    criteria: {
      cuisine?: string;
      season?: Season;
      mealType?: string;
      currentZodiacSign?: ZodiacSign;
      lunarPhase?: LunarPhase;
      dietaryPreferences?: string[];
      ingredients?: string[];
    } = {},
    limit: number = 10
  ): Promise<ScoredRecipe[]> {
    try {
      logger.info('Getting recommended recipes', { state, criteria });
      
      // Create a flavor profile from the current state
      const flavorProfile = this.createFlavorProfileFromState(state);
      
      // Prepare criteria for recipe service
      const recipeCriteria = {
        ...criteria,
        flavorProfile,
        elementalPreference: this.createElementalPreferenceFromState(state)
      };
      
      // Get matching recipes from the consolidated service
      const recipes = await consolidatedRecipeService.getBestRecipeMatches(recipeCriteria, limit);
      return recipes as unknown as ScoredRecipe[];
    } catch (error) {
      logger.error('Error getting recommended recipes', error);
      return [];
    }
  }
  
  /**
   * Get recipes that match the current planetary alignments
   * 
   * @param state The current system state
   * @param minMatchScore Minimum match score
   * @returns Promise resolving to an array of recipes
   */
  async getRecipesForCurrentPlanetaryAlignment(
    state: SystemState,
    minMatchScore: number = 0.6
  ): Promise<Recipe[]> {
    try {
      if (!state.planetaryPositions) {
        return [];
      }
      
      // Create a planetary influences object from the positions
      const planetaryInfluences: { [key: string]: number } = {};
      
      for (const [planet, position] of Object.entries(state.planetaryPositions)) {
        // Apply surgical type casting with variable extraction
        const positionData = position as any;
        const sign = positionData?.sign;
        
        // Skip non-standard planets or positions
        if (!position || !sign) continue;
        
        // Calculate base influence (0.5 as neutral)
        const influence = 0.5;
        
        // Add dignity effects if applicable
        const planetKey = planet.charAt(0)?.toUpperCase() + planet?.slice(1);
        const signFormatted = sign.charAt(0)?.toUpperCase() + sign?.slice(1);
        
        // Track this planet's influence
        planetaryInfluences[planetKey] = influence;
      }
      
      // Get matching recipes from the consolidated service
      const recipes = await consolidatedRecipeService.getRecipesForPlanetaryAlignment(
        planetaryInfluences, 
        minMatchScore
      );
      return recipes as unknown as Recipe[];
    } catch (error) {
      logger.error('Error getting recipes for planetary alignment', error);
      return [];
    }
  }
  
  /**
   * Get recommended ingredients based on the current alchemical state
   * 
   * @param state The current system state
   * @param options Additional options
   * @returns Array of recommended ingredients
   */
  getRecommendedIngredients(
    state: SystemState,
    options: {
      season?: Season;
      currentZodiacSign?: ZodiacSign;
      categories?: string[];
      dietaryPreferences?: {
        isVegetarian?: boolean;
        isVegan?: boolean;
        isGlutenFree?: boolean;
        isDAiryFree?: boolean;
      };
      maxResults?: number;
    } = {}
  ): UnifiedIngredient[] {
    // ✅ Pattern MM-1: Type assertion to resolve SystemState import mismatch
    return enhancedIngredientSystem.getRecommendedIngredients(state as any, _options);
  }
  
  /**
   * Find complementary ingredients for a given set of ingredients
   * 
   * @param ingredients The base ingredients
   * @param maxResults Maximum number of results
   * @returns Array of complementary ingredients
   */
  findComplementaryIngredients(
    ingredients: string[],
    maxResults: number = 5
  ): UnifiedIngredient[] {
    return enhancedIngredientSystem.findComplementaryIngredients(ingredients, maxResults);
  }
  
  /**
   * Get seasonal ingredients with optional filtering
   * 
   * @param season The season to filter by
   * @param filter Additional filter options
   * @returns Record of filtered ingredients by category
   */
  getSeasonalIngredients(
    season: Season,
    filter: {
      categories?: string[];
      dietary?: {
        isVegetarian?: boolean;
        isVegan?: boolean;
        isGlutenFree?: boolean;
        isDAiryFree?: boolean;
      }
    } = {}
  ): Record<string, UnifiedIngredient[]> {
    return enhancedIngredientSystem.getSeasonalIngredients(season, {
      categories: filter.categories,
      dietary: filter.dietary
    });
  }
  
  /**
   * Create a flavor profile from the current system state
   * 
   * @param state The current system state
   * @returns A flavor profile
   */
  private createFlavorProfileFromState(state: SystemState): { [key: string]: number } {
    const { heat, entropy, reactivity } = state.metrics;
    const { Fire, Water, Earth, Air } = state.elements;
    
    // Create a flavor profile based on the elemental state and metrics
    return {
      spicy: Math.min(1, (Fire * 0.7) + (heat * 0.3)),
      sweet: Math.min(1, (Water * 0.4) + (Earth * 0.3) + ((1 - entropy) * 0.3)),
      sour: Math.min(1, (Air * 0.5) + (Water * 0.2) + (entropy * 0.3)),
      bitter: Math.min(1, (Fire * 0.2) + (Air * 0.5) + (reactivity * 0.3)),
      salty: Math.min(1, (Earth * 0.7) + (Water * 0.3)),
      umami: Math.min(1, (Earth * 0.4) + (Fire * 0.3) + (reactivity * 0.3))
    };
  }
  
  /**
   * Create elemental preference from the current system state
   * 
   * @param state The current system state
   * @returns Elemental preference
   */
  private createElementalPreferenceFromState(state: SystemState): Partial<ElementalProperties> {
    const { Fire, Water, Earth, Air } = state.elements;
    
    // Find the element that needs balancing the most
    // (the element that's furthest from 0.25, the ideal balance)
    const elements = [
      { name: 'Fire', value: Fire, diff: Math.abs(Fire - 0.25) },
      { name: 'Water', value: Water, diff: Math.abs(Water - 0.25) },
      { name: 'Earth', value: Earth, diff: Math.abs(Earth - 0.25) },
      { name: 'Air', value: Air, diff: Math.abs(Air - 0.25) }
    ];
    
    // Sort by difference from ideal (descending)
    elements.sort((a, b) => b.diff - a.diff);
    
    // Get the element that needs balancing the most
    const elementToBalance = elements[0];
    
    // Determine the preference direction (boost low elements, reduce high elements)
    const preferenceValue = elementToBalance.value < 0.25 ? 0.8 : 0.2;
    
    // Create a preference object with just the element that needs balancing
    const preference: Partial<ElementalProperties> = {};
    preference[elementToBalance.name as "Fire" | "Water" | "Earth" | "Air"] = preferenceValue;
    
    return preference;
  }
}

// Export singleton instance
export const enhancedFoodAlchemySystem = EnhancedFoodAlchemySystem.getInstance(); 

// Default export
export default EnhancedFoodAlchemySystem;
