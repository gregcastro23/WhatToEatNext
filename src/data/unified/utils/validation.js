"use strict";
/**
 * Comprehensive Validation and Type Guards Utility
 *
 * This module provides validation functions and type guards for various data structures
 * used throughout the application. Consolidated from validation.ts and typeGuards.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidString = exports.isArrayOfType = exports.hasRequiredProperties = exports.isNonEmptyString = exports.isNonNegativeNumber = exports.isPositiveNumber = exports.isNumberInRange = exports.logUnexpectedValue = exports.isZodiacEnergies = exports.isPlanetaryPositions = exports.isChakraKey = exports.isChakraEnergies = exports.isElementalPropertyKey = exports.isElementalProperties = void 0;
/**
 * Type guard to check if an object is a valid ElementalProperties structure
 * @param obj Object to check
 * @returns True if the object is a valid ElementalProperties structure
 */
function isElementalProperties(obj) {
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
exports.isElementalProperties = isElementalProperties;
/**
 * Type guard to check if a string is a valid elemental property key
 * @param key String to check
 * @returns True if the string is a valid elemental property key
 */
function isElementalPropertyKey(key) {
    return typeof key === 'string' && ['Fire', 'Water', 'Earth', 'Air'].includes(key);
}
exports.isElementalPropertyKey = isElementalPropertyKey;
/**
 * Type guard to check if an object is a valid ChakraEnergies structure
 * @param obj Object to check
 * @returns True if the object is a valid ChakraEnergies structure
 */
function isChakraEnergies(obj) {
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
exports.isChakraEnergies = isChakraEnergies;
/**
 * Type guard to check if a string is a valid chakra key
 * @param key String to check
 * @returns True if the string is a valid chakra key
 */
function isChakraKey(key) {
    return typeof key === 'string' && ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'].includes(key);
}
exports.isChakraKey = isChakraKey;
/**
 * Type guard to check if an object has planetary position structure
 * @param obj Object to check
 * @returns True if the object has planetary position properties
 */
function isPlanetaryPositions(obj) {
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
exports.isPlanetaryPositions = isPlanetaryPositions;
/**
 * Type guard to check if an object is a valid zodiac energies structure
 * @param obj Object to check
 * @returns True if the object is a valid zodiac energies structure
 */
function isZodiacEnergies(obj) {
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
exports.isZodiacEnergies = isZodiacEnergies;
/**
 * Logs unexpected values for debugging purposes
 * @param context Context where the unexpected value occurred
 * @param details Details about the unexpected value
 */
function logUnexpectedValue(context, details) {
    console.warn(`Unexpected value in ${context}:`, details);
}
exports.logUnexpectedValue = logUnexpectedValue;
/**
 * Validates that a value is a number within a specified range
 * @param value Value to validate
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns True if the value is a valid number within range
 */
function isNumberInRange(value, min, max) {
    return typeof value === 'number' &&
        !isNaN(value) &&
        value >= min &&
        value <= max;
}
exports.isNumberInRange = isNumberInRange;
/**
 * Validates that a value is a positive number
 * @param value Value to validate
 * @returns True if the value is a positive number
 */
function isPositiveNumber(value) {
    return typeof value === 'number' && !isNaN(value) && value > 0;
}
exports.isPositiveNumber = isPositiveNumber;
/**
 * Validates that a value is a non-negative number
 * @param value Value to validate
 * @returns True if the value is a non-negative number
 */
function isNonNegativeNumber(value) {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
}
exports.isNonNegativeNumber = isNonNegativeNumber;
/**
 * Type guard to check if a value is a non-empty string
 * @param value Value to check
 * @returns True if the value is a non-empty string
 */
function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
exports.isNonEmptyString = isNonEmptyString;
/**
 * Validates that an object has all required properties
 * @param obj Object to validate
 * @param requiredProps Array of required property names
 * @returns True if the object has all required properties
 */
function hasRequiredProperties(obj, requiredProps) {
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
exports.hasRequiredProperties = hasRequiredProperties;
/**
 * Validates that an array contains only elements of a specific type
 * @param arr Array to validate
 * @param typeCheck Function to check each element's type
 * @returns True if all elements pass the type check
 */
function isArrayOfType(arr, typeCheck) {
    if (!Array.isArray(arr)) {
        return false;
    }
    return arr.every(typeCheck);
}
exports.isArrayOfType = isArrayOfType;
/**
 * Validates that a string is not empty and contains only valid characters
 * @param str String to validate
 * @param allowedPattern Optional regex pattern for allowed characters
 * @returns True if the string is valid
 */
function isValidString(str, allowedPattern) {
    if (typeof str !== 'string' || str.length === 0) {
        return false;
    }
    if (allowedPattern && !allowedPattern.test(str)) {
        return false;
    }
    return true;
}
exports.isValidString = isValidString;
