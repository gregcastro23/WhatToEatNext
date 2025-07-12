/**
 * React hook for using the ingredient mapping service in components
 */

import { useState, useCallback } from 'react';
import type { Recipe } from '@/types/recipe';
import type { ElementalProperties } from '@/types/alchemy';

// Use dynamic import to avoid circular dependency
let ingredientMappingService: any = null;
const getIngredientMappingService = async () => {
  if (!ingredientMappingService) {
    const module = await import('@/services/ingredientMappingService');
    ingredientMappingService = module.default;
  }
  return ingredientMappingService;
};

export function useIngredientMapping() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Map ingredients for a specific recipe
   */
  const mapRecipeIngredients = useCallback(async (recipe: Recipe) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = await getIngredientMappingService();
      const result = service.mapRecipeIngredients(recipe);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Find recipes matching the given criteria
   */
  const findMatchingRecipes = useCallback(async (options: {
    elementalTarget?: ElementalProperties;
    requiredIngredients?: string[];
    excludedIngredients?: string[];
    dietaryRestrictions?: string[];
    emphasizedIngredients?: string[];
    cuisineType?: string;
    mealType?: string;
    season?: string;
  } = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = await getIngredientMappingService();
      const result = service.findMatchingRecipes(options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Suggest alternative ingredients with similar properties
   */
  const suggestAlternatives = useCallback(async (ingredientName: string, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = await getIngredientMappingService();
      const result = service.suggestAlternativeIngredients(ingredientName, options);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        suggestions: []
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Calculate compatibility between two ingredients
   */
  const calculateCompatibility = useCallback(async (ingredient1: string, ingredient2: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = await getIngredientMappingService();
      const result = service.calculateCompatibility(ingredient1, ingredient2);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        compatibility: 0
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Analyze ingredient combinations in a recipe
   */
  const analyzeRecipeCombinations = useCallback(async (recipe: Recipe) => {
    try {
      setIsLoading(true);
      setError(null);
      const service = await getIngredientMappingService();
      const result = service.analyzeRecipeIngredientCombinations(recipe);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        mappingQuality: 0
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    mapRecipeIngredients,
    findMatchingRecipes,
    suggestAlternatives,
    calculateCompatibility,
    analyzeRecipeCombinations
  };
} 