/**
 * Friends API Route
 * GET /api/friends - List all friendships (pending, accepted, blocked) for the authenticated user
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { socialDatabase } from "@/services/socialDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const friendships = await socialDatabase.getFriendshipsForUser(userId);
  const linkedFriends = await socialDatabase.getLinkedFriendsForUser(userId);

  // Separate into categories
  const incoming = friendships.filter(
    (f) => f.addresseeId === userId && f.status === "pending",
  );
  const outgoing = friendships.filter(
    (f) => f.requesterId === userId && f.status === "pending",
  );
  const accepted = friendships.filter((f) => f.status === "accepted");
  const blocked = friendships.filter((f) => f.status === "blocked");

  return NextResponse.json({
    success: true,
    friendships,
    incoming,
    outgoing,
    accepted,
    blocked,
    linkedFriends,
  });
}
