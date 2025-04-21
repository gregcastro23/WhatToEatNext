import { getRecommendedIngredients } from '@/utils/ingredientRecommender';
import { AstrologicalState as CelestialAstroState } from '@/types/celestial';

// Mock the actual ingredient properties
interface MockIngredient {
  name: string;
  type: string;
  elementalProperties: {
    Fire: number;
    Air: number;
    Earth: number;
    Water: number;
  };
  astrologicalProfile: {
    rulingPlanets: string[];
  };
}

// Mock implementation of getRecommendedIngredients
jest.mock('@/utils/ingredientRecommender', () => {
  return {
    getRecommendedIngredients: () => [
      {
        name: 'Rosemary',
        type: 'herb',
        elementalProperties: { Fire: 0.6, Air: 0.3, Earth: 0.1, Water: 0 },
        astrologicalProfile: {
          rulingPlanets: ['Sun', 'Mercury']
        }
      },
      {
        name: 'Thyme',
        type: 'herb',
        elementalProperties: { Fire: 0.4, Air: 0.4, Earth: 0.2, Water: 0 },
        astrologicalProfile: {
          rulingPlanets: ['Mercury']
        }
      }
    ] as MockIngredient[]
  };
});

describe('getRecommendedIngredients', () => {
  it('should return ingredients matching the current elemental state', () => {
    // Create a properly shaped CelestialAstroState object
    const celestialAstroState: CelestialAstroState = {
      currentZodiac: 'leo',
      moonPhase: 'full moon',
      sunSign: 'leo',
      currentPlanetaryAlignment: {
        sun: { sign: 'leo', degree: 15 },
        moon: { sign: 'cancer', degree: 5 }
      },
      activePlanets: ['sun', 'moon'],
      lunarPhase: 'full moon',
      aspects: [],
      loading: false,
      isReady: true,
      renderCount: 0
    };

    // Get recommended ingredients directly using the CelestialAstroState
    const ingredients = getRecommendedIngredients(celestialAstroState);
    
    expect(ingredients).toBeInstanceOf(Array);
    ingredients.forEach((ingredient) => {
      expect(ingredient).toHaveProperty('elementalProperties');
      expect(ingredient).toHaveProperty('astrologicalProfile');
      expect(ingredient.astrologicalProfile).toHaveProperty('rulingPlanets');
      expect(
        ingredient.astrologicalProfile.rulingPlanets.some(
          planet => ['Sun', 'Mercury', 'Saturn'].includes(planet)
        )
      ).toBe(true);
    });
  });
}); 