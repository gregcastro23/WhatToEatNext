/**
 * Accept Commensal Request API Route
 * PUT /api/commensals/accept - Accept a pending commensal request
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { commensalshipId } = body as { commensalshipId?: string };

    if (!commensalshipId || typeof commensalshipId !== "string") {
      return NextResponse.json(
        { success: false, message: "commensalshipId is required" },
        { status: 400 },
      );
    }

    const commensalship = await commensalDatabase.updateCommensalshipStatus(
      commensalshipId,
      "accepted",
      userId,
    );

    if (!commensalship) {
      return NextResponse.json(
        { success: false, message: "Could not accept request. You may not be the addressee or it may be blocked." },
        { status: 400 },
      );
    }

    // Notify the requester that their commensal request was accepted (fire-and-forget)
    if (commensalship.requesterId) {
      const accepter = await userDatabase.getUserById(userId);
      const accepterName = (accepter as any)?.profile?.name || (accepter as any)?.name || "Someone";
      notificationDatabase.createNotification(
        commensalship.requesterId,
        "commensal_accepted",
        "Dining Companion Request Accepted",
        `${accepterName} accepted your dining companion request`,
        {
          relatedUserId: userId,
          metadata: {
            commensalshipId: commensalship.id,
          },
        },
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      commensalship,
    });
  } catch (error) {
    console.error("Accept commensal error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
