/**
 * Arithmetic Safety Functions
 * 
 * This file provides utility functions for safely performing arithmetic
 * operations with proper type checking to prevent runtime errors.
 */

import { isDefined, isNumeric } from './typeGuards';

/**
 * Safely adds two values, returning 0 if any value is invalid
 * @param a First value
 * @param b Second value
 * @param defaultValue Optional default value if operation fails (default: 0)
 * @returns The sum of a and b, or defaultValue if invalid
 */
export function safeAdd(a: unknown, b: unknown, defaultValue = 0): number {
  if (isNumeric(a) && isNumeric(b)) {
    return a + b;
  }
  return defaultValue;
}

/**
 * Safely subtracts two values, returning 0 if any value is invalid
 * @param a First value
 * @param b Second value
 * @param defaultValue Optional default value if operation fails (default: 0)
 * @returns a - b, or defaultValue if invalid
 */
export function safeSubtract(a: unknown, b: unknown, defaultValue = 0): number {
  if (isNumeric(a) && isNumeric(b)) {
    return a - b;
  }
  return defaultValue;
}

/**
 * Safely multiplies two values, returning 0 if any value is invalid
 * @param a First value
 * @param b Second value
 * @param defaultValue Optional default value if operation fails (default: 0)
 * @returns a * b, or defaultValue if invalid
 */
export function safeMultiply(a: unknown, b: unknown, defaultValue = 0): number {
  if (isNumeric(a) && isNumeric(b)) {
    return a * b;
  }
  return defaultValue;
}

/**
 * Safely divides two values, handling division by zero
 * @param a Numerator
 * @param b Denominator
 * @param defaultValue Optional default value if operation fails (default: 0)
 * @returns a / b, or defaultValue if invalid or divisor is 0
 */
export function safeDivide(a: unknown, b: unknown, defaultValue = 0): number {
  if (isNumeric(a) && isNumeric(b) && b !== 0) {
    return a / b;
  }
  return defaultValue;
}

/**
 * Safely squares a value, returning 0 if the value is invalid
 * @param a Value to square
 * @param defaultValue Optional default value if operation fails (default: 0)
 * @returns a^2, or defaultValue if invalid
 */
export function safeSquare(a: unknown, defaultValue = 0): number {
  if (isNumeric(a)) {
    return a * a;
  }
  return defaultValue;
}

/**
 * Safely calculates a percentage, handling division by zero
 * @param numerator The value to calculate percentage of
 * @param denominator The total value
 * @param defaultValue Optional default value if operation fails (default: 0)
 * @returns (numerator / denominator) * 100, or defaultValue if invalid
 */
export function safePercentage(numerator: unknown, denominator: unknown, defaultValue = 0): number {
  if (isNumeric(numerator) && isNumeric(denominator) && denominator !== 0) {
    return (numerator / denominator) * 100;
  }
  return defaultValue;
}

/**
 * Safely sums an array of numbers, skipping invalid values
 * @param values Array of values to sum
 * @returns Sum of all valid numbers in the array
 */
export function safeSum(values: unknown[]): number {
  if (!Array.isArray(values)) return 0;
  
  return values.reduce((sum, value) => {
    if (isNumeric(value)) {
      return sum + value;
    }
    return sum;
  }, 0);
}

/**
 * Safely calculates the average of an array of numbers, skipping invalid values
 * @param values Array of values to average
 * @param defaultValue Optional default value if no valid numbers (default: 0)
 * @returns Average of all valid numbers in the array
 */
export function safeAverage(values: unknown[], defaultValue = 0): number {
  if (!Array.isArray(values) || values.length === 0) return defaultValue;
  
  const validValues = values.filter(isNumeric);
  if (validValues.length === 0) return defaultValue;
  
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

/**
 * Safely calculates the maximum value in an array of numbers, skipping invalid values
 * @param values Array of values to find maximum of
 * @param defaultValue Optional default value if no valid numbers (default: 0)
 * @returns Maximum value among all valid numbers in the array
 */
export function safeMax(values: unknown[], defaultValue = 0): number {
  if (!Array.isArray(values) || values.length === 0) return defaultValue;
  
  const validValues = values.filter(isNumeric);
  if (validValues.length === 0) return defaultValue;
  
  return Math.max(...validValues);
}

/**
 * Safely calculates the minimum value in an array of numbers, skipping invalid values
 * @param values Array of values to find minimum of
 * @param defaultValue Optional default value if no valid numbers (default: 0)
 * @returns Minimum value among all valid numbers in the array
 */
export function safeMin(values: unknown[], defaultValue = 0): number {
  if (!Array.isArray(values) || values.length === 0) return defaultValue;
  
  const validValues = values.filter(isNumeric);
  if (validValues.length === 0) return defaultValue;
  
  return Math.min(...validValues);
}

/**
 * Safely rounds a number to a specified number of decimal places
 * @param value Value to round
 * @param decimals Number of decimal places to round to
 * @param defaultValue Optional default value if value is invalid (default: 0)
 * @returns Rounded value, or defaultValue if invalid
 */
export function safeRound(value: unknown, decimals = 0, defaultValue = 0): number {
  if (!isNumeric(value)) return defaultValue;
  
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Safely clamps a value between min and max bounds
 * @param value Value to clamp
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @param defaultValue Optional default value if any input is invalid (default: 0)
 * @returns Clamped value, or defaultValue if any input is invalid
 */
export function safeClamp(
  value: unknown, 
  min: unknown, 
  max: unknown, 
  defaultValue = 0
): number {
  if (!isNumeric(value) || !isNumeric(min) || !isNumeric(max)) return defaultValue;
  
  return Math.min(Math.max(value, min), max);
}

/**
 * Gets a property value from an object safely
 * @param obj Object to get property from
 * @param path Path to property, can use dot notation
 * @param defaultValue Default value if property doesn't exist
 * @returns Property value or default value
 */
export function safeGet<T>(
  obj: unknown, 
  path: string, 
  defaultValue: T
): T {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    
    current = current[key];
    
    if (current === undefined) {
      return defaultValue;
    }
  }
  
  return current !== null && current !== undefined ? current as T : defaultValue;
} 