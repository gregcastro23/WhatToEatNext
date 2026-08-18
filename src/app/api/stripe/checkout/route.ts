/**
 * Stripe Checkout Session API
 *
 * Creates a Stripe Checkout session for subscription upgrades.
 *
 * @file src/app/api/stripe/checkout/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";
import { subscriptionService } from "@/services/subscriptionService";
import type { SubscriptionTier } from "@/types/subscription";
import { TIER_LIMITS } from "@/types/subscription";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await rateLimit(request, {
    window: 60_000,
    max: 10,
    bucket: "stripe-checkout",
    identifier: session.user.id,
  });
  if (!rl.allowed) return rl.response!;

  try {
    const body = await request.json();
    const targetTier = body.tier as SubscriptionTier;
    const wantsTrial = body.trial === true;

    if (!targetTier || !TIER_LIMITS[targetTier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const tierConfig = TIER_LIMITS[targetTier];
    if (!tierConfig.stripePriceId) {
      return NextResponse.json(
        { error: "No Stripe price configured for this tier" },
        { status: 400 },
      );
    }

    // Trials are only offered to users who have never had a Stripe subscription.
    // The presence of a stripeSubscriptionId means they've already used (or canceled) one.
    let trialEligible = false;
    if (wantsTrial && targetTier === "premium") {
      const existing = await subscriptionService
        .getOrCreateSubscription(session.user.id)
        .catch(() => null);
      trialEligible = !existing?.stripeSubscriptionId;
    }

    // Lazy-import Stripe to keep it server-only
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: tierConfig.stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/premium?checkout=success&tier=${targetTier}${trialEligible ? "&trial=true" : ""}`,
      cancel_url: `${appUrl}/premium?checkout=canceled`,
      ...(trialEligible
        ? { subscription_data: { trial_period_days: 7 } }
        : {}),
      metadata: {
        purpose: "subscription",
        userId: session.user.id,
        tier: targetTier,
        trial: trialEligible ? "true" : "false",
      },
    });

    return NextResponse.json({ url: checkoutSession.url, trial: trialEligible });
  } catch (error) {
    console.error("[api/stripe/checkout] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
