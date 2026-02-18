import { NextResponse } from "next/server";
import {
  calculatePlanetaryPositions,
  getFallbackPlanetaryPositions,
} from "@/utils/serverPlanetaryCalculations";
import { calculateComprehensiveAspects } from "@/utils/aspectCalculator";
import { AVERAGE_DAILY_MOTION } from "@/utils/planetaryTransitions";
import { createLogger } from "@/utils/logger";

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

export type AspectEntry = {
  planet1: string;
  planet2: string;
  type: string;
  aspectAngle: number;
  orbDegrees: number;
  strength: number;           // 0–1 (1 = exact)
  applying: boolean;          // true = approaching exact, false = moving away
  daysToExact: number;        // days until (applying) or since (separating) exact
  influence: "harmonious" | "challenging" | "neutral";
};

export async function GET() {
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
      longitudes[name] = toLongitude(pos as any);
    }

    // Calculate all aspects using the existing utility
    const rawAspects = calculateComprehensiveAspects(
      Object.fromEntries(
        Object.entries(positions).map(([name, pos]) => [
          name,
          {
            sign: (pos as any).sign,
            degree: (pos as any).degree ?? 0,
            exactLongitude: longitudes[name],
            isRetrograde: (pos as any).isRetrograde ?? false,
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

    for (const aspect of rawAspects) {
      if (!MAJOR_ASPECTS.has(aspect.type)) continue;

      const aspectAngle = ASPECT_ANGLES[aspect.type];
      const maxOrb = MAX_ORBS[aspect.type] ?? 8;

      const L1 = longitudes[aspect.planet1];
      const L2 = longitudes[aspect.planet2];
      if (L1 === undefined || L2 === undefined) continue;

      // Effective daily motion (negative when retrograde)
      const m1 = (AVERAGE_DAILY_MOTION[aspect.planet1] ?? 0.5) *
        ((positions[aspect.planet1] as any)?.isRetrograde ? -1 : 1);
      const m2 = (AVERAGE_DAILY_MOTION[aspect.planet2] ?? 0.5) *
        ((positions[aspect.planet2] as any)?.isRetrograde ? -1 : 1);

      // Current orb
      const currentOrb = computeOrb(L1, L2, aspectAngle);

      // Orb after 1 day
      const L1next = (L1 + m1 + 360) % 360;
      const L2next = (L2 + m2 + 360) % 360;
      const nextOrb = computeOrb(L1next, L2next, aspectAngle);

      const applying = nextOrb < currentOrb;

      // Rate of orb change per day
      const orbChangePerDay = Math.abs(currentOrb - nextOrb);
      // Guard against standing still (very slow or same speed planets)
      const daysToExact = orbChangePerDay > 1e-6
        ? currentOrb / orbChangePerDay
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
