/**
 * POST /api/chat/conversations/[id]/moderate — host-only kick / mute / unmute
 * / archive. docs/plans/pr3-messaging-plan.md §4. The host powers here are the
 * Postgres-authoritative half; the live plane mirrors them best-effort from
 * the host's own client (the module reducers are separately host-gated).
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { moderateSchema } from "@/lib/chat/schemas";
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

    const rl = await rateLimit(request, { window: 60_000, max: 20, bucket: "chat-moderate", identifier: userId });
    if (!rl.allowed) return rl.response!;

    // Host gate: the caller must hold role='host' in this conversation.
    const membership = await chatDatabase.getMembership(conversationId, userId);
    if (!membership || membership.role !== "host" || membership.leftAt || membership.banned) {
      return NextResponse.json({ success: false, message: "Only the host can moderate this conversation." }, { status: 403 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }
    const parsed = moderateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }
    const action = parsed.data;

    // A host cannot moderate themselves.
    if ("userId" in action && action.userId === userId) {
      return NextResponse.json({ success: false, message: "You can't moderate yourself." }, { status: 400 });
    }

    let ok = false;
    switch (action.action) {
      case "kick":
        ok = await chatDatabase.kickMember(conversationId, action.userId);
        break;
      case "mute": {
        const until = new Date(Date.now() + action.minutes * 60_000).toISOString();
        ok = await chatDatabase.setHostMute(conversationId, action.userId, until);
        break;
      }
      case "unmute":
        ok = await chatDatabase.setHostMute(conversationId, action.userId, null);
        break;
      case "archive":
        ok = await chatDatabase.archiveConversation(conversationId);
        break;
    }

    if (!ok) {
      return NextResponse.json({ success: false, message: "That action could not be applied." }, { status: 409 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat moderate POST error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
