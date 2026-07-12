/**
 * POST /api/tables/[tableId]/recompute
 * Host-only explicit composite recompute — the recovery path when the
 * failure-tolerant automatic recompute (RSVP/attach/removal) left a stale
 * or missing snapshot. Bypasses the 30s debounce.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { computeAndStoreTableComposite } from "@/lib/tables/composite";
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
        { success: false, message: "Only the host can recompute the table's energy" },
        { status: 403 },
      );
    }

    await computeAndStoreTableComposite(tableId, { force: true });

    const detail = await tableDatabase.getTableDetail(tableId, userId);
    if (!detail) {
      return NextResponse.json({ success: false, message: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, table: detail });
  } catch (error) {
    console.error("Recompute table composite error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
