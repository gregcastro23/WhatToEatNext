/**
 * POST /api/chat/conversations/[id]/mute — set the caller's per-conversation
 * notification level (all / mentions / none). Notifications only — a muted
 * conversation still shows unread; it just stops emitting notification rows.
 * docs/plans/pr3-messaging-plan.md §3/§4.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { muteSchema } from "@/lib/chat/schemas";
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

    const rl = await rateLimit(request, { window: 60_000, max: 20, bucket: "chat-mute", identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }
    const parsed = muteSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const ok = await chatDatabase.setNotifyLevel(conversationId, userId, parsed.data.notifyLevel);
    if (!ok) {
      return NextResponse.json({ success: false, message: "This conversation is not available." }, { status: 403 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat mute POST error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
