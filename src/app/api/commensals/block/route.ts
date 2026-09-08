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
import { _logger } from "@/lib/logger";
import { CommensalBlockRequestSchema } from "@/lib/validation/apiSchemas";
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

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const parsed = CommensalBlockRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      const [firstIssue] = parsed.error.issues;
      return NextResponse.json(
        { success: false, message: firstIssue?.message ?? "Invalid request payload" },
        { status: 400 },
      );
    }

    const { commensalshipId, targetUserId, action } = parsed.data;

    if (targetUserId && targetUserId === userId) {
      return NextResponse.json(
        { success: false, message: "You cannot block yourself" },
        { status: 400 },
      );
    }

    if (action === "unblock") {
      const removed = await commensalDatabase.unblockCommensal(userId, {
        commensalshipId,
        targetUserId,
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
      commensalshipId,
      targetUserId,
    });
    if (!blocked) {
      return NextResponse.json(
        { success: false, message: "Could not block this companion link" },
        { status: 400 },
      );
    }

    // Deliberately body-less: the commensalship row carries both parties'
    // emails, and blocking works from a bare targetUserId — echoing the row
    // back would be a silent email-harvesting vector.
    return NextResponse.json({ success: true });
  } catch (error) {
    _logger.error("Block commensal error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
