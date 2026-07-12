/**
 * POST /api/tables/[tableId]/cancel
 * Host-only guarded transition: planned OR live -> cancelled (terminal).
 * Notifies joined members — no new notification enum value is spent on
 * cancellation; it reuses `table_going_live` (the "status change on a table
 * you joined" slot) with `metadata.cancelled = true` (plan doc §2). No feed
 * event is written.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { TableRecord } from "@/types/table";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

async function notifyCancelled(tableId: string, table: TableRecord): Promise<void> {
  try {
    const detail = await tableDatabase.getTableDetail(tableId, table.hostId);
    if (!detail) return;
    const { notificationDatabase } = await import("@/services/notificationDatabaseService");
    const joined = detail.members.filter(
      (m) => m.rsvpStatus === "joined" && m.userId && m.userId !== table.hostId,
    );

    await Promise.all(
      joined.map((m) =>
        notificationDatabase
          .createNotification(
            m.userId!,
            "table_going_live",
            "Table Cancelled",
            `"${table.title}" was cancelled by the host.`,
            {
              metadata: { tableId: table.id, tableTitle: table.title, cancelled: true },
            },
          )
          .catch(() => {}),
      ),
    );
  } catch (err) {
    console.warn("notifyCancelled failed (non-blocking):", err);
  }
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
        { success: false, message: "Only the host can cancel this table" },
        { status: 403 },
      );
    }

    const table = await tableDatabase.cancelTable(tableId, userId);
    if (!table) {
      return NextResponse.json(
        { success: false, message: "This table can no longer be cancelled" },
        { status: 409 },
      );
    }

    void notifyCancelled(tableId, table);

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error("Cancel table error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
