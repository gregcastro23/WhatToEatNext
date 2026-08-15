/**
 * USD rails (ADR-011 §2): the only two honest USD facts about a token, each
 * absent when unconfigured. The env discipline follows restaurantEsms.test /
 * cryptoPromo.test: delete in beforeEach, assert the honest-absence branch.
 */

import { getUsdRails } from "@/lib/economy/usdRails";

const RAIL_ENVS = [
  "STRIPE_MCP_TOP_UP_5_PRICE_ID",
  "STRIPE_MCP_TOP_UP_20_PRICE_ID",
  "STRIPE_MCP_TOP_UP_50_PRICE_ID",
  "NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN",
];

describe("getUsdRails", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of RAIL_ENVS) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of RAIL_ENVS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("returns null rails when nothing is configured — absence, not a guess", () => {
    expect(getUsdRails()).toEqual({
      mintPerTokenUsd: null,
      mintSource: null,
      redeemPerTokenUsd: null,
      redeemSource: null,
    });
  });

  it("derives the mint rail from the smallest configured SKU ($5 → 50/axis → $0.025)", () => {
    process.env.STRIPE_MCP_TOP_UP_5_PRICE_ID = "price_test_5";
    const rails = getUsdRails();
    expect(rails.mintPerTokenUsd).toBeCloseTo(0.025, 10);
    expect(rails.mintSource).toBe("mcp_top_up_5");
  });

  it("uses the smallest AVAILABLE SKU when the starter is not configured", () => {
    process.env.STRIPE_MCP_TOP_UP_20_PRICE_ID = "price_test_20";
    const rails = getUsdRails();
    // $20 → 250/axis → 1000 tokens → $0.02: the marginal rate of what is
    // actually purchasable, not of a SKU that cannot be bought.
    expect(rails.mintPerTokenUsd).toBeCloseTo(0.02, 10);
    expect(rails.mintSource).toBe("mcp_top_up_20");
  });

  it("prefers the smaller SKU when several are configured (marginal, undiscounted)", () => {
    process.env.STRIPE_MCP_TOP_UP_5_PRICE_ID = "price_test_5";
    process.env.STRIPE_MCP_TOP_UP_50_PRICE_ID = "price_test_50";
    expect(getUsdRails().mintSource).toBe("mcp_top_up_5");
  });

  it("ignores SKUs whose env value is not a Stripe price id", () => {
    process.env.STRIPE_MCP_TOP_UP_5_PRICE_ID = "not-a-price-id";
    expect(getUsdRails().mintPerTokenUsd).toBeNull();
  });

  it("derives the redeem rail from the published cents-per-token rate", () => {
    process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN = "1";
    const rails = getUsdRails();
    expect(rails.redeemPerTokenUsd).toBeCloseTo(0.01, 10);
    expect(rails.redeemSource).toBe("NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN");
  });

  it("treats a non-positive-integer rate as unset (restaurantEsms contract)", () => {
    process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN = "1.5";
    expect(getUsdRails().redeemPerTokenUsd).toBeNull();
    process.env.NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN = "0";
    expect(getUsdRails().redeemPerTokenUsd).toBeNull();
  });
});
