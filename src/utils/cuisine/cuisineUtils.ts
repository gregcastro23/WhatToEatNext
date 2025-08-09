/**
 * CuisineUtils - Helper functions for cuisine data handling
 * This file contains utility functions shared between the cuisine modules to prevent circular dependencies
 */

import type { IngredientCategory } from '../../data/ingredients/types';
import { grainCuisineMatrix } from '../../data/integrations/grainCuisineMatrix';
import { herbCuisineMatrix } from '../../data/integrations/herbCuisineMatrix';

/**
 * Get cuisine pairings for a specific ingredient
 */
export function getCuisinePAirings(ingredientName: string, category: IngredientCategory): string[] {
  switch (category) {
    case 'grain':
      const grainData = grainCuisineMatrix[ingredientName] as any;
      return grainData?.cuisines || [];
    case 'culinary_herb':
      return herbCuisineMatrix[ingredientName] || [];
    // Additional categories can be added as their matrix files are created
    default:
      return [];
  }
}

/**
 * Get ingredient recommendations for a specific cuisine
 */
export function getIngredientsForCuisine(
  cuisineName: string,
  categories: IngredientCategory[] = ['grain', 'culinary_herb'],
): Record<IngredientCategory, string[]> {
  const result: Record<IngredientCategory, string[]> = {
    grain: [],
    culinary_herb: [],
    spice: [],
    protein: [],
    vegetable: [],
    fruit: [],
    oil: [],
    vinegar: [],
    seasoning: [],
    dairy: [],
  };

  // Process each matrix to find ingredients that pAir with this cuisine
  if (categories.includes('grain')) {
    Object.entries(grainCuisineMatrix || {}).forEach(([grain, data]) => {
      const grainDataEntry = data as any;
      if (grainDataEntry?.cuisines && grainDataEntry.cuisines.includes(cuisineName)) {
        result.grain.push(grain);
      }
    });
  }

  if (categories.includes('culinary_herb')) {
    Object.entries(herbCuisineMatrix || {}).forEach(([herb, cuisines]) => {
      if (Array.isArray(cuisines) && cuisines.includes(cuisineName)) {
        result.culinary_herb.push(herb);
      }
    });
  }

  // Additional matrices can be processed here

  return result;
}

/**
 * Check if a cuisine is compatible with a specific ingredient
 */
export function isCuisineCompatibleWithIngredient(
  cuisineName: string,
  ingredientName: string,
  category: IngredientCategory,
): boolean {
  const compatibleCuisines = getCuisinePAirings(ingredientName, category);
  return Array.isArray(compatibleCuisines)
    ? compatibleCuisines.includes(cuisineName)
    : compatibleCuisines === cuisineName;
}

/**
 * Get the shared ingredients between two cuisines
 */
export function getSharedIngredients(
  cuisine1: string,
  cuisine2: string,
  categories: IngredientCategory[] = ['grain', 'culinary_herb'],
): string[] {
  const cuisine1Ingredients = getIngredientsForCuisine(cuisine1, categories);
  const cuisine2Ingredients = getIngredientsForCuisine(cuisine2, categories);

  const shared: string[] = [];

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
