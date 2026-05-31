/**
 * Daily Ephemeris Cache — cron endpoint
 *
 * Populates `daily_ephemeris_cache` once per day so the transit-bonus slice of
 * the daily Cosmic Yield (DailyYieldService.getTodayEphemeris) has real data.
 * Without this the cache is empty in production and every user's transit bonus
 * silently resolves to zero — only the natal-weighted base flows.
 *
 * Fetches the live sky via calculatePlanetaryPositionsWithMeta (Swiss-ephemeris
 * backend first, astronomy-engine fallback), reduces it to a planet→sign map
 * keyed by the canonical PLANETARY_ALCHEMY planet names (so the key casing
 * matches what calculateAlchemicalFromPlanets expects), and hands it to
 * cacheEphemeris(), which computes + UPSERTs transit_esms. Idempotent:
 * re-running overwrites today's row (ON CONFLICT DO UPDATE).
 *
 * Schedule: daily at 00:05 UTC (before any first claim of the UTC day).
 * Auth: `Authorization: Bearer <CRON_SECRET>` (shared cron auth).
 *
 * @file src/app/api/cron/cache-ephemeris/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { dailyYieldService } from "@/services/DailyYieldService";
import { PLANETARY_ALCHEMY } from "@/utils/planetaryAlchemyMapping";
import { calculatePlanetaryPositionsWithMeta } from "@/utils/serverPlanetaryCalculations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { positions, degraded } = await calculatePlanetaryPositionsWithMeta();

    // Reduce to a planet→sign map keyed exactly as calculateAlchemicalFromPlanets
    // expects (canonical PLANETARY_ALCHEMY planet names). The downstream calc
    // normalizes sign casing, so the raw sign string is passed through.
    const lowerLookup = new Map(
      Object.entries(positions).map(([planet, pos]) => [planet.toLowerCase(), pos]),
    );
    const signMap: Record<string, string> = {};
    for (const canonicalPlanet of Object.keys(PLANETARY_ALCHEMY)) {
      const pos = lowerLookup.get(canonicalPlanet.toLowerCase());
      if (pos?.sign) signMap[canonicalPlanet] = String(pos.sign);
    }

    if (Object.keys(signMap).length === 0) {
      _logger.error(
        "[cron/cache-ephemeris] no positions resolved; skipping cache write",
      );
      return NextResponse.json(
        { success: false, message: "no positions resolved" },
        { status: 502 },
      );
    }

    const source = degraded ? "astronomy-engine" : "railway";
    await dailyYieldService.cacheEphemeris(signMap, source);

    return NextResponse.json({
      success: true,
      planets: Object.keys(signMap).length,
      source,
      degraded: degraded?.reasons ?? null,
    });
  } catch (err) {
    _logger.error("[cron/cache-ephemeris] failed:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
