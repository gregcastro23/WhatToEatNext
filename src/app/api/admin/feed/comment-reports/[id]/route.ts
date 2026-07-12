/**
 * PATCH /api/admin/feed/comment-reports/[id]  {status, deleteComment?}
 *
 * Admin resolves a report: set its status (reviewed/dismissed/actioned/open)
 * and, when actioning, optionally soft-delete the offending comment. Admin only.
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES = new Set(["open", "reviewed", "dismissed", "actioned"]);

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

  let body: { status?: unknown; commentId?: unknown; deleteComment?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const status = typeof body.status === "string" && STATUSES.has(body.status) ? body.status : null;
  if (!status) {
    return NextResponse.json({ success: false, message: "A valid status is required" }, { status: 400 });
  }

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
    console.error("[admin/feed/comment-reports] PATCH failed:", error);
    return NextResponse.json({ success: false, message: "Failed to update report" }, { status: 500 });
  }
}
