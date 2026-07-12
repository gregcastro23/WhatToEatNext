/**
 * POST /api/tables/[tableId]/close
 * Host-only guarded transition: live -> memory (terminal). The memory
 * artifact + `table_memory` feed event + `table_memory_posted` notifications
 * are all handled inside tableDatabaseService.closeTable.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId } = await params;
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
        { success: false, message: "Only the host can close this table" },
        { status: 403 },
      );
    }

    const table = await tableDatabase.closeTable(tableId, userId);
    if (!table) {
      return NextResponse.json(
        { success: false, message: "This table can only be closed while it is live" },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error("Close table error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
