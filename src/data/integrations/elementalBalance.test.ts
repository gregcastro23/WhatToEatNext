// src/data/integrations/elementalBalance.test.ts

import { elementalUtils } from '@/utils/elementalUtils';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import type { ElementalProperties, Recipe } from '@/types/alchemy';

describe('elementalBalance', () => {
  const testRecipe: Recipe = {
    id: '1',
    name: 'Test Recipe',
    ingredients: [
      { 
        name: 'Test Ingredient',
        amount: 1,
        unit: 'unit',
        element: 'Fire'
      }
    ],
    cookingMethod: 'baking',
    timeToMake: 30,
    servings: 2,
    elementalProperties: DEFAULT_ELEMENTAL_PROPERTIES
  };

  it('should validate correct elemental properties', () => {
    expect(elementalUtils.validateProperties(DEFAULT_ELEMENTAL_PROPERTIES)).toBe(true);
  });

  it('should normalize unbalanced properties', () => {
    const unbalanced: ElementalProperties = {
      Fire: 0.4,
      Water: 0.4,
      Air: 0.4,
      Earth: 0.4
    };
    const normalized = elementalUtils.normalizeProperties(unbalanced);
    const total = Object.values(normalized).reduce((sum, val) => sum + val, 0);
    expect(Math.abs(total - 1)).toBeLessThan(0.000001);
  });

  it('should calculate harmony between recipes', () => {
    const harmony = elementalUtils.getRecipeHarmony(testRecipe, DEFAULT_ELEMENTAL_PROPERTIES);
    expect(harmony).toBeLessThanOrEqual(1);
    expect(harmony).toBeGreaterThanOrEqual(0);
  });
});