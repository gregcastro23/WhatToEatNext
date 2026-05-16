/**
 * Stripe Webhook Handler
 *
 * Processes Stripe events to keep subscription state in sync.
 * Handles: checkout.session.completed, invoice.paid, invoice.payment_failed,
 * customer.subscription.updated, customer.subscription.deleted
 *
 * @file src/app/api/stripe/webhook/route.ts
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { triggerOrderFulfillment } from "@/lib/orders/fulfillment";
import type { SubscriptionTier, SubscriptionStatus } from "@/types/subscription";
import type Stripe from "stripe";

/**
 * Extract current_period_start/end from a Stripe Subscription.
 * In Stripe SDK v20+ these fields live on SubscriptionItem, not Subscription.
 */
interface SubscriptionPeriodCarrier {
  items?: {
    data?: Array<{
      current_period_start?: number | null;
      current_period_end?: number | null;
    }>;
  };
}

interface InvoiceSubscriptionCarrier {
  parent?: {
    subscription_details?: {
      subscription?: string | { id: string } | null;
    } | null;
  } | null;
}

function getSubscriptionPeriod(subscription: SubscriptionPeriodCarrier): {
  currentPeriodStart: string;
  currentPeriodEnd: string;
} {
  const firstItem = subscription.items?.data?.[0];
  if (
    firstItem &&
    typeof firstItem.current_period_start === "number" &&
    typeof firstItem.current_period_end === "number"
  ) {
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
function getInvoiceSubscriptionId(invoice: InvoiceSubscriptionCarrier): string | null {
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails?.subscription) return null;
  return typeof subDetails.subscription === "string"
    ? subDetails.subscription
    : subDetails.subscription.id;
}

async function updateRestaurantOrderIntent(input: {
  orderId: string;
  status: string;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeTransferId?: string | null;
  paymentStatus?: string | null;
  transferStatus?: string | null;
  metadata?: Record<string, unknown>;
  completed?: boolean;
}) {
  try {
    const { executeQuery } = await import("@/lib/database/connection");
    await executeQuery(
      `UPDATE restaurant_order_intents
       SET status = $2,
           stripe_checkout_session_id = COALESCE($3, stripe_checkout_session_id),
           stripe_payment_intent_id = COALESCE($4, stripe_payment_intent_id),
           stripe_transfer_id = COALESCE($5, stripe_transfer_id),
           payment_status = COALESCE($6, payment_status),
           transfer_status = COALESCE($7, transfer_status),
           metadata = metadata || $8::jsonb,
           completed_at = CASE WHEN $9 THEN NOW() ELSE completed_at END,
           updated_at = NOW()
       WHERE id = $1`,
      [
        input.orderId,
        input.status,
        input.stripeCheckoutSessionId ?? null,
        input.stripePaymentIntentId ?? null,
        input.stripeTransferId ?? null,
        input.paymentStatus ?? null,
        input.transferStatus ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.completed === true,
      ],
    );
  } catch (error) {
    console.warn(
      "[webhook] Restaurant order intent was not updated:",
      error instanceof Error ? error.message : error,
    );
  }
}

async function updateRestaurantConnectStatus(account: Stripe.Account) {
  try {
    const { executeQuery } = await import("@/lib/database/connection");
    const onboardingStatus =
      account.charges_enabled && account.payouts_enabled
        ? "active"
        : account.details_submitted
          ? "submitted"
          : "pending";

    await executeQuery(
      `UPDATE restaurants
       SET onboarding_status = $2,
           charges_enabled = $3,
           payouts_enabled = $4,
           details_submitted = $5,
           metadata = metadata || $6::jsonb,
           updated_at = NOW()
       WHERE stripe_connect_account_id = $1`,
      [
        account.id,
        onboardingStatus,
        account.charges_enabled,
        account.payouts_enabled,
        account.details_submitted,
        JSON.stringify({
          requirements: account.requirements ?? null,
          futureRequirements: account.future_requirements ?? null,
        }),
      ],
    );
  } catch (error) {
    console.warn(
      "[webhook] Restaurant Connect status was not updated:",
      error instanceof Error ? error.message : error,
    );
  }
}

function metadataInt(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function latestChargeId(paymentIntent: Stripe.PaymentIntent): string | null {
  const charge = paymentIntent.latest_charge;
  if (!charge) return null;
  return typeof charge === "string" ? charge : charge.id;
}

async function handleRestaurantOrderCheckout(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.warn(`[webhook] Restaurant order session ${session.id} missing orderId`);
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  if (session.payment_status !== "paid") {
    await updateRestaurantOrderIntent({
      orderId,
      status: "payment_pending",
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      paymentStatus: session.payment_status,
      transferStatus: "waiting_for_paid_status",
      metadata: {
        checkoutStatus: session.status,
        paymentStatus: session.payment_status,
      },
    });
    console.log(
      `[webhook] Restaurant order pending payment: order=${orderId} session=${session.id} payment_status=${session.payment_status}`,
    );
    return;
  }

  const metadata = session.metadata ?? {};
  const splitMode = metadata.splitMode;
  const connectedAccountId = metadata.stripeConnectedAccountId;
  const transferAmountCents = metadataInt(metadata.transferAmountCents);
  const transferGroup = metadata.transferGroup || `restaurant_order_${orderId}`;
  let transferId: string | null = null;
  let transferStatus: string | null = null;

  if (
    splitMode === "separate_charges_and_transfers" &&
    connectedAccountId &&
    transferAmountCents > 0 &&
    paymentIntentId
  ) {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });
    const chargeId = latestChargeId(paymentIntent);

    if (chargeId) {
      const transfer = await stripe.transfers.create(
        {
          amount: transferAmountCents,
          currency: paymentIntent.currency,
          destination: connectedAccountId,
          transfer_group: transferGroup,
          source_transaction: chargeId,
          metadata: {
            purpose: "restaurant_order_transfer",
            orderId,
            restaurantName: metadata.restaurantName ?? "",
            provider: metadata.provider ?? "unknown",
          },
        },
        { idempotencyKey: `restaurant_order_transfer_${orderId}` },
      );
      transferId = transfer.id;
      transferStatus = "created";
    } else {
      transferStatus = "pending_charge";
    }
  } else if (splitMode === "destination_charge" && connectedAccountId) {
    transferStatus = "destination_charge";
  }

  await updateRestaurantOrderIntent({
    orderId,
    status: "paid",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    stripeTransferId: transferId,
    paymentStatus: session.payment_status,
    transferStatus,
    completed: true,
    metadata: {
      checkoutStatus: session.status,
      paymentStatus: session.payment_status,
      splitMode,
      transferGroup,
    },
  });

  console.log(
    `[webhook] Restaurant order completed: order=${orderId} session=${session.id} transfer=${transferId ?? transferStatus ?? "none"}`,
  );

  try {
    await triggerOrderFulfillment(orderId);
  } catch (error) {
    console.error(
      `[webhook] Restaurant fulfillment failed after payment: order=${orderId}`,
      error,
    );
  }
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
        const session = event.data.object;
        if (session.mode !== "subscription") {
          if (session.metadata?.purpose === "restaurant_order") {
            await handleRestaurantOrderCheckout(stripe, session);
          }
          break;
        }

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
        const subscription = event.data.object;
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

      case "account.updated": {
        const account = event.data.object;
        await updateRestaurantConnectStatus(account);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
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
        const invoice = event.data.object;
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
        const invoice = event.data.object;
        const stripeCustomerId = invoice.customer as string;

        const sub = await subscriptionService.getSubscriptionByStripeCustomerId(stripeCustomerId);
        if (sub) {
          // Downgrade to free immediately so server-side DB checks return the
          // correct tier while the JWT (which caches the old tier for up to 24h)
          // is still in circulation.
          await subscriptionService.updateSubscription(sub.userId, {
            tier: "free",
            status: "past_due",
          });
          console.log(`[webhook] Invoice payment failed: ${invoice.id} for user=${sub.userId} — downgraded to free`);
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
