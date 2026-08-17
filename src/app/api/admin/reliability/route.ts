/**
 * Admin Reliability
 * GET /api/admin/reliability
 *
 * The three "over time" reads the admin surface was missing: system-health
 * history + week-over-week drift, per-probe reliability, and per-channel
 * alert delivery. Each is backed by a table the cron layer already fills;
 * see `src/services/adminReliabilityService.ts` for why each one matters.
 *
 * Response shape: `AdminReliabilityPayload` from adminReliabilityService.
 * Every section carries its own `live` flag and degrades independently — a
 * failing source resolves to `live: false`, never to a fabricated zero.
 *
 * Query params (all optional, clamped server-side):
 *   historyHours — health snapshot window, 1..720 (default 168 = 7d)
 *   probeDays    — probe reliability window, 1..90 (default 7)
 *   alertDays    — alert delivery window, 1..365 (default 30)
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getAdminReliability } from "@/services/adminReliabilityService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 15s cache: these are hourly-cadence sources, so a short cache costs no
// freshness while coalescing bursts from multiple open admin tabs.
const CACHE_TTL_MS = 15_000;

function readIntParam(
  request: NextRequest,
  key: string,
  fallback: number,
): number {
  const raw = request.nextUrl.searchParams.get(key);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const historyHours = readIntParam(request, "historyHours", 168);
  const probeDays = readIntParam(request, "probeDays", 7);
  const alertDays = readIntParam(request, "alertDays", 30);

  try {
    const payload = await memoize(
      `admin:reliability:${historyHours}:${probeDays}:${alertDays}`,
      CACHE_TTL_MS,
      () => getAdminReliability({ historyHours, probeDays, alertDays }),
    );
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error("[admin/reliability] Failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load reliability data" },
      { status: 500 },
    );
  }
}
