'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { stateManager } from '@/utils/stateManager';
import { recipeFilter } from '@/utils/recipeFilters';
import { logger } from '@/utils/logger';
import Recipe from '@/components/Recipe/Recipe';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import type { ScoredRecipe, Recipe as RecipeType } from '@/types/recipe';
import type { CuisineType, DietaryRestriction } from '@/types/alchemy';
import { recipeData } from '@/services/recipeData';

// Mock cuisine types until we get real data
const cuisineTypes = {
  'Italian': true,
  'Mexican': true,
  'Chinese': true,
  'Japanese': true,
  'Indian': true,
  'Thai': true,
  'Mediterranean': true,
  'American': true,
  'French': true
};

// Mock meal types
const mealTypes = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack'
];

// Mock dietary options
const dietaryOptions: DietaryRestriction[] = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'keto',
  'paleo',
  'low-carb',
  'low-fat'
];

interface FilterState {
  search: string;
  cuisineTypes: CuisineType[];
  mealType: string[];
  dietary: DietaryRestriction[];
  maxTime: number | undefined;
  spiciness: string | null;
  complexity: string | null;
}

const initialFilters: FilterState = {
  search: '',
  cuisineTypes: [],
  mealType: [],
  dietary: [],
  maxTime: undefined,
  spiciness: null,
  complexity: null
};

export default function RecipeList() {
  const { state } = useAlchemical();
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // TODO: Use actual recipes from the stateManager or API
  const [recipes, setRecipes] = useState<ScoredRecipe[]>([]);

  // Ensure recipes are always of ScoredRecipe type
  const ensureScoredRecipes = (recipes: (RecipeType | ScoredRecipe)[]): ScoredRecipe[] => {
    return recipes.map(recipe => {
      if ('score' in recipe) {
        return recipe as ScoredRecipe;
      }
      // Convert Recipe to ScoredRecipe with default score
      return { 
        ...recipe, 
        score: 0.5,
        id: recipe.id || `recipe-${Math.random().toString(36).substr(2, 9)}`
      } as ScoredRecipe;
    });
  };

  // Memoized filtered recipes
  const filteredRecipes = useMemo(() => {
    try {
      if (!recipes.length) return [];

      // First filter by cuisine if needed
      let filteredByCuisine = recipes;
      if (filters.cuisineTypes.length > 0) {
        // Ensure we're returning ScoredRecipe[] by wrapping the result
        const cuisineFiltered = recipeFilter.filterByCuisine(
          recipes, 
          filters.cuisineTypes.map(cuisine => cuisine as unknown as string)
        );
        filteredByCuisine = ensureScoredRecipes(cuisineFiltered);
      }

      // Then apply other filters
      return recipeFilter.filterAndSortRecipes(
        filteredByCuisine,
        {
          searchQuery: filters.search,
          mealType: filters.mealType,
          dietaryRestrictions: filters.dietary,
          maxPrepTime: filters.maxTime,
          elementalState: state.elementalPreference
        },
        { by: 'relevance', direction: 'desc' }
      );
    } catch (error) {
      logger.error('Error filtering recipes:', error);
      return recipes;
    }
  }, [recipes, state.elementalPreference, filters]);

  // Handle recipe expansion
  const handleRecipeToggle = (recipeId: string) => {
    setExpandedRecipeId(expandedRecipeId === recipeId ? null : recipeId);
  };

  // Update filters
  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(initialFilters);
    setShowFilters(false);
  };

  // Handle search
  const handleSearch = (value: string) => {
    updateFilters({ search: value });
  };

  // Group recipes by category for better organization
  const groupedRecipes = useMemo(() => {
    try {
      const groups: Record<string, ScoredRecipe[]> = {
        recommended: [],
        favorites: [],
        other: []
      };

      filteredRecipes.forEach(recipe => {
        // Simulate favorites with hardcoded array since state.favorites is not available
        const favorites: string[] = [];
        if (favorites.includes(recipe.id)) {
          groups.favorites.push(recipe);
        } else if (recipe.score >= 0.8) {
          groups.recommended.push(recipe);
        } else {
          groups.other.push(recipe);
        }
      });

      return groups;
    } catch (error) {
      logger.error('Error grouping recipes:', error);
      return { other: filteredRecipes };
    }
  }, [filteredRecipes]);

  // Load recipes on component mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true);
        // Get the recipes directly from recipeData service
        const recipesData = await recipeData.getAllRecipes();
        
        // Ensure all recipes have a score
        const scoredRecipes = ensureScoredRecipes(recipesData);
        setRecipes(scoredRecipes);
      } catch (error) {
        logger.error('Error loading recipes:', error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecipes();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2 hover:bg-gray-200"
          >
            {showFilters ? <X /> : <SlidersHorizontal />}
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cuisine Types */}
              <div>
                <label className="block text-sm font-medium mb-2">Cuisine</label>
                <select
                  multiple
                  value={filters.cuisineTypes.map(cuisine => cuisine.toString())}
                  onChange={(e) => updateFilters({
                    cuisineTypes: Array.from(e.target.selectedOptions, option => option.value as unknown as CuisineType)
                  })}
                  className="w-full p-2 border rounded"
                >
                  {Object.keys(cuisineTypes).map(cuisine => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Meal Type</label>
                <select
                  multiple
                  value={filters.mealType}
                  onChange={(e) => updateFilters({
                    mealType: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="w-full p-2 border rounded"
                >
                  {mealTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="block text-sm font-medium mb-2">Dietary</label>
                <select
                  multiple
                  value={filters.dietary}
                  onChange={(e) => updateFilters({
                    dietary: Array.from(e.target.selectedOptions, option => option.value as DietaryRestriction)
                  })}
                  className="w-full p-2 border rounded"
                >
                  {dietaryOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Groups */}
      <div className="space-y-8">
        {/* Recommended Recipes */}
        {groupedRecipes.recommended.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
            <div className="space-y-4">
              {groupedRecipes.recommended.map(recipe => (
                <Recipe
                  key={recipe.id}
                  recipe={recipe}
                  isExpanded={expandedRecipeId === recipe.id}
                  onToggle={() => handleRecipeToggle(recipe.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Favorite Recipes */}
        {groupedRecipes.favorites.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Favorites</h2>
            <div className="space-y-4">
              {groupedRecipes.favorites.map(recipe => (
                <Recipe
                  key={recipe.id}
                  recipe={recipe}
                  isExpanded={expandedRecipeId === recipe.id}
                  onToggle={() => handleRecipeToggle(recipe.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Other Recipes */}
        {groupedRecipes.other.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">More Recipes</h2>
            <div className="space-y-4">
              {groupedRecipes.other.map(recipe => (
                <Recipe
                  key={recipe.id}
                  recipe={recipe}
                  isExpanded={expandedRecipeId === recipe.id}
                  onToggle={() => handleRecipeToggle(recipe.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {Object.values(groupedRecipes).every(group => group.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">No recipes found matching your criteria</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-blue-500 hover:text-blue-600"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 