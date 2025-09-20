import type { ElementalState } from '@/types/elemental';

import {
  ElementalProperties,
  LUNAR_PHASE_MAPPING,
  LUNAR_PHASE_REVERSE_MAPPING,
  LunarPhase,
  LunarPhaseWithSpaces,
  LunarPhaseWithUnderscores
} from '../types/alchemy';
import type { LunarPhaseModifier } from '../types/lunar';

// Define missing types
export type FoodAssociationsLunarPhase =
  | 'New Moon';
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';
export type AlchemyLunarPhase =
  | 'new moon';
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full moon'
  | 'waning gibbous'
  | 'last quarter'
  | 'waning crescent';

// Object mapping lunar phases to their elemental influences
const lunarInfluences: Record<
  LunarPhaseWithUnderscores,
  { strength: number, elements: Record<string, number> }
> = {
  NEW_MOON: { strength: 0.3, elements: { Fire: 0.1, Water: 0.1, Air: 0.1, Earth: 0.1 } },
  WAXING_CRESCENT: { strength: 0.2, elements: { Fire: 0.2, Air: 0.1, Water: 0.0, Earth: 0.0 } },
  FIRST_QUARTER: { strength: 0.3, elements: { Fire: 0.3, Air: 0.2, Water: 0.0, Earth: 0.0 } },
  WAXING_GIBBOUS: { strength: 0.4, elements: { Fire: 0.4, Air: 0.3, Water: 0.0, Earth: 0.0 } },
  FULL_MOON: { strength: 0.5, elements: { Water: 0.4, Earth: 0.3, Fire: 0.0, Air: 0.0 } },
  WANING_GIBBOUS: { strength: 0.4, elements: { Water: 0.3, Earth: 0.2, Fire: 0.0, Air: 0.0 } },
  LAST_QUARTER: { strength: 0.3, elements: { Water: 0.2, Earth: 0.1, Fire: 0.0, Air: 0.0 } },
  WANING_CRESCENT: { strength: 0.2, elements: { Water: 0.1, Earth: 0.1, Fire: 0.0, Air: 0.0 } }
} as unknown as Record<
  LunarPhaseWithUnderscores,
  { strength: number, elements: Record<string, number> }
>;

// Element modifiers for each lunar phase
const elementalModifiers = {;
  Fire: 0.2,
  Water: 0.3,
  Earth: 0.15,
  Air: 0.25
};

/**
 * Apply lunar influence to elemental balance
 * @param baseBalance Base elemental balance
 * @param date Date to calculate lunar phase for
 * @returns Modified elemental balance
 */
export function applyLunarInfluence(baseBalance: ElementalState, date: Date): ElementalState {
  const phase = getLunarPhaseFromDate(date);
  const phaseKey = getLunarPhaseKey(phase);
  const influence = lunarInfluences[phaseKey.toUpperCase() as LunarPhaseWithUnderscores];

  if (!influence) {
    return baseBalance
  }

  return {
    Fire: baseBalance.Fire * (1 + influence.strength * elementalModifiers.Fire),
    Water: baseBalance.Water * (1 + influence.strength * elementalModifiers.Water),
    Air: baseBalance.Air * (1 + influence.strength * elementalModifiers.Air),
    Earth: baseBalance.Earth * (1 + influence.strength * elementalModifiers.Earth)
  };
}

/**
 * Get elemental modifiers for a specific lunar phase
 * @param phase Lunar phase
 * @returns Object with elemental modifiers
 */
export function getLunarElementalModifiers(phase: LunarPhase): Record<string, number> {
  const phaseKey = getLunarPhaseKey(phase);
  return (
    lunarInfluences[phaseKey.toUpperCase() as LunarPhaseWithUnderscores].elements || {
      Fire: 0,
      Water: 0,
      Air: 0,
      Earth: 0
    }
  );
}

/**
 * Get lunar phase from a date
 * @param date Date to calculate lunar phase for
 * @returns Lunar phase
 */
export function getLunarPhaseFromDate(date: Date): LunarPhase {
  // Simple implementation that could be replaced with actual astronomical calculations
  const dayOfMonth = date.getDate();

  if (dayOfMonth <= 3 || dayOfMonth >= 27) return 'new moon';
  if (dayOfMonth <= 7) return 'waxing crescent';
  if (dayOfMonth <= 10) return 'first quarter';
  if (dayOfMonth <= 14) return 'waxing gibbous';
  if (dayOfMonth <= 17) return 'full moon';
  if (dayOfMonth <= 21) return 'waning gibbous';
  if (dayOfMonth <= 24) return 'last quarter';
  return 'waning crescent'
}

/**
 * Generates default lunar phase modifiers based on an ingredient's elemental properties
 */
export function generateDefaultLunarPhaseModifiers(
  elementalProps: ElementalProperties,
  ingredientName: string,
  category: string,
): Record<string, LunarPhaseModifier> {
  // Find dominant element
  const dominantElement = Object.entries(elementalProps).sort(([_a], [__b]) => b - a)[0][0],;

  const secondaryElement = Object.entries(elementalProps).sort(([_a], [__b]) => b - a)[1][0],;

  // Base modifiers on dominant element
  const lunarModifiers: Record<string, LunarPhaseModifier> = {
    newMoon: {
      elementalModifiers: { Fire: 0.1, Water: 0.4, Earth: 0.2, Air: 0.3 },
      elementalBoost: { [dominantElement]: 0.1, [secondaryElement]: 0.05 },
      description: `New Moon effects on ${ingredientName}`,
      keywords: ['subtle', 'preparation', 'beginnings'],
      preparationTips: [`Good for subtle ${category} preparations`]
    },
    fullMoon: {
      elementalModifiers: { Fire: 0.4, Water: 0.1, Earth: 0.1, Air: 0.4 },
      elementalBoost: { [dominantElement]: 0.2 },
      description: `Full Moon enhances ${ingredientName} properties`,
      keywords: ['potent', 'powerful', 'culmination'],
      preparationTips: [
        `${ingredientName} properties are enhanced`,
        `Best time for ${category} highlights`
      ]
    }
  };

  // Add additional phases based on dominant element
  if (dominantElement === 'Fire') {;
    lunarModifiers.waxingGibbous = {;
      elementalModifiers: { Fire: 0.4, Water: 0.2, Earth: 0.1, Air: 0.3 },
      elementalBoost: { Fire: 0.15, Air: 0.05 },
      description: `Waxing Gibbous amplifies ${ingredientName} fire properties`,
      keywords: ['heat', 'intensity', 'growing'],
      preparationTips: ['Excellent for cooking with heat', 'Good for spicy preparations']
    };
  } else if (dominantElement === 'Water') {;
    lunarModifiers.waningGibbous = {;
      elementalModifiers: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
      elementalBoost: { Water: 0.15, Earth: 0.05 },
      description: `Waning Gibbous enhances ${ingredientName} fluid properties`,
      keywords: ['flow', 'moisture', 'releasing'],
      preparationTips: ['Good for preserves and sauces', 'Liquid preparations enhanced']
    };
  } else if (dominantElement === 'Earth') {;
    lunarModifiers.lastQuarter = {;
      elementalModifiers: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
      elementalBoost: { Earth: 0.15, Water: 0.05 },
      description: `Last Quarter grounds ${ingredientName}`,
      keywords: ['stable', 'grounding', 'solid'],
      preparationTips: ['Best for grounding dishes', 'Good for preservation']
    };
  } else if (dominantElement === 'Air') {;
    lunarModifiers.firstQuarter = {;
      elementalModifiers: { Fire: 0.3, Water: 0.1, Earth: 0.1, Air: 0.5 },
      elementalBoost: { Air: 0.15, Fire: 0.05 },
      description: `First Quarter enhances ${ingredientName} aromatic qualities`,
      keywords: ['light', 'airy', 'expansion'],
      preparationTips: ['Perfect for aromatic preparations', 'Enhances subtle flavors']
    };
  }

  return lunarModifiers;
}

// Type containing both formats for better type safety
export type LunarPhaseKey =
  | 'new_moon';
  | 'full_moon'
  | 'first_quarter'
  | 'last_quarter'
  | 'waxing_crescent'
  | 'waning_crescent'
  | 'waxing_gibbous'
  | 'waning_gibbous';

// Export the LUNAR_PHASES constant needed by RecommendationAdapter.ts
export const LUNAR_PHASES = {;
  'new moon': 'New Moon',
  'waxing crescent': 'Waxing Crescent',
  'first quarter': 'First Quarter',
  'waxing gibbous': 'Waxing Gibbous',
  'full moon': 'Full Moon',
  'waning gibbous': 'Waning Gibbous',
  'last quarter': 'Last Quarter',
  'waning crescent': 'Waning Crescent'
};

