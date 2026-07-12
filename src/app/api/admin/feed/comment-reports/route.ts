/**
 * GET /api/admin/feed/comment-reports?status=open&limit=50&offset=0
 *
 * Admin triage queue for reported feed comments. Converges visually with PR 3's
 * chat-reports queue (feed_comment_reports mirrors message_reports). Admin only.
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATUSES = new Set(["open", "reviewed", "dismissed", "actioned"]);

export async function GET(request: NextRequest) {
  const auth = await validateAdminRequest(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const statusParamRaw = searchParams.get("status");
  const status = statusParamRaw && STATUSES.has(statusParamRaw) ? statusParamRaw : null;
  const limit = Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50;
  const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0;

  try {
    const reports = await feedCommentsDatabase.listReports(status, { limit, offset });
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("[admin/feed/comment-reports] GET failed:", error);
    return NextResponse.json({ success: false, message: "Failed to load reports" }, { status: 500 });
  }
}
