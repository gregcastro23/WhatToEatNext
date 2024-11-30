import type { ElementalProperties, SeasonalModifier } from '@/types/alchemy';
import { seasonalModifiers } from '@/utils/constants/seasons';

export const calculateSeasonalInfluence = (
  baseElements: ElementalProperties,
  season: string,
  dayOfYear: number
): ElementalProperties => {
  const seasonalMod = seasonalModifiers[season.toLowerCase()];
  if (!seasonalMod) return baseElements;

  // Calculate where in the season we are (0-1)
  const seasonProgress = calculateSeasonProgress(dayOfYear, season);
  
  // Calculate seasonal strength
  const seasonStrength = calculateSeasonalStrength(seasonProgress);

  return {
    Fire: baseElements.Fire * (1 + seasonalMod.elementalModifier.Fire * seasonStrength),
    Water: baseElements.Water * (1 + seasonalMod.elementalModifier.Water * seasonStrength),
    Air: baseElements.Air * (1 + seasonalMod.elementalModifier.Air * seasonStrength),
    Earth: baseElements.Earth * (1 + seasonalMod.elementalModifier.Earth * seasonStrength)
  };
};

const calculateSeasonProgress = (dayOfYear: number, season: string): number => {
  const seasonStarts = {
    spring: 79, // March 20
    summer: 172, // June 21
    fall: 265, // September 22
    winter: 355 // December 21
  };

  const seasonLengths = {
    spring: 93,
    summer: 93,
    fall: 90,
    winter: 89
  };

  const start = seasonStarts[season as keyof typeof seasonStarts];
  const length = seasonLengths[season as keyof typeof seasonLengths];
  
  let progress = (dayOfYear - start) / length;
  if (progress < 0) progress += 1;
  
  return Math.min(Math.max(progress, 0), 1);
};

const calculateSeasonalStrength = (progress: number): number => {
  // Peak strength at middle of season
  return 1 - Math.abs(progress - 0.5) * 2;
};
