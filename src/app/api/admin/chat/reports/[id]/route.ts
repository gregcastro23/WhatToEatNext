/**
 * PATCH /api/admin/chat/reports/[id]  {status}
 *
 * Admin resolves a reported chat message: 'actioned' hides the message,
 * 'dismissed' unhides it when nothing else keeps it hidden, 'reviewed' just
 * closes the report. Backed by chatDatabase.resolveReport. Admin only.
 *
 * @file src/app/api/admin/chat/reports/[id]/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { chatDatabase } from "@/services/chatDatabaseService";
import type { MessageReportStatus } from "@/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// 'open' is the initial state, not a resolution target.
const RESOLVE_STATUSES = new Set<Exclude<MessageReportStatus, "open">>([
  "reviewed",
  "dismissed",
  "actioned",
]);

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await validateAdminRequest(request);
  if ("error" in auth) return auth.error;
  const adminId = auth.user.userId;

  const { id } = await params;
  if (!id || !UUID.test(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid report id" },
      { status: 400 },
    );
  }

  let body: { status?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const status =
    typeof body.status === "string" &&
    RESOLVE_STATUSES.has(body.status as Exclude<MessageReportStatus, "open">)
      ? (body.status as Exclude<MessageReportStatus, "open">)
      : null;
  if (!status) {
    return NextResponse.json(
      {
        success: false,
        message: "A valid status (reviewed, dismissed, actioned) is required",
      },
      { status: 400 },
    );
  }

  try {
    const updated = await chatDatabase.resolveReport(id, adminId, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, status, report: updated });
  } catch (error) {
    console.error("[admin/chat/reports] PATCH failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update report" },
      { status: 500 },
    );
  }
}
