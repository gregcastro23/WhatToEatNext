/**
 * CuisineUtils - Helper functions for cuisine data handling
 * This file contains utility functions shared between the cuisine modules to prevent circular dependencies
 */
import { grainCuisineMatrix } from '../../data/integrations/grainCuisineMatrix.js';
import { herbCuisineMatrix } from '../../data/integrations/herbCuisineMatrix.js';

/**
 * Get cuisine pAirings for a specific ingredient
 */
export function getCuisinePAirings(ingredientName, category) {
    switch (category) {
        case 'grain':
            return grainCuisineMatrix[ingredientName]?.cuisines || [];
        case 'herb':
            return herbCuisineMatrix[ingredientName] || [];
        // Additional categories can be added as their matrix files are created
        default:
            return [];
    }
}

/**
 * Get ingredient recommendations for a specific cuisine
 */
export function getIngredientsForCuisine(cuisineName, categories = ['grain', 'herb']) {
    const result = {
        grain: [],
        herb: [],
        spice: [],
        protein: [],
        vegetable: [],
        fruit: [],
        oil: [],
        vinegar: [],
        seasoning: []
    };
    // Process each matrix to find ingredients that pAir with this cuisine
    if (categories.includes('grain')) {
        Object.entries(grainCuisineMatrix).forEach(([grain, data]) => {
            if (data.cuisines.includes(cuisineName)) {
                result.grain.push(grain);
            }
        });
    }
    if (categories.includes('herb')) {
        Object.entries(herbCuisineMatrix).forEach(([herb, cuisines]) => {
            if (cuisines.includes(cuisineName)) {
                result.herb.push(herb);
            }
        });
    }
    // Additional matrices can be processed here
    return result;
}

/**
 * Check if a cuisine is compatible with a specific ingredient
 */
export function isCuisineCompatibleWithIngredient(cuisineName, ingredientName, category) {
    const compatibleCuisines = getCuisinePAirings(ingredientName, category);
    return compatibleCuisines.includes(cuisineName);
}

/**
 * Get the shared ingredients between two cuisines
 */
export function getSharedIngredients(cuisine1, cuisine2, categories = ['grain', 'herb']) {
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
