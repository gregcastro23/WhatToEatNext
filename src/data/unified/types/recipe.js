"use strict";
// Validation utilities
export const validateElementalProperties = (properties) => {
    if (!properties)
        return false;
    const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
    if (!requiredElements.every(element => typeof properties[element] === 'number')) {
        return false;
    }
    const total = Object.values(properties).reduce((sum, val) => sum + val, 0);
    return Math.abs(total - 1) < 0.01;
};
export const validateRecipe = (recipe) => {
    if (!recipe)
        return false;
    if (!recipe.name || !recipe.id)
        return false;
    return true;
};
export const validateSeason = (season) => {
    const validSeasons = ['spring', 'summer', 'autumn', 'winter'];
    return validSeasons.includes(season.toLowerCase());
};
export const validateSeasonality = (seasonality) => {
    if (!Array.isArray(seasonality))
        return false;
    return seasonality.every(season => validateSeason(season));
};
export const validateIngredient = (ingredient) => {
    if (!ingredient)
        return false;
    // Required properties
    if (!ingredient.name || typeof ingredient.name !== 'string')
        return false;
    if (typeof ingredient.amount !== 'number')
        return false;
    if (!ingredient.unit || typeof ingredient.unit !== 'string')
        return false;
    // Validate elemental properties if present
    if (ingredient.elementalProperties && !validateElementalProperties(ingredient.elementalProperties)) {
        return false;
    }
    // Validate seasonality if present
    if (ingredient.seasonality && !validateSeasonality(ingredient.seasonality))
        return false;
    return true;
};
// Re-export validators with descriptive names
export { validateElementalProperties as validateElementalPropertiesExt, validateIngredient as validateIngredientExt, validateRecipe as validateRecipeExt } from './validators';
