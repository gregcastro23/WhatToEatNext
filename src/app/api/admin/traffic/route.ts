/**
 * Admin Traffic Analytics
 * GET /api/admin/traffic?range=24h|7d|30d
 *
 * First-party page views (migration 86): who is on the site now, visits over
 * time, top pages, referrers, countries, devices, and the raw recent stream.
 * Response: `TrafficSummary` from src/services/admin/trafficAnalyticsService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getTrafficSummary } from "@/services/admin/trafficAnalyticsService";
import type { TrafficRange } from "@/services/admin/trafficTypes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RANGES: readonly TrafficRange[] = ["24h", "7d", "30d"];

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const requested = request.nextUrl.searchParams.get("range");
  const range: TrafficRange = RANGES.find((r) => r === requested) ?? "24h";
  const payload = await memoize(`admin:traffic:${range}`, 5_000, () => getTrafficSummary(range));
  return NextResponse.json({ success: true, ...payload });
}
