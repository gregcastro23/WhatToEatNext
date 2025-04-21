/**
 * Date Utilities
 * A collection of date-related utility functions using date-fns
 */

import { format, parse, isValid, differenceInDays, addDays, isSameDay, getQuarter, isWithinInterval } from 'date-fns';

/**
 * Formats a date into a readable string
 * @param {Date} date - The date to format
 * @param {string} formatString - The format pattern (default: 'yyyy-MM-dd')
 * @returns {string} Formatted date string
 */
export function formatDate(date, formatString = 'yyyy-MM-dd') {
  if (!date || !isValid(date)) return 'Invalid date';
  return format(date, formatString);
}

/**
 * Parses a string into a Date object
 * @param {string} dateString - The date string to parse
 * @param {string} formatString - The format of the date string (default: 'yyyy-MM-dd')
 * @returns {Date} The parsed Date object or Invalid Date if parsing fails
 */
export function parseDate(dateString, formatString = 'yyyy-MM-dd') {
  try {
    const parsedDate = parse(dateString, formatString, new Date());
    return parsedDate;
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date('Invalid Date');
  }
}

/**
 * Checks if a date falls within a specific season
 * @param {Date} date - The date to check
 * @param {string} hemisphere - 'northern' or 'southern'
 * @returns {string} The season name: 'spring', 'summer', 'autumn', or 'winter'
 */
export function getSeason(date, hemisphere = 'northern') {
  if (!date || !isValid(date)) return 'Unknown';
  
  const quarter = getQuarter(date);
  const month = date.getMonth();
  
  // Northern hemisphere seasons
  if (hemisphere.toLowerCase() === 'northern') {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }
  
  // Southern hemisphere (seasons are reversed)
  if (month >= 2 && month <= 4) return 'autumn';
  if (month >= 5 && month <= 7) return 'winter';
  if (month >= 8 && month <= 10) return 'spring';
  return 'summer';
}

/**
 * Checks if a date falls within a zodiac sign date range
 * @param {Date} date - The date to check
 * @param {Object} signRange - Object with start and end properties (each having day, month)
 * @returns {boolean} True if the date falls within the range
 */
export function isDateInZodiacRange(date, signRange) {
  if (!date || !isValid(date) || !signRange) return false;
  
  const year = date.getFullYear();
  
  // Create Date objects for the start and end of the sign
  let startDate = new Date(year, signRange.start.month - 1, signRange.start.day);
  let endDate = new Date(year, signRange.end.month - 1, signRange.end.day);
  
  // Handle end of year transitions (e.g., Capricorn spanning Dec-Jan)
  if (signRange.start.month > signRange.end.month) {
    if (date.getMonth() < signRange.end.month) {
      startDate = new Date(year - 1, signRange.start.month - 1, signRange.start.day);
    } else {
      endDate = new Date(year + 1, signRange.end.month - 1, signRange.end.day);
    }
  }
  
  return isWithinInterval(date, { start: startDate, end: endDate });
}

export default {
  formatDate,
  parseDate,
  getSeason,
  isDateInZodiacRange
}; 