/**
 * Stripe Webhook Handler
 *
 * Processes Stripe events to keep subscription state in sync.
 * Handles: checkout.session.completed, invoice.paid, invoice.payment_failed,
 * customer.subscription.updated, customer.subscription.deleted
 *
 * @file src/app/api/stripe/webhook/route.ts
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { SubscriptionTier } from "@/types/subscription";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  try {
    const { getStripe } = await import("@/lib/stripe/stripe");
    const stripe = getStripe();
    const { subscriptionService } = await import(
      "@/services/subscriptionService"
    );

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = (session.metadata?.tier || "premium") as SubscriptionTier;

        if (userId && session.payment_status === "paid" && session.customer) {
          // One-time payment: grant premium for 1 year from now
          const now = new Date();
          const oneYearFromNow = new Date(now);
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

          await subscriptionService.updateSubscription(userId, {
            tier,
            status: "active",
            stripeCustomerId: session.customer as string,
            currentPeriodStart: now.toISOString(),
            currentPeriodEnd: oneYearFromNow.toISOString(),
          });
          console.log(
            `[webhook] One-time payment completed: user=${userId} tier=${tier} valid until=${oneYearFromNow.toISOString()}`,
          );
        }
        break;
      }

      case "payment_intent.succeeded": {
        // Secondary confirmation for one-time payments — no action needed
        // as checkout.session.completed is the primary handler
        console.log(`[webhook] payment_intent.succeeded received`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }
}
