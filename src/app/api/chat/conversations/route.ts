/**
 * /api/chat/conversations
 *   POST — ensure/create a conversation by kind (table / dm / circle).
 *   GET  — the viewer's inbox (memberships + preview + unread).
 *
 * docs/plans/pr3-messaging-plan.md §3. DM/circle creation is server-flag-gated
 * (CHAT_DMS_ENABLED / CHAT_CIRCLES_ENABLED); table conversations are ensured
 * server-side at go-live, so POST here for a table is a healing no-op path.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { isCirclesEnabledServer, isDmsEnabledServer } from "@/lib/chat/flags";
import { ensureConversationSchema } from "@/lib/chat/schemas";
import { rateLimit } from "@/lib/rateLimit";
import { chatDatabase } from "@/services/chatDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const rl = await rateLimit(request, { window: 60_000, max: 10, bucket: "chat-conv", identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const parsed = ensureConversationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }
    const data = parsed.data;

    if (data.kind === "table") {
      const conversation = await chatDatabase.ensureTableConversation(data.tableId);
      if (!conversation) {
        return NextResponse.json(
          { success: false, message: "This table has no live discussion." },
          { status: 404 },
        );
      }
      // Heal a late joiner's membership row.
      await chatDatabase.ensureTableMembership(conversation.id, data.tableId, userId);
      const membership = await chatDatabase.getMembership(conversation.id, userId);
      if (!membership || membership.banned || membership.leftAt) {
        return NextResponse.json(
          { success: false, message: "This conversation is not available." },
          { status: 403 },
        );
      }
      return NextResponse.json({ success: true, conversation }, { status: 200 });
    }

    if (data.kind === "dm") {
      if (!isDmsEnabledServer()) {
        return NextResponse.json({ success: false, message: "Direct messages are not open yet." }, { status: 403 });
      }
      if (data.otherUserId === userId) {
        return NextResponse.json({ success: false, message: "You can't message yourself." }, { status: 400 });
      }
      if (await chatDatabase.isBlockedBetween(userId, data.otherUserId)) {
        return NextResponse.json({ success: false, message: "This conversation is not available." }, { status: 403 });
      }
      if (!(await chatDatabase.hasAcceptedCommensalship(userId, data.otherUserId))) {
        return NextResponse.json(
          { success: false, message: "Direct messages are between linked companions." },
          { status: 403 },
        );
      }
      const conversation = await chatDatabase.ensureDmConversation(userId, data.otherUserId);
      if (!conversation) {
        return NextResponse.json({ success: false, message: "Could not open that conversation." }, { status: 500 });
      }
      return NextResponse.json({ success: true, conversation }, { status: 200 });
    }

    // circle
    if (!isCirclesEnabledServer()) {
      return NextResponse.json({ success: false, message: "Circles are not open yet." }, { status: 403 });
    }
    const conversation = await chatDatabase.createCircleConversation(userId, data.title, data.memberIds);
    if (!conversation) {
      return NextResponse.json({ success: false, message: "Could not create that circle." }, { status: 500 });
    }
    return NextResponse.json({ success: true, conversation }, { status: 201 });
  } catch (error) {
    console.error("Chat conversations POST error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "chat-inbox", identifier: userId });
    if (!rl.allowed) return rl.response!;

    const inbox = await chatDatabase.listInbox(userId);
    return NextResponse.json({ success: true, conversations: inbox });
  } catch (error) {
    console.error("Chat conversations GET error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
