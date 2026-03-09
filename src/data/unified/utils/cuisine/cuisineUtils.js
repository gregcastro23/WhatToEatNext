'use strict';
/**
 * CuisineUtils - Helper functions for cuisine data handling
 * This file contains utility functions shared between the cuisine modules to prevent circular dependencies
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.getSharedIngredients =
  exports.isCuisineCompatibleWithIngredient =
  exports.getIngredientsForCuisine =
  exports.getCuisinePAirings =
    void 0;
const grainCuisineMatrix_1 = require('../../data/integrations/grainCuisineMatrix');
const herbCuisineMatrix_1 = require('../../data/integrations/herbCuisineMatrix');
/**
 * Get cuisine pAirings for a specific ingredient
 */
function getCuisinePAirings(ingredientName, category) {
  switch (category) {
    case 'grain':
      return grainCuisineMatrix_1.grainCuisineMatrix[ingredientName]?.cuisines || [];
    case 'herb':
      return herbCuisineMatrix_1.herbCuisineMatrix[ingredientName] || [];
    // Additional categories can be added as their matrix files are created
    default:
      return [];
  }
}
exports.getCuisinePAirings = getCuisinePAirings;
/**
 * Get ingredient recommendations for a specific cuisine
 */
function getIngredientsForCuisine(cuisineName, categories = ['grain', 'herb']) {
  const result = {
    grain: [],
    herb: [],
    spice: [],
    protein: [],
    vegetable: [],
    fruit: [],
    oil: [],
    vinegar: [],
    seasoning: [],
  };
  // Process each matrix to find ingredients that pAir with this cuisine
  if (categories.includes('grain')) {
    Object.entries(grainCuisineMatrix_1.grainCuisineMatrix).forEach(([grain, data]) => {
      if (data.cuisines.includes(cuisineName)) {
        result.grain.push(grain);
      }
    });
  }
  if (categories.includes('herb')) {
    Object.entries(herbCuisineMatrix_1.herbCuisineMatrix).forEach(([herb, cuisines]) => {
      if (cuisines.includes(cuisineName)) {
        result.herb.push(herb);
      }
    });
  }
  // Additional matrices can be processed here
  return result;
}
exports.getIngredientsForCuisine = getIngredientsForCuisine;
/**
 * Check if a cuisine is compatible with a specific ingredient
 */
function isCuisineCompatibleWithIngredient(cuisineName, ingredientName, category) {
  const compatibleCuisines = getCuisinePAirings(ingredientName, category);
  return compatibleCuisines.includes(cuisineName);
}
exports.isCuisineCompatibleWithIngredient = isCuisineCompatibleWithIngredient;
/**
 * Get the shared ingredients between two cuisines
 */
function getSharedIngredients(cuisine1, cuisine2, categories = ['grain', 'herb']) {
  const cuisine1Ingredients = getIngredientsForCuisine(cuisine1, categories);
  const cuisine2Ingredients = getIngredientsForCuisine(cuisine2, categories);
  const shared = [];
  // Find shared ingredients across all categories
  for (const category of categories) {
    const c1Ingredients = cuisine1Ingredients[category] || [];
    const c2Ingredients = cuisine2Ingredients[category] || [];
    for (const ingredient of c1Ingredients) {
      if (c2Ingredients.includes(ingredient)) {
        shared.push(ingredient);
      }
    }
  }
  return shared;
}
exports.getSharedIngredients = getSharedIngredients;
