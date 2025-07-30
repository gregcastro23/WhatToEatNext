"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = exports.getmoonPhase = exports.getMealPeriod = exports.getTimeOfDay = exports.getDayOfYear = exports.getSeason = exports.getPreviousSeason = exports.getNextSeason = exports.isInSeason = exports.getSeasonForDate = exports.getCurrentSeason = void 0;
import { log } from '@/services/LoggingService';
const cuisines_1 = require("../data/cuisines");
/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (_message, ...args) => {
    // Comment out console.log to avoid linting warnings
    // log.info(message, ...args);
};
/**
 * Get the current season based on the current date
 * Uses meteorological seasons (Dec-Feb: Winter, Mar-May: Spring, etc.)
 */
function getCurrentSeason() {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    if (month >= 2 && month <= 4) {
        return 'spring'; // March, April, May
    }
    else if (month >= 5 && month <= 7) {
        return 'summer'; // June, July, August
    }
    else if (month >= 8 && month <= 10) {
        return 'autumn'; // September, October, November
    }
    else {
        return 'winter'; // December, January, February
    }
}
exports.getCurrentSeason = getCurrentSeason;
/**
 * Get season for a specific date
 */
function getSeasonForDate(date) {
    const month = date.getMonth(); // 0-11
    if (month >= 2 && month <= 4) {
        return 'spring';
    }
    else if (month >= 5 && month <= 7) {
        return 'summer';
    }
    else if (month >= 8 && month <= 10) {
        return 'autumn';
    }
    else {
        return 'winter';
    }
}
exports.getSeasonForDate = getSeasonForDate;
/**
 * Check if a date is in a specific season
 */
function isInSeason(date, season) {
    return getSeasonForDate(date) === season;
}
exports.isInSeason = isInSeason;
/**
 * Get the next season
 */
function getNextSeason(currentSeason) {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(currentSeason);
    return seasons[(currentIndex + 1) % 4];
}
exports.getNextSeason = getNextSeason;
/**
 * Get the previous season
 */
function getPreviousSeason(currentSeason) {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(currentSeason);
    return seasons[(currentIndex - 1 + 4) % 4];
}
exports.getPreviousSeason = getPreviousSeason;
/**
 * Get the season based on a specific month
 * @param month Month (0-11)
 * @returns Season
 */
const getSeason = (month) => {
    if ([11, 0, 1].includes(month))
        return "winter";
    if ([2, 3, 4].includes(month))
        return "spring";
    if ([5, 6, 7].includes(month))
        return "summer";
    return "fall";
};
exports.getSeason = getSeason;
/**
 * Calculate the day of year (1-366)
 * @param date Date to calculate day of year for
 * @returns Day of year (1-366)
 */
function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
exports.getDayOfYear = getDayOfYear;
/**
 * Get the current time of day
 * @returns Time of day ('morning', 'afternoon', 'evening', or 'night')
 */
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12)
        return 'morning';
    if (hour >= 12 && hour < 17)
        return 'afternoon';
    if (hour >= 17 && hour < 22)
        return 'evening';
    return 'night';
}
exports.getTimeOfDay = getTimeOfDay;
/**
 * Get the meal period based on the hour
 * @param hour Hour (0-23)
 * @returns Meal period
 */
const getMealPeriod = (hour) => {
    if (hour >= 5 && hour < 11)
        return "breakfast";
    if (hour >= 11 && hour < 16)
        return "lunch";
    if (hour >= 16 && hour < 23)
        return "dinner";
    return "breakfast";
};
exports.getMealPeriod = getMealPeriod;
/**
 * Get the current Moon phase using a simplified calculation
 * @returns Moon phase as a string with spaces
 */
function getmoonPhase() {
    // Calculate Moon age (in days) from the latest known new Moon
    // April 2024 new Moon was on April 8, 2024
    const LATEST_NEW_moon = new Date(2024, 3, 8).getTime(); // April 8, 2024
    const LUNAR_MONTH = 29.53059; // days
    const now = new Date().getTime();
    const daysSinceNewmoon = (now - LATEST_NEW_moon) / (1000 * 60 * 60 * 24);
    const lunarAge = daysSinceNewmoon % LUNAR_MONTH;
    debugLog(`Calculated lunar age: ${lunarAge.toFixed(2)} days`);
    // Determine phase based on lunar age
    if (lunarAge < 1.84)
        return 'new moon';
    if (lunarAge < 7.38)
        return 'waxing crescent';
    if (lunarAge < 10.35)
        return 'first quarter';
    if (lunarAge < 13.69)
        return 'waxing gibbous';
    if (lunarAge < 16.69)
        return 'full moon';
    if (lunarAge < 20.03)
        return 'waning gibbous';
    if (lunarAge < 23.01)
        return 'last quarter';
    if (lunarAge < 28.53)
        return 'waning crescent';
    return 'new moon';
}
exports.getmoonPhase = getmoonPhase;
// Helper function to get all dishes for a cuisine
const getAllDishesForCuisine = (cuisineId) => {
    const cuisine = cuisines_1.cuisines[cuisineId];
    if (!cuisine || !cuisine.dishes)
        return [];
    let allDishes = [];
    // Safely iterate through all meal times with type checking
    Object.keys(cuisine.dishes || {}).forEach(mealTime => {
        const mealTimeDishes = cuisine.dishes?.[mealTime];
        if (!mealTimeDishes)
            return;
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
/**
 * Get food recommendations based on meal time, season, and cuisine
 * @param mealTime Meal time ('breakfast', 'lunch', 'dinner')
 * @param season Season
 * @param cuisineId Cuisine ID
 * @returns Array of dishes
 */
const getRecommendations = (mealTime, season, cuisineId) => {
    try {
        debugLog(`Getting recommendations for: ${cuisineId}, ${mealTime}, ${season}`);
        const cuisine = cuisines_1.cuisines[cuisineId];
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
        return combinedDishes;
    }
    catch (error) {
        console.error(`Error getting recommendations for ${cuisineId}:`, error);
        return [];
    }
};
exports.getRecommendations = getRecommendations;
