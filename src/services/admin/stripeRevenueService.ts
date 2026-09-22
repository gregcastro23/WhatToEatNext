/**
 * Stripe revenue — read straight from Stripe, not inferred. Server-only.
 *
 * The older `subscriptionRevenueService` computes "MRR" as
 * paid-subscription-rows × a hardcoded $24. This service asks Stripe:
 *
 *   - balance (available / pending) per currency
 *   - MRR from each live subscription's actual prices, normalised to a month
 *   - subscription counts by status, new and churned in the last 30 days
 *   - 30-day charge volume: gross, refunded, net, failed, and a daily series
 *   - checkout sessions by purpose (premium / MCP top-up / token pack /
 *     restaurant order) with completion rate — the purchase funnel
 *   - recent events with `pending_webhooks > 0` — deliveries Stripe has not
 *     been able to hand to an endpoint yet
 *
 * Read-only. Never mutates Stripe. Amounts are integer minor units (cents)
 * with their currency; the UI formats them.
 *
 * @file src/services/admin/stripeRevenueService.ts
 */

import { _logger } from "@/lib/logger";
import { fetchStripeWebhookCoverage, type StripeWebhookCoverage } from "@/services/stripeWebhookCoverageService";
import type Stripe from "stripe";

const DAY_MS = 86_400_000;
const WINDOW_DAYS = 30;
/** Upper bound on objects paged per list — keeps one poll to a few requests. */
const PAGE_CAP = 500;

export type StripeMode = "live" | "test" | "unknown";

export function stripeModeFromKey(key: string | undefined): StripeMode {
  if (!key) return "unknown";
  if (/^(sk|rk)_live_/.test(key)) return "live";
  if (/^(sk|rk)_test_/.test(key)) return "test";
  return "unknown";
}

export interface Money {
  amount: number;
  currency: string;
}

export interface RecentCharge {
  id: string;
  created: string;
  amount: number;
  amountRefunded: number;
  currency: string;
  status: string;
  paid: boolean;
  description: string | null;
  email: string | null;
  method: string | null;
  failureMessage: string | null;
  purpose: string | null;
}

export interface CheckoutPurposeRow {
  purpose: string;
  created: number;
  completed: number;
  expired: number;
  open: number;
  /** Sum of amount_total over completed sessions, in the session currency. */
  revenue: number;
  currency: string | null;
}

export interface StripeRevenuePayload {
  generatedAt: string;
  configured: boolean;
  mode: StripeMode;
  /** Set when a Stripe call failed; sections that did answer still render. */
  errors: string[];
  balance: { available: Money[]; pending: Money[] } | null;
  subscriptions: {
    mrr: Money[];
    byStatus: Record<string, number>;
    active: number;
    newLast30d: number;
    canceledLast30d: number;
    truncated: boolean;
  } | null;
  charges: {
    windowDays: number;
    count: number;
    succeeded: number;
    failed: number;
    gross: Money[];
    refunded: Money[];
    net: Money[];
    daily: Array<{ day: string; gross: number; count: number }>;
    dailyCurrency: string | null;
    recent: RecentCharge[];
    truncated: boolean;
  } | null;
  checkout: { windowDays: number; byPurpose: CheckoutPurposeRow[]; truncated: boolean } | null;
  events: {
    windowDays: number;
    total: number;
    byType: Array<{ type: string; count: number }>;
    pendingDelivery: Array<{ id: string; type: string; created: string; pendingWebhooks: number }>;
    truncated: boolean;
  } | null;
  webhookCoverage: StripeWebhookCoverage | null;
}

/** Normalise a recurring price amount to one month. */
export function monthlyAmount(
  unitAmount: number,
  quantity: number,
  interval: string,
  intervalCount: number,
): number {
  const perInterval = unitAmount * quantity;
  const count = intervalCount > 0 ? intervalCount : 1;
  switch (interval) {
    case "day":
      return (perInterval * 365) / 12 / count;
    case "week":
      return (perInterval * 52) / 12 / count;
    case "month":
      return perInterval / count;
    case "year":
      return perInterval / 12 / count;
    default:
      return 0;
  }
}

