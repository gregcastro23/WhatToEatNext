/**
 * Environmental ingestion — cron endpoint.
 *
 * Runs hourly, but each geohash is sampled only once a day, at its own derived
 * UTC hour. That serves two purposes: sampling the same hour every day keeps the
 * semidiurnal atmospheric tide (~1–2 hPa) out of the window's dispersion instead
 * of inflating MAD and desensitizing every z-score, and deriving the hour from
 * the geohash spreads the fleet across the day rather than stampeding one minute.
 *
 * Each run: sample the geohashes due this hour, recompute their robust
 * baselines, then sweep expired raw observations.
 *
 * Idempotent. A geohash already sampled today is skipped by the due-query, so a
 * retried or double-fired cron does not double-write.
 *
 * Schedule: hourly at :10.
 * Auth: `Authorization: Bearer <CRON_SECRET>` (shared cron auth).
 *
 * @file src/app/api/cron/environmental-ingest/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedCron } from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import {
  getGeohashesDueForSampling,
  pruneOldObservations,
  sampleGeohash,
} from "@/services/environmentalIngestService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Ceiling on geohashes touched per invocation. Each one is an outbound HTTP call
 * plus a handful of writes, and the function has a 60 s budget.
 *
 * NOTE: anything not reached this hour waits a FULL DAY, not an hour. The
 * due-query matches on exact hour equality, so each hour offers a disjoint set
 * of geohashes and `ORDER BY last_computed_at` cannot carry an overflow across
 * buckets. With an even hash spread this ceiling starts dropping cells at
 * roughly 24 × 40 = 960 baselines fleet-wide; raise it, or shard the sweep,
 * before then. The previous comment here claimed "nothing starves", which was
 * false.
 */
const MAX_GEOHASHES_PER_RUN = 40;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const utcHour = new Date().getUTCHours();

  try {
    const due = await getGeohashesDueForSampling(utcHour, MAX_GEOHASHES_PER_RUN);

    let sampled = 0;
    let wroteNothing = 0;
    let rowsWritten = 0;
    const failures: Array<{ geohash5: string; error: string }> = [];

    for (const { geohash5, elevationM } of due) {
      try {
        const { written } = await sampleGeohash(geohash5, elevationM);
        sampled++;
        // Counted separately: a call that returns without throwing but writes
        // nothing is not a successful sample. Folding it into `sampled` made a
        // sweep that ingested no data report a healthy count — the same
        // indistinguishable-from-real failure this subsystem exists to avoid.
        if (written === 0) wroteNothing++;
        rowsWritten += written;
      } catch (error) {
        // One bad cell must not abort the sweep. Failures are counted and
        // reported rather than swallowed — a run that silently sampled nothing
        // would otherwise look identical to a run with nothing to do.
        failures.push({
          geohash5,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const pruned = await pruneOldObservations();

    void _logger.info("Environmental ingestion sweep complete", {
      utcHour,
      due: due.length,
      sampled,
      wroteNothing,
      rowsWritten,
      failed: failures.length,
      pruned,
    });

    return NextResponse.json({
      success: true,
      utcHour,
      due: due.length,
      sampled,
      wroteNothing,
      rowsWritten,
      pruned,
      failed: failures.length,
      // Surfaced, not hidden: a wrong-field ingestion throws at the client
      // boundary, and that message is exactly what an operator needs to see.
      failures: failures.slice(0, 10),
    });
  } catch (error) {
    void _logger.error("Environmental ingestion sweep failed", { error, utcHour });
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Ingestion failed",
      },
      { status: 500 },
    );
  }
}
