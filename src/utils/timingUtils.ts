import type { ElementalProperties } from '@/types/alchemy';
import { elementalUtils } from './elementalUtils';

export const timingUtils = {
  calculateOptimalTiming(
    ingredients: ElementalProperties[],
    cookingMethod: string
  ): { duration: number; phases: Array<{ name: string; time: number }> } {
    const baseProperties = ingredients.reduce(
      (acc, curr) => elementalUtils.combineProperties(acc, curr),
      {}
    );

    const dominantElement = elementalUtils.getDominantElement(baseProperties);
    
    // Base timing by dominant element (in minutes)
    const elementalTiming: Record<string, number> = {
      'Fire': 15,   // Quick cooking
      'Air': 20,    // Medium-quick cooking
      'Water': 30,  // Medium cooking
      'Earth': 45   // Slow cooking
    };

    // Cooking method modifiers
    const methodModifiers: Record<string, number> = {
      'boiling': 1.0,
      'steaming': 1.2,
      'baking': 1.5,
      'slow_cooking': 2.5,
      'raw': 0
    };

    const baseTime = elementalTiming[dominantElement] || 30;
    const modifier = methodModifiers[cookingMethod.toLowerCase()] || 1.0;
    const totalTime = baseTime * modifier;

    // Calculate cooking phases
    return {
      duration: totalTime,
      phases: [
        {
          name: 'preparation',
          time: totalTime * 0.2
        },
        {
          name: 'main_cooking',
          time: totalTime * 0.6
        },
        {
          name: 'finishing',
          time: totalTime * 0.2
        }
      ]
    };
  },

  getSeasonalAdjustments(
    baseTime: number,
    season: string
  ): number {
    const seasonalModifiers: Record<string, number> = {
      'summer': 0.8,  // Faster cooking in summer
      'winter': 1.2,  // Slower cooking in winter
      'spring': 1.0,  // Standard timing
      'autumn': 1.0   // Standard timing
    };

    return baseTime * (seasonalModifiers[season.toLowerCase()] || 1.0);
  }
};

export default timingUtils;