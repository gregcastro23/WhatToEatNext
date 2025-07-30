'use client';

import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useServices } from '@/hooks/useServices';
import type { CuisineType, DietaryRestriction } from '@/types/alchemy';
import { logger } from '@/utils/logger';

export interface FilterState {
  search: string;
  cuisineTypes: CuisineType[];
  mealType: string[];
  dietary: DietaryRestriction[];
  maxTime: number | undefined;
  spiciness: string | null;
  complexity: string | null;
}

export const initialFilters: FilterState = {
  search: '',
  cuisineTypes: [],
  mealType: [],
  dietary: [],
  maxTime: undefined,
  spiciness: null,
  complexity: null
};

interface RecipeFiltersProps {
  filters: FilterState;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

/**
 * RecipeFilters Component - Migrated Version
 * 
 * This component handles the filtering UI for recipes, including:
 * - Search input
 * - Filter panel toggle
 * - Cuisine type selection
 * - Meal type selection
 * - Dietary restriction selection
 * 
 * It has been migrated from context-based data access to service-based architecture.
 */
export default function RecipeFiltersMigrated({
  filters,
  updateFilters,
  resetFilters,
  showFilters,
  setShowFilters
}: RecipeFiltersProps) {
  // Services
  const { 
    isLoading: servicesLoading, 
    error: servicesError, 
    recipeService
  } = useServices();

  // Local state for reference data
  const [availableCuisines, setAvailableCuisines] = useState<Record<string, boolean>>({});
  const [availableMealTypes, setAvailableMealTypes] = useState<string[]>([]);
  const [availableDietaryOptions, setAvailableDietaryOptions] = useState<DietaryRestriction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Handle search
  const handleSearch = (value: string) => {
    updateFilters({ search: value });
  };

  // Load reference data (cuisines, meal types, dietary options) from services
  useEffect(() => {
    if (servicesLoading || !recipeService) {
      return;
    }

    const loadReferenceData = async () => {
      setIsLoading(true);
      try {
        // Apply surgical type casting with variable extraction
        const serviceData = recipeService as any;
        
        // Get all cuisines
        const getCuisineTypesMethod = serviceData?.getCuisineTypes;
        const cuisines = getCuisineTypesMethod ? await getCuisineTypesMethod() : [];
        const cuisineMap = cuisines.reduce((acc, cuisine) => {
          acc[cuisine] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setAvailableCuisines(cuisineMap);

        // Get meal types
        const getMealTypesMethod = serviceData?.getMealTypes;
        const mealTypes = getMealTypesMethod ? await getMealTypesMethod() : [];
        setAvailableMealTypes(mealTypes);

        // Get dietary options
        const getDietaryRestrictionsMethod = serviceData?.getDietaryRestrictions;
        const dietaryOptions = getDietaryRestrictionsMethod ? await getDietaryRestrictionsMethod() : [];
        setAvailableDietaryOptions(dietaryOptions);
        
        setError(null);
      } catch (err) {
        logger.error('Error loading reference data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load filter options'));
        
        // Use defaults if there's an error
        setAvailableCuisines({
          'Italian': true,
          'Mexican': true,
          'Chinese': true,
          'Japanese': true,
          'Indian': true,
          'Thai': true,
          'Mediterranean': true,
          'American': true,
          'French': true
        });
        setAvailableMealTypes([
          'Breakfast',
          'Lunch',
          'Dinner',
          'Dessert',
          'Snack'
        ]);
        setAvailableDietaryOptions([
          'vegetarian',
          'vegan',
          'gluten-free',
          'dAiry-free',
          'keto',
          'paleo',
          'low-carb',
          'low-fat'
        ] as unknown as DietaryRestriction[]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadReferenceData();
  }, [servicesLoading, recipeService]);

  // Handle loading state
  if (servicesLoading || isLoading) {
    return (
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <div className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100 animate-pulse h-10"></div>
          </div>
          <div className="px-4 py-2 bg-gray-100 rounded-lg h-10 w-24 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (servicesError || error) {
    return (
      <div className="mb-6 space-y-4">
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">Error loading filter options: {(servicesError || error)?.message}</p>
        </div>
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
      </div>
    );
  }

  return (
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
                {Object.keys(availableCuisines || {}).map(cuisine => (
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
                {(availableMealTypes || []).map(type => (
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
                {(availableDietaryOptions || []).map(option => (
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
  );
} 