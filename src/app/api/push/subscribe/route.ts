/**
 * POST   /api/push/subscribe  {subscription:{endpoint, keys:{p256dh, auth}}}
 * DELETE /api/push/subscribe  {endpoint}
 *
 * Manages a device's web-push subscription. Subscriptions are ALWAYS accepted
 * (even when WEB_PUSH_ENABLED is unset — the kill switch only gates SENDING), so
 * flipping push on later reaches devices that already opted in. Upsert keys on
 * the unique endpoint: ON CONFLICT reassigns user_id (covers a device that
 * switches accounts).
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import {
  PushSubscribeRequestSchema,
  PushUnsubscribeRequestSchema,
} from "@/lib/validation/apiSchemas";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 10, bucket: "push-subscribe", identifier: userId });
  if (!rl.allowed) {
    return (
      rl.response ??
      NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 })
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = PushSubscribeRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ success: false, message: "A valid subscription is required" }, { status: 400 });
  }

  const { endpoint, keys: { p256dh, auth } } = parsed.data.subscription;
  const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;

  try {
    await executeQuery(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent, last_used_at)
       VALUES ($1::uuid, $2, $3, $4, $5, now())
       ON CONFLICT ON CONSTRAINT uniq_push_endpoint
       DO UPDATE SET user_id = EXCLUDED.user_id,
                     p256dh = EXCLUDED.p256dh,
                     auth = EXCLUDED.auth,
                     user_agent = EXCLUDED.user_agent,
                     last_used_at = now()`,
      [userId, endpoint, p256dh, auth, userAgent],
    );
    return NextResponse.json({ success: true, subscribed: true });
  } catch (error) {
    _logger.error("[push/subscribe] POST failed:", error);
    return NextResponse.json({ success: false, message: "Failed to save subscription" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 10, bucket: "push-subscribe", identifier: userId });
  if (!rl.allowed) {
    return (
      rl.response ??
      NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 })
    );
  }

  let endpoint: string | null = null;
  try {
    const rawBody: unknown = await request.json();
    const parsed = PushUnsubscribeRequestSchema.safeParse(rawBody);
    if (parsed.success) {
      ({ endpoint } = parsed.data);
    }
  } catch {
    endpoint = new URL(request.url).searchParams.get("endpoint");
  }
  if (!endpoint) {
    return NextResponse.json({ success: false, message: "endpoint is required" }, { status: 400 });
  }

  try {
    // Scope the delete to the caller so one user can't drop another's row.
    await executeQuery(
      "DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2::uuid",
      [endpoint, userId],
    );
    return NextResponse.json({ success: true, subscribed: false });
  } catch (error) {
    _logger.error("[push/subscribe] DELETE failed:", error);
    return NextResponse.json({ success: false, message: "Failed to remove subscription" }, { status: 500 });
  }
}
