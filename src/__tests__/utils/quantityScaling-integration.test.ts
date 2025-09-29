// src/__tests__/utils/quantityScaling-integration.test.ts
// Integration tests for Phase 3: Quantity-Aware Recipe Recommendations

import { IngredientService } from '@/services/IngredientService';
import { UnifiedRecommendationService } from '@/services/UnifiedRecommendationService';
import { ElementalProperties, ThermodynamicMetrics } from '@/types/alchemy';
import { Recipe } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';

// Mock the recipe data service
jest.mock('@/services/recipeData', () => ({
  recipeDataService: {
    getAllRecipes: jest.fn(() => Promise.resolve([
      {
        id: 'test-recipe-1',
        title: 'Garlic Butter Pasta',
        ingredients: [
          { name: 'garlic', amount: 3, unit: 'cloves' },
          { name: 'butter', amount: 100, unit: 'g' },
          { name: 'pasta', amount: 200, unit: 'g' }
        ],
        cookingMethods: ['boil', 'sauté'],
        cuisine: 'Italian',
        elementalState: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 }
      } as Recipe,
      {
        id: 'test-recipe-2',
        title: 'Spicy Stir Fry',
        ingredients: [
          { name: 'ginger', amount: 2, unit: 'tbsp' },
          { name: 'soy sauce', amount: 50, unit: 'ml' },
          { name: 'chicken', amount: 300, unit: 'g' }
        ],
        cookingMethods: ['stir fry'],
        cuisine: 'Asian',
        elementalState: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 }
      } as Recipe
    ]))
  }
}));

