/**
 * Type Guards
 * 
 * This file contains type guard functions to help with type safety
 * throughout the application. These functions check if a value
 * conforms to a specific type.
 */

import { 
  ElementalProperties, 
  MoonPhase,
  ZodiacSign,
  isElementalProperties,
  LunarPhaseWithSpaces,
  MoonPhaseWithUnderscores,
  MoonPhaseWithSpaces,
  LowercaseMoonPhaseWithSpaces
} from '@/types/shared';

import {
  RecipeIngredient,
  isRecipeIngredient,
  StandardizedRecipe,
  isStandardizedRecipe
} from '@/types/recipe';

import { ChakraEnergies } from '../types/alchemy';

// Re-export type guards from shared
export { isElementalProperties, isRecipeIngredient, isStandardizedRecipe };

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
 * Type guard for chakra energies object
 */
export function isChakraEnergies(obj: unknown): obj is ChakraEnergies {
  if (typeof obj !== 'object' || obj === null) return false;
  
  // Check all keys and values are valid
  return Object.entries(obj as Record<string, unknown>).every(
    ([key, value]) => isChakraKey(key) && isNumeric(value)
  );
}

// Value checking utility
export const isDefined = <T>(value: T | null | undefined): value is T => 
  value !== null && value !== undefined;

// Type guard for Record<string, unknown>
export const isRecord = (value: unknown): value is Record<string, unknown> => 
  isDefined(value) && typeof value === 'object' && !Array.isArray(value);

// Type guard for checking if value is numeric
export const isNumeric = (value: unknown): value is number => 
  typeof value === 'number' && !isNaN(value);

// String-specific type guards
export const isZodiacSign = (value: unknown): value is ZodiacSign => {
  if (typeof value !== 'string') return false;
  
  const validZodiacSigns: string[] = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  return validZodiacSigns.includes(value.toLowerCase());
};

// Moon phase type guards
export const isMoonPhase = (value: unknown): value is MoonPhase => {
  if (typeof value !== 'string') return false;
  
  const validMoonPhases: string[] = [
    'NEW_MOON', 
    'WAXING_CRESCENT', 
    'FIRST_QUARTER', 
    'WAXING_GIBBOUS', 
    'FULL_MOON', 
    'WANING_GIBBOUS', 
    'LAST_QUARTER', 
    'WANING_CRESCENT'
  ];
  
  return validMoonPhases.includes(value);
};

export const isMoonPhaseWithSpaces = (value: unknown): value is MoonPhaseWithSpaces => {
  if (typeof value !== 'string') return false;
  
  const validMoonPhases: string[] = [
    'New Moon', 
    'Waxing Crescent', 
    'First Quarter', 
    'Waxing Gibbous', 
    'Full Moon', 
    'Waning Gibbous', 
    'Last Quarter', 
    'Waning Crescent'
  ];
  
  return validMoonPhases.includes(value);
};

export const isMoonPhaseWithUnderscores = (value: unknown): value is MoonPhaseWithUnderscores => {
  if (typeof value !== 'string') return false;
  
  const validMoonPhases: string[] = [
    'new_moon', 
    'waxing_crescent', 
    'first_quarter', 
    'waxing_gibbous', 
    'full_moon', 
    'waning_gibbous', 
    'last_quarter', 
    'waning_crescent'
  ];
  
  return validMoonPhases.includes(value);
};

export const isLowercaseMoonPhaseWithSpaces = (value: unknown): value is LowercaseMoonPhaseWithSpaces => {
  if (typeof value !== 'string') return false;
  
  const validMoonPhases: string[] = [
    'new moon', 
    'waxing crescent', 
    'first quarter', 
    'waxing gibbous', 
    'full moon', 
    'waning gibbous', 
    'last quarter', 
    'waning crescent'
  ];
  
  return validMoonPhases.includes(value);
};

// Type guard for lunar phase formats (any format)
export const isAnyMoonPhaseFormat = (value: unknown): boolean => {
  return (
    isMoonPhase(value) || 
    isMoonPhaseWithSpaces(value) || 
    isMoonPhaseWithUnderscores(value) || 
    isLowercaseMoonPhaseWithSpaces(value)
  );
};

// Type guard for ElementalProperties object with non-zero values
export const hasNonZeroElementalProperties = (obj: unknown): obj is ElementalProperties => {
  if (!isElementalProperties(obj)) return false;
  
  // Check if at least one element has a non-zero value
  return (
    obj.Fire !== 0 || 
    obj.Water !== 0 || 
    obj.Earth !== 0 || 
    obj.Air !== 0
  );
};

// Type guard for array of strings
export const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

// Type guard for array of RecipeIngredients
export const isRecipeIngredientArray = (value: unknown): value is RecipeIngredient[] => {
  return Array.isArray(value) && value.every(isRecipeIngredient);
};

// Type guard for numeric arrays
export const isNumericArray = (value: unknown): value is number[] => {
  return Array.isArray(value) && value.every(isNumeric);
};

// Type guard for object with specific property
export function hasProperty<K extends string>(
  obj: unknown, 
  prop: K
): obj is Record<K, unknown> {
  return isRecord(obj) && prop in obj;
}

// Type guard for checking if a value is a Date or date string
export const isDateOrDateString = (value: unknown): value is Date | string => {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  
  // Try to parse the string as a date
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Export functions for converting between moon phase formats
export function convertToStandardMoonPhase(moonPhase: unknown): MoonPhase | null {
  if (isMoonPhase(moonPhase)) return moonPhase;
  
  if (isMoonPhaseWithUnderscores(moonPhase)) {
    const map: Record<MoonPhaseWithUnderscores, MoonPhase> = {
      'new_moon': 'NEW_MOON',
      'waxing_crescent': 'WAXING_CRESCENT',
      'first_quarter': 'FIRST_QUARTER',
      'waxing_gibbous': 'WAXING_GIBBOUS',
      'full_moon': 'FULL_MOON',
      'waning_gibbous': 'WANING_GIBBOUS',
      'last_quarter': 'LAST_QUARTER',
      'waning_crescent': 'WANING_CRESCENT'
    };
    return map[moonPhase];
  }
  
  if (isMoonPhaseWithSpaces(moonPhase)) {
    const map: Record<MoonPhaseWithSpaces, MoonPhase> = {
      'New Moon': 'NEW_MOON',
      'Waxing Crescent': 'WAXING_CRESCENT',
      'First Quarter': 'FIRST_QUARTER',
      'Waxing Gibbous': 'WAXING_GIBBOUS',
      'Full Moon': 'FULL_MOON',
      'Waning Gibbous': 'WANING_GIBBOUS',
      'Last Quarter': 'LAST_QUARTER',
      'Waning Crescent': 'WANING_CRESCENT'
    };
    return map[moonPhase];
  }
  
  if (isLowercaseMoonPhaseWithSpaces(moonPhase)) {
    const map: Record<LowercaseMoonPhaseWithSpaces, MoonPhase> = {
      'new moon': 'NEW_MOON',
      'waxing crescent': 'WAXING_CRESCENT',
      'first quarter': 'FIRST_QUARTER',
      'waxing gibbous': 'WAXING_GIBBOUS',
      'full moon': 'FULL_MOON',
      'waning gibbous': 'WANING_GIBBOUS',
      'last quarter': 'LAST_QUARTER',
      'waning crescent': 'WANING_CRESCENT'
    };
    return map[moonPhase];
  }
  
  return null;
} 