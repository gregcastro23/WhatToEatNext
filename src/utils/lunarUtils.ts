// Utility functions for lunar phase conversion
import { LunarPhase, LunarPhaseWithSpaces } from '../types/alchemy';

// Map each LunarPhaseWithSpaces value to its corresponding LunarPhase value
// This is a more explicit approach for TypeScript to understand the conversion
export function convertToLunarPhase(
  phase: LunarPhaseWithSpaces | null | undefined,
): LunarPhase | undefined {
  if (!phase) return undefined;

  // LunarPhase and LunarPhaseWithSpaces have exactly the same string values
  // but TypeScript doesn't automatically recognize this compatibility
  switch (phase) {
    case 'new moon':
      return 'new moon' as LunarPhase;
    case 'waxing crescent':
      return 'waxing crescent' as LunarPhase;
    case 'first quarter':
      return 'first quarter' as LunarPhase;
    case 'waxing gibbous':
      return 'waxing gibbous' as LunarPhase;
    case 'full moon':
      return 'full moon' as LunarPhase;
    case 'waning gibbous':
      return 'waning gibbous' as LunarPhase;
    case 'last quarter':
      return 'last quarter' as LunarPhase;
    case 'waning crescent':
      return 'waning crescent' as LunarPhase;
    default:
      return undefined
  }
}
