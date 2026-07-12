/**
 * POST /api/tables/[tableId]/join-request
 *
 * Closes the discovery dead-end (PR 6, docs/plans/pr6-discovery-mobile-plan.md
 * §3): a discoverer of a PUBLIC planned/live table asks the host for an
 * invite. All four invite modes are host-initiated, so without this a
 * discoverer could only look. The host receives a `table_join_request`
 * notification whose Invite action runs the normal
 * `addRegisteredMember` → `table_invite` → RSVP rail.
 *
 * Reuses PR 2 rails: block checks, capacity, dedupe. Declines are silent by
 * design (no requester-visible rejection state in v1). Server kill-switch:
 * TABLE_JOIN_REQUESTS_ENABLED (default true). RL 10/min per user.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { tableDatabase, type JoinRequestFailureReason } from "@/services/tableDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

const JOIN_REQUEST_LIMIT = { window: 60_000, max: 10, bucket: "tables-join-request" } as const;

// Silent-to-requester failures: the client shows the same "requested" state
// regardless, so declines/dupes never leak host decisions. Only genuine input
// errors surface a distinct status.
const REASON_STATUS: Record<JoinRequestFailureReason, number> = {
  not_found: 404,
  not_public: 403,
  not_joinable: 409,
  blocked: 403,
  already_member: 409,
  cap_exceeded: 409,
  duplicate: 200,
};

const REASON_MESSAGE: Record<JoinRequestFailureReason, string> = {
  not_found: "Table not found",
  not_public: "This table isn't open to join requests",
  not_joinable: "This table is no longer accepting guests",
  blocked: "This table isn't open to join requests",
  already_member: "You're already part of this table",
  cap_exceeded: "This table is full",
  duplicate: "Your request has been sent",
};

async function notifyHostOfJoinRequest(
  hostId: string,
  tableId: string,
  tableTitle: string,
  requesterId: string,
): Promise<void> {
  try {
    const { userDatabase } = await import("@/services/userDatabaseService");
    const requester = await userDatabase.getUserById(requesterId);
    const requesterName = requester?.profile?.name || "An alchemist";

    const { notificationDatabase } = await import("@/services/notificationDatabaseService");
    await notificationDatabase.createNotification(
      hostId,
      "table_join_request",
      "Ask to Join",
      `${requesterName} would like to join "${tableTitle}".`,
      {
        relatedUserId: requesterId,
        metadata: { tableId, tableTitle, requesterId, requesterName },
      },
    );
  } catch (err) {
    console.warn("notifyHostOfJoinRequest failed (non-blocking):", err);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    if (process.env.TABLE_JOIN_REQUESTS_ENABLED === "false") {
      return NextResponse.json(
        { success: false, message: "Join requests are not available right now" },
        { status: 403 },
      );
    }

    const { tableId } = await params;
    const requesterId = await getUserIdFromRequest(request);
    if (!requesterId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, { ...JOIN_REQUEST_LIMIT, identifier: requesterId });
    if (!rl.allowed) return rl.response!;

    const result = await tableDatabase.requestToJoin(tableId, requesterId);

    if (!result.ok) {
      // Dedupe reads as success to the requester (idempotent, host-silent).
      if (result.reason === "duplicate") {
        return NextResponse.json({ success: true, message: REASON_MESSAGE.duplicate });
      }
      return NextResponse.json(
        { success: false, message: REASON_MESSAGE[result.reason] },
        { status: REASON_STATUS[result.reason] },
      );
    }

    void notifyHostOfJoinRequest(result.hostId, tableId, result.tableTitle, requesterId);

    return NextResponse.json({ success: true, message: "Your request has been sent" }, { status: 201 });
  } catch (error) {
    console.error("Table join-request error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
