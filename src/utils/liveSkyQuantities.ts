/**
 * The live sky's quantities (ESMS), derived from loosely-typed planetary positions.
 *
 * Quantities come from which planets are overhead, plus sect, dignity and
 * aspects. They CANNOT be derived from the sky's elemental balance
 * (Fire/Water/Earth/Air) — that is a separate, orthogonal reading taken from the
 * signs those planets occupy. See the header of `./planetaryAlchemyMapping.ts`,
 * the authoritative source.
 *
 * This is the adapter for callers holding the loose `Record<string, unknown>`
 * position bags that AlchemicalContext hands out (client surfaces), rather than
 * a typed chart. Server surfaces should prefer RealAlchemizeService.alchemize.
 */

import type { AlchemicalProperties } from "@/types/celestial";
import {
  calculateComprehensiveAspects,
  type PlanetaryPositionData,
} from "./aspectCalculator";
import { calculateEnhancedAlchemicalFromPlanets } from "./planetaryAlchemyMapping";
import type { AspectWithStrength } from "./aspectESMSEffects";

/**
 * Derive the live sky's quantities from the planets overhead.
 *
 * Aspects are the engine's Layer 3 and the main source of moment-to-moment
 * variation — every moment holds the same ten planets, so sect and dignity alone
 * land almost every moment on the same profile. They are included here, matching
 * what RealAlchemizeService does for the live sky.
 *
 * @param positions - planet -> { sign, degree?, exactLongitude? }, any casing
 * @param isDaytime - true for a day sect; defaults to day when unknown
 * @returns the sky's ESMS, or null if no usable positions were supplied — in
 *   which case the caller must decide on a fallback, since a wrong-but-present
 *   value here would silently corrupt every downstream score.
 */
export function deriveLiveSkyQuantities(
  positions: Record<string, unknown> | undefined | null,
  isDaytime?: boolean,
): AlchemicalProperties | null {
  if (!positions || Object.keys(positions).length === 0) return null;

  const signMap: Record<string, string> = {};
  const aspectPositions: Record<string, PlanetaryPositionData> = {};

  for (const [planet, raw] of Object.entries(positions)) {
    const pos = raw as
      | { sign?: unknown; degree?: unknown; exactLongitude?: unknown }
      | null
      | undefined;
    if (!pos || typeof pos !== "object" || pos.sign == null) continue;

    // The engine matches signs in lowercase — the same convention useChartData
    // and /api/alchemize use.
    const sign = String(pos.sign).toLowerCase();
    signMap[planet] = sign;
    aspectPositions[planet] = {
      sign,
      degree: typeof pos.degree === "number" ? pos.degree : 0,
      exactLongitude:
        typeof pos.exactLongitude === "number" ? pos.exactLongitude : undefined,
    };
  }

  if (Object.keys(signMap).length === 0) return null;

  const aspects: AspectWithStrength[] = calculateComprehensiveAspects(
    aspectPositions,
  ).map((aspect) => ({
    planet1: aspect.planet1,
    planet2: aspect.planet2,
    type: aspect.type,
    strength: aspect.strength,
  }));

  return calculateEnhancedAlchemicalFromPlanets(signMap, isDaytime ?? true, aspects);
}
