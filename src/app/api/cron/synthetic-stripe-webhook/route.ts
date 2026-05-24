/**
 * Synthetic Stripe-Webhook Reachability Probe — cron endpoint
 *
 * Triggered every 15 min by Vercel cron. POSTs an unsigned payload to
 * `/api/stripe/webhook` and expects a 4xx (signature validator active).
 * Does NOT inject signed events into production — that would create
 * real subscription rows.
 *
 * @file src/app/api/cron/synthetic-stripe-webhook/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  getCronBaseUrl,
  isAuthorizedCron,
} from "@/app/api/cron/_lib/cronAuth";
import { _logger } from "@/lib/logger";
import { runStripeWebhookProbe } from "@/services/syntheticProbeService";

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
    const result = await runStripeWebhookProbe({
      baseUrl: getCronBaseUrl(),
    });
    return NextResponse.json({
      success: result.status === "success",
      result,
    });
  } catch (err) {
    _logger.error("[cron/synthetic-stripe-webhook] probe failed:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "unknown",
      },
      { status: 500 },
    );
  }
}
