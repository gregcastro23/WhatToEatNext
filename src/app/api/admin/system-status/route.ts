/**
 * Admin System Status
 * GET /api/admin/system-status
 *
 * Operator-grade health summary for every critical user-facing flow plus
 * external dependencies. Backed by `systemStatusService` which computes
 * health from existing signals (auth_events, feed_events, request log,
 * slow query ring, DB pool, feedEmitTracker) — no new instrumentation
 * is required.
 *
 * Response shape: `SystemStatusPayload` from src/services/systemStatusService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getSystemStatus } from "@/services/systemStatusService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 5s cache: coalesces multiple admin tabs / accidental reloads. The panel
// polls every 60s anyway, so this is purely a defense against bursts.
const CACHE_TTL_MS = 5_000;

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const payload = await memoize("admin:system-status", CACHE_TTL_MS, () =>
    getSystemStatus(),
  );
  return NextResponse.json({ success: true, ...payload });
}
