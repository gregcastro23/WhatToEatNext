/**
 * Chart-priced ESMS charges for the features the retired premium tier used to
 * gate (owner ruling 2026-09-28). Everything else on the site stays free.
 *
 * Each feature has a base ESMS total (featurePrices.ts), split evenly across
 * the four axes, then scaled per axis by the caller's natal chart and the
 * current sky (`applyPersonalizedPricing`, the same live pricing recipe
 * generation uses). Operators, the admin role plus an allowlisted email
 * (`isOperatorAccount`), pay nothing.
 *
 * Charges are collected on delivery: a route quotes the price, may check the
 * caller can afford it before expensive work, delivers, and only then debits
 * the quoted basket atomically. A failed feature therefore never needs a
 * refund.
 *
 * @file src/lib/economy/featureCharge.ts
 */

import { NextResponse } from "next/server";
import { isOperatorAccount } from "@/lib/auth/adminEmails";
import {
  FEATURE_BASE_ESMS,
  FEATURE_LABEL,
  type ChargedFeature,
} from "@/lib/economy/featurePrices";
import {
  applyPersonalizedPricing,
  getPersonalizedPricingContext,
  type PersonalizedPricingContext,
} from "@/lib/economy/livePricing";
import { _logger } from "@/lib/logger";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { NatalChart } from "@/types/natalChart";
import { getCapitalizedNatalPositions } from "@/utils/astrology/chartDataUtils";

export interface EsmsBasket {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

/** What a charge reads from the caller: identity for the exemption, chart for the price. */
export interface FeaturePayer {
  id: string;
  roles: readonly string[];
  email: string | null | undefined;
  profile?: { natalChart?: NatalChart | null } | null;
}

export interface FeatureQuote {
  feature: ChargedFeature;
  /** True for operators, who are never charged. */
  exempt: boolean;
  cost: EsmsBasket;
  pricing: PersonalizedPricingContext | null;
}

const NOTHING: EsmsBasket = { spirit: 0, essence: 0, matter: 0, substance: 0 };

export async function quoteFeature(
  payer: FeaturePayer,
  feature: ChargedFeature,
): Promise<FeatureQuote> {
  if (isOperatorAccount(payer)) {
    return { feature, exempt: true, cost: NOTHING, pricing: null };
  }
  const perAxis = FEATURE_BASE_ESMS[feature] / 4;
  const pricing = await getPersonalizedPricingContext(
    getCapitalizedNatalPositions(payer.profile?.natalChart),
  );
  const cost = applyPersonalizedPricing(
    { spirit: perAxis, essence: perAxis, matter: perAxis, substance: perAxis },
    pricing,
  );
  return { feature, exempt: false, cost, pricing };
}

function describeCost(cost: EsmsBasket): string {
  return `${cost.spirit.toFixed(2)} Spirit + ${cost.essence.toFixed(2)} Essence + ${cost.matter.toFixed(2)} Matter + ${cost.substance.toFixed(2)} Substance`;
}

/** The 402 every chart-priced feature answers when the caller cannot pay. */
export function paymentRequired(quote: FeatureQuote): NextResponse {
  const rate = quote.pricing?.personalized ? " (your chart's rate right now)" : " right now";
  return NextResponse.json(
    {
      success: false,
      reason: "insufficient_tokens",
      message: `${FEATURE_LABEL[quote.feature]} costs ${describeCost(quote.cost)}${rate}. Claim your daily Cosmic Yield to earn more.`,
      liveCost: quote.cost,
    },
    { status: 402 },
  );
}

/** Read-only balance check before expensive work; null when the caller can pay (or is exempt). */
export async function refuseIfUnaffordable(
  payerId: string,
  quote: FeatureQuote,
): Promise<NextResponse | null> {
  if (quote.exempt) return null;
  const balance = await tokenEconomy.getBalances(payerId);
  const { cost } = quote;
  const affordable =
    balance.spirit >= cost.spirit &&
    balance.essence >= cost.essence &&
    balance.matter >= cost.matter &&
    balance.substance >= cost.substance;
  return affordable ? null : paymentRequired(quote);
}

export type Collection =
  | { paid: true; transactionGroupId: string | null }
  | { paid: false; reason: "insufficient_funds" | "already_applied" | "debit_failed" };

/** Debits the quoted basket in one statement, after the feature was delivered. */
export async function collect(
  payerId: string,
  quote: FeatureQuote,
  idempotencyKey?: string,
): Promise<Collection> {
  if (quote.exempt) return { paid: true, transactionGroupId: null };
  const multiplier = quote.pricing ? ` (live x${quote.pricing.multiplier.toFixed(2)})` : "";
  const result = await tokenEconomy.debitAllTokens(payerId, quote.cost, "purchase", {
    description: `${FEATURE_LABEL[quote.feature]}${multiplier}`,
    ...(idempotencyKey === undefined ? {} : { idempotencyKey }),
  });
  if (result.success) return { paid: true, transactionGroupId: result.transactionGroupId };
  if (result.reason === "debit_failed") {
    _logger.error(`[featureCharge] ${quote.feature} debit failed for ${payerId}`);
  }
  return { paid: false, reason: result.reason };
}

/**
 * For features that persist nothing: collect, and return the response to send
 * INSTEAD of the result when the charge is refused (null once paid).
 */
export async function collectOrRefuse(
  payerId: string,
  quote: FeatureQuote,
  idempotencyKey?: string,
): Promise<NextResponse | null> {
  const collection = await collect(payerId, quote, idempotencyKey);
  if (collection.paid) return null;
  if (collection.reason === "insufficient_funds") return paymentRequired(quote);
  if (collection.reason === "already_applied") {
    return NextResponse.json(
      { success: false, reason: "already_processed", message: "This request was already charged." },
      { status: 409 },
    );
  }
  return NextResponse.json(
    { success: false, reason: "charge_failed", message: "Could not charge ESMS for this request. Please try again." },
    { status: 503 },
  );
}
