'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext';
import { stateManager } from '@/utils/stateManager';
import { recipeFilter } from '@/utils/recipeFilters';
import { logger } from '@/utils/logger';
import { motion, AnimatePresence } from 'framer-motion';
import Recipe from '@/components/Recipe/Recipe';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import type { ScoredRecipe } from '@/types/recipe';
import type { CuisineType } from '@/types/cuisine';

interface FilterState {
  search: string;
  cuisineTypes: CuisineType[];
  mealType: string[];
  dietary: string[];
  maxTime: number | null;
  spiciness: string | null;
  complexity: string | null;
}

const initialFilters: FilterState = {
  search: '',
  cuisineTypes: [],
  mealType: [],
  dietary: [],
  maxTime: null,
  spiciness: null,
  complexity: null
};

export default function RecipeList() {
  const { state } = useAlchemical();
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized filtered recipes
  const filteredRecipes = useMemo(() => {
    try {
      if (!state.recipes.length) return [];

      return recipeFilter.filterAndSortRecipes(
        state.recipes,
        {
          searchQuery: filters.search,
          cuisineTypes: filters.cuisineTypes,
          mealType: filters.mealType,
          dietaryRestrictions: filters.dietary,
          maxPrepTime: filters.maxTime,
          spiciness: filters.spiciness as any,
          complexity: filters.complexity as any,
          elementalState: state.elementalState
        },
        { by: 'relevance', direction: 'desc' }
      );
    } catch (error) {
      logger.error('Error filtering recipes:', error);
      return state.recipes;
    }
  }, [state.recipes, state.elementalState, filters]);

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
        if (state.favorites.includes(recipe.id)) {
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
  }, [filteredRecipes, state.favorites]);

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
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cuisine Types */}
                <div>
                  <label className="block text-sm font-medium mb-2">Cuisine</label>
                  <select
                    multiple
                    value={filters.cuisineTypes}
                    onChange={(e) => updateFilters({
                      cuisineTypes: Array.from(e.target.selectedOptions, option => option.value as CuisineType)
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
                      dietary: Array.from(e.target.selectedOptions, option => option.value)
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
            </motion.div>
          )}
        </AnimatePresence>
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

// Constants
const cuisineTypes = {
  italian: 'Italian',
  japanese: 'Japanese',
  mexican: 'Mexican',
  indian: 'Indian',
  chinese: 'Chinese',
  mediterranean: 'Mediterranean',
  french: 'French',
  thai: 'Thai',
  vietnamese: 'Vietnamese',
  korean: 'Korean'
};

const mealTypes = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'dessert'
];

const dietaryOptions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'low-carb',
  'keto',
  'paleo'
]; 