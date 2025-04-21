/**
 * Type Mappings
 * 
 * This file provides mappings between different type formats to help
 * standardize data across the application. It centralizes conversion
 * logic for various type formats.
 */

import { 
  MoonPhase, 
  MoonPhaseWithSpaces, 
  MoonPhaseWithUnderscores,
  LowercaseMoonPhaseWithSpaces,
  ZodiacSign,
  Element,
  ElementalProperties,
  DEFAULT_ELEMENTAL_PROPERTIES
} from '@/types/shared';

// Map from uppercase MoonPhase to display format with spaces
export const MOON_PHASE_TO_DISPLAY_MAP: Record<MoonPhase, MoonPhaseWithSpaces> = {
  'NEW_MOON': 'New Moon',
  'WAXING_CRESCENT': 'Waxing Crescent',
  'FIRST_QUARTER': 'First Quarter',
  'WAXING_GIBBOUS': 'Waxing Gibbous',
  'FULL_MOON': 'Full Moon',
  'WANING_GIBBOUS': 'Waning Gibbous',
  'LAST_QUARTER': 'Last Quarter',
  'WANING_CRESCENT': 'Waning Crescent'
};

// Map from lowercase with underscores to uppercase constants
export const MOON_PHASE_FROM_UNDERSCORE_MAP: Record<MoonPhaseWithUnderscores, MoonPhase> = {
  'new_moon': 'NEW_MOON',
  'waxing_crescent': 'WAXING_CRESCENT',
  'first_quarter': 'FIRST_QUARTER',
  'waxing_gibbous': 'WAXING_GIBBOUS',
  'full_moon': 'FULL_MOON',
  'waning_gibbous': 'WANING_GIBBOUS',
  'last_quarter': 'LAST_QUARTER',
  'waning_crescent': 'WANING_CRESCENT'
};

// Map from lowercase with spaces to uppercase constants
export const MOON_PHASE_FROM_LOWERCASE_MAP: Record<LowercaseMoonPhaseWithSpaces, MoonPhase> = {
  'new moon': 'NEW_MOON',
  'waxing crescent': 'WAXING_CRESCENT',
  'first quarter': 'FIRST_QUARTER',
  'waxing gibbous': 'WAXING_GIBBOUS',
  'full moon': 'FULL_MOON',
  'waning gibbous': 'WANING_GIBBOUS',
  'last quarter': 'LAST_QUARTER',
  'waning crescent': 'WANING_CRESCENT'
};

// Map zodiac signs to elements
export const ZODIAC_TO_ELEMENT_MAP: Record<ZodiacSign, Element> = {
  'aries': 'Fire',
  'taurus': 'Earth',
  'gemini': 'Air',
  'cancer': 'Water',
  'leo': 'Fire',
  'virgo': 'Earth',
  'libra': 'Air',
  'scorpio': 'Water',
  'sagittarius': 'Fire',
  'capricorn': 'Earth',
  'aquarius': 'Air',
  'pisces': 'Water'
};

// Element to elemental properties mapping
export function elementToElementalProperties(element: Element): ElementalProperties {
  const props = { ...DEFAULT_ELEMENTAL_PROPERTIES };
  props[element] = 1.0;
  return props;
}

/**
 * Normalizes a moon phase string to the standard MoonPhase type
 * This function handles various formats and case variations
 * 
 * @param phase The moon phase string to normalize
 * @returns The normalized MoonPhase or null if invalid
 */
export function normalizeMoonPhase(phase: string | null | undefined): MoonPhase | null {
  if (!phase) return null;
  
  // Handle uppercase format directly
  const upperPhase = phase.toUpperCase();
  if (upperPhase === 'NEW_MOON' || 
      upperPhase === 'WAXING_CRESCENT' || 
      upperPhase === 'FIRST_QUARTER' || 
      upperPhase === 'WAXING_GIBBOUS' || 
      upperPhase === 'FULL_MOON' || 
      upperPhase === 'WANING_GIBBOUS' || 
      upperPhase === 'LAST_QUARTER' || 
      upperPhase === 'WANING_CRESCENT') {
    return upperPhase as MoonPhase;
  }
  
  // Handle underscore format
  const underscorePhase = phase.toLowerCase().replace(/ /g, '_');
  if (underscorePhase in MOON_PHASE_FROM_UNDERSCORE_MAP) {
    return MOON_PHASE_FROM_UNDERSCORE_MAP[underscorePhase as MoonPhaseWithUnderscores];
  }
  
  // Handle lowercase with spaces
  const lowerPhase = phase.toLowerCase();
  if (lowerPhase in MOON_PHASE_FROM_LOWERCASE_MAP) {
    return MOON_PHASE_FROM_LOWERCASE_MAP[lowerPhase as LowercaseMoonPhaseWithSpaces];
  }
  
  // Handle display format (Title Case)
  for (const [key, value] of Object.entries(MOON_PHASE_TO_DISPLAY_MAP)) {
    if (value === phase) {
      return key as MoonPhase;
    }
  }
  
  return null;
}

/**
 * Normalizes a zodiac sign string to the standard ZodiacSign type
 * 
 * @param sign The zodiac sign string to normalize
 * @returns The normalized ZodiacSign or null if invalid
 */
export function normalizeZodiacSign(sign: string | null | undefined): ZodiacSign | null {
  if (!sign) return null;
  
  const lowerSign = sign.toLowerCase();
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  if (validSigns.includes(lowerSign as ZodiacSign)) {
    return lowerSign as ZodiacSign;
  }
  
  return null;
}

/**
 * Normalizes an element string to the standard Element type
 * 
 * @param element The element string to normalize
 * @returns The normalized Element or null if invalid
 */
export function normalizeElement(element: string | null | undefined): Element | null {
  if (!element) return null;
  
  // Handle case-insensitive matching but return with proper casing
  const elementMap: Record<string, Element> = {
    'fire': 'Fire',
    'water': 'Water',
    'earth': 'Earth',
    'air': 'Air'
  };
  
  const lowerElement = element.toLowerCase();
  return elementMap[lowerElement] || null;
}

/**
 * Creates normalized ElementalProperties from any object with element-like properties
 * 
 * @param obj Object with potential element properties
 * @returns Normalized ElementalProperties
 */
export function normalizeElementalProperties(obj: Record<string, unknown>): ElementalProperties {
  const result: ElementalProperties = { ...DEFAULT_ELEMENTAL_PROPERTIES };
  
  // Map elements with proper casing
  const elementKeys = {
    'fire': 'Fire',
    'water': 'Water',
    'earth': 'Earth',
    'air': 'Air',
    'Fire': 'Fire',
    'Water': 'Water',
    'Earth': 'Earth',
    'Air': 'Air'
  };
  
  // Process the input object
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = elementKeys[key as keyof typeof elementKeys];
    if (normalizedKey && typeof value === 'number') {
      result[normalizedKey] = value;
    }
  }
  
  return result;
} 