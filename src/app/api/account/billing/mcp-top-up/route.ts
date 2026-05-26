/**
 * POST /api/account/billing/mcp-top-up — create a Stripe Checkout
 * session for one of the three MCP top-up SKUs.
 *
 * One-shot (`mode: 'payment'`) — these are non-recurring ESMS bundles,
 * not subscriptions. The session's metadata carries `purpose: 'mcp_top_up'`
 * and the SKU so the webhook handler can credit the right amounts on
 * `checkout.session.completed`.
 *
 * @file src/app/api/account/billing/mcp-top-up/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import {
  findSku,
  MCP_TOP_UP_PURPOSE,
  type McpTopUpSku,
} from "@/lib/billing/mcpTopUp";
import { rateLimit } from "@/lib/rateLimit";
import { getSelfBaseUrl } from "@/utils/urlUtils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MCP_TOP_UP_LIMIT = {
  window: 60_000,
  max: 10,
  bucket: "billing:mcp-top-up",
};

export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, MCP_TOP_UP_LIMIT);
  if (!rl.allowed) return rl.response!;

  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: { sku?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const sku = typeof body.sku === "string" ? body.sku : "";
  const def = findSku(sku);
  if (!def) {
    return NextResponse.json(
      { success: false, error: `Unknown sku: ${sku}` },
      { status: 400 },
    );
  }
  if (!def.stripePriceId) {
    return NextResponse.json(
      {
        success: false,
        error:
          "This SKU is not configured for purchase yet. Try again later.",
      },
      { status: 503 },
    );
  }

  try {
    const { getStripe } = await import("@/lib/stripe/stripe");
    const stripe = getStripe();

    // Reuse the existing Stripe customer from the subscription row when
    // present so checkout history stays attached to one customer record.
    const { subscriptionService } = await import(
      "@/services/subscriptionService"
    );
    const sub = await subscriptionService.getOrCreateSubscription(userId);

    // The customer may not exist yet (first purchase). When it's null,
    // pass undefined and let Stripe create one keyed to the userId in
    // metadata — the webhook picks it up.
    const customerId = sub.stripeCustomerId ?? undefined;
    const appUrl = getSelfBaseUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: def.stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/account/billing/mcp?status=success&sku=${encodeURIComponent(def.sku)}`,
      cancel_url: `${appUrl}/account/billing/mcp?status=canceled`,
      metadata: {
        purpose: MCP_TOP_UP_PURPOSE,
        sku: def.sku satisfies McpTopUpSku,
        userId,
        esmsPerAxis: String(def.esmsPerAxis),
      },
      // Idempotency: a retry from the client with the same userId+sku
      // returns the same session rather than spawning duplicates.
      // Granularity is per-minute so a customer can still re-attempt
      // after canceling out of the first session.
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      sku: def.sku,
      priceCents: def.priceCents,
      esmsPerAxis: def.esmsPerAxis,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
        detail:
          process.env.NODE_ENV === "development"
            ? String(err)
            : undefined,
      },
      { status: 500 },
    );
  }
}
