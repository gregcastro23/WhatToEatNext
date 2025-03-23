import type { Recipe } from '@/types/recipe';
import type { Season, ZodiacSign } from '@/types/alchemy';
import { toZodiacSign } from '@/utils/zodiacUtils';

/**
 * Simplified version that focuses only on astrological influence
 * without elemental balance calculations
 */
export function calculateAstrologicalInfluence(
  recipe: Recipe,
  zodiacSign: string,
  season: Season
): number {
  if (!recipe.astrologicalProfile) return 0;
  
  let score = 0;
  
  // Convert string to proper ZodiacSign type
  const zodiac = toZodiacSign(zodiacSign);
  
  // Check zodiac compatibility
  if (recipe.astrologicalProfile.favorableZodiac.includes(zodiac)) {
    score += 5;
  }
  
  // Check seasonal compatibility
  if (recipe.energyProfile?.season?.includes(season)) {
    score += 5;
  }
  
  return score;
}

// Choose ONE export pattern - removing duplicates
export class ElementalCalculator {
  // Static method to get current elemental state
  static getCurrentelementalState() {
    return {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
  }
  
  // Add any other implementation methods here
}

// Removing the duplicate class declarations and alternative exports