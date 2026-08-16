/**
 * Environmental Lookup API Route.
 *
 * GET /api/environment/lookup?lat=...&lng=...
 *
 * Resolves DEM elevation and climatic baseline for a given coordinate.
 * Follows the repository requirement:
 *   - PREFER the existing Postgres `environmental_baselines.elevation_m` for a
 *     known geohash over a fresh network call.
 *   - Only fall back to an external DEM / Open-Meteo fetch if the geohash has
 *     no baseline row yet.
 *
 * @file src/app/api/environment/lookup/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { encodeGeohash, ENVIRONMENT_GEOHASH_PRECISION } from "@/lib/environment/geohash";
import { fetchElevation } from "@/lib/environment/openMeteoClient";
import { getBaseline } from "@/services/environmentalIngestService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { success: false, message: "Missing lat or lng query parameter" },
        { status: 400 },
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return NextResponse.json(
        { success: false, message: "lat must be a number within -90..90" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, message: "lng must be a number within -180..180" },
        { status: 400 },
      );
    }

    const geohash5 = encodeGeohash(lat, lng, ENVIRONMENT_GEOHASH_PRECISION);

    // 1. Check existing Postgres baseline first (zero external network latency)
    const baseline = await getBaseline(geohash5);
    if (baseline) {
      return NextResponse.json({
        success: true,
        geohash5,
        elevationM: baseline.elevationM,
        elevationBasis: baseline.elevationBasis,
        pressureMedianKpa: baseline.pressureMedianKpa,
        dewPointMedianC: baseline.dewPointMedianC,
        sampleDays: baseline.sampleDays,
        fromBaseline: true,
      });
    }

    // 2. Fall back to DEM lookup
    const elevationM = await fetchElevation(lat, lng);
    return NextResponse.json({
      success: true,
      geohash5,
      elevationM,
      elevationBasis: "DERIVED",
      pressureMedianKpa: null,
      dewPointMedianC: null,
      sampleDays: 0,
      fromBaseline: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Environmental lookup failed",
      },
      { status: 500 },
    );
  }
}
