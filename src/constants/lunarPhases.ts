export type LunarPhase =
  | 'NEW_MOON'
  | 'WAXING_CRESCENT'
  | 'FIRST_QUARTER'
  | 'WAXING_GIBBOUS'
  | 'FULL_MOON'
  | 'WANING_GIBBOUS'
  | 'LAST_QUARTER'
  | 'WANING_CRESCENT';

export const LUNAR_PHASES: Record<LunarPhase, string> = {
  'NEW_MOON': 'New Moon',
  'WAXING_CRESCENT': 'Waxing Crescent',
  'FIRST_QUARTER': 'First Quarter',
  'WAXING_GIBBOUS': 'Waxing Gibbous',
  'FULL_MOON': 'Full Moon',
  'WANING_GIBBOUS': 'Waning Gibbous',
  'LAST_QUARTER': 'Last Quarter',
  'WANING_CRESCENT': 'Waning Crescent'
};

// Standard lunar cycle is approximately 29.53 days
export const LUNAR_CYCLE_DAYS = 29.53;

export function getLunarPhaseDisplay(phase: LunarPhase): string {
  return LUNAR_PHASES[phase] || 'Unknown';
} 