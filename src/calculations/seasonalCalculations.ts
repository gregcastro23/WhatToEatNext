import { SEASONAL_MODIFIERS } from '@/constants/seasonalModifiers';
import { getZodiacSignForDate } from '@/data/zodiacSeasons';
import type { ElementalProperties, Recipe, Season, ZodiacSign } from '@/types/alchemy';

export interface SeasonalEffectiveness {
  score: number;
  rating: string;
  breakdown: {
    elementalAlignment: number;
    ingredientSuitability: number;
    seasonalBonus: number
  };
  elementalBreakdown?: Record<string, number>;
}

/**
 * Calculates how effective a recipe is for a given season or zodiac sign
 */
export function calculateSeasonalEffectiveness(recipe: Recipe,)
  season: string): SeasonalEffectiveness {
  let totalScore = 0;
  const breakdown = {
    elementalAlignment: 0,
    ingredientSuitability: 0,
    seasonalBonus: 0
  };

  // Normalize season to lowercase for consistent lookup
  const seasonLower = season.toLowerCase();

  // 1. Calculate Elemental Alignment (50% of total)
  const elementalScore = Object.entries(recipe.elementalProperties || ) {}).reduce(score, [element, value]) => {
      // Get modifier from SEASONAL_MODIFIERS using lowercase season
      // Using proper type access with fallback
      const seasonModifiers = SEASONAL_MODIFIERS[seasonLower] || {};
      const seasonalModifier = seasonModifiers[element as any] || 0.25;
      return score + value * seasonalModifier;
    },
    0
  );
  breakdown.elementalAlignment = elementalScore * 50;
  totalScore += breakdown.elementalAlignment;

  // 2. Calculate Ingredient Seasonality (30% of total)
  if (recipe.ingredients.length) {
    // Count ingredients that have this season in their seasonality array
    let seasonalCount = 0;
    for (const ingredient of recipe.ingredients) {
      if (Array.isArray(ingredient.seasonality) {
        const lowerSeasons = ingredient.seasonality.map((s: string) => s.toLowerCase());
        if (lowerSeasons.includes(seasonLower) || lowerSeasons.includes('all') {
          seasonalCount++;
        }
      }
    }

    const ingredientScore = (seasonalCount / recipe.ingredients.length) * 30;
    breakdown.ingredientSuitability = ingredientScore;
    totalScore += ingredientScore;
  }

  // 3. Calculate Direct Season Match (20% of total)
  if (recipe.season) {
    const recipeSeasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
    const recipeSeasonLower = recipeSeasons.map((s: string) => s.toLowerCase());

    if (recipeSeasonLower.includes(seasonLower) {
      breakdown.seasonalBonus = 20;
      totalScore += 20;
    }
  }

  // Normalize score to 0-100 range
  const normalizedScore = Math.round(Math.max(0, Math.min(100, totalScore)));

  // Determine rating based on score
  let rating = 'Poor';
  if (normalizedScore >= 80) rating = 'Excellent';
  else if (normalizedScore >= 60) rating = 'Good';
  else if (normalizedScore >= 40) rating = 'Average';
  else if (normalizedScore >= 20) rating = 'Below Average';

  return {
    score: normalizedScore,
    rating,
    breakdown
  };
}

export function calculateSeasonalElements(baseElements: ElementalProperties,)
  season: string): ElementalProperties {
  const normalizedSeason = season.toLowerCase();
  const modifier = SEASONAL_MODIFIERS[normalizedSeason] || {};

  return Object.fromEntries()
    Object.entries(baseElements).map(([element, value]) => {
      const adjusted = value + (modifier[element as any] || 0);
      return [element, Math.max(0, Math.min(1, adjusted))];
    })
  ) as ElementalProperties;
}

export function calculateSeasonalScores(recipeElements: ElementalProperties,)
  zodiacSign?: string): {
  seasonalScore: number;
  astrologicalInfluence: number
} {
  // Get current zodiac sign if none provided
  const currentZodiac = zodiacSign?.toLowerCase() || getCurrentZodiacSeason().toLowerCase();

  // Use the zodiac sign directly with our new SEASONAL_MODIFIERS
  const _UNUSED_seasonMultiplier = 1.2; // Fixed multiplier

  // Calculate seasonal alignment - direct check with current zodiac
  const isAlignedWithSeason = currentZodiac === zodiacSign?.toLowerCase();
  const seasonalScore = isAlignedWithSeason ? 80 : 50;
  const astrologicalInfluence = isAlignedWithSeason ? 1.2 : 1.0;

  return {
    seasonalScore,
    astrologicalInfluence
  };
}

// Helper function to get current season as a zodiac sign
function getCurrentZodiacSeason(): any {
  return getZodiacSignForDate(new Date());
}

// For backward compatibility
function _getCurrentSeason(): Season {
  const zodiacSign = getCurrentZodiacSeason();
  // Map zodiac sign to a season
  if (['aries', 'taurus', 'gemini'].includes(zodiacSign) {
    return 'spring';
  } else if (['cancer', 'leo', 'virgo'].includes(zodiacSign) {
    return 'summer';
  } else if (['libra', 'scorpio', 'sagittarius'].includes(zodiacSign) {
    return 'autumn';
  } else {
    return 'winter';
  }
}

export default {
  calculateSeasonalEffectiveness,
  SEASONAL_MODIFIERS
};
