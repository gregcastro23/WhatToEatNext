import type {
    EnhancedRecommendationContext,
    EnhancedRecommendationResult
} from '@/services/EnhancedRecommendationService';
import { enhancedRecommendationService } from '@/services/EnhancedRecommendationService';
import { kitchenBackendClient } from '@/services/KitchenBackendClient';
import type { CuisineType } from '@/types/constants';
import type { Ingredient } from '@/types/ingredient';
import type { Recipe } from '@/types/recipe';
import { useCallback, useMemo, useState } from 'react';

export function useEnhancedRecommendations(initial?: EnhancedRecommendationContext) {
  const [cuisines, setCuisines] = useState<EnhancedRecommendationResult<{ name: string, type: CuisineType }> | null>(null)
  const [ingredients, setIngredients] = useState<EnhancedRecommendationResult<Ingredient> | null>(null)
  const [recipes, setRecipes] = useState<EnhancedRecommendationResult<Recipe> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCuisineRecommendations = useCallback(async (context?: EnhancedRecommendationContext) => {
    setLoading(true)
    setError(null)
    try {
      const payload: EnhancedRecommendationContext = {
        datetime: context?.datetime ?? initial?.datetime,
        location: context?.location ?? initial?.location,
        preferences: context?.preferences ?? initial?.preferences,
        useBackendInfluence: context?.useBackendInfluence ?? initial?.useBackendInfluence ?? true,
      };
      const backendFirst = await kitchenBackendClient.getCuisineRecommendations(payload)
      const data = backendFirst || (await enhancedRecommendationService.getEnhancedCuisineRecommendations(payload))
      setCuisines(data)
      setLoading(false)
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err;
    }
  }, [initial?.datetime, initial?.location, initial?.preferences, initial?.useBackendInfluence])

  const getIngredientRecommendations = useCallback(async (context?: EnhancedRecommendationContext) => {
    setLoading(true)
    setError(null)
    try {
      const payload: EnhancedRecommendationContext = {
        datetime: context?.datetime ?? initial?.datetime,
        location: context?.location ?? initial?.location,
        preferences: context?.preferences ?? initial?.preferences,
        useBackendInfluence: context?.useBackendInfluence ?? initial?.useBackendInfluence ?? true,
      };
      const backendFirst = await kitchenBackendClient.getIngredientRecommendations(payload)
      const data = backendFirst || (await enhancedRecommendationService.getEnhancedIngredientRecommendations(payload))
      setIngredients(data)
      setLoading(false)
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err;
    }
  }, [initial?.datetime, initial?.location, initial?.preferences, initial?.useBackendInfluence])

  const getRecipeRecommendations = useCallback(async (context?: EnhancedRecommendationContext) => {
    setLoading(true)
    setError(null)
    try {
      const payload: EnhancedRecommendationContext = {
        datetime: context?.datetime ?? initial?.datetime,
        location: context?.location ?? initial?.location,
        preferences: context?.preferences ?? initial?.preferences,
        useBackendInfluence: context?.useBackendInfluence ?? initial?.useBackendInfluence ?? true,
      };
      const backendFirst = await kitchenBackendClient.getRecipeRecommendations(payload)
      const data = backendFirst || (await enhancedRecommendationService.getEnhancedRecipeRecommendations(payload))
      setRecipes(data)
      setLoading(false)
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err;
    }
  }, [initial?.datetime, initial?.location, initial?.preferences, initial?.useBackendInfluence])

  const getAllRecommendations = useCallback(async (context?: EnhancedRecommendationContext) => {
    setLoading(true)
    setError(null)
    try {
      const payload: EnhancedRecommendationContext = {
        datetime: context?.datetime ?? initial?.datetime,
        location: context?.location ?? initial?.location,
        preferences: context?.preferences ?? initial?.preferences,
        useBackendInfluence: context?.useBackendInfluence ?? initial?.useBackendInfluence ?? true,
      };

      const [cuisineData, ingredientData, recipeData] = await Promise.all([
        kitchenBackendClient.getCuisineRecommendations(payload)
          .then(r => r || enhancedRecommendationService.getEnhancedCuisineRecommendations(payload)),
        kitchenBackendClient.getIngredientRecommendations(payload)
          .then(r => r || enhancedRecommendationService.getEnhancedIngredientRecommendations(payload)),
        kitchenBackendClient.getRecipeRecommendations(payload)
          .then(r => r || enhancedRecommendationService.getEnhancedRecipeRecommendations(payload))
      ])

      setCuisines(cuisineData)
      setIngredients(ingredientData)
      setRecipes(recipeData)
      setLoading(false)

      return { cuisines: cuisineData, ingredients: ingredientData, recipes: recipeData };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      throw err;
    }
  }, [initial?.datetime, initial?.location, initial?.preferences, initial?.useBackendInfluence])

  return useMemo(() => ({
    cuisines,
    ingredients,
    recipes,
    loading,
    error,
    getCuisineRecommendations,
    getIngredientRecommendations,
    getRecipeRecommendations,
    getAllRecommendations
  }), [
    cuisines,
    ingredients,
    recipes,
    loading,
    error,
    getCuisineRecommendations,
    getIngredientRecommendations,
    getRecipeRecommendations,
    getAllRecommendations
  ])
}

export default useEnhancedRecommendations;
