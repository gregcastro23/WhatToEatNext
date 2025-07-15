/**
 * Example Usage of the Unified Scoring Service
 * 
 * This file demonstrates how to use the UnifiedScoringService to score
 * ingredients, recipes, cuisines, and cooking methods using comprehensive
 * astrological and alchemical data.
 */

import { UnifiedScoringService, scoreRecommendation, ScoringContext, ScoringResult } from '../UnifiedScoringService';
import type { ElementalProperties } from '../../types/alchemy';
import type { Planet } from '@/types/celestial';
import type { Season } from '@/types/alchemy';

// Example usage scenarios
export class UnifiedScoringExample {
  
  /**
   * Example 1: Score an ingredient recommendation
   */
  static async scoreIngredient(): Promise<ScoringResult> {
    const context: ScoringContext = {
      dateTime: new Date(),
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      },
      item: {
        name: 'Basil',
        type: 'ingredient',
        elementalProperties: {
          Fire: 0.3,
          Water: 0.1,
          Earth: 0.2,
          Air: 0.4
        },
        seasonality: ['summer', 'spring'],
        planetaryRulers: ['Mercury', 'Mars'],
        flavorProfile: {
          sweet: 0.2,
          bitter: 0.1,
          spicy: 0.3,
          aromatic: 0.8
        },
        culturalOrigins: ['Italian', 'Mediterranean']
      },
      preferences: {
        intensityPreference: 'moderate',
        complexityPreference: 'simple',
        culturalPreferences: ['Italian']
      },
      options: {
        debugMode: true,
        weights: {
          seasonalEffect: 1.2, // Boost seasonal importance
          elementalCompatibility: 1.1 // Boost elemental compatibility
        }
      }
    };

