"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRecipeExt = exports.validateIngredientExt = exports.validateElementalPropertiesExt = exports.validateIngredient = exports.validateSeasonality = exports.validateSeason = exports.validateRecipe = exports.validateElementalProperties = void 0;
const validators_1 = require("./validators");
// Validation utilities
const validateElementalProperties = function (properties) {
    if (!properties)
        return false;
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    if (!requiredElements.every(function (element) { return typeof properties[element] === 'number'; })) {
        return false;
    }
    const total = Object.values(properties).reduce(function (sum, val) { return sum + val; }, 0);
    return Math.abs(total - 1) < 0.01;
};
exports.validateElementalProperties = validateElementalProperties;
const validateRecipe = function (recipe) {
    if (!recipe)
        return false;
    if (!recipe.name || !recipe.id)
        return false;
    return true;
};
exports.validateRecipe = validateRecipe;
const validateSeason = function (season) {
    const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
    return validSeasons.includes(season.toLowerCase());
};
exports.validateSeason = validateSeason;
const validateSeasonality = function (seasonality) {
    if (!Array.isArray(seasonality))
        return false;
    return seasonality.every(function (season) { return (0, exports.validateSeason)(season); });
};
exports.validateSeasonality = validateSeasonality;
const validateIngredient = function (ingredient) {
    if (!ingredient)
        return false;
    // Required properties
    if (!ingredient.name || typeof ingredient.name !== 'string')
        return false;
    if (typeof ingredient.amount !== 'number')
        return false;
    if (!ingredient.unit || typeof ingredient.unit !== 'string')
        return false;
    // Validate elemental properties
    if (!(0, exports.validateElementalProperties)(ingredient.elementalProperties))
        return false;
    // Validate seasonality if present
    if (ingredient.seasonality && !(0, exports.validateSeasonality)(ingredient.seasonality))
        return false;
    return true;
};
exports.validateIngredient = validateIngredient;
// Re-export validators with descriptive names
exports.validateElementalPropertiesExt = validators_1.validateElementalProperties;
exports.validateIngredientExt = validators_1.validateIngredient;
exports.validateRecipeExt = validators_1.validateRecipe;
