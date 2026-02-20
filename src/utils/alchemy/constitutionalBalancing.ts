
import type { AlchemicalProfile } from '@/contexts/UserContext';
import type { MonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';
import type { ElementalProperties } from '@/types/alchemy';

/**
 * Calculates a constitutional compatibility score between a user's alchemical profile and a recipe.
 * The score indicates how well the recipe aligns with the user's constitution.
 * A score closer to 1.0 is better.
 *
 * @param userStats - The user's alchemical profile.
 * @param recipe - The recipe to be scored.
 * @returns A compatibility score from 0.0 to 1.0+.
 */
export function calculateConstitutionalCompatibility(
  userStats: AlchemicalProfile,
  recipe: MonicaOptimizedRecipe
): number {
  let compatibilityScore = 1.0;

  if (!recipe.nutritionalOptimization) {
    return compatibilityScore;
  }

  const recipeElemental = recipe.nutritionalOptimization.elementalNutrition;

  // 1. Thermodynamic Alignment (Heat)
  const userHeat = userStats.heat;
  const recipeFire = recipeElemental.Fire || 0;

  // If user has high heat, they get more fiery recipes. If low heat, less fiery recipes.
  // Direct alignment: smaller difference is better.
  const heatCompatibility = 1 - Math.abs(userHeat - recipeFire);
  compatibilityScore *= 0.5 + heatCompatibility * 0.5; // Weight this as 50% of the score

  // 2. Elemental Alignment
  const userElemental = {
    Fire: userStats.fire,
    Water: userStats.water,
    Air: userStats.air,
    Earth: userStats.earth,
  };

  const elementalDifference = (
      Math.abs(userElemental.Fire - recipeElemental.Fire) +
      Math.abs(userElemental.Water - recipeElemental.Water) +
      Math.abs(userElemental.Air - recipeElemental.Air) +
      Math.abs(userElemental.Earth - recipeElemental.Earth)
  ) / 4; // Average difference

  // We want recipes that closely match the user's elemental makeup
  const elementalCompatibility = 1 - elementalDifference;
  compatibilityScore *= 0.5 + elementalCompatibility * 0.5; // Weight this as 50% of the score

  return compatibilityScore;
}
