/**
 * Tests for the MCP tool handlers (`invokeTool` + the underlying
 * generators). The DB-writing modules (`./invocationLog`, the token
 * service) are mocked so the tests focus on tool logic + auth-gate
 * behavior without needing a live Postgres.
 *
 * A separate integration test (mcp-server/src/__tests__/stdio.test.ts)
 * spawns the actual MCP transport — that test only runs when MCP_E2E=1
 * is set, so unit-test cycles stay fast.
 */

jest.mock("@/lib/mcp/invocationLog", () => ({
  recordInvocation: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/services/AlchemicalService", () => ({
  alchemicalService: {
    analyzeAlchemicalHarmony: () => ({
      overallHarmony: 0.85,
      dominantElement: "Fire",
      recommendations: ["balance with cooling herbs"],
    }),
    calculateThermodynamicProperties: () => ({
      heat: 0.6,
      entropy: 0.3,
      reactivity: 0.7,
    }),
  },
}));

jest.mock("@/services/IngredientService", () => ({
  ingredientService: {
    getIngredientByName: (name: string) => {
      // Tomato carries elements but NO curated quantities — the common case, and
      // the one that used to be filled in with Fire * 100.
      if (name === "tomato") {
        return {
          name: "Tomato",
          category: "vegetable",
          elementalProperties: { Fire: 0.5, Water: 0.3, Earth: 0.1, Air: 0.1 },
          planetaryRuler: "Mars",
        };
      }
      // Sage carries curated quantities, like the ~327 catalog entries that do.
      // Deliberately NOT equal to its elements, so the two can be told apart.
      if (name === "sage") {
        return {
          name: "Sage",
          category: "herb",
          elementalProperties: { Fire: 0.5, Water: 0.3, Earth: 0.1, Air: 0.1 },
          alchemicalProperties: { Spirit: 0.32, Essence: 0.21, Matter: 0.24, Substance: 0.23 },
          planetaryRuler: "Jupiter",
        };
      }
      return null;
    },
  },
}));

jest.mock("@/services/natalChartService", () => ({
  calculateNatalChart: jest.fn().mockResolvedValue({
    elementalBalance: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
    planetaryPositions: {
      Sun: { sign: "leo", degree: 15 },
      Moon: { sign: "scorpio", degree: 8 },
    },
  }),
}));

jest.mock("@/services/RecipeService", () => ({
  recipeService: {
    searchRecipes: jest.fn().mockResolvedValue([
      {
        id: "r1",
        name: "Spicy Tomato Soup",
        description: "A warming bowl",
        cuisine: "Italian",
        timeToMake: "30 MIN",
        numberOfServings: 4,
        elementalProperties: { Fire: 0.5, Water: 0.3, Earth: 0.1, Air: 0.1 },
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: true,
        isDairyFree: true,
        ingredients: [
          { amount: 4, unit: "cups", name: "tomato", preparation: "diced" },
        ],
        instructions: ["Simmer", "Blend", "Serve"],
      },
    ]),
  },
}));

jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: {
    createEvent: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock("@/lib/database/connection", () => ({
  executeQuery: jest.fn().mockImplementation(async (sql: string) => {
    if (sql.includes("recipe_reflections")) {
      return {
        rows: [
          {
            id: "reflection-123",
            recipe_id: "recipe-cosmic-1",
            author_id: "agent-123",
            publication_id: null,
            feed_event_id: null,
            delivery_key: null,
            source: "mcp_reflection",
            content_state: "reviewed",
            review: "reflection",
            score: null,
            is_agent: true,
            instruction_review_required: true,
            provenance: {},
            created_at: "2026-10-17T12:00:00.000Z",
            updated_at: "2026-10-17T12:00:00.000Z",
            deleted_at: null,
            hidden: false,
          },
        ],
        rowCount: 1,
      };
    }
    return {
      rows: [{ id: "agent-123", name: "Leonardo da Vinci" }],
      rowCount: 1,
    };
  }),
}));

jest.mock("@/lib/mcp/auth", () => ({
  resolveCaller: jest.fn().mockImplementation(async (args?: Record<string, unknown>) => ({
    userId: typeof args?._meta === "object" && args?._meta !== null ? "user-456" : null,
    apiKeyId: null,
    caller: "test",
    isSynthetic: false,
    rateLimitTier: null,
  })),
  debitForTool: jest
    .fn()
    .mockResolvedValue({ applied: false, reason: "anonymous-caller", amounts: null }),
  TOOL_COSTS: {},
}));

jest.mock("@/lib/mcp/rateLimit", () => ({
  checkMcpRateLimit: jest.fn().mockReturnValue({
    allowed: true,
    remaining: 999,
    limit: 60,
    resetMs: 60_000,
  }),
  __resetMcpRateLimit: jest.fn(),
}));

import { debitForTool } from "@/lib/mcp/auth";
import { recordInvocation } from "@/lib/mcp/invocationLog";
import { invokeTool } from "@/lib/mcp/tools";
import { calculateNatalChart } from "@/services/natalChartService";

const mockedDebit = debitForTool as jest.MockedFunction<typeof debitForTool>;
const mockedRecord = recordInvocation as jest.MockedFunction<
  typeof recordInvocation
>;

describe("invokeTool", () => {
  beforeEach(() => {
    mockedRecord.mockClear();
    mockedDebit.mockClear();
    mockedDebit.mockResolvedValue({
      applied: false,
      reason: "anonymous-caller",
      amounts: null,
    });
  });

  it("get_live_sky_transits returns dominantElement + planetaryPositions", async () => {
    const result = await invokeTool("get_live_sky_transits", {
      latitude: 40,
      longitude: -73,
    });
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({
      dominantElement: "Fire",
      coordinates: { latitude: 40, longitude: -73 },
    });
    expect(result.summary.dominantElement).toBe("Fire");
    expect(mockedRecord).toHaveBeenCalledTimes(1);
  });

  it("alchemize_ingredients rejects empty input with INVALID_ARGS", async () => {
    const result = await invokeTool("alchemize_ingredients", {
      ingredients: [],
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(result.errorMessage).toMatch(/ingredients\[\]/);
  });

  it("alchemize_ingredients reports elements, and null quantities when uncurated", async () => {
    const result = await invokeTool("alchemize_ingredients", {
      ingredients: ["tomato"],
    });
    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({
      ingredientCount: 1,
      dominantElement: "Fire",
    });

    const data = result.data as {
      aggregateBalances: unknown;
      esmsCoverage: { withQuantities: number; total: number };
      ingredients: { esms: unknown; esmsSource: unknown }[];
    };
    // Regression: this used to report spirit = Fire * 100 = 50. Quantities come
    // from planets or curated data — an ingredient has neither here, so the
    // honest answer is "none", not the elemental vector relabelled.
    expect(data.ingredients[0].esms).toBeNull();
    expect(data.ingredients[0].esmsSource).toBeNull();
    expect(data.aggregateBalances).toBeNull();
    expect(data.esmsCoverage).toEqual({ withQuantities: 0, total: 1 });
  });

  it("alchemize_ingredients uses curated quantities, not the elemental vector", async () => {
    const result = await invokeTool("alchemize_ingredients", {
      ingredients: ["sage"],
    });
    expect(result.ok).toBe(true);

    const data = result.data as {
      aggregateBalances: { spirit: number; essence: number };
      esmsCoverage: { withQuantities: number; total: number };
      ingredients: { esms: { spirit: number }; esmsSource: string }[];
    };
    // Sage's curated Spirit is 0.32 -> 32. Its Fire is 0.5, so the old
    // derivation would have said 50: the two must not coincide.
    expect(data.ingredients[0].esms.spirit).toBe(32);
    expect(data.ingredients[0].esms.spirit).not.toBe(50);
    expect(data.ingredients[0].esmsSource).toBe("ingredient-data");
    expect(data.aggregateBalances.spirit).toBe(32);
    expect(data.esmsCoverage).toEqual({ withQuantities: 1, total: 1 });
  });

  it("generate_cosmic_recipe returns recipes when no token gate triggers", async () => {
    const result = await invokeTool("generate_cosmic_recipe", {
      prompt: "tomato",
    });
    expect(result.ok).toBe(true);
    expect(result.summary.returnedCount).toBe(1);
    expect(
      (result.data as { recipes: Array<{ name: string }> }).recipes[0].name,
    ).toBe("Spicy Tomato Soup");
  });

  it("generate_cosmic_recipe returns QUOTA when debit reports insufficient balance", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: false,
      reason: "insufficient-spirit",
      amounts: null,
    });
    const result = await invokeTool("generate_cosmic_recipe", {
      prompt: "tomato",
      _meta: { apiKey: "fake-key" },
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("QUOTA");
    expect(result.errorMessage).toMatch(/insufficient-spirit/);
  });

  it("logs an invocation for every call (success and failure)", async () => {
    await invokeTool("alchemize_ingredients", { ingredients: [] });
    await invokeTool("get_live_sky_transits", {});
    // Logger runs as fire-and-forget — let the microtask queue flush.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockedRecord).toHaveBeenCalledTimes(2);
    const calls = mockedRecord.mock.calls.map((c) => c[0].toolName);
    expect(calls).toEqual([
      "alchemize_ingredients",
      "get_live_sky_transits",
    ]);
  });

  it("passes a perf-mark + ISO timestamp pair as timing to recordInvocation", async () => {
    await invokeTool("alchemize_ingredients", { ingredients: ["tomato"] });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const timing = mockedRecord.mock.calls[0][1] as {
      startedAt: number;
      calledAtIso: string;
    };
    expect(typeof timing.startedAt).toBe("number");
    expect(Number.isFinite(timing.startedAt)).toBe(true);
    expect(timing.startedAt).toBeGreaterThanOrEqual(0);
    expect(typeof timing.calledAtIso).toBe("string");
    expect(timing.calledAtIso).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  it("returns NOT_FOUND for unknown tools", async () => {
    const result = await invokeTool(
      "nonsense_tool" as unknown as Parameters<typeof invokeTool>[0],
      {},
    );
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("NOT_FOUND");
  });

  it("surfaces the error.cause chain when a handler throws", async () => {
    const mockedChart = calculateNatalChart as jest.MockedFunction<
      typeof calculateNatalChart
    >;
    const root = new Error("Astrologize API error: Unauthorized");
    const wrapped = new Error(
      "Failed to calculate natal chart. Please check birth data and try again.",
      { cause: root },
    );
    mockedChart.mockRejectedValueOnce(wrapped);

    const result = await invokeTool("get_live_sky_transits", {});
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("INTERNAL");
    expect(result.errorMessage).toBe(
      "Failed to calculate natal chart. Please check birth data and try again. ← Astrologize API error: Unauthorized",
    );
  });

  it("compute_triplicate_synastry evaluates trine alignment with transit sky catalyst", async () => {
    const result = await invokeTool("compute_triplicate_synastry", {
      makerId: "maker-1",
      takerId: "taker-1",
      makerNatal: [
        { planet: "Sun", sign: "Aries", degree: 15 },
        { planet: "Mars", sign: "Leo", degree: 15 },
      ],
      takerNatal: [
        { planet: "Moon", sign: "Sagittarius", degree: 15 },
        { planet: "Venus", sign: "Aries", degree: 15 },
      ],
      giveToken: "Spirit",
      giveAmount: 10,
      wantToken: "Essence",
      wantAmount: 10,
      transitTime: "2026-10-17T12:00:00Z",
    });

    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toMatchObject({
      qualifies: expect.any(Boolean),
      windowKey: expect.stringMatching(/^triplicate_window:/),
    });
    expect(result.summary.qualifies).toBeDefined();
  });

  it("compute_triplicate_synastry rejects invalid token types", async () => {
    const result = await invokeTool("compute_triplicate_synastry", {
      makerId: "maker-1",
      takerId: "taker-1",
      makerNatal: {},
      takerNatal: {},
      giveToken: "InvalidToken",
      giveAmount: 10,
      wantToken: "Essence",
      wantAmount: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(result.errorMessage).toMatch(/Invalid 'giveToken'/);
  });

  it("create_evidence_snapshot bundles transits, ingredients, and recipes in parallel", async () => {
    const result = await invokeTool("create_evidence_snapshot", {
      latitude: 40.7128,
      longitude: -74.006,
      ingredients: ["tomato", "sage"],
      prompt: "tomato",
      cuisine: "Italian",
      dominantElement: "Fire",
    });

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({
      snapshotId: expect.any(String),
      liveSky: expect.objectContaining({ dominantElement: "Fire" }),
      alchemicalScan: expect.objectContaining({ ingredientCount: 2 }),
      candidateRecipes: expect.objectContaining({ returnedCount: 1 }),
      timestamp: expect.any(String),
    });
    expect(result.summary.hasAlchemicalScan).toBe(true);
  });

  it("submit_recipe_reflection persists reflection and mirrors to feed and interactions", async () => {
    const result = await invokeTool("submit_recipe_reflection", {
      recipeId: "recipe-cosmic-1",
      recipeName: "Spicy Solar Broth",
      reflection: "An exquisite balance of Fire and Earth, warming the humors.",
      agentSlug: "leonardo-da-vinci",
      agentName: "Leonardo da Vinci",
      dominantElement: "Fire",
      _meta: { apiKey: "test-key" },
    });

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({
      recipeId: "recipe-cosmic-1",
      authorId: "agent-123",
      agentSlug: "leonardo-da-vinci",
      agentName: "Leonardo da Vinci",
      reflection: "An exquisite balance of Fire and Earth, warming the humors.",
      published: true,
    });
    expect(result.summary.published).toBe(true);
  });

  it("submit_recipe_reflection returns INVALID_ARGS for missing recipeId or reflection", async () => {
    const res1 = await invokeTool("submit_recipe_reflection", {
      reflection: "Tasty dish",
      _meta: { apiKey: "test-key" },
    });
    expect(res1.ok).toBe(false);
    expect(res1.errorCode).toBe("INVALID_ARGS");

    const res2 = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "   ",
      _meta: { apiKey: "test-key" },
    });
    expect(res2.ok).toBe(false);
    expect(res2.errorCode).toBe("INVALID_ARGS");
  });

  it("submit_recipe_reflection returns QUOTA when balance is insufficient", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: false,
      reason: "insufficient-spirit",
      amounts: null,
    });
    const result = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "Deep culinary critique.",
      _meta: { apiKey: "low-balance-key" },
    });
    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("QUOTA");
    expect(result.errorMessage).toMatch(/insufficient-spirit/);
  });
});
