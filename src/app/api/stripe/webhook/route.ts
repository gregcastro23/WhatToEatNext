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

/**
 * Extract current_period_start/end from a Stripe Subscription.
 * In Stripe SDK v20+ these fields live on SubscriptionItem, not Subscription.
 */
function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  currentPeriodStart: string;
  currentPeriodEnd: string;
} {
  const firstItem = subscription.items?.data?.[0];
  if (firstItem) {
    return {
      currentPeriodStart: new Date(firstItem.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(firstItem.current_period_end * 1000).toISOString(),
    };
  }
  // Fallback: default to now → +1 year
  return {
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Extract the subscription ID from a Stripe Invoice (Stripe SDK v20+).
 * In v20 the `subscription` top-level field was removed; the data now lives
 * under `invoice.parent.subscription_details.subscription`.
 */
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails?.subscription) return null;
  return typeof subDetails.subscription === "string"
    ? subDetails.subscription
    : subDetails.subscription.id;
}

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
          let stripeSubscriptionId: string | null = null;

          if (session.subscription) {
            stripeSubscriptionId = typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
            const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
            const period = getSubscriptionPeriod(sub);
            currentPeriodStart = period.currentPeriodStart;
            currentPeriodEnd = period.currentPeriodEnd;
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
        const period = getSubscriptionPeriod(subscription);

        const sub = await subscriptionService.getSubscriptionByStripeCustomerId(stripeCustomerId);
        if (sub) {
          await subscriptionService.updateSubscription(sub.userId, {
            status: subscription.status as SubscriptionStatus,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: period.currentPeriodStart,
            currentPeriodEnd: period.currentPeriodEnd,
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
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const stripeCustomerId = invoice.customer as string;
          const period = getSubscriptionPeriod(subscription);

          const sub = await subscriptionService.getSubscriptionByStripeCustomerId(stripeCustomerId);
          if (sub) {
            await subscriptionService.updateSubscription(sub.userId, {
              status: "active",
              currentPeriodStart: period.currentPeriodStart,
              currentPeriodEnd: period.currentPeriodEnd,
            });
            console.log(`[webhook] Invoice paid, period extended: ${subscriptionId}`);
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
