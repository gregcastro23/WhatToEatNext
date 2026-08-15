/**
 * The two real USD rails for ESMS tokens — and deliberately nothing else.
 *
 * ADR-011 §2: the repo carries exactly two honest USD facts about a token,
 * and they disagree (~1.7–2.5×), so the price index quotes them separately
 * and never blends them into a fabricated "market price":
 *
 *  - MINT (ask): the Stripe MCP top-up catalog. The marginal retail rate is
 *    the smallest SKU with a configured Stripe price id (RULED — larger SKUs
 *    are volume discounts off it, not the price of one token).
 *  - REDEEM (bid): the published closed-loop food-value redemption rate on
 *    the /rewards disclosure page. Absent when unconfigured — that page's
 *    own honesty branch ("we say so plainly rather than implying a value"),
 *    mirrored here.
 *
 * Both derive from their live sources at call time, so these numbers
 * round-trip from the catalogs that actually charge — there is no rate
 * literal in this module to drift.
 */

import { listAvailableSkus } from "@/lib/billing/mcpTopUp";
import { esmsRestaurantCentsPerToken } from "@/lib/payments/restaurantEsms";

export interface UsdRails {
  /** Marginal retail mint rate per single token, e.g. 0.025. Null = no SKU configured. */
  mintPerTokenUsd: number | null;
  /** SKU id the mint rate came from, for auditability. */
  mintSource: string | null;
  /** Published redemption rate per token in USD of food value. Null = rate unset. */
  redeemPerTokenUsd: number | null;
  redeemSource: string | null;
}

export function getUsdRails(): UsdRails {
  const skus = listAvailableSkus();
  const smallest =
    skus.length > 0
      ? skus.reduce((min, sku) => (sku.priceCents < min.priceCents ? sku : min))
      : null;
  // esmsPerAxis is per axis; a SKU credits all four axes, so the per-token
  // denominator is 4 × esmsPerAxis (e.g. $5 / 200 tokens = $0.025).
  const mintPerTokenUsd = smallest
    ? smallest.priceCents / 100 / (smallest.esmsPerAxis * 4)
    : null;

  const redeemCents = esmsRestaurantCentsPerToken();
  return {
    mintPerTokenUsd,
    mintSource: smallest?.sku ?? null,
    redeemPerTokenUsd: redeemCents > 0 ? redeemCents / 100 : null,
    redeemSource:
      redeemCents > 0 ? "NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN" : null,
  };
}
