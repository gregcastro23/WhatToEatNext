/**
 * Admin Today's Highlights
 * GET /api/admin/todays-highlights
 *
 * Headline counts for the dashboard: signups, active users, onboardings,
 * recipe activity, diary entries, token transactions, agent events,
 * sign-in failures — each paired with the prior-24h count so deltas
 * highlight what's actually changed.
 *
 * Response shape: `TodaysHighlightsPayload` from
 * src/services/todaysHighlightsService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getTodaysHighlights } from "@/services/todaysHighlightsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 5_000;

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const payload = await memoize("admin:todays-highlights", CACHE_TTL_MS, () =>
    getTodaysHighlights(),
  );
  return NextResponse.json({ success: true, ...payload });
}
