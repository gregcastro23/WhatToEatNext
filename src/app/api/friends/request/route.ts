/**
 * Friend Request API Route
 * POST /api/friends/request - Send a friend request by email
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { socialDatabase } from "@/services/socialDatabaseService";
import { userDatabase } from "@/services/userDatabaseService";
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
  const { email } = body as { email?: string };

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { success: false, message: "email is required" },
      { status: 400 },
    );
  }

  // Look up addressee by email
  const addressee = await userDatabase.getUserByEmail(email.trim().toLowerCase());
  if (!addressee) {
    return NextResponse.json(
      { success: false, message: "No user found with that email" },
      { status: 404 },
    );
  }

  if (addressee.id === userId) {
    return NextResponse.json(
      { success: false, message: "You cannot send a friend request to yourself" },
      { status: 400 },
    );
  }

  const friendship = await socialDatabase.createFriendRequest(userId, addressee.id);
  if (!friendship) {
    return NextResponse.json(
      { success: false, message: "Could not create friend request. It may already exist or be blocked." },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true, friendship }, { status: 201 });
}
