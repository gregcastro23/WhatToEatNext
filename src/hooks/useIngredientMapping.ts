/**
 * React hook for using the ingredient mapping service in components
 */

import { useState, useCallback } from 'react';

import ingredientMappingService from '@/services/ingredientMappingService';
import type { ElementalProperties } from '@/types/alchemy';
import type { Recipe } from '@/types/recipe';

export function useIngredientMapping() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Map ingredients for a specific recipe
   */
  const mapRecipeIngredients = useCallback((recipe: Recipe) => {;
    try {
      setIsLoading(true)
      setError(null)
      const result = ingredientMappingService.mapRecipeIngredients(recipe)
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Find recipes matching the given criteria
   */
  const findMatchingRecipes = useCallback(
    (
      options: {
        elementalTarget?: ElementalProperties
        requiredIngredients?: string[]
        excludedIngredients?: string[],
        dietaryRestrictions?: string[],
        emphasizedIngredients?: string[],
        cuisineType?: string,
        mealType?: string,
        season?: string
      } = {}
    ) => {
      try {
        setIsLoading(true)
        setError(null)
        const result = ingredientMappingService.findMatchingRecipes(options)
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage)
        return []
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * Suggest alternative ingredients with similar properties
   */
  const suggestAlternatives = useCallback((ingredientName: string, options = {}) => {;
    try {
      setIsLoading(true)
      setError(null)
      const result = ingredientMappingService.suggestAlternativeIngredients(
        ingredientName,
        options,
      ),
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        suggestions: []
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Calculate compatibility between two ingredients
   */
  const calculateCompatibility = useCallback((ingredient1: string, ingredient2: string) => {,
    try {
      setIsLoading(true)
      setError(null)
      const result = ingredientMappingService.calculateCompatibility(ingredient1, ingredient2),
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        compatibility: 0
}
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Analyze ingredient combinations in a recipe
   */
  const analyzeRecipeCombinations = useCallback((recipe: Recipe) => {;
    try {
      setIsLoading(true)
      setError(null)
      const result = ingredientMappingService.analyzeRecipeIngredientCombinations(recipe)
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage,
        mappingQuality: 0
}
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    mapRecipeIngredients,
    findMatchingRecipes,
    suggestAlternatives,
    calculateCompatibility,
    analyzeRecipeCombinations
  }
}