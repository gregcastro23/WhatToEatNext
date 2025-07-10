"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRecipe = exports.validateIngredient = exports.validateElementalProperties = exports.normalizeElementalProperties = void 0;
const seasonalConstants_1 = require("@/constants/seasonalConstants");
const unitConstants_1 = require("@/constants/unitConstants");
const VALID_MEAL_TIMES = ['breakfast', 'lunch', 'dinner'];
/**
 * Normalizes elemental properties to ensure they sum to 1
 * @param properties The elemental properties to normalize
 * @returns Normalized elemental properties
 */
var normalizeElementalProperties = function (properties) {
    const sum = Object.values(properties).reduce(function (acc, val) { return acc + val; }, 0);
    if (sum === 0) {
        // If sum is 0, distribute equally
        return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
        };
    }
    // Normalize each value
    return Object.entries(properties).reduce(function (acc, _a) {
        const key = _a[0], value = _a[1];
        acc[key] = value / sum;
        return acc;
    }, {});
};
exports.normalizeElementalProperties = normalizeElementalProperties;
/**
 * Validates elemental properties
 * @param properties The elemental properties to validate
 * @returns True if valid, false otherwise
 */
var validateElementalProperties = function (properties) {
    if (!properties)
        return false;
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    const hasAllElements = requiredElements.every(function (element) {
        return typeof properties[element] === 'number';
    });
    if (!hasAllElements)
        return false;
    const sum = Object.values(properties).reduce(function (acc, val) { return acc + val; }, 0);
    return Math.abs(sum - 1) < 0.01;
};
exports.validateElementalProperties = validateElementalProperties;
var validateIngredient = function (ingredient) {
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
        const normalizedSeasons = ingredient.seasonality.map(function (s) { return s.toLowerCase(); });
        const validSeasons_1 = seasonalConstants_1.VALID_SEASONS.map(function (s) { return s.toLowerCase(); });
        if (!normalizedSeasons.every(function (s) { return validSeasons_1.includes(s); })) {
            return false;
        }
    }
    return true;
};
exports.validateIngredient = validateIngredient;
var validateRecipe = function (recipe) {
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
        if (!Array.isArray(recipe.season))
            return false;
        const normalizedSeasons = recipe.season.map(function (s) { return s.toLowerCase(); });
        const validSeasons_2 = seasonalConstants_1.VALID_SEASONS.map(function (s) { return s.toLowerCase(); });
        if (!normalizedSeasons.every(function (s) { return validSeasons_2.includes(s); })) {
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

// Export validators from TypeScript file
// This file ensures JavaScript modules can import from './validators'

import { 
  validateElementalProperties,
  validateIngredient,
  validateRecipe,
  normalizeElementalProperties
} from './validators.ts';

export {
  validateElementalProperties,
  validateIngredient, 
  validateRecipe,
  normalizeElementalProperties
};

// Export validators object for backward compatibility
export const validators = {
  validateElementalProperties,
  validateIngredient,
  validateRecipe,
  normalizeElementalProperties
};
