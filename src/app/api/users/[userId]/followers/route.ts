/**
 * GET /api/users/:userId/followers — public, paginated follower list.
 *
 * Public by design (follows are "public reach"): rate-limited per IP, capped
 * at 50/page, and NEVER exposes emails. Optional viewer (when authenticated)
 * gets `followedByViewer` flags and blocked-pair filtering — anyone in a
 * blocked pair with the viewer is hidden from the list.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { followDatabase } from "@/services/followDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  if (!userId || !UUID.test(userId)) {
    return NextResponse.json({ success: false, message: "userId required" }, { status: 400 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "follow-lists" });
  if (!rl.allowed) return rl.response!;

  const { searchParams } = new URL(request.url);
  const limitRaw = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitRaw) ? limitRaw : undefined;
  const cursor = searchParams.get("cursor");

  const viewerId = await getUserIdFromRequest(request);

  try {
    const page = await followDatabase.listFollowers(
      userId,
      viewerId && UUID.test(viewerId) ? viewerId : null,
      { limit, cursor },
    );
    return NextResponse.json({
      success: true,
      followers: page.entries,
      nextCursor: page.nextCursor,
    });
  } catch (error) {
    console.error("[followers] GET failed:", error);
    return NextResponse.json({ success: false, message: "Failed to load followers" }, { status: 500 });
  }
}
