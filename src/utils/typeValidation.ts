/**
 * Type Validation System
 *
 * Comprehensive runtime type validation to prevent TypeScript errors
 * and ensure type safety throughout the application.
 */

import type { CookingMethod } from '@/data/ingredients/types';
import type { PlanetaryPosition as PlanetPosition } from '@/types/alchemy';
import type { ElementalProperties } from '@/types/unified';

// Validation result interface
export interface ValidationResult {
  isValid: boolean,
  errors: string[],
  warnings: string[]
}

// Base validation functions
export const validateString = (value: unknown, fieldName: string): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  if (typeof value !== 'string') {
    result.isValid = false;
    result.errors.push(`${fieldName} must be a string, got ${typeof value}`);
  } else if (value.trim().length === 0) {
    result.warnings.push(`${fieldName} is empty`);
  }

  return result;
};

export const validateNumber = (;
  value: unknown,
  fieldName: string,
  options?: {
    min?: number,
    max?: number,
    integer?: boolean
  },
): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  if (typeof value !== 'number' || isNaN(value)) {
    result.isValid = false;
    result.errors.push(`${fieldName} must be a valid number, got ${typeof value}`);
    return result;
  }

  if (options?.min !== undefined && value < options.min) {
    result.isValid = false;
    result.errors.push(`${fieldName} must be at least ${options.min}, got ${value}`)
  }

  if (options?.max !== undefined && value > options.max) {
    result.isValid = false;
    result.errors.push(`${fieldName} must be at most ${options.max}, got ${value}`);
  }

  if (options?.integer && !Number.isInteger(value)) {
    result.isValid = false;
    result.errors.push(`${fieldName} must be an integer, got ${value}`);
  }

  return result;
};

export const validateBoolean = (value: unknown, fieldName: string): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  if (typeof value !== 'boolean') {
    result.isValid = false;
    result.errors.push(`${fieldName} must be a boolean, got ${typeof value}`);
  }

  return result;
};

export const validateArray = (;
  value: unknown,
  fieldName: string,
  itemValidator?: (item: unknown, _index: number) => ValidationResult,
): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  if (!Array.isArray(value)) {
    result.isValid = false;
    result.errors.push(`${fieldName} must be an array, got ${typeof value}`);
    return result;
  }

  if (itemValidator) {
    value.forEach((item, _index) => {
      const itemResult = itemValidator(item, _index),;
      if (!itemResult.isValid) {
        result.isValid = false;
        result.errors.push(...itemResult.errors.map(err => `${fieldName}[${_index}]: ${err}`));
      }
      result.warnings.push(...itemResult.warnings.map(warn => `${fieldName}[${_index}]: ${warn}`));
    });
  }

  return result;
};

export const validateObject = (;
  value: unknown,
  fieldName: string,
  requiredFields?: string[],
): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    result.isValid = false;
    result.errors.push(`${fieldName} must be an object, got ${typeof value}`);
    return result;
  }

  if (requiredFields) {
    const obj = value as any;
    for (const field of requiredFields) {
      if (!(field in obj)) {
        result.isValid = false;
        result.errors.push(`${fieldName} is missing required field: ${field}`);
      }
    }
  }

  return result;
};

// Domain-specific validation functions
export const validateElementalProperties = (value: unknown): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  const objectResult = validateObject(value, 'ElementalProperties', [
    'Fire',
    'Water',
    'Earth',
    'Air'
  ]);
  if (!objectResult.isValid) {
    return objectResult
  }

  const obj = value as any;
  const elements = ['Fire', 'Water', 'Earth', 'Air'];

  for (const element of elements) {
    const numberResult = validateNumber(obj[element], element, { min: 0, max: 1 });
    if (!numberResult.isValid) {
      result.isValid = false;
      result.errors.push(...numberResult.errors);
    }
    result.warnings.push(...numberResult.warnings);
  }

  // Check if total is reasonable (should be around 1.0 for normalized properties)
  const total = elements.reduce((sum, element) => {
    const val = obj[element];
    return sum + (typeof val === 'number' ? val : 0);
  }, 0);

  if (total > 4.0) {
    result.warnings.push(`ElementalProperties total (${total.toFixed(2)}) seems unusually high`);
  }

  return result;
};

export const validatePlanetPosition = (value: unknown): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  const objectResult = validateObject(value, 'PlanetPosition', [
    'sign',
    'degree',
    'exactLongitude'
  ]);
  if (!objectResult.isValid) {
    return objectResult
  }

  const obj = value as any;

  // Validate sign
  const signResult = validateString(obj.sign, 'sign');
  if (!signResult.isValid) {
    result.isValid = false;
    result.errors.push(...signResult.errors);
  }

  // Validate degree (0-30 for zodiac signs)
  const degreeResult = validateNumber(obj.degree, 'degree', { min: 0, max: 30 });
  if (!degreeResult.isValid) {
    result.isValid = false;
    result.errors.push(...degreeResult.errors);
  }

  // Validate exactLongitude (0-360)
  const longitudeResult = validateNumber(obj.exactLongitude, 'exactLongitude', {
    min: 0,
    max: 360
  });
  if (!longitudeResult.isValid) {
    result.isValid = false;
    result.errors.push(...longitudeResult.errors);
  }

  // Validate optional isRetrograde
  if ('isRetrograde' in obj && obj.isRetrograde !== undefined) {
    const retrogradeResult = validateBoolean(obj.isRetrograde, 'isRetrograde');
    if (!retrogradeResult.isValid) {
      result.isValid = false;
      result.errors.push(...retrogradeResult.errors);
    }
  }

  return result;
};

