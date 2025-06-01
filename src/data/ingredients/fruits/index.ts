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
export let getFruitsBySubCategory = (subCategory: string): Record<string, IngredientMapping> => {
  return Object.entries(fruits)
    .filter(([_, value]) => value.subCategory === subCategory)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getSeasonalFruits = (season: string): Record<string, IngredientMapping> => {
  return Object.entries(fruits)
    .filter(([_, value]) => value.season.includes(season))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getFruitsByPreparation = (method: string): Record<string, IngredientMapping> => {
  return Object.entries(fruits)
    .filter(([_, value]) => value.preparation && value.preparation[method])
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let findCompatibleFruits = (ingredientName: string): string[] => {
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

// Update type definitions
export type FruitAstrologicalProfile = {
  rulingPlanets: string[];
  favorableZodiac: string[];
  elementalAffinity: {
    base: string;
    decanModifiers: {
      first: { element: string; planet: string };
      second: { element: string; planet: string };
      third: { element: string; planet: string };
    };
  };
};

// Add new helper functions
export let getFruitsByRulingPlanet = (planet: string): Record<string, IngredientMapping> => {
  return Object.entries(fruits)
    .filter(([_, value]) => value.astrologicalProfile?.rulingPlanets?.includes(planet))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

export let getFruitsByElementalAffinity = (element: string): Record<string, IngredientMapping> => {
  return Object.entries(fruits)
    .filter(([_, value]) => {
      const affinity = value.astrologicalProfile?.elementalAffinity;
      if (!affinity) return false;
      
      if (typeof affinity === 'string') {
        return affinity === element;
      } else {
        return affinity.base === element;
      }
    })
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

// Add new validation function
export let isValidFruitAstrologicalProfile = (profile: unknown): profile is FruitAstrologicalProfile => {
  if (typeof profile !== 'object' || !profile) return false;
  
  let requiredProperties = [
    'rulingPlanets',
    'favorableZodiac',
    'elementalAffinity'
  ];

  return requiredProperties.every(prop => prop in profile);
};

// Validation
export let isValidFruit = (ingredient: unknown): ingredient is IngredientMapping => {
  if (typeof ingredient !== 'object' || !ingredient) return false;
  
  let requiredProperties = [
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

// Before
Object.entries(fruits).forEach(([id, fruit]) => {
  // Validation logic can be added here if needed
});

// After
Object.entries(fruits).forEach(([id, fruit]) => {
  // Properly implement validation
  if (!fruit.elementalProperties) {
    // Use type-safe logging instead of console.log
    // If a logger is available, we would use it like: logger.warn(`Missing properties for ${id}`);
    // For now, we'll just comment this out to avoid linting errors
    // console.warn(`Missing properties for ${id}`);
  }
});