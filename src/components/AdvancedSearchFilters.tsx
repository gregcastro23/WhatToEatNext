'use client';

import { Search, Filter, X, Clock, ChefHat, Utensils, Globe } from 'lucide-react';
import React, { useState, useCallback, useMemo } from 'react';

// ========== INTERFACES ==========

export interface SearchFilters {
  query: string;
  dietaryRestrictions: string[];
  difficultyLevel: string[];
  cookingTime: {
    min: number;
    max: number;
  };
  cuisineTypes: string[];
  mealTypes: string[];
  spiciness: string[];
  ingredients: string[];
}

export interface FilterChip {
  id: string;
  label: string;
  category: string;
  value: string | number;
  removable: boolean;
}

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (query: string) => void;
  availableCuisines?: string[];
  className?: string;
}

// ========== CONSTANTS ==========

const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'low-carb',
  'keto',
  'paleo',
  'halal',
  'kosher',
];

const DIFFICULTY_LEVELS = ['beginner', 'easy', 'medium', 'hard', 'expert'];

const COOKING_TIME_RANGES = [
  { label: 'Quick (< 30 min)', min: 0, max: 30 },
  { label: 'Medium (30-60 min)', min: 30, max: 60 },
  { label: 'Long (1-2 hours)', min: 60, max: 120 },
  { label: 'Extended (2+ hours)', min: 120, max: 480 },
];

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'dessert', 'beverage'];

const SPICINESS_LEVELS = ['mild', 'medium', 'hot', 'very-hot'];

const DEFAULT_CUISINES = [
  'italian',
  'chinese',
  'japanese',
  'indian',
  'thai',
  'mexican',
  'french',
  'mediterranean',
  'middle-eastern',
  'korean',
  'vietnamese',
  'greek',
];

// ========== COMPONENT ==========

