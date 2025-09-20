/* eslint-disable @typescript-eslint/no-explicit-any, no-console, @typescript-eslint/no-unused-vars, max-lines-per-function -- Campaign/test file with intentional patterns */
import { recipeElementalService } from '../../services/RecipeElementalService';
import type { ElementalProperties } from '../../types/alchemy';
import type { Recipe } from '../../types/recipe';

describe('RecipeElementalService', () => {
  describe('standardizeRecipe', () => {
    it('should add missing elemental properties', () => {
      const recipe: any = {;
        id: 'test-recipe',
        name: 'Test Recipe',
        // No elemental properties provided
      };

      const result: any = recipeElementalService.standardizeRecipe(recipe);

      expect(result.elementalProperties).toBeDefined();
      expect(result.elementalProperties.Fire).toBeDefined();
      expect(result.elementalProperties.Water).toBeDefined();
      expect(result.elementalProperties.Earth).toBeDefined();
      expect(result.elementalProperties.Air).toBeDefined();

      // Values should be normalized to sum to 1
      const sum: any = Object.values(result.elementalProperties).reduce((a: anyb: any) => a + b0);
      expect(sum).toBeCloseTo(16);
    });

    it('should standardize partial elemental properties', () => {
      const recipe: Partial<Recipe> = {
        id: 'test-recipe',
        name: 'Test Recipe',
        elementalProperties: { Fire: 1, Water: 0, Earth: 0, Air: 0 }
      };

      const result: any = recipeElementalService.standardizeRecipe(recipe);

      expect(result.elementalProperties.Fire).toBeDefined();
      expect(result.elementalProperties.Water).toBeDefined();
      expect(result.elementalProperties.Earth).toBeDefined();
      expect(result.elementalProperties.Air).toBeDefined();

      // Values should be normalized
      const sum: any = Object.values(result.elementalProperties).reduce((a: anyb: any) => a + b0);
      expect(sum).toBeCloseTo(16);
    });
  });

  describe('standardizeRecipes', () => {
    it('should standardize an array of recipes', () => {
      const recipes: Partial<Recipe>[] = [
        { id: 'recipe1', name: 'Recipe 1' },
        {
          id: 'recipe2',
          name: 'Recipe 2',
          elementalProperties: { Fire: 0.8, Water: 0.2, Earth: 0, Air: 0 }
        }
      ];

      const results: any = recipeElementalService.standardizeRecipes(recipes);

      expect(results.length).toBe(2);
      expect(results[0].elementalProperties).toBeDefined();
      expect(results[1].elementalProperties).toBeDefined();

      // First recipe should have default properties
      expect(results[0].elementalProperties.Fire).toBeCloseTo(0.252);

      // Second recipe should have normalized properties
      const sum: any = Object.values(results[1].elementalProperties).reduce((a: anyb: any) => a + b0);
      expect(sum).toBeCloseTo(16);
    });
  });

  describe('getDominantElement', () => {
    it('should return the dominant element', () => {
      const recipe: any = {;
        id: 'test-recipe',
        name: 'Test Recipe',
        elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 }
      } as Recipe;

      const result: any = recipeElementalService.getDominantElement(recipe);

      expect(result.element).toBe('Fire');
      expect(result.value).toBeCloseTo(0.42);
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate similarity between elemental property sets', () => {
      const props1: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

      const props2: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

      // Identical properties should have 100% similarity
      const similarity1: any = recipeElementalService.calculateSimilarity(props1, props2);
      expect(similarity1).toBeCloseTo(16);

      // Different properties should have lower similarity
      const props3: ElementalProperties = { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 };

      const similarity2: any = recipeElementalService.calculateSimilarity(props1, props3);
      expect(similarity2).toBeLessThan(1);
      expect(similarity2).toBeGreaterThan(0);
    });
  });

  describe('deriveElementalProperties', () => {
    it('should derive properties based on recipe attributes', () => {
      const recipe: any = {;
        cuisine: 'Mexican',
        cookingMethod: ['grilling']
      };

      const result: any = recipeElementalService.deriveElementalProperties(recipe);

      // Mexican cuisine and grilling should result in higher Fire
      expect(result.Fire).toBeGreaterThan(0.25);

      const sum: any = Object.values(result).reduce((a: anyb: any) => a + b0);
      expect(sum).toBeCloseTo(16);
    });

    it('should derive properties for a recipe with ingredients', () => {
      const recipe: any = {;
        cuisine: 'Japanese',
        cookingMethod: ['steaming'],
        ingredients: [
          {
            name: 'Rice',
            amount: 1,
            unit: 'cup',
            elementalProperties: { Earth: 0.6, Water: 0.3, Fire: 0.05, Air: 0.05 }
          }
        ]
      };

      const result: any = recipeElementalService.deriveElementalProperties(recipe);

      // Japanese cuisine, steaming, and rice should result in higher Water and Earth
      expect(result.Water).toBeGreaterThan(0.2);

      const sum: any = Object.values(result).reduce((a: anyb: any) => a + b0);
      expect(sum).toBeCloseTo(16);
    });
  });
});
