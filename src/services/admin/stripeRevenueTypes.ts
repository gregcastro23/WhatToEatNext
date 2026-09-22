/**
 * Types for the live Stripe revenue read. Amounts are integer minor units
 * (cents) with their currency; the UI formats them.
 *
 * @file src/services/admin/stripeRevenueTypes.ts
 */

import type { StripeWebhookCoverage } from "@/services/stripeWebhookCoverageService";

export type StripeMode = "live" | "test" | "unknown";

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

export interface SubscriptionSummary {
  mrr: Money[];
  byStatus: Record<string, number>;
  active: number;
  newLast30d: number;
  canceledLast30d: number;
  truncated: boolean;
}

export interface ChargeSummary {
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
}

export interface CheckoutSummary {
  windowDays: number;
  byPurpose: CheckoutPurposeRow[];
  truncated: boolean;
}

export interface EventSummary {
  windowDays: number;
  total: number;
  byType: Array<{ type: string; count: number }>;
  pendingDelivery: Array<{ id: string; type: string; created: string; pendingWebhooks: number }>;
  truncated: boolean;
}

export interface StripeRevenuePayload {
  generatedAt: string;
  configured: boolean;
  mode: StripeMode;
  /** One entry per Stripe call that failed; sections that answered still render. */
  errors: string[];
  balance: { available: Money[]; pending: Money[] } | null;
  subscriptions: SubscriptionSummary | null;
  charges: ChargeSummary | null;
  checkout: CheckoutSummary | null;
  events: EventSummary | null;
  webhookCoverage: StripeWebhookCoverage | null;
}
