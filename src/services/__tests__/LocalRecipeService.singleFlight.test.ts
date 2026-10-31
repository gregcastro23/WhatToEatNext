/**
 * @jest-environment node
 *
 * Concurrent catalog loads share one query.
 *
 * [MEASURED 2026-10-31] Several cold getAllRecipes() calls at once each ran
 * the catalog query. On the 5-connection pool one timed out ("Connection
 * terminated due to connection timeout") and was served the static list
 * (uncached, with different ids) while its neighbours got the live catalog.
 * The real LocalRecipeService runs here; only its database, Redis and Next
 * edges are replaced.
 */
import type { Recipe } from "@/types/recipe";

interface Query {
  resolve: (rows: unknown[]) => void;
  reject: (error: Error) => void;
}
const queries: Query[] = [];

jest.mock("@/lib/database", () => ({
  executeQuery: () =>
    new Promise((resolve, reject) => {
      queries.push({
        resolve: (rows) => resolve({ rows }),
        reject,
      });
    }),
}));
jest.mock("@/lib/redis", () => ({
  redisGet: async () => null,
  redisSet: async () => undefined,
  redisDel: async () => undefined,
}));
jest.mock("@/lib/assets", () => ({ getValidatedAssetUrl: async (url: string) => url }));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/utils/logger", () => {
  const quiet = { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() };
  return { logger: quiet, createLogger: () => quiet };
});
jest.mock("next/server", () => ({
  after: (work: () => void) => work(),
}));
jest.mock("@/actions/recipes", () => {
  const staticRecipes: Recipe[] = [];
  return { getServerRecipes: async () => staticRecipes };
});

import { LocalRecipeService } from "../LocalRecipeService";

function row(id: string): Record<string, unknown> {
  return {
    id,
    name: `Recipe ${id}`,
    cuisine: "Italian",
    category: "main",
    instructions: ["Cook"],
    prep_time_minutes: 5,
    cook_time_minutes: 5,
    servings: 2,
    dietary_tags: [],
    allergens: [],
    read_model: null,
  };
}

/** Let queued microtasks and the dynamic imports inside a load run. */
async function settle(): Promise<void> {
  for (let i = 0; i < 20; i++) await new Promise((resolve) => setImmediate(resolve));
}

beforeEach(() => {
  queries.length = 0;
  LocalRecipeService.clearCache();
});

describe("LocalRecipeService.getAllRecipes under concurrent cold loads", () => {
  it("runs one catalog query for ten simultaneous callers, and gives them one catalog", async () => {
    const callers = Array.from({ length: 10 }, () => LocalRecipeService.getAllRecipes());
    await settle();
    expect(queries).toHaveLength(1);

    queries[0]?.resolve([row("a"), row("b")]);
    const results = await Promise.all(callers);
    expect(results.every((recipes) => recipes === results[0])).toBe(true);
    expect(results[0]?.map((r) => r.id)).toEqual(["a", "b"]);
    expect(LocalRecipeService.isCatalogDegraded()).toBe(false);
  });

  it("serves a warm cache without any query", async () => {
    const first = LocalRecipeService.getAllRecipes();
    await settle();
    queries[0]?.resolve([row("a")]);
    await first;
    await LocalRecipeService.getAllRecipes();
    await LocalRecipeService.getAllRecipes();
    expect(queries).toHaveLength(1);
  });

  it("gives every concurrent caller the fallback when the one query fails, then tries again", async () => {
    const callers = Array.from({ length: 5 }, () => LocalRecipeService.getAllRecipes());
    await settle();
    expect(queries).toHaveLength(1);
    queries[0]?.reject(new Error("Connection terminated due to connection timeout"));
    const results = await Promise.all(callers);
    expect(results.every((recipes) => recipes === results[0])).toBe(true);
    expect(LocalRecipeService.isCatalogDegraded()).toBe(true);

    // A failure does not poison later calls: the next one loads again.
    const retry = LocalRecipeService.getAllRecipes();
    await settle();
    expect(queries).toHaveLength(2);
    queries[1]?.resolve([row("live")]);
    expect((await retry).map((r) => r.id)).toEqual(["live"]);
    expect(LocalRecipeService.isCatalogDegraded()).toBe(false);
  });

  it("does not let callers after an invalidation join a load that began before it", async () => {
    const before = LocalRecipeService.getAllRecipes();
    await settle();
    LocalRecipeService.clearCache();
    const after = LocalRecipeService.getAllRecipes();
    await settle();
    expect(queries).toHaveLength(2);

    queries[1]?.resolve([row("fresh")]);
    expect((await after).map((r) => r.id)).toEqual(["fresh"]);
    queries[0]?.resolve([row("stale")]);
    expect((await before).map((r) => r.id)).toEqual(["stale"]);
  });

  it("lets a settled load be followed by another when the cache has expired", async () => {
    const first = LocalRecipeService.getAllRecipes();
    await settle();
    queries[0]?.resolve([row("a")]);
    await first;

    LocalRecipeService.clearCache();
    const second = LocalRecipeService.getAllRecipes();
    await settle();
    expect(queries).toHaveLength(2);
    queries[1]?.resolve([row("b")]);
    expect((await second).map((r) => r.id)).toEqual(["b"]);
  });
});
