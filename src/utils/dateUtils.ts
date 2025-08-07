import { cuisines } from "@/data/cuisines";
import { log } from '@/services/LoggingService';
import type { Dish } from "@/types";
import type { LunarPhaseWithSpaces, Season } from '@/types/alchemy';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (_message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // log.info(message, ...args);
};

/**
 * Get the current season based on the month
 * @returns Season as a lowercase string ('spring', 'summer', 'fall', or 'winter')
 */
export function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const now = new Date();
  const month = now.getMonth();
  
  // Astronomical seasons (approximate dates)
  if (month >= 2 && month <= 4) return 'spring';  // March 20 - June 20
  if (month >= 5 && month <= 7) return 'summer';  // June 21 - September 21
  if (month >= 8 && month <= 10) return 'fall';   // September 22 - December 20
  return 'winter';                                // December 21 - March 19
}

/**
 * Get the season based on a specific month
 * @param month Month (0-11)
 * @returns Season
 */
export const getSeason = (month: number): Season => {
  if ([11, 0, 1].includes(month)) return "winter";
  if ([2, 3, 4].includes(month)) return "spring";
  if ([5, 6, 7].includes(month)) return "summer";
  return "fall";
};

/**
 * Calculate the day of year (1-366)
 * @param date Date to calculate day of year for
 * @returns Day of year (1-366)
 */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get the current time of day
 * @returns Time of day ('morning', 'afternoon', 'evening', or 'night')
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get the meal period based on the hour
 * @param hour Hour (0-23)
 * @returns Meal period
 */
export const getMealPeriod = (hour: number): string => {
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 23) return "dinner";
  return "breakfast";
};

/**
 * Get the current moon phase using a simplified calculation
 * @returns Moon phase as a string with spaces
 */
export function getMoonPhase(): LunarPhaseWithSpaces {
  // Calculate moon age (in days) from the latest known new moon
  // April 2024 new moon was on April 8, 2024
  const LATEST_NEW_MOON = new Date(2024, 3, 8).getTime(); // April 8, 2024
  const LUNAR_MONTH = 29.53059; // days
  
  const now = new Date().getTime();
  const daysSinceNewMoon = (now - LATEST_NEW_MOON) / (1000 * 60 * 60 * 24);
  const lunarAge = daysSinceNewMoon % LUNAR_MONTH;
  
  debugLog(`Calculated lunar age: ${lunarAge.toFixed(2)} days`);
  
  // Determine phase based on lunar age
  if (lunarAge < 1.84) return 'new moon';
  if (lunarAge < 7.38) return 'waxing crescent';
  if (lunarAge < 10.35) return 'first quarter';
  if (lunarAge < 13.69) return 'waxing gibbous';
  if (lunarAge < 16.69) return 'full moon'; 
  if (lunarAge < 20.03) return 'waning gibbous';
  if (lunarAge < 23.01) return 'last quarter';
  if (lunarAge < 28.53) return 'waning crescent';
  return 'new moon';
}

// Helper function to get all dishes for a cuisine
const _getAllDishesForCuisine = (cuisineId: string): Dish[] => {
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
          allDishes = [...allDishes, ...seasonDishes as unknown as Dish[]];
        }
      });
    }
  });

  return allDishes;
};

/**
 * Get food recommendations based on meal time, season, and cuisine
 * @param mealTime Meal time ('breakfast', 'lunch', 'dinner')
 * @param season Season
 * @param cuisineId Cuisine ID
 * @returns Array of dishes
 */
export const getRecommendations = (mealTime: string, season: Season, cuisineId: string): Dish[] => {
  try {
    debugLog(`Getting recommendations for: ${cuisineId}, ${mealTime}, ${season}`);
    
    const cuisine = cuisines[cuisineId];
    if (!cuisine || !cuisine.dishes) {
      debugLog(`Cuisine ${cuisineId} not found or has no dishes`);
      return [];
    }

    const mealTimeDishes = cuisine.dishes[mealTime];
    if (!mealTimeDishes) {
      debugLog(`No ${mealTime} dishes found for ${cuisineId}`);
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
    debugLog(`Found ${combinedDishes.length} dishes for ${cuisineId}`);
    
    return combinedDishes as unknown as Dish[];
  } catch (error) {
    console.error(`Error getting recommendations for ${cuisineId}:`, error);
    return [];
  }
}; 