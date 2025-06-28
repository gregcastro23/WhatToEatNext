/**
 * UnifiedDataAdapter
 * 
 * Provides a consistent interface for accessing unified data structures
 * in the WhatToEatNext system. This adapter helps bridge the gap between
 * the unified data system and the application's services.
 */

import type { ElementalProperties, Season, PlanetName, IngredientSearchCriteria } from "@/types/alchemy";
import { EnhancedIngredient, getEnhancedIngredient, searchIngredients, getIngredientsByCategory, generateIngredientRecommendations } from '../../data/unified/enhancedIngredients';
import { UnifiedFlavorProfile, unifiedFlavorProfileSystem, getFlavorProfile } from '../../data/unified/flavorProfiles';
import { UnifiedIngredient } from '../../data/unified/unifiedTypes';

import { createElementalProperties, calculateElementalCompatibility } from '../../utils/elemental/elementalUtils';

import { Element } from "@/types/alchemy";

/**
 * Interface for the UnifiedDataAdapter 
 */
export interface UnifiedDataAdapterInterface {
  // Ingredient operations
  getIngredient(name: string): EnhancedIngredient | undefined;
  getIngredientsByCategory(category: string): EnhancedIngredient[];
  searchIngredients(criteria: IngredientSearchCriteria): EnhancedIngredient[];
  getSeasonalIngredients(season: string): EnhancedIngredient[];
  
  // Flavor profile operations
  getFlavorProfile(id: string, type?: 'cuisine' | 'planetary' | 'ingredient' | 'elemental'): UnifiedFlavorProfile | undefined;
  calculateFlavorCompatibility(profile1: UnifiedFlavorProfile, profile2: UnifiedFlavorProfile): number;
  
  // Elemental operations
  calculateElementalCompatibility(props1: ElementalProperties, props2: ElementalProperties): number;
  createElementalProperties(partialProps?: Partial<ElementalProperties>): ElementalProperties;
}

/**
 * UnifiedDataAdapter implementation
 * 
 * Provides access to the unified data structures with proper error handling and type safety
 */
class UnifiedDataAdapter implements UnifiedDataAdapterInterface {
  /**
   * Get an enhanced ingredient by name
   */
  getIngredient(name: string): EnhancedIngredient | undefined {
    try {
      return getEnhancedIngredient(name);
    } catch (error) {
      console.error(`Error getting ingredient ${name}:`, error);
      return undefined;
    }
  }
  
  /**
   * Get all ingredients in a category
   */
  getIngredientsByCategory(category: string): EnhancedIngredient[] {
    try {
      return getIngredientsByCategory(category);
    } catch (error) {
      console.error(`Error getting ingredients in category ${category}:`, error);
      return [];
    }
  }
  
  /**
   * Search for ingredients based on criteria
   */
  searchIngredients(criteria: IngredientSearchCriteria): EnhancedIngredient[] {
    try {
      return searchIngredients(criteria as any);
    } catch (error) {
      console.error('Error searching ingredients:', error);
      return [];
    }
  }
  
  /**
   * Get ingredients for a specific season
   */
  getSeasonalIngredients(season: string): EnhancedIngredient[] {
    try {
      return getIngredientsByCategory(season);
    } catch (error) {
      console.error(`Error getting seasonal ingredients for ${season}:`, error);
      return [];
    }
  }
  
  /**
   * Get a flavor profile by ID and optional type
   */
  getFlavorProfile(id: string, type?: 'cuisine' | 'planetary' | 'ingredient' | 'elemental'): UnifiedFlavorProfile | undefined {
    try {
      return getFlavorProfile(id, type);
    } catch (error) {
      console.error(`Error getting flavor profile ${id}:`, error);
      return undefined;
    }
  }
  
  /**
   * Calculate compatibility between two flavor profiles
   */
  calculateFlavorCompatibility(profile1: UnifiedFlavorProfile, profile2: UnifiedFlavorProfile): number {
    try {
      const result = unifiedFlavorProfileSystem.calculateFlavorCompatibility(profile1, profile2);
      return result.compatibility;
    } catch (error) {
      console.error('Error calculating flavor compatibility:', error);
      return 0.5; // Default moderate compatibility
    }
  }
  
  /**
   * Calculate compatibility between two elemental properties
   */
  calculateElementalCompatibility(props1: ElementalProperties, props2: ElementalProperties): number {
    try {
      return calculateElementalCompatibility(props1, props2);
    } catch (error) {
      console.error('Error calculating elemental compatibility:', error);
      return 0.5; // Default moderate compatibility
    }
  }
  
  /**
   * Create elemental properties with default values
   */
  createElementalProperties(partialProps?: Partial<ElementalProperties>): ElementalProperties {
    return createElementalProperties(partialProps);
  }
}

// Singleton instance
export const unifiedDataAdapter = new UnifiedDataAdapter();

export default unifiedDataAdapter; 