/**
 * Synthetic Onboarding Probe — cron endpoint
 *
 * Triggered by Vercel cron every 15 minutes (see vercel.json). Exercises
 * the onboarding-skip flow against a dedicated synthetic test user and
 * records the result to `synthetic_probe_results`. The admin dashboard
 * reads the latest row to incorporate synthetic failures into the
 * onboarding status badge.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` — Vercel automatically
 * adds this header for scheduled invocations when CRON_SECRET is set in
 * project env vars. The bearer token used to call /api/onboarding is a
 * separate `SYNTHETIC_PROBE_TOKEN` (a long-lived JWT for the synthetic
 * test user).
 *
 * Required env vars:
 *   - CRON_SECRET — protects this endpoint from arbitrary callers
 *   - SYNTHETIC_PROBE_TOKEN — bearer for /api/onboarding (synthetic user JWT)
 *   - SYNTHETIC_PROBE_BASE_URL — override for self-call URL (default: VERCEL_URL)
 *
 * @file src/app/api/cron/synthetic-onboarding/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { _logger } from "@/lib/logger";
import { runOnboardingSkipProbe } from "@/services/syntheticProbeService";
import { isAuthorizedCron } from "../_lib/cronAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Probe + DB write can take a few seconds — give it room without burning
// the full 60s default.
export const maxDuration = 30;

function getBaseUrl(): string {
  if (process.env.SYNTHETIC_PROBE_BASE_URL) {
    return process.env.SYNTHETIC_PROBE_BASE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function isAuthorized(request: NextRequest): boolean {
  return isAuthorizedCron(request);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const baseUrl = getBaseUrl();
  const bearerToken = process.env.SYNTHETIC_PROBE_TOKEN ?? null;

  try {
    const result = await runOnboardingSkipProbe({ baseUrl, bearerToken });
    return NextResponse.json({
      success: result.status === "success",
      result,
    });
  } catch (err) {
    _logger.error("[cron/synthetic-onboarding] probe failed:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
