/**
 * POST /api/chat/messages/[id]/report — file a report (unique per reporter);
 * the message auto-hides at 3 distinct reporters (enforced in the service, one
 * transaction). docs/plans/pr3-messaging-plan.md §4.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { reportSchema } from "@/lib/chat/schemas";
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
    const { id: messageId } = await params;
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const rl = await rateLimit(request, { window: 60_000, max: 5, bucket: "chat-report", identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }
    const parsed = reportSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const result = await chatDatabase.reportMessage(
      messageId,
      userId,
      parsed.data.reason,
      parsed.data.detail,
    );
    if (!result.ok) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }

    // Neutral response — never disclose the aggregate flag count or hide state.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat report POST error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
