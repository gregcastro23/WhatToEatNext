/**
 * Strict Null Checks Helper Utilities
 *
 * Provides utility functions to handle null/undefined checks efficiently
 * while enabling strictNullChecks across the codebase.
 */

/**
 * Type guard to check if value is not null or undefined
 */
export function isNotNullOrUndefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safe property access with default value
 */
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K],
): T[K] {
  return obj?.[key] ?? defaultValue;
}

/**
 * Safe array access with default
 */
export function safeArrayAccess<T>(
  array: T[] | null | undefined,
  index: number,
  defaultValue: T,
): T {
  return array?.[index] ?? defaultValue;
}

/**
 * Safe string access with default
 */
export function safeString(value: string | null | undefined, defaultValue = ''): string {
  return value ?? defaultValue;
}

/**
 * Safe number access with default
 */
export function safeNumber(value: number | null | undefined, defaultValue = 0): number {
  return value ?? defaultValue;
}

/**
 * Safe boolean access with default
 */
export function safeBoolean(value: boolean | null | undefined, defaultValue = false): boolean {
  return value ?? defaultValue;
}

/**
 * Assert that value is not null/undefined (throws if it is)
 */
export function assertNotNull<T>(
  value: T | null | undefined,
  message?: string,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value is null or undefined');
  }
}

/**
 * Safe function call - only calls if function exists
 */
export function safeCall<T extends (...args: unknown[]) => unknown>(
  fn: T | null | undefined,
  ...args: Parameters<T>
): ReturnType<T> | undefined {
  return fn?.(...args);
}

/**
 * Safe object property check
 */
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T | null | undefined,
  key: K,
): obj is T & Record<K, unknown> {
  return obj != null && key in obj;
}