function addMoney(map: Map<string, number>, currency: string, amount: number): void {
  map.set(currency, (map.get(currency) ?? 0) + amount);
}

function toMoney(map: Map<string, number>): Money[] {
  return [...map.entries()]
    .map(([currency, amount]) => ({ currency, amount: Math.round(amount) }))
    .sort((a, b) => b.amount - a.amount);
}

function purposeOf(metadata: Stripe.Metadata | null | undefined, mode?: string | null): string {
  const purpose = metadata?.purpose;
  if (typeof purpose === "string" && purpose.length > 0) return purpose;
  if (mode === "subscription") return "premium_subscription";
  return "other";
}

function isoDay(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

async function readBalance(stripe: Stripe): Promise<StripeRevenuePayload["balance"]> {
  const balance = await stripe.balance.retrieve();
  return {
    available: balance.available.map((b) => ({ amount: b.amount, currency: b.currency })),
    pending: balance.pending.map((b) => ({ amount: b.amount, currency: b.currency })),
  };
}

async function readSubscriptions(
  stripe: Stripe,
  since: number,
): Promise<StripeRevenuePayload["subscriptions"]> {
  const subs = await stripe.subscriptions
    .list({ status: "all", limit: 100 })
    .autoPagingToArray({ limit: PAGE_CAP });
  const byStatus: Record<string, number> = {};
  const mrr = new Map<string, number>();
  let newLast30d = 0;
  let canceledLast30d = 0;
  for (const sub of subs) {
    byStatus[sub.status] = (byStatus[sub.status] ?? 0) + 1;
    if (sub.created >= since) newLast30d += 1;
    if (sub.canceled_at && sub.canceled_at >= since) canceledLast30d += 1;
    // MRR counts subscriptions that are billing: active and past_due. Trials
    // have not paid, canceled/incomplete never will.
    if (sub.status !== "active" && sub.status !== "past_due") continue;
    for (const item of sub.items.data) {
      const { price } = item;
      const { recurring } = price;
      if (!recurring || price.unit_amount == null) continue;
      addMoney(
        mrr,
        price.currency,
        monthlyAmount(price.unit_amount, item.quantity ?? 1, recurring.interval, recurring.interval_count),
      );
    }
  }
  return {
    mrr: toMoney(mrr),
    byStatus,
    active: (byStatus.active ?? 0) + (byStatus.past_due ?? 0),
    newLast30d,
    canceledLast30d,
    truncated: subs.length >= PAGE_CAP,
  };
}

async function readCharges(stripe: Stripe, since: number): Promise<StripeRevenuePayload["charges"]> {
  const charges = await stripe.charges
    .list({ created: { gte: since }, limit: 100 })
    .autoPagingToArray({ limit: PAGE_CAP });
  const gross = new Map<string, number>();
  const refunded = new Map<string, number>();
  const net = new Map<string, number>();
  let succeeded = 0;
  let failed = 0;
  for (const c of charges) {
    if (c.status === "succeeded") {
      succeeded += 1;
      addMoney(gross, c.currency, c.amount);
      addMoney(refunded, c.currency, c.amount_refunded);
      addMoney(net, c.currency, c.amount - c.amount_refunded);
    } else if (c.status === "failed") {
      failed += 1;
    }
  }
  // Daily series in the dominant currency only: summing USD and EUR cents
  // into one bar would be a fabricated number.
  const dailyCurrency = toMoney(gross)[0]?.currency ?? null;
  const dailyMap = new Map<string, { gross: number; count: number }>();
  for (let i = WINDOW_DAYS - 1; i >= 0; i -= 1) {
    dailyMap.set(new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10), { gross: 0, count: 0 });
  }
  for (const c of charges) {
    if (c.status !== "succeeded" || c.currency !== dailyCurrency) continue;
    const bucket = dailyMap.get(isoDay(c.created));
    if (bucket) {
      bucket.gross += c.amount - c.amount_refunded;
      bucket.count += 1;
    }
  }
  return {
    windowDays: WINDOW_DAYS,
    count: charges.length,
    succeeded,
    failed,
    gross: toMoney(gross),
    refunded: toMoney(refunded),
    net: toMoney(net),
    daily: [...dailyMap.entries()].map(([day, v]) => ({ day, gross: v.gross, count: v.count })),
    dailyCurrency,
    recent: charges.slice(0, 15).map((c) => ({
      id: c.id,
      created: new Date(c.created * 1000).toISOString(),
      amount: c.amount,
      amountRefunded: c.amount_refunded,
      currency: c.currency,
      status: c.status,
      paid: c.paid,
      description: c.description,
      email: c.billing_details.email ?? c.receipt_email ?? null,
      method: c.payment_method_details?.type ?? null,
      failureMessage: c.failure_message,
      purpose: purposeOf(c.metadata),
    })),
    truncated: charges.length >= PAGE_CAP,
  };
}

