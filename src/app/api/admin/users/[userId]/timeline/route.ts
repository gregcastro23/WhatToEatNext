/**
 * Admin Per-User Timeline
 * GET /api/admin/users/[userId]/timeline
 *
 * Backs the /admin/users/[userId] deep-dive page. Returns the full identity
 * + balances + subscription + lifetime stats + chronological event timeline
 * for a single user, merging auth/feed/token/interaction events.
 *
 * Response shape: `UserTimelinePayload` from src/services/userTimelineService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getUserTimeline } from "@/services/userTimelineService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 5_000;

interface RouteParams {
  params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const { userId } = await params;
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId)) {
    return NextResponse.json(
      { success: false, message: "Invalid user id" },
      { status: 400 },
    );
  }

  const payload = await memoize(`admin:user-timeline:${userId}`, CACHE_TTL_MS, () =>
    getUserTimeline(userId),
  );

  if (!payload) {
    return NextResponse.json(
      { success: false, message: "User not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, ...payload });
}
