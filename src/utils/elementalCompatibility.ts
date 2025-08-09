import { recipeElementalService } from '@/services/RecipeElementalService';
import type { ElementalProperties } from '@/types/alchemy';
import { getCurrentElementalState } from '@/utils/elementalUtils';

/**
 * Interface for elemental compatibility results
 */
export interface ElementalCompatibility {
  compatibility: number; // 0-1 score
  dominantPair: {
    recipe: keyof ElementalProperties;
    user: keyof ElementalProperties;
  };
  complementaryScore: number; // 0-1 score for how well elements complement each other
  balanceScore: number; // 0-1 score for overall balance
  recommendation: string; // Text recommendation
}

/**
 * Calculate the elemental compatibility between a recipe and user's preference
 */
export async function calculateElementalCompatibility(
  recipeElemental: ElementalProperties,
  userElemental: ElementalProperties = getCurrentElementalState(),
): Promise<ElementalCompatibility> {
  // Ensure properties are standardized
  const recipe = recipeElementalService.standardizeRecipe({ elementalProperties: recipeElemental });
  const user = recipeElementalService.standardizeRecipe({ elementalProperties: userElemental });

  // Calculate simple similarity score
  const similarity = recipeElementalService.calculateSimilarity(
    recipe.elementalProperties,
    user.elementalProperties,
  );

  // Find dominant elements
  const recipeDominant = getDominantElement(recipe.elementalProperties);
  const userDominant = getDominantElement(user.elementalProperties);

  // Calculate complementary score - check if dominant elements complement each other
  const complementaryScore = calculateComplementaryScore(recipeDominant, userDominant);

  // Calculate balance score - how well the recipe balances user's elemental profile
  const balanceScore = calculateBalanceScore(recipe.elementalProperties, user.elementalProperties);

  // Calculate overall compatibility (weighted average)
  const compatibility = similarity * 0.4 + complementaryScore * 0.3 + balanceScore * 0.3;

  return {
    compatibility: Math.min(1, Math.max(0, compatibility)),
    dominantPair: {
      recipe: recipeDominant,
      user: userDominant,
    },
    complementaryScore,
    balanceScore,
    recommendation: generateRecommendation(compatibility, recipeDominant, userDominant),
  };
}

/**
 * Get the dominant element from elemental properties
 */
function getDominantElement(props: ElementalProperties): keyof ElementalProperties {
  return Object.entries(props).sort(([, a], [, b]) => b - a)[0][0] as keyof ElementalProperties;
}

/**
 * Calculate how well two elements complement each other
 * Each element should be treated individually, without opposition
 */
function calculateComplementaryScore(
  element1: keyof ElementalProperties,
  element2: keyof ElementalProperties,
): number {
  // All elements work together in various ways
  if (element1 === element2) {
    return 0.9; // Same element - highest compatibility (like reinforces like)
  } else {
    // All combinations of different elements are complementary
    // Providing different yet harmonious qualities
    return 0.7; // Different elements - good compatibility
  }
}

/**
 * Calculate how well recipe balances user's elemental profile
 */
function calculateBalanceScore(
  recipeProps: ElementalProperties,
  userProps: ElementalProperties,
): number {
  // Find user's weakest element
  const userWeakest = Object.entries(userProps).sort(
    ([, a], [, b]) => a - b,
  )[0][0] as keyof ElementalProperties;

  // Find user's strongest element
  const userStrongest = Object.entries(userProps).sort(
    ([, a], [, b]) => b - a,
  )[0][0] as keyof ElementalProperties;

  // Check if recipe strengthens user's weakest element
  const weakestScore = recipeProps[userWeakest] * 2; // Higher is better

  // Check if recipe moderates user's strongest element
  const strongestDifference = Math.abs(recipeProps[userStrongest] - userProps[userStrongest]);
  const strongestScore = 1 - strongestDifference; // Lower difference is better

  // Combined balance score
  return weakestScore * 0.6 + strongestScore * 0.4;
}

/**
 * Generate a text recommendation based on compatibility
 */
function generateRecommendation(
  score: number,
  recipeDominant: keyof ElementalProperties,
  userDominant: keyof ElementalProperties,
): string {
  if (score <= 0.4) {
    return `This recipe's ${recipeDominant} energy contrasts with your ${userDominant} energy. This contrasts with your natural balance and might feel disharmonious.`;
  } else if (score > 0.8) {
    return `Excellent match! This ${recipeDominant}-dominant recipe complements your ${userDominant} energy perfectly.`;
  } else if (score > 0.6) {
    return `Good match. This recipe's ${recipeDominant} qualities work well with your ${userDominant} energy.`;
  } else {
    return `Moderate match. This recipe will provide a different but balanced energy to your ${userDominant} dominant profile.`;
  }
}
