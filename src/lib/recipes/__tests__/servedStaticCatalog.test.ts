/**
 * @jest-environment node
 *
 * Every reader of the bundled catalog gets the same answer about a recipe the
 * operator unpublished: the planner and quiz pools, the home recommender,
 * /discover, the detail page and the sitemap all read `getServerRecipes()`
 * (or the pre-built index, or the resolver built on it), so the rule lives
 * there. These tests run the real 1,113-recipe bundled catalog with only the
 * database and the live catalog mocked.
 */
import { getServerRecipeIndex, getServerRecipes } from "@/actions/recipes";
import type { Recipe } from "@/types/recipe";
import { CATALOG_TTL_MS } from "../catalogTtl";
import { indexRecipeIdAliases } from "../recipeIdentity";
import { loadCanonicalCatalog, loadStaticTwinBridge, resolveRecipeRef } from "../recipeRefResolver";

const mockDbRows = jest.fn<Promise<{ rows: unknown[] }>, []>();
const mockLive = jest.fn<Promise<Recipe[]>, []>();
const mockLogError = jest.fn();

jest.mock("@/lib/database", () => ({ executeQuery: () => mockDbRows() }));
jest.mock("@/lib/logger", () => ({
  _logger: { error: (...args: unknown[]) => mockLogError(...args), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));
jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: { getAllRecipes: () => mockLive(), isCatalogDegraded: () => false },
}));

const ELEMENTS = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
const live = (id: string, name: string, cuisine: string): Recipe => ({
  id,
  name,
  cuisine,
  ingredients: [],
  instructions: [],
  elementalProperties: ELEMENTS,
});
const LIVE_OYAKODON = live("e03c3505-9729-4a7e-bc0c-5ae57aff83a9", "Oyakodon (Chicken and Egg Rice Bowl)", "Japanese");
const LIVE_ONLY = live("9a9a9a9a-0000-4000-8000-000000000001", "A Recipe Only The Database Has", "Italian");

interface Row {
  id: string;
  name: string;
  cuisine: string;
  published: boolean;
}
const HAEMUL_UNPUBLISHED: Row = { id: "5b3f6a52-0000-4000-8000-000000000001", name: "Haemul Pajeon", cuisine: "Korean", published: false };
const HAEMUL_PUBLISHED: Row = { ...HAEMUL_UNPUBLISHED, id: "6c4a7b63-0000-4000-8000-000000000002", published: true };
/** An unpublished row named like a real bundled Fusion recipe, so a second recipe can be hidden. */
function fusionUnpublished(): Row {
  const fusion = bundled.find((r) => r.cuisine === "fusion");
  if (!fusion) throw new Error("no Fusion recipe in the bundled catalog");
  return { id: "7d5b8c74-0000-4000-8000-000000000003", name: fusion.name, cuisine: "Fusion", published: false };
}

/** The recipes table: the live rows, flagged published, and `extra` rows. */
function table(...extra: Row[]): void {
  mockDbRows.mockImplementation(async () => ({
    rows: [
      ...[LIVE_OYAKODON, LIVE_ONLY].map((r) => ({ id: r.id, name: r.name, cuisine: r.cuisine, published: true })),
      ...extra,
    ],
  }));
}

let clock = 1_000_000_000_000;
/** The live catalog's next refresh: its TTL passes. */
const nextRefresh = (): void => {
  clock += CATALOG_TTL_MS;
};

/** jest.config restores spies before every test, so the clock is pinned again in each beforeEach. */
const pinClock = (): void => {
  jest.spyOn(Date, "now").mockImplementation(() => clock);
};
const savedUrl = process.env.DATABASE_URL;
const savedPublicUrl = process.env.DATABASE_PUBLIC_URL;
/** The bundled catalog as loaded with no database configured: nothing can be hidden. */
let bundled: Recipe[];

beforeAll(async () => {
  // The clock is pinned before anything loads, so that no read state is stamped with real time.
  pinClock();
  delete process.env.DATABASE_URL;
  delete process.env.DATABASE_PUBLIC_URL;
  bundled = await getServerRecipes();
});
afterAll(() => {
  if (savedUrl !== undefined) process.env.DATABASE_URL = savedUrl;
  if (savedPublicUrl !== undefined) process.env.DATABASE_PUBLIC_URL = savedPublicUrl;
});

beforeEach(() => {
  process.env.DATABASE_URL = "postgresql://test@localhost/test";
  mockDbRows.mockReset();
  mockLogError.mockReset();
  mockLive.mockReset();
  mockLive.mockImplementation(async () => [LIVE_OYAKODON, LIVE_ONLY]);
  clock += CATALOG_TTL_MS * 10;
  pinClock();
  table();
});
afterEach(() => {
  delete process.env.DATABASE_URL;
});

function haemul(): Recipe {
  const [first, ...others] = bundled.filter((r) => r.name === "Haemul Pajeon");
  expect(others).toHaveLength(0);
  if (!first) throw new Error("Haemul Pajeon is not in the bundled catalog");
  return first;
}
const idsOf = (recipes: readonly Recipe[]): string[] => recipes.map((r) => String(r.id));
const indexed = (index: Awaited<ReturnType<typeof getServerRecipeIndex>>): string[] =>
  [...index.values()].flatMap((bucket) => idsOf(bucket));

