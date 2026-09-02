import type { Season } from "@/types/alchemy";
import type { ElementalState } from "@/types/elemental";

// Default elemental balance
const defaultBalance: ElementalState = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

// Seasonal modifiers for elemental balance
type ElementName = "Fire" | "Water" | "Earth" | "Air";

// NOTE: these keys carry a leading underscore and use "_Autumn", while
// Season is "spring" | "summer" | "fall" | "winter". No season matches any
// key, so every lookup below is a miss. Preserved verbatim rather than
// renamed — both consumers are currently uncalled, and choosing the intended
// key set is a semantic decision, not a typing one.
const seasonalModifiers: Record<string, Record<ElementName, number>> = {
  _Spring: { Fire: 0.2, Water: 0.1, Earth: 0.0, Air: 0.3 },
  _Summer: { Fire: 0.3, Water: 0.0, Earth: 0.1, Air: 0.2 },
  _Autumn: { Fire: 0.1, Water: 0.2, Earth: 0.3, Air: 0.0 },
  _Winter: { Fire: 0.0, Water: 0.3, Earth: 0.2, Air: 0.1 },
};

// Base elements for calculations
const baseElements: ElementalState = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

// Functions to calculate phase progression
function calculateProgressInPhase(
  _currentDate: Date,
  _currentPhase: { name: string },
): number {
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
  currentPhase: { name: string } | null,
): ElementalState {
  if (!currentPhase) return defaultBalance;

  const progress = calculateProgressInPhase(currentDate, currentPhase);
  const strength = calculateSeasonalStrength(progress);

  const modifiers = seasonalModifiers[currentPhase.name];
  if (!modifiers) {
    throw new Error(
      `seasonalTransitions: no modifiers for phase "${currentPhase.name}"`,
    );
  }

  return {
    Fire: baseElements.Fire * (1 + strength * modifiers.Fire),
    Water: baseElements.Water * (1 + strength * modifiers.Water),
    Air: baseElements.Air * (1 + strength * modifiers.Air),
    Earth: baseElements.Earth * (1 + strength * modifiers.Earth),
  };
}

export function getSeasonalInfluence(season: Season): ElementalState {
  const modifiers = seasonalModifiers[season];
  if (!modifiers) {
    throw new Error(`seasonalTransitions: no modifiers for season "${season}"`);
  }

  return {
    Fire: baseElements.Fire * (1 + modifiers.Fire),
    Water: baseElements.Water * (1 + modifiers.Water),
    Air: baseElements.Air * (1 + modifiers.Air),
    Earth: baseElements.Earth * (1 + modifiers.Earth),
  };
}
