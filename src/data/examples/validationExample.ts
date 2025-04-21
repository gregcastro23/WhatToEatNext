import {
  isValidZodiacSign,
  normalizeZodiacSign,
  validateZodiacData,
  standardizePropertyNames,
  safeGet,
  createStandardZodiacData,
  type ValidationResult
} from '../validation';

/**
 * Example demonstrating how to use the validation utilities
 */

// Example 1: Validating and normalizing a zodiac sign input
function processUserZodiacInput(userInput: string): string {
  // First check if it's valid
  if (isValidZodiacSign(userInput)) {
    return `The zodiac sign "${userInput}" is valid!`;
  }
  
  // Try to normalize it if not initially valid
  const normalized = normalizeZodiacSign(userInput);
  if (normalized) {
    return `Normalized user input "${userInput}" to "${normalized}"`;
  }
  
  return `Invalid zodiac sign: "${userInput}"`;
}

// Example 2: Validating a zodiac data object
function validateUserZodiacData(userData: any): ValidationResult {
  return validateZodiacData(userData);
}

// Example 3: Standardizing property names to ensure consistency
function standardizeUserData(userData: Record<string, any>): Record<string, any> {
  return standardizePropertyNames(userData);
}

// Example 4: Safely accessing nested properties
function safelyAccessNestedData(data: any): void {
  // Safe way to access potentially missing data
  const element = safeGet(data, 'zodiacInfo.element', 'fire'); 
  const modality = safeGet(data, 'zodiacInfo.modality', 'cardinal');
  
  console.log(`Element: ${element}, Modality: ${modality}`);
}

// Example 5: Creating standardized zodiac data from partial input
function createStandardizedData(partialData: Partial<Record<string, any>>): Record<string, any> {
  return createStandardZodiacData(partialData);
}

// Usage examples
export function runValidationExamples(): void {
  // Example 1: Validating and normalizing zodiac signs
  console.log(processUserZodiacInput('Aries')); // Valid
  console.log(processUserZodiacInput('aries')); // Valid
  console.log(processUserZodiacInput('ARI')); // Normalized
  console.log(processUserZodiacInput('Dragon')); // Invalid
  
  // Example 2: Validating zodiac data objects
  const validData = {
    element: 'fire',
    modality: 'cardinal',
    seasonalAffinities: { spring: 0.9, summer: 0.7 }
  };
  
  const invalidData = {
    element: 'plasma', // Invalid element
    modality: 'fixed'
  };
  
  console.log('Valid data validation:', validateUserZodiacData(validData));
  console.log('Invalid data validation:', validateUserZodiacData(invalidData));
  
  // Example 3: Standardizing property names
  const unstandardizedData = {
    Element: 'fire',
    Modality: 'cardinal',
    SeasonalPreferences: {
      Spring: 0.9,
      Summer: 0.7
    }
  };
  
  console.log('Standardized data:', standardizeUserData(unstandardizedData));
  
  // Example 4: Safely accessing nested properties
  const userData = {
    name: 'John',
    zodiacInfo: {
      sign: 'aries'
      // Missing element and modality
    }
  };
  
  safelyAccessNestedData(userData);
  
  // Example 5: Creating standardized zodiac data
  const partialUserData = {
    sign: 'sag',  // Abbreviated
    Element: 'Fire' // Non-standard casing
    // Missing modality
  };
  
  console.log('Standardized zodiac data:', createStandardizedData(partialUserData));
}

// Export examples
export {
  processUserZodiacInput,
  validateUserZodiacData,
  standardizeUserData,
  safelyAccessNestedData,
  createStandardizedData
}; 