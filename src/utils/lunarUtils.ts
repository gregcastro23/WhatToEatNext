// Utility functions for lunar phase conversion
import type { LunarPhase, LunarPhaseWithSpaces } from "../types/alchemy";

// Map each LunarPhaseWithSpaces value to its corresponding LunarPhase value
// This is a more explicit approach for TypeScript to understand the conversion
export function convertToLunarPhase(
  phase: LunarPhaseWithSpaces | null | undefined,
): LunarPhase | undefined {
  if (!phase) return undefined;
  // LunarPhase and LunarPhaseWithSpaces have exactly the same string values
  // but TypeScript doesn't automatically recognize this compatibility
  switch (phase) {
    case "new moon":
      return "new moon";
    case "waxing crescent":
      return "waxing crescent";
    case "first quarter":
      return "first quarter";
    case "waxing gibbous":
      return "waxing gibbous";
    case "full moon":
      return "full moon";
    case "waning gibbous":
      return "waning gibbous";
    case "last quarter":
      return "last quarter";
    case "waning crescent":
      return "waning crescent";
    default:
      return undefined;
  }
}
