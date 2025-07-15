"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRecipeExt = exports.validateIngredientExt = exports.validateElementalPropertiesExt = exports.validators = exports.validateSeasonality = exports.validateSeason = exports.validateRecipe = exports.validateIngredient = exports.createElementalCompatibilityMatrix = exports.validateElementalProperties = exports.normalizeElementalProperties = void 0;
const seasonalCore_1 = require("../constants/seasonalCore");
const unitConstants_1 = require("../constants/unitConstants");
const VALID_MEAL_TIMES = ['breakfast', 'lunch', 'dinner'];
/**
 * Normalizes elemental properties to ensure they sum to 1
 * Following elemental self-reinforcement principles
 * @param properties The elemental properties to normalize
 * @returns Normalized elemental properties
 */
const normalizeElementalProperties = (properties) => {
    const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    if (sum === 0) {
        // If sum is 0, distribute equally (neutral state)
        return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        };
    }
    // Normalize each value while preserving elemental relationships
    return Object.entries(properties).reduce((acc, [key, value]) => {
        acc[key] = value / sum;
        return acc;
    }, {});
};
exports.normalizeElementalProperties = normalizeElementalProperties;
/**
 * Validates elemental properties following self-reinforcement principles
 * Each element is valuable and contributes its own unique qualities
 * @param properties The elemental properties to validate
 * @returns True if valid, false otherwise
 */
const validateElementalProperties = (properties) => {
    if (!properties)
        return false;
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    const hasAllElements = requiredElements.every(element => typeof properties[element] === 'number');
    if (!hasAllElements)
        return false;
    // Check that all values are non-negative (elements don't oppose each other)
    const allPositive = Object.values(properties).every(val => val >= 0);
    if (!allPositive)
        return false;
    const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 1) < 0.01;
};
exports.validateElementalProperties = validateElementalProperties;
exports.validateElementalPropertiesExt = exports.validateElementalProperties;
/**
 * Creates elemental compatibility matrix following self-reinforcement principles
 * Same elements have highest compatibility, all combinations work well together
 */
const createElementalCompatibilityMatrix = () => {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    const matrix = {};
    elements.forEach(element1 => {
        matrix[element1] = {};
        elements.forEach(element2 => {
            if (element1 === element2) {
                // Same element has highest compatibility (self-reinforcement)
                matrix[element1][element2] = 0.9;
            }
            else {
                // All different element combinations have good compatibility
                matrix[element1][element2] = 0.7;
            }
        });
    });
    return matrix;
};
exports.createElementalCompatibilityMatrix = createElementalCompatibilityMatrix;
/**
 * Enhanced ingredient validation with comprehensive checks
 */
const validateIngredient = (ingredient) => {
    if (!ingredient)
        return false;
    // Basic property validation
    if (!ingredient.name || typeof ingredient.name !== 'string' || ingredient.name.trim() === '') {
        return false;
    }
    if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
        return false;
    }
    if (!ingredient.unit || !unitConstants_1.VALID_UNITS.includes(ingredient.unit.toLowerCase())) {
        return false;
    }
    // Category validation
    if (!ingredient.category || typeof ingredient.category !== 'string') {
        return false;
    }
    // Elemental properties validation
    if (ingredient.elementalProperties && !(0, exports.validateElementalProperties)(ingredient.elementalProperties)) {
        return false;
    }
    // Seasonality validation (optional)
    if (ingredient.seasonality) {
        if (!Array.isArray(ingredient.seasonality))
            return false;
        const normalizedSeasons = ingredient.seasonality.map(s => s.toLowerCase());
        const validSeasons = seasonalCore_1.VALID_SEASONS.map(s => s.toLowerCase());
        if (!normalizedSeasons.every(s => validSeasons.includes(s))) {
            return false;
        }
    }
    return true;
};
exports.validateIngredient = validateIngredient;
exports.validateIngredientExt = exports.validateIngredient;
/**
 * Enhanced recipe validation with comprehensive checks
 */
const validateRecipe = (recipe) => {
    if (!recipe)
        return false;
    // Basic property validation
    if (!recipe.name || typeof recipe.name !== 'string' || recipe.name.trim() === '') {
        return false;
    }
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        return false;
    }
    // Validate all ingredients
    if (!recipe.ingredients.every(exports.validateIngredient)) {
        return false;
    }
    // Validate elemental properties if they exist
    if (recipe.elementalProperties && !(0, exports.validateElementalProperties)(recipe.elementalProperties)) {
        return false;
    }
    // Validate seasonality (optional)
    if (recipe.season) {
        const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
        const normalizedSeasons = seasons.map(s => s.toLowerCase());
        const validSeasons = seasonalCore_1.VALID_SEASONS.map(s => s.toLowerCase());
        if (!normalizedSeasons.every(s => validSeasons.includes(s))) {
            return false;
        }
    }
    // Validate cuisine (optional)
    if (recipe.cuisine && typeof recipe.cuisine !== 'string') {
        return false;
    }
    return true;
};
exports.validateRecipe = validateRecipe;
exports.validateRecipeExt = exports.validateRecipe;
/**
 * Validates season values
 */
const validateSeason = (season) => {
    const validSeasons = ['spring', 'summer', 'autumn', 'fall', 'winter'];
    return validSeasons.includes(season.toLowerCase());
};
exports.validateSeason = validateSeason;
/**
 * Validates seasonality arrays
 */
const validateSeasonality = (seasonality) => {
    if (!Array.isArray(seasonality))
        return false;
    return seasonality.every(season => (0, exports.validateSeason)(season));
};
exports.validateSeasonality = validateSeasonality;
// Export validators object for backward compatibility
exports.validators = {
    validateElementalProperties: exports.validateElementalProperties,
    validateIngredient: exports.validateIngredient,
    validateRecipe: exports.validateRecipe,
    validateSeason: exports.validateSeason,
    validateSeasonality: exports.validateSeasonality,
    normalizeElementalProperties: exports.normalizeElementalProperties,
    createElementalCompatibilityMatrix: exports.createElementalCompatibilityMatrix
};
