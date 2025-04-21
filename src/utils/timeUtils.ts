/**
 * Time Utility Functions
 * 
 * This module provides utility functions for handling time-related features
 * such as determining current time, season, planetary hours, and more.
 */

import { TimeFactors, Season, TimeOfDay, WeekDay, PlanetaryDay, PlanetaryHour } from '../types/time';
import { PlanetName } from '../types/alchemy';

// Map of days to their planetary rulers - traditional associations
const DAY_RULERS: Record<WeekDay, PlanetName> = {
  'sunday': 'sun',     // sun's day
  'Monday': 'moon',    // Moon's day
  'Tuesday': 'mars',   // Mars' day (Tiw's/Tyr's day in Germanic)
  'Wednesday': 'mercury', // Mercury's day (Woden's/Odin's day in Germanic)
  'Thursday': 'jupiter',  // Jupiter's day (Thor's day in Germanic)
  'Friday': 'venus',   // Venus' day (Frigg's/Freya's day in Germanic)
  'Saturday': 'saturn' // Saturn's day
};

// Chaldean order of planets used for planetary hours
// Order is based on the apparent speed of celestial bodies: Saturn (slowest), Jupiter, Mars, sun, Venus, Mercury, Moon (fastest)
const CHALDEAN_HOUR_SEQUENCE: PlanetName[] = [
  'saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'
];

// Sephardic order of planets used for planetary hours in Sephardic tradition
// This follows a different ordering system used in some Sephardic traditions
const SEPHARDIC_HOUR_SEQUENCE: PlanetName[] = [
  'mercury', 'moon', 'saturn', 'jupiter', 'mars', 'sun', 'venus'
];

// Default to the Chaldean sequence for backward compatibility
const PLANETARY_HOUR_SEQUENCE = CHALDEAN_HOUR_SEQUENCE;

/**
 * Get the current time factors including season, time of day, and planetary information
 * 
 * @param date Optional date to use instead of current time
 * @param useSequence Optional parameter to specify which planetary hour sequence to use ('chaldean' or 'sephardic')
 * @returns TimeFactors object with comprehensive time-related information
 */
export function getTimeFactors(date: Date = new Date(), useSequence: 'chaldean' | 'sephardic' = 'chaldean'): TimeFactors {
  const month = date.getMonth();
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  
  // Determine season (Northern Hemisphere)
  let season: Season;
  if (month >= 2 && month <= 4) {
    season = 'Spring';
  } else if (month >= 5 && month <= 7) {
    season = 'Summer';
  } else if (month >= 8 && month <= 10) {
    season = 'Fall';
  } else {
    season = 'Winter';
  }
  
  // Determine time of day
  let timeOfDay: TimeOfDay;
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'Morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'Afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'Evening';
  } else {
    timeOfDay = 'Night';
  }
  
  // Determine day of week
  const weekDays: WeekDay[] = ['sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekDay = weekDays[dayOfWeek];
  
  // Determine planetary day
  const planetaryDay: PlanetaryDay = {
    day: weekDay,
    planet: DAY_RULERS[weekDay]
  };
  
  // Select the appropriate planetary hour sequence
  const planetarySequence = useSequence === 'sephardic' 
    ? SEPHARDIC_HOUR_SEQUENCE 
    : CHALDEAN_HOUR_SEQUENCE;
  
  // Calculate planetary hour
  // Approximate sunrise at 6 AM and sunset at 6 PM for simplicity
  const isDay = hour >= 6 && hour < 18;
  
  // Starting planet for the day's first hour
  const startingPlanetIndex = planetarySequence.indexOf(DAY_RULERS[weekDay]);
  
  // Calculate current planetary hour (0-23)
  const planetaryHourOfDay = isDay ? hour - 6 : (hour < 6 ? hour + 18 : hour - 6);
  
  // Get the ruling planet for the current hour
  const planetIndex = (startingPlanetIndex + planetaryHourOfDay) % 7;
  const hourPlanet = planetarySequence[planetIndex];
  
  const planetaryHour: PlanetaryHour = {
    planet: hourPlanet,
    hourOfDay: planetaryHourOfDay
  };
  
  return {
    currentDate: date,
    season,
    timeOfDay,
    planetaryDay,
    planetaryHour,
    weekDay,
    planetarySystem: useSequence
  };
}

/**
 * Format a date object as a human-readable string
 * 
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Determine if the current time is during daylight hours
 * 
 * @param date Optional date to check
 * @returns Boolean indicating if it's daytime
 */
export function isDaytime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
}

/**
 * Get the zodiac sign for a given date
 * 
 * @param date Date to get zodiac sign for
 * @returns String representing the zodiac sign
 */
export function getZodiacSign(date: Date = new Date()): string {
  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return 'aries';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return 'taurus';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return 'gemini';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return 'cancer';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return 'leo';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return 'virgo';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return 'libra';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return 'scorpio';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return 'sagittarius';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return 'capricorn';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return 'aquarius';
  } else {
    return 'pisces';
  }
}

/**
 * Check if a date is in a specific season
 * 
 * @param targetSeason The season to check against
 * @param date Optional date to check (defaults to current date)
 * @returns True if the date is in the specified season
 */
export function isInSeason(targetSeason: Season, date: Date = new Date()): boolean {
  const { season } = getTimeFactors(date);
  return season === targetSeason;
}

/**
 * Get appropriate meal type based on current time
 * 
 * @param date Optional date to use
 * @returns String representing meal type (breakfast, lunch, dinner, etc.)
 */
export function getMealType(date: Date = new Date()): string {
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 10) {
    return 'Breakfast';
  } else if (hour >= 10 && hour < 14) {
    return 'Lunch';
  } else if (hour >= 14 && hour < 17) {
    return 'Snack';
  } else if (hour >= 17 && hour < 21) {
    return 'Dinner';
  } else {
    return 'Snack';
  }
}

/**
 * Convert a 24-hour time format to 12-hour format with AM/PM
 * 
 * @param hour Hour in 24-hour format
 * @returns Formatted time string (e.g., "3:00 PM")
 */
export function formatHour(hour: number, minute: number = 0): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedMinute = minute.toString().padStart(2, '0');
  
  return `${formattedHour}:${formattedMinute} ${period}`;
} 