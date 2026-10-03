/**
 * Transmutation Circle — the pure market rules for peer-to-peer trades.
 *
 * Swapping (ADR-017) is solitary: one practitioner converts coins against the
 * Elemental Exchange Index. Transmutation is social: two practitioners each
 * send the other the coin that one lacks. This module holds the rules both
 * sides are judged by; it does no I/O, so every rule is a unit-testable
 * function of its inputs.
 *
 * ── Value, not units ────────────────────────────────────────────────────────
 *
 * Coins are compared by EEI value (units × price), the same basis the Swapping
 * Bridge converts at. "Parity" is the exchange the house swap would give.
 *
 * ── The fair-value corridor ─────────────────────────────────────────────────
 *
 * An offer may price its coins up to CORRIDOR (25%) away from parity in either
 * direction — multiplicatively symmetric, so the most EITHER side can gain over
 * the house is the same 25%. That leaves real room to trade: a maker who badly
 * lacks a coin can post a generous offer, and a taker filling it beats the
 * house swap. What it forbids is the lopsided trade — "0.01 Spirit for 50
 * Essence" — which is not a trade but a transfer, and would let a ring of
 * fresh accounts funnel their welcome grants into one wallet. The corridor is
 * checked when an offer is posted AND when it is filled, against the live
 * index, so a market that has moved cannot turn an old offer into a transfer.
 *
 * ── Needs ───────────────────────────────────────────────────────────────────
 *
 * A practitioner "lacks" a coin when they hold less value in it than an even
 * split of their holdings (value < mean), and has "surplus" in one they hold
 * more of. An offer COMPLEMENTS a viewer when it gives what they lack and wants
 * what they have in surplus — the trade the Circle exists to make easy.
 *
 * @file src/lib/economy/transmutationMarket.ts
 */

import type { TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";

/** Max multiplicative distance from EEI parity: value ratio ∈ [1/1.25, 1.25]. */
export const CORRIDOR = 0.25;

/** Largest amount on either side of one offer. */
export const MAX_OFFER_AMOUNT = 10_000;

/** Offer lifetime bounds, in hours. */
export const DEFAULT_OFFER_TTL_HOURS = 72;
export const MIN_OFFER_TTL_HOURS = 1;
export const MAX_OFFER_TTL_HOURS = 168;

/** A maker's live (open, unexpired) offers at once. */
export const MAX_OPEN_OFFERS_PER_MAKER = 10;

/**
 * Value (tokens-at-index-1.0) the taker's side must carry for the trade to earn
 * the Circle bonus. Dust trades still settle; they just don't pay a bonus.
 */
export const BONUS_MIN_TRADE_VALUE = 1;

/** Ledger precision: DECIMAL(12,4). */
const LEDGER_DIGITS = 4;

export type OraclePrices = Record<TokenType, number>;

export interface OfferTerms {
  giveToken: TokenType;
  giveAmount: number;
  wantToken: TokenType;
  wantAmount: number;
}

export interface Holdings {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

/** How an offer's terms compare with the house swap at the live index. */
export interface OfferMarket {
  /** EEI value of what the maker gives (what a taker receives). */
  giveValue: number;
  /** EEI value of what the maker wants (what a taker pays). */
  wantValue: number;
  /**
   * What the maker would have to ask for at exact parity, in `wantToken` —
   * the house-swap equivalent of this offer.
   */
  parityWantAmount: number;
  /**
   * Percent more value the TAKER receives than pays. Positive = filling beats
   * swapping at the house; negative = the maker is asking a premium.
   */
  takerEdgePct: number;
  /** True when the terms sit inside the fair-value corridor. */
  withinCorridor: boolean;
}

export interface Needs {
  /** Coins held below an even value split, scarcest first. */
  lacking: TokenType[];
  /** Coins held above an even value split, richest first. */
  surplus: TokenType[];
}

const AXIS: Record<TokenType, keyof Holdings> = {
  Spirit: "spirit",
  Essence: "essence",
  Matter: "matter",
  Substance: "substance",
};

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Round to the ledger's precision. */
export function toLedgerAmount(value: number): number {
  return round(value, LEDGER_DIGITS);
}

function usablePrice(prices: OraclePrices, token: TokenType): number {
  const price: unknown = prices[token];
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    throw new Error(`transmutation-market: no usable price for ${token}`);
  }
  return price;
}

/**
 * Validate an offer's shape: two different coins, positive amounts that
 * survive rounding to the ledger's 4 decimals, nothing above the cap.
 * Returns the ledger-rounded terms, or the first problem found.
 */
export function normalizeTerms(
  terms: OfferTerms,
): { ok: true; terms: OfferTerms } | { ok: false; problem: string } {
  if (terms.giveToken === terms.wantToken) {
    return { ok: false, problem: "An offer must trade one coin for a different coin." };
  }
  const giveAmount = toLedgerAmount(terms.giveAmount);
  const wantAmount = toLedgerAmount(terms.wantAmount);
  for (const [label, amount] of [
    ["give", giveAmount],
    ["want", wantAmount],
  ] as const) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, problem: `The ${label} amount must be at least 0.0001.` };
    }
    if (amount > MAX_OFFER_AMOUNT) {
      return { ok: false, problem: `The ${label} amount may not exceed ${MAX_OFFER_AMOUNT}.` };
    }
  }
  return { ok: true, terms: { ...terms, giveAmount, wantAmount } };
}

/** Price an offer against the live index. Throws on an unusable price. */
export function assessOffer(terms: OfferTerms, prices: OraclePrices): OfferMarket {
  const giveValue = terms.giveAmount * usablePrice(prices, terms.giveToken);
  const wantValue = terms.wantAmount * usablePrice(prices, terms.wantToken);
  const ratio = giveValue / wantValue;
  return {
    giveValue: round(giveValue, 6),
    wantValue: round(wantValue, 6),
    parityWantAmount: toLedgerAmount(giveValue / usablePrice(prices, terms.wantToken)),
    takerEdgePct: round((ratio - 1) * 100, 2),
    // Multiplicatively symmetric, with a hair of float tolerance so an offer
    // posted exactly on the edge is not refused by rounding.
    withinCorridor:
      ratio <= (1 + CORRIDOR) * (1 + 1e-9) && ratio >= 1 / (1 + CORRIDOR) / (1 + 1e-9),
  };
}

/** Which coins a practitioner lacks and which they have in surplus, by value. */
export function assessNeeds(holdings: Holdings, prices: OraclePrices): Needs {
  const values = TOKEN_TYPES.map((token) => ({
    token,
    value: Math.max(0, holdings[AXIS[token]]) * usablePrice(prices, token),
  }));
  const mean = values.reduce((sum, v) => sum + v.value, 0) / values.length;
  // Canonical order breaks ties, so the answer is a pure function.
  const byValue = [...values].sort(
    (a, b) => a.value - b.value || TOKEN_TYPES.indexOf(a.token) - TOKEN_TYPES.indexOf(b.token),
  );
  const EPSILON = 1e-9;
  return {
    lacking: byValue.filter((v) => v.value < mean - EPSILON).map((v) => v.token),
    surplus: byValue
      .filter((v) => v.value > mean + EPSILON)
      .reverse()
      .map((v) => v.token),
  };
}

/** Does this offer give what the viewer lacks for what they have to spare? */
export function complementsNeeds(terms: OfferTerms, needs: Needs): boolean {
  return needs.lacking.includes(terms.giveToken) && needs.surplus.includes(terms.wantToken);
}

/** Can this holder pay the offer's asking side right now? */
export function canFill(terms: OfferTerms, holdings: Holdings): boolean {
  return holdings[AXIS[terms.wantToken]] >= terms.wantAmount;
}

/** Can this maker still cover what the offer gives? */
export function canCoverGive(terms: OfferTerms, holdings: Holdings): boolean {
  return holdings[AXIS[terms.giveToken]] >= terms.giveAmount;
}

/**
 * A one-tap starting point: offer some of the richest coin for the scarcest,
 * at exact parity. Sized to move the scarce coin halfway to an even split,
 * never giving away more than a quarter of the rich coin's value. Null when
 * the holdings are already balanced or too small to trade.
 */
export function suggestOffer(holdings: Holdings, prices: OraclePrices): OfferTerms | null {
  const needs = assessNeeds(holdings, prices);
  const [scarce] = needs.lacking;
  const [rich] = needs.surplus;
  if (!scarce || !rich) return null;

  const valueOf = (token: TokenType): number =>
    Math.max(0, holdings[AXIS[token]]) * usablePrice(prices, token);
  const mean = TOKEN_TYPES.reduce((sum, t) => sum + valueOf(t), 0) / TOKEN_TYPES.length;
  const tradeValue = Math.min((mean - valueOf(scarce)) / 2, valueOf(rich) / 4);

  const giveAmount = toLedgerAmount(tradeValue / usablePrice(prices, rich));
  const wantAmount = toLedgerAmount(tradeValue / usablePrice(prices, scarce));
  if (giveAmount <= 0 || wantAmount <= 0) return null;
  return { giveToken: rich, giveAmount, wantToken: scarce, wantAmount };
}
