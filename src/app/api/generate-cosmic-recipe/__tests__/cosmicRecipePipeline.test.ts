/**
 * @jest-environment node
 *
 * Tests for the Resilient Cosmic Recipe Pipeline in /api/generate-cosmic-recipe:
 * 1. Fast verification gate blocking finding triggers structured retry within budget.
 * 2. Upstream TimeoutError (45s) does NOT retry to protect Vercel 60s hard kill, and refunds immediately.
 * 3. Upstream fast 502 triggers retry and delivers on attempt 2.
 * 4. Repeated gate failures refund exactly once and do not increment daily limits.
 *
 * @file src/app/api/generate-cosmic-recipe/__tests__/cosmicRecipePipeline.test.ts
 */

import { NextRequest } from "next/server";
import { VALID_RECIPE } from "./helpers/validCosmicRecipe";

const DEBIT_GROUP_ID = "grp_test_pipeline_debit_1";

const purchaseShopItem = jest.fn();
const creditMultipleTokensDetailed = jest.fn();
const getShopItem = jest.fn();

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    getShopItem: (...args: unknown[]) => getShopItem(...args),
    purchaseShopItem: (...args: unknown[]) => purchaseShopItem(...args),
    creditMultipleTokensDetailed: (...args: unknown[]) =>
      creditMultipleTokensDetailed(...args),
  },
  refundBasketAfterSwap: jest.fn(
    (costs: { spirit: number; essence: number; matter: number; substance: number }) => ({
      ...costs,
    }),
  ),
}));

jest.mock("@/lib/auth/demoAccess", () => ({
  gateDemoOrAuth: async () => ({ mode: "auth", userId: "pipeline-user-1" }),
}));

jest.mock("@/lib/database", () => ({
  executeQuery: async () => ({ rows: [{ recipes_generated: 1 }] }),
}));

jest.mock("@/lib/economy/livePricing", () => ({
  getPersonalizedPricingContext: async () => ({
    personalized: true,
    multiplier: 1,
  }),
  applyPersonalizedPricing: () => ({
    spirit: 7.5,
    essence: 7.5,
    matter: 7.5,
    substance: 7.5,
  }),
}));

jest.mock("@/lib/serviceUrls", () => ({
  getServiceUrl: jest.fn().mockReturnValue("https://api.agents.alchm.kitchen"),
}));

import { installFetchMock } from "@/__tests__/helpers/fetchMock";

function makeRequest(body: Record<string, unknown> = {}): NextRequest {
  return new NextRequest("http://localhost:3000/api/generate-cosmic-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "cosmic chicken skillet", ...body }),
  });
}

