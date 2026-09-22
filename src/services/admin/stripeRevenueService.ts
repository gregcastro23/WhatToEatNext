/**
 * Stripe revenue — read straight from Stripe, not inferred. Server-only.
 *
 * The older `subscriptionRevenueService` computes "MRR" as
 * paid-subscription-rows × a hardcoded $24. This asks Stripe instead:
 *
 *   - balance (available / pending) per currency
 *   - MRR from each live subscription's actual prices, normalised to a month
 *   - subscription counts by status, new and churned in the last 30 days
 *   - 30-day charge volume: gross, refunded, net, failed, and a daily series
 *   - checkout sessions by purpose (premium / MCP top-up / token pack /
 *     restaurant order) with completion rate — the purchase funnel
 *   - events with `pending_webhooks > 0` — deliveries not yet acknowledged
 *   - webhook endpoint coverage (stripeWebhookCoverageService)
 *
 * Each section degrades on its own: a permission error on events must not
 * blank the balance card.
 *
 * @file src/services/admin/stripeRevenueService.ts
 */

import { _logger } from "@/lib/logger";
import {
  readBalance,
  readCharges,
  readCheckout,
  readEvents,
  readSubscriptions,
  WINDOW_DAYS,
} from "@/services/admin/stripeRevenueReaders";
import type { StripeMode, StripeRevenuePayload } from "@/services/admin/stripeRevenueTypes";
import { fetchStripeWebhookCoverage } from "@/services/stripeWebhookCoverageService";

/** Only the key's mode prefix is inspected; the key itself never leaves here. */
export function stripeModeFromKey(key: string | undefined): StripeMode {
  if (!key) return "unknown";
  if (/^(sk|rk)_live_/.test(key)) return "live";
  if (/^(sk|rk)_test_/.test(key)) return "test";
  return "unknown";
}

async function section<T>(label: string, errors: string[], work: () => Promise<T>): Promise<T | null> {
  try {
    return await work();
  } catch (err) {
    errors.push(`${label}: ${err instanceof Error ? err.message : "unknown error"}`);
    _logger.error(`[admin/revenue] ${label} failed:`, err);
    return null;
  }
}

function unconfigured(base: Pick<StripeRevenuePayload, "generatedAt" | "configured" | "mode">): StripeRevenuePayload {
  return {
    ...base,
    errors: ["STRIPE_SECRET_KEY is not configured"],
    balance: null,
    subscriptions: null,
    charges: null,
    checkout: null,
    events: null,
    webhookCoverage: null,
  };
}

export async function getStripeRevenue(): Promise<StripeRevenuePayload> {
  const key = process.env.STRIPE_SECRET_KEY;
  const base = { generatedAt: new Date().toISOString(), configured: Boolean(key), mode: stripeModeFromKey(key) };
  if (!key) return unconfigured(base);

  const { getStripe } = await import("@/lib/stripe/stripe");
  const stripe = getStripe();
  const since = Math.floor((Date.now() - WINDOW_DAYS * 86_400_000) / 1000);
  const errors: string[] = [];
  const [balance, subscriptions, charges, checkout, events, webhookCoverage] = await Promise.all([
    section("balance", errors, () => readBalance(stripe)),
    section("subscriptions", errors, () => readSubscriptions(stripe, since)),
    section("charges", errors, () => readCharges(stripe, since)),
    section("checkout sessions", errors, () => readCheckout(stripe, since)),
    section("events", errors, () => readEvents(stripe)),
    section("webhook coverage", errors, () => fetchStripeWebhookCoverage()),
  ]);
  return { ...base, errors, balance, subscriptions, charges, checkout, events, webhookCoverage };
}
