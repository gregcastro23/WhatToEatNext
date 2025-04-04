import { LunarPhase as AlchemyLunarPhase, LunarPhaseWithSpaces } from '@/types/alchemy';
import { LunarPhase as FoodAssociationsLunarPhase } from '@/constants/planetaryFoodAssociations';

// Standardized lunar phase constants in lowercase format (from alchemy.ts)
export const LUNAR_PHASES = {
  NEW_MOON: 'new moon' as AlchemyLunarPhase,
  WAXING_CRESCENT: 'waxing crescent' as AlchemyLunarPhase,
  FIRST_QUARTER: 'first quarter' as AlchemyLunarPhase,
  WAXING_GIBBOUS: 'waxing gibbous' as AlchemyLunarPhase,
  FULL_MOON: 'full moon' as AlchemyLunarPhase,
  WANING_GIBBOUS: 'waning gibbous' as AlchemyLunarPhase,
  LAST_QUARTER: 'last quarter' as AlchemyLunarPhase,
  WANING_CRESCENT: 'waning crescent' as AlchemyLunarPhase
} as const;

// Mapping from lowercase to title case
export const LUNAR_PHASE_MAP: Record<LunarPhaseWithSpaces, string> = {
  'new moon': 'New Moon',
  'waxing crescent': 'Waxing Crescent',
  'first quarter': 'First Quarter',
  'waxing gibbous': 'Waxing Gibbous',
  'full moon': 'Full Moon',
  'waning gibbous': 'Waning Gibbous',
  'last quarter': 'Last Quarter',
  'waning crescent': 'Waning Crescent'
};

// Mapping from title case to lowercase
export const REVERSE_LUNAR_PHASE_MAP: Record<string, AlchemyLunarPhase> = {
  'New Moon': 'new moon',
  'Waxing Crescent': 'waxing crescent',
  'First Quarter': 'first quarter',
  'Waxing Gibbous': 'waxing gibbous',
  'Full Moon': 'full moon',
  'Waning Gibbous': 'waning gibbous',
  'Last Quarter': 'last quarter',
  'Waning Crescent': 'waning crescent'
};

// Mapping from snake case to lowercase
export const SNAKE_CASE_TO_LOWERCASE: Record<string, AlchemyLunarPhase> = {
  'new_moon': 'new moon',
  'waxing_crescent': 'waxing crescent',
  'first_quarter': 'first quarter',
  'waxing_gibbous': 'waxing gibbous',
  'full_moon': 'full moon',
  'waning_gibbous': 'waning gibbous',
  'last_quarter': 'last quarter',
  'waning_crescent': 'waning crescent'
};

// Type guard to validate lunar phases
export function isValidLunarPhase(phase: string): phase is AlchemyLunarPhase {
  return Object.values(LUNAR_PHASES).includes(phase as AlchemyLunarPhase);
}

// Convert any lunar phase format to the standardized lowercase format
export function normalizeLunarPhase(phase: string | null | undefined): AlchemyLunarPhase | undefined {
  if (!phase) return undefined;
  
  // Check if it's a direct match with one of our formats
  if (isValidLunarPhase(phase)) {
    return phase;
  }
  
  // Check if it's a title case match
  if (phase in REVERSE_LUNAR_PHASE_MAP) {
    return REVERSE_LUNAR_PHASE_MAP[phase as FoodAssociationsLunarPhase];
  }
  
  // Check if it's a snake case match
  if (phase in SNAKE_CASE_TO_LOWERCASE) {
    return SNAKE_CASE_TO_LOWERCASE[phase];
  }
  
  // If no direct match, try to infer from the text
  const lowercasePhase = phase.toLowerCase();
  
  if (lowercasePhase.includes('new')) return LUNAR_PHASES.NEW_MOON;
  if (lowercasePhase.includes('full')) return LUNAR_PHASES.FULL_MOON;
  if (lowercasePhase.includes('first quarter')) return LUNAR_PHASES.FIRST_QUARTER;
  if (lowercasePhase.includes('last quarter')) return LUNAR_PHASES.LAST_QUARTER;
  if (lowercasePhase.includes('waxing') && lowercasePhase.includes('crescent')) return LUNAR_PHASES.WAXING_CRESCENT;
  if (lowercasePhase.includes('waxing') && lowercasePhase.includes('gibbous')) return LUNAR_PHASES.WAXING_GIBBOUS;
  if (lowercasePhase.includes('waning') && lowercasePhase.includes('gibbous')) return LUNAR_PHASES.WANING_GIBBOUS;
  if (lowercasePhase.includes('waning') && lowercasePhase.includes('crescent')) return LUNAR_PHASES.WANING_CRESCENT;
  
  return undefined;
}

// Convert from lowercase to title case format
export function toTitleCaseLunarPhase(phase: AlchemyLunarPhase | null | undefined): LunarPhaseWithSpaces | undefined {
  if (!phase) return undefined;
  return phase as LunarPhaseWithSpaces; // Since they're the same type underneath
}

// Format for display (title case)
export function formatLunarPhaseForDisplay(phase: AlchemyLunarPhase | null | undefined): string {
  if (!phase) return '';
  return phase.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Fix the map by explicitly typing it
export const FOOD_TO_TITLE_CASE_MAP: Record<LunarPhaseWithSpaces, string> = {
  'new moon': 'New Moon',
  'waxing crescent': 'Waxing Crescent',
  'first quarter': 'First Quarter',
  'waxing gibbous': 'Waxing Gibbous',
  'full moon': 'Full Moon',
  'waning gibbous': 'Waning Gibbous',
  'last quarter': 'Last Quarter',
  'waning crescent': 'Waning Crescent'
};

// Fix the reverse map
export const TITLE_CASE_TO_LUNAR_PHASE: Record<string, LunarPhaseWithSpaces> = {
  'New Moon': 'new moon',
  'Waxing Crescent': 'waxing crescent',
  'First Quarter': 'first quarter',
  'Waxing Gibbous': 'waxing gibbous',
  'Full Moon': 'full moon',
  'Waning Gibbous': 'waning gibbous',
  'Last Quarter': 'last quarter',
  'Waning Crescent': 'waning crescent'
}; 