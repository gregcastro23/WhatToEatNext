/**
 * Admin Human Growth
 * GET /api/admin/growth
 *
 * Humans only (agents excluded by email domain): DAU/WAU/MAU, stickiness,
 * 30-day signups vs actives, weekly retention cohorts, the activation funnel,
 * newest signups, and most active users. Response: `GrowthPayload` from
 * src/services/admin/userGrowthService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getUserGrowth } from "@/services/admin/userGrowthService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const payload = await memoize("admin:growth", 30_000, () => getUserGrowth());
  return NextResponse.json({ success: true, ...payload });
}
