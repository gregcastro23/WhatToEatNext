import @/types  from 'alchemy ';

// Define the known chakra keys
export const CHAKRA_KEYS = [
  'root',
  'sacral',
  'solarPlexus',
  'heart',
  'throat',
  'brow',
  'crown'
] as const;

export type ChakraKey = typeof CHAKRA_KEYS[number];

/**
 * Type guard to check if a value is a valid chakra key
 */
export function isChakraKey(value: unknown): value is ChakraKey {
  return typeof value === 'string' && CHAKRA_KEYS.includes(value as ChakraKey);
}

/**
 * Type guard to check if a value is a valid number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard for chakra energies object
 */
export function isChakraEnergies(obj: unknown): obj is ChakraEnergies {
  if (typeof obj !== 'object' || obj === null) return false;
  
  // Check all keys and values are valid
  return Object.entries(obj as Record<string, unknown>).every(
    ([key, value]) => isChakraKey(key) && isNumber(value)
  );
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
  if (!Array.isArray(value)) return false;
  
  // If no item guard is provided, just check it's an array
  if (!itemGuard) return true;
  
  // Check each item passes the guard
  return value.every(item => itemGuard(item));
}

/**
 * Type guard for checking if a value is a valid object (not null, not array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
} 