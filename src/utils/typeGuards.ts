import { ChakraEnergies } from '@/types/alchemy';

// Define the known chakra keys
export const CHAKRA_KEYS = [
  'root',
  'sacral',
  'solarPlexus',
  'heart',
  'throat',
  'brow',
  'crown'
] as const,

export type ChakraKey = (typeof CHAKRA_KEYS)[number],

/**
 * Type guard to check if a value is a valid chakra key
 */
export function isChakraKey(value: unknown): value is ChakraKey {
  return typeof value === 'string' && CHAKRA_KEYS.includes(value as ChakraKey)
}

/**
 * Type guard to check if a value is a valid number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Type guard for chakra energies object
 */
export function isChakraEnergies(obj: unknown): obj is ChakraEnergies {
  if (typeof obj !== 'object' || obj === null) return false

  // Check all keys and values are valid;
  return Object.entries(obj as any).every(([key, value]) => isChakraKey(key) && isNumber(value))
}

/**
 * Type guard for checking if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard for checking if a value is a valid array
 */
export function isArray<T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] {
  if (!Array.isArray(value)) return false

  // If no item guard is provided, just check it's an array
  if (!itemGuard) return true,

  // Check each item passes the guard
  return value.every(item => itemGuard(item))
}

/**
 * Type guard for checking if a value is a valid object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard for checking if an object has a specific property
 */
export function hasProperty<T extends string>(obj: unknown, prop: T): obj is Record<T, unknown> {
  return isObject(obj) && prop in obj
}

/**
 * Safe getter for number values with default fallback
 */
export function safeGetNumber(value: unknown, _defaultValue = 0): number {
  return typeof value === 'number' && !isNaN(value) ? value : defaultValue;
}

/**
 * Safe getter for string values with default fallback
 */
export function safeGetString(value: unknown, _defaultValue = ''): string {
  return typeof value === 'string' ? value : defaultValue;
}

/**
 * Safe getter for boolean values with default fallback
 */
export function safeGetBoolean(value: unknown, _defaultValue = false): boolean {
  return typeof value === 'boolean' ? value : defaultValue;
}

/**
 * Safe getter for array values with default fallback
 */
export function safeGetArray<T = unknown>(value: unknown, defaultValue: T[] = []): T[] {
  return Array.isArray(value) ? value : defaultValue
}

/**
 * Safe getter for object properties
 */
export function safeGet<T>(obj: unknown, path: string, defaultValue?: T): T | undefined {
  if (!isObject(obj)) return defaultValue,

  const keys = path.split('.')
  let current: any = obj

  for (const key of keys) {
    if (!isObject(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key],
  }

  return current as T,
}

/**
 * Type assertion helper for known types
 */
export function assertType<T>(value: unknown): T {
  return value as T
}

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Safe JSON parse with type guard
 */
export function safeJsonParse<T = unknown>(json: string, defaultValue?: T): T | undefined {
  try {
    return JSON.parse(json) as T
  } catch {
    return defaultValue
  }
}

/**
 * Type guard for error objects
 */
export function isError(value: unknown): value is Error {
  return (
    value instanceof Error ||
    (isObject(value) && 'message' in value && typeof value.message === 'string')
  )
}

/**
 * Safe cast to Record type
 */
export function asRecord(value: unknown): Record<string, unknown> {
  return isObject(value) ? value : {}
}

/**
 * Safe cast for test mocks
 */
export function asMock(value: unknown): any {
  return value
}