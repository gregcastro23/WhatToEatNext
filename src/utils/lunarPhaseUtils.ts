import type { ElementalState } from '@/types/elemental';
import {
  type ElementalProperties,
  LUNAR_PHASE_MAPPING,
  LUNAR_PHASE_REVERSE_MAPPING,
  type LunarPhase,
  type LunarPhaseWithSpaces,
  type LunarPhaseWithUnderscores,
} from '../types/alchemy';
import { calculateKinetics } from './kinetics';
import type { KineticMetrics } from '../types/kinetics';
import type { LunarPhaseModifier } from '../types/lunar';

// Define missing types
export type FoodAssociationsLunarPhase =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export type AlchemyLunarPhase =
  | 'new moon'
  | 'waxing crescent'
  | 'first quarter'
  | 'waxing gibbous'
  | 'full moon'
  | 'waning gibbous'
  | 'last quarter'
  | 'waning crescent';

// Element modifiers for baseline lunar influence
const ELEMENTAL_BASE_MODIFIERS: Record<keyof ElementalProperties, number> = {
  Fire: 0.2,
  Water: 0.3,
  Earth: 0.15,
  Air: 0.25,
};

// Simple influence map (underscored keys)
const SIMPLE_LUNAR_INFLUENCES: Record<
  LunarPhaseWithUnderscores,
  { strength: number; elements: Record<keyof ElementalProperties, number> }
> = {
  new_moon: { strength: 0.3, elements: { Fire: 0.1, Water: 0.1, Air: 0.1, Earth: 0.1 } },
  waxing_crescent: { strength: 0.2, elements: { Fire: 0.2, Air: 0.1, Water: 0.05, Earth: 0.05 } },
  first_quarter: { strength: 0.3, elements: { Fire: 0.3, Air: 0.2, Water: 0.05, Earth: 0.05 } },
  waxing_gibbous: { strength: 0.4, elements: { Fire: 0.4, Air: 0.3, Water: 0.05, Earth: 0.05 } },
  full_moon: { strength: 0.5, elements: { Water: 0.4, Earth: 0.3, Fire: 0.1, Air: 0.1 } },
  waning_gibbous: { strength: 0.4, elements: { Water: 0.3, Earth: 0.2, Fire: 0.1, Air: 0.1 } },
  last_quarter: { strength: 0.3, elements: { Water: 0.2, Earth: 0.1, Fire: 0.1, Air: 0.1 } },
  waning_crescent: { strength: 0.2, elements: { Water: 0.1, Earth: 0.1, Fire: 0.05, Air: 0.05 } },
};

/**
 * Apply lunar influence to elemental balance
 */
export function applyLunarInfluence(baseBalance: ElementalState, date: Date): ElementalState {
  const phase = getLunarPhaseFromDate(date);
  const phaseKey = getLunarPhaseKey(phase);
  const influence = SIMPLE_LUNAR_INFLUENCES[phaseKey];
  if (!influence) return baseBalance;
  return {
    Fire: baseBalance.Fire * (1 + influence.strength * ELEMENTAL_BASE_MODIFIERS.Fire),
    Water: baseBalance.Water * (1 + influence.strength * ELEMENTAL_BASE_MODIFIERS.Water),
    Air: baseBalance.Air * (1 + influence.strength * ELEMENTAL_BASE_MODIFIERS.Air),
    Earth: baseBalance.Earth * (1 + influence.strength * ELEMENTAL_BASE_MODIFIERS.Earth),
  };
}

/**
 * Get elemental modifiers for a specific lunar phase
 */
export function getLunarElementalModifiers(phase: LunarPhase): Record<string, number> {
  const phaseKey = getLunarPhaseKey(phase);
  return SIMPLE_LUNAR_INFLUENCES[phaseKey].elements || { Fire: 0, Water: 0, Air: 0, Earth: 0 };
}

/**
 * Get lunar phase from a date (simple approx)
 */
export function getLunarPhaseFromDate(date: Date): LunarPhase {
  const day = date.getDate();
  if (day <= 3 || day >= 27) return 'new moon';
  if (day <= 7) return 'waxing crescent';
  if (day <= 10) return 'first quarter';
  if (day <= 14) return 'waxing gibbous';
  if (day <= 17) return 'full moon';
  if (day <= 21) return 'waning gibbous';
  if (day <= 24) return 'last quarter';
  return 'waning crescent';
}

/**
 * Generates default lunar phase modifiers based on an ingredient's elemental properties
 */
export function generateDefaultLunarPhaseModifiers(
  elementalProps: ElementalProperties,
  ingredientName: string,
  category: string
): Record<string, LunarPhaseModifier> {
  const sorted = (Object.entries(elementalProps) as Array<[keyof ElementalProperties, number]>).sort(
    (a, b) => b[1] - a[1]
  );
  const dominantElement = sorted[0]?.[0] || 'Fire';
  const secondaryElement = sorted[1]?.[0] || 'Air';

  const lunarModifiers: Record<string, LunarPhaseModifier> = {
    newMoon: {
      elementalModifiers: { Fire: 0.1, Water: 0.4, Earth: 0.2, Air: 0.3 },
      elementalBoost: { [dominantElement]: 0.1, [secondaryElement]: 0.05 },
      description: `New Moon effects on ${ingredientName}`,
      keywords: ['subtle', 'preparation', 'beginnings'],
      preparationTips: [`Good for subtle ${category} preparations`],
    },
    fullMoon: {
      elementalModifiers: { Fire: 0.4, Water: 0.1, Earth: 0.1, Air: 0.4 },
      elementalBoost: { [dominantElement]: 0.2 },
      description: `Full Moon enhances ${ingredientName} properties`,
      keywords: ['potent', 'powerful', 'culmination'],
      preparationTips: [`${ingredientName} properties are enhanced`, `Best time for ${category} highlights`],
    },
  };

  return lunarModifiers;
}

// Type containing both formats for better type safety
export type LunarPhaseKey =
  | 'new_moon'
  | 'full_moon'
  | 'first_quarter'
  | 'last_quarter'
  | 'waxing_crescent'
  | 'waning_crescent'
  | 'waxing_gibbous'
  | 'waning_gibbous';

// Export the LUNAR_PHASES constant needed by RecommendationAdapter.ts
export const LUNAR_PHASES = {
  'new moon': 'New Moon',
  'waxing crescent': 'Waxing Crescent',
  'first quarter': 'First Quarter',
  'waxing gibbous': 'Waxing Gibbous',
  'full moon': 'Full Moon',
  'waning gibbous': 'Waning Gibbous',
  'last quarter': 'Last Quarter',
  'waning crescent': 'Waning Crescent',
} as const;

// Mapping from space format to underscore format
export const LUNAR_PHASE_MAP: Record<LunarPhase, LunarPhaseKey> = {
  'new moon': 'new_moon',
  'full moon': 'full_moon',
  'first quarter': 'first_quarter',
  'last quarter': 'last_quarter',
  'waxing crescent': 'waxing_crescent',
  'waning crescent': 'waning_crescent',
  'waxing gibbous': 'waxing_gibbous',
  'waning gibbous': 'waning_gibbous',
};

export const REVERSE_LUNAR_PHASE_MAP: Record<LunarPhaseKey, LunarPhase> = {
  new_moon: 'new moon',
  full_moon: 'full moon',
  first_quarter: 'first quarter',
  last_quarter: 'last quarter',
  waxing_crescent: 'waxing crescent',
  waning_crescent: 'waning crescent',
  waxing_gibbous: 'waxing gibbous',
  waning_gibbous: 'waning gibbous',
};

export const _FOOD_TO_ALCHEMY_LUNAR_PHASE_MAP: Record<FoodAssociationsLunarPhase, AlchemyLunarPhase> = {
  'New Moon': 'new moon',
  'Waxing Crescent': 'waxing crescent',
  'First Quarter': 'first quarter',
  'Waxing Gibbous': 'waxing gibbous',
  'Full Moon': 'full moon',
  'Waning Gibbous': 'waning gibbous',
  'Last Quarter': 'last quarter',
  'Waning Crescent': 'waning crescent',
};

/**
 * Normalizes a lunar phase to the underscore format for use in object lookups
 */
export const getLunarPhaseKey = (phase: string): LunarPhaseKey => {
  if (!phase) return 'new_moon';
  if (phase.includes('_')) {
    return (Object.keys(REVERSE_LUNAR_PHASE_MAP) as LunarPhaseKey[]).includes(phase as LunarPhaseKey)
      ? (phase as LunarPhaseKey)
      : 'new_moon';
  }
  return LUNAR_PHASE_MAP[(phase as LunarPhase) || 'new moon'] || (phase.replace(/\s+/g, '_') as LunarPhaseKey);
};

/**
 * Converts a lunar phase to the space format for display
 */
export const formatLunarPhase = (phase: string): LunarPhase => {
  if (!phase) return 'new moon';
  if (!phase.includes('_')) {
    return (Object.keys(LUNAR_PHASE_MAP) as LunarPhase[]).includes(phase as LunarPhase)
      ? (phase as LunarPhase)
      : 'new moon';
  }
  return REVERSE_LUNAR_PHASE_MAP[(phase as LunarPhaseKey) || 'new_moon'] || (phase.replace(/_/g, ' ') as LunarPhase);
};

/**
 * Format lunar phase for display (title case)
 */
export function formatLunarPhaseForDisplay(phase: string): string {
  const formattedPhase = formatLunarPhase(phase);
  return formattedPhase
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts a lunar phase string to title case format (safe)
 */
export function toTitleCaseLunarPhase(phase: string | null | undefined): string | undefined {
  if (!phase) return undefined;
  const normalizedPhase = normalizeLunarPhase(phase);
  if (!normalizedPhase) return undefined;
  return normalizedPhase
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Elemental influences for each lunar phase (spaces format)
export const LUNAR_PHASE_ELEMENTS: Record<LunarPhaseWithUnderscores, ElementalProperties> = {
  new_moon: { Fire: 0.1, Water: 0.4, Earth: 0.2, Air: 0.3 },
  waxing_crescent: { Fire: 0.2, Water: 0.3, Earth: 0.2, Air: 0.3 },
  first_quarter: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
  waxing_gibbous: { Fire: 0.4, Water: 0.2, Earth: 0.1, Air: 0.3 },
  full_moon: { Fire: 0.4, Water: 0.1, Earth: 0.1, Air: 0.4 },
  waning_gibbous: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
  last_quarter: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
  waning_crescent: { Fire: 0.1, Water: 0.4, Earth: 0.3, Air: 0.2 },
};

/**
 * Converts a lunar phase with spaces to one with underscores
 */
export function convertToUnderscoreFormat(phase: LunarPhaseWithSpaces): LunarPhaseWithUnderscores {
  return LUNAR_PHASE_MAPPING[phase];
}

/**
 * Converts a lunar phase with underscores to one with spaces
 */
export function convertToSpacesFormat(phase: LunarPhaseWithUnderscores): LunarPhaseWithSpaces {
  return LUNAR_PHASE_REVERSE_MAPPING[phase];
}

/**
 * Gets the elemental properties for a given lunar phase
 */
export function getLunarPhaseElements(phase: LunarPhase): ElementalProperties {
  const key: LunarPhaseWithUnderscores = phase.includes(' ')
    ? LUNAR_PHASE_MAPPING[phase as LunarPhaseWithSpaces]
    : (phase as unknown as LunarPhaseWithUnderscores);
  return LUNAR_PHASE_ELEMENTS[key];
}

/**
 * Safely normalizes any lunar phase string to a valid LunarPhase type
 */
export function normalizeLunarPhase(phase: string | null | undefined): LunarPhase | undefined {
  if (!phase) return undefined;
  const cleanPhase = phase.toLowerCase().trim();
  if ((Object.keys(LUNAR_PHASE_MAP) as LunarPhase[]).includes(cleanPhase as LunarPhase)) {
    return cleanPhase as LunarPhase;
  }
  const spacesFormat = REVERSE_LUNAR_PHASE_MAP[cleanPhase as LunarPhaseKey];
  if (spacesFormat) return spacesFormat;
  const phases = Object.keys(LUNAR_PHASE_MAP) as LunarPhase[];
  const match = phases.find(
    p => p.includes(cleanPhase) || cleanPhase.includes(p.replace(' ', '')) || cleanPhase.includes(p.replace(' ', '_'))
  );
  return match ;
}

// convertToLunarPhase function
export function convertToLunarPhase(input: string | Date | number): LunarPhase {
  if (typeof input === 'string') return normalizeLunarPhase(input) || 'new moon';
  if (input instanceof Date) return getLunarPhaseFromDate(input);
  if (typeof input === 'number') {
    const d = input % 29.5;
    if (d < 2) return 'new moon';
    if (d < 7) return 'waxing crescent';
    if (d < 9) return 'first quarter';
    if (d < 14) return 'waxing gibbous';
    if (d < 16) return 'full moon';
    if (d < 21) return 'waning gibbous';
    if (d < 23) return 'last quarter';
    if (d < 28) return 'waning crescent';
    return 'new moon';
  }
  return 'new moon';
}

/**
 * Get lunar phase with kinetics enhancement (aspect phase boosts)
 */
export function getLunarPhaseWithKinetics(
  phase: LunarPhase,
  planetaryPositions: { [planet: string]: string }
): LunarPhase {
  try {
    const kinetics = calculateKinetics(planetaryPositions);
    if (kinetics.forceClassification === 'accelerating' && phase.includes('waxing')) {
      return applyVelocityBoost(phase, kinetics.velocityBoost || 0);
    } else if (kinetics.forceClassification === 'decelerating' && phase.includes('waning')) {
      return applyVelocityBoost(phase, kinetics.velocityBoost || 0);
    }
    return phase;
  } catch (_error) {
    return phase;
  }
}

/**
 * Apply velocity boost to lunar phase intensity (placeholder)
 */
function applyVelocityBoost(phase: LunarPhase, _velocityBoost: number): LunarPhase {
  return phase;
}

/**
 * Get kinetics-enhanced elemental modifiers for lunar phases
 */
export function getKineticsEnhancedLunarModifiers(
  phase: LunarPhase,
  planetaryPositions: { [planet: string]: string }
): Record<string, number> {
  try {
    const baseModifiers = getLunarElementalModifiers(phase);
    const kinetics = calculateKinetics(planetaryPositions);
    const enhanced: Record<string, number> = { ...baseModifiers };

    if (kinetics.thermalDirection === 'heating') {
      enhanced.Fire = (enhanced.Fire || 0) + 0.1;
      enhanced.Air = (enhanced.Air || 0) + 0.05;
    } else if (kinetics.thermalDirection === 'cooling') {
      enhanced.Water = (enhanced.Water || 0) + 0.1;
      enhanced.Earth = (enhanced.Earth || 0) + 0.05;
    }

    const dominant = getDominantElementFromModifiers(enhanced);
    const aspectBoost = kinetics.aspectPhase === 'conjunction' ? 0.15 : kinetics.aspectPhase === 'opposition' ? 0.1 : 0.05;
    if (dominant) enhanced[dominant] = (enhanced[dominant] || 0) + aspectBoost * ((kinetics.forceMagnitude || 0) / 5);

    return enhanced;
  } catch (_error) {
    return getLunarElementalModifiers(phase);
  }
}

/**
 * Get dominant element from modifiers
 */
function getDominantElementFromModifiers(modifiers: Record<string, number>): string | null {
  let max = -Infinity;
  let which: string | null = null;
  for (const [k, v] of Object.entries(modifiers)) {
    if (v > max) {
      max = v;
      which = k;
    }
  }
  return which;
}

/**
 * Calculate lunar phase kinetics metrics
 */
export function calculateLunarKineticsMetrics(
  phase: LunarPhase,
  planetaryPositions: { [planet: string]: string }
): { phaseVelocity: number; aspectInfluence: number; powerEfficiency: number; thermalAlignment: number } {
  try {
    const kinetics = calculateKinetics(planetaryPositions);
    const phaseVelocity = calculatePhaseVelocity(phase, kinetics);
    const aspectInfluence = kinetics.aspectPhase === 'conjunction' ? 1.0 : kinetics.aspectPhase === 'opposition' ? 0.8 : kinetics.aspectPhase === 'trine' ? 0.6 : kinetics.aspectPhase === 'square' ? 0.4 : 0.2;
    const powerEfficiency = (kinetics.power || 0) / 100;
    const thermalAlignment = calculateThermalAlignment(phase, String(kinetics.thermalDirection || 'neutral'));
    return { phaseVelocity, aspectInfluence, powerEfficiency, thermalAlignment };
  } catch (_error) {
    return { phaseVelocity: 0.5, aspectInfluence: 0.5, powerEfficiency: 0.5, thermalAlignment: 0.5 };
  }
}

/**
 * Calculate phase velocity for lunar phase
 */
function calculatePhaseVelocity(phase: LunarPhase, kinetics: KineticMetrics): number {
  let baseVelocity = 0.5;
  if (phase.includes('waxing')) {
    baseVelocity = 0.7 + (kinetics.velocityBoost || 0) * 0.3;
  } else if (phase.includes('waning')) {
    baseVelocity = 0.3 - (kinetics.velocityBoost || 0) * 0.2;
  } else if (phase === 'full moon') {
    baseVelocity = 1.0;
  } else if (phase === 'new moon') {
    baseVelocity = 0.1;
  }
  return Math.max(0, Math.min(1, baseVelocity));
}

/**
 * Calculate thermal alignment between lunar phase and kinetics
 */
function calculateThermalAlignment(phase: LunarPhase, thermalDirection: string): number {
  const firePhases = ['waxing crescent', 'first quarter', 'waxing gibbous'];
  const waterPhases = ['waning gibbous', 'last quarter', 'waning crescent'];
  if (thermalDirection === 'heating' && firePhases.includes(phase)) return 0.9;
  if (thermalDirection === 'cooling' && waterPhases.includes(phase)) return 0.9;
  if (thermalDirection === 'neutral') return 0.7;
  return 0.5;
}
