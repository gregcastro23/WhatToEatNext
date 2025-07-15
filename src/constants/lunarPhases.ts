import type { LunarPhase } from '../types/alchemy';

export const LUNAR_PHASES: Record<LunarPhase, string> = {
  'new moon': 'New Moon',
  'waxing crescent': 'Waxing Crescent',
  'first quarter': 'First Quarter',
  'waxing gibbous': 'Waxing Gibbous',
  'full moon': 'Full Moon',
  'waning gibbous': 'Waning Gibbous',
  'last quarter': 'Last Quarter',
  'waning crescent': 'Waning Crescent'
};

// Standard lunar cycle is approximately 29.53 days
export const LUNAR_CYCLE_DAYS = 29.53;

export function getLunarPhaseDisplay(phase: LunarPhase): string {
  return LUNAR_PHASES[phase] || 'Unknown';
} 