import type { IngredientMapping } from '@/types/alchemy';
import { leafyGreens } from './leafyGreens';
import { rootVegetables } from './rootVegetables';
import { cruciferous } from './cruciferous';
import { nightshades } from './nightshades';
import { alliums } from './alliums';
import { squash } from './squash';
import { rootVegetables as roots } from './roots';
import { otherVegetables } from './otherVegetables';
import { legumes } from './legumes';

// Combine all vegetable categories
export const vegetables: Record<string, IngredientMapping> = {
  ...leafyGreens,
  ...rootVegetables,
  ...cruciferous,
  ...nightshades,
  ...alliums,
  ...squash,
  ...roots,
  ...otherVegetables,
  ...legumes
};

// Export individual categories
export {
  leafyGreens,
  rootVegetables,
  cruciferous,
  nightshades,
  alliums,
  squash,
  roots,
  otherVegetables,
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
    .filter(([_, value]) => value.season.includes(season))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getVegetablesByCookingMethod = (method: string): Record<string, IngredientMapping> => {
  return Object.entries(vegetables)
    .filter(([_, value]) => value.cookingMethods.includes(method))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};
