/**
 * Regression test: recipe shop items now charge ALL FOUR ESMS axes.
 *
 * The shop_items seed used to set cost_matter + cost_substance to 0 for
 * `unlock-cosmic-recipe` and `unlock-basic-recipe`. `applyPersonalizedPricing`
 * never produces a non-zero output for a zero base, so the per-call debit
 * only ever moved on Spirit + Essence — independent of the caller's chart.
 *
 * Migration 40 changes the base to a uniform 7.5 / 2.5 each so the
 * personalization layer can shape the actual debit by the caller's
 * natal chart × current sky. This test pins both the new base shape
 * and the invariant ("personalized output is non-zero on every axis
 * the base is non-zero").
 */

import { applyPersonalizedPricing } from "@/lib/economy/livePricing";
import type { PersonalizedPricingContext } from "@/lib/economy/livePricing";

const COSMIC_BASE = {
  spirit: 7.5,
  essence: 7.5,
  matter: 7.5,
  substance: 7.5,
} as const;

const BASIC_BASE = {
  spirit: 2.5,
  essence: 2.5,
  matter: 2.5,
  substance: 2.5,
} as const;

function makeContext(
  perToken: { spirit: number; essence: number; matter: number; substance: number },
): PersonalizedPricingContext {
  return {
    multiplier: 1,
    aNumber: 20,
    dominantElement: "Fire",
    timestamp: new Date().toISOString(),
    perToken,
    natalWeights: { spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25 },
    transitWeights: { spirit: 0.25, essence: 0.25, matter: 0.25, substance: 0.25 },
    personalized: true,
  };
}

describe("applyPersonalizedPricing on recipe shop-item bases", () => {
  it("produces non-zero cost on every axis for the cosmic-recipe base", () => {
    const ctx = makeContext({
      spirit: 1.2,
      essence: 0.95,
      matter: 0.8,
      substance: 1.1,
    });
    const cost = applyPersonalizedPricing(COSMIC_BASE, ctx);
    expect(cost.spirit).toBeGreaterThan(0);
    expect(cost.essence).toBeGreaterThan(0);
    expect(cost.matter).toBeGreaterThan(0);
    expect(cost.substance).toBeGreaterThan(0);
  });

  it("produces non-zero cost on every axis for the basic-recipe base", () => {
    const ctx = makeContext({
      spirit: 1.0,
      essence: 1.0,
      matter: 1.0,
      substance: 1.0,
    });
    const cost = applyPersonalizedPricing(BASIC_BASE, ctx);
    expect(cost.spirit).toBeGreaterThan(0);
    expect(cost.essence).toBeGreaterThan(0);
    expect(cost.matter).toBeGreaterThan(0);
    expect(cost.substance).toBeGreaterThan(0);
  });

  it("scales per-axis cost by the per-token multiplier (chart shape lands on the debit)", () => {
    // Hypothetical caller whose chart heavily favours Matter — Matter is
    // cheap for them, Spirit is expensive.
    const ctx = makeContext({
      spirit: 1.35,
      essence: 1.1,
      matter: 0.65,
      substance: 1.0,
    });
    const cost = applyPersonalizedPricing(COSMIC_BASE, ctx);
    expect(cost.matter).toBeLessThan(cost.spirit);
    expect(cost.matter).toBeLessThan(cost.essence);
    expect(cost.substance).toBeLessThan(cost.spirit);
    // The cheapest axis is below the base, the most expensive above.
    expect(cost.matter).toBeLessThan(COSMIC_BASE.matter);
    expect(cost.spirit).toBeGreaterThan(COSMIC_BASE.spirit);
  });

  it("preserves the at-baseline total (~30 cosmic, ~10 basic) when multipliers are uniform 1.0", () => {
    const uniform = makeContext({
      spirit: 1.0,
      essence: 1.0,
      matter: 1.0,
      substance: 1.0,
    });
    const cosmic = applyPersonalizedPricing(COSMIC_BASE, uniform);
    const basic = applyPersonalizedPricing(BASIC_BASE, uniform);
    const cosmicTotal = cosmic.spirit + cosmic.essence + cosmic.matter + cosmic.substance;
    const basicTotal = basic.spirit + basic.essence + basic.matter + basic.substance;
    expect(cosmicTotal).toBeCloseTo(30, 2);
    expect(basicTotal).toBeCloseTo(10, 2);
  });
});
