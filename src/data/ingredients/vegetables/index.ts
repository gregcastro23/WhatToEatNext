import type { IngredientMapping } from '@/types/alchemy';
import { leafyGreens } from './leafyGreens';
import { roots } from './roots';
import { cruciferous } from './cruciferous';
import { nightshades } from './nightshades';
import { alliums } from './alliums';
import { squash } from './squash';
import { starchyVegetables } from './starchy';
import { legumes } from './legumes';

// Combine all vegetable categories
export const vegetables: Record<string, IngredientMapping> = {
  ...leafyGreens,
  ...roots,
  ...cruciferous,
  ...nightshades,
  ...alliums,
  ...squash,
  ...starchyVegetables,
  ...legumes
};

// Create enhanced vegetables with additional properties
export const enhancedVegetables = vegetables;

// For standardization - both exports refer to the same object
export const standardizedVegetables = vegetables;

// Export individual categories
export {
  leafyGreens,
  roots,
  cruciferous,
  nightshades,
  alliums,
  squash,
  starchyVegetables,
  legumes
};

// Helper functions
export const getVegetablesBySubCategory = (subCategory: string): Record<string, IngredientMapping> => {
  return Object.entries(vegetables)
    .filter(([_, value]) => value.subCategory === subCategory)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSeasonalVegetables = (season: string): Record<string, IngredientMapping> => {
  return Object.entries(vegetables)
    .filter(([_, value]) => value.season?.includes?.(season))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getVegetablesByCookingMethod = (method: string): Record<string, IngredientMapping> => {
  return Object.entries(vegetables)
    .filter(([_, value]) => value.cookingMethods?.includes?.(method))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export default roots;
