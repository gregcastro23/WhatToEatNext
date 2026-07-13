/**
 * DELETE /api/feed/comments/[id] — soft-delete a comment (author or admin).
 *
 * Sets deleted_at/deleted_by; the row stays for audit and drops out of every
 * read (list filters deleted_at IS NULL). Idempotent.
 */

import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/adminEmails";
import { validateRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await validateRequest(request);
  if ("error" in auth) return auth.error;
  const userId = auth.user.userId;
  const isAdmin = auth.user.roles.includes("admin") && isAdminEmail(auth.user.email);

  const rl = await rateLimit(request, { window: 60_000, max: 30, bucket: "feed-comment-delete", identifier: userId });
  if (!rl.allowed) return rl.response!;

  const { id } = await params;
  if (!id || !UUID.test(id)) {
    return NextResponse.json({ success: false, message: "Invalid comment id" }, { status: 400 });
  }

  try {
    const deleted = await feedCommentsDatabase.deleteComment(id, userId, isAdmin);
    if (!deleted) {
      // Either not found, already deleted, or not the author (and not admin).
      return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("[feed/comments] DELETE failed:", error);
    return NextResponse.json({ success: false, message: "Failed to delete comment" }, { status: 500 });
  }
}
