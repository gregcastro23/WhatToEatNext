"use strict";
/**
 * Comprehensive Validation and Type Guards Utility
 *
 * This module provides validation functions and type guards for various data structures
 * used throughout the application. Consolidated from validation.ts and typeGuards.ts.
 */

/**
 * Type guard to check if an object is a valid ElementalProperties structure
 * @param obj Object to check
 * @returns True if the object is a valid ElementalProperties structure
 */
export function isElementalProperties(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const elementalObj = obj;
    // Check for required elemental properties
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    for (const element of requiredElements) {
        if (!(element in elementalObj) || typeof elementalObj[element] !== 'number') {
            return false;
        }
        // Check if values are within valid range (0-1)
        const value = elementalObj[element];
        if (value < 0 || value > 1 || isNaN(value)) {
            return false;
        }
    }
    return true;
}

/**
 * Type guard to check if a string is a valid elemental property key
 * @param key String to check
 * @returns True if the string is a valid elemental property key
 */
export function isElementalPropertyKey(key) {
    return typeof key === 'string' && ['Fire', 'Water', 'Earth', 'Air'].includes(key);
}

/**
 * Type guard to check if an object is a valid ChakraEnergies structure
 * @param obj Object to check
 * @returns True if the object is a valid ChakraEnergies structure
 */
export function isChakraEnergies(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const chakraObj = obj;
    // Check for required chakra properties
    const requiredChakras = [
        'root',
        'sacral',
        'solarPlexus',
        'heart',
        'throat',
        'thirdEye',
        'crown'
    ];
    for (const chakra of requiredChakras) {
        if (!(chakra in chakraObj) || typeof chakraObj[chakra] !== 'number') {
            return false;
        }
        // Validate that chakra energy is in expected range (1-10)
        const energy = chakraObj[chakra];
        if (energy < 1 || energy > 10 || isNaN(energy)) {
            return false;
        }
    }
    return true;
}

/**
 * Type guard to check if a string is a valid chakra key
 * @param key String to check
 * @returns True if the string is a valid chakra key
 */
export function isChakraKey(key) {
    return typeof key === 'string' && ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'].includes(key);
}

/**
 * Type guard to check if an object has planetary position structure
 * @param obj Object to check
 * @returns True if the object has planetary position properties
 */
export function isPlanetaryPositions(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const positionsObj = obj;
    // Check for at least some basic planetary positions
    const basicPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    let foundPlanets = 0;
    for (const planet of basicPlanets) {
        if (planet in positionsObj) {
            foundPlanets++;
        }
    }
    // Should have at least 3 of the basic planets
    return foundPlanets >= 3;
}

/**
 * Type guard to check if an object is a valid zodiac energies structure
 * @param obj Object to check
 * @returns True if the object is a valid zodiac energies structure
 */
export function isZodiacEnergies(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const zodiacObj = obj;
    // Check that all values are numbers
    for (const value of Object.values(zodiacObj)) {
        if (typeof value !== 'number') {
            return false;
        }
    }
    return true;
}

/**
 * Logs unexpected values for debugging purposes
 * @param context Context where the unexpected value occurred
 * @param details Details about the unexpected value
 */
export function logUnexpectedValue(context, details) {
    // console.warn(`Unexpected value in ${context}:`, details);
}

/**
 * Validates that a value is a number within a specified range
 * @param value Value to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns True if the value is a valid number within range
 */
export function isNumberInRange(value, min, max) {
    return typeof value === 'number' &&
        !isNaN(value) &&
        value >= min &&
        value <= max;
}

/**
 * Validates that a value is a positive number
 * @param value Value to validate
 * @returns True if the value is a positive number
 */
export function isPositiveNumber(value) {
    return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates that a value is a non-negative number
 * @param value Value to validate
 * @returns True if the value is a non-negative number
 */
export function isNonNegativeNumber(value) {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Type guard to check if a value is a non-empty string
 * @param value Value to check
 * @returns True if the value is a non-empty string
 */
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}

/**
 * Validates that an object has all required properties
 * @param obj Object to validate
 * @param requiredProps Array of required property names
 * @returns True if the object has all required properties
 */
export function hasRequiredProperties(obj, requiredProps) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const objRecord = obj;
    for (const prop of requiredProps) {
        if (!(prop in objRecord)) {
            return false;
        }
    }
    return true;
}

/**
 * Validates that an array contains only elements of a specific type
 * @param arr Array to validate
 * @param typeCheck Function to check each element's type
 * @returns True if all elements pass the type check
 */
export function isArrayOfType(arr, typeCheck) {
    if (!Array.isArray(arr)) {
        return false;
    }
    return arr.every(typeCheck);
}

/**
 * Validates that a string matches an allowed pattern
 * @param str String to validate
 * @param allowedPattern Array of allowed values or regex pattern
 * @returns True if the string matches the allowed pattern
 */
export function isValidString(str, allowedPattern) {
    if (typeof str !== 'string') {
        return false;
    }
    if (Array.isArray(allowedPattern)) {
        return allowedPattern.includes(str);
    }
    if (allowedPattern instanceof RegExp) {
        return allowedPattern.test(str);
    }
    return true; // If no pattern specified, any string is valid
}
