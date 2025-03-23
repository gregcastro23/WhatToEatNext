import type { elementalState, ElementalProperties } from '@/types/elemental';

export const calculateElementalScore = (
  recipe: Recipe,
  targetBalance: elementalState,
  seasonalInfluence: elementalState,
  lunarInfluence: elementalState
): number => {
  const baseScore = calculateBaseElementalScore(recipe, targetBalance);
  const seasonalScore = applySeasonalModifiers(baseScore, seasonalInfluence);
  const finalScore = applyLunarModifiers(seasonalScore, lunarInfluence);
  
  return normalizeScore(finalScore);
};