    return await scoreRecommendation(context);
  }

  /**
   * Example 2: Score a cooking method
   */
  static async scoreCookingMethod(): Promise<ScoringResult> {
    const context: ScoringContext = {
      dateTime: new Date(),
      location: {
        latitude: 34.0522,
        longitude: -118.2437,
        timezone: 'America/Los_Angeles'
      },
      item: {
        name: 'Grilling',
        type: 'cooking_method',
        elementalProperties: {
          Fire: 0.8,
          Water: 0.05,
          Earth: 0.1,
          Air: 0.05
        },
        seasonality: ['summer'],
        planetaryRulers: ['Mars', 'Sun'],
        flavorProfile: {
          smoky: 0.9,
          charred: 0.7,
          intense: 0.8
        }
      },
      preferences: {
        intensityPreference: 'intense',
        complexityPreference: 'moderate'
      },
      options: {
        debugMode: true
      }
    };

    return await scoreRecommendation(context);
  }

  /**
   * Example 3: Score a recipe with complex preferences
   */
  static async scoreRecipe(): Promise<ScoringResult> {
    const context: ScoringContext = {
      dateTime: new Date(),
      item: {
        name: 'Mushroom Risotto',
        type: 'recipe',
        elementalProperties: {
          Fire: 0.2,
          Water: 0.3,
          Earth: 0.4,
          Air: 0.1
        },
        seasonality: ['autumn', 'winter'],
        planetaryRulers: ['Moon', 'Saturn'],
        flavorProfile: {
          umami: 0.9,
          earthy: 0.8,
          creamy: 0.7,
          savory: 0.8
        },
        culturalOrigins: ['Italian']
      },
      preferences: {
        dietaryRestrictions: ['Vegetarian'],
        culturalPreferences: ['Italian', 'Mediterranean'],
        intensityPreference: 'moderate',
        complexityPreference: 'complex'
      },
      options: {
        weights: {
          thermalDynamicEffect: 0.8, // Reduce thermodynamic importance for comfort food
          seasonalEffect: 1.3 // Boost seasonal importance
        }
      }
    };

    return await scoreRecommendation(context);
  }

  /**
   * Example 4: Score a cuisine type
   */
  static async scoreCuisine(): Promise<ScoringResult> {
    const context: ScoringContext = {
      dateTime: new Date(),
      location: {
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo'
      },
      item: {
        name: 'Japanese',
        type: 'cuisine',
        elementalProperties: {
          Fire: 0.15,
          Water: 0.4,
          Earth: 0.25,
          Air: 0.2
        },
        seasonality: ['spring', 'summer', 'autumn', 'winter'], // Year-round
        planetaryRulers: ['Moon', 'Mercury'],
        flavorProfile: {
          umami: 0.9,
          subtle: 0.8,
          clean: 0.9,
          balanced: 0.95
        },
        culturalOrigins: ['Japanese', 'East Asian']
      },
      preferences: {
        culturalPreferences: ['Japanese', 'Asian'],
        intensityPreference: 'mild',
        complexityPreference: 'moderate'
      },
      options: {
        weights: {
          locationEffect: 1.5, // Boost location importance (we're in Japan)
          culturalScore: 1.2 // Custom weight for cultural alignment
        }
      }
    };

    return await scoreRecommendation(context);
  }

  /**
   * Comprehensive example showing all scoring effects
   */
  static async comprehensiveExample(): Promise<void> {
    console.log('=== Unified Scoring Service Examples ===\n');

    try {
      // Test ingredient scoring
      console.log('1. Scoring Basil (Ingredient):');
      const basilScore = await this.scoreIngredient();
      console.log(`Score: ${basilScore.score.toFixed(3)} (${(basilScore.score * 100).toFixed(1)}%)`);
      console.log(`Confidence: ${basilScore.confidence.toFixed(3)}`);
      console.log('Dominant Effects:', basilScore.metadata.dominantEffects);
      console.log('Notes:', basilScore.notes);
      console.log('Breakdown:', JSON.stringify(basilScore.breakdown, null, 2));
      console.log('\n');

      // Test cooking method scoring
      console.log('2. Scoring Grilling (Cooking Method):');
      const grillingScore = await this.scoreCookingMethod();
      console.log(`Score: ${grillingScore.score.toFixed(3)} (${(grillingScore.score * 100).toFixed(1)}%)`);
      console.log(`Confidence: ${grillingScore.confidence.toFixed(3)}`);
      console.log('Dominant Effects:', grillingScore.metadata.dominantEffects);
      console.log('Notes:', grillingScore.notes);
      console.log('\n');

      // Test recipe scoring
      console.log('3. Scoring Mushroom Risotto (Recipe):');
      const risottoScore = await this.scoreRecipe();
      console.log(`Score: ${risottoScore.score.toFixed(3)} (${(risottoScore.score * 100).toFixed(1)}%)`);
      console.log(`Confidence: ${risottoScore.confidence.toFixed(3)}`);
      console.log('Dominant Effects:', risottoScore.metadata.dominantEffects);
      console.log('Notes:', risottoScore.notes);
      console.log('\n');

      // Test cuisine scoring
      console.log('4. Scoring Japanese Cuisine:');
      const japaneseScore = await this.scoreCuisine();
      console.log(`Score: ${japaneseScore.score.toFixed(3)} (${(japaneseScore.score * 100).toFixed(1)}%)`);
      console.log(`Confidence: ${japaneseScore.confidence.toFixed(3)}`);
      console.log('Dominant Effects:', japaneseScore.metadata.dominantEffects);
      console.log('Notes:', japaneseScore.notes);
      console.log('\n');

    } catch (error) {
      console.error('Error in comprehensive example:', error);
    }
  }

  /**
   * Example showing how to use the service directly (singleton pattern)
   */
  static async useSingletonExample(): Promise<void> {
    const scoringService = UnifiedScoringService.getInstance();
    
    const context: ScoringContext = {
      dateTime: new Date(),
      item: {
        name: 'Sage',
        type: 'ingredient',
        elementalProperties: { Fire: 0.2, Water: 0.1, Earth: 0.4, Air: 0.3 },
        planetaryRulers: ['Jupiter'],
        seasonality: ['autumn']
      }
    };

    const result = await scoringService.scoreRecommendation(context);
    console.log('Singleton Example - Sage Score:', result.score);
  }

  /**
   * Example comparing multiple items
   */
  static async compareItems(): Promise<void> {
    const baseContext = {
      dateTime: new Date(),
      preferences: {
        intensityPreference: 'moderate' as const,
        complexityPreference: 'simple' as const
      }
    };

    const items = [
      {
        name: 'Rosemary',
        type: 'ingredient' as const,
        elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
        planetaryRulers: ['Sun'],
        seasonality: ['winter']
      },
      {
        name: 'Thyme',
        type: 'ingredient' as const,
        elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
        planetaryRulers: ['Venus'],
        seasonality: ['spring', 'summer']
      },
      {
        name: 'Oregano',
        type: 'ingredient' as const,
        elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 },
        planetaryRulers: ['Mercury'],
        seasonality: ['summer']
      },
      {
        name: 'Ginger',
        type: 'ingredient' as const,
        elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 },
        planetaryRulers: ['Mars', 'Sun'] as Planet[],
        seasonality: ['all'] as Season[]
      } as any
    ];

    console.log('=== Comparing Herbs ===');
    
    for (const item of items) {
      const context: ScoringContext = {
        ...baseContext,
        item
      };
      
      const result = await scoreRecommendation(context);
      console.log(`${item.name}: ${result.score.toFixed(3)} (${result.metadata.dominantEffects.join(', ')})`);
    }
  }
}

// Export for use in other modules
export default UnifiedScoringExample; 