import { Recipe } from '../../types/recipe';
import { ElementalProperties } from '../../types/alchemy';
import { RecipeElementalService } from '../../services/RecipeElementalService';
import { CookingMethod, toCookingMethod } from '../../types/commonTypes';

describe('RecipeElementalService', () => {
  const recipeElementalService = RecipeElementalService.getInstance();

  it('should use spice levels and ingredient elemental properties to derive overall recipe elemental properties', () => {
    const recipe: Partial<Recipe> = {
      id: 'spicy-recipe',
      name: 'Spicy Recipe',
      ingredients: [
        {
          name: 'Hot Pepper',
          amount: 2,
          unit: 'tsp',
          category: 'spice',
          elementalProperties: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 }
        },
        {
          name: 'Ginger',
          amount: 1,
          unit: 'tbsp',
          category: 'spice',
          elementalProperties: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 }
        }
      ],
      spiceLevel: 'hot'
    };
    
    const result = recipeElementalService.deriveElementalProperties(recipe);
    
    // Given the high Fire content in both ingredients and the hot spice level,
    // We expect Fire to be the dominant element
    expect(result.Fire).toBeGreaterThan(result.Water);
    expect(result.Fire).toBeGreaterThan(result.Earth);
    expect(result.Fire).toBeGreaterThan(result.Air);
    
    // Make sure properties are normalized
    const sum = Object.values(result).reduce((a: number, b: number) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });
  
  it('should consider cuisine and cooking method in elemental properties', () => {
    const recipe: Partial<Recipe> = {
      id: 'cuisine-test',
      name: 'Cuisine Test',
      ingredients: [
        {
          name: 'Ingredient1',
          amount: 2,
          unit: 'cup',
          category: 'vegetables',
          elementalProperties: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 }
        },
        {
          name: 'Ingredient2',
          amount: 1,
          unit: 'cup',
          category: 'vegetables',
          elementalProperties: { Fire: 0.1, Water: 0.8, Earth: 0.05, Air: 0.05 }
        }
      ],
      cuisine: 'Thai',
      cookingMethod: toCookingMethod('frying') // Use the converter function
    };
    
    const result = recipeElementalService.deriveElementalProperties(recipe);
    
    // Since we have one ingredient with high Fire and one with high Water,
    // plus Thai cuisine (Fire) and frying method (Fire), we expect Fire to be dominant
    expect(result.Fire).toBeGreaterThan(result.Water);
    expect(result.Fire).toBeGreaterThan(result.Earth);
    expect(result.Fire).toBeGreaterThan(result.Air);
  });

  it('should handle recipes with empty ingredients array', () => {
    const recipe: Partial<Recipe> = {
      id: 'test-recipe',
      name: 'Test Recipe',
      ingredients: []
    };
    
    // Should not throw errors with empty ingredients
    const result = recipeElementalService.deriveElementalProperties(recipe);
    
    // Should still produce normalized elemental properties
    const sum = Object.values(result).reduce((a: number, b: number) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it('should handle recipes with undefined ingredients', () => {
    const recipe: Partial<Recipe> = {
      id: 'test-recipe',
      name: 'Test Recipe'
      // No ingredients property
    };
    
    // Should not throw errors with undefined ingredients
    const result = recipeElementalService.deriveElementalProperties(recipe);
    
    // Should still produce normalized elemental properties
    const sum = Object.values(result).reduce((a: number, b: number) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });
}); 