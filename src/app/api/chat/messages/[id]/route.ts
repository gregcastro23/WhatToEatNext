/**
 * DELETE /api/chat/messages/[id] — soft delete (sender / conversation host /
 * admin). The body is retained in Postgres for the moderation window but every
 * read path returns a tombstone. docs/plans/pr3-messaging-plan.md §4.
 */

import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/adminEmails";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { chatDatabase } from "@/services/chatDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: messageId } = await params;
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const rl = await rateLimit(request, { window: 60_000, max: 30, bucket: "chat-delete", identifier: userId });
    if (!rl.allowed) return rl.response!;

    const isAdmin = isAdminEmail(user?.email);
    const result = await chatDatabase.softDeleteMessage(messageId, userId, { isAdmin });
    if (!result.ok) {
      const status = result.reason === "not_found" ? 404 : 403;
      const message = result.reason === "not_found" ? "Message not found" : "You can't remove this message.";
      return NextResponse.json({ success: false, message }, { status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat message DELETE error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
