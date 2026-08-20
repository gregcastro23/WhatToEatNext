/**
 * Stripe Token Package Checkout API
 *
 * Creates a Stripe Checkout session for one-time ESMS token package purchases.
 *
 * @file src/app/api/stripe/checkout-tokens/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { findSku, TOKEN_PACKAGE_PURPOSE } from "@/lib/billing/mcpTopUp";
import { rateLimit } from "@/lib/rateLimit";
import { subscriptionService } from "@/services/subscriptionService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(request, {
    window: 60_000,
    max: 10,
    bucket: "stripe-checkout-tokens",
    identifier: session.user.id,
  });
  if (!rl.allowed) return rl.response!;

  try {
    const body = await request.json().catch(() => ({}));
    const { sku } = body;

    if (!sku || typeof sku !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid token package SKU" },
        { status: 400 },
      );
    }

    const packageDef = findSku(sku);
    if (!packageDef) {
      return NextResponse.json(
        { error: `Unknown token package SKU: ${sku}` },
        { status: 404 },
      );
    }

    if (!packageDef.stripePriceId && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "No Stripe price configured for this token package" },
        { status: 400 },
      );
    }

    const { getStripe } = await import("@/lib/stripe/stripe");
    const stripe = getStripe();

    // Get or create Stripe customer
    const sub = await subscriptionService.getOrCreateSubscription(
      session.user.id,
    );

    let customerId = sub.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await subscriptionService.updateSubscription(session.user.id, {
        stripeCustomerId: customerId,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const lineItems = packageDef.stripePriceId
      ? [{ price: packageDef.stripePriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: packageDef.label,
                description: `${packageDef.esmsPerAxis * 4} Total ESMS Tokens (${packageDef.esmsPerAxis} per Spirit/Essence/Matter/Substance axis)`,
              },
              unit_amount: packageDef.priceCents,
            },
            quantity: 1,
          },
        ];

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: lineItems,
      success_url: `${appUrl}/vault?checkout=success&sku=${packageDef.sku}`,
      cancel_url: `${appUrl}/vault?checkout=canceled`,
      metadata: {
        purpose: TOKEN_PACKAGE_PURPOSE,
        userId: session.user.id,
        sku: packageDef.sku,
      },
    });

    return NextResponse.json({ url: checkoutSession.url, sku: packageDef.sku });
  } catch (error) {
    console.error("[api/stripe/checkout-tokens] Error:", error);
    return NextResponse.json(
      { error: "Failed to create token checkout session" },
      { status: 500 },
    );
  }
}
