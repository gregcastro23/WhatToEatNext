/**
 * Synthetic Cosmic-Recipe Probe — cron endpoint
 *
 * Triggered hourly by Vercel cron (sparse cadence — this probe spends
 * tokens on each run). Exercises the AI recipe generation flow against
 * the synthetic test user and records the result.
 *
 * @file src/app/api/cron/synthetic-cosmic-recipe/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  getCronBaseUrl,
  isAuthorizedCron,
} from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { runCosmicRecipeProbe } from "@/services/syntheticProbeService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
  try {
    const result = await runCosmicRecipeProbe({
      baseUrl: getCronBaseUrl(),
      bearerToken: process.env.SYNTHETIC_PROBE_TOKEN ?? null,
    });
    return NextResponse.json({
      success: result.status === "success",
      result,
    });
  } catch (err) {
    _logger.error("[cron/synthetic-cosmic-recipe] probe failed:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
