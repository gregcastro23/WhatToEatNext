/**
 * Commensal Request API Route
 * POST /api/commensals/request - Send a commensal request
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { CommensalRequestSchema } from "@/lib/validation/apiSchemas";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { feedDatabase } from "@/services/feedDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { userDatabase } from "@/services/userDatabaseService";
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

    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 },
      );
    }

    const parsedBody = CommensalRequestSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { targetUserId: rawTargetUserId, email } = parsedBody.data;

    let targetUserId = rawTargetUserId;
    let targetUserRecord: any = null;
    
    if (!targetUserId && email) {
      const found = await userDatabase.getUserByEmail(email.trim().toLowerCase());
      if (!found) {
        return NextResponse.json(
          { success: false, message: "No user found with that email" },
          { status: 404 },
        );
      }
      targetUserId = found.id;
      targetUserRecord = found;
    }

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json(
        { success: false, message: "targetUserId or email is required" },
        { status: 400 },
      );
    }
    
    if (!targetUserRecord) {
      targetUserRecord = await userDatabase.getUserById(targetUserId);
    }

    if (targetUserId === userId) {
      return NextResponse.json(
        { success: false, message: "You cannot send a commensal request to yourself" },
        { status: 400 },
      );
    }

    const commensalship = await commensalDatabase.createCommensalRequest(userId, targetUserId);

    if (!commensalship) {
      console.warn(`[commensals/request] Request failed for ${userId} -> ${targetUserId} (possibly duplicate or blocked)`);
      return NextResponse.json(
        { success: false, message: "Could not create commensal request. It may already exist or be blocked." },
        { status: 409 },
      );
    }
    
    // Auto-accept logic for Agentic Users
    let finalCommensalship = commensalship;
    if (targetUserRecord && targetUserRecord.isAgent) {
      const accepted = await commensalDatabase.updateCommensalshipStatus(commensalship.id, 'accepted', targetUserId);
      if (accepted) {
        finalCommensalship = accepted;
      }
    }

    // Notify the target user of the commensal request (fire-and-forget)
    // Only notify if they are not an agent (agents don't check notifications)
    const requester = await userDatabase.getUserById(userId);
    const requesterName = requester?.profile?.name || "Someone";
    const targetName = targetUserRecord?.profile?.name || "another alchemist";

    feedDatabase.createEvent(userId, "commensal_request", { targetName }).catch(() => {});

    // Skip when the link is already accepted: a pending reverse-direction
    // request auto-accepts inside createCommensalRequest (mutual interest),
    // which notifies the original requester with commensal_accepted — a
    // "wants to be your dining companion" ping here would be wrong.
    if (
      (!targetUserRecord || !targetUserRecord.isAgent) &&
      finalCommensalship.status === "pending"
    ) {
      notificationDatabase.createNotification(
        targetUserId,
        "commensal_request",
        "New Dining Companion Request",
        `${requesterName} wants to be your dining companion`,
        {
          relatedUserId: userId,
          metadata: {
            commensalshipId: commensalship.id,
          },
        },
      ).catch(() => {});
    }

    return NextResponse.json(
      { success: true, commensalship: finalCommensalship },
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
