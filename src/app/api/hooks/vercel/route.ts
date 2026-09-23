/**
 * POST /api/hooks/vercel — Vercel account webhook (deployment lifecycle).
 *
 * Verify `x-vercel-signature` (HMAC-SHA1 of the raw body, VERCEL_WEBHOOK_SECRET)
 * → record in webhook_events (the event id makes redeliveries idempotent)
 * → dispatch by type (src/lib/hooks/vercel/deploymentHandlers.ts).
 *
 * Responses: 401 bad/missing signature · 400 not a Vercel envelope ·
 * 503 secret not configured (Vercel keeps retrying for 24h, so events sent
 * before the secret lands are not lost) · 500 handler failed (Vercel retries)
 * · 200 processed / ignored / duplicate.
 *
 * Register with `vercel webhooks create https://alchm.kitchen/api/hooks/vercel …`
 * (see CLAUDE.md "Webhooks").
 *
 * @file src/app/api/hooks/vercel/route.ts
 */

import { NextResponse } from "next/server";
import { dispatchHookEvent, handlerRegistry, httpStatusFor } from "@/lib/hooks/dispatcher";
import { DEPLOYMENT_HANDLERS } from "@/lib/hooks/vercel/deploymentHandlers";
import { toVercelHookEvent, verifyVercelSignature } from "@/lib/hooks/vercel/vercelEvent";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Deployment payloads are a few KB; anything this large is not from Vercel. */
const MAX_BODY_BYTES = 256 * 1024;
const REGISTRY = handlerRegistry(DEPLOYMENT_HANDLERS);

async function handleVercelHook(request: Request): Promise<NextResponse> {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    _logger.error("[hooks/vercel] VERCEL_WEBHOOK_SECRET is not set — refusing (Vercel will retry)");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  if (!verifyVercelSignature(rawBody, request.headers.get("x-vercel-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  const event = toVercelHookEvent(rawBody);
  if (!event) {
    return NextResponse.json({ error: "Not a Vercel webhook envelope" }, { status: 400 });
  }
  const outcome = await dispatchHookEvent(event, REGISTRY);
  return NextResponse.json(
    { received: true, id: event.id, type: event.type, status: outcome.status },
    { status: httpStatusFor(outcome) },
  );
}

// Request-logged like the Stripe webhook, so deliveries and rejections show up
// in request_log_entries. No user: the caller is Vercel, proven by signature.
export const POST = withObservability(
  { routeName: "/api/hooks/vercel", skipUserResolution: true },
  handleVercelHook,
);
