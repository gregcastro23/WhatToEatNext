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

/**
 * `profile` is non-optional on `UserWithProfile`, and every producer in
 * userDatabaseService builds it as an object literal (`rowToUserWithProfile`
 * plus three in-memory constructors), so the old `profile?.` was a dead branch.
 * The old `?? accepter.name` fallback was dead too: `rowToUserWithProfile`
 * folds the `users.name` column into the profile
 * (`name: row.profile_name ?? row.name ?? undefined`) and no producer sets a
 * top-level `name`. Both facts were invisible behind the untyped cast.
 */

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
      const accepterName = accepter?.profile.name ?? "Someone";
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
