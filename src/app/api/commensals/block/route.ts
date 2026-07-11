/**
 * Block Commensal API Route
 * POST /api/commensals/block - Block (or unblock) a dining companion link.
 *
 * Body: { commensalshipId?: string; targetUserId?: string; action?: "block" | "unblock" }
 * — one of commensalshipId or targetUserId is required.
 *
 * Either party may block. Blocking upserts the pair row to status='blocked'
 * (creating one when no relationship exists yet); unblocking deletes the
 * blocked row so a fresh request becomes possible. Blocked rows never appear
 * in linked-commensal listings (those filter on status='accepted') and
 * further requests for the pair are refused while blocked.
 *
 * Silent by design: no notifications are emitted for block or unblock.
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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { commensalshipId, targetUserId, action = "block" } = body as {
      commensalshipId?: string;
      targetUserId?: string;
      action?: string;
    };

    if (action !== "block" && action !== "unblock") {
      return NextResponse.json(
        { success: false, message: "action must be 'block' or 'unblock'" },
        { status: 400 },
      );
    }
    const hasChipId =
      typeof commensalshipId === "string" && commensalshipId.length > 0;
    const hasTargetId =
      typeof targetUserId === "string" && targetUserId.length > 0;
    if (!hasChipId && !hasTargetId) {
      return NextResponse.json(
        { success: false, message: "commensalshipId or targetUserId is required" },
        { status: 400 },
      );
    }
    if (hasTargetId && targetUserId === userId) {
      return NextResponse.json(
        { success: false, message: "You cannot block yourself" },
        { status: 400 },
      );
    }

    if (action === "unblock") {
      const removed = await commensalDatabase.unblockCommensal(userId, {
        commensalshipId: hasChipId ? commensalshipId : undefined,
        targetUserId: hasTargetId ? targetUserId : undefined,
      });
      if (!removed) {
        return NextResponse.json(
          { success: false, message: "No blocked companion link found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ success: true });
    }

    const blocked = await commensalDatabase.blockCommensal(userId, {
      commensalshipId: hasChipId ? commensalshipId : undefined,
      targetUserId: hasTargetId ? targetUserId : undefined,
    });
    if (!blocked) {
      return NextResponse.json(
        { success: false, message: "Could not block this companion link" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, commensalship: blocked });
  } catch (error) {
    console.error("Block commensal error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
