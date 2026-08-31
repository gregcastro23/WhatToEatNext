/**
 * @jest-environment node
 *
 * A user charged ESMS must not be left without a recipe.
 *
 * `/api/generate-cosmic-recipe` debits 15-48 ESMS *before* calling Planetary
 * Agents, and every exit after that debit returned without refunding it. The
 * 45s upstream deadline added in `7d737443` did not create the hole, but it
 * converted a class of silent 60s platform kills into a fast, frequent 504 that
 * lands squarely in it.
 *
 * `[MEASURED 2026-08-19]` PA answers this endpoint in 12-34s by its own HTTP
 * log, so the deadline is genuinely reachable in production.
 *
 * What these cases pin, in order of how easy each is to get wrong:
 *
 *  1. A failed generation refunds the exact basket that was debited.
 *  2. A SUCCESSFUL generation refunds nothing — without this, "always refund"
 *     would pass case 1 and hand out free recipes.
 *  3. The refund is keyed on the debit's `transactionGroupId`, so a retry
 *     cannot double-credit. The ledger enforces this via a UNIQUE
 *     `idempotency_key`; the key SHAPE is ours to get right, and keying it on
 *     user+date instead would be silently wrong.
 *  4. A user who was never charged (first free generation of the day) is never
 *     credited. This is the phantom-credit direction, which is worse than the
 *     bug being fixed.
 */

const purchaseShopItem = jest.fn();
const creditMultipleTokensDetailed = jest.fn();
const getShopItem = jest.fn();

import { installFetchMock } from "@/__tests__/helpers/fetchMock";

jest.mock("@/services/TokenEconomyService", () => ({
  tokenEconomy: {
    purchaseShopItem: (...a: unknown[]) => purchaseShopItem(...a),
    creditMultipleTokensDetailed: (...a: unknown[]) =>
      creditMultipleTokensDetailed(...a),
    getShopItem: (...a: unknown[]) => getShopItem(...a),
  },
}));

// Auth'd, non-demo user — the only mode that debits.
jest.mock("@/lib/auth/demoAccess", () => ({
  gateDemoOrAuth: async () => ({ mode: "auth", userId: "user-1" }),
}));

// `recipes_generated = 1` => not the first free generation => the debit runs.
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

jest.mock("@/services/questEventReporter", () => ({
  reportQuestEventBestEffort: async () => undefined,
}));

jest.mock("@/services/FoodDiaryService", () => ({
  foodDiaryService: { getEntries: async () => [] },
}));

jest.mock("@/services/subscriptionService", () => ({
  subscriptionService: { getUserSubscription: async () => ({ tier: "free" }) },
}));

/** Satisfies cosmicRecipeSchema in full — see the note in the success case. */
const VALID_RECIPE = {
  id: "cosmic-test",
  title: "Test",
  short_description: "A test dish.",
  category: "Dinner",
  cuisine: "Fusion",
  difficulty: "beginner",
  yields: 2,
  total_time: 30,
  alignment_score: {
    overall: 90,
    ingredients_fit: 90,
    diet_fit: 100,
    time_fit: 90,
    astro_fit: 80,
  },
  alignment_notes: ["aligned"],
  tags: {
    diet: ["omnivore"],
    cuisine: ["Fusion"],
    meal_type: "Dinner",
    flavor_profile: ["savory"],
    cooking_methods: ["saute"],
    elements: ["fire"],
    planets: ["Mars"],
  },
  ingredients: [
    {
      name: "salt",
      quantity: "1",
      unit: "tsp",
      optional: false,
      substitutions: [],
    },
  ],
  steps: [
    {
      step_number: 1,
      instruction: "Do the thing.",
      time_minutes: 5,
      cooking_method: "mix",
      tips: [],
    },
  ],
  elementalBalance: { fire: 25, earth: 40, water: 15, air: 20 },
  nutrition: { calories: 400, protein: 20, carbohydrates: 30, fat: 12 },
  finishing_and_serving: {
    garnish_and_plating: "plate it",
    doneness_cues: "golden",
    serving_suggestions: "hot",
  },
  leftovers_and_storage: {
    can_store: true,
    storage_instructions: "fridge",
    storage_lifespan_days: 3,
  },
  astro_explanation: { summary: "Mars day.", correspondences: ["fire"] },
};

const DEBIT_GROUP = "grp-abc-123";

function bodyRequest(): Request {
  return new Request("https://alchm.kitchen/api/generate-cosmic-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "something nourishing" }),
  });
}

async function callRoute(): Promise<Response> {
  const mod = await import("@/app/api/generate-cosmic-recipe/route");
  // Call the wrapped POST the way Next.js would.
  return (await (mod.POST as unknown as (r: Request) => Promise<Response>)(
    bodyRequest(),
  )) as Response;
}

