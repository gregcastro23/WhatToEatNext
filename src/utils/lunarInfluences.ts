import type { ElementalState } from '@/types/elemental';
import type { LunarPhase } from '@/types/lunar';

// Object mapping lunar phases to their elemental influences
const lunarInfluences: Record<LunarPhase, { strength: number, elements: Record<string, number> }> = {
  'NEW_MOON': { strength: 0.3, elements: { 'Fire': 0.1, 'Water': 0.1, 'Air': 0.1, 'Earth': 0.1 } },
  'WAXING_CRESCENT': { strength: 0.2, elements: { 'Fire': 0.2, 'Air': 0.1, 'Water': 0.0, 'Earth': 0.0 } },
  'FIRST_QUARTER': { strength: 0.3, elements: { 'Fire': 0.3, 'Air': 0.2, 'Water': 0.0, 'Earth': 0.0 } },
  'WAXING_GIBBOUS': { strength: 0.4, elements: { 'Fire': 0.4, 'Air': 0.3, 'Water': 0.0, 'Earth': 0.0 } },
  'FULL_MOON': { strength: 0.5, elements: { 'Water': 0.4, 'Earth': 0.3, 'Fire': 0.0, 'Air': 0.0 } },
  'WANING_GIBBOUS': { strength: 0.4, elements: { 'Water': 0.3, 'Earth': 0.2, 'Fire': 0.0, 'Air': 0.0 } },
  'LAST_QUARTER': { strength: 0.3, elements: { 'Water': 0.2, 'Earth': 0.1, 'Fire': 0.0, 'Air': 0.0 } },
  'WANING_CRESCENT': { strength: 0.2, elements: { 'Water': 0.1, 'Earth': 0.1, 'Fire': 0.0, 'Air': 0.0 } }
};

// Element modifiers for each lunar phase
const elementalModifiers = {
  Fire: 0.2,
  Water: 0.3,
  Earth: 0.15,
  Air: 0.25
};

// Function to get lunar phase from date
function getLunarPhase(date: Date): LunarPhase {
  // Simple implementation that could be replaced with actual astronomical calculations
  const dayOfMonth = date.getDate();
  
  if (dayOfMonth <= 3 || dayOfMonth >= 27) return 'NEW_MOON';
  if (dayOfMonth <= 7) return 'WAXING_CRESCENT';
  if (dayOfMonth <= 10) return 'FIRST_QUARTER';
  if (dayOfMonth <= 14) return 'WAXING_GIBBOUS';
  if (dayOfMonth <= 17) return 'FULL_MOON';
  if (dayOfMonth <= 21) return 'WANING_GIBBOUS';
  if (dayOfMonth <= 24) return 'LAST_QUARTER';
  return 'WANING_CRESCENT';
}

export function applyLunarInfluence(baseBalance: ElementalState, date: Date): ElementalState {
  const phase = getLunarPhase(date);
  const influence = lunarInfluences[phase];
  
  return {
    Fire: baseBalance.Fire * (1 + influence.strength * elementalModifiers.Fire),
    Water: baseBalance.Water * (1 + influence.strength * elementalModifiers.Water),
    Air: baseBalance.Air * (1 + influence.strength * elementalModifiers.Air),
    Earth: baseBalance.Earth * (1 + influence.strength * elementalModifiers.Earth)
  };
}

export function getLunarElementalModifiers(phase: LunarPhase): Record<string, number> {
  return lunarInfluences[phase]?.elements || {
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0
  };
}
