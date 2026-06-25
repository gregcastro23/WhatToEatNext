/**
 * Synthetic Auth Sign-in Probe — cron endpoint
 *
 * Triggered every 15 min by Vercel cron. Drives the real Google OAuth
 * sign-in entry path (CSRF → POST /api/auth/signin/google → expect a 302
 * to accounts.google.com) and checks the OAuth client secret against
 * Google's token endpoint. Unlike `auth-handshake` (which uses a
 * long-lived bearer and so skips the OAuth + secret path entirely), this
 * catches a broken sign-in or a rotated AUTH_GOOGLE_SECRET while existing
 * JWT-cookie sessions keep the rest of the site looking healthy.
 *
 * @file src/app/api/cron/synthetic-auth-signin/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  getCronBaseUrl,
  isAuthorizedCron,
} from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { runAuthSigninProbe } from "@/services/syntheticProbeService";

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
    const result = await runAuthSigninProbe({
      baseUrl: getCronBaseUrl(),
    });
    return NextResponse.json({
      success: result.status === "success",
      result,
    });
  } catch (err) {
    _logger.error("[cron/synthetic-auth-signin] probe failed:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
