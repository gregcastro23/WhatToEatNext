/**
 * @jest-environment node
 *
 * resolveRecipeRef and loadStaticTwinBridge against a flag that lies.
 *
 * Both used to ask LocalRecipeService.isCatalogDegraded(): one static flag
 * that every later load resets, so after an await it can describe another
 * request's list. They now ask whether the "live" catalog IS the static array
 * (servesStaticFallback), which the fallback returns by reference and
 * getServerRecipes hands every caller. [MEASURED 2026-10-31] Five overlapping
 * cold getServerRecipes() calls built five distinct 1,113-recipe arrays, which
 * would have made that identity timing-dependent; it is single-flight now.
 *
 * jest.config sets resetModules, so every test gets a fresh module registry and
 * the loader's lazy import of the static catalog would rebuild it (4 s) as a
 * different array. The static catalog is therefore built once, for real, and
 * handed out by one mock factory, so every test sees the same array while
 * LocalRecipeService and the resolver stay real. Cold-process cases (module
 * state truly empty) are in recipeRefResolver.coldFallback.test.ts.
 */
import type { Recipe } from "@/types/recipe";

type Rows = Array<Record<string, unknown>>;

/** The real static catalog, built once for the file (the mock prefix lets the hoisted factory use it). */
let mockStaticRecipes: Promise<Recipe[]> | null = null;
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
jest.mock("@/actions/recipes", () => ({
  getServerRecipes: () => {
    mockStaticRecipes ??= jest.requireActual<typeof import("@/actions/recipes")>("@/actions/recipes").getServerRecipes();
    return mockStaticRecipes;
  },
}));

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

let warm: Awaited<ReturnType<typeof coldProcess>>;
let warmStaticId: string;

/** A fresh LocalRecipeService and resolver (resetModules), over the one shared static catalog. */
beforeEach(async () => {
  warm = await coldProcess();
  const twin = (await warm.getServerRecipes()).find((r) => r.name === OYAKODON);
  if (!twin) throw new Error("the static catalog has no Oyakodon");
  warmStaticId = twin.id;
}, 60_000);

afterEach(() => jest.restoreAllMocks());

describe("with the database down (the catalog fell back to the static list)", () => {
  beforeEach(() => {
    dbOutcome = { kind: "reject" };
  });

  it("resolveRecipeRef refuses to point a canonical at a static id", async () => {
    expect(await warm.resolveRecipeRef(warmStaticId)).toBeNull();
  });

  it("the bridge pairs nothing, so every id stays static", async () => {
    const bridge = await warm.loadStaticTwinBridge();
    expect(bridge.canonicalIdOf(warmStaticId)).toBe(warmStaticId);
  });

  it("is not fooled by a flag that claims the catalog is live", async () => {
    // What a recovering load on another request does to the shared flag.
    jest.spyOn(warm.LocalRecipeService, "isCatalogDegraded").mockReturnValue(false);
    expect(await warm.resolveRecipeRef(warmStaticId)).toBeNull();
    expect((await warm.loadStaticTwinBridge()).canonicalIdOf(warmStaticId)).toBe(warmStaticId);
  });
});

describe("with a live catalog", () => {
  beforeEach(() => {
    dbOutcome = { kind: "rows", rows: [liveRow()] };
  });

  it("resolves a static id to its live twin", async () => {
    expect(await warm.resolveRecipeRef(warmStaticId)).toMatchObject({ kind: "twin", canonicalId: LIVE_ID });
    expect((await warm.loadStaticTwinBridge()).canonicalIdOf(warmStaticId)).toBe(LIVE_ID);
  });

  it("is not fooled by a flag that claims the catalog is degraded", async () => {
    // What a failing load on another request does to the shared flag.
    jest.spyOn(warm.LocalRecipeService, "isCatalogDegraded").mockReturnValue(true);
    expect(await warm.resolveRecipeRef(warmStaticId)).toMatchObject({ kind: "twin", canonicalId: LIVE_ID });
    expect((await warm.loadStaticTwinBridge()).canonicalIdOf(warmStaticId)).toBe(LIVE_ID);
  });

  it("recovers: the fallback gives way to the live twin once the database is back", async () => {
    dbOutcome = { kind: "reject" };
    expect(await warm.resolveRecipeRef(warmStaticId)).toBeNull();

    dbOutcome = { kind: "rows", rows: [liveRow()] };
    warm.LocalRecipeService.clearCache();
    expect(await warm.resolveRecipeRef(warmStaticId)).toMatchObject({ kind: "twin", canonicalId: LIVE_ID });
  });
});

