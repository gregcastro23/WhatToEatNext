/**
 * @jest-environment node
 *
 * The Alchemical Midpoint was a premium feature; the tier is retired, so each
 * calculation now costs ESMS (3 base, owner ruling 2026-09-28), collected once
 * the midpoint is computed. A refused charge withholds the result.
 */

const mockQuote = jest.fn();
const mockCollect = jest.fn();

import { NextResponse, NextRequest } from "next/server";

jest.mock("@/lib/economy/featureCharge", () => ({
  quoteFeature: (...a: unknown[]) => mockQuote(...a),
  collectOrRefuse: (...a: unknown[]) => mockCollect(...a),
}));

const PAYER = { id: "user-1", roles: ["user"], email: "a@example.com", profile: {} };

jest.mock("@/lib/auth/validateRequest", () => ({
  getDatabaseUserFromRequest: async () => PAYER,
}));

jest.mock("@/lib/rateLimit", () => ({ rateLimit: async () => ({ allowed: true }) }));

jest.mock("@/lib/validation/apiSchemas", () => {
  const actual = jest.requireActual<Record<string, unknown>>("@/lib/validation/apiSchemas");
  const { z } = jest.requireActual<typeof import("zod")>("zod");
  return {
    ...actual,
    AdeptTableRequestSchema: z.object({ hostData: z.any(), friendData: z.any() }),
  };
});

jest.mock("@/services/groupNatalChartService", () => ({
  calculateCompositeNatalChart: () => ({
    dominantElement: "Water",
    alchemicalProperties: { Spirit: 25, Essence: 25, Matter: 25, Substance: 25 },
  }),
}));

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: { getAllRecipes: async () => [{ id: "r1", name: "Soup" }] },
}));

jest.mock("@/lib/recipes/recipeRefResolver", () => ({
  withAuthoredFactsAll: async (recipes: unknown[]) => recipes,
}));

async function midpoint(): Promise<Response> {
  const mod = await import("@/app/api/adept-table/route");
  return await mod.POST(
    new NextRequest("https://alchm.kitchen/api/adept-table", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostData: { birthData: {} }, friendData: { birthData: {} } }),
    }),
  );
}

describe("Alchemical Midpoint charges on delivery", () => {
  beforeEach(() => {
    jest.resetModules();
    mockQuote.mockReset().mockResolvedValue({ feature: "alchemicalMidpoint", exempt: false });
    mockCollect.mockReset().mockResolvedValue(null);
  });

  it("quotes the midpoint for the caller and returns the result once paid", async () => {
    const res = await midpoint();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(expect.objectContaining({ success: true, recipes: expect.any(Array) }));
    expect(mockQuote).toHaveBeenCalledWith(PAYER, "alchemicalMidpoint");
    expect(mockCollect).toHaveBeenCalledTimes(1);
  });

  it("withholds the composite chart when the charge is refused", async () => {
    mockCollect.mockResolvedValue(NextResponse.json({ success: false, reason: "insufficient_tokens", message: "costs" }, { status: 402 }));

    const res = await midpoint();
    const body = await res.json();

    expect(res.status).toBe(402);
    expect(body).not.toHaveProperty("compositeChart");
    expect(body).not.toHaveProperty("recipes");
  });
});