export default function AdvancedSearchFilters({
  onFiltersChange,
  onSearch,
  availableCuisines = DEFAULT_CUISINES,
  className = '',
}: AdvancedSearchFiltersProps) {
  // ========== STATE ==========

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dietaryRestrictions: [],
    difficultyLevel: [],
    cookingTime: { min: 0, max: 480 },
    cuisineTypes: [],
    mealTypes: [],
    spiciness: [],
    ingredients: [],
  });

  // ========== MEMOIZED VALUES ==========

  const activeFilters = useMemo(() => {
    const chips: FilterChip[] = [];

    // Dietary restrictions
    filters.dietaryRestrictions.forEach(restriction => {
      chips.push({
        id: `dietary-${restriction}`,
        label: restriction.charAt(0).toUpperCase() + restriction.slice(1),
        category: 'Dietary',
        value: restriction,
        removable: true,
      });
    });

    // Difficulty levels
    filters.difficultyLevel.forEach(level => {
      chips.push({
        id: `difficulty-${level}`,
        label: level.charAt(0).toUpperCase() + level.slice(1),
        category: 'Difficulty',
        value: level,
        removable: true,
      });
    });

    // Cooking time
    if (filters.cookingTime.min > 0 || filters.cookingTime.max < 480) {
      chips.push({
        id: 'cooking-time',
        label: `${filters.cookingTime.min}-${filters.cookingTime.max} min`,
        category: 'Time',
        value: `${filters.cookingTime.min}-${filters.cookingTime.max}`,
        removable: true,
      });
    }

    // Cuisine types
    filters.cuisineTypes.forEach(cuisine => {
      chips.push({
        id: `cuisine-${cuisine}`,
        label: cuisine.charAt(0).toUpperCase() + cuisine.slice(1),
        category: 'Cuisine',
        value: cuisine,
        removable: true,
      });
    });

    // Meal types
    filters.mealTypes.forEach(meal => {
      chips.push({
        id: `meal-${meal}`,
        label: meal.charAt(0).toUpperCase() + meal.slice(1),
        category: 'Meal',
        value: meal,
        removable: true,
      });
    });

    // Spiciness
    filters.spiciness.forEach(spice => {
      chips.push({
        id: `spice-${spice}`,
        label: spice.charAt(0).toUpperCase() + spice.slice(1),
        category: 'Spice',
        value: spice,
        removable: true,
      });
    });

    return chips;
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return activeFilters.length > 0 || searchQuery.trim().length > 0;
  }, [activeFilters, searchQuery]);

  // ========== EVENT HANDLERS ==========

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      const updatedFilters = { ...filters, query: value };
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(searchQuery);
    },
    [searchQuery, onSearch],
  );

  const handleFilterToggle = useCallback(
    (category: keyof SearchFilters, value: string) => {
      const updatedFilters = { ...filters };

      if (Array.isArray(updatedFilters[category])) {
        const currentArray = updatedFilters[category] as string[];
        const index = currentArray.indexOf(value);

        if (index > -1) {
          currentArray.splice(index, 1);
        } else {
          currentArray.push(value);
        }
      }

      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  const handleTimeRangeChange = useCallback(
    (min: number, max: number) => {
      const updatedFilters = {
        ...filters,
        cookingTime: { min, max },
      };
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  const handleRemoveFilter = useCallback(
    (chipId: string) => {
      const updatedFilters = { ...filters };

      if (chipId.startsWith('dietary-')) {
        const value = chipId.replace('dietary-', '');
        updatedFilters.dietaryRestrictions = updatedFilters.dietaryRestrictions.filter(
          r => r !== value,
        );
      } else if (chipId.startsWith('difficulty-')) {
        const value = chipId.replace('difficulty-', '');
        updatedFilters.difficultyLevel = updatedFilters.difficultyLevel.filter(d => d !== value);
      } else if (chipId === 'cooking-time') {
        updatedFilters.cookingTime = { min: 0, max: 480 };
      } else if (chipId.startsWith('cuisine-')) {
        const value = chipId.replace('cuisine-', '');
        updatedFilters.cuisineTypes = updatedFilters.cuisineTypes.filter(c => c !== value);
      } else if (chipId.startsWith('meal-')) {
        const value = chipId.replace('meal-', '');
        updatedFilters.mealTypes = updatedFilters.mealTypes.filter(m => m !== value);
      } else if (chipId.startsWith('spice-')) {
        const value = chipId.replace('spice-', '');
        updatedFilters.spiciness = updatedFilters.spiciness.filter(s => s !== value);
      }

      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    },
    [filters, onFiltersChange],
  );

  const handleClearAllFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      dietaryRestrictions: [],
      difficultyLevel: [],
      cookingTime: { min: 0, max: 480 },
      cuisineTypes: [],
      mealTypes: [],
      spiciness: [],
      ingredients: [],
    };

    setSearchQuery('');
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  }, [onFiltersChange]);

  // ========== RENDER HELPERS ==========

  const renderFilterSection = (
    title: string,
    icon: React.ReactNode,
    options: string[],
    selectedValues: string[],
    category: keyof SearchFilters,
  ) => (
    <div className='mb-4'>
      <div className='mb-2 flex items-center space-x-2'>
        {icon}
        <h4 className='text-sm font-medium text-gray-700'>{title}</h4>
      </div>
      <div className='flex flex-wrap gap-2'>
        {options.map(option => (
          <button
            key={option}
            onClick={() => handleFilterToggle(category, option)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              selectedValues.includes(option)
                ? 'border-blue-300 bg-blue-100 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTimeRangeSection = () => (
    <div className='mb-4'>
      <div className='mb-2 flex items-center space-x-2'>
        <Clock size={16} className='text-gray-500' />
        <h4 className='text-sm font-medium text-gray-700'>Cooking Time</h4>
      </div>
      <div className='flex flex-wrap gap-2'>
        {COOKING_TIME_RANGES.map(range => (
          <button
            key={range.label}
            onClick={() => handleTimeRangeChange(range.min, range.max)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              filters.cookingTime.min === range.min && filters.cookingTime.max === range.max
                ? 'border-blue-300 bg-blue-100 text-blue-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ========== RENDER ==========

  return (
    <div className={`rounded-lg border bg-white ${className}`}>
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className='border-b p-4'>
        <div className='relative'>
          <Search
            size={20}
            className='absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400'
          />
          <input
            type='text'
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder='Search cuisines, recipes, or ingredients...'
            className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500'
          />
          <button
            type='button'
            onClick={() => setIsExpanded(!isExpanded)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transform rounded p-1 transition-colors ${
              isExpanded ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label='Toggle filters'
            title='Toggle filters'
          >
            <Filter size={16} />
          </button>
        </div>
      </form>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className='border-b bg-gray-50 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm font-medium text-gray-700'>Active Filters</span>
            <button
              onClick={handleClearAllFilters}
              className='text-xs text-gray-500 hover:text-gray-700'
            >
              Clear All
            </button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {activeFilters.map(chip => (
              <div
                key={chip.id}
                className='flex items-center space-x-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700'
              >
                <span className='text-xs text-blue-500'>{chip.category}:</span>
                <span>{chip.label}</span>
                {chip.removable && (
                  <button
                    onClick={() => handleRemoveFilter(chip.id)}
                    className='ml-1 text-blue-500 hover:text-blue-700'
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className='space-y-4 p-4'>
          {/* Dietary Restrictions */}
          {renderFilterSection(
            'Dietary Restrictions',
            <Utensils size={16} className='text-green-500' />,
            DIETARY_RESTRICTIONS,
            filters.dietaryRestrictions,
            'dietaryRestrictions',
          )}

          {/* Difficulty Level */}
          {renderFilterSection(
            'Difficulty Level',
            <ChefHat size={16} className='text-orange-500' />,
            DIFFICULTY_LEVELS,
            filters.difficultyLevel,
            'difficultyLevel',
          )}

          {/* Cooking Time */}
          {renderTimeRangeSection()}

          {/* Cuisine Types */}
          {renderFilterSection(
            'Cuisine Types',
            <Globe size={16} className='text-purple-500' />,
            availableCuisines,
            filters.cuisineTypes,
            'cuisineTypes',
          )}

          {/* Meal Types */}
          {renderFilterSection(
            'Meal Types',
            <Utensils size={16} className='text-blue-500' />,
            MEAL_TYPES,
            filters.mealTypes,
            'mealTypes',
          )}

          {/* Spiciness */}
          {renderFilterSection(
            'Spiciness Level',
            <span className='text-red-500'>🌶️</span>,
            SPICINESS_LEVELS,
            filters.spiciness,
            'spiciness',
          )}
        </div>
      )}
    </div>
  );
}
