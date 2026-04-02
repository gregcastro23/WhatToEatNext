/**
 * Accept Friend Request API Route
 * POST /api/friends/accept - Accept a pending friend request
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import { socialDatabase } from "@/services/socialDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
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
  const { friendshipId } = body as { friendshipId?: string };

  if (!friendshipId) {
    return NextResponse.json(
      { success: false, message: "friendshipId is required" },
      { status: 400 },
    );
  }

  const friendship = await socialDatabase.updateFriendshipStatus(
    friendshipId,
    "accepted",
    userId,
  );

  if (!friendship) {
    return NextResponse.json(
      { success: false, message: "Could not accept request. You may not be the addressee, or it may already be processed." },
      { status: 400 },
    );
  }

  // Notify the requester that their friend request was accepted (fire-and-forget)
  if (friendship.requesterId) {
    const accepter = await userDatabase.getUserById(userId);
    const accepterName = (accepter as any)?.profile?.name || (accepter as any)?.name || "Someone";
    notificationDatabase.createNotification(
      friendship.requesterId,
      "friend_accepted",
      "Friend Request Accepted",
      `${accepterName} accepted your friend request`,
      { relatedUserId: userId },
    ).catch(() => {});
  }

  return NextResponse.json({ success: true, friendship });
}
