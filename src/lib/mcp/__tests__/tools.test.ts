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

const mockInvalidateAgents = jest.fn(async () => {});
jest.mock("@/lib/redis", () => ({
  invalidateCommunityAgentsCache: () => mockInvalidateAgents(),
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
          alchemicalProperties: {
            Spirit: 0.32,
            Essence: 0.21,
            Matter: 0.24,
            Substance: 0.23,
          },
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
    // Absolute longitudes, as the transit overlay reads them.
    planets: [
      { name: "Sun", sign: "leo", position: 135 },
      { name: "Moon", sign: "scorpio", position: 218 },
    ],
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
    publishFeedEvent: jest.fn().mockResolvedValue({
      success: true,
      feedPublished: true,
      event: { id: "feed-event-1" },
      legacyInteractionStatus: "saved",
    }),
    pushAgentFeedWebhook: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/lib/database/connection", () => {
  const executeQuery = jest
    .fn()
    .mockImplementation(async (sql: string, params: unknown[] = []) => {
      if (sql.includes("INSERT INTO recipe_reflections")) {
        // RETURNING echoes the inserted row, as Postgres does.
        const [
          recipe_id,
          author_id,
          publication_id,
          feed_event_id,
          delivery_key,
          source,
          content_state,
          review,
          score,
          is_agent,
          instruction_review_required,
          provenance,
        ] = params;
        return {
          rows: [
            {
              id: "reflection-123",
              recipe_id,
              author_id,
              publication_id,
              feed_event_id,
              delivery_key,
              source,
              content_state,
              review,
              score,
              is_agent,
              instruction_review_required,
              provenance: JSON.parse(String(provenance)),
              created_at: "2026-10-17T12:00:00.000Z",
              updated_at: "2026-10-17T12:00:00.000Z",
              deleted_at: null,
              hidden: false,
            },
          ],
          rowCount: 1,
        };
      }
      // Feed-link updates, and no prior reflection for a delivery key.
      if (sql.includes("recipe_reflections")) return { rows: [], rowCount: 1 };
      return {
        rows: [{ id: "agent-123", name: "Leonardo da Vinci", is_agent: true }],
        rowCount: 1,
      };
    });
  // A transaction's statements reach the same scripted rows as executeQuery;
  // `events` records the boundary statements a real transaction would issue.
  const events: string[] = [];
  const client = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      if (/^(SAVEPOINT|RELEASE|ROLLBACK TO)/.test(sql.trim()))
        events.push(sql.trim());
      return executeQuery(sql, params);
    }),
  };
  return {
    executeQuery,
    withTransaction: jest.fn(
      async (operation: (tx: typeof client) => Promise<unknown>) => {
        events.push("BEGIN");
        try {
          const value = await operation(client);
          events.push("COMMIT");
          return value;
        } catch (error) {
          events.push("ROLLBACK");
          throw error;
        }
      },
    ),
    mockTransaction: { client, events },
  };
});

jest.mock("@/lib/mcp/auth", () => ({
  resolveCaller: jest
    .fn()
    .mockImplementation(async (args?: Record<string, unknown>) => ({
      userId:
        typeof args?._meta === "object" && args?._meta !== null
          ? "agent-123"
          : null,
      apiKeyId:
        typeof args?._meta === "object" && args?._meta !== null
          ? "key-123"
          : null,
      caller: "test",
      isSynthetic: false,
      rateLimitTier: null,
    })),
}));

