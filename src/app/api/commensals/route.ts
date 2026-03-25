/**
 * Commensalships API Route
 * GET /api/commensals - List all commensalships and pending requests for the authenticated user
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // Get all commensalships for this user
    const allCommensalships = await commensalDatabase.getCommensalshipsForUser(userId);

    // Separate into categories
    const pendingReceived = allCommensalships.filter(
      (c) => c.status === "pending" && c.addresseeId === userId
    );
    const pendingSent = allCommensalships.filter(
      (c) => c.status === "pending" && c.requesterId === userId
    );
    const accepted = allCommensalships.filter((c) => c.status === "accepted");

    // Get linked commensals with their natal chart data
    const linkedCommensals = await commensalDatabase.getLinkedCommensalsForUser(userId);

    return NextResponse.json({
      success: true,
      pendingReceived,
      pendingSent,
      accepted,
      linkedCommensals,
    });
  } catch (error) {
    console.error("Get commensalships error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
