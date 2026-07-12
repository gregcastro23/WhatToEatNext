/**
 * POST /api/tables/[tableId]/recompute
 * Host-only explicit composite recompute — the recovery path when the
 * failure-tolerant automatic recompute (RSVP/attach/removal) left a stale
 * or missing snapshot. Bypasses the 30s debounce.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { computeAndStoreTableComposite } from "@/lib/tables/composite";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

// The most expensive route in the surface (up to ~24 chart resolutions + a
// full recipe-catalog scoring pass), so it carries a tight per-user limit.
const RECOMPUTE_LIMIT = { window: 60_000, max: 6, bucket: "table-recompute" } as const;

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

    const rl = await rateLimit(request, { ...RECOMPUTE_LIMIT, identifier: userId });
    if (!rl.allowed) return rl.response!;

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
    if (info.status !== "planned" && info.status !== "live") {
      // Never overwrite a memory table's frozen composite snapshot.
      return NextResponse.json(
        { success: false, message: "This table's energy is sealed" },
        { status: 409 },
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