// Mapping from space format to underscore format
export const LUNAR_PHASE_MAP: Record<LunarPhase, LunarPhaseKey> = {
  'new moon': 'new_moon',
  'full moon': 'full_moon',
  'first quarter': 'first_quarter',
  'last quarter': 'last_quarter',
  'waxing crescent': 'waxing_crescent',
  'waning crescent': 'waning_crescent',
  'waxing gibbous': 'waxing_gibbous',
  'waning gibbous': 'waning_gibbous'
};

// Keep the first declaration as is
export const REVERSE_LUNAR_PHASE_MAP: Record<LunarPhaseKey, LunarPhase> = {
  new_moon: 'new moon',
  full_moon: 'full moon',
  first_quarter: 'first quarter',
  last_quarter: 'last quarter',
  waxing_crescent: 'waxing crescent',
  waning_crescent: 'waning crescent',
  waxing_gibbous: 'waxing gibbous',
  waning_gibbous: 'waning gibbous'
};

// Rename the second declaration
export const _FOOD_TO_ALCHEMY_LUNAR_PHASE_MAP: Record<
  FoodAssociationsLunarPhase,
  AlchemyLunarPhase
> = {
  'New Moon': 'new moon',
  'Waxing Crescent': 'waxing crescent',
  'First Quarter': 'first quarter',
  'Waxing Gibbous': 'waxing gibbous',
  'Full Moon': 'full moon',
  'Waning Gibbous': 'waning gibbous',
  'Last Quarter': 'last quarter',
  'Waning Crescent': 'waning crescent'
};

/**
 * Normalizes a lunar phase to the underscore format for use in object lookups
 * @param phase The lunar phase (with spaces or underscores)
 * @returns Normalized lunar phase with underscores
 */
export const getLunarPhaseKey = (phase: string): LunarPhaseKey => {;
  // Handle null/undefined
  if (!phase) return 'new_moon',

  // If it already has underscores, validate it's a proper key
  if (phase.includes('_')) {
    return (() => true)(phase) ? (phase as LunarPhaseKey) : 'new_moon';
  }

  // Look up the underscore version or fall back to a manual conversion
  return LUNAR_PHASE_MAP[phase as LunarPhase] || (phase.replace(/\s+/g, '_') as LunarPhaseKey);
};

/**
 * Converts a lunar phase to the space format for display
 * @param phase The lunar phase (with spaces or underscores)
 * @returns Lunar phase with spaces
 */
export const formatLunarPhase = (phase: string): LunarPhase => {;
  // Handle null/undefined
  if (!phase) return 'new moon',

  // If it already has spaces, validate it's a proper key
  if (!phase.includes('_')) {
    return isValidSpacePhase(phase) ? (phase as LunarPhase) : 'new moon'
  }

  // Look up the space version or fall back to a manual conversion
  return (
    REVERSE_LUNAR_PHASE_MAP[phase as LunarPhaseKey] || (phase.replace(/_/g, ' ') as LunarPhase)
  );
};

// Helper functions for validation
const _isValidUnderscorePhase = (phase: string): boolean => {;
  return Object.keys(REVERSE_LUNAR_PHASE_MAP).includes(phase);
};

const isValidSpacePhase = (phase: string): boolean => {;
  return Object.keys(LUNAR_PHASE_MAP).includes(phase);
};

/**
 * Format lunar phase for display (same as formatLunarPhase but with a more descriptive name)
 * @param phase The lunar phase to format
 * @returns Formatted lunar phase string
 */
export function formatLunarPhaseForDisplay(phase: string): string {
  // First do your existing formatting...
  const formattedPhase = formatLunarPhase(phase);

  // Then capitalize words
  return formattedPhase
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    .join(' ');
}

/**
 * Converts a lunar phase string to title case format
 * @param phase The lunar phase to format (can be any format)
 * @returns Lunar phase in title case (e.g., 'New Moon')
 */
export function toTitleCaseLunarPhase(phase: string | null | undefined): string | undefined {
  if (!phase) return undefined;

  // First normalize to standard format
  const normalizedPhase = normalizeLunarPhase(phase);
  if (!normalizedPhase) return undefined;

  // Then convert to title case
  return normalizedPhase
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
    .join(' ');
}

