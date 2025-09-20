// Combines all cuisine matrix files into a unified cuisine pairing API

import { grainCuisineMatrix } from './grainCuisineMatrix';
import { herbCuisineMatrix } from './herbCuisineMatrix';

type IngredientCategory = 'grain' | 'herb' | 'spice' | 'protein' | 'vegetable';

/**
 * Get cuisine pairings for a specific ingredient
 */
export function getCuisinePairings(ingredientName: string, category: IngredientCategory): string[] {
  switch (category) {
    case 'grain':
      return grainCuisineMatrix[ingredientName] || [];
    case 'herb':
      return herbCuisineMatrix[ingredientName] || [];
    // Additional categories can be added as their matrix files are created
    default:
      return []
  }
}

/**
 * Get ingredient recommendations for a specific cuisine
 */
export function getIngredientsForCuisine(
  cuisineName: string,
  categories: IngredientCategory[] = ['grain', 'herb'],
): Record<IngredientCategory, string[]> {
  const result: Record<IngredientCategory, string[]> = {
    grain: [],
    herb: [],
    spice: [],
    protein: [],
    vegetable: []
  };

  // Process each matrix to find ingredients that pair with this cuisine
  if (categories.includes('grain')) {
    Object.entries(grainCuisineMatrix).forEach(([grain, cuisines]) => {
      if (cuisines.includes(cuisineName)) {
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
