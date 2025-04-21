// Type utility functions to help with type safety

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if an object has a specific property
 */
export function hasProperty<K extends string>(obj: unknown, key: K): obj is { [P in K]: unknown } {
  return isObject(obj) && key in obj;
}

/**
 * Safe accessor for possibly undefined object properties
 */
export function safeGet<T>(obj: unknown, key: string, defaultValue: T): T {
  if (isObject(obj) && key in obj) {
    return obj[key] as T;
  }
  return defaultValue;
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is an array of strings
 */
export function isStringArray(value: unknown): value is string[] {
  return isArray(value) && value.every(isString);
}

/**
 * Safe string converter - converts to string or returns default
 */
export function safeString(value: unknown, defaultValue: string = ''): string {
  return isString(value) ? value : defaultValue;
}

/**
 * Safe number converter - converts to number or returns default
 */
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  return isNumber(value) ? value : defaultValue;
}

/**
 * Makes all properties in a type optional
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Force cast a type (use with caution, only when you're sure about the type)
 */
export function forceCast<T>(obj: unknown): T {
  return obj as T;
}

/**
 * Safely access a potentially missing property with a specified type
 */
export function getTypedProperty<T>(obj: unknown, key: string, defaultValue: T): T {
  if (isObject(obj) && key in obj) {
    const value = obj[key];
    return (value as unknown) as T;
  }
  return defaultValue;
}

/**
 * Utility for safe access to nested properties
 */
export function getNestedProperty<T>(
  obj: unknown, 
  path: string[], 
  defaultValue: T
): T {
  let current: unknown = obj;
  
  for (const key of path) {
    if (!isObject(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current as T;
} 