/**
 * Transmutation Circle market rules — the corridor, needs, and suggestions.
 *
 * Prices are injected. The fixture makes every number exact by hand:
 *   Spirit 1.00, Essence 1.25, Matter 0.80, Substance 1.60
 * so at parity 3 Spirit (value 3.0) buys 2.4 Essence (value 3.0).
 */

import {
  CORRIDOR,
  MAX_OFFER_AMOUNT,
  assessNeeds,
  assessOffer,
  canCoverGive,
  canFill,
  complementsNeeds,
  normalizeTerms,
  suggestOffer,
  type OfferTerms,
  type OraclePrices,
} from "@/lib/economy/transmutationMarket";

const PRICES: OraclePrices = { Spirit: 1, Essence: 1.25, Matter: 0.8, Substance: 1.6 };

const offer = (giveAmount: number, wantAmount: number): OfferTerms => ({
  giveToken: "Spirit",
  giveAmount,
  wantToken: "Essence",
  wantAmount,
});

describe("normalizeTerms", () => {
  it("refuses a trade of a coin for itself", () => {
    const result = normalizeTerms({ ...offer(1, 1), wantToken: "Spirit" });
    expect(result.ok).toBe(false);
  });

  it("rounds both sides to the ledger's 4 decimals", () => {
    expect(normalizeTerms(offer(1.23456, 2.00004))).toEqual({
      ok: true,
      terms: { ...offer(1.2346, 2) },
    });
  });

  it("refuses an amount that rounds to zero, is negative, or is above the cap", () => {
    for (const bad of [0.00004, 0, -1, Number.NaN, MAX_OFFER_AMOUNT + 1]) {
      expect(normalizeTerms(offer(bad, 1)).ok).toBe(false);
      expect(normalizeTerms(offer(1, bad)).ok).toBe(false);
    }
    expect(normalizeTerms(offer(MAX_OFFER_AMOUNT, 1)).ok).toBe(true);
  });
});

describe("assessOffer — priced against the house swap", () => {
  it("an offer at exact parity has zero edge and names the parity ask", () => {
    const market = assessOffer(offer(3, 2.4), PRICES);
    expect(market).toEqual({
      giveValue: 3,
      wantValue: 3,
      parityWantAmount: 2.4,
      takerEdgePct: 0,
      withinCorridor: true,
    });
  });

  it("a generous maker gives the taker a positive edge over the house", () => {
    // Asking 2.0 Essence (value 2.5) for 3 Spirit (value 3.0): taker +20%.
    const market = assessOffer(offer(3, 2), PRICES);
    expect(market.takerEdgePct).toBe(20);
    expect(market.withinCorridor).toBe(true);
  });

  it("a maker asking a premium gives the taker a negative edge", () => {
    // Asking 3.0 Essence (value 3.75) for 3 Spirit (value 3.0): taker −20%.
    const market = assessOffer(offer(3, 3), PRICES);
    expect(market.takerEdgePct).toBe(-20);
    expect(market.withinCorridor).toBe(true);
  });

  it("the corridor is ±25% of parity, symmetric for both sides", () => {
    // Taker gains exactly 25% (ratio 1.25): on the edge, allowed.
    expect(assessOffer(offer(3, 1.92), PRICES).withinCorridor).toBe(true);
    // Taker gains 30%: a transfer, not a trade.
    expect(assessOffer(offer(3.25, 2), PRICES).withinCorridor).toBe(false);
    // Maker gains exactly 25% (ratio 1/1.25 = 0.8): on the edge, allowed.
    expect(assessOffer(offer(3, 3), PRICES).withinCorridor).toBe(true);
    // Maker gains ~30%: refused.
    expect(assessOffer(offer(3, 3.12), PRICES).withinCorridor).toBe(false);
    expect(CORRIDOR).toBe(0.25);
  });

  it("refuses the funnel shape outright — dust for a fortune", () => {
    expect(assessOffer(offer(0.01, 50), PRICES).withinCorridor).toBe(false);
    expect(assessOffer(offer(50, 0.01), PRICES).withinCorridor).toBe(false);
  });

  it("throws rather than price against an unusable quote", () => {
    expect(() => assessOffer(offer(1, 1), { ...PRICES, Essence: 0 })).toThrow(/no usable price/);
    expect(() => assessOffer(offer(1, 1), { ...PRICES, Spirit: Number.NaN })).toThrow();
  });
});

