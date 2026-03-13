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

        if (userId && session.subscription && session.customer) {
          await subscriptionService.updateSubscription(userId, {
            tier,
            status: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          });
          console.log(
            `[webhook] Checkout completed: user=${userId} tier=${tier}`,
          );
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        if (customerId) {
          const sub =
            await subscriptionService.getSubscriptionByStripeCustomerId(
              customerId,
            );
          if (sub) {
            await subscriptionService.updateSubscription(sub.userId, {
              status: "active",
              currentPeriodStart: new Date(
                (invoice.period_start || 0) * 1000,
              ).toISOString(),
              currentPeriodEnd: new Date(
                (invoice.period_end || 0) * 1000,
              ).toISOString(),
            });
            console.log(`[webhook] Invoice paid: user=${sub.userId}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        if (customerId) {
          const sub =
            await subscriptionService.getSubscriptionByStripeCustomerId(
              customerId,
            );
          if (sub) {
            await subscriptionService.updateSubscription(sub.userId, {
              status: "past_due",
            });
            console.log(`[webhook] Payment failed: user=${sub.userId}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        if (customerId) {
          const sub =
            await subscriptionService.getSubscriptionByStripeCustomerId(
              customerId,
            );
          if (sub) {
            await subscriptionService.updateSubscription(sub.userId, {
              status: subscription.status as "active" | "past_due" | "canceled",
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              currentPeriodStart: new Date(
                (subscription.current_period_start || 0) * 1000,
              ).toISOString(),
              currentPeriodEnd: new Date(
                (subscription.current_period_end || 0) * 1000,
              ).toISOString(),
            });
            console.log(`[webhook] Subscription updated: user=${sub.userId}`);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        if (customerId) {
          const sub =
            await subscriptionService.getSubscriptionByStripeCustomerId(
              customerId,
            );
          if (sub) {
            await subscriptionService.updateSubscription(sub.userId, {
              tier: "starter",
              status: "canceled",
              stripeSubscriptionId: null as unknown as string,
            });
            console.log(`[webhook] Subscription deleted: user=${sub.userId}`);
          }
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
