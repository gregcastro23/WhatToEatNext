/**
 * POST /api/feed/comments/[id]/report  {reason, detail?} — report a comment.
 *
 * One report per reporter (unique constraint). Each new report bumps
 * flagged_count; at 3 distinct reporters the comment auto-hides (same mechanics
 * as PR 3's message reports). A duplicate report is a quiet success.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REASONS = new Set(["spam", "harassment", "inappropriate", "other"]);

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

  let body: { reason?: unknown; detail?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const reason = typeof body.reason === "string" && REASONS.has(body.reason) ? body.reason : null;
  if (!reason) {
    return NextResponse.json({ success: false, message: "A valid reason is required" }, { status: 400 });
  }
  const detail =
    typeof body.detail === "string" && body.detail.trim() ? body.detail.trim().slice(0, 1000) : null;

  try {
    const result = await feedCommentsDatabase.reportComment(id, userId, reason, detail);
    // Neutral response either way — never reveal whether this tipped the hide.
    return NextResponse.json({ success: true, reported: result.reported });
  } catch (error) {
    console.error("[feed/comments] report failed:", error);
    return NextResponse.json({ success: false, message: "Failed to report comment" }, { status: 500 });
  }
}
