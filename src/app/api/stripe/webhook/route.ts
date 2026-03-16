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
import type { SubscriptionTier, SubscriptionStatus } from "@/types/subscription";
import type Stripe from "stripe";

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

    console.log(`[webhook] Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = (session.metadata?.tier || "premium") as SubscriptionTier;

        if (userId && session.customer) {
          // Ensure record exists
          await subscriptionService.getOrCreateSubscription(userId);

          // If it was a subscription, retrieve it to get current period info
          let currentPeriodStart = new Date().toISOString();
          let currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          let stripeSubscriptionId = null;

          if (session.subscription) {
            stripeSubscriptionId = session.subscription as string;
            const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            currentPeriodStart = new Date(sub.current_period_start * 1000).toISOString();
            currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
          }

          await subscriptionService.updateSubscription(userId, {
            tier,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId,
            currentPeriodStart,
            currentPeriodEnd,
          });
          console.log(
            `[webhook] Checkout completed: user=${userId} tier=${tier} sub=${stripeSubscriptionId}`,
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;
        
        const sub = await subscriptionService.getSubscriptionByStripeCustomerId(stripeCustomerId);
        if (sub) {
          await subscriptionService.updateSubscription(sub.userId, {
            status: subscription.status as SubscriptionStatus,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
          console.log(`[webhook] Subscription updated: ${subscription.id} status=${subscription.status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeCustomerId = subscription.customer as string;

        const sub = await subscriptionService.getSubscriptionByStripeCustomerId(stripeCustomerId);
        if (sub) {
          await subscriptionService.updateSubscription(sub.userId, {
            tier: "free",
            status: "canceled",
            stripeSubscriptionId: null,
          });
          console.log(`[webhook] Subscription deleted: ${subscription.id} for user=${sub.userId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const stripeCustomerId = invoice.customer as string;

          const sub = await subscriptionService.getSubscriptionByStripeCustomerId(stripeCustomerId);
          if (sub) {
            await subscriptionService.updateSubscription(sub.userId, {
              status: "active",
              currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            });
            console.log(`[webhook] Invoice paid, period extended: ${invoice.subscription}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;

        const sub = await subscriptionService.getSubscriptionByStripeCustomerId(stripeCustomerId);
        if (sub) {
          await subscriptionService.updateSubscription(sub.userId, {
            status: "past_due",
          });
          console.log(`[webhook] Invoice payment failed: ${invoice.id} for user=${sub.userId}`);
        }
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