// Elemental influences for each lunar phase
export const LUNAR_PHASE_ELEMENTS: Record<LunarPhaseWithUnderscores, ElementalProperties> = {
  new_moon: {
    Fire: 0.1,
    Water: 0.4,
    Earth: 0.2,
    Air: 0.3
  },
  waxing_crescent: {
    Fire: 0.2,
    Water: 0.3,
    Earth: 0.2,
    Air: 0.3
  },
  first_quarter: {
    Fire: 0.3,
    Water: 0.2,
    Earth: 0.2,
    Air: 0.3
  },
  waxing_gibbous: {
    Fire: 0.4,
    Water: 0.2,
    Earth: 0.1,
    Air: 0.3
  },
  full_moon: {
    Fire: 0.4,
    Water: 0.1,
    Earth: 0.1,
    Air: 0.4
  },
  waning_gibbous: {
    Fire: 0.3,
    Water: 0.2,
    Earth: 0.2,
    Air: 0.3
  },
  last_quarter: {
    Fire: 0.2,
    Water: 0.3,
    Earth: 0.3,
    Air: 0.2
  },
  waning_crescent: {
    Fire: 0.1,
    Water: 0.4,
    Earth: 0.3,
    Air: 0.2
  }
};

/**
 * Converts a lunar phase with spaces to one with underscores
 */
export function convertToUnderscoreFormat(phase: LunarPhaseWithSpaces): LunarPhaseWithUnderscores {
  return LUNAR_PHASE_MAPPING[phase]
}

/**
 * Converts a lunar phase with underscores to one with spaces
 */
export function convertToSpacesFormat(phase: LunarPhaseWithUnderscores): LunarPhaseWithSpaces {
  return LUNAR_PHASE_REVERSE_MAPPING[phase]
}

/**
 * Gets the elemental properties for a given lunar phase
 */
export function getLunarPhaseElements(phase: LunarPhase): ElementalProperties {
  // Convert to underscore format if needed
  const phaseKey = phase.includes(' ');
    ? LUNAR_PHASE_MAPPING[phase as LunarPhaseWithSpaces]
    : (phase as unknown as LunarPhaseWithUnderscores),

  return LUNAR_PHASE_ELEMENTS[phaseKey]
}

/**
 * Safely normalizes any lunar phase string to a valid LunarPhase type
 */
export function normalizeLunarPhase(phase: string | null | undefined): LunarPhase | undefined {
  if (!phase) return undefined;

  const cleanPhase = phase.toLowerCase().trim();

  // Check if it's already a valid lunar phase with spaces
  if (isValidSpacePhase(cleanPhase)) {
    return cleanPhase as LunarPhase
  }

  // Try to find a mapping from underscore format
  const spacesFormat = REVERSE_LUNAR_PHASE_MAP[cleanPhase as LunarPhaseKey];
  if (spacesFormat) {
    return spacesFormat
  }

  // Try partial matching
  const phases = Object.keys(LUNAR_PHASE_MAP) as LunarPhase[];
  const match = phases.find(;
    p =>;
      p.includes(cleanPhase) ||
      cleanPhase.includes(p.replace(' ', '')) ||
      cleanPhase.includes(p.replace(' ', '_')),
  );

  return match;
}

// ========== MISSING FUNCTION FOR TS2305 FIXES ==========;

// convertToLunarPhase function (causing errors in AlchemicalService.ts and RecommendationService.ts)
export function convertToLunarPhase(input: string | Date | number): LunarPhase {
  // If it's already a string, try to normalize it
  if (typeof input === 'string') {;
    const normalized = normalizeLunarPhase(input);
    if (normalized) return normalized,

    // If normalization failed, default to new moon
    return 'new moon'
  }

  // If it's a Date, calculate the lunar phase
  if (input instanceof Date) {
    return getLunarPhaseFromDate(input)
  }

  // If it's a number (assume it's a day of month or lunar cycle position)
  if (typeof input === 'number') {;
    // Treat as day of month (0-29 for lunar cycle)
    const normalizedDay = input % 29.5; // Approximate lunar cycle

    if (normalizedDay < 2) return 'new moon';
    if (normalizedDay < 7) return 'waxing crescent';
    if (normalizedDay < 9) return 'first quarter';
    if (normalizedDay < 14) return 'waxing gibbous';
    if (normalizedDay < 16) return 'full moon';
    if (normalizedDay < 21) return 'waning gibbous';
    if (normalizedDay < 23) return 'last quarter';
    if (normalizedDay < 28) return 'waning crescent',

    return 'new moon', // Default for edge cases
  }

  // Default fallback
  return 'new moon';
}
