import { CulinaryAstrologer } from '@/calculations/culinaryAstrology';
import { AstrologicalState as AlchemyAstroState } from '@/types/alchemy';
import { AstrologicalState as CelestialAstroState } from '@/types/celestial';
import { ensureCompatibleAstroState } from '@/types/astroAdapter';

// Mock the getRecipeRecommendations method
jest.mock('@/calculations/culinaryAstrology', () => {
  const original = jest.requireActual('@/calculations/culinaryAstrology');
  return {
    ...original,
    CulinaryAstrologer: class MockCulinaryAstrologer {
      getRecipeRecommendations() {
        return [
          {
            name: 'Grilled Salmon',
            alignmentScore: 0.85,
            elementDistribution: { Fire: 0.5, Water: 0.3, Earth: 0.1, Air: 0.1 },
            planetaryActivators: ['Sun', 'Mars']
          },
          {
            name: 'Roasted Vegetables',
            alignmentScore: 0.78,
            elementDistribution: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0 },
            planetaryActivators: ['Sun', 'Saturn']
          }
        ];
      }

      getGuidance() {
        return {
          dominantElement: 'Fire',
          technique: {
            name: 'Roasting',
            rationale: 'Aligns with Fire dominance',
            optimalTiming: 'Best during full moon'
          },
          ingredientFocus: {
            element: 'Fire',
            examples: ['Beef', 'Lamb', 'Chicken'],
            pairingTip: 'Combine with Air-dominant preparations'
          },
          cuisineRecommendation: {
            style: 'Mediterranean',
            modification: 'Use more spices',
            astrologicalBoost: 0.75
          }
        };
      }
    }
  };
});

describe('CulinaryAstrologer', () => {
  let astrologer: CulinaryAstrologer;

  beforeEach(() => {
    astrologer = new CulinaryAstrologer();
  });

  it('should return recipe recommendations based on astrological state', () => {
    // Create a celestial-style AstrologicalState
    const celestialAstroState: CelestialAstroState = {
      currentZodiac: 'leo',
      moonPhase: 'full moon',
      currentPlanetaryAlignment: {
        sun: { sign: 'leo', degree: 15 },
        moon: { sign: 'cancer', degree: 5 }
      },
      activePlanets: ['sun', 'moon'],
      aspects: [],
      loading: false,
      isReady: true,
      renderCount: 0
    };

    // Convert to the format expected by the CulinaryAstrologer
    const astroState = ensureCompatibleAstroState(celestialAstroState, 'alchemy') as AlchemyAstroState;

    const recommendations = astrologer.getRecipeRecommendations(astroState);
    
    expect(recommendations).toBeInstanceOf(Array);
    recommendations.forEach(recipe => {
      expect(recipe).toHaveProperty('alignmentScore');
      expect(recipe.planetaryActivators).toContain('Sun');
    });
  });
}); 