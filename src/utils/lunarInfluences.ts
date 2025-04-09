import type { LunarPhase, LunarInfluence } from '@/types/lunar';
import type { ElementalBalance } from '@/types/elemental';

export const calculateLunarInfluence = (
  date: Date,
  baseBalance: ElementalBalance
): ElementalBalance => {
  const phase = getLunarPhase(date);
  const influence = lunarInfluences[phase];
  
  return {
    Fire: baseBalance.Fire * (1 + influence.strength * elementalModifiers.Fire),
    Water: baseBalance.Water * (1 + influence.strength * elementalModifiers.Water),
    Air: baseBalance.Air * (1 + influence.strength * elementalModifiers.Air),
    Earth: baseBalance.Earth * (1 + influence.strength * elementalModifiers.Earth)
  };
};