async function readCheckout(stripe: Stripe, since: number): Promise<StripeRevenuePayload["checkout"]> {
  const sessions = await stripe.checkout.sessions
    .list({ created: { gte: since }, limit: 100 })
    .autoPagingToArray({ limit: PAGE_CAP });
  const rows = new Map<string, CheckoutPurposeRow>();
  for (const s of sessions) {
    const purpose = purposeOf(s.metadata, s.mode);
    const row =
      rows.get(purpose) ??
      { purpose, created: 0, completed: 0, expired: 0, open: 0, revenue: 0, currency: null };
    row.created += 1;
    if (s.status === "complete") {
      row.completed += 1;
      if (s.amount_total != null) {
        row.revenue += s.amount_total;
        row.currency ??= s.currency;
      }
    } else if (s.status === "expired") {
      row.expired += 1;
    } else {
      row.open += 1;
    }
    rows.set(purpose, row);
  }
  return {
    windowDays: WINDOW_DAYS,
    byPurpose: [...rows.values()].sort((a, b) => b.created - a.created),
    truncated: sessions.length >= PAGE_CAP,
  };
}

async function readEvents(stripe: Stripe): Promise<StripeRevenuePayload["events"]> {
  const windowDays = 7;
  const events = await stripe.events
    .list({ created: { gte: Math.floor((Date.now() - windowDays * DAY_MS) / 1000) }, limit: 100 })
    .autoPagingToArray({ limit: PAGE_CAP });
  const byType = new Map<string, number>();
  for (const e of events) byType.set(e.type, (byType.get(e.type) ?? 0) + 1);
  return {
    windowDays,
    total: events.length,
    byType: [...byType.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    pendingDelivery: events
      .filter((e) => e.pending_webhooks > 0)
      .slice(0, 25)
      .map((e) => ({
        id: e.id,
        type: e.type,
        created: new Date(e.created * 1000).toISOString(),
        pendingWebhooks: e.pending_webhooks,
      })),
    truncated: events.length >= PAGE_CAP,
  };
}

/**
 * Each section degrades on its own: a Stripe permission error on, say,
 * events must not blank the balance card.
 */
async function section<T>(label: string, errors: string[], work: () => Promise<T>): Promise<T | null> {
  try {
    return await work();
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    errors.push(`${label}: ${message}`);
    _logger.error(`[admin/revenue] ${label} failed:`, err);
    return null;
  }
}

export async function getStripeRevenue(): Promise<StripeRevenuePayload> {
  const key = process.env.STRIPE_SECRET_KEY;
  const base = {
    generatedAt: new Date().toISOString(),
    configured: Boolean(key),
    mode: stripeModeFromKey(key),
  };
  if (!key) {
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

  const { getStripe } = await import("@/lib/stripe/stripe");
  const stripe = getStripe();
  const since = Math.floor((Date.now() - WINDOW_DAYS * DAY_MS) / 1000);
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
