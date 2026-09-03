import { VALID_SEASONS } from "@/constants/seasons";
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

// Keyed by `Season` itself, so the table is total: every valid season resolves
// to a row, and adding a season to VALID_SEASONS without adding a row here is a
// compile error rather than a runtime miss.
//
// These keys previously carried a leading underscore ("_Spring" … "_Winter"),
// which matched no Season and made every lookup miss. The underscore was not a
// marker for "disabled" — it is the repo-wide `varsIgnorePattern: "^_"` habit
// applied to object keys, where it silences nothing and only breaks the lookup.
// Nothing in the codebase indexes this or any other table with a "_" prefix.
//
// The four seasonal rows are reproduced verbatim from that table; only the keys
// changed. They form a Latin square — every row and every column is a
// permutation of {0.0, 0.1, 0.2, 0.3}, and every row sums to 0.6.
//
// The two remaining members of Season are not independent rows:
//   - "fall" is an alias of "autumn" (`_SEASON_DATE_RANGES` in
//     @/constants/seasons gives both the same date range), so it repeats that
//     row rather than introducing a fifth season.
//   - "all" means "no particular season", so it carries no bias: a zero row
//     leaves the base balance untouched.
const seasonalModifiers: Record<Season, Record<ElementName, number>> = {
  spring: { Fire: 0.2, Water: 0.1, Earth: 0.0, Air: 0.3 },
  summer: { Fire: 0.3, Water: 0.0, Earth: 0.1, Air: 0.2 },
  autumn: { Fire: 0.1, Water: 0.2, Earth: 0.3, Air: 0.0 },
  fall: { Fire: 0.1, Water: 0.2, Earth: 0.3, Air: 0.0 },
  winter: { Fire: 0.0, Water: 0.3, Earth: 0.2, Air: 0.1 },
  all: { Fire: 0.0, Water: 0.0, Earth: 0.0, Air: 0.0 },
};

// Base elements for calculations
const baseElements: ElementalState = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

/**
 * Resolve an arbitrary string to a Season, or null if it names no season.
 *
 * Callers reach these functions with plain strings — `applySeasonalTransition`
 * takes a phase name, and untyped JavaScript callers can pass anything. Casing
 * is normalised because the phase names this module was written against were
 * capitalised ("Spring"), matching the capitalised keys the table used to have.
 */
function resolveSeason(value: string): Season | null {
  const normalized = value.trim().toLowerCase();
  // `find` over the season list rather than a membership test plus a cast:
  // the element it returns is already a Season, so this needs no assertion.
  return VALID_SEASONS.find((season) => season === normalized) ?? null;
}

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

  const season = resolveSeason(currentPhase.name);
  if (!season) {
    throw new Error(
      `seasonalTransitions: phase "${currentPhase.name}" does not name a season`,
    );
  }

  const progress = calculateProgressInPhase(currentDate, currentPhase);
  const strength = calculateSeasonalStrength(progress);
  const modifiers = seasonalModifiers[season];

  return {
    Fire: baseElements.Fire * (1 + strength * modifiers.Fire),
    Water: baseElements.Water * (1 + strength * modifiers.Water),
    Air: baseElements.Air * (1 + strength * modifiers.Air),
    Earth: baseElements.Earth * (1 + strength * modifiers.Earth),
  };
}

export function getSeasonalInfluence(season: Season): ElementalState {
  const resolved = resolveSeason(season);
  if (!resolved) {
    throw new Error(`seasonalTransitions: "${season}" does not name a season`);
  }

  const modifiers = seasonalModifiers[resolved];

  return {
    Fire: baseElements.Fire * (1 + modifiers.Fire),
    Water: baseElements.Water * (1 + modifiers.Water),
    Air: baseElements.Air * (1 + modifiers.Air),
    Earth: baseElements.Earth * (1 + modifiers.Earth),
  };
}
