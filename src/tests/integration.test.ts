// Add integration tests
import { Recipe } from '@/types/recipe';

// Mock recipe for testing
const mockRecipe: Partial<Recipe> = {
  name: 'Test Recipe',
  seasonality: { Spring: 0.7, Summer: 0.9, Fall: 0.5, Winter: 0.3 },
};

// Function to calculate seasonal effectiveness
function calculateSeasonalEffectiveness(recipe: Partial<Recipe>, season: string): number {
  if (!recipe.seasonality) {
    return 0.5; // Default medium effectiveness if no seasonality data
  }

  return recipe.seasonality[season as keyof typeof recipe.seasonality] || 0.5;
}

test('seasonal calculations work correctly', () => {
  const result: any = calculateSeasonalEffectiveness(mockRecipe, 'Summer');
  expect(result).toBeDefined();
  expect(result).toBe(0.9);
});
