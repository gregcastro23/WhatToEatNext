/**
 * Admin Live Activity
 * GET /api/admin/live-activity
 *
 * Merged chronological feed of every meaningful event in the last 6 hours:
 * signups, sign-ins, onboarding completions, recipe views/cooks, food diary
 * entries, token transactions, and agent events. Each source degrades
 * independently to an empty array — the response still renders with
 * `live: false` if one source failed.
 *
 * Response shape: `LiveActivityPayload` from src/services/liveActivityService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getLiveActivity } from "@/services/liveActivityService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 5_000;

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const payload = await memoize("admin:live-activity", CACHE_TTL_MS, () =>
    getLiveActivity(),
  );
  return NextResponse.json({ success: true, ...payload });
}
