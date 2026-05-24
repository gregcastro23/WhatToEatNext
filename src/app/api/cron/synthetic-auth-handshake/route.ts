/**
 * Synthetic Auth-Handshake Probe — cron endpoint
 *
 * Triggered every 15 min by Vercel cron. Exercises GET /api/auth/sessions
 * as the synthetic test user, verifying NextAuth + device-session
 * machinery is healthy.
 *
 * @file src/app/api/cron/synthetic-auth-handshake/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  getCronBaseUrl,
  isAuthorizedCron,
} from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { runAuthHandshakeProbe } from "@/services/syntheticProbeService";

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
    const result = await runAuthHandshakeProbe({
      baseUrl: getCronBaseUrl(),
      bearerToken: process.env.SYNTHETIC_PROBE_TOKEN ?? null,
    });
    return NextResponse.json({
      success: result.status === "success",
      result,
    });
  } catch (err) {
    _logger.error("[cron/synthetic-auth-handshake] probe failed:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
