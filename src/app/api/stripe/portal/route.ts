/**
 * Stripe Customer Portal API
 *
 * Creates a Stripe billing portal session for subscription management.
 *
 * @file src/app/api/stripe/portal/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sub = await subscriptionService.getOrCreateSubscription(
      session.user.id,
    );

    if (!sub.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe first." },
        { status: 400 },
      );
    }

    const { getStripe } = await import("@/lib/stripe/stripe");
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${appUrl}/premium`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[api/stripe/portal] Error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 },
    );
  }
}
