// React hook for cuisine recipe integration
// Provides easy access to cuisine database from recipe builder components

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  recipeCuisineConnector,
  searchCuisineRecipes,
  importCuisineRecipe,
  getRandomCuisineRecipes,
  getCuisineRecipeStats,
  type CuisineRecipe,
  type RecipeSearchFilters,
  type RecipeImportResult
} from '@/services/RecipeCuisineConnector';
import type { Recipe } from '@/types/recipe';

interface UseCuisineRecipesOptions {
  initialFilters?: RecipeSearchFilters;
  autoLoad?: boolean;
  maxResults?: number;
}

interface UseCuisineRecipesReturn {
  // Data
  recipes: CuisineRecipe[];
  totalCount: number;
  cuisineList: string[];
  stats: ReturnType<typeof getCuisineRecipeStats>;
  
  // Search & Filter
  filters: RecipeSearchFilters;
  setFilters: (filters: RecipeSearchFilters) => void;
  updateFilter: (key: keyof RecipeSearchFilters, value: any) => void;
  clearFilters: () => void;
  search: () => void;
  
  // Recipe Operations
  getRecipeById: (id: string) => CuisineRecipe | undefined;
  importRecipe: (id: string) => RecipeImportResult;
  getRandomRecipes: (count?: number, customFilters?: RecipeSearchFilters) => CuisineRecipe[];
  
  // State
  loading: boolean;
  error: string | null;
  
  // Suggestions
  getIngredientSuggestions: (ingredients: string[]) => CuisineRecipe[];
  getFusionSuggestions: (primaryCuisine: string, secondaryCuisine: string) => CuisineRecipe[];
}

export function useCuisineRecipes(options: UseCuisineRecipesOptions = {}): UseCuisineRecipesReturn {
  const {
    initialFilters = {},
    autoLoad = true,
    maxResults = 50
  } = options;

  // State
  const [recipes, setRecipes] = useState<CuisineRecipe[]>([]);
  const [filters, setFilters] = useState<RecipeSearchFilters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized data that doesn't change often
  const cuisineList = useMemo(() => {
    return recipeCuisineConnector.getCuisineList();
  }, []);

  const totalCount = useMemo(() => {
    return recipeCuisineConnector.getTotalRecipeCount();
  }, []);

  const stats = useMemo(() => {
    return getCuisineRecipeStats();
  }, []);

  // Search function
  const search = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = searchCuisineRecipes(filters);
      const limitedResults = results.slice(0, maxResults);
      
      setRecipes(limitedResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  }, [filters, maxResults]);

  // Auto search when filters change
  useEffect(() => {
    if (autoLoad) {
      search();
    }
  }, [search, autoLoad]);

  // Filter management
  const updateFilter = useCallback((key: keyof RecipeSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Recipe operations
  const getRecipeById = useCallback((id: string) => {
    return recipeCuisineConnector.getRecipeById(id);
  }, []);

  const importRecipe = useCallback((id: string): RecipeImportResult => {
    try {
      return importCuisineRecipe(id);
    } catch (err) {
      return {
        success: false,
        errors: [err instanceof Error ? err.message : 'Failed to import recipe']
      };
    }
  }, []);

  const getRandomRecipes = useCallback((count: number = 5, customFilters?: RecipeSearchFilters) => {
    try {
      return getRandomCuisineRecipes(count, customFilters || filters);
    } catch (err) {
      console.error('Failed to get random recipes:', err);
      return [];
    }
  }, [filters]);

  // Suggestion functions
  const getIngredientSuggestions = useCallback((ingredients: string[]) => {
    try {
      return recipeCuisineConnector.getRecipeSuggestionsByIngredients(ingredients);
    } catch (err) {
      console.error('Failed to get ingredient suggestions:', err);
      return [];
    }
  }, []);

  const getFusionSuggestions = useCallback((primaryCuisine: string, secondaryCuisine: string) => {
    try {
      return recipeCuisineConnector.getFusionSuggestions(primaryCuisine, secondaryCuisine);
    } catch (err) {
      console.error('Failed to get fusion suggestions:', err);
      return [];
    }
  }, []);

  return {
    // Data
    recipes,
    totalCount,
    cuisineList,
    stats,
    
    // Search & Filter
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    search,
    
    // Recipe Operations
    getRecipeById,
    importRecipe,
    getRandomRecipes,
    
    // State
    loading,
    error,
    
    // Suggestions
    getIngredientSuggestions,
    getFusionSuggestions
  };
}

// Specialized hooks for common use cases

/**
 * Hook for recipe inspiration - gets random recipes based on criteria
 */
export function useRecipeInspiration(count: number = 6, filters?: RecipeSearchFilters) {
  const [inspirationRecipes, setInspirationRecipes] = useState<CuisineRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshInspiration = useCallback(() => {
    setLoading(true);
    const recipes = getRandomCuisineRecipes(count, filters);
    setInspirationRecipes(recipes);
    setLoading(false);
  }, [count, filters]);

  useEffect(() => {
    refreshInspiration();
  }, [refreshInspiration]);

  return {
    recipes: inspirationRecipes,
    loading,
    refresh: refreshInspiration
  };
}

/**
 * Hook for recipe search with debouncing
 */
export function useRecipeSearch(initialQuery: string = '', debounceMs: number = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState<CuisineRecipe[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults = searchCuisineRecipes({
      ingredients: [debouncedQuery]
    });
    setResults(searchResults.slice(0, 10));
    setLoading(false);
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    loading
  };
}

/**
 * Hook for cuisine-specific recipes
 */
export function useCuisineSpecificRecipes(cuisine: string) {
  const { recipes, loading, error, search } = useCuisineRecipes({
    initialFilters: { cuisine },
    autoLoad: true
  });

  const getByMealType = useCallback((mealType: string) => {
    return recipes.filter(recipe => 
      recipe.mealType?.includes(mealType)
    );
  }, [recipes]);

  const getBySeason = useCallback((season: string) => {
    return recipes.filter(recipe => 
      recipe.season?.includes(season) || recipe.season?.includes('all')
    );
  }, [recipes]);

  return {
    recipes,
    loading,
    error,
    refresh: search,
    getByMealType,
    getBySeason
  };
}