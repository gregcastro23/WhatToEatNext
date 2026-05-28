/**
 * Admin User Insights API
 * GET /api/admin/users/insights
 *
 * Returns aggregated demographic, activity, onboarding, tier, and signup-trend
 * breakdowns across the full user roster. Backs the User Insights panel at
 * /admin/users.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getUserInsights } from "@/services/userInsightsService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 5_000;

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const payload = await memoize("admin:user-insights", CACHE_TTL_MS, () =>
      getUserInsights(),
    );
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    console.error("[admin/users/insights] Failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load user insights" },
      { status: 500 },
    );
  }
}
