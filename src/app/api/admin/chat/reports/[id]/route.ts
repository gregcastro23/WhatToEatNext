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
import { _logger } from "@/lib/logger";
import { AdminResolveChatReportRequestSchema } from "@/lib/validation/apiSchemas";
import { chatDatabase } from "@/services/chatDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: Params,
): Promise<NextResponse> {
  const auth = await validateAdminRequest(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  if (!id || !UUID.test(id)) {
    return NextResponse.json({ success: false, message: "Invalid report id" }, { status: 400 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = AdminResolveChatReportRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, message: "A valid status (reviewed, dismissed, actioned) is required" },
      { status: 400 },
    );
  }

  const { status } = parseResult.data;

  try {
    const updated = await chatDatabase.resolveReport(id, auth.user.userId, status);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, status, report: updated });
  } catch (error) {
    _logger.error("[admin/chat/reports] PATCH failed:", error);
    return NextResponse.json({ success: false, message: "Failed to update report" }, { status: 500 });
  }
}
