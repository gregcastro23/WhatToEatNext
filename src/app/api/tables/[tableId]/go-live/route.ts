/**
 * POST /api/tables/[tableId]/go-live
 * Host-only guarded transition: planned -> live. Fans out `table_going_live`
 * notifications to joined members (fire-and-forget, ephemeral: expires in 24h).
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

async function notifyGoingLive(tableId: string, table: TableRecord): Promise<void> {
  try {
    const detail = await tableDatabase.getTableDetail(tableId, table.hostId);
    if (!detail) return;
    const { notificationDatabase } = await import("@/services/notificationDatabaseService");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const joined = detail.members.filter((m) => m.rsvpStatus === "joined" && m.userId);

    await Promise.all(
      joined.map((m) =>
        notificationDatabase
          .createNotification(
            m.userId!,
            "table_going_live",
            "The Table Is Live",
            `"${table.title}" just went live.`,
            {
              metadata: { tableId: table.id, tableTitle: table.title },
              expiresAt,
            },
          )
          .catch(() => {}),
      ),
    );
  } catch (err) {
    console.warn("notifyGoingLive failed (non-blocking):", err);
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
        { success: false, message: "Only the host can start this table" },
        { status: 403 },
      );
    }

    const table = await tableDatabase.goLive(tableId, userId);
    if (!table) {
      return NextResponse.json(
        { success: false, message: "This table can only go live from the planned state" },
        { status: 409 },
      );
    }

    void notifyGoingLive(tableId, table);

    return NextResponse.json({ success: true, table });
  } catch (error) {
    console.error("Go-live error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
