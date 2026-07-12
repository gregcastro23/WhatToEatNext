/**
 * POST /api/chat/spacetime-identity — bind the caller's SpacetimeDB browser
 * identity (multi-device convenience/telemetry ONLY; authorization stays in
 * the module reducers). docs/plans/pr3-messaging-plan.md §3/§5.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { bindIdentitySchema } from "@/lib/chat/schemas";
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

    const rl = await rateLimit(request, { window: 60_000, max: 5, bucket: "chat-identity", identifier: userId });
    if (!rl.allowed) return rl.response!;

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }
    const parsed = bindIdentitySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    }

    const ok = await chatDatabase.bindSpacetimeIdentity(userId, parsed.data.identityHex);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error("Chat spacetime-identity POST error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
