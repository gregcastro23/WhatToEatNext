import { Recipe } from '@/types/recipe';
import { RecipeIngredient , validateIngredient } from '@/types/recipeIngredient';
// Removed duplicate: // Removed duplicate: // Removed duplicate: import type { RecipeIngredient } from '@/types/recipeIngredient';

describe('Ingredient Data Structure', () => {
  it('should validate a correctly structured ingredient', () => {
    const validIngredient: RecipeIngredient = {
      name: 'Test Ingredient',
      amount: 1,
      unit: 'cup',
      category: 'vegetables',
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
    };

    expect(validateIngredient(validIngredient)).toBe(true);
  });

  it('should reject an ingredient with missing required fields', () => {
    const missingNameIngredient = {
      amount: 1,
      unit: 'cup',
    };

    expect(validateIngredient(missingNameIngredient as unknown as RecipeIngredient)).toBe(false);
  });

  it('should handle ingredients with missing elemental properties', () => {
    const noElementalIngredient: RecipeIngredient = {
      name: 'Test Ingredient',
      amount: 1,
      unit: 'cup',
      category: 'vegetables',
    };

    // This should still be valid as elemental properties are optional
    expect(validateIngredient(noElementalIngredient)).toBe(true);
  });

  it('should validate ingredients with fractional amounts', () => {
    const fractionIngredient: RecipeIngredient = {
      name: 'Test Ingredient',
      amount: 0.5,
      unit: 'cup',
      category: 'vegetables',
    };

    expect(validateIngredient(fractionIngredient)).toBe(true);
  });

  it('should validate ingredients with different unit types', () => {
    const units = [
      'cup',
      'tablespoon',
      'teaspoon',
      'gram',
      'ounce',
      'pound',
      'piece',
    ];

    for (const unit of units) {
      const ingredient: RecipeIngredient = {
        name: 'Test Ingredient',
        amount: 1,
        unit,
        category: 'vegetables',
      };

      expect(validateIngredient(ingredient)).toBe(true);
    }
  });

  it('should handle ingredients with additional optional properties', () => {
    const fullIngredient: RecipeIngredient = {
      name: 'Test Ingredient',
      amount: 1,
      unit: 'cup',
      category: 'vegetables',
      optional: true,
      preparation: 'diced',
      notes: 'Use fresh if possible',
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      season: ['summer', 'fall'],
    };

    expect(validateIngredient(fullIngredient)).toBe(true);
  });
});
