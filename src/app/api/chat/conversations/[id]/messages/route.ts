/**
 * /api/chat/conversations/[id]/messages
 *   GET  — keyset pagination (?limit=50&before=cursor), newest first.
 *   POST — send a message through the server pipeline (auth → enforcement →
 *          photo → idempotent insert → notify/practices).
 *
 * docs/plans/pr3-messaging-plan.md §3. The POST response carries the canonical
 * message + its UUID; the CLIENT (only for kind='table') mirrors it into
 * SpacetimeDB afterward. This route NEVER touches Spacetime.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { decodeCursor, encodeCursor, sendMessageSchema } from "@/lib/chat/schemas";
import { sendChatMessage } from "@/lib/chat/sendMessage";
import { rateLimit } from "@/lib/rateLimit";
import { chatDatabase } from "@/services/chatDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const rl = await rateLimit(request, { window: 60_000, max: 120, bucket: "chat-msg-get", identifier: userId });
    if (!rl.allowed) return rl.response!;

    // Membership gate — a non-member (or kicked member) cannot read.
    const membership = await chatDatabase.getMembership(conversationId, userId);
    if (!membership || membership.banned || membership.leftAt) {
      return NextResponse.json({ success: false, message: "This conversation is not available." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 50, 1), 100);
    const before = decodeCursor(searchParams.get("before"));

    const messages = await chatDatabase.listMessages(conversationId, userId, {
      limit,
      before: before ?? undefined,
    });

    const oldest = messages[messages.length - 1];
    const nextCursor =
      messages.length === limit && oldest
        ? encodeCursor({ createdAt: oldest.createdAt, id: oldest.id })
        : null;

    return NextResponse.json({ success: true, messages, nextCursor, viewerId: userId });
  } catch (error) {
    console.error("Chat messages GET error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: conversationId } = await params;
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Two windows: 20/min sustained + 5/10s burst.
    const rlMin = await rateLimit(request, { window: 60_000, max: 20, bucket: "chat-send-min", identifier: userId });
    if (!rlMin.allowed) return rlMin.response!;
    const rlBurst = await rateLimit(request, { window: 10_000, max: 5, bucket: "chat-send-burst", identifier: userId });
    if (!rlBurst.allowed) return rlBurst.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = sendMessageSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const outcome = await sendChatMessage({
      conversationId,
      senderId: userId,
      body: parsed.data.body,
      clientKey: parsed.data.clientKey,
      replyToId: parsed.data.replyToId,
      attachmentDataUrl: parsed.data.attachmentDataUrl,
    });

    if (!outcome.ok) {
      return NextResponse.json({ success: false, message: outcome.message }, { status: outcome.status });
    }

    return NextResponse.json(
      {
        success: true,
        message: outcome.message,
        conversationKind: outcome.conversation.kind,
        replay: outcome.replay,
      },
      { status: outcome.replay ? 200 : 201 },
    );
  } catch (error) {
    console.error("Chat messages POST error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
