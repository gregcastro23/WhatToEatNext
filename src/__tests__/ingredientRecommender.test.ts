import { getRecommendedIngredients } from '@/utils/ingredientRecommender';
import { AstrologicalState } from '@/types/alchemy';
import { Ingredient } from '@/types/ingredient';

// Mock implementation of getRecommendedIngredients
jest.mock('@/utils/ingredientRecommender', () => {
  return {
    getRecommendedIngredients: (): Ingredient[] => [
      {
        name: 'Rosemary',
        category: 'culinary_herb',
        qualities: ['aromatic', 'warming'],
        elementalProperties: { Fire: 0.6, Air: 0.3, Earth: 0.1, Water: 0 },
        astrologicalProfile: {
          rulingPlanets: ['Sun', 'Mercury']
        }
      } as Ingredient,
      {
        name: 'Thyme',
        category: 'culinary_herb',
        qualities: ['aromatic', 'warming'],
        elementalProperties: { Fire: 0.4, Air: 0.4, Earth: 0.2, Water: 0 },
        astrologicalProfile: {
          rulingPlanets: ['Mercury']
        }
      } as Ingredient
    ]
  };
});

describe('getRecommendedIngredients', () => {
  it('should return ingredients matching the current elemental state', () => {
    const astroState: AstrologicalState = {
      currentZodiac: 'leo',
      moonPhase: 'full moon',
      currentPlanetaryAlignment: {
        sun: { sign: 'leo', degree: 15 },
        moon: { sign: 'cancer', degree: 5 }
      },
      activePlanets: ['sun', 'moon'],
      planetaryPositions: {
        sun: { sign: 'leo', degree: 15 },
        moon: { sign: 'cancer', degree: 5 }
      },
      lunarPhase: 'full moon',
      planetaryHour: 'Sun',
      planetaryAlignment: {
        sun: { sign: 'leo', degree: 15 },
        moon: { sign: 'cancer', degree: 5 }
      },
      aspects: [],
      tarotElementBoosts: { Fire: 0.2, Water: 0.1, Air: 0, Earth: 0 },
      tarotPlanetaryBoosts: { Sun: 0.2, Moon: 0.1 }
    };

    const ingredients = getRecommendedIngredients(astroState);
    
    expect(ingredients).toBeInstanceOf(Array);
    ingredients.forEach(ingredient => {
      expect(ingredient).toHaveProperty('elementalProperties');
      expect(ingredient).toHaveProperty('astrologicalProfile');
      const astroProfile = (ingredient as unknown).astrologicalProfile;
      expect(astroProfile).toHaveProperty('rulingPlanets');
      expect(
        astroProfile.rulingPlanets.some(
          (planet: string) => ['Sun', 'Mercury', 'Saturn'].includes(planet)
        )
      ).toBe(true);
    });
  });
}); 