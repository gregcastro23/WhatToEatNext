/**
 * Commensal Request API Route
 * POST /api/commensals/request - Send a commensal request
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { targetUserId: rawTargetUserId, email } = body as { targetUserId?: string; email?: string };

    // Support lookup by email (replaces the old /api/friends/request flow)
    let targetUserId = rawTargetUserId;
    if (!targetUserId && email && typeof email === "string") {
      const found = await userDatabase.getUserByEmail(email.trim().toLowerCase());
      if (!found) {
        return NextResponse.json(
          { success: false, message: "No user found with that email" },
          { status: 404 },
        );
      }
      targetUserId = found.id;
    }

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json(
        { success: false, message: "targetUserId or email is required" },
        { status: 400 },
      );
    }

    if (targetUserId === userId) {
      return NextResponse.json(
        { success: false, message: "You cannot send a commensal request to yourself" },
        { status: 400 },
      );
    }

    const commensalship = await commensalDatabase.createCommensalRequest(userId, targetUserId);

    if (!commensalship) {
      return NextResponse.json(
        { success: false, message: "Could not create commensal request. It may already exist or be blocked." },
        { status: 409 },
      );
    }

    // Notify the target user of the commensal request (fire-and-forget)
    const requester = await userDatabase.getUserById(userId);
    const requesterName = (requester as any)?.profile?.name || (requester as any)?.name || "Someone";
    notificationDatabase.createNotification(
      targetUserId,
      "commensal_request",
      "New Dining Companion Request",
      `${requesterName} wants to be your dining companion`,
      { relatedUserId: userId },
    ).catch(() => {});

    return NextResponse.json(
      { success: true, commensalship },
      { status: 201 },
    );
  } catch (error) {
    console.error("Commensal request error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
