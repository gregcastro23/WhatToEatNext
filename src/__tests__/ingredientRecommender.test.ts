import { getRecommendedIngredients } from '@/utils/ingredientRecommender';
import { AstrologicalState } from '@/types';

describe('getRecommendedIngredients', () => {
  it('should return ingredients matching the current elemental state', () => {
    const astroState: AstrologicalState = {
      planetaryAlignment: {
        sun: { sign: 'Leo', degree: 15 },
        moon: { sign: 'Cancer', degree: 5 }
      },
      activePlanets: ['Sun', 'Moon']
    };

    const ingredients = getRecommendedIngredients(astroState);
    
    expect(ingredients).toBeInstanceOf(Array);
    ingredients.forEach(ingredient => {
      expect(ingredient).toHaveProperty('elementalProperties');
      expect(ingredient.astrologicalProfile.rulingPlanets).toContain('Sun');
    });
  });
}); 