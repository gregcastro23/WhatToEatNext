/**
 * POST /api/tables/[tableId]/members
 * Host-only. Either {userId} — an in-app/search invite of a registered user
 * (human or agent), creating an `invited` row the invitee must RSVP to — or
 * {manualCompanionChartId} — the host's own offline guest, attached as
 * `joined` immediately. Member cap: 24 rows per table.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import {
  tableDatabase,
  type AddMemberFailureReason,
} from "@/services/tableDatabaseService";
import type { TableMember } from "@/types/table";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ tableId: string }>;
}

const membersPostSchema = z
  .object({
    userId: z.string().trim().min(1).max(200).optional(),
    manualCompanionChartId: z.string().trim().min(1).max(255).optional(),
  })
  .refine((data) => Boolean(data.userId) !== Boolean(data.manualCompanionChartId), {
    message: "Exactly one of userId or manualCompanionChartId is required",
  });

const REASON_STATUS: Record<AddMemberFailureReason, number> = {
  not_found: 404,
  not_host: 403,
  blocked: 409,
  cap_exceeded: 409,
  duplicate: 409,
};

const REASON_MESSAGE: Record<AddMemberFailureReason, string> = {
  not_found: "Table or companion chart not found",
  not_host: "Only the host can add members",
  blocked: "This person cannot be added to your table",
  cap_exceeded: "This table has reached its 24-member limit",
  duplicate: "This person is already on the table",
};

async function notifyTableInvite(
  tableId: string,
  hostId: string,
  member: TableMember,
): Promise<void> {
  if (!member.userId) return;
  try {
    const detail = await tableDatabase.getTableDetail(tableId, hostId);
    if (!detail) return;

    const { userDatabase } = await import("@/services/userDatabaseService");
    const host = await userDatabase.getUserById(hostId);
    const hostName = host?.profile?.name || "Someone";

    const { notificationDatabase } = await import("@/services/notificationDatabaseService");
    await notificationDatabase.createNotification(
      member.userId,
      "table_invite",
      "Table Invitation",
      `${hostName} invited you to "${detail.title}"`,
      {
        metadata: {
          tableId: detail.id,
          tableTitle: detail.title,
          scheduledAt: detail.scheduledAt,
          venueName: detail.venue.name,
          hostName,
        },
      },
    );
  } catch (err) {
    console.warn("notifyTableInvite failed (non-blocking):", err);
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { tableId } = await params;
    const hostId = await getUserIdFromRequest(request);
    if (!hostId) {
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

    const parsed = membersPostSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid request",
        },
        { status: 400 },
      );
    }

    const result = parsed.data.userId
      ? await tableDatabase.addRegisteredMember(tableId, hostId, parsed.data.userId)
      : await tableDatabase.addManualMember(
          tableId,
          hostId,
          parsed.data.manualCompanionChartId!,
        );

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: REASON_MESSAGE[result.reason] },
        { status: REASON_STATUS[result.reason] },
      );
    }

    if (parsed.data.userId) {
      void notifyTableInvite(tableId, hostId, result.member);
    }

    return NextResponse.json({ success: true, member: result.member }, { status: 201 });
  } catch (error) {
    console.error("Add table member error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