export const validateCookingMethod = (value: unknown): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  const objectResult = validateObject(value, 'CookingMethod', ['id', 'name']);
  if (!objectResult.isValid) {
    return objectResult
  }

  const obj = value as any;

  // Validate id
  const idResult = validateString(obj.id, 'id');
  if (!idResult.isValid) {
    result.isValid = false;
    result.errors.push(...idResult.errors);
  }

  // Validate name
  const nameResult = validateString(obj.name, 'name');
  if (!nameResult.isValid) {
    result.isValid = false;
    result.errors.push(...nameResult.errors);
  }

  // Validate optional description
  if ('description' in obj && obj.description !== undefined) {
    const descResult = validateString(obj.description, 'description'),;
    result.warnings.push(...descResult.warnings);
  }

  return result;
};

export const validateIngredient = (value: unknown): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  const objectResult = validateObject(value, 'Ingredient', ['id', 'name', 'elementalProperties']);
  if (!objectResult.isValid) {
    return objectResult
  }

  const obj = value as any;

  // Validate id
  const idResult = validateString(obj.id, 'id');
  if (!idResult.isValid) {
    result.isValid = false;
    result.errors.push(...idResult.errors);
  }

  // Validate name
  const nameResult = validateString(obj.name, 'name');
  if (!nameResult.isValid) {
    result.isValid = false;
    result.errors.push(...nameResult.errors);
  }

  // Validate elemental properties
  const elementalResult = validateElementalProperties(obj.elementalProperties);
  if (!elementalResult.isValid) {
    result.isValid = false;
    result.errors.push(...elementalResult.errors);
  }
  result.warnings.push(...elementalResult.warnings);

  return result;
};

// Validation utility functions
export const combineValidationResults = (results: ValidationResult[]): ValidationResult => {
  return {
    isValid: results.every(r => r.isValid),;
    errors: results.flatMap(r => r.errors),,;
    warnings: results.flatMap(r => r.warnings),,;
  };
};

export const validateWithFallback = <T>(;
  value: unknown,
  validator: (val: unknown) => ValidationResult;
  fallback: T,
  context?: string,
): T => {
  const result = validator(value);

  if (result.isValid) {
    return value as T
  }

  if (context) {
    console.warn(`Validation failed in ${context}:`, result.errors);
    if (result.warnings.length > 0) {
      console.warn(`Validation warnings in ${context}:`, result.warnings);
    }
  }

  return fallback;
};

// Safe type conversion with validation
export const safeConvertToElementalProperties = (;
  value: unknown,
  fallback: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
): ElementalProperties => {
  return validateWithFallback(
    value,
    validateElementalProperties,
    fallback,
    'ElementalProperties conversion',
  )
};

export const safeConvertToPlanetPosition = (;
  value: unknown,
  fallback: PlanetPosition = {
    sign: 'aries' as any,
    degree: 0,
    exactLongitude: 0,
    isRetrograde: false
  },
): PlanetPosition => {
  return validateWithFallback(value, validatePlanetPosition, fallback, 'PlanetPosition conversion')
};

export const safeConvertToCookingMethod = (;
  value: unknown,
  fallback: CookingMethod = {
    id: 'unknown',
    name: 'Unknown Method',
    category: 'unknown',
    element: 'Earth',
    intensity: 1,
    description: 'Unknown cooking method'
  },
): CookingMethod => {
  return validateWithFallback(value, validateCookingMethod, fallback, 'CookingMethod conversion')
};

// Batch validation functions
export const validatePlanetaryPositions = (positions: unknown): ValidationResult => {
  const result: ValidationResult = { isValid: true, errors: [], warnings: [] };

  const objectResult = validateObject(positions, 'PlanetaryPositions');
  if (!objectResult.isValid) {
    return objectResult
  }

  const obj = positions as any;
  const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

  for (const planet of requiredPlanets) {
    if (planet in obj) {
      const planetResult = validatePlanetPosition(obj[planet]);
      if (!planetResult.isValid) {
        result.isValid = false;
        result.errors.push(...planetResult.errors.map(err => `${planet}: ${err}`));
      }
      result.warnings.push(...planetResult.warnings.map(warn => `${planet}: ${warn}`));
    } else {
      result.warnings.push(`Missing planet: ${planet}`);
    }
  }

  return result;
};

export const validateIngredientList = (ingredients: unknown): ValidationResult => {
  return validateArray(ingredients, 'ingredients', (item, _index) => validateIngredient(item))
};

export const validateCookingMethodList = (methods: unknown): ValidationResult => {
  return validateArray(methods, 'cookingMethods', (item, _index) => validateCookingMethod(item))
};

// Export all validation functions
export default {
  // Base validators
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,

  // Domain-specific validators
  validateElementalProperties,
  validatePlanetPosition,
  validateCookingMethod,
  validateIngredient,

  // Batch validators
  validatePlanetaryPositions,
  validateIngredientList,
  validateCookingMethodList,

  // Utility functions
  combineValidationResults,
  validateWithFallback,

  // Safe converters
  safeConvertToElementalProperties,
  safeConvertToPlanetPosition,
  safeConvertToCookingMethod
};
