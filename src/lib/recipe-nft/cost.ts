/**
 * Recipe-NFT mint cost — the economy logic.
 *
 * Cost basis = the recipe's summed ingredient ESMS (from the fingerprint),
 * priced live by the sky × the user's chart. Premium members get
 * "chart-weighted redistribution": the cost is shifted toward their dominant
 * coin (the one their chart favors and they tend to hold more of), converted at
 * live SMES swap rates so the alchemical value is preserved.
 */

import {
  applyPersonalizedPricing,
  type PersonalizedPricingContext,
} from "@/lib/economy/livePricing";
import { findRate, type SwapRateContext } from "@/lib/economy/swapRates";
import type { Element } from "@/types/alchemy";
import { TOKEN_TYPES, type TokenType } from "@/types/economy";
import type { CoinAmounts, RecipeFingerprint } from "./types";

/** Canonical element → coin axis (Fire=Spirit, Water=Essence, Earth=Matter, Air=Substance). */
const ELEMENT_TO_COIN: Record<Element, TokenType> = {
  Fire: "Spirit",
  Water: "Essence",
  Earth: "Matter",
  Air: "Substance",
};

const COIN_KEY: Record<TokenType, keyof CoinAmounts> = {
  Spirit: "spirit",
  Essence: "essence",
  Matter: "matter",
  Substance: "substance",
};

/** How much of each non-dominant coin's charge a premium member may shift onto their dominant coin. */
export const REDISTRIBUTION_FRACTION = 0.5;

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function elementToCoin(element: string): TokenType {
  return ELEMENT_TO_COIN[element as Element] ?? "Spirit";
}

/** The raw recipe-ESMS cost (cost basis), before any live multiplier. */
export function baseMintCost(fingerprint: RecipeFingerprint): CoinAmounts {
  return {
    spirit: round2(fingerprint.totals.spirit),
    essence: round2(fingerprint.totals.essence),
    matter: round2(fingerprint.totals.matter),
    substance: round2(fingerprint.totals.substance),
  };
}

/** Apply the live (sky × chart) per-token multipliers to the base cost. */
export function liveMintCost(
  base: CoinAmounts,
  pricing: PersonalizedPricingContext,
): CoinAmounts {
  return applyPersonalizedPricing(base, pricing);
}

/**
 * Premium chart-weighted redistribution.
 *
 * Shifts `REDISTRIBUTION_FRACTION` of every non-dominant coin's charge onto the
 * member's dominant coin, converting at the live swap rate so the alchemical
 * VALUE is preserved (the dominant coin carries more of the load; the coins the
 * member is short on are eased). Returns the standard cost unchanged if no swap
 * rate is available for a pair.
 *
 * Swap convention: `findRate(from → to).rate` = units of `from` needed to mint
 * 1 `to`. So shifting `amt` units of a non-dominant coin onto the dominant coin
 * adds `amt / rate(nonDominant → dominant)` dominant units.
 */
export function redistributeTowardDominant(
  cost: CoinAmounts,
  dominantCoin: TokenType,
  swap: SwapRateContext,
  fraction: number = REDISTRIBUTION_FRACTION,
): CoinAmounts {
  const phi = Math.max(0, Math.min(1, fraction));
  const dominantKey = COIN_KEY[dominantCoin];
  const result: CoinAmounts = { ...cost };
  let dominantGain = 0;

  for (const coin of TOKEN_TYPES) {
    if (coin === dominantCoin) continue;
    const key = COIN_KEY[coin];
    const shifted = result[key] * phi;
    if (shifted <= 0) continue;
    const rate = findRate(swap, coin, dominantCoin)?.rate;
    if (!rate || rate <= 0) continue; // no live rate → leave this coin as-is
    result[key] = round2(result[key] - shifted);
    dominantGain += shifted / rate;
  }

  result[dominantKey] = round2(result[dominantKey] + dominantGain);
  return result;
}

/** Build the four-coin redistribution preview (one variant per possible dominant coin). */
export function buildRedistributePreview(
  liveCost: CoinAmounts,
  swap: SwapRateContext,
): Record<TokenType, CoinAmounts> {
  return {
    Spirit: redistributeTowardDominant(liveCost, "Spirit", swap),
    Essence: redistributeTowardDominant(liveCost, "Essence", swap),
    Matter: redistributeTowardDominant(liveCost, "Matter", swap),
    Substance: redistributeTowardDominant(liveCost, "Substance", swap),
  };
}
