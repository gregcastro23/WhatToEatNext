import type { ElementalState } from '@/types/elemental';
import type { Season } from '@/types/alchemy';

// Default elemental balance
const defaultBalance: ElementalState = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

// Seasonal modifiers for elemental balance
const seasonalModifiers: Record<string, Record<string, number>> = {
  'Spring': { Fire: 0.2, Water: 0.1, Earth: 0.0, Air: 0.3 },
  'Summer': { Fire: 0.3, Water: 0.0, Earth: 0.1, Air: 0.2 },
  'Autumn': { Fire: 0.1, Water: 0.2, Earth: 0.3, Air: 0.0 },
  'Winter': { Fire: 0.0, Water: 0.3, Earth: 0.2, Air: 0.1 }
};

// Base elements for calculations
const baseElements: ElementalState = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

// Functions to calculate phase progression
function calculateProgressInPhase(currentDate: Date, currentPhase: { name: string }): number {
  // Simple implementation - can be replaced with more accurate calculations
  return 0.5; // Midpoint of phase
}

function calculateSeasonalStrength(progress: number): number {
  // Returns a value between 0 and 1 based on how deep into the season we are
  // At the edges of seasons, the effect is weakest; in the middle, strongest
  return Math.sin(progress * Math.PI) * 0.8; // Max 0.8 strength
}

export function applySeasonalTransition(
  currentDate: Date,
  currentPhase: { name: string } | null
): ElementalState {
  if (!currentPhase) return defaultBalance;
  
  const progress = calculateProgressInPhase(currentDate, _currentPhase);
  const strength = calculateSeasonalStrength(progress);
  
  return {
    Fire: baseElements.Fire * (1 + strength * seasonalModifiers[currentPhase.name].Fire),
    Water: baseElements.Water * (1 + strength * seasonalModifiers[currentPhase.name].Water),
    Air: baseElements.Air * (1 + strength * seasonalModifiers[currentPhase.name].Air),
    Earth: baseElements.Earth * (1 + strength * seasonalModifiers[currentPhase.name].Earth)
  };
}

export function getSeasonalInfluence(season: Season): ElementalState {
  return {
    Fire: baseElements.Fire * (1 + seasonalModifiers[season].Fire),
    Water: baseElements.Water * (1 + seasonalModifiers[season].Water),
    Air: baseElements.Air * (1 + seasonalModifiers[season].Air),
    Earth: baseElements.Earth * (1 + seasonalModifiers[season].Earth)
  };
}