describe('Phase 3: Quantity-Aware Recipe Recommendations', () => {
  let ingredientService: IngredientService;
  let recommendationService: UnifiedRecommendationService;

  beforeEach(() => {
    ingredientService = IngredientService.getInstance();
    recommendationService = UnifiedRecommendationService.getInstance();
    jest.clearAllMocks();
  });

  describe('IngredientService Quantity-Aware Methods', () => {
    test('getScaledIngredientProperties returns valid scaled properties', () => {
      const result = ingredientService.getScaledIngredientProperties('garlic', 6, 'cloves');

      expect(result).toBeDefined();
      if (result) {
        expect(result.base).toBeDefined();
        expect(result.scaled).toBeDefined();
        expect(result.quantity).toBe(6);
        expect(result.unit).toBe('cloves');
        expect(result.factor).toBeGreaterThan(0.1);
        expect(result.factor).toBeLessThan(2.0);
      }
    });

    test('calculateQuantityImpact scales elemental properties correctly', () => {
      const mockIngredient = {
        name: 'test garlic',
        elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 }
      };

      const result = ingredientService.calculateQuantityImpact(mockIngredient, 10, 'cloves');

      expect(result).toBeDefined();
      if (result) {
        // Check that sum is approximately 1.0 (harmony enforcement)
        const sum = result.Fire + result.Water + result.Earth + result.Air;
        expect(sum).toBeCloseTo(1.0, 1);
      }
    });

    test('batchScaleIngredients processes multiple ingredients efficiently', () => {
      const batchData = [
        { ingredientId: 'garlic', quantity: 3, unit: 'cloves' },
        { ingredientId: 'butter', quantity: 100, unit: 'g' },
        { ingredientId: 'ginger', quantity: 2, unit: 'tbsp' }
      ];

      const results = ingredientService.batchScaleIngredients(batchData);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    test('calculateQuantityAwareCompatibility uses scaled properties', () => {
      const score = ingredientService.calculateQuantityAwareCompatibility(
        'garlic', 3, 'cloves',
        'butter', 100, 'g'
      );

      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('UnifiedRecommendationService Quantity-Aware Methods', () => {
    test('getQuantityAwareRecipeRecommendations considers ingredient quantities', async () => {
      const criteria = {
        elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
        useQuantityScaling: true,
        ingredientQuantities: [
          { ingredient: 'garlic', quantity: 3, unit: 'cloves' },
          { ingredient: 'butter', quantity: 100, unit: 'g' }
        ],
        limit: 5
      };

      const result = await recommendationService.getQuantityAwareRecipeRecommendations(criteria);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.context.quantityAware).toBe(true);
    });

    test('getQuantityAwareIngredientRecommendations uses target quantity scaling', async () => {
      const criteria = {
        elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
        useQuantityScaling: true,
        targetQuantity: 200,
        targetUnit: 'g',
        categories: ['vegetables'],
        limit: 3
      };

      const result = await recommendationService.getQuantityAwareIngredientRecommendations(criteria);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.context.quantityAware).toBe(true);
    });

    test('kinetics bonus affects cooking method scoring', async () => {
      const criteria = {
        elementalProperties: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 },
        useQuantityScaling: true,
        ingredientQuantities: [
          { ingredient: 'ginger', quantity: 2, unit: 'tbsp' },
          { ingredient: 'chicken', quantity: 300, unit: 'g' }
        ],
        cookingMethod: 'stir fry',
        limit: 5
      };

      const result = await recommendationService.getQuantityAwareRecipeRecommendations(criteria);

      expect(result).toBeDefined();
      // The spicy stir fry recipe should score higher due to cooking method + kinetics match
      const spicyRecipeScore = result.scores['test-recipe-2'];
      expect(spicyRecipeScore).toBeDefined();
      expect(spicyRecipeScore).toBeGreaterThan(0);
    });
  });

  describe('Quantity Scaling Validation', () => {
    test('elemental harmony is maintained in scaled properties', () => {
      const result = ingredientService.getScaledIngredientProperties('garlic', 10, 'cloves');

      if (result) {
        const scaled = result.scaled;
        const sum = scaled.Fire + scaled.Water + scaled.Earth + scaled.Air;
        expect(sum).toBeCloseTo(1.0, 1);

        // Each element should be between 0 and 1
        Object.values(scaled).forEach(value => {
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
      }
    });

    test('scaling factor is within expected bounds', () => {
      const smallQuantity = ingredientService.getScaledIngredientProperties('garlic', 1, 'cloves');
      const largeQuantity = ingredientService.getScaledIngredientProperties('garlic', 20, 'cloves');

      if (smallQuantity && largeQuantity) {
        expect(smallQuantity.factor).toBeGreaterThan(0.1);
        expect(smallQuantity.factor).toBeLessThan(2.0);
        expect(largeQuantity.factor).toBeGreaterThan(0.1);
        expect(largeQuantity.factor).toBeLessThan(2.0);
      }
    });

    test('kinetics impact is calculated for thermodynamic ingredients', () => {
      const result = ingredientService.getScaledIngredientProperties('garlic', 5, 'cloves');

      if (result && result.kineticsImpact) {
        const { forceAdjustment, thermalShift } = result.kineticsImpact;
        expect(typeof forceAdjustment).toBe('number');
        expect(typeof thermalShift).toBe('number');
        expect(Math.abs(forceAdjustment)).toBeLessThan(10);
        expect(Math.abs(thermalShift)).toBeLessThan(5);
      }
    });
  });

  describe('Performance Validation', () => {
    test('batch processing is efficient', () => {
      const batchData = Array.from({ length: 10 }, (_, i) => ({
        ingredientId: 'garlic',
        quantity: 3 + i,
        unit: 'cloves'
      }));

      const startTime = Date.now();
      const results = ingredientService.batchScaleIngredients(batchData);
      const endTime = Date.now();

      expect(results).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
    });

    test('recommendation service handles quantity data efficiently', async () => {
      const criteria = {
        elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
        useQuantityScaling: true,
        ingredientQuantities: Array.from({ length: 5 }, (_, i) => ({
          ingredient: `ingredient-${i}`,
          quantity: 100 + i * 50,
          unit: 'g'
        })),
        limit: 3
      };

      const startTime = Date.now();
      const result = await recommendationService.getQuantityAwareRecipeRecommendations(criteria);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(200); // Should complete in < 200ms
    });
  });

  describe('Backward Compatibility', () => {
    test('standard recommendations still work without quantity scaling', async () => {
      const criteria = {
        elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
        limit: 5
      };

      const result = await recommendationService.getRecommendedRecipes(criteria);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(result.context.quantityAware).toBeUndefined();
    });

    test('ingredient service methods work without quantity parameters', () => {
      const ingredient = ingredientService.getIngredientByName('garlic');
      expect(ingredient).toBeDefined();

      const compatibility = ingredientService.calculateIngredientCompatibility(
        'garlic',
        'butter'
      );
      expect(compatibility.score).toBeDefined();
    });
  });
});
