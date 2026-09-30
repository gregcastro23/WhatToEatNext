/**
 * @jest-environment node
 *
 * /api/generate-cosmic-recipe × the Swapping Bridge.
 *
 * The route asks for auto-swap by default, tells the client how the recipe was
 * paid (including every swap leg), and — the part that is easy to get wrong —
 * refunds a failed generation NET of the swap, so the user ends exactly where
 * they started instead of keeping the coins the bridge delivered on top of a
 * full-basket refund.
 */

const purchaseShopItem = jest.fn();
const creditMultipleTokensDetailed = jest.fn();
const getShopItem = jest.fn();

import { NextRequest } from "next/server";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { VALID_RECIPE } from "./helpers/validCosmicRecipe";

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    purchaseShopItem: (...a: unknown[]) => purchaseShopItem(...a),
    creditMultipleTokensDetailed: (...a: unknown[]) =>
      creditMultipleTokensDetailed(...a),
    getShopItem: (...a: unknown[]) => getShopItem(...a),
  },
}));

jest.mock("@/lib/auth/demoAccess", () => ({
  gateDemoOrAuth: async () => ({ mode: "auth", userId: "user-1" }),
}));

// `recipes_generated = 1` => not the first free generation => the debit runs.
jest.mock("@/lib/database", () => ({
  executeQuery: async () => ({ rows: [{ recipes_generated: 1 }] }),
}));

// The migration-90 base, priced at a flat 1.0 multiplier.
jest.mock("@/lib/economy/livePricing", () => ({
  getPersonalizedPricingContext: async () => ({ personalized: false, multiplier: 1 }),
  applyPersonalizedPricing: () => ({ spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 }),
}));

jest.mock("@/services/questEventReporter", () => ({
  reportQuestEventBestEffort: async () => undefined,
}));

jest.mock("@/services/FoodDiaryService", () => ({
  foodDiaryService: { getEntries: async () => [] },
}));

const GROUP = "grp-swap-1";

/** Two legs out of Spirit, exactly as the bridge would report them. */
const EXECUTION = {
  basis: "eei-relative-parity",
  spread: 0,
  legs: [
    { fromToken: "Spirit", toToken: "Essence", fromAmount: 3.125, toAmount: 2.5, rate: 1.25 },
    { fromToken: "Spirit", toToken: "Matter", fromAmount: 1.2, toAmount: 1.5, rate: 0.8 },
  ],
  prices: { Spirit: 1, Essence: 1.25, Matter: 0.8, Substance: 1.6 },
  priceBucketStartUtc: "2026-09-30T12:00:00.000Z",
  degraded: null,
};

async function post(body: Record<string, unknown> = {}): Promise<Response> {
  const mod = await import("@/app/api/generate-cosmic-recipe/route");
  return mod.POST(
    new NextRequest("https://alchm.kitchen/api/generate-cosmic-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "something nourishing", ...body }),
    }),
  );
}

const recipeOk = () =>
  installFetchMock(
    jest.fn().mockResolvedValue(
      new Response(JSON.stringify(VALID_RECIPE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );

describe("cosmic recipe × Swapping Bridge", () => {
  beforeEach(() => {
    jest.resetModules();
    purchaseShopItem.mockReset();
    creditMultipleTokensDetailed.mockReset();
    getShopItem.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
    getShopItem.mockResolvedValue({
      isActive: true,
      costSpirit: 2.5,
      costEssence: 2.5,
      costMatter: 2.5,
      costSubstance: 2.5,
    });
    purchaseShopItem.mockResolvedValue({
      success: true,
      transactionGroupId: GROUP,
      autoSwap: EXECUTION,
    });
    creditMultipleTokensDetailed.mockResolvedValue({ status: "credited" });
  });

  afterEach(() => jest.restoreAllMocks());

  it("asks for auto-swap by default, and passes an explicit opt-out through", async () => {
    recipeOk();
    await post();
    expect(purchaseShopItem.mock.calls[0][2]).toMatchObject({ autoSwap: true });

    purchaseShopItem.mockClear();
    recipeOk();
    await post({ autoSwap: false });
    expect(purchaseShopItem.mock.calls[0][2]).toMatchObject({ autoSwap: false });
  });

  it("surfaces how the recipe was paid — basket, group and every swap leg — on the 200", async () => {
    recipeOk();
    const res = await post();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.payment).toEqual({
      charged: true,
      costs: { spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 },
      transactionGroupId: GROUP,
      autoSwap: EXECUTION,
    });
  });

  it("reports autoSwap: null when the basket was paid as-is", async () => {
    purchaseShopItem.mockResolvedValue({ success: true, transactionGroupId: GROUP, autoSwap: null });
    recipeOk();
    const body = await (await post()).json();
    expect(body.payment).toMatchObject({ charged: true, autoSwap: null });
  });

  it("refunds a failed generation NET of the swap, restoring the user exactly", async () => {
    installFetchMock(jest.fn().mockResolvedValue(new Response("{}", { status: 502 })));
    await post();

    expect(creditMultipleTokensDetailed).toHaveBeenCalledTimes(1);
    const [, credits, source, opts] = creditMultipleTokensDetailed.mock.calls[0];
    expect(source).toBe("cosmic_recipe_refund");
    expect(opts.idempotencyKey).toBe(`cosmic_recipe_refund:${GROUP}`);
    // Spirit: 2.5 paid + 3.125 + 1.2 swapped away comes back.
    // Essence: 2.5 paid − 2.5 the swap delivered = 0 (it was never theirs).
    // Matter: 2.5 paid − 1.5 delivered = 1.0.  Substance: paid as-is, 2.5.
    expect(credits).toEqual([
      { tokenType: "Spirit", amount: 6.825 },
      { tokenType: "Essence", amount: 0 },
      { tokenType: "Matter", amount: 1 },
      { tokenType: "Substance", amount: 2.5 },
    ]);
  });

  it("402s with every axis in the copy and the bridge's reason attached", async () => {
    purchaseShopItem.mockResolvedValue({
      success: false,
      reason: "insufficient_funds",
      autoSwap: {
        reason: "insufficient_value",
        shortfallValue: 4.2,
        deficits: { spirit: 0, essence: 2.5, matter: 2.5, substance: 2.5 },
      },
    });
    const fetchSpy = installFetchMock(jest.fn());
    const res = await post();

    expect(res.status).toBe(402);
    expect(fetchSpy).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.autoSwap).toMatchObject({ reason: "insufficient_value", shortfallValue: 4.2 });
    // The old copy named only Spirit and Essence of a four-axis charge.
    expect(body.message).toContain("2.50 Spirit, 2.50 Essence, 2.50 Matter and 2.50 Substance");
    expect(body.message).toContain("even after swapping surplus coins");
  });

  it("says so when the bridge could not run because rates were unavailable", async () => {
    purchaseShopItem.mockResolvedValue({
      success: false,
      reason: "insufficient_funds",
      autoSwap: { reason: "rates_unavailable", shortfallValue: null, deficits: null },
    });
    installFetchMock(jest.fn());
    const body = await (await post()).json();
    expect(body.message).toContain("Live exchange rates are unavailable");
  });

  it("omits the swap explanation when auto-swap was switched off", async () => {
    purchaseShopItem.mockResolvedValue({ success: false, reason: "insufficient_funds" });
    installFetchMock(jest.fn());
    const body = await (await post({ autoSwap: false })).json();
    expect(body).not.toHaveProperty("autoSwap");
    expect(body.message).not.toContain("swapping");
  });
});
