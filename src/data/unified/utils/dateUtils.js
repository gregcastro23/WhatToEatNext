import { cuisines } from "../data/cuisines";

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message, ...args) => {
    // Comment out console.log to avoid linting warnings
    // console.log(message, ...args);
};

/**
 * Get the current season based on the current date
 * Uses meteorological seasons (Dec-Feb: Winter, Mar-May: Spring, etc.)
 */
export function getCurrentSeason() {
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

/**
 * Get season for a specific date
 */
export function getSeasonForDate(date) {
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

/**
 * Check if a date is in a specific season
 */
export function isInSeason(date, season) {
    return getSeasonForDate(date) === season;
}

/**
 * Get the next season
 */
export function getNextSeason(currentSeason) {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(currentSeason);
    return seasons[(currentIndex + 1) % 4];
}

/**
 * Get the previous season
 */
export function getPreviousSeason(currentSeason) {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const currentIndex = seasons.indexOf(currentSeason);
    return seasons[(currentIndex - 1 + 4) % 4];
}

/**
 * Get the season based on a specific month
 * @param month Month (0-11)
 * @returns Season
 */
export const getSeason = (month) => {
    if ([11, 0, 1].includes(month))
        return "winter";
    if ([2, 3, 4].includes(month))
        return "spring";
    if ([5, 6, 7].includes(month))
        return "summer";
    return "fall";
};

/**
 * Calculate the day of year (1-366)
 * @param date Date to calculate day of year for
 * @returns Day of year (1-366)
 */
export function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get the current time of day
 * @returns Time of day ('morning', 'afternoon', 'evening', or 'night')
 */
export function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12)
        return 'morning';
    if (hour >= 12 && hour < 17)
        return 'afternoon';
    if (hour >= 17 && hour < 22)
        return 'evening';
    return 'night';
}

/**
 * Get the meal period based on the hour
 * @param hour Hour (0-23)
 * @returns Meal period
 */
export const getMealPeriod = (hour) => {
    if (hour >= 5 && hour < 11)
        return "breakfast";
    if (hour >= 11 && hour < 16)
        return "lunch";
    if (hour >= 16 && hour < 23)
        return "dinner";
    return "breakfast";
};

/**
 * Get the current Moon phase using a simplified calculation
 * @returns Moon phase as a string with spaces
 */
export function getmoonPhase() {
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

// Helper function to get all dishes for a cuisine
const getAllDishesForCuisine = (cuisineId) => {
    const cuisine = cuisines[cuisineId];
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
export const getRecommendations = (mealTime, season, cuisineId) => {
    try {
        debugLog(`Getting recommendations for: ${cuisineId}, ${mealTime}, ${season}`);
        
        const cuisine = cuisines[cuisineId];
        if (!cuisine) {
            debugLog(`Cuisine not found: ${cuisineId}`);
            return [];
        }

        const dishes = cuisine.dishes?.[mealTime];
        if (!dishes) {
            debugLog(`No dishes found for meal time: ${mealTime}`);
            return getAllDishesForCuisine(cuisineId);
        }

        // If dishes is an object with season keys
        if (typeof dishes === 'object' && !Array.isArray(dishes)) {
            // Try to get dishes for the specific season
            let seasonDishes = dishes[season];
            
            // If no dishes for specific season, try 'all' season
            if (!seasonDishes || seasonDishes.length === 0) {
                seasonDishes = dishes['all'];
            }
            
            // If still no dishes, get dishes from any available season
            if (!seasonDishes || seasonDishes.length === 0) {
                const availableSeasons = Object.keys(dishes);
                if (availableSeasons.length > 0) {
                    seasonDishes = dishes[availableSeasons[0]];
                }
            }
            
            return seasonDishes || [];
        }
        
        // If dishes is a direct array
        return Array.isArray(dishes) ? dishes : [];
        
    } catch (error) {
        debugLog(`Error getting recommendations: ${error.message}`);
        return [];
    }
};
