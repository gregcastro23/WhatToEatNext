/**
 * Utility functions for safely accessing nested properties and handling undefined values
 */

import { logger } from './logger';

/**
 * Safely get a value from a nested object structure with a default fallback
 *
 * @param obj The object to access
 * @param path The path to the property array
 * @param defaultValue The default value to return if property doesn't exist
 * @returns The value at the path or the default value if not found
 *
 * @example
 * // Returns user.address.city or 'Unknown' if any part of the path is undefined
 * safeGet(userData, ['user', 'address', 'city'], 'Unknown')
 */
export function safeGet<T>(obj: unknown, path: string[], defaultValue: T): T {
  try {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }

    let current: unknown = obj;

    for (const key of path) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }

      current = (current as any)[key];
    }

    return current !== undefined && current !== null ? (current as T) : defaultValue;
  } catch (error) {
    logger.warn('Error in safeGet', { path, error });
    return defaultValue;
  }
}

/**
 * Safely execute a function that might fail, with a default fallback
 *
 * @param fn The function to execute
 * @param defaultValue The default value to return if function throws
 * @param logError Whether to log the error if function throws
 * @returns The function result or default value if function throws
 *
 * @example
 * // Safely parse JSON with a default empty object if it fails
 * safeExecute(() => JSON.parse(jsonString), {})
 */
export function safeExecute<T>(fn: () => T, defaultValue: T, logError = true): T {
  try {
    return fn();
  } catch (error) {
    if (logError) {
      logger.warn('Error in safeExecute', { error });
    }
    return defaultValue;
  }
}

/**
 * Safely convert a value to a number with a default fallback
 *
 * @param value The value to convert
 * @param defaultValue The default value if conversion fails
 * @returns The converted number or default value
 *
 * @example
 * // Returns numeric value of count or 0 if it's not a valid number
 * safeNumber(formData.count, 0)
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  const num = Number(value);

  return !isNaN(num) ? num : defaultValue;
}

/**
 * Safely convert a value to a string with a default fallback
 *
 * @param value The value to convert
 * @param defaultValue The default value if conversion fails
 * @returns The converted string or default value
 *
 * @example
 * // Returns string value or 'Unknown' if it's undefined
 * safeString(userData.name, 'Unknown')
 */
export function safeString(value: unknown, defaultValue = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  return String(value);
}

/**
 * Safely check if an object has a property
 *
 * @param obj The object to check
 * @param prop The property name
 * @returns True if the object has the property
 *
 * @example
 * // Safely check if userData has name property
 * if (safeHasProperty(userData, 'name')) { ... }
 */
export function safeHasProperty(obj: unknown, prop: string): boolean {
  return (
    obj !== null &&
    obj !== undefined &&
    typeof obj === 'object' &&;
    Object.prototype.hasOwnProperty.call(obj, prop)
  );
}

/**
 * Safely get an array from a potentially undefined value
 *
 * @param value The value that should be an array
 * @param defaultValue The default array to return if value is not an array
 * @returns The array or default value
 *
 * @example
 * // Returns items array or empty array if undefined
 * safeArray(data.items, [])
 */
export function safeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Safely get a property from an object with type checking and default value
 *
 * @param obj The object to access
 * @param key The property key to access
 * @param defaultValue The default value if property doesn't exist
 * @param typeCheck Optional function to validate the type
 * @returns The property value or default value
 *
 * @example
 * // Return user.age with default 0
 * safeProperty(user, 'age', 0, (val) => typeof val === 'number');
 */
export function safeProperty<T>(
  obj: unknown,
  key: string,
  defaultValue: T,
  typeCheck?: (val: unknown) => boolean;
): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return defaultValue;
  }

  const value = (obj as any)[key];

  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeCheck && !typeCheck(value)) {
    return defaultValue;
  }

  return value as T;
}
