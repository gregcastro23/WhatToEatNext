import type { LunarPhase, LunarInfluence } from '@/types/lunar';
import type { elementalState } from '@/types/elemental';

export const calculateLunarInfluence = (
  date: Date,
  baseBalance: elementalState
): elementalState => {
  const phase = getLunarPhase(date);
  const influence = lunarInfluences[phase];
  
  return {
    Fire: baseBalance.Fire * (1 + influence.strength * elementalModifiers.Fire),
    Water: baseBalance.Water * (1 + influence.strength * elementalModifiers.Water),
    Air: baseBalance.Air * (1 + influence.strength * elementalModifiers.Air),
    Earth: baseBalance.Earth * (1 + influence.strength * elementalModifiers.Earth)
  };
};
