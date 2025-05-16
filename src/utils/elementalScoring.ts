import @/types  from 'elemental ';
import @/types  from 'recipe ';

export function calculateElementalScore(
  recipe: Recipe,
  targetBalance: ElementalState,
  seasonalInfluence = 0,
  lunarInfluence = 0
): number {
  const baseScore = calculateBaseElementalScore(recipe, targetBalance);
  const seasonalScore = applySeasonalModifiers(baseScore, seasonalInfluence);
  const finalScore = applyLunarModifiers(seasonalScore, lunarInfluence);

  return normalizeScore(finalScore);
}

// Helper functions
function calculateBaseElementalScore(
  recipe: Recipe,
  targetBalance: ElementalState
): number {
  // Simple matching algorithm between recipe and target elemental balance
  const recipeElements = recipe.elementalProperties;
  const score = 0;

  // Calculate how well the recipe matches the target balance
  score += (1 - Math.abs(recipeElements.Fire - targetBalance.Fire)) * 0.25;
  score += (1 - Math.abs(recipeElements.Water - targetBalance.Water)) * 0.25;
  score += (1 - Math.abs(recipeElements.Earth - targetBalance.Earth)) * 0.25;
  score += (1 - Math.abs(recipeElements.Air - targetBalance.Air)) * 0.25;

  return score;
}

function applySeasonalModifiers(
  baseScore: number,
  seasonalInfluence: number
): number {
  // Apply seasonal influences to the score
  return baseScore * (1 + seasonalInfluence);
}

function applyLunarModifiers(score: number, lunarInfluence: number): number {
  // Apply lunar phase influences to the score
  return score * (1 + lunarInfluence);
}

function normalizeScore(score: number): number {
  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, score));
}
