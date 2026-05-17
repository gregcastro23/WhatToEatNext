import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { calculateComprehensiveAspects } from "@/utils/aspectCalculator";
import { createLogger } from "@/utils/logger";
import { AVERAGE_DAILY_MOTION } from "@/utils/planetaryTransitions";
import {
  calculatePlanetaryPositions,
  getFallbackPlanetaryPositions,
} from "@/utils/serverPlanetaryCalculations";
import type { PlanetPosition } from "@/utils/astrologyUtils";

const logger = createLogger("PlanetaryAspectsAPI");

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Only show the five major aspects for the Quantities page display
const MAJOR_ASPECTS = new Set(["conjunction", "opposition", "trine", "square", "sextile"]);

/** Ecliptic longitude from a position record */
function toLongitude(pos: { sign: string; degree: number; minute?: number; exactLongitude?: number }): number {
  if (pos.exactLongitude !== undefined) return pos.exactLongitude;
  const SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
  const idx = SIGNS.indexOf(String(pos.sign).toLowerCase());
  return Math.max(0, idx) * 30 + (pos.degree ?? 0) + (pos.minute ?? 0) / 60;
}

/**
 * Compute the minimal angular separation from the aspect's ideal angle.
 * Returns a value in [0, maxOrb].
 */
function computeOrb(long1: number, long2: number, aspectAngle: number): number {
  let diff = Math.abs(long1 - long2) % 360;
  if (diff > 180) diff = 360 - diff;
  return Math.abs(diff - aspectAngle);
}

export interface AspectEntry {
  planet1: string;
  planet2: string;
  type: string;
  aspectAngle: number;
  orbDegrees: number;
  strength: number;           // 0–1 (1 = exact)
  applying: boolean;          // true = approaching exact, false = moving away
  daysToExact: number;        // days until (applying) or since (separating) exact
  influence: "harmonious" | "challenging" | "neutral";
  // Vector kinematics ---------------------------------------------------
  /** Signed rate of change of orb in degrees/day (negative = applying). */
  orbVelocity: number;
  /** Relative angular velocity m1 - m2 in degrees/day (signed). */
  relativeAngularVelocity: number;
  /** Coupling state — Applying stores energy (capacitive), Separating discharges (inductive). */
  state: "applying" | "separating" | "stationary";
  /** Source of velocity data, for downstream confidence weighting. */
  velocitySource: "ephemeris" | "average-fallback";
}

const RATE_LIMIT = { window: 60_000, max: 30, bucket: "alchm-quantities-aspects" };

export async function GET(request: Request) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    logger.info("Aspects API called");

    // Get current planetary positions
    let positions: Record<string, any>;
    try {
      positions = await calculatePlanetaryPositions();
    } catch {
      positions = getFallbackPlanetaryPositions();
    }

    // Build lookup: planet → ecliptic longitude
    const longitudes: Record<string, number> = {};
    for (const [name, pos] of Object.entries(positions)) {
      longitudes[name] = toLongitude(pos);
    }

    // Calculate all aspects using the existing utility
    const rawAspects = calculateComprehensiveAspects(
      Object.fromEntries(
        Object.entries(positions).map(([name, pos]) => [
          name,
          {
            sign: (pos).sign,
            degree: (pos).degree ?? 0,
            exactLongitude: longitudes[name],
            isRetrograde: (pos).isRetrograde ?? false,
          },
        ]),
      ),
    );

    // Aspect angle lookup
    const ASPECT_ANGLES: Record<string, number> = {
      conjunction: 0,
      opposition: 180,
      trine: 120,
      square: 90,
      sextile: 60,
    };

    // Max orb per aspect type (degrees)
    const MAX_ORBS: Record<string, number> = {
      conjunction: 8,
      opposition: 8,
      trine: 8,
      square: 7,
      sextile: 6,
    };

    const result: AspectEntry[] = [];

    // Resolve a signed longitude velocity (deg/day) for a planet.
    // Prefers the ephemeris-provided `longitudeSpeed` (signed, retrograde-aware);
    // falls back to AVERAGE_DAILY_MOTION × retrograde sign for tertiary bodies
    // (Nodes/Asc/MC don't always carry a speed field).
    const velocityFor = (
      name: string,
    ): { speed: number; source: "ephemeris" | "average-fallback" } => {
      const pos = positions[name] as Partial<PlanetPosition> | undefined;
      const fromEphem = pos?.longitudeSpeed;
      if (typeof fromEphem === "number" && Number.isFinite(fromEphem)) {
        return { speed: fromEphem, source: "ephemeris" };
      }
      const base = AVERAGE_DAILY_MOTION[name] ?? 0.5;
      const sign = pos?.isRetrograde ? -1 : 1;
      return { speed: base * sign, source: "average-fallback" };
    };

    // dt for finite-difference orb velocity — small enough to be ~instantaneous
    // for the slowest planets, large enough to dodge floating-point noise.
    const DT_DAYS = 1 / 24; // 1 hour

    for (const aspect of rawAspects) {
      if (!MAJOR_ASPECTS.has(aspect.type)) continue;

      const aspectAngle = ASPECT_ANGLES[aspect.type];
      const maxOrb = MAX_ORBS[aspect.type] ?? 8;

      const L1 = longitudes[aspect.planet1];
      const L2 = longitudes[aspect.planet2];
      if (L1 === undefined || L2 === undefined) continue;

      const v1 = velocityFor(aspect.planet1);
      const v2 = velocityFor(aspect.planet2);
      const m1 = v1.speed;
      const m2 = v2.speed;
      const velocitySource: "ephemeris" | "average-fallback" =
        v1.source === "ephemeris" && v2.source === "ephemeris"
          ? "ephemeris"
          : "average-fallback";

      // Orb at t and t+dt → finite-difference velocity.
      const currentOrb = computeOrb(L1, L2, aspectAngle);
      const L1next = (L1 + m1 * DT_DAYS + 360) % 360;
      const L2next = (L2 + m2 * DT_DAYS + 360) % 360;
      const nextOrb = computeOrb(L1next, L2next, aspectAngle);

      // Signed orb velocity in deg/day. Negative ⇒ orb shrinking ⇒ applying.
      const orbVelocity = (nextOrb - currentOrb) / DT_DAYS;
      const STATIONARY_EPS = 1e-4; // deg/day
      const applying = orbVelocity < -STATIONARY_EPS;
      const state: "applying" | "separating" | "stationary" =
        Math.abs(orbVelocity) < STATIONARY_EPS
          ? "stationary"
          : applying
            ? "applying"
            : "separating";

      // Days to exact (signed by state semantics: positive = future, also positive for
      // separating to indicate days since exact, matching prior contract).
      const daysToExact = Math.abs(orbVelocity) > 1e-6
        ? currentOrb / Math.abs(orbVelocity)
        : 9999;

      const strength = Math.max(0, 1 - currentOrb / maxOrb);

      let influence: "harmonious" | "challenging" | "neutral";
      if (aspect.type === "trine" || aspect.type === "sextile" || aspect.type === "conjunction") {
        influence = "harmonious";
      } else if (aspect.type === "opposition" || aspect.type === "square") {
        influence = "challenging";
      } else {
        influence = "neutral";
      }

      result.push({
        planet1: aspect.planet1,
        planet2: aspect.planet2,
        type: aspect.type,
        aspectAngle,
        orbDegrees: parseFloat(currentOrb.toFixed(3)),
        strength: parseFloat(strength.toFixed(4)),
        applying,
        daysToExact: parseFloat(daysToExact.toFixed(2)),
        influence,
        orbVelocity: parseFloat(orbVelocity.toFixed(5)),
        relativeAngularVelocity: parseFloat((m1 - m2).toFixed(5)),
        state,
        velocitySource,
      });
    }

    // Sort: exact aspects first (smallest orb), then by strength desc
    result.sort((a, b) => a.orbDegrees - b.orbDegrees);

    logger.info(`Calculated ${result.length} major aspects`);

    return NextResponse.json(
      { aspects: result, timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("Aspects API error:", { error: msg });
    return NextResponse.json(
      { error: "Failed to calculate aspects", details: msg },
      { status: 500 },
    );
  }
}
