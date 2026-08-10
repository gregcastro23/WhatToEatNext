/**
 * The Stripe events this codebase actually handles.
 *
 * This is the single source of truth for what the Dashboard endpoint must be
 * subscribed to. It exists because the two halves of a webhook integration live
 * in different systems: the `switch` in `src/app/api/stripe/webhook/route.ts`
 * decides what we CAN process, and the Stripe Dashboard decides what we ever
 * RECEIVE. Neither one can see the other.
 *
 * A mismatch is silent in the worst direction. If the Dashboard is not sending
 * `checkout.session.async_payment_succeeded`, no error is raised anywhere — the
 * customer is charged, the code that would pay the restaurant simply never runs,
 * and the order sits in `payment_pending` looking like an abandoned checkout.
 *
 * `stripeWebhookCoverageService` diffs this list against the live endpoint so
 * that gap shows up on the admin board instead of in a support ticket. A unit
 * test keeps this list and the route's `switch` in step.
 *
 * @file src/lib/stripe/handledEvents.ts
 */

export interface HandledStripeEvent {
  /** The Stripe event type, exactly as it appears in the Dashboard. */
  readonly type: string;
  /** Which money path breaks if this event is not delivered. */
  readonly why: string;
  /**
   * Whether losing this event costs money or fulfilment, as opposed to leaving
   * a record slightly stale. Drives INCIDENT vs DEGRADED on the admin board.
   */
  readonly critical: boolean;
}

export const HANDLED_STRIPE_EVENTS: readonly HandledStripeEvent[] = [
  {
    type: "checkout.session.completed",
    why: "Settles card restaurant orders, MCP top-ups and subscription starts.",
    critical: true,
  },
  {
    type: "checkout.session.async_payment_succeeded",
    why: "The ONLY signal that a crypto order was paid. Without it the customer is charged, the restaurant is never transferred to, and fulfilment never runs.",
    critical: true,
  },
  {
    type: "checkout.session.async_payment_failed",
    why: "Marks a failed crypto order terminal instead of leaving it mid-flight.",
    critical: true,
  },
  {
    type: "account.updated",
    why: "Connect onboarding state — charges_enabled/payouts_enabled. Without it a restaurant that finished onboarding still reads as pending and cannot be paid out.",
    critical: true,
  },
  {
    type: "customer.subscription.updated",
    why: "Keeps local subscription status and period in sync.",
    critical: false,
  },
  {
    type: "customer.subscription.deleted",
    why: "Downgrades a cancelled subscriber to free.",
    critical: false,
  },
  {
    type: "invoice.payment_succeeded",
    why: "Extends the paid period on renewal.",
    critical: false,
  },
  {
    type: "invoice.payment_failed",
    why: "Marks a subscriber past_due.",
    critical: false,
  },
] as const;

/** Event type strings only — convenient for set arithmetic. */
export const HANDLED_STRIPE_EVENT_TYPES: readonly string[] =
  HANDLED_STRIPE_EVENTS.map((e) => e.type);

/** The subset whose absence costs money or fulfilment. */
export const CRITICAL_STRIPE_EVENT_TYPES: readonly string[] =
  HANDLED_STRIPE_EVENTS.filter((e) => e.critical).map((e) => e.type);
