// src/utils/timeUtils.ts

import { cuisines } from "@/data/cuisines";
import type { Dish } from "@/types";
import type { Season } from "@/types/alchemy";

export const getMealPeriod = (hour: number): string => {
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 23) return "dinner";
  return "breakfast";
};

export const getSeason = (month: number): Season => {
  if ([11, 0, 1].includes(month)) return "winter";
  if ([2, 3, 4].includes(month)) return "spring";
  if ([5, 6, 7].includes(month)) return "summer";
  return "fall";
};

// Helper function to get all dishes for a cuisine
const getAllDishesForCuisine = (cuisineId: string): Dish[] => {
  const cuisine = cuisines[cuisineId];
  if (!cuisine || !cuisine.dishes) return [];

  let allDishes: Dish[] = [];

  // Safely iterate through all meal times with type checking
  Object.keys(cuisine.dishes || {}).forEach(mealTime => {
    const mealTimeDishes = cuisine.dishes?.[mealTime];
    if (!mealTimeDishes) return;
    
    // If it's an object with season keys
    if (typeof mealTimeDishes === 'object' && !Array.isArray(mealTimeDishes)) {
      // Get dishes from all seasons including 'all' season
      Object.keys(mealTimeDishes).forEach(season => {
        const seasonDishes = mealTimeDishes[season];
        if (Array.isArray(seasonDishes)) {
          allDishes = [...allDishes, ...seasonDishes];
        }
      });
    }
  });

  return allDishes;
};

export const getRecommendations = (mealTime: string, season: Season, cuisineId: string): Dish[] => {
  try {
    console.log(`Getting recommendations for: ${cuisineId}, ${mealTime}, ${season}`);
    
    const cuisine = cuisines[cuisineId];
    if (!cuisine || !cuisine.dishes) {
      console.log(`Cuisine ${cuisineId} not found or has no dishes`);
      return [];
    }

    const mealTimeDishes = cuisine.dishes?.[mealTime];
    if (!mealTimeDishes) {
      console.log(`No ${mealTime} dishes found for ${cuisineId}`);
      return [];
    }

    // If mealTimeDishes is an array, return it directly
    if (Array.isArray(mealTimeDishes)) {
      return mealTimeDishes;
    }

    // Get dishes from both 'all' season and current season
    const allSeasonDishes = Array.isArray(mealTimeDishes['all']) ? mealTimeDishes['all'] : [];
    const seasonalDishes = Array.isArray(mealTimeDishes[season]) ? mealTimeDishes[season] : [];
    
    const combinedDishes = [...allSeasonDishes, ...seasonalDishes];
    console.log(`Found ${combinedDishes.length} dishes for ${cuisineId}`);
    
    return combinedDishes;
  } catch (error) {
    console.error(`Error getting recommendations for ${cuisineId}:`, error);
    return [];
  }
};