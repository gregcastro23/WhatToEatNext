'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.validateIngredient = exports.validateRecipe = void 0;
const seasonalConstants_1 = require('@/constants/seasonalConstants');
function validateRecipe(recipe) {
  // Validate basic recipe properties
  if (!recipe.name || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
    return false;
  }
  // Validate season field if present
  if (recipe.season) {
    const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
    const isValidSeason = seasons.every(function (season) {
      // Convert to lowercase for case-insensitive comparison
      const normalizedSeason = season.toLowerCase();
      return seasonalConstants_1.VALID_SEASONS.map(function (s) {
        return s.toLowerCase();
      }).includes(normalizedSeason);
    });
    if (!isValidSeason) return false;
  }
  // Validate ingredients
  return recipe.ingredients.every(function (ing) {
    return validateIngredient(ing);
  });
}
exports.validateRecipe = validateRecipe;
function validateIngredient(ingredient) {
  // Validate basic ingredient properties
  if (!ingredient.name || typeof ingredient.amount !== 'number') {
    return false;
  }
  // Validate seasonality if present
  if (ingredient.seasonality) {
    if (!Array.isArray(ingredient.seasonality)) return false;
    const isValidSeasonality = ingredient.seasonality.every(function (season) {
      // Convert to lowercase for case-insensitive comparison
      const normalizedSeason = season.toLowerCase();
      return seasonalConstants_1.VALID_SEASONS.map(function (s) {
        return s.toLowerCase();
      }).includes(normalizedSeason);
    });
    if (!isValidSeasonality) return false;
  }
  // Validate elemental properties if present
  if (ingredient.elementalProperties) {
    const sum = Object.values(ingredient.elementalProperties).reduce(function (acc, val) {
      return acc + val;
    }, 0);
    if (Math.abs(sum - 1) > 0.000001) return false;
  }
  return true;
}
exports.validateIngredient = validateIngredient;
