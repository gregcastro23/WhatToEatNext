import { ZodiacSign, Element, Modality } from './zodiacAffinities';
import { Season } from './seasons';

/**
 * Data validation utilities for zodiac and astrological data
 * These functions help ensure data consistency and provide error handling
 * for missing or malformed data
 */

// ----- Type Guards ----- //

/**
 * Type guard to check if a string is a valid ZodiacSign
 */
export function isValidZodiacSign(sign: string): sign is ZodiacSign {
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  return validSigns.includes(sign.toLowerCase() as ZodiacSign);
}

/**
 * Type guard to check if a string is a valid Element
 */
export function isValidElement(element: string): element is Element {
  const validElements: Element[] = ['fire', 'earth', 'air', 'water'];
  return validElements.includes(element.toLowerCase() as Element);
}

/**
 * Type guard to check if a string is a valid Modality
 */
export function isValidModality(modality: string): modality is Modality {
  const validModalities: Modality[] = ['cardinal', 'fixed', 'mutable'];
  return validModalities.includes(modality.toLowerCase() as Modality);
}

/**
 * Type guard to check if a string is a valid Season
 */
export function isValidSeason(season: string): season is Season {
  const validSeasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
  return validSeasons.includes(season.toLowerCase() as Season);
}

// ----- Normalization Functions ----- //

/**
 * Normalizes a zodiac sign string to ensure it matches the expected format
 * @param sign The zodiac sign to normalize
 * @returns The normalized zodiac sign or null if invalid
 */
export function normalizeZodiacSign(sign: string): ZodiacSign | null {
  const normalizedSign = sign.toLowerCase();
  
  if (isValidZodiacSign(normalizedSign)) {
    return normalizedSign as ZodiacSign;
  }
  
  // Handle common variations and misspellings
  const signMappings: Record<string, ZodiacSign> = {
    'ari': 'aries',
    'tau': 'taurus',
    'gem': 'gemini',
    'can': 'cancer',
    'le': 'leo',
    'vir': 'virgo',
    'lib': 'libra',
    'sco': 'scorpio',
    'sag': 'sagittarius',
    'cap': 'capricorn',
    'aqu': 'aquarius',
    'pis': 'pisces'
  };
  
  for (const [key, value] of Object.entries(signMappings)) {
    if (normalizedSign.startsWith(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Normalizes an element string to ensure it matches the expected format
 * @param element The element to normalize
 * @returns The normalized element or null if invalid
 */
export function normalizeElement(element: string): Element | null {
  const normalizedElement = element.toLowerCase();
  
  if (isValidElement(normalizedElement)) {
    return normalizedElement as Element;
  }
  
  return null;
}

/**
 * Normalizes a modality string to ensure it matches the expected format
 * @param modality The modality to normalize
 * @returns The normalized modality or null if invalid
 */
export function normalizeModality(modality: string): Modality | null {
  const normalizedModality = modality.toLowerCase();
  
  if (isValidModality(normalizedModality)) {
    return normalizedModality as Modality;
  }
  
  // Handle common variations
  const modalityMappings: Record<string, Modality> = {
    'card': 'cardinal',
    'fix': 'fixed',
    'mut': 'mutable'
  };
  
  for (const [key, value] of Object.entries(modalityMappings)) {
    if (normalizedModality.startsWith(key)) {
      return value;
    }
  }
  
  return null;
}

// ----- Error Handling Functions ----- //

/**
 * Gets a default zodiac sign to use when input is invalid
 * @returns A default zodiac sign
 */
export function getDefaultZodiacSign(): ZodiacSign {
  return 'aries';
}

/**
 * Gets a default element to use when input is invalid
 * @returns A default element
 */
export function getDefaultElement(): Element {
  return 'fire';
}

/**
 * Gets a default modality to use when input is invalid
 * @returns A default modality
 */
export function getDefaultModality(): Modality {
  return 'cardinal';
}

/**
 * Safely retrieves a zodiac sign, providing a fallback if invalid
 * @param sign The zodiac sign to validate
 * @returns The validated sign or a default value
 */
export function safeGetZodiacSign(sign: string | null | undefined): ZodiacSign {
  if (!sign) return getDefaultZodiacSign();
  
  const normalized = normalizeZodiacSign(sign);
  return normalized || getDefaultZodiacSign();
}

/**
 * Safely retrieves an element, providing a fallback if invalid
 * @param element The element to validate
 * @returns The validated element or a default value
 */
export function safeGetElement(element: string | null | undefined): Element {
  if (!element) return getDefaultElement();
  
  const normalized = normalizeElement(element);
  return normalized || getDefaultElement();
}

/**
 * Safely retrieves a modality, providing a fallback if invalid
 * @param modality The modality to validate
 * @returns The validated modality or a default value
 */
export function safeGetModality(modality: string | null | undefined): Modality {
  if (!modality) return getDefaultModality();
  
  const normalized = normalizeModality(modality);
  return normalized || getDefaultModality();
}

// ----- Data Structure Validation ----- //

/**
 * Interface for zodiac property validation results
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that a zodiac data object has all required properties
 * @param data The zodiac data object to validate
 * @returns Validation result with errors and warnings
 */
export function validateZodiacData(data: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  // Check for required properties
  const requiredProps = ['element', 'modality'];
  for (const prop of requiredProps) {
    if (!data[prop]) {
      result.isValid = false;
      result.errors.push(`Missing required property: ${prop}`);
    }
  }
  
  // Validate element
  if (data.element && !isValidElement(data.element)) {
    result.isValid = false;
    result.errors.push(`Invalid element: ${data.element}`);
  }
  
  // Validate modality
  if (data.modality && !isValidModality(data.modality)) {
    result.isValid = false;
    result.errors.push(`Invalid modality: ${data.modality}`);
  }
  
  // Check for recommended properties
  const recommendedProps = ['seasonalAffinities', 'cookingTechniques'];
  for (const prop of recommendedProps) {
    if (!data[prop]) {
      result.warnings.push(`Missing recommended property: ${prop}`);
    }
  }
  
  return result;
}

/**
 * Ensures all properties in an object follow the lowercase naming convention
 * @param obj The object to standardize
 * @returns A new object with standardized property names
 */
export function standardizePropertyNames<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const normalizedKey = key.toLowerCase();
    
    // Recursively standardize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[normalizedKey] = standardizePropertyNames(value);
    } else {
      result[normalizedKey] = value;
    }
  }
  
  return result;
}

/**
 * Safely accesses a nested property in an object with error handling
 * @param obj The object to access
 * @param path The path to the nested property (dot notation)
 * @param defaultValue The default value to return if property doesn't exist
 * @returns The value at the path or the default value
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return (current === undefined || current === null) ? defaultValue : current as T;
}

// ----- Integration Helpers ----- //

/**
 * Creates a standardized zodiac data object with all required properties
 * @param data Partial zodiac data
 * @returns Complete standardized zodiac data
 */
export function createStandardZodiacData(data: Partial<Record<string, any>>): Record<string, any> {
  // Create a base object with default values
  const standardData = {
    sign: safeGetZodiacSign(data.sign as string),
    element: safeGetElement(data.element as string),
    modality: safeGetModality(data.modality as string),
    seasonalAffinities: data.seasonalAffinities || {},
    cookingTechniques: data.cookingTechniques || []
  };
  
  // Add any additional properties from the original data
  return {
    ...standardData,
    ...standardizePropertyNames(data)
  };
} 