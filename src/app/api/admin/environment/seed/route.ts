/**
 * Admin Environmental Seed API
 *
 * POST /api/admin/environment/seed — seed one or more locations' 30-day
 *   climatic baseline from the ERA5 archive, right now.
 * GET  /api/admin/environment/seed — fleet-wide ingestion health.
 *
 * @requires Authentication - Admin role required
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * The hourly cron only samples geohashes that ALREADY have a baseline row, and
 * nothing creates that first row until the public advisory API lands. Without a
 * manual trigger the ingestion layer would sit idle for the rest of the
 * sequence, and the baseline clock is a wall-clock dependency — every day not
 * ingesting is a day added to the critical path.
 *
 * Seeding is idempotent: a geohash that already holds archive rows is returned
 * as-is rather than re-fetched, so this is safe to re-run.
 *
 * Coordinates arrive in the POST body, never the query string, and are coarsened
 * to a ~5 km geohash on the way in. No precise location reaches a URL or an
 * access log.
 *
 * @file src/app/api/admin/environment/seed/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { ENVIRONMENT_GEOHASH_PRECISION, encodeGeohash } from "@/lib/environment/geohash";
import { _logger } from "@/lib/logger";
import { seedFromArchive, summarizeIngestion } from "@/services/environmentalIngestService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Each location is an outbound archive fetch plus ~30 writes, against a 60 s
 * budget. Callers seed in batches rather than one giant request.
 */
const MAX_LOCATIONS_PER_REQUEST = 5;

interface SeedLocation {
  latitude: number;
  longitude: number;
  label?: string;
}

function parseLocations(body: unknown): SeedLocation[] | string {
  if (typeof body !== "object" || body === null) return "body must be a JSON object";

  const raw = (body as { locations?: unknown }).locations;
  if (!Array.isArray(raw)) {
    return "body.locations must be an array of { latitude, longitude }";
  }
  if (raw.length === 0) return "body.locations is empty";
  if (raw.length > MAX_LOCATIONS_PER_REQUEST) {
    return `at most ${MAX_LOCATIONS_PER_REQUEST} locations per request`;
  }

  const parsed: SeedLocation[] = [];
  for (const [index, entry] of raw.entries()) {
    if (typeof entry !== "object" || entry === null) {
      return `locations[${index}] must be an object`;
    }
    const { latitude, longitude, label } = entry as Record<string, unknown>;
    if (typeof latitude !== "number" || !Number.isFinite(latitude)) {
      return `locations[${index}].latitude must be a finite number`;
    }
    if (typeof longitude !== "number" || !Number.isFinite(longitude)) {
      return `locations[${index}].longitude must be a finite number`;
    }
    parsed.push({
      latitude,
      longitude,
      label: typeof label === "string" ? label : undefined,
    });
  }
  return parsed;
}

export async function POST(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "invalid JSON body" }, { status: 400 });
  }

  const parsed = parseLocations(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ success: false, message: parsed }, { status: 400 });
  }

  const seeded: Array<Record<string, unknown>> = [];
  const failed: Array<{ geohash5: string; label?: string; error: string }> = [];

  for (const location of parsed) {
    // Coarsen before anything is logged or persisted.
    let geohash5: string;
    try {
      geohash5 = encodeGeohash(
        location.latitude,
        location.longitude,
        ENVIRONMENT_GEOHASH_PRECISION,
      );
    } catch (error) {
      failed.push({
        geohash5: "(invalid)",
        label: location.label,
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    try {
      const baseline = await seedFromArchive(location.latitude, location.longitude);
      if (!baseline) {
        // The archive returned nothing usable. Reported as a failure rather
        // than a zeroed baseline — a fabricated median would poison every
        // anomaly this location ever reports.
        failed.push({
          geohash5,
          label: location.label,
          error: "archive returned no usable observations; no baseline written",
        });
        continue;
      }
      seeded.push({
        geohash5,
        label: location.label,
        elevation_m: baseline.elevationM,
        sample_days: baseline.sampleDays,
        pressure_median_kpa: baseline.pressureMedianKpa,
        pressure_mad_sigma_kpa: baseline.pressureMadSigmaKpa,
        dew_point_median_c: baseline.dewPointMedianC,
        dew_point_mad_sigma_c: baseline.dewPointMadSigmaC,
        archive_seeded: baseline.archiveSeeded,
      });
    } catch (error) {
      // Surfaced, not swallowed. A wrong-field ingestion throws at the client
      // boundary and that message is exactly what an operator needs to read.
      failed.push({
        geohash5,
        label: location.label,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  void _logger.info("Admin environmental seed", {
    requested: parsed.length,
    seeded: seeded.length,
    failed: failed.length,
  });

  return NextResponse.json({
    success: failed.length === 0,
    requested: parsed.length,
    seeded,
    failed,
  });
}

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  try {
    const summary = await summarizeIngestion();
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error("[admin/environment/seed] summary failed:", error);
    return NextResponse.json(
      { success: false, live: false, message: "Failed to read ingestion state" },
      { status: 500 },
    );
  }
}
