/**
 * POST /api/feed/comments/[id]/report  {reason, detail?} — report a comment.
 *
 * One report per reporter (unique constraint). Each new report bumps
 * flagged_count; at 3 distinct reporters the comment auto-hides (same mechanics
 * as PR 3's message reports). A duplicate report is a quiet success.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { FeedCommentReportRequestSchema } from "@/lib/validation/apiSchemas";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 5, bucket: "feed-comment-report", identifier: userId });
  if (!rl.allowed) return rl.response!;

  const { id } = await params;
  if (!id || !UUID.test(id)) {
    return NextResponse.json({ success: false, message: "Invalid comment id" }, { status: 400 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = FeedCommentReportRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "A valid reason is required" }, { status: 400 });
  }
  const { reason, detail } = parsed.data;

  try {
    const result = await feedCommentsDatabase.reportComment(id, userId, reason, detail ?? null);
    // Neutral response either way — never reveal whether this tipped the hide.
    return NextResponse.json({ success: true, reported: result.reported });
  } catch (error) {
    _logger.error("[feed/comments] report failed:", error);
    return NextResponse.json({ success: false, message: "Failed to report comment" }, { status: 500 });
  }
}
