import type { Season, SeasonalPhase } from '@/types/seasonal';
import type { ElementalBalance } from '@/types/elemental';

export const calculateSeasonalTransition = (
  currentDate: Date,
  phases: SeasonalPhase[]
): ElementalBalance => {
  // Find current and next season
  const currentPhase = phases.find(phase => 
    currentDate >= phase.start && currentDate <= phase.end
  );
  
  if (!currentPhase) return defaultBalance;

  const progress = calculateProgressInPhase(currentDate, currentPhase);
  const strength = calculateSeasonalStrength(progress);

  return {
    Fire: baseElements.Fire * (1 + strength * seasonalModifiers[currentPhase.name].Fire),
    Water: baseElements.Water * (1 + strength * seasonalModifiers[currentPhase.name].Water),
    Air: baseElements.Air * (1 + strength * seasonalModifiers[currentPhase.name].Air),
    Earth: baseElements.Earth * (1 + strength * seasonalModifiers[currentPhase.name].Earth)
  };
};
