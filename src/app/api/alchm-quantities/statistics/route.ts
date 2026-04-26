/**
 * GET /api/alchm-quantities/statistics?period=day|week|month|quarter|year|all
 *
 * Returns the contextual statistics envelope (mean, stdDev, percentiles,
 * z-score, sparkline, histogram) for ESMS / thermodynamic / kinetic /
 * elemental quantities and per-planet contributions, computed retroactively
 * from the pre-generated alchemicalSamples.json table.
 *
 * Cheap: just slices an in-memory array and runs O(N) summaries — no
 * astronomy-engine calls, no backend round-trips.
 */
import { NextResponse } from "next/server";
import { createLogger } from "@/utils/logger";
import {
  getAllPeriodStatistics,
  getSampleFileMeta,
  getStatisticsForPeriod,
  type StatPeriod,
} from "@/utils/alchemicalSampleLookup";

const logger = createLogger("AlchmQuantitiesStatisticsAPI");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const VALID_PERIODS: StatPeriod[] = [
  "day",
  "week",
  "month",
  "quarter",
  "year",
  "all",
];

function isPeriod(value: string | null): value is StatPeriod {
  return value !== null && (VALID_PERIODS as string[]).includes(value);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const periodParam = url.searchParams.get("period");
    const includeAllParam = url.searchParams.get("all");

    // Optional reference timestamp for retroactive analysis.
    const refParam = url.searchParams.get("ref");
    const refDate = (() => {
      if (!refParam) return new Date();
      const parsed = Date.parse(refParam);
      return Number.isFinite(parsed) ? new Date(parsed) : new Date();
    })();

    if (includeAllParam === "true") {
      const all = getAllPeriodStatistics(refDate);
      return NextResponse.json(
        {
          success: true,
          reference: refDate.toISOString(),
          file: getSampleFileMeta(),
          periods: all,
        },
        {
          headers: {
            // Period stats are stable across the 6h sample interval; cache 30 min.
            "Cache-Control": "public, max-age=1800, s-maxage=1800",
          },
        },
      );
    }

    const period: StatPeriod = isPeriod(periodParam) ? periodParam : "month";
    const stats = getStatisticsForPeriod(period, refDate);
    if (!stats) {
      return NextResponse.json(
        {
          success: false,
          error: `No samples available for period "${period}" relative to ${refDate.toISOString()}.`,
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        reference: refDate.toISOString(),
        file: getSampleFileMeta(),
        statistics: stats,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=1800, s-maxage=1800",
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Failed to compute statistics", { error: message });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to compute statistics",
        details: message,
      },
      { status: 500 },
    );
  }
}