describe("cosmic recipe ESMS settlement", () => {
  beforeEach(() => {
    jest.resetModules();
    purchaseShopItem.mockReset();
    creditMultipleTokensDetailed.mockReset();
    getShopItem.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});

    getShopItem.mockResolvedValue({ isActive: true });
    purchaseShopItem.mockResolvedValue({
      success: true,
      transactionGroupId: DEBIT_GROUP,
    });
    creditMultipleTokensDetailed.mockResolvedValue({ status: "applied" });
  });

  afterEach(() => jest.restoreAllMocks());

  it("refunds the exact debited basket when the upstream generation fails", async () => {
    installFetchMock(
      jest
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ detail: "upstream boom" }), { status: 502 }),
        ),
    );

    await callRoute();

    // THE defect: this was never called on any failing exit.
    expect(creditMultipleTokensDetailed).toHaveBeenCalledTimes(1);

    const [userId, credits, sourceType] =
      creditMultipleTokensDetailed.mock.calls[0];
    expect(userId).toBe("user-1");
    expect(sourceType).toBe("cosmic_recipe_refund");
    // Exact basket, not an approximation — debit and credit must net to zero.
    expect(credits).toEqual([
      { tokenType: "Spirit", amount: 7.5 },
      { tokenType: "Essence", amount: 7.5 },
      { tokenType: "Matter", amount: 7.5 },
      { tokenType: "Substance", amount: 7.5 },
    ]);
  });

  it("keys the refund on the debit's transaction group so a retry cannot double-credit", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue(new Response("{}", { status: 502 })),
    );

    await callRoute();

    const opts = creditMultipleTokensDetailed.mock.calls[0][3];
    // The ledger's UNIQUE idempotency_key does the enforcing; the SHAPE is
    // ours. A user+date key would collide globally across users' refunds.
    expect(opts.idempotencyKey).toBe(`cosmic_recipe_refund:${DEBIT_GROUP}`);
    expect(opts.sourceId).toBe(DEBIT_GROUP);
  });

  it("does NOT refund when the recipe was actually delivered", async () => {
    // Control. Without this, an unconditional refund passes both cases above
    // and every paid generation becomes free.
    installFetchMock(
      jest.fn().mockResolvedValue(
        new Response(JSON.stringify(VALID_RECIPE), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const res = await callRoute();

    // Assert the branch FIRST. An earlier draft of this file used a fixture
    // that failed cosmicRecipeSchema, so the route took the 502 schema-drift
    // exit and "no refund" was being asserted on a path that SHOULD refund —
    // a green test proving the opposite of its name.
    expect(res.status).toBe(200);
    expect(creditMultipleTokensDetailed).not.toHaveBeenCalled();
  });

  it("never credits a user who was never charged", async () => {
    // `already_owned` moves no balance and carries no transactionGroupId.
    // Crediting here would invent ESMS out of nothing.
    purchaseShopItem.mockResolvedValue({
      success: false,
      reason: "already_owned",
    });
    installFetchMock(
      jest.fn().mockResolvedValue(new Response("{}", { status: 502 })),
    );

    await callRoute();

    expect(creditMultipleTokensDetailed).not.toHaveBeenCalled();
  });

  it("passes client idempotencyKey / requestId to purchaseShopItem for deduplication", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue(
        new Response(JSON.stringify(VALID_RECIPE), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const mod = await import("@/app/api/generate-cosmic-recipe/route");
    const req = new Request("https://alchm.kitchen/api/generate-cosmic-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "client-req-999",
      },
      body: JSON.stringify({ prompt: "something nourishing", requestId: "client-req-999" }),
    });

    const res = await (mod.POST as unknown as (r: Request) => Promise<Response>)(req);
    expect(res.status).toBe(200);

    expect(purchaseShopItem).toHaveBeenCalledWith(
      "user-1",
      "unlock-cosmic-recipe",
      expect.objectContaining({
        idempotencyKey: "cosmic_recipe_debit:client-req-999",
      }),
    );
  });

  it("returns 409 when debit was already_applied (duplicate request)", async () => {
    purchaseShopItem.mockResolvedValue({
      success: false,
      reason: "already_applied",
    });
    const fetchSpy = installFetchMock(jest.fn());

    const mod = await import("@/app/api/generate-cosmic-recipe/route");
    const req = new Request("https://alchm.kitchen/api/generate-cosmic-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": "client-req-dup",
      },
      body: JSON.stringify({ prompt: "something nourishing" }),
    });

    const res = await (mod.POST as unknown as (r: Request) => Promise<Response>)(req);
    expect(res.status).toBe(409);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
