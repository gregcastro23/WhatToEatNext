/**
 * Stripe list/aggregate readers behind /admin/revenue. Server-only,
 * read-only — nothing here mutates Stripe.
 *
 * @file src/services/admin/stripeRevenueReaders.ts
 */

import type {
  ChargeSummary,
  CheckoutPurposeRow,
  CheckoutSummary,
  EventSummary,
  Money,
  RecentCharge,
  SubscriptionSummary,
} from "@/services/admin/stripeRevenueTypes";
import type Stripe from "stripe";

const DAY_MS = 86_400_000;
export const WINDOW_DAYS = 30;
/** Upper bound on objects paged per list — keeps one poll to a few requests. */
const PAGE_CAP = 500;

/** Normalise a recurring price amount to one month. */
export function monthlyAmount(unitAmount: number, quantity: number, interval: string, intervalCount: number): number {
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
  return mode === "subscription" ? "premium_subscription" : "other";
}

export async function readBalance(stripe: Stripe): Promise<{ available: Money[]; pending: Money[] }> {
  const balance = await stripe.balance.retrieve();
  return {
    available: balance.available.map((b) => ({ amount: b.amount, currency: b.currency })),
    pending: balance.pending.map((b) => ({ amount: b.amount, currency: b.currency })),
  };
}

/** MRR counts subscriptions that bill: active and past_due. Trials have not paid. */
function addSubscriptionMrr(mrr: Map<string, number>, sub: Stripe.Subscription): void {
  if (sub.status !== "active" && sub.status !== "past_due") return;
  for (const item of sub.items.data) {
    const { price } = item;
    const { recurring } = price;
    if (!recurring || price.unit_amount === null) continue;
    addMoney(mrr, price.currency, monthlyAmount(price.unit_amount, item.quantity ?? 1, recurring.interval, recurring.interval_count));
  }
}

export async function readSubscriptions(stripe: Stripe, since: number): Promise<SubscriptionSummary> {
  const subs = await stripe.subscriptions.list({ status: "all", limit: 100 }).autoPagingToArray({ limit: PAGE_CAP });
  const byStatus: Record<string, number> = {};
  const mrr = new Map<string, number>();
  for (const sub of subs) {
    byStatus[sub.status] = (byStatus[sub.status] ?? 0) + 1;
    addSubscriptionMrr(mrr, sub);
  }
  return {
    mrr: toMoney(mrr),
    byStatus,
    active: (byStatus.active ?? 0) + (byStatus.past_due ?? 0),
    newLast30d: subs.filter((s) => s.created >= since).length,
    canceledLast30d: subs.filter((s) => s.canceled_at !== null && s.canceled_at >= since).length,
    truncated: subs.length >= PAGE_CAP,
  };
}

function chargeTotals(charges: Stripe.Charge[]): Pick<ChargeSummary, "succeeded" | "failed" | "gross" | "refunded" | "net"> {
  const gross = new Map<string, number>();
  const refunded = new Map<string, number>();
  const net = new Map<string, number>();
  for (const c of charges.filter((x) => x.status === "succeeded")) {
    addMoney(gross, c.currency, c.amount);
    addMoney(refunded, c.currency, c.amount_refunded);
    addMoney(net, c.currency, c.amount - c.amount_refunded);
  }
  return {
    succeeded: charges.filter((c) => c.status === "succeeded").length,
    failed: charges.filter((c) => c.status === "failed").length,
    gross: toMoney(gross),
    refunded: toMoney(refunded),
    net: toMoney(net),
  };
}

/**
 * Daily net volume in ONE currency. Summing USD and EUR cents into a single
 * bar would be a fabricated number, so other currencies are left out.
 */
function dailySeries(charges: Stripe.Charge[], currency: string | null): ChargeSummary["daily"] {
  const days = new Map<string, { gross: number; count: number }>();
  for (let i = WINDOW_DAYS - 1; i >= 0; i -= 1) {
    days.set(new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10), { gross: 0, count: 0 });
  }
  for (const c of charges) {
    const bucket = days.get(new Date(c.created * 1000).toISOString().slice(0, 10));
    if (c.status !== "succeeded" || c.currency !== currency || !bucket) continue;
    bucket.gross += c.amount - c.amount_refunded;
    bucket.count += 1;
  }
  return [...days.entries()].map(([day, v]) => ({ day, gross: v.gross, count: v.count }));
}

function toRecentCharge(c: Stripe.Charge): RecentCharge {
  return {
    id: c.id,
    created: new Date(c.created * 1000).toISOString(),
    amount: c.amount,
    amountRefunded: c.amount_refunded,
    currency: c.currency,
    status: c.status,
    paid: c.paid,
    description: c.description,
    email: c.billing_details.email ?? c.receipt_email,
    method: c.payment_method_details?.type ?? null,
    failureMessage: c.failure_message,
    purpose: purposeOf(c.metadata),
  };
}

export async function readCharges(stripe: Stripe, since: number): Promise<ChargeSummary> {
  const charges = await stripe.charges.list({ created: { gte: since }, limit: 100 }).autoPagingToArray({ limit: PAGE_CAP });
  const totals = chargeTotals(charges);
  const dailyCurrency = totals.gross[0]?.currency ?? null;
  return {
    windowDays: WINDOW_DAYS,
    count: charges.length,
    ...totals,
    daily: dailySeries(charges, dailyCurrency),
    dailyCurrency,
    recent: charges.slice(0, 15).map(toRecentCharge),
    truncated: charges.length >= PAGE_CAP,
  };
}

function tallySession(rows: Map<string, CheckoutPurposeRow>, s: Stripe.Checkout.Session): void {
  const purpose = purposeOf(s.metadata, s.mode);
  const row = rows.get(purpose) ?? { purpose, created: 0, completed: 0, expired: 0, open: 0, revenue: 0, currency: null };
  row.created += 1;
  if (s.status === "complete") {
    row.completed += 1;
    row.revenue += s.amount_total ?? 0;
    row.currency ??= s.currency;
  } else if (s.status === "expired") {
    row.expired += 1;
  } else {
    row.open += 1;
  }
  rows.set(purpose, row);
}

export async function readCheckout(stripe: Stripe, since: number): Promise<CheckoutSummary> {
  const sessions = await stripe.checkout.sessions
    .list({ created: { gte: since }, limit: 100 })
    .autoPagingToArray({ limit: PAGE_CAP });
  const rows = new Map<string, CheckoutPurposeRow>();
  for (const s of sessions) tallySession(rows, s);
  return {
    windowDays: WINDOW_DAYS,
    byPurpose: [...rows.values()].sort((a, b) => b.created - a.created),
    truncated: sessions.length >= PAGE_CAP,
  };
}

/** `pending_webhooks > 0` = Stripe has not yet handed the event to every endpoint. */
export async function readEvents(stripe: Stripe): Promise<EventSummary> {
  const windowDays = 7;
  const events = await stripe.events
    .list({ created: { gte: Math.floor((Date.now() - windowDays * DAY_MS) / 1000) }, limit: 100 })
    .autoPagingToArray({ limit: PAGE_CAP });
  const byType = new Map<string, number>();
  for (const e of events) byType.set(e.type, (byType.get(e.type) ?? 0) + 1);
  return {
    windowDays,
    total: events.length,
    byType: [...byType.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
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