describe("needs — what a practitioner lacks and has to spare", () => {
  it("orders lacking coins scarcest-first and surplus coins richest-first, by value", () => {
    // Values: Spirit 20, Essence 1.25, Matter 8, Substance 3.2 → mean 8.1125.
    const needs = assessNeeds({ spirit: 20, essence: 1, matter: 10, substance: 2 }, PRICES);
    expect(needs).toEqual({ lacking: ["Essence", "Substance", "Matter"], surplus: ["Spirit"] });
  });

  it("judges by value, not units: 10 Matter is worth less than 7 Substance", () => {
    // Matter 10 × 0.8 = 8; Substance 7 × 1.6 = 11.2.
    const needs = assessNeeds({ spirit: 9.6, essence: 7.68, matter: 10, substance: 7 }, PRICES);
    expect(needs.lacking).toContain("Matter");
    expect(needs.surplus).toContain("Substance");
  });

  it("a perfectly balanced (or empty) wallet lacks nothing", () => {
    const balanced = { spirit: 4, essence: 3.2, matter: 5, substance: 2.5 }; // all value 4
    expect(assessNeeds(balanced, PRICES)).toEqual({ lacking: [], surplus: [] });
    expect(assessNeeds({ spirit: 0, essence: 0, matter: 0, substance: 0 }, PRICES)).toEqual({
      lacking: [],
      surplus: [],
    });
  });

  it("an offer complements a viewer when it gives what they lack for what they spare", () => {
    const needs = assessNeeds({ spirit: 20, essence: 1, matter: 10, substance: 2 }, PRICES);
    // Viewer lacks Essence, has Spirit to spare → an offer GIVING Essence for Spirit.
    const complementary: OfferTerms = { giveToken: "Essence", giveAmount: 2, wantToken: "Spirit", wantAmount: 2.5 };
    expect(complementsNeeds(complementary, needs)).toBe(true);
    // The reverse would make the viewer's imbalance worse.
    expect(complementsNeeds(offer(3, 2.4), needs)).toBe(false);
  });

  it("canFill checks the asking side; canCoverGive the giving side", () => {
    const holdings = { spirit: 3, essence: 2, matter: 0, substance: 0 };
    expect(canFill(offer(3, 2), holdings)).toBe(true);
    expect(canFill(offer(3, 2.0001), holdings)).toBe(false);
    expect(canCoverGive(offer(3, 2), holdings)).toBe(true);
    expect(canCoverGive(offer(3.0001, 2), holdings)).toBe(false);
  });
});

describe("suggestOffer — a one-tap trade toward balance", () => {
  it("offers the richest coin for the scarcest, at exact parity", () => {
    const holdings = { spirit: 20, essence: 1, matter: 10, substance: 2 };
    const suggestion = suggestOffer(holdings, PRICES);
    expect(suggestion?.giveToken).toBe("Spirit");
    expect(suggestion?.wantToken).toBe("Essence");
    if (!suggestion) return;
    const market = assessOffer(suggestion, PRICES);
    expect(Math.abs(market.takerEdgePct)).toBeLessThanOrEqual(0.01);
    expect(market.withinCorridor).toBe(true);
    // Moves Essence halfway to an even split: (8.1125 − 1.25) / 2 = 3.43125 value.
    expect(suggestion.giveAmount).toBeCloseTo(3.4313, 4);
    expect(suggestion.wantAmount).toBeCloseTo(2.745, 4);
    // Never more than a quarter of the rich coin.
    expect(suggestion.giveAmount).toBeLessThanOrEqual(holdings.spirit / 4);
  });

  it("sizes to half the scarce coin's gap when that is the smaller bound", () => {
    // Values: Spirit 4, the rest 0 → mean 1. min(gap/2 = 0.5, 4/4 = 1) = 0.5.
    const suggestion = suggestOffer({ spirit: 4, essence: 0, matter: 0, substance: 0 }, PRICES);
    expect(suggestion).toEqual({ giveToken: "Spirit", giveAmount: 0.5, wantToken: "Essence", wantAmount: 0.4 });
  });

  it("caps the give at a quarter of the richest coin's value when the gap is larger", () => {
    // Values: Spirit 10, Essence 0, Matter 10, Substance 10 → mean 7.5.
    // Half the Essence gap is 3.75 value, but a quarter of the richest coin is
    // 2.5 — the cap binds. The three rich coins tie on value; canonical order
    // breaks the tie, leaving Substance as the richest.
    const suggestion = suggestOffer({ spirit: 10, essence: 0, matter: 12.5, substance: 6.25 }, PRICES);
    expect(suggestion).toEqual({
      giveToken: "Substance",
      giveAmount: 1.5625, // 2.5 value / 1.6
      wantToken: "Essence",
      wantAmount: 2, // 2.5 value / 1.25
    });
  });

  it("suggests nothing for a balanced or empty wallet", () => {
    expect(suggestOffer({ spirit: 4, essence: 3.2, matter: 5, substance: 2.5 }, PRICES)).toBeNull();
    expect(suggestOffer({ spirit: 0, essence: 0, matter: 0, substance: 0 }, PRICES)).toBeNull();
  });
});
