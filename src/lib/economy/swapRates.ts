/**
 * ESMS Swap Rate Sheet — the public face of the Swapping Bridge's prices.
 *
 * Every rate here is `P_to / P_from` over the live Elemental Exchange Index
 * (ADR-011): 1:1 in value, no spread. It is computed by the SAME function
 * (`oracleRate`) over the SAME feed (`getLiveSwapQuote`) the Swapping Bridge
 * uses to auto-swap a short payment, so GET /api/economy/swap-rates quotes
 * exactly what a payment would be converted at within the same oracle minute.
 *
 * History: this sheet used to float a 3:1 base ratio off the planetary hour
 * and day rulers. That rate existed nowhere else in the economy, so a quoted
 * rate and the price of anything could disagree by up to 50% in either
 * direction. The rulers are still reported — they are real sky context the
 * UI shows — but they no longer set a price.
 *
 * Honesty contract: when the oracle cannot price the sky, `getCurrentSwapRates`
 * THROWS (`SwapRatesUnavailableError`). There is no fallback sheet, because a
 * fallback rate is a fabricated one. Callers that can run without rates use
 * `tryGetCurrentSwapRates` and degrade explicitly.
 */

import type { TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";
import { getTimeFactors } from "@/types/time";
import { ORACLE_BUCKET_MS } from "./priceIndex";
import {
  SWAP_BASIS,
  SWAP_SPREAD,
  getLiveSwapQuote,
  oracleRate,
  type OraclePrices,
} from "./swappingBridge";

export interface SwapRate {
  fromToken: TokenType;
  toToken: TokenType;
  /** Units of fromToken required to mint 1 unit of toToken right now: P_to / P_from. */
  rate: number;
  /**
   * The same rate against 1:1 parity (1.0 = both coins priced equally; < 1
   * means the target is currently the cheaper coin). Numerically equal to
   * `rate` — kept as its own field because the rate-sheet UI colours on it.
   */
  modifier: number;
}

export interface SwapRateContext {
  /** Sky context for display; no longer an input to any rate. */
  rulingHourPlanet: string;
  rulingDayPlanet: string;
  rates: SwapRate[];
  /** The EEI per token every rate above was computed from. */
  prices: OraclePrices;
  /** Start of the oracle minute bucket the prices are pinned to. */
  priceBucketStartUtc: string;
  basis: typeof SWAP_BASIS;
  spread: typeof SWAP_SPREAD;
  /** Degrade reasons of the price sample, when it was not fully live. */
  degraded: string[] | null;
  generatedAt: string;
  /** End of the oracle bucket: the prices, and so the rates, are fixed until then. */
  validUntil: string;
}

/** The oracle could not price the sky; no rate sheet exists right now. */
export class SwapRatesUnavailableError extends Error {
  constructor(cause: unknown) {
    super(
      `swap rates unavailable: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = "SwapRatesUnavailableError";
  }
}

const RATE_DIGITS = 8;

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * The ruling planets of the current hour and day. Pure sky context: the
 * grimoire and the network feed display them, and nothing prices off them.
 */
export function getPlanetaryRulers(): {
  rulingHourPlanet: string;
  rulingDayPlanet: string;
} {
  const factors = getTimeFactors();
  return {
    rulingHourPlanet: String(factors.planetaryHour.planet),
    rulingDayPlanet: String(factors.planetaryDay.planet),
  };
}

/**
 * The rate sheet for the oracle bucket containing `now`.
 * @throws SwapRatesUnavailableError when the oracle cannot price the sky.
 */
export function getCurrentSwapRates(now: Date = new Date()): SwapRateContext {
  let quote: ReturnType<typeof getLiveSwapQuote>;
  try {
    quote = getLiveSwapQuote(now);
  } catch (error) {
    throw new SwapRatesUnavailableError(error);
  }

  const rates: SwapRate[] = [];
  for (const fromToken of TOKEN_TYPES) {
    for (const toToken of TOKEN_TYPES) {
      if (fromToken === toToken) continue;
      const rate = round(oracleRate(quote.prices, fromToken, toToken), RATE_DIGITS);
      rates.push({ fromToken, toToken, rate, modifier: rate });
    }
  }

  const bucketStartMs = Date.parse(quote.bucketStartUtc);
  return {
    ...getPlanetaryRulers(),
    rates,
    prices: { ...quote.prices },
    priceBucketStartUtc: quote.bucketStartUtc,
    basis: SWAP_BASIS,
    spread: SWAP_SPREAD,
    degraded: quote.degraded ? [...quote.degraded] : null,
    generatedAt: now.toISOString(),
    validUntil: new Date(bucketStartMs + ORACLE_BUCKET_MS).toISOString(),
  };
}

/** `getCurrentSwapRates`, or null when the oracle cannot price the sky. */
export function tryGetCurrentSwapRates(now: Date = new Date()): SwapRateContext | null {
  try {
    return getCurrentSwapRates(now);
  } catch (error) {
    if (error instanceof SwapRatesUnavailableError) return null;
    throw error;
  }
}

export function findRate(
  context: SwapRateContext,
  fromToken: TokenType,
  toToken: TokenType,
): SwapRate | null {
  return (
    context.rates.find((r) => r.fromToken === fromToken && r.toToken === toToken) ?? null
  );
}
