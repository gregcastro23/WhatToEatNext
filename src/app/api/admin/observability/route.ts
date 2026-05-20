/**
 * Admin Observability
 * GET /api/admin/observability
 *
 * Reads the in-memory request and slow-query rings populated by
 * src/lib/observability/*. These rings are per-process and reset on
 * deploy — they're for live debugging and admin dashboards, not for
 * long-term retention. The auth_events table fills the durable role.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import {
  getRecentRequests,
  summarizeRecent,
} from "@/lib/observability/requestLog";
import {
  getRecentSlowQueries,
  summarizeSlowQueries,
} from "@/lib/observability/slowQueryLog";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const requestLimit = Math.min(
      Math.max(parseInt(searchParams.get("requestLimit") ?? "100", 10) || 100, 1),
      500,
    );
    const slowLimit = Math.min(
      Math.max(parseInt(searchParams.get("slowLimit") ?? "50", 10) || 50, 1),
      200,
    );

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      requests: {
        summary: summarizeRecent(),
        recent: getRecentRequests({ limit: requestLimit }),
        recentFailures: getRecentRequests({ limit: 50, statusGte: 500 }),
      },
      slowQueries: {
        summary: summarizeSlowQueries(),
        recent: getRecentSlowQueries(slowLimit),
      },
    });
  } catch (error) {
    console.error("[admin/observability] Failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load observability data" },
      { status: 500 },
    );
  }
}
