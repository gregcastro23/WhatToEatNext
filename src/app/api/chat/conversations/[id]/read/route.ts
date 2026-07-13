/**
 * POST /api/chat/conversations/[id]/read — set the viewer's last_read marker
 * and clear that conversation's chat notifications (dm_message/circle_message).
 * docs/plans/pr3-messaging-plan.md §3.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { markReadSchema } from "@/lib/chat/schemas";
import { rateLimit } from "@/lib/rateLimit";
import { chatDatabase } from "@/services/chatDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "chat-read", identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown = {};
    try {
      rawBody = await request.json();
    } catch {
      // empty body is fine — just stamp "now".
    }
    const parsed = markReadSchema.safeParse(rawBody ?? {});
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const ok = await chatDatabase.markRead(conversationId, userId, parsed.data.messageId);
    if (!ok) {
      return NextResponse.json({ success: false, message: "This conversation is not available." }, { status: 403 });
    }

    // Clear this conversation's deduped chat notification rows (best-effort);
    // the /api/chat/unread aggregate stays authoritative for the badge.
    try {
      const { notificationDatabase } = await import("@/services/notificationDatabaseService");
      await notificationDatabase.clearChatNotifications(userId, conversationId);
    } catch {
      // Non-critical — unread endpoint is the source of truth.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat read POST error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
