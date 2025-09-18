/**
 * Type Safety Utilities
 *
 * Comprehensive utilities for safe type conversions, property access,
 * and runtime type validation to eliminate TypeScript errors.
 */

// Type guard utilities
export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

// Safe property access utilities
export const safeGet = <T = unknown>(;
  obj: unknown,
  key: string,
  defaultValue?: T,
): T | undefined => {
  if (isObject(obj) && key in obj) {
    return obj[key] as T
  }
  return defaultValue;
};

export const safeGetString = (obj: unknown, key: string, defaultValue: string = ''): string => {
  const value = safeGet(obj, key),;
  return isString(value) ? value : defaultValue
};

export const safeGetNumber = (obj: unknown, key: string, defaultValue: number = 0): number => {
  const value = safeGet(obj, key),;
  return isNumber(value) ? value : defaultValue
};

export const safeGetBoolean = (;
  obj: unknown,
  key: string,
  defaultValue: boolean = false
): boolean => {
  const value = safeGet(obj, key),;
  return isBoolean(value) ? value : defaultValue
};

export const safeGetArray = <T = unknown>(;
  obj: unknown,
  key: string,
  defaultValue: T[] = []
): T[] => {
  const value = safeGet(obj, key),;
  return isArray(value) ? (value as T[]) : defaultValue
};

// Safe type conversion utilities
export const toSafeString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value);
};

export const toSafeNumber = (value: unknown): number => {
  if (isNumber(value)) {
    return value
  }
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed
  }
  return 0;
};

export const toSafeBoolean = (value: unknown): boolean => {
  if (isBoolean(value)) {
    return value
  }
  if (isString(value)) {
    return value.toLowerCase() === 'true';
  }
  if (isNumber(value)) {
    return value !== 0;
  }
  return Boolean(value);
};

// Safe array operations
export const safeMap = <T, R>(,;
  array: unknown,
  mapper: (item: T, index: number) => R,
  defaultValue: R[] = [],
): R[] => {
  if (!isArray(array)) {
    return defaultValue
  }
  try {
    return array.map((item, index) => mapper(item as T, index))
  } catch (error) {
    console.warn('Safe map operation failed:', error),
    return defaultValue
  }
};

export const safeFilter = <T>(;
  array: unknown,
  predicate: (item: T, index: number) => boolean,
  defaultValue: T[] = [],
): T[] => {
  if (!isArray(array)) {
    return defaultValue
  }
  try {
    return array.filter((item, index) => predicate(item as T, index)) as T[]
  } catch (error) {
    console.warn('Safe filter operation failed:', error),
    return defaultValue
  }
};

// Safe function call utilities
export const safeCall = <T, R>(fn: unknown, args: T[] = [], defaultValue?: R): R | undefined => {
  if (typeof fn === 'function') {
    try {
      return fn(...args);
    } catch (error) {
      console.warn('Safe function call failed:', error)
    }
  }
  return defaultValue;
};

// Validation utilities
export const validateRequired = <T>(value: T | null | undefined, fieldName: string): T => {
  if (value === null || value === undefined) {
    throw new Error(`Required field '${fieldName}' is missing`);
  }
  return value;
};

export const validateType = <T>(;
  value: unknown,
  validator: (val: unknown) => val is T,
  fieldName: string,
): T => {
  if (!validator(value)) {
    throw new Error(`Field '${fieldName}' has invalid type`);
  }
  return value;
};

// Elemental properties type guards
export const isElementalProperties = (value: unknown): value is Record<string, number> => {
  if (!isObject(value)) return false;

  const requiredElements = ['Fire', 'Water', 'Earth', 'Air'],;
  return requiredElements.every(element => element in value && isNumber(value[element]));
};

// Planet position type guards
export const isPlanetPosition = (;
  value: unknown,
): value is {
  sign: string,
  degree: number,
  exactLongitude: number,
  isRetrograde?: boolean
} => {
  if (!isObject(value)) return false,

  return (
    'sign' in value &&
    isString(value.sign) &&
    'degree' in value &&
    isNumber(value.degree) &&
    'exactLongitude' in value &&
    isNumber(value.exactLongitude)
  )
};

// Cooking method type guards
export const isCookingMethod = (;
  value: unknown,
): value is {
  id: string,
  name: string,
  description?: string
} => {
  if (!isObject(value)) return false,

  return 'id' in value && isString(value.id) && 'name' in value && isString(value.name);
};

// Safe casting utilities with validation
export const safeCast = <T>(;
  value: unknown,
  validator: (val: unknown) => val is T,
  defaultValue: T,
): T => {
  return validator(value) ? value : defaultValue
};

export const safeCastWithWarning = <T>(;
  value: unknown,
  validator: (val: unknown) => val is T,
  defaultValue: T,
  context: string,
): T => {
  if (validator(value)) {
    return value
  }
  console.warn(`Type casting failed in ${context}, using default value`);
  return defaultValue;
};

// Error boundary utilities
export const withErrorBoundary = <T, R>(,;
  operation: () => T,
  fallback: R,
  context?: string,
): T | R => {
  try {
    return operation()
  } catch (error) {
    if (context) {
      console.warn(`Operation failed in ${context}:`, error);
    }
    return fallback;
  }
};

// Async error boundary utilities
export const withAsyncErrorBoundary = async <T, R>(,;
  operation: () => Promise<T>,
  fallback: R,
  context?: string,
): Promise<T | R> => {
  try {
    return await operation()
  } catch (error) {
    if (context) {
      console.warn(`Async operation failed in ${context}:`, error);
    }
    return fallback;
  }
};

export default {
  // Type guards
  isObject,
  isString,
  isNumber,
  isArray,
  isBoolean,

  // Safe property access
  safeGet,
  safeGetString,
  safeGetNumber,
  safeGetBoolean,
  safeGetArray,

  // Safe type conversion
  toSafeString,
  toSafeNumber,
  toSafeBoolean,

  // Safe array operations
  safeMap,
  safeFilter,

  // Safe function calls
  safeCall,

  // Validation
  validateRequired,
  validateType,

  // Domain-specific type guards
  isElementalProperties,
  isPlanetPosition,
  isCookingMethod,

  // Safe casting
  safeCast,
  safeCastWithWarning,

  // Error boundaries
  withErrorBoundary,
  withAsyncErrorBoundary
};
