"use client"

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cuisines } from '@/data/cuisines';
import { getMealPeriod, getSeason, getRecommendations } from '@/utils/timeUtils';
import type { FilterOptions, NutritionPreferences, Dish } from '@/types';
import FilterSection from './components/FilterSection';
import CuisineGroup from './components/CuisineGroup';

const DEFAULT_FILTERS: FilterOptions = {
  dietary: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  },
  time: {
    quick: false,
    medium: false,
    long: false,
  },
  spice: {
    mild: false,
    medium: false,
    spicy: false,
  },
  temperature: {
    hot: false,
    cold: false,
  },
};

const DEFAULT_NUTRITION_PREFS: NutritionPreferences = {
  lowCalorie: false,
  highProtein: false,
  lowCarb: false,
};

export default function FoodRecommender() {
  // Initialize with default values
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mealTime, setMealTime] = useState<string>('');
  const [season, setSeason] = useState<string>('');

  // Filter states
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [nutritionPrefs, setNutritionPrefs] = useState<NutritionPreferences>(DEFAULT_NUTRITION_PREFS);

  // UI states
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [recommendationsByCuisine, setRecommendationsByCuisine] = useState<Record<string, Dish[]>>({});

  // Move all time-related operations to useEffect
  useEffect(() => {
    const now = new Date();
    setCurrentTime(now);
    setMealTime(getMealPeriod(now.getHours()));
    setSeason(getSeason(now.getMonth()));

    // Set up interval for updating time
    const interval = setInterval(() => {
      const current = new Date();
      setCurrentTime(current);
      setMealTime(getMealPeriod(current.getHours()));
      setSeason(getSeason(current.getMonth()));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Filter dishes based on user preferences
  const filterDishes = (dishes: Dish[]): Dish[] => {
    const filtered = dishes.filter(dish => {
      // Apply strict filters only if we have enough dishes
      const strictFiltering = dishes.length > 2;
      
      // Dietary Filters (always apply these)
      if (filters.dietary.vegetarian && dish.ingredients.some(ing => 
        ing.category === 'protein' && 
        ['meat', 'fish', 'seafood'].includes(ing.name.toLowerCase())
      )) return false;

      if (filters.dietary.vegan && dish.ingredients.some(ing => 
        ['dairy', 'egg', 'meat', 'fish', 'seafood'].includes(ing.category.toLowerCase())
      )) return false;

      // Apply other filters only if we have enough dishes
      if (strictFiltering) {
        // Time Filters
        if (Object.values(filters.time).some(v => v)) {
          const timeInMinutes = parseInt(dish.timeToMake);
          const isQuick = timeInMinutes <= 30;
          const isMedium = timeInMinutes > 30 && timeInMinutes <= 60;
          const isLong = timeInMinutes > 60;

          if (filters.time.quick && !isQuick) return false;
          if (filters.time.medium && !isMedium) return false;
          if (filters.time.long && !isLong) return false;
        }

        // Nutrition Filters
        if (nutritionPrefs.lowCalorie && dish.nutrition.calories > 400) return false;
        if (nutritionPrefs.highProtein && dish.nutrition.protein < 25) return false;
        if (nutritionPrefs.lowCarb && dish.nutrition.carbs > 30) return false;
      }

      return true;
    });

    return filtered;
  };

  // Update recommendations when filters or time changes
  useEffect(() => {
    if (!mealTime || !season) return;

    console.log('Current mealTime:', mealTime);
    console.log('Current season:', season);
    
    const cuisinesToShow = selectedCuisines.length > 0 
      ? selectedCuisines 
      : Object.keys(cuisines);

    const newRecommendations: Record<string, Dish[]> = {};

    cuisinesToShow.forEach(cuisineId => {
      // Try different combinations until we get at least 2 dishes
      let dishes: Dish[] = [];
      
      // First try exact season and mealTime
      dishes = getRecommendations(mealTime, season, cuisineId);
      
      // If not enough dishes, try 'all' season
      if (dishes.length < 2) {
        const allSeasonDishes = getRecommendations(mealTime, 'all', cuisineId);
        dishes = [...new Set([...dishes, ...allSeasonDishes])];
      }
      
      // If still not enough, try adjacent meal times
      if (dishes.length < 2) {
        const adjacentMeals = getAdjacentMealTimes(mealTime);
        for (const adjacentMeal of adjacentMeals) {
          if (dishes.length >= 2) break;
          const adjacentDishes = getRecommendations(adjacentMeal, season, cuisineId);
          const allSeasonAdjacentDishes = getRecommendations(adjacentMeal, 'all', cuisineId);
          dishes = [...new Set([...dishes, ...adjacentDishes, ...allSeasonAdjacentDishes])];
        }
      }

      console.log(`Found ${dishes.length} dishes for ${cuisineId}`);
      
      // Only add cuisine if we found at least 2 dishes
      if (dishes.length >= 2) {
        newRecommendations[cuisineId] = dishes;
      }
    });

    console.log('Final recommendations:', newRecommendations);
    setRecommendationsByCuisine(newRecommendations);
  }, [mealTime, season, selectedCuisines, filters, nutritionPrefs]);

  // Helper function to get adjacent meal times
  const getAdjacentMealTimes = (currentMeal: string): string[] => {
    const mealTimes = ['breakfast', 'lunch', 'dinner'];
    const currentIndex = mealTimes.indexOf(currentMeal);
    
    if (currentIndex === -1) return [];
    
    const adjacent: string[] = [];
    if (currentIndex > 0) adjacent.push(mealTimes[currentIndex - 1]);
    if (currentIndex < mealTimes.length - 1) adjacent.push(mealTimes[currentIndex + 1]);
    
    return adjacent;
  };

  // Reset all filters
  const resetAll = () => {
    setSelectedCuisines([]);
    setFilters(DEFAULT_FILTERS);
    setNutritionPrefs(DEFAULT_NUTRITION_PREFS);
  };

  // Add handler functions for the filters
  const handleFilterChange = (category: keyof FilterOptions, key: string, value: boolean) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleNutritionChange = (key: keyof NutritionPreferences, value: boolean) => {
    setNutritionPrefs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Render time display
  const timeDisplay = currentTime 
    ? `${currentTime.toLocaleTimeString()} - ${mealTime.charAt(0).toUpperCase() + mealTime.slice(1)} Time`
    : 'Loading...';

  const seasonDisplay = season
    ? `${season.charAt(0).toUpperCase() + season.slice(1)} Season Recommendations`
    : 'Loading...';

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">What To Eat Next</h1>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Clock className="w-5 h-5" />
          <span>{timeDisplay}</span>
        </div>
        <p className="text-gray-500 mt-1">{seasonDisplay}</p>
      </div>

      <FilterSection
        selectedCuisines={selectedCuisines}
        setSelectedCuisines={setSelectedCuisines}
        filters={filters}
        setFilters={setFilters}
        nutritionPrefs={nutritionPrefs}
        setNutritionPrefs={setNutritionPrefs}
        resetAll={resetAll}
      />

      <div className="space-y-6">
        {Object.entries(recommendationsByCuisine).map(([cuisineId, dishes]) => (
          <CuisineGroup
            key={cuisineId}
            cuisineName={cuisines[cuisineId].name}
            recipes={dishes}
            expandedRecipe={expandedRecipe}
            setExpandedRecipe={setExpandedRecipe}
          />
        ))}
        {Object.keys(recommendationsByCuisine).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Try adjusting your filters to see more recommendations.
          </div>
        )}
      </div>
    </div>
  );
}