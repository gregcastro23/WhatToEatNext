/**
 * DELETE /api/tables/[tableId]/invites/[inviteId]
 * Host-only. Revokes an invite (revoked_at stamped; already-consumed uses
 * are unaffected).
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string; inviteId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId, inviteId } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const info = await tableDatabase.getTableHostAndStatus(tableId);
    if (!info) {
      return NextResponse.json({ success: false, message: "Table not found" }, { status: 404 });
    }
    if (info.hostId !== userId) {
      return NextResponse.json(
        { success: false, message: "Only the host can revoke invites" },
        { status: 403 },
      );
    }

    const revoked = await tableDatabase.revokeInvite(tableId, inviteId, userId);
    if (!revoked) {
      return NextResponse.json(
        { success: false, message: "Invite not found or already revoked" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke table invite error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
