/**
 * GET /api/chat/unread — {total, byConversation} for the nav badge and the
 * table-chat badge (table kind emits no notification rows — this endpoint is
 * its unread source). docs/plans/pr3-messaging-plan.md §3/§6.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { chatDatabase } from "@/services/chatDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "chat-unread", identifier: userId });
    if (!rl.allowed) return rl.response!;

    const unread = await chatDatabase.getUnread(userId);
    return NextResponse.json({ success: true, ...unread });
  } catch (error) {
    console.error("Chat unread GET error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