jest.mock("@/lib/mcp/billing", () => ({
  ...jest.requireActual<typeof import("@/lib/mcp/billing")>("@/lib/mcp/billing"),
  debitForTool: jest
    .fn()
    .mockResolvedValue({ applied: false, reason: "free-tool", amounts: null }),
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

import { executeQuery } from "@/lib/database/connection";
import { resolveCaller } from "@/lib/mcp/auth";
import { debitForTool } from "@/lib/mcp/billing";
import { TOOL_DEFINITIONS, TOOL_NAMES, type ToolName } from "@/lib/mcp/catalog";
import { recordInvocation } from "@/lib/mcp/invocationLog";
import {
  invokeTool,
  structuredToolContent,
  type ToolResult,
} from "@/lib/mcp/tools";
import { validateToolOutput } from "@/lib/mcp/validation";
import { feedDatabase } from "@/services/feedDatabaseService";
import { calculateNatalChart } from "@/services/natalChartService";
import { recipeService } from "@/services/RecipeService";

const mockedDebit = debitForTool as jest.MockedFunction<typeof debitForTool>;
const { mockTransaction } = jest.requireMock<{
  mockTransaction: {
    client: {
      query: jest.Mock<Promise<unknown>, [string, unknown[]?]>;
    };
    events: string[];
  };
}>("@/lib/database/connection");

const RECIPE_COST = { spirit: 2.5, essence: 2.5, matter: 2.5, substance: 2.5 };
const REFLECTION_COST = {
  spirit: 0.1,
  essence: 0.1,
  matter: 0.1,
  substance: 0.1,
};
const mockedRecord = recordInvocation as jest.MockedFunction<
  typeof recordInvocation
>;

describe("invokeTool", () => {
  beforeEach(() => {
    mockedRecord.mockClear();
    mockedDebit.mockClear();
    mockTransaction.events.length = 0;
    mockTransaction.client.query.mockClear();
    jest.mocked(feedDatabase.publishFeedEvent).mockClear();
    jest.mocked(feedDatabase.pushAgentFeedWebhook).mockClear();
    mockedDebit.mockResolvedValue({
      applied: false,
      reason: "free-tool",
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
    expect(calls).toEqual(["alchemize_ingredients", "get_live_sky_transits"]);
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
      makerNatal: [{ planet: "Sun", sign: "Aries", degree: 15 }],
      takerNatal: [{ planet: "Moon", sign: "Leo", degree: 10 }],
      giveToken: "InvalidToken",
      giveAmount: 10,
      wantToken: "Essence",
      wantAmount: 10,
    });

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(result.errorMessage).toMatch(/giveToken/);
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
  it("validates before resolving credentials or charging", async () => {
    const resolve = jest.mocked(resolveCaller);
    resolve.mockClear();
    const result = await invokeTool("generate_cosmic_recipe", {
      dietary: [42],
    });
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(mockedDebit).not.toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();
  });

  it.each([
    ["get_live_sky_transits", { latitude: 91 }],
    ["alchemize_ingredients", { ingredients: Array(101).fill("tomato") }],
    ["get_live_sky_transits", { longitude: NaN }],
    ["generate_cosmic_recipe", { prompt: "x".repeat(2001) }],
  ])("rejects bounded input for %s", async (name, args) => {
    const result = await invokeTool(name, args);
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("rejects anonymous reflection writes before author lookup or debit", async () => {
    jest.mocked(executeQuery).mockClear();
    const result = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "Nice soup",
      agentSlug: "leonardo-da-vinci",
    });
    expect(result.errorCode).toBe("UNAUTHORIZED");
    expect(executeQuery).not.toHaveBeenCalled();
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("refuses to attribute a reflection to a different key owner", async () => {
    jest.mocked(executeQuery).mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
      command: "SELECT",
      oid: 0,
      fields: [],
    });
    const result = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "Nice soup",
      agentSlug: "someone-else",
      _meta: { apiKey: "test-key" },
    });
    expect(result.errorCode).toBe("FORBIDDEN");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("fails closed on billing outages for authenticated paid tools", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: false,
      reason: "db-unavailable",
      amounts: null,
    });
    const result = await invokeTool("generate_cosmic_recipe", {
      _meta: { apiKey: "test-key" },
    });
    expect(result.errorCode).toBe("UNAVAILABLE");
    expect(result.data).toBeNull();
  });

  it("retains correlation IDs in responses, backend calls and telemetry", async () => {
    const result = await invokeTool("get_live_sky_transits", {
      _meta: { correlationId: "pa:turn-42" },
    });
    expect(result.correlationId).toBe("pa:turn-42");
    expect(calculateNatalChart).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.objectContaining({ correlationId: "pa:turn-42" }),
    );
    expect(mockedRecord).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        resultSummary: expect.objectContaining({ correlationId: "pa:turn-42" }),
      }),
    );
  });

  it("cancels before a charge when the request was already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const result = await invokeTool(
      "generate_cosmic_recipe",
      {},
      { signal: controller.signal },
    );
    expect(result.errorCode).toBe("CANCELLED");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("rolls back a publication whose interaction mirror aborted the transaction, keeping the reflection", async () => {
    // Inside a transaction a failed mirror leaves Postgres aborted, so the feed
    // link write that follows fails too and the savepoint undoes the feed event.
    jest.mocked(feedDatabase.publishFeedEvent).mockResolvedValueOnce({
      success: false,
      contractVersion: "1.0",
      eventType: "recipe_review",
      feedPublished: true,
      event: { id: "feed-event-2" },
      recipeCommentStatus: "saved",
      legacyInteractionStatus: "failed",
    });
    const passThrough = mockTransaction.client.query.getMockImplementation();
    mockTransaction.client.query.mockImplementation(
      async (sql: string, params?: unknown[]) => {
        if (sql.includes("UPDATE recipe_reflections"))
          throw new Error("current transaction is aborted");
        return passThrough?.(sql, params);
      },
    );
    try {
      mockedDebit.mockResolvedValueOnce({
        applied: true,
        reason: null,
        amounts: REFLECTION_COST,
      });
      const result = await invokeTool("submit_recipe_reflection", {
        recipeId: "r1",
        reflection: "Nice soup",
        _meta: { apiKey: "test-key" },
      });
      expect(result.ok).toBe(true);
      expect(result.data).toMatchObject({
        reflectionId: "reflection-123",
        published: false,
        publicationReceipt: {
          feedPublished: false,
          feedEventId: null,
          legacyInteractionStatus: "failed",
        },
      });
      expect(mockTransaction.events).toEqual([
        "BEGIN",
        "SAVEPOINT mcp_reflection_feed",
        "ROLLBACK TO SAVEPOINT mcp_reflection_feed",
        "COMMIT",
      ]);
      expect(result.billing).toMatchObject({ status: "charged" });
    } finally {
      mockTransaction.client.query.mockImplementation(passThrough);
    }
  });

  it("prevents anonymous writes to another agent's natal cache", async () => {
    const result = await invokeTool("compute_synastry_overlay", {
      agentA: {
        id: "one",
        natalChart: { planets: { Sun: { sign: "aries", degree: 1 } } },
      },
      agentB: {
        id: "two",
        natalChart: { planets: { Sun: { sign: "leo", degree: 2 } } },
      },
      cacheStrategy: "write",
    });
    expect(result.errorCode).toBe("FORBIDDEN");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("rejects unknown zodiac signs before natal calculations or billing", async () => {
    const result = await invokeTool("compute_synastry_overlay", {
      agentA: {
        id: "one",
        natalChart: { planets: { Sun: { sign: "not-a-zodiac", degree: 1 } } },
      },
      agentB: {
        id: "two",
        natalChart: { planets: { Sun: { sign: "leo", degree: 2 } } },
      },
    });
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("rejects inherited property names as unsupported inputs", async () => {
    const result = await invokeTool("get_live_sky_transits", {
      constructor: "unexpected",
    });
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("accepts PA trace metadata and isolates it in the backend context", async () => {
    const result = await invokeTool("get_live_sky_transits", {
      _meta: {
        requestId: "pa:request-1",
        traceId: "trace_pa123",
        evidenceSnapshotId: "ev_123",
      },
    });
    expect(result.correlationId).toBe("pa:request-1");
    expect(calculateNatalChart).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.objectContaining({
        correlationId: "pa:request-1",
        traceId: "trace_pa123",
        evidenceSnapshotId: "ev_123",
        caller: "test",
      }),
    );
  });
  it("keeps quantities out of the reflection dominantElement contract", async () => {
    const result = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "Nice soup",
      dominantElement: "Spirit",
      _meta: { apiKey: "test-key" },
    });
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("reads synastry caches without overwriting agent natal positions", async () => {
    const previousDb = process.env.DATABASE_URL;
    process.env.DATABASE_URL = "postgresql://test/test";
    const dynamicDb = await import("@/lib/database/connection");
    jest.mocked(dynamicDb.executeQuery).mockClear();
    try {
      const result = await invokeTool("compute_synastry_overlay", {
        agentA: {
          id: "one",
          natalChart: { planets: { Sun: { sign: "aRiEs", degree: 1 } } },
        },
        agentB: {
          id: "two",
          natalChart: { planets: { Sun: { sign: "Leo", degree: 2 } } },
        },
        cacheStrategy: "read",
      });
      expect(result.ok).toBe(true);
      expect(dynamicDb.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("FROM synastry_scores"),
        expect.any(Array),
      );
      expect(
        jest
          .mocked(executeQuery)
          .mock.calls.some(([sql]) =>
            sql.includes("INSERT INTO agent_natal_positions"),
          ),
      ).toBe(false);
    } finally {
      if (previousDb === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = previousDb;
    }
  });
});

const AUTHENTICATED = { _meta: { apiKey: "test-key" } };

function reflectionInserts(): unknown[][] {
  return mockTransaction.client.query.mock.calls
    .filter(([sql]) => sql.includes("INSERT INTO recipe_reflections"))
    .map(([, params]) => params ?? []);
}

/** Answer the replay lookup with a stored reflection; pass everything else on. */
function withStoredReflection(row: Record<string, unknown>): () => void {
  const passThrough = mockTransaction.client.query.getMockImplementation();
  mockTransaction.client.query.mockImplementation(
    async (sql: string, params?: unknown[]) =>
      sql.includes("delivery_key = $2")
        ? { rows: [row], rowCount: 1 }
        : passThrough?.(sql, params),
  );
  return () => mockTransaction.client.query.mockImplementation(passThrough);
}

const STORED_REFLECTION = {
  id: "reflection-original",
  recipe_id: "r1",
  author_id: "agent-123",
  publication_id: null,
  feed_event_id: "feed-event-0",
  delivery_key: "mcp:feedface",
  source: "mcp_reflection",
  content_state: "proposed",
  review: "Bright and balanced.",
  score: null,
  is_agent: true,
  instruction_review_required: true,
  provenance: {},
  created_at: "2026-10-17T12:00:00.000Z",
  updated_at: "2026-10-17T12:00:00.000Z",
  deleted_at: null,
  hidden: false,
};

describe("settlement", () => {
  beforeEach(() => {
    mockInvalidateAgents.mockClear();
    mockedRecord.mockClear();
    mockedDebit.mockReset();
    mockedDebit.mockResolvedValue({
      applied: false,
      reason: "free-tool",
      amounts: null,
    });
    mockTransaction.events.length = 0;
    mockTransaction.client.query.mockClear();
    jest.mocked(feedDatabase.publishFeedEvent).mockClear();
    jest.mocked(feedDatabase.pushAgentFeedWebhook).mockClear();
  });

  it("charges a paid read only after it succeeds, and reports the charge", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: true,
      reason: null,
      amounts: RECIPE_COST,
    });
    const result = await invokeTool("generate_cosmic_recipe", {
      prompt: "tomato",
      ...AUTHENTICATED,
    });
    expect(result.ok).toBe(true);
    expect(result.billing).toEqual({
      status: "charged",
      amounts: RECIPE_COST,
      idempotencyKey: null,
    });
    const searched = jest
      .mocked(recipeService.searchRecipes)
      .mock.invocationCallOrder.at(-1);
    expect(mockedDebit.mock.invocationCallOrder[0]).toBeGreaterThan(
      searched ?? Infinity,
    );
    expect(mockedRecord).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        tokensDebited: RECIPE_COST,
        resultSummary: expect.objectContaining({ billing: "charged" }),
      }),
    );
  });

  it("does not charge for a search that fails", async () => {
    jest
      .mocked(recipeService.searchRecipes)
      .mockRejectedValueOnce(new Error("catalog offline"));
    const result = await invokeTool("generate_cosmic_recipe", AUTHENTICATED);
    expect(result.errorCode).toBe("INTERNAL");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("does not charge for a partial evidence snapshot", async () => {
    jest
      .mocked(calculateNatalChart)
      .mockRejectedValueOnce(new Error("chart backend down"));
    const result = await invokeTool("create_evidence_snapshot", {
      ingredients: ["sage"],
      ...AUTHENTICATED,
    });
    expect(result.ok).toBe(false);
    expect(result.data).toMatchObject({ status: "partial" });
    expect(mockedDebit).not.toHaveBeenCalled();
    expect(result.billing).toEqual({
      status: "not_charged",
      reason: "not-delivered",
      amounts: null,
      idempotencyKey: null,
    });
  });

  it("withholds a delivered result when settlement is refused", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: false,
      reason: "insufficient-funds",
      amounts: null,
    });
    const result = await invokeTool("create_evidence_snapshot", AUTHENTICATED);
    expect(result.errorCode).toBe("QUOTA");
    expect(result.data).toBeNull();
    expect(result.billing).toMatchObject({
      status: "not_charged",
      reason: "insufficient-funds",
    });
  });

  it("does not charge a caller that cancelled before settlement", async () => {
    const controller = new AbortController();
    jest
      .mocked(recipeService.searchRecipes)
      .mockImplementationOnce(async () => {
        controller.abort();
        return [];
      });
    const result = await invokeTool("generate_cosmic_recipe", AUTHENTICATED, {
      signal: controller.signal,
    });
    expect(result.errorCode).toBe("CANCELLED");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("binds an idempotency key to the arguments, not to transport metadata", async () => {
    await invokeTool("generate_cosmic_recipe", {
      prompt: "tomato",
      _meta: { apiKey: "k1", idempotencyKey: "retry-1", correlationId: "a" },
    });
    await invokeTool("generate_cosmic_recipe", {
      prompt: "tomato",
      _apiKey: "k2",
      _meta: { idempotencyKey: "retry-1", correlationId: "b" },
    });
    await invokeTool("generate_cosmic_recipe", {
      prompt: "soup",
      _meta: { apiKey: "k1", idempotencyKey: "retry-1" },
    });
    const [first, second, third] = mockedDebit.mock.calls.map(
      ([, , request]) => request,
    );
    expect(first).toEqual({
      idempotencyKey: "retry-1",
      fingerprint: expect.stringMatching(/^[0-9a-f]{32}$/),
    });
    expect(second?.fingerprint).toBe(first?.fingerprint);
    expect(third?.fingerprint).not.toBe(first?.fingerprint);
  });

  it("rejects malformed idempotency keys before charging", async () => {
    const result = await invokeTool("generate_cosmic_recipe", {
      _meta: { apiKey: "k", idempotencyKey: "has spaces%" },
    });
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("reports a replayed settlement without charging again", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: true,
      reason: null,
      amounts: null,
      replayed: true,
      ledgerKey: "mcp:feedface",
    });
    const result = await invokeTool("generate_cosmic_recipe", {
      prompt: "tomato",
      _meta: { apiKey: "k", idempotencyKey: "retry-1" },
    });
    expect(result.ok).toBe(true);
    expect(result.billing).toEqual({
      status: "replayed",
      amounts: null,
      idempotencyKey: "retry-1",
    });
    expect(mockedRecord).toHaveBeenLastCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({ tokensDebited: null }),
    );
  });

  it("rejects a reused idempotency key with different arguments", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: false,
      reason: "idempotency-conflict",
      amounts: null,
    });
    const result = await invokeTool("generate_cosmic_recipe", {
      prompt: "soup",
      _meta: { apiKey: "k", idempotencyKey: "retry-1" },
    });
    expect(result.errorCode).toBe("CONFLICT");
    expect(result.data).toBeNull();
  });

  it("charges and saves a reflection in one transaction", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: true,
      reason: null,
      amounts: REFLECTION_COST,
      ledgerKey: "mcp:feedface",
    });
    const result = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "  Bright and balanced.  ",
      _meta: { apiKey: "k", idempotencyKey: "reflect-1" },
    });
    expect(result.ok).toBe(true);
    expect(mockedDebit).toHaveBeenCalledWith(
      "submit_recipe_reflection",
      expect.objectContaining({ userId: "agent-123" }),
      { idempotencyKey: "reflect-1", fingerprint: expect.any(String) },
      mockTransaction.client,
    );
    const [insert] = reflectionInserts();
    // delivery key, content state and review as stored (migration 94 CHECK).
    expect(insert?.[4]).toBe("mcp:feedface");
    expect(insert?.[6]).toBe("proposed");
    expect(insert?.[7]).toBe("Bright and balanced.");
    expect(feedDatabase.publishFeedEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        client: mockTransaction.client,
        skipWebhook: true,
        metadataPayload: expect.objectContaining({
          recipeReflectionId: "reflection-123",
          contentState: "proposed",
        }),
      }),
    );
    expect(mockTransaction.events).toEqual([
      "BEGIN",
      "SAVEPOINT mcp_reflection_feed",
      "RELEASE SAVEPOINT mcp_reflection_feed",
      "COMMIT",
    ]);
    expect(feedDatabase.pushAgentFeedWebhook).toHaveBeenCalledTimes(1);
    expect(feedDatabase.pushAgentFeedWebhook).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "recipe_review",
        agentDisplayName: "Leonardo da Vinci",
        metadataPayload: expect.objectContaining({
          recipeReflectionId: "reflection-123",
          contentState: "proposed",
        }),
      }),
    );
    expect(result.data).toMatchObject({
      reflectionId: "reflection-123",
      contentState: "proposed",
      reflection: "Bright and balanced.",
      published: true,
      replayed: false,
      publicationReceipt: { feedEventId: "feed-event-1" },
    });
    expect(result.billing).toEqual({
      status: "charged",
      amounts: REFLECTION_COST,
      idempotencyKey: "reflect-1",
    });
  });

  it("invalidates the roster and sends the webhook after COMMIT, never on savepoint rollback", async () => {
    mockInvalidateAgents.mockImplementationOnce(async () => {
      mockTransaction.events.push("CACHE_INVALIDATED_AFTER_COMMIT");
    });
    jest.mocked(feedDatabase.pushAgentFeedWebhook).mockImplementationOnce(async () => {
      mockTransaction.events.push("PA_WEBHOOK_AFTER_COMMIT");
    });
    mockedDebit.mockResolvedValueOnce({
      applied: true,
      reason: null,
      amounts: REFLECTION_COST,
      ledgerKey: "mcp:aftercommit",
    });
    await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "Post-commit webhook ordering.",
      agentSlug: "leonardo-da-vinci",
      _meta: { apiKey: "k", idempotencyKey: "reflect-order" },
    });
    expect(mockTransaction.events).toEqual([
      "BEGIN",
      "SAVEPOINT mcp_reflection_feed",
      "RELEASE SAVEPOINT mcp_reflection_feed",
      "COMMIT",
      "CACHE_INVALIDATED_AFTER_COMMIT",
      "PA_WEBHOOK_AFTER_COMMIT",
    ]);

    // When the feed savepoint rolls back, the reflection still commits, but no webhook fires.
    mockTransaction.events.length = 0;
    mockInvalidateAgents.mockClear();
    jest.mocked(feedDatabase.pushAgentFeedWebhook).mockClear();
    jest.mocked(feedDatabase.publishFeedEvent).mockRejectedValueOnce(new Error("feed down"));
    mockedDebit.mockResolvedValueOnce({
      applied: true,
      reason: null,
      amounts: REFLECTION_COST,
      ledgerKey: "mcp:savepoint-fail",
    });
    const degraded = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "Saved despite feed outage.",
      _meta: { apiKey: "k", idempotencyKey: "reflect-degraded" },
    });
    expect(degraded.ok).toBe(true);
    expect(mockTransaction.events).toEqual([
      "BEGIN",
      "SAVEPOINT mcp_reflection_feed",
      "ROLLBACK TO SAVEPOINT mcp_reflection_feed",
      "COMMIT",
    ]);
    expect(feedDatabase.pushAgentFeedWebhook).not.toHaveBeenCalled();
    expect(mockInvalidateAgents).not.toHaveBeenCalled();
  });

  it("rolls the whole reflection back when its payment is refused", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: false,
      reason: "insufficient-funds",
      amounts: null,
    });
    const result = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "Bright and balanced.",
      ...AUTHENTICATED,
    });
    expect(result.errorCode).toBe("QUOTA");
    expect(result.billing).toMatchObject({ status: "not_charged" });
    expect(reflectionInserts()).toHaveLength(0);
    expect(feedDatabase.publishFeedEvent).not.toHaveBeenCalled();
    expect(feedDatabase.pushAgentFeedWebhook).not.toHaveBeenCalled();
    expect(mockTransaction.events).toEqual(["BEGIN", "ROLLBACK"]);
  });

  it("replays an idempotent reflection without writing or republishing", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: true,
      reason: null,
      amounts: null,
      replayed: true,
      ledgerKey: "mcp:feedface",
    });
    const restore = withStoredReflection(STORED_REFLECTION);
    try {
      const result = await invokeTool("submit_recipe_reflection", {
        recipeId: "r1",
        reflection: "Bright and balanced.",
        _meta: { apiKey: "k", idempotencyKey: "reflect-1" },
      });
      expect(result.ok).toBe(true);
      expect(result.data).toMatchObject({
        reflectionId: "reflection-original",
        replayed: true,
        published: true,
        publicationReceipt: { feedEventId: "feed-event-0" },
      });
      expect(result.billing).toMatchObject({ status: "replayed", amounts: null });
      expect(reflectionInserts()).toHaveLength(0);
      expect(feedDatabase.publishFeedEvent).not.toHaveBeenCalled();
      expect(feedDatabase.pushAgentFeedWebhook).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it("re-attempts publication when a replayed reflection was never published", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: true,
      reason: null,
      amounts: null,
      replayed: true,
      ledgerKey: "mcp:feedface",
    });
    const restore = withStoredReflection({
      ...STORED_REFLECTION,
      feed_event_id: null,
    });
    try {
      const result = await invokeTool("submit_recipe_reflection", {
        recipeId: "r1",
        reflection: "Bright and balanced.",
        _meta: { apiKey: "k", idempotencyKey: "reflect-1" },
      });
      expect(result.data).toMatchObject({
        reflectionId: "reflection-original",
        replayed: true,
        published: true,
        publicationReceipt: { feedEventId: "feed-event-1" },
      });
      expect(reflectionInserts()).toHaveLength(0);
      expect(feedDatabase.publishFeedEvent).toHaveBeenCalledTimes(1);
      expect(feedDatabase.pushAgentFeedWebhook).toHaveBeenCalledTimes(1);
      expect(
        mockTransaction.client.query.mock.calls.some(
          ([sql, params]) =>
            sql.includes("UPDATE recipe_reflections") &&
            params?.[1] === "reflection-original",
        ),
      ).toBe(true);
    } finally {
      restore();
    }
  });

  it("does not republish a moderated reflection on replay", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: true,
      reason: null,
      amounts: null,
      replayed: true,
      ledgerKey: "mcp:feedface",
    });
    // A moderator removed the feed event (ON DELETE SET NULL) and the reflection.
    const restore = withStoredReflection({
      ...STORED_REFLECTION,
      feed_event_id: null,
      content_state: "rejected",
      hidden: true,
    });
    try {
      const result = await invokeTool("submit_recipe_reflection", {
        recipeId: "r1",
        reflection: "Bright and balanced.",
        _meta: { apiKey: "k", idempotencyKey: "reflect-1" },
      });
      expect(result.data).toMatchObject({
        replayed: true,
        published: false,
        contentState: "rejected",
        publicationReceipt: { feedPublished: false, feedEventId: null },
      });
      expect(feedDatabase.publishFeedEvent).not.toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it("rejects reflection text that is empty once control characters are stripped", async () => {
    const result = await invokeTool("submit_recipe_reflection", {
      recipeId: "r1",
      reflection: "\u0001\u0002",
      ...AUTHENTICATED,
    });
    expect(result.errorCode).toBe("INVALID_ARGS");
    expect(mockedDebit).not.toHaveBeenCalled();
  });

  it("refuses to replay an expired idempotency key", async () => {
    mockedDebit.mockResolvedValueOnce({
      applied: false,
      reason: "idempotency-expired",
      amounts: null,
    });
    const result = await invokeTool("generate_cosmic_recipe", {
      _meta: { apiKey: "k", idempotencyKey: "retry-1" },
    });
    expect(result.errorCode).toBe("CONFLICT");
    expect(result.errorMessage).toMatch(/24 hours/);
    expect(result.data).toBeNull();
  });

  it("treats an undefined metadata field as absent", async () => {
    // The in-process synthetic probe passes INTERNAL_API_SECRET, which may be unset.
    const result = await invokeTool("get_live_sky_transits", {
      _meta: { caller: "synthetic-probe", internalSecret: undefined },
    });
    expect(result.ok).toBe(true);
  });

  it("tells a caller turned away at the concurrency limit when to retry", async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const sky = await calculateNatalChart(
      { dateTime: "", latitude: 0, longitude: 0, timezone: "UTC" },
      {},
    );
    jest.mocked(calculateNatalChart).mockImplementation(async () => {
      await gate;
      return sky;
    });
    try {
      const running = Array.from({ length: 4 }, () =>
        invokeTool("get_live_sky_transits", {}),
      );
      const busy = await invokeTool("get_live_sky_transits", {});
      expect(busy.errorCode).toBe("BUSY");
      expect(structuredToolContent(busy)).toMatchObject({ retryAfterSec: 1 });
      release();
      await Promise.all(running);
    } finally {
      release();
      jest.mocked(calculateNatalChart).mockResolvedValue(sky);
    }
  });
});

