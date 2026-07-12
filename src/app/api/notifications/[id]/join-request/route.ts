/**
 * PATCH /api/notifications/[id]/join-request
 *
 * Flips a `table_join_request` notification's own lifecycle status
 * (pending → actioned | dismissed) — decoupled from `is_read` (PR 6
 * adversarial-review fix): merely viewing/opening the notification panel
 * marks the row read via the existing markAsRead path, and that must never
 * itself hide the Invite/Dismiss actions or defeat
 * `tableDatabaseService.requestToJoin`'s dedupe (both key off this field, not
 * `is_read`).
 *
 * The host's "Invite" action calls the normal `POST /api/tables/[id]/members`
 * rail first (creates the invited member row), then PATCHes this endpoint
 * with `status: "actioned"`. "Dismiss" PATCHes `status: "dismissed"` directly
 * — declines are silent by design, no requester-visible state.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  status: z.enum(["actioned", "dismissed"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "status must be 'actioned' or 'dismissed'" },
        { status: 400 },
      );
    }

    const { id } = await params;
    const updated = await notificationDatabase.updateJoinRequestStatus(
      id,
      userId,
      parsed.data.status,
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Request not found or not yours" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notifications/[id]/join-request] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update the join request" },
      { status: 500 },
    );
  }
}
