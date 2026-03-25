/**
 * Reject / Remove Friend API Route
 * POST /api/friends/reject - Reject a pending request or unfriend an accepted friend
 * Body: { friendshipId, block?: boolean }
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { socialDatabase } from "@/services/socialDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }
  const { friendshipId, block } = body as { friendshipId?: string; block?: boolean };

  if (!friendshipId) {
    return NextResponse.json(
      { success: false, message: "friendshipId is required" },
      { status: 400 },
    );
  }

  if (block) {
    // Block instead of delete
    const friendship = await socialDatabase.updateFriendshipStatus(
      friendshipId,
      "blocked",
      userId,
    );
    if (!friendship) {
      return NextResponse.json(
        { success: false, message: "Could not block. You may not be a party to this friendship." },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, friendship });
  }

  // Delete the friendship (reject or unfriend)
  const deleted = await socialDatabase.deleteFriendship(friendshipId, userId);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Could not reject/remove. Friendship not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