describe("published output contract", () => {
  beforeEach(() => {
    mockedDebit.mockReset();
    mockedDebit.mockResolvedValue({
      applied: true,
      reason: null,
      amounts: RECIPE_COST,
    });
  });

  const natalChart = {
    planets: {
      Sun: { sign: "leo", degree: 15 },
      Moon: { sign: "aries", degree: 15 },
    },
  };
  const successfulCalls: Record<ToolName, Record<string, unknown>> = {
    get_live_sky_transits: {},
    alchemize_ingredients: { ingredients: ["tomato", "sage", "unknown"] },
    generate_cosmic_recipe: { prompt: "tomato", ...AUTHENTICATED },
    compute_synastry_overlay: {
      agentA: { id: "a", natalChart },
      agentB: { id: "b", natalChart },
      cacheStrategy: "bypass",
    },
    get_transit_natal_overlay: { agent: { id: "a", natalChart } },
    compute_triplicate_synastry: {
      makerId: "maker",
      takerId: "taker",
      makerNatal: { Sun: { sign: "leo", degree: 15 } },
      takerNatal: { Sun: { sign: "aries", degree: 15 } },
      giveToken: "Spirit",
      giveAmount: 10,
      wantToken: "Essence",
      wantAmount: 10,
    },
    create_evidence_snapshot: { ingredients: ["sage"], ...AUTHENTICATED },
    submit_recipe_reflection: {
      recipeId: "r1",
      reflection: "Bright and balanced.",
      ...AUTHENTICATED,
    },
  };

  it("publishes a titled object output schema for every tool", () => {
    expect(TOOL_DEFINITIONS.map((tool) => tool.name)).toEqual([...TOOL_NAMES]);
    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.title.length).toBeGreaterThan(0);
      expect(tool.outputSchema.type).toBe("object");
      expect(Array.isArray(tool.outputSchema.anyOf)).toBe(true);
    }
  });

  it.each([...TOOL_NAMES])(
    "a successful %s result conforms to its outputSchema",
    async (name) => {
      const result = await invokeTool(name, successfulCalls[name]);
      expect(result.ok).toBe(true);
      expect(validateToolOutput(name, structuredToolContent(result))).toBeNull();
    },
  );

  const failures: Array<[string, ToolName, () => Promise<ToolResult>]> = [
    [
      "invalid arguments",
      "get_live_sky_transits",
      () => invokeTool("get_live_sky_transits", { latitude: 91 }),
    ],
    [
      "a refused payment",
      "generate_cosmic_recipe",
      async () => {
        mockedDebit.mockResolvedValueOnce({
          applied: false,
          reason: "insufficient-funds",
          amounts: null,
        });
        return invokeTool("generate_cosmic_recipe", AUTHENTICATED);
      },
    ],
    [
      "a partial snapshot",
      "create_evidence_snapshot",
      async () => {
        jest
          .mocked(calculateNatalChart)
          .mockRejectedValueOnce(new Error("chart backend down"));
        return invokeTool("create_evidence_snapshot", AUTHENTICATED);
      },
    ],
    [
      "an unauthenticated reflection",
      "submit_recipe_reflection",
      () =>
        invokeTool("submit_recipe_reflection", {
          recipeId: "r1",
          reflection: "Bright.",
        }),
    ],
  ];

  it.each(failures)(
    "the error envelope for %s conforms to the outputSchema",
    async (_label, name, call) => {
      const result = await call();
      expect(result.ok).toBe(false);
      expect(validateToolOutput(name, structuredToolContent(result))).toBeNull();
    },
  );

  it("rejects a payload that breaks the contract", () => {
    expect(
      validateToolOutput("generate_cosmic_recipe", {
        totalMatching: 1,
        returnedCount: 1,
        recipes: [{ name: "Soup", esms: { spirit: 50 }, esmsSource: null, ingredients: [] }],
        correlationId: "c",
      }),
    ).not.toBeNull();
    expect(
      validateToolOutput("get_live_sky_transits", {
        errorCode: "NOT_A_CODE",
        message: "x",
        correlationId: "c",
      }),
    ).not.toBeNull();
  });
});
