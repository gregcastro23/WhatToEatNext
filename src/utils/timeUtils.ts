// src/utils/timeUtils.ts

import { cuisines } from "@/data/cuisines";
import type { Dish } from "@/types";
import type { Season } from "@/data/seasons";

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
  return "autumn";
};

// Helper function to get all dishes for a cuisine
const getAllDishesForCuisine = (cuisineId: string): Dish[] => {
  const cuisine = cuisines[cuisineId];
  if (!cuisine) return [];

  let allDishes: Dish[] = [];

  // Iterate through all meal times
  Object.keys(cuisine.dishes).forEach(mealTime => {
    // Get dishes from all seasons including 'all' season
    Object.keys(cuisine.dishes[mealTime]).forEach(season => {
      allDishes = [...allDishes, ...cuisine.dishes[mealTime][season]];
    });
  });

  return allDishes;
};

export const getRecommendations = (mealTime: string, season: Season, cuisineId: string): Dish[] => {
  try {
    console.log(`Getting recommendations for: ${cuisineId}, ${mealTime}, ${season}`);
    
    const cuisine = cuisines[cuisineId];
    if (!cuisine) {
      console.log(`Cuisine ${cuisineId} not found`);
      return [];
    }

    if (!cuisine.dishes?.[mealTime]) {
      console.log(`No ${mealTime} dishes found for ${cuisineId}`);
      return [];
    }

    // Get dishes from both 'all' season and current season
    const allSeasonDishes = cuisine.dishes[mealTime]['all'] || [];
    const seasonalDishes = cuisine.dishes[mealTime][season] || [];
    
    const combinedDishes = [...allSeasonDishes, ...seasonalDishes];
    console.log(`Found ${combinedDishes.length} dishes for ${cuisineId}`);
    
    return combinedDishes;
  } catch (error) {
    console.error(`Error getting recommendations for ${cuisineId}:`, error);
    return [];
  }
};