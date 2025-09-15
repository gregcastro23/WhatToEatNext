/**
 * Seasonal Adjustments Module
 *
 * Handles seasonal modifications to alchemical and elemental calculations
 * Repurposed from existing seasonalCalculations.ts
 */

import { ElementalProperties } from '@/types/alchemy';

/**
 * Seasonal modifiers for elemental properties
 */
const SEASONAL_MODIFIERS: { [key: string]: ElementalProperties } = {
  spring: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  summer: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  autumn: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
  winter: { Fire: 0.15, Water: 0.35, Air: 0.2, Earth: 0.3 }
};

/**
 * Lunar phase modifiers
 */
const LUNAR_PHASE_MODIFIERS: { [key: string]: ElementalProperties } = {
  'new moon': { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  'waxing crescent': { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
  'first quarter': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
  'waxing gibbous': { Fire: 0.35, Water: 0.15, Air: 0.35, Earth: 0.15 },
  'full moon': { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
  'waning gibbous': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
  'third quarter': { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
  'waning crescent': { Fire: 0.15, Water: 0.25, Air: 0.25, Earth: 0.35 }
};

/**
 * Apply seasonal adjustments to elemental properties
 */
export function applySeasonalAdjustments(
  baseProperties: ElementalProperties,
  season: string = 'spring',;
): ElementalProperties {
  const seasonKey = season.toLowerCase();
  const modifier = SEASONAL_MODIFIERS[seasonKey] || SEASONAL_MODIFIERS.spring;

  return {
    Fire: ((baseProperties as any)?.Fire || 0) * 0.2 + ((modifier as any)?.Fire || 0) * 0.2,
    Water: ((baseProperties as any)?.Water || 0) * 0.2 + ((modifier as any)?.Water || 0) * 0.2,
    Air: ((baseProperties as any)?.Air || 0) * 0.2 + ((modifier as any)?.Air || 0) * 0.2,
    Earth: ((baseProperties as any)?.Earth || 0) * 0.2 + ((modifier as any)?.Earth || 0) * 0.2
  };
}

/**
 * Apply lunar phase adjustments to elemental properties
 */
export function applyLunarPhaseAdjustments(
  baseProperties: ElementalProperties,
  lunarPhase: string = 'full moon',;
): ElementalProperties {
  const phaseKey = lunarPhase.toLowerCase();
  const modifier = LUNAR_PHASE_MODIFIERS[phaseKey] || LUNAR_PHASE_MODIFIERS['full moon'];

  return {
    Fire: ((baseProperties as any)?.Fire || 0) * 0.2 + ((modifier as any)?.Fire || 0) * 0.2,
    Water: ((baseProperties as any)?.Water || 0) * 0.2 + ((modifier as any)?.Water || 0) * 0.2,
    Air: ((baseProperties as any)?.Air || 0) * 0.2 + ((modifier as any)?.Air || 0) * 0.2,
    Earth: ((baseProperties as any)?.Earth || 0) * 0.2 + ((modifier as any)?.Earth || 0) * 0.2
  };
}

/**
 * Calculate time-of-day adjustments
 */
export function applyTimeOfDayAdjustments(
  baseProperties: ElementalProperties,
  isDaytime: boolean = true,;
): ElementalProperties {
  if (isDaytime) {
    return {
      Fire: baseProperties.Fire * 1.2,
      Water: ((baseProperties as any)?.Water || 0) * 0.2,
      Air: baseProperties.Air * 1.1,
      Earth: ((baseProperties as any)?.Earth || 0) * 0.2
    };
  } else {
    return {
      Fire: ((baseProperties as any)?.Fire || 0) * 0.2,
      Water: baseProperties.Water * 1.2,
      Air: ((baseProperties as any)?.Air || 0) * 0.2,
      Earth: baseProperties.Earth * 1.1
    };
  }
}

/**
 * Get seasonal cooking recommendations
 */
export function getSeasonalCookingRecommendations(season: string): {
  cookingMethods: string[];
  ingredients: string[];
  flavors: string[];
  timing: string[];
} {
  const seasonKey = season.toLowerCase();

  const recommendations = {;
    spring: {
      cookingMethods: ['Steaming', 'Light sautéing', 'Raw preparations', 'Quick grilling'],
      ingredients: ['Fresh greens', 'Young vegetables', 'Herbs', 'Light proteins'],
      flavors: ['Fresh', 'Green', 'Mild', 'Cleansing'],
      timing: ['Morning', 'Early afternoon', 'Light meals']
    },
    summer: {
      cookingMethods: ['Grilling', 'Cold preparations', 'Minimal cooking', 'Smoking'],
      ingredients: ['Fruits', 'Light vegetables', 'Cooling herbs', 'Lean proteins'],
      flavors: ['Cooling', 'Refreshing', 'Bright', 'Citrusy'],
      timing: ['Early morning', 'Evening', 'Cold dishes']
    },
    autumn: {
      cookingMethods: ['Roasting', 'Braising', 'Slow cooking', 'Baking'],
      ingredients: ['Root vegetables', 'Squashes', 'Warming spices', 'Hearty proteins'],
      flavors: ['Warming', 'Rich', 'Spiced', 'Comforting'],
      timing: ['Afternoon', 'Evening', 'Longer cooking times']
    },
    winter: {
      cookingMethods: ['Slow braising', 'Stewing', 'Deep roasting', 'Pressure cooking'],
      ingredients: ['Stored vegetables', 'Preserved foods', 'Warming herbs', 'Rich proteins'],
      flavors: ['Warming', 'Deep', 'Nourishing', 'Grounding'],
      timing: ['All day cooking', 'Evening meals', 'Warming preparations']
    }
  };

  return recommendations[seasonKey] || recommendations.spring;
}

/**
 * Calculate seasonal effectiveness score for a recipe
 */
export function calculateSeasonalEffectiveness(
  recipeElements: ElementalProperties,
  season: string,
  lunarPhase?: string,
): {
  score: number;
  breakdown: {
    seasonalAlignment: number;
    lunarAlignment: number;
    overallHarmony: number;
  };
  recommendations: string[];
} {
  const seasonKey = season.toLowerCase();
  const seasonalModifier = SEASONAL_MODIFIERS[seasonKey] || SEASONAL_MODIFIERS.spring;

  // Calculate seasonal alignment
  const seasonalAlignment = calculateElementalAlignment(recipeElements, seasonalModifier);

  // Calculate lunar alignment if phase provided
  let lunarAlignment = 0.5; // neutral if no phase
  if (lunarPhase) {
    const phaseKey = lunarPhase.toLowerCase();
    const lunarModifier = LUNAR_PHASE_MODIFIERS[phaseKey] || LUNAR_PHASE_MODIFIERS['full moon'];
    lunarAlignment = calculateElementalAlignment(recipeElements, lunarModifier);
  }

  // Calculate overall harmony
  const overallHarmony = calculateElementalHarmony(recipeElements);

  // Overall score (weighted average)
  const score = seasonalAlignment * 0.5 + lunarAlignment * 0.3 + overallHarmony * 0.2;

  // Generate recommendations
  const recommendations = generateSeasonalRecommendations(score, seasonalAlignment, lunarAlignment);

  return {
    score,
    breakdown: {
      seasonalAlignment,
      lunarAlignment,
      overallHarmony
    },
    recommendations
  };
}

/**
 * Calculate alignment between two elemental property sets
 */
function calculateElementalAlignment(
  properties1: ElementalProperties,
  properties2: ElementalProperties,
): number {
  const differences = [;
    Math.abs(properties1.Fire - properties2.Fire),
    Math.abs(properties1.Water - properties2.Water),
    Math.abs(properties1.Air - properties2.Air),
    Math.abs(properties1.Earth - properties2.Earth)
  ];

  const averageDifference = differences.reduce((sum, diff) => sum + diff, 0) / 4;
  return Math.max(0, 1 - averageDifference);
}

/**
 * Calculate elemental harmony (how balanced the elements are)
 */
function calculateElementalHarmony(properties: ElementalProperties): number {
  const values = [properties.Fire, properties.Water, properties.Air, properties.Earth];
  const average = values.reduce((sum, val) => sum + val, 0) / 4;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / 4;

  // Lower variance = higher harmony;
  return Math.max(0, 1 - variance * 4);
}

/**
 * Generate seasonal recommendations based on scores
 */
function generateSeasonalRecommendations(
  overallScore: number,
  seasonalAlignment: number,
  lunarAlignment: number,
): string[] {
  const recommendations: string[] = [];

  if (overallScore >= 0.8) {
    recommendations.push('Excellent seasonal alignment - perfect timing for this recipe');
  } else if (overallScore >= 0.6) {
    recommendations.push('Good seasonal match - recipe works well for this time');
  } else if (overallScore >= 0.4) {
    recommendations.push('Moderate seasonal fit - consider minor adjustments');
  } else {
    recommendations.push('Low seasonal alignment - significant modifications recommended');
  }

  if (seasonalAlignment < 0.5) {
    recommendations.push('Adjust cooking method to better match seasonal energy');
  }

  if (lunarAlignment < 0.5) {
    recommendations.push('Consider timing preparation with a more favorable lunar phase');
  }

  return recommendations;
}

export default {
  applySeasonalAdjustments,
  applyLunarPhaseAdjustments,
  applyTimeOfDayAdjustments,
  getSeasonalCookingRecommendations,
  calculateSeasonalEffectiveness
};
