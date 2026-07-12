/**
 * POST /api/tables/[tableId]/rsvp
 * Requires an existing `invited` row for the caller (created via the host's
 * search/invite on /members, or upgraded straight to `joined` by invite-link
 * redemption which bypasses this endpoint entirely). `joined` triggers a
 * composite recompute and notifies the host; `declined` does neither.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { tableDatabase } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

const rsvpSchema = z.object({
  response: z.enum(["joined", "declined"]),
});

const RSVP_LIMIT = { window: 60_000, max: 20, bucket: "tables-rsvp" } as const;

async function notifyHostOfRsvp(
  tableId: string,
  hostId: string,
  tableTitle: string,
  guestName: string,
): Promise<void> {
  try {
    const { notificationDatabase } = await import("@/services/notificationDatabaseService");
    await notificationDatabase.createNotification(
      hostId,
      "table_rsvp",
      "RSVP Received",
      `${guestName} is joining "${tableTitle}".`,
      {
        metadata: { tableId, tableTitle, response: "joined", guestName },
      },
    );
  } catch (err) {
    console.warn("notifyHostOfRsvp failed (non-blocking):", err);
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

    const rl = await rateLimit(request, { ...RSVP_LIMIT, identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = rsvpSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "response must be 'joined' or 'declined'" },
        { status: 400 },
      );
    }

    const result = await tableDatabase.rsvp(tableId, userId, parsed.data.response);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: "No pending invitation found for this table" },
        { status: 404 },
      );
    }

    if (parsed.data.response === "joined") {
      const guestName = result.member.name || "A guest";
      void notifyHostOfRsvp(tableId, result.table.hostId, result.table.title, guestName);
    }

    return NextResponse.json({ success: true, member: result.member });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
