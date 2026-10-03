/**
 * Transmutation Circle — how offers are priced and shown, and the small
 * helpers every Circle act shares.
 *
 * @file src/services/transmutationViews.ts
 */

import type { OracleQuote } from "@/lib/economy/priceIndex";
import { assertUsablePrices, getLiveSwapQuote } from "@/lib/economy/swappingBridge";
import {
  DEFAULT_OFFER_TTL_HOURS,
  MAX_OFFER_TTL_HOURS,
  MIN_OFFER_TTL_HOURS,
  assessOffer,
  type OfferTerms,
} from "@/lib/economy/transmutationMarket";
import { _logger } from "@/lib/logger";
import { effectiveStatus, type OfferRecord } from "@/services/transmutationRecords";
import type { TokenType } from "@/types/economy";
import type {
  TransmutationFailure,
  TransmutationFailureReason,
  TransmutationMarketView,
  TransmutationOfferView,
  TransmutationOwnOffer,
  TransmutationParty,
} from "@/types/transmutation";

const MESSAGE_MAX = 280;

/**
 * The live index, or null. The Circle judges fairness from the same feed as
 * the Swapping Bridge and the public rate sheet — and never at a guessed price.
 */
export function liveQuote(): OracleQuote | null {
  try {
    const quote = getLiveSwapQuote();
    assertUsablePrices(quote.prices);
    return quote;
  } catch (error) {
    _logger.warn("[transmutation] price oracle unavailable:", error);
    return null;
  }
}

function marketView(terms: OfferTerms, quote: OracleQuote | null): TransmutationMarketView | null {
  if (!quote) return null;
  const market = assessOffer(terms, quote.prices);
  return {
    parityWantAmount: market.parityWantAmount,
    takerEdgePct: market.takerEdgePct,
    withinCorridor: market.withinCorridor,
  };
}

export function offerView(offer: OfferRecord, quote: OracleQuote | null): TransmutationOfferView {
  return {
    id: offer.id,
    giveToken: offer.giveToken,
    giveAmount: offer.giveAmount,
    wantToken: offer.wantToken,
    wantAmount: offer.wantAmount,
    message: offer.message,
    status: effectiveStatus(offer),
    directed: offer.counterpartyId !== null,
    replyToOfferId: offer.replyToOfferId,
    createdAt: offer.createdAt,
    expiresAt: offer.expiresAt,
    closedAt: offer.closedAt,
    market: offer.status === "open" ? marketView(offer, quote) : null,
  };
}

/**
 * A maker's own offer right after posting (or replaying) it — an offer they
 * could cover, so `funded` is its open-ness. The Circle read recomputes it live.
 */
export function ownView(
  offer: OfferRecord,
  quote: OracleQuote | null,
  counterparty: TransmutationParty | null,
): TransmutationOwnOffer {
  return {
    ...offerView(offer, quote),
    funded: offer.status === "open",
    counterparty,
    taker: null,
  };
}

/** "3 Spirit" — amounts without trailing zeros. */
export const coins = (amount: number, token: TokenType): string =>
  `${Number(amount.toFixed(4)).toString()} ${token}`;

export const fail = (reason: TransmutationFailureReason, message: string): TransmutationFailure => ({
  ok: false,
  reason,
  message,
});

export const RATES_UNAVAILABLE_MESSAGE =
  "Live exchange rates are unavailable, so fair terms cannot be checked right now.";

/** One line of printable text, bounded; null when nothing is left. */
export function sanitizeMessage(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = Array.from(raw)
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code >= 0x20 && code !== 0x7f;
    })
    .join("")
    .trim()
    .slice(0, MESSAGE_MAX);
  return cleaned.length > 0 ? cleaned : null;
}

export function clampTtl(hours: number | null | undefined): number {
  if (hours == null || !Number.isFinite(hours)) return DEFAULT_OFFER_TTL_HOURS;
  return Math.min(MAX_OFFER_TTL_HOURS, Math.max(MIN_OFFER_TTL_HOURS, Math.round(hours)));
}

/** Best-effort side effect: logged, never thrown into a completed act. */
export async function quietly(label: string, effect: () => Promise<unknown>): Promise<void> {
  try {
    await effect();
  } catch (error) {
    _logger.warn(`[transmutation] ${label} failed:`, error);
  }
}
