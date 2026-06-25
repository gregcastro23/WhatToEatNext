/**
 * Subscription Revenue Service (server-only)
 *
 * The single source of truth for "what counts as real subscription revenue".
 * Kept out of the isomorphic subscriptionService (whose lazy DB pattern exists
 * to keep `pg` out of client bundles) — this statically imports executeQuery
 * and is only ever pulled in by server-side admin telemetry.
 *
 * @file src/services/subscriptionRevenueService.ts
 */

import { executeQuery } from "@/lib/database";

/** Monthly price of the single paid tier, in USD. Used to derive MRR. */
export const PREMIUM_MONTHLY_PRICE_USD = 24;

export interface SubscriptionRevenueBreakdown {
  /** Active subs backed by a real Stripe subscription — actual paying customers. */
  paidSubs: number;
  /**
   * Active premium subs with NO Stripe link — agent/comp/provisioned accounts.
   * Real members, but they generate $0, so they are NOT counted as revenue.
   */
  provisionedSubs: number;
  /** Monthly recurring revenue from paid subs only (paidSubs × price). */
  mrr: number;
}

/**
 * Split active subscriptions into REAL revenue (Stripe-backed) vs provisioned
 * accounts (premium tier, no Stripe subscription).
 *
 * Counting provisioned subs as revenue fabricated the admin dashboard's MRR —
 * 944 auto-provisioned "premium" rows with zero stripe_subscription_id read as
 * $22.6k/mo when actual Stripe revenue is $0. MRR is derived ONLY from
 * Stripe-linked subs so it reflects money that actually changes hands.
 *
 * Throws when the query fails, so telemetry callers can mark their panel
 * offline instead of reporting a misleading $0.
 */
export async function getSubscriptionRevenueBreakdown(): Promise<SubscriptionRevenueBreakdown> {
  const result = await executeQuery<{ paid: number; provisioned: number }>(
    `SELECT
        COUNT(*) FILTER (WHERE stripe_subscription_id IS NOT NULL)::int AS paid,
        COUNT(*) FILTER (WHERE stripe_subscription_id IS NULL
                           AND tier = 'premium')::int                  AS provisioned
       FROM user_subscriptions
      WHERE status = 'active'`,
  );
  const paidSubs = Number(result.rows[0]?.paid ?? 0);
  const provisionedSubs = Number(result.rows[0]?.provisioned ?? 0);
  return {
    paidSubs,
    provisionedSubs,
    mrr: paidSubs * PREMIUM_MONTHLY_PRICE_USD,
  };
}
