import { CulinaryAstrologer } from '@/calculations/culinaryAstrology';
import { AstrologicalState } from '@/types';

describe('CulinaryAstrologer', () => {
  let astrologer: CulinaryAstrologer;

  beforeEach(() => {
    astrologer = new CulinaryAstrologer();
  });

  it('should return recipe recommendations based on astrological state', () => {
    const astroState: AstrologicalState = {
      planetaryAlignment: {
        sun: { sign: 'Leo', degree: 15 },
        moon: { sign: 'Cancer', degree: 5 }
      },
      activePlanets: ['Sun', 'Moon']
    };

    const recommendations = astrologer.getRecipeRecommendations(astroState);
    
    expect(recommendations).toBeInstanceOf(Array);
    recommendations.forEach(recipe => {
      expect(recipe).toHaveProperty('alignmentScore');
      expect(recipe.planetaryActivators).toContain('Sun');
    });
  });
}); 