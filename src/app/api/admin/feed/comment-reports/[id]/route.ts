/**
 * PATCH /api/admin/feed/comment-reports/[id]  {status, deleteComment?}
 *
 * Admin resolves a report: set its status (reviewed/dismissed/actioned/open)
 * and, when actioning, optionally soft-delete the offending comment. Admin only.
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { AdminResolveCommentReportRequestSchema } from "@/lib/validation/apiSchemas";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await validateAdminRequest(request);
  if ("error" in auth) return auth.error;
  const adminId = auth.user.userId;

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

  const parseResult = AdminResolveCommentReportRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json({ success: false, message: "A valid status is required" }, { status: 400 });
  }

  const body = parseResult.data;
  const { status } = body;

  try {
    const updated = await feedCommentsDatabase.resolveReport(id, status, adminId);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Report not found" }, { status: 404 });
    }

    // When actioning, optionally remove the offending comment (admin delete).
    let commentDeleted = false;
    if (status === "actioned" && body.deleteComment === true && typeof body.commentId === "string" && UUID.test(body.commentId)) {
      commentDeleted = await feedCommentsDatabase.deleteComment(body.commentId, adminId, true);
    }

    return NextResponse.json({ success: true, status, commentDeleted });
  } catch (error) {
    _logger.error("[admin/feed/comment-reports] PATCH failed:", error);
    return NextResponse.json({ success: false, message: "Failed to update report" }, { status: 500 });
  }
}
