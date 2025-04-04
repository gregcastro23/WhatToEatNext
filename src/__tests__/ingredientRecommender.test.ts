import { getRecommendedIngredients } from '@/utils/ingredientRecommender';
import { AstrologicalState } from '@/types/alchemy';

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
      zodiacSign: 'leo',
      planetaryHours: 'sun',
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
      expect(ingredient.astrologicalProfile.rulingPlanets).toContain('Sun');
    });
  });
}); 