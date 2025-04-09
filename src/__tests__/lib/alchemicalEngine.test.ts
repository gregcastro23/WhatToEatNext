// src/__tests__/lib/alchemicalEngine.test.ts

import { elementalUtils } from '@/utils/elementalUtils';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import type { Recipe } from '@/types/alchemy';

describe('alchemicalEngine', () => {
  const testRecipe: Recipe = {
    id: '1',
    name: 'Test Recipe',
    ingredients: [
      { 
        name: 'Fire Ingredient',
        amount: 1,
        unit: 'unit',
        element: 'Fire'
      },
      { 
        name: 'Water Ingredient',
        amount: 1,
        unit: 'unit',
        element: 'Water'
      }
    ],
    cookingMethod: 'boiling',
    timeToMake: 30,
    servings: 2,
    elementalProperties: DEFAULT_ELEMENTAL_PROPERTIES
  };

  it('should calculate recipe harmony correctly', () => {
    const harmony = elementalUtils.getRecipeHarmony(testRecipe, DEFAULT_ELEMENTAL_PROPERTIES);
    expect(harmony).toBeGreaterThanOrEqual(0);
    expect(harmony).toBeLessThanOrEqual(1);
  });
});