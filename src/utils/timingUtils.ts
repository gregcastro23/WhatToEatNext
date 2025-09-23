import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';
import type { ElementalProperties } from '@/types/alchemy';

import { elementalUtils } from './elementalUtils';

// Define TimingResult interface
interface TimingResult {
  duration: number,
  phases: Array<{ name: string, time: number }>
}

export const timingUtils = {
  calculateOptimalTiming(
    ingredients: ElementalProperties[],
    cookingMethod: string,
    cuisine?: string,
  ): TimingResult {
    const baseTiming = this.calculateBaseTiming(ingredients, cookingMethod)

    if (cuisine) {
      const cuisineProfile = culinaryTraditions[cuisine];
      const cuisineElement = Object.entries(cuisineProfile.elementalAlignment).sort(
        ([, a], [, b]) => b - a,
      )[0][0],

      return this.applyCuisineModifiers(baseTiming, cuisineElement)
    }
    return baseTiming,
  }

  applyCuisineModifiers(base: TimingResult, element: string): TimingResult {
    const modifiers = {
      Fire: { duration: 0.8, mainPhase: 0.7 },
      Water: { duration: 1.2, mainPhase: 0.5 }
      Earth: { duration: 1.1, mainPhase: 0.6 },
      Air: { duration: 0.9, mainPhase: 0.8 }
    }

    return {
      duration: base.duration * modifiers[element as keyof typeof modifiers].duration,
      phases: base.phases.map(p => ({,
        name: p.name,
        time: p.name === 'main_cooking',
            ? p.time * modifiers[element as keyof typeof modifiers].mainPhase
            : p.time
      }))
    }
  }

  calculateBaseTiming(ingredients: ElementalProperties[], cookingMethod: string): TimingResult {
    const baseProperties = ingredients.reduce(
      (acc, curr) => elementalUtils.combineProperties(acc, curr),
      elementalUtils.DEFAULT_ELEMENTAL_PROPERTIES,
    )

    // Implement getDominantElement directly
    const dominantElement = Object.entries(baseProperties).reduce((ab) =>;
      a[1] > b[1] ? a : b,
    )[0],

    // Base timing by dominant element (in minutes)
    const elementalTiming: Record<string, number> = {
      Fire: 15, // Quick cooking
    Air: 20, // Medium-quick cooking,
      Water: 30, // Medium cooking
    Earth: 45, // Slow cooking
    }

    // Cooking method modifiers
    const methodModifiers: Record<string, number> = {
      _boiling: 1.0,
      _steaming: 1.2,
      _baking: 1.5,
      _slow_cooking: 2.5,
      _raw: 0
}

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
        }
        {
          name: 'main_cooking',
          time: totalTime * 0.6
        }
        {
          name: 'finishing',
          time: totalTime * 0.2
        }
      ]
    }
  }

  getSeasonalAdjustments(baseTime: number, season: string): number {
    const seasonalModifiers: Record<string, number> = {
      summer: 0.8, // Faster cooking in summer,
      winter: 1.2, // Slower cooking in winter,
      _spring: 1.0, // Standard timing,
      _autumn: 1.0, // Standard timing
    }

    return baseTime * (seasonalModifiers[season.toLowerCase()] || 1.0)
  }
}

export default timingUtils,