describe("with nothing unpublished (control)", () => {
  it("serves the whole bundled catalog, as the array that was loaded", async () => {
    expect(await getServerRecipes()).toBe(bundled);
    expect(idsOf(bundled)).toContain(haemul().id);
  });

  it("indexes it, resolves its URL, and offers it to /discover", async () => {
    expect(indexed(await getServerRecipeIndex())).toContain(haemul().id);
    expect(await resolveRecipeRef(haemul().id)).toMatchObject({ kind: "static-only", canonicalId: haemul().id });
    expect(idsOf((await loadStaticTwinBridge()).staticRecipes)).toContain(haemul().id);
  });
});

describe("with Haemul Pajeon unpublished", () => {
  beforeEach(() => table(HAEMUL_UNPUBLISHED));

  it("leaves out that recipe and no other", async () => {
    const served = await getServerRecipes();
    expect(served).toHaveLength(bundled.length - 1);
    expect(idsOf(bundled).filter((id) => !idsOf(served).includes(id))).toEqual([haemul().id]);
  });

  it("leaves it out of every bucket of the pre-built index, and only it", async () => {
    const baseline = indexed(await (async () => {
      table();
      nextRefresh();
      return getServerRecipeIndex();
    })());
    const inBuckets = baseline.filter((id) => id === haemul().id).length;
    expect(inBuckets).toBeGreaterThan(0); // the control: it is in the index to begin with

    table(HAEMUL_UNPUBLISHED);
    nextRefresh();
    const hidden = indexed(await getServerRecipeIndex());
    expect(hidden).not.toContain(haemul().id);
    expect(hidden).toHaveLength(baseline.length - inBuckets);
  });

  it("makes its URL, and its ingredient-index alias, not found", async () => {
    const alias = indexRecipeIdAliases(haemul().cuisine ?? "", haemul().name)[0];
    expect(alias).toBeDefined();
    expect(await resolveRecipeRef(haemul().id)).toBeNull();
    expect(await resolveRecipeRef(alias ?? "")).toBeNull();
  });

  it("takes it out of /discover's candidates", async () => {
    const bridge = await loadStaticTwinBridge();
    expect(idsOf(bridge.staticRecipes)).not.toContain(haemul().id);
    expect(bridge.staticRecipeFor(haemul().id)).toBeNull();
  });

  it("takes it out of the catalog list, and leaves the live recipes in it", async () => {
    const catalog = idsOf(await loadCanonicalCatalog());
    expect(catalog).not.toContain(haemul().id);
    expect(catalog).toEqual(expect.arrayContaining([LIVE_OYAKODON.id, LIVE_ONLY.id]));
  });

  it("is the same when the live catalog has fallen back to the static list", async () => {
    mockLive.mockImplementation(() => getServerRecipes());
    expect(idsOf(await loadCanonicalCatalog())).not.toContain(haemul().id);
    expect(await resolveRecipeRef(haemul().id)).toBeNull();
  });
});

describe("a bundled recipe with a public live twin is never hidden", () => {
  it("keeps Haemul Pajeon everywhere when a published row shares its name", async () => {
    table(HAEMUL_UNPUBLISHED, HAEMUL_PUBLISHED);
    expect(idsOf(await getServerRecipes())).toContain(haemul().id);
    expect(indexed(await getServerRecipeIndex())).toContain(haemul().id);
  });
});

describe("the array callers compare by identity", () => {
  it("is one array while the hidden set is unchanged, across calls and across refreshes", async () => {
    table(HAEMUL_UNPUBLISHED);
    const first = await getServerRecipes();
    expect(first).not.toBe(bundled);
    expect(await getServerRecipes()).toBe(first);
    nextRefresh();
    expect(await getServerRecipes()).toBe(first);
  });

  it("is replaced when the set changes, and is the loaded array again when it empties", async () => {
    table(HAEMUL_UNPUBLISHED);
    const one = await getServerRecipes();
    table(HAEMUL_UNPUBLISHED, fusionUnpublished());
    nextRefresh();
    const two = await getServerRecipes();
    expect(two).not.toBe(one);
    expect(two.length).toBeLessThan(one.length);

    table();
    nextRefresh();
    expect(await getServerRecipes()).toBe(bundled);
  });

  it("is one array for concurrent callers, from one read", async () => {
    table(HAEMUL_UNPUBLISHED);
    const all = await Promise.all([getServerRecipes(), getServerRecipes(), getServerRecipes()]);
    expect(all[1]).toBe(all[0]);
    expect(all[2]).toBe(all[0]);
    expect(mockDbRows).toHaveBeenCalledTimes(1);
  });
});

describe("when the recipes table cannot be read", () => {
  it("serves the whole bundled catalog in a process that has never read it: the outage fallback is never emptied", async () => {
    mockDbRows.mockRejectedValue(new Error("connection reset"));
    let served: Recipe[] = [];
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("@/actions/recipes");
      served = await fresh.getServerRecipes();
    });
    expect(served.map((r) => String(r.id))).toEqual(idsOf(bundled));
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it("keeps the recipe hidden using the set last read", async () => {
    table(HAEMUL_UNPUBLISHED);
    const hidden = await getServerRecipes();
    mockDbRows.mockRejectedValue(new Error("connection reset"));
    nextRefresh();
    expect(await getServerRecipes()).toBe(hidden);
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });
});

describe("with no database configured", () => {
  it("asks nothing and serves the whole bundled catalog", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PUBLIC_URL;
    table(HAEMUL_UNPUBLISHED);
    nextRefresh();
    expect(await getServerRecipes()).toBe(bundled);
    expect(mockDbRows).not.toHaveBeenCalled();
  });
});
