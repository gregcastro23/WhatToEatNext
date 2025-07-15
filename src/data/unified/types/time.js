"use strict";
const DAY_RULERS = {
    'Sunday': 'Sun',
    'Monday': 'Moon',
    'Tuesday': 'Mars',
    'Wednesday': 'Mercury',
    'Thursday': 'Jupiter',
    'Friday': 'Venus',
    'Saturday': 'Saturn'
};
// Chaldean order of planets used for planetary hours
const PLANETARY_HOUR_SEQUENCE = [
    'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'
];
// Add mapping from TimeOfDay to MealType
const TIME_TO_MEAL_MAPPING = {
    'Morning': 'Breakfast',
    'Afternoon': 'Lunch',
    'Evening': 'Dinner',
    'Night': 'Snack'
};
export function getTimeFactors() {
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    // Determine season (Northern Hemisphere)
    let season;
    if (month >= 2 && month <= 4) {
        season = 'spring';
    }
    else if (month >= 5 && month <= 7) {
        season = 'summer';
    }
    else if (month >= 8 && month <= 10) {
        season = 'fall';
    }
    else {
        season = 'winter';
    }
    // Determine time of day
    let timeOfDay;
    if (hour >= 5 && hour < 12) {
        timeOfDay = 'Morning';
    }
    else if (hour >= 12 && hour < 17) {
        timeOfDay = 'Afternoon';
    }
    else if (hour >= 17 && hour < 21) {
        timeOfDay = 'Evening';
    }
    else {
        timeOfDay = 'Night';
    }
    // Determine day of week
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekDay = weekDays[dayOfWeek];
    // Determine planetary day
    const planetaryDay = {
        day: weekDay,
        planet: DAY_RULERS[weekDay]
    };
    // Calculate planetary hour
    // First, determine sunrise and sunset times (approximate)
    // For simplicity, we'll use 6 AM as sunrise and 6 PM as sunset
    const isDay = hour >= 6 && hour < 18;
    const hoursPerPlanetaryHour = isDay ? 12 / 12 : 12 / 12; // 1 hour each
    // Starting planet for the day's first hour
    const startingPlanetIndex = PLANETARY_HOUR_SEQUENCE.indexOf(DAY_RULERS[weekDay]);
    // Calculate current planetary hour (0-23)
    const planetaryHourOfDay = isDay ? hour - 6 : (hour < 6 ? hour + 18 : hour - 6);
    // Get the ruling planet for the current hour
    const planetIndex = (startingPlanetIndex + planetaryHourOfDay) % 7;
    const hourPlanet = PLANETARY_HOUR_SEQUENCE[planetIndex];
    const planetaryHour = {
        planet: hourPlanet,
        hourOfDay: planetaryHourOfDay
    };
    // Determine appropriate meal type based on time of day
    const mealType = TIME_TO_MEAL_MAPPING[timeOfDay];
    return {
        currentDate: now,
        season,
        timeOfDay,
        planetaryDay,
        planetaryHour,
        weekDay,
        mealType
    };
}
