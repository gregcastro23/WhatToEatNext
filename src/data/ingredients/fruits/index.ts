import type { IngredientMapping } from '@/types/alchemy';
import { citrus } from './citrus';
import { berries } from './berries';
import { tropical } from './tropical';
import { stoneFruit } from './stoneFruit';
import { pome } from './pome';
import { melons } from './melons';

// Combine all fruit categories
export const fruits: Record<string, IngredientMapping> = {
  ...citrus,
  ...berries,
  ...tropical,
  ...stoneFruit,
  ...pome,
  ...melons
};

// Export individual categories
export {
  citrus,
  berries,
  tropical,
  stoneFruit,
  pome,
  melons
};

// Helper functions
export const getFruitsBySubCategory = (subCategory: string): Record<string, IngredientMapping> => {
  return Object.entries(fruits)
    .filter(([_, value]) => value.subCategory === subCategory)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getSeasonalFruits = (season: string): Record<string, IngredientMapping> => {
  return Object.entries(fruits)
    .filter(([_, value]) => value.season.includes(season))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const getFruitsByPreparation = (method: string): Record<string, IngredientMapping> => {
  return Object.entries(fruits)
    .filter(([_, value]) => value.preparation && value.preparation[method])
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export const findCompatibleFruits = (ingredientName: string): string[] => {
  const fruit = fruits[ingredientName];
  if (!fruit) return [];
  return fruit.affinities || [];
};

// Types
export type FruitSubCategory = 
  | 'citrus'
  | 'berry'
  | 'tropical'
  | 'stone fruit'
  | 'pome'
  | 'melon';

export type FruitRipeness = 
  | 'unripe'
  | 'ripe'
  | 'very ripe';

export type FruitTexture = 
  | 'firm'
  | 'soft'
  | 'juicy'
  | 'crisp'
  | 'creamy';

// Validation
export const isValidFruit = (ingredient: unknown): ingredient is IngredientMapping => {
  if (typeof ingredient !== 'object' || !ingredient) return false;
  
  const requiredProperties = [
    'elementalProperties',
    'qualities',
    'season',
    'category',
    'subCategory',
    'nutritionalProfile',
    'preparation',
    'storage'
  ];

  return requiredProperties.every(prop => prop in ingredient);
};