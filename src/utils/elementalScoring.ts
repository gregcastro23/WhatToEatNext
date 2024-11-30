import type { ElementalBalance, ElementalProperties } from '@/types/elemental';

export const calculateElementalScore = (
  recipe: Recipe,
  targetBalance: ElementalBalance,
  seasonalInfluence: ElementalBalance,
  lunarInfluence: ElementalBalance
): number => {
  const baseScore = calculateBaseElementalScore(recipe, targetBalance);
  const seasonalScore = applySeasonalModifiers(baseScore, seasonalInfluence);
  const finalScore = applyLunarModifiers(seasonalScore, lunarInfluence);
  
  return normalizeScore(finalScore);
};
