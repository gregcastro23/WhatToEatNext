import type { LunarPhaseWithSpaces, Season } from '@/types/alchemy';
import { cuisines } from "@/data/cuisines";
import type { Dish } from "@/types";

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * Get the current season based on the current date
 * Uses astronomical seasons based on equinoxes and solstices
 */
export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  
  // Approximate astronomical seasons for Northern Hemisphere
  // Spring: March 20 - June 20
  // Summer: June 21 - September 22
  // Fall/Autumn: September 23 - December 20
  // Winter: December 21 - March 19
  
  if ((month === 2 && day >= 20) || (month >= 3 && month <= 5) || (month === 5 && day <= 20)) {
    return 'spring';
  } else if ((month === 5 && day >= 21) || (month >= 6 && month <= 8) || (month === 8 && day <= 22)) {
    return 'summer';
  } else if ((month === 8 && day >= 23) || (month >= 9 && month <= 11) || (month === 11 && day <= 20)) {
    return 'fall';
  } else {
    return 'winter';
  }
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
 * Get time of day classification
 */
export function getTimeOfDay(date: Date = new Date()): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();
  
  if (hour >= 6 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
}

/**
 * Check if it's currently daytime
 */
export function isDaytime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
}

/**
 * Get day of year (1-366)
 */
export function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
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
 * Simple moon phase calculation (approximate)
 */
export function getMoonPhase(date: Date = new Date()): 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent' {
  // Simplified moon phase calculation
  // This is approximate and should be replaced with a proper astronomical calculation
  const knownNewMoon = new Date('2024-01-11'); // Known new moon date
  const lunarCycle = 29.53059; // Average lunar cycle in days
  
  const daysSinceNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
  
  if (phase < 1) return 'new';
  if (phase < 7.38) return 'waxing_crescent';
  if (phase < 8.38) return 'first_quarter';
  if (phase < 14.77) return 'waxing_gibbous';
  if (phase < 15.77) return 'full';
  if (phase < 22.15) return 'waning_gibbous';
  if (phase < 23.15) return 'last_quarter';
  return 'waning_crescent';
}

// Add type guard after imports
function isDishArray(value: unknown): value is Dish[] {
  return Array.isArray(value) && value.every(item => 
    typeof item === 'object' && item !== null && 'name' in item
  );
}

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
          allDishes = [...allDishes, ...(isDishArray(seasonDishes) ? seasonDishes : [])];
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

    const mealTimeDishes = cuisine.dishes?.[mealTime];
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
    
    return combinedDishes as Dish[];
  } catch (error) {
    // console.error(`Error getting recommendations for ${cuisineId}:`, error);
    return [];
  }
};

// Export all functions as a default object as well
export default {
  getCurrentSeason,
  getTimeOfDay,
  isDaytime,
  getDayOfYear,
  getMoonPhase
}; 