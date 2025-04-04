import { LunarPhase } from '../types/astrology';

function getLunarPhaseModifier(phase: LunarPhase): number {
  const modifiers: Record<LunarPhase, number> = {
    'new_moon': 0.2,
    'waxing_crescent': 0.5,
    'first_quarter': 0.7,
    'waxing_gibbous': 0.9,
    'full_moon': 1.0,
    'waning_gibbous': 0.8,
    'third_quarter': 0.6,
    'waning_crescent': 0.3
  };
  
  return modifiers[phase] || 0.5; // default to 0.5 if phase is not recognized
} 