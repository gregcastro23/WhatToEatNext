/**
 * Planetary Dignity Scale
 *
 * A planet's essential dignity in a sign, on the traditional +10/+7 point scale,
 * converted to a percentage multiplier for ESMS calculations.
 *
 * Domicile ranks above Exaltation here, following Ptolemy and Lilly. See
 * docs/physics/SYNTHESIS_MODEL.md §3.
 *
 * Import getPlanetaryDignityInfo from astrologyUtils for dignity type lookup.
 *
 * HISTORY: this module used to advertise a "dual-scale" system with a second
 * ±1/±2 `DIGNITY_FOOD_SCALE`, documented as being used "throughout the codebase"
 * for recipe scoring and ingredient compatibility, and marked DO NOT CHANGE. It
 * had zero readers anywhere — the apparent conflict between the two scales never
 * existed. Removed along with `getDignityForFoodScoring` and
 * `getDignityESMSMultiplier`, also callerless, in the §14d dead-definition pass.
 */

import type { DignityType } from "@/types/alchemy";
import { getPlanetaryDignityInfo } from "./astrologyUtils";

/**
 * Dignity score for a planet in a sign.
 */
export interface DignityScore {
  type: DignityType;
  esmsScale: number;  // +10, +7, 0, -7, -10
}

/**
 * ESMS-Scale Dignity Values (+10/+7 system)
 *
 * These point values amplify or diminish planetary ESMS contributions
 * via a percentage multiplier: 1 + (dignityScore / 100)
 *
 * Examples:
 *   Domicile (+10): multiplier = 1.10 (10% boost)
 *   Exaltation (+7): multiplier = 1.07 (7% boost)
 *   Detriment (-7): multiplier = 0.93 (7% reduction)
 *   Fall (-10): multiplier = 0.90 (10% reduction)
 */
export const DIGNITY_ESMS_SCALE: Record<DignityType, number> = {
  Domicile: 10,      // Planet rules this sign (maximum strength)
  Exaltation: 7,     // Planet exalted here (high strength)
  Neutral: 0,        // No special dignity
  Detriment: -7,     // Opposite of domicile (weakened)
  Fall: -10,         // Opposite of exaltation (minimum strength)
};

/**
 * Get the dignity score for a planet in a zodiac sign.
 *
 * @param planet - Planet name (e.g., "Sun", "Mercury")
 * @param sign - Zodiac sign name (e.g., "Leo", "Aries")
 */
export function getDignityScore(planet: string, sign: string): DignityScore {
  // Use existing getPlanetaryDignityInfo to determine dignity type
  const { type } = getPlanetaryDignityInfo(planet, sign);

  return {
    type,
    esmsScale: DIGNITY_ESMS_SCALE[type],
  };
}
