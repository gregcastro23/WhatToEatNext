/**
 * @jest-environment node
 *
 * The readers of "is the live catalog the static fallback?" on a COLD process.
 *
 * Both used to ask LocalRecipeService.isCatalogDegraded(): one static flag
 * that every later load resets, so after an await it can describe another
 * request's list. They now ask whether the "live" catalog IS the static array
 * (servesStaticFallback), which the fallback returns by reference and
 * getServerRecipes hands every caller. [MEASURED 2026-10-31] Five overlapping
 * cold getServerRecipes() calls built five distinct 1,113-recipe arrays, which
 * would have made that identity timing-dependent; it is single-flight now.
 *
 * The real LocalRecipeService and the real static catalog run here; only the
 * database, Redis and Next edges are replaced.
 */
import type { Recipe } from "@/types/recipe";

type Rows = Array<Record<string, unknown>>;
let dbOutcome: { kind: "reject" } | { kind: "rows"; rows: Rows } = { kind: "reject" };

jest.mock("@/lib/database", () => ({
  executeQuery: async () => {
    if (dbOutcome.kind === "reject") throw new Error("column r.read_model does not exist");
    return { rows: dbOutcome.rows };
  },
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
jest.mock("next/server", () => ({ after: (work: () => void) => work() }));

const OYAKODON = "Oyakodon (Chicken and Egg Rice Bowl)";
const LIVE_ID = "e03c3505-9729-4a7e-bc0c-5ae57aff83a9";

function liveRow(): Record<string, unknown> {
  return {
    id: LIVE_ID,
    name: OYAKODON,
    cuisine: "Japanese",
    category: "main",
    instructions: ["Simmer", "Serve"],
    prep_time_minutes: 30,
    cook_time_minutes: 30,
    servings: 2,
    dietary_tags: [],
    allergens: [],
    read_model: null,
  };
}

/** A process that has just started: no module state anywhere. */
async function coldProcess() {
  jest.resetModules();
  const [{ LocalRecipeService }, { getServerRecipes }, resolver] = await Promise.all([
    import("@/services/LocalRecipeService"),
    import("@/actions/recipes"),
    import("../recipeRefResolver"),
  ]);
  return { LocalRecipeService, getServerRecipes, ...resolver };
}

async function staticIdOf(getServerRecipes: () => Promise<Recipe[]>): Promise<string> {
  const twin = (await getServerRecipes()).find((r) => r.name === OYAKODON);
  if (!twin) throw new Error("the static catalog has no Oyakodon");
  return twin.id;
}

afterEach(() => jest.restoreAllMocks());

beforeEach(() => {
  dbOutcome = { kind: "reject" };
});

describe("on a cold process, after the database errors at once", () => {
  it("serves the static list by reference, even on a cold process where the callers overlap", async () => {
    const { LocalRecipeService, getServerRecipes, servesStaticFallback } = await coldProcess();
    const [staticRecipes, live] = await Promise.all([getServerRecipes(), LocalRecipeService.getAllRecipes()]);
    expect(servesStaticFallback(live, staticRecipes)).toBe(true);
  }, 60_000);

  it("gives all three readers a consistent answer when they overlap on a cold process", async () => {
    const { getServerRecipes, resolveRecipeRef, loadStaticTwinBridge, loadCanonicalCatalog } = await coldProcess();
    const staticId = await staticIdOf(getServerRecipes);
    const [ref, bridge, catalog] = await Promise.all([
      resolveRecipeRef(staticId),
      loadStaticTwinBridge(),
      loadCanonicalCatalog(),
    ]);
    expect(ref).toBeNull();
    expect(bridge.canonicalIdOf(staticId)).toBe(staticId);
    const staticRecipes = await getServerRecipes();
    expect(catalog).toHaveLength(staticRecipes.length);
    expect(new Set(catalog.map((r) => r.id)).size).toBe(catalog.length);
  }, 60_000);
});

describe("getServerRecipes", () => {
  it("gives every overlapping cold caller the same array", async () => {
    const { getServerRecipes } = await coldProcess();
    const arrays = await Promise.all(Array.from({ length: 5 }, () => getServerRecipes()));
    expect(new Set(arrays).size).toBe(1);
    expect(await getServerRecipes()).toBe(arrays[0]);
  }, 60_000);
});