describe("Resilient Cosmic Recipe Pipeline", () => {
  beforeEach(async () => {
    jest.resetModules();
    purchaseShopItem.mockReset();
    creditMultipleTokensDetailed.mockReset();
    getShopItem.mockReset();
    const { resetRecipePipelineTelemetry } = await import(
      "@/lib/cooking/recipePipelineTelemetry"
    );
    resetRecipePipelineTelemetry();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    // jest.spyOn(console, "error").mockImplementation(() => {});

    getShopItem.mockResolvedValue({ isActive: true });
    purchaseShopItem.mockResolvedValue({
      success: true,
      transactionGroupId: DEBIT_GROUP_ID,
    });
    creditMultipleTokensDetailed.mockResolvedValue({ status: "applied" });
  });

  afterEach(() => jest.restoreAllMocks());

  it("retries on fast gate-blocking unsafe temperature, succeeds on attempt 2 with structured feedback, debits once, and never refunds", async () => {
    const unsafeRecipe = JSON.parse(JSON.stringify(VALID_RECIPE));
    unsafeRecipe.ingredients = [
      { name: "chicken breast", quantity: "1", unit: "lb", optional: false, substitutions: [] },
    ];
    unsafeRecipe.steps = [
      {
        step_number: 1,
        instruction: "Cook chicken breast to 140°F internal temp.",
        time_minutes: 15,
        cooking_method: "bake",
        tips: [],
      },
    ];

    const safeRecipe = JSON.parse(JSON.stringify(VALID_RECIPE));
    safeRecipe.ingredients = [
      { name: "chicken breast", quantity: "1", unit: "lb", optional: false, substitutions: [] },
    ];
    safeRecipe.steps = [
      {
        step_number: 1,
        instruction: "Cook chicken breast to 165°F internal safe temp.",
        time_minutes: 25,
        cooking_method: "bake",
        tips: [],
      },
    ];

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(unsafeRecipe), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(safeRecipe), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    installFetchMock(fetchMock);

    const mod = await import("@/app/api/generate-cosmic-recipe/route");
    const res = await mod.POST(makeRequest());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.attempts).toBe(2);
    expect(body.verification.verified).toBe(true);

    // Two fetches were made
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Attempt 2 contains structured correction in prompt
    const secondFetchBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondFetchBody.prompt).toContain("[Correction Required]");
    expect(secondFetchBody.prompt).toContain("165°F");

    // Single debit
    expect(purchaseShopItem).toHaveBeenCalledTimes(1);
    // Success after retry never refunds
    expect(creditMultipleTokensDetailed).not.toHaveBeenCalled();

    // Telemetry recorded
    const { getRecipePipelineTelemetryStats } = await import(
      "@/lib/cooking/recipePipelineTelemetry"
    );
    const stats = getRecipePipelineTelemetryStats();
    expect(stats.attempts).toBe(2);
    expect(stats.retries).toBe(1);
    expect(stats.refunds).toBe(0);
    expect(stats.finalFailures).toBe(0);
  });

  it("does not retry when attempt 1 times out (TimeoutError) to protect Vercel 60s limit, and refunds immediately", async () => {
    const timeoutErr = new Error("The operation was aborted due to timeout");
    timeoutErr.name = "TimeoutError";

    const fetchMock = jest.fn().mockRejectedValueOnce(timeoutErr);
    installFetchMock(fetchMock);

    const mod = await import("@/app/api/generate-cosmic-recipe/route");
    const res = await mod.POST(makeRequest());

    expect(res.status).toBe(504);
    const body = await res.json();
    expect(body.error).toContain("timed out");
    expect(body.refunded).toBe(true);
    expect(body.attempts).toBe(1);

    // Only 1 attempt made: avoids double 45s attempt that would exceed 60s
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(purchaseShopItem).toHaveBeenCalledTimes(1);
    // Refund executed immediately
    expect(creditMultipleTokensDetailed).toHaveBeenCalledTimes(1);
  });

  it("retries when attempt 1 returns fast 502, delivers on attempt 2, and does not refund", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "upstream flake" }), { status: 502 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(VALID_RECIPE), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    installFetchMock(fetchMock);

    const mod = await import("@/app/api/generate-cosmic-recipe/route");
    const res = await mod.POST(makeRequest());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.attempts).toBe(2);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(creditMultipleTokensDetailed).not.toHaveBeenCalled();
  });

  it("refunds exactly once when both attempts fail verification gate", async () => {
    const invalidDietRecipe = JSON.parse(JSON.stringify(VALID_RECIPE));
    invalidDietRecipe.ingredients = [
      { name: "ground beef", quantity: "1", unit: "lb", optional: false, substitutions: [] },
    ];
    invalidDietRecipe.tags.diet = ["vegan"];

    const fetchMock = jest
      .fn()
      .mockImplementation(
        () =>
          new Response(JSON.stringify(invalidDietRecipe), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      );

    installFetchMock(fetchMock);

    const mod = await import("@/app/api/generate-cosmic-recipe/route");
    const res = await mod.POST(makeRequest({ diet: "vegan" }));

    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain("failed culinary verification");
    expect(body.refunded).toBe(true);
    expect(body.attempts).toBe(2);

    // Both attempts were made
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Exactly one refund
    expect(creditMultipleTokensDetailed).toHaveBeenCalledTimes(1);
    expect(creditMultipleTokensDetailed).toHaveBeenCalledWith(
      "pipeline-user-1",
      expect.any(Array),
      "cosmic_recipe_refund",
      expect.objectContaining({
        sourceId: DEBIT_GROUP_ID,
        idempotencyKey: `cosmic_recipe_refund:${DEBIT_GROUP_ID}`,
      }),
    );

    // Telemetry shows failure and refund
    const { getRecipePipelineTelemetryStats } = await import(
      "@/lib/cooking/recipePipelineTelemetry"
    );
    const stats = getRecipePipelineTelemetryStats();
    expect(stats.refunds).toBe(1);
    expect(stats.finalFailures).toBe(1);
    expect(stats.retries).toBe(1);
  });
});
