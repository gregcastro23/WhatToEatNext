/**
 * Subscription & Token Economy Revenue Service (server-only)
 *
 * The single source of truth for revenue and token economy volume telemetry.
 * Statically imports executeQuery and is pulled in by server-side admin telemetry.
 *
 * @file src/services/subscriptionRevenueService.ts
 */

import { executeQuery } from "@/lib/database";

/** Monthly price of the single paid tier, in USD. Used for legacy MRR comparisons. */
export const PREMIUM_MONTHLY_PRICE_USD = 24;

export interface SubscriptionRevenueBreakdown {
  /** Active subs backed by a real Stripe subscription — actual paying customers. */
  paidSubs: number;
  /**
   * Active provisioned accounts.
   */
  provisionedSubs: number;
  /** Monthly recurring / token sales revenue in USD. */
  mrr: number;
  /** Total token bundles purchased (mcp_top_up / token_package transactions). */
  tokenBundlesSold?: number;
  /** Total daily yields claimed across the network. */
  dailyYieldsClaimed?: number;
  /** Total ESMS tokens burned/spent across paid features. */
  tokensBurned?: number;
}

/**
 * Computes revenue and token volume breakdown across the platform:
 * Stripe subscriptions, one-time token purchases, daily yield volume, and token burns.
 */
export async function getSubscriptionRevenueBreakdown(): Promise<SubscriptionRevenueBreakdown> {
  const subResult = await executeQuery<{ paid: number; provisioned: number }>(
    `SELECT
        COUNT(*) FILTER (WHERE stripe_subscription_id IS NOT NULL)::int AS paid,
        COUNT(*) FILTER (WHERE stripe_subscription_id IS NULL
                           AND tier = 'premium')::int                  AS provisioned
       FROM user_subscriptions
      WHERE status = 'active'`,
  );

  let tokenBundlesSold = 0;
  let dailyYieldsClaimed = 0;
  let tokensBurned = 0;

  try {
    const tokenFlowResult = await executeQuery<{
      token_bundles: number;
      daily_yields: number;
      tokens_burned: number;
    }>(
      `SELECT
          COUNT(*) FILTER (WHERE source_type = 'mcp_top_up')::int AS token_bundles,
          COUNT(*) FILTER (WHERE source_type IN ('daily_yield', 'agents_yield'))::int AS daily_yields,
          COALESCE(ABS(SUM(amount) FILTER (WHERE amount < 0)), 0)::float8 AS tokens_burned
         FROM token_transactions`,
    );
    tokenBundlesSold = Number(tokenFlowResult.rows[0]?.token_bundles ?? 0);
    dailyYieldsClaimed = Number(tokenFlowResult.rows[0]?.daily_yields ?? 0);
    tokensBurned = Number(tokenFlowResult.rows[0]?.tokens_burned ?? 0);
  } catch {
    // Non-critical telemetry fallback
  }

  const paidSubs = Number(subResult.rows[0]?.paid ?? 0);
  const provisionedSubs = Number(subResult.rows[0]?.provisioned ?? 0);

  return {
    paidSubs,
    provisionedSubs,
    mrr: paidSubs * PREMIUM_MONTHLY_PRICE_USD,
    tokenBundlesSold,
    dailyYieldsClaimed,
    tokensBurned,
  };
}

