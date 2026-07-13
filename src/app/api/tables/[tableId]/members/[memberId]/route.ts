/**
 * DELETE /api/tables/[tableId]/members/[memberId]
 * Host may remove anyone (except the host's own row — leaving a hosted
 * table means cancelling it); a member may remove themselves. Triggers a
 * composite recompute when the removed member was joined.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string; memberId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId, memberId } = await params;
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const result = await tableDatabase.removeMember(tableId, memberId, userId);
    if (!result.ok) {
      const status = result.reason === "forbidden" ? 403 : 404;
      return NextResponse.json(
        {
          success: false,
          message:
            result.reason === "forbidden"
              ? "You are not allowed to remove this member"
              : "Member not found",
        },
        { status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove table member error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
