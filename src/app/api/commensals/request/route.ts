/**
 * Commensal Request API Route
 * POST /api/commensals/request - Send a commensal request
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { commensalDatabase } from "@/services/commensalDatabaseService";
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
    const { targetUserId } = body as { targetUserId?: string };

    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json(
        { success: false, message: "targetUserId is required" },
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
