/**
 * Every recipe reaches the frontend.
 *
 * [MEASURED 2026-10-31, static catalog] GET /api/recipes?limit=1000 returned
 * 1,000 of 1,113: the hard cap hid 113 recipes and the page, which ignores
 * `total`, never said so. `cuisine=middle-eastern` (the slug the cuisine cards
 * link with) returned 0 of 44, `cuisine=all` returned 0, and the static
 * fallback served the internal archive code "hsca" as a cuisine.
 *
 * These tests run the real route over the real static catalog, with the live
 * database mocked, so the counts are the catalog's own.
 */
import { getServerRecipes } from "@/actions/recipes";
import { CUISINES_METADATA } from "@/data/cuisines/index";
import { buildRecipeIdentityIndex } from "@/lib/recipes/recipeIdentity";
import { cuisineToSlug } from "@/utils/cuisineSlug";
import type { Recipe } from "@/types/recipe";

const mockGetAllRecipes = jest.fn<Promise<Recipe[]>, []>();
let mockDegraded = false;

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getAllRecipes: () => mockGetAllRecipes(),
    getRecipeById: async (id: string) => (await mockGetAllRecipes()).find((r) => r.id === id) ?? null,
    isCatalogDegraded: () => mockDegraded,
  },
}));
jest.mock("@/lib/rateLimit", () => ({ rateLimit: async () => ({ allowed: true }) }));
jest.mock("@/lib/observability/withObservability", () => ({
  withObservability: (_opts: unknown, handler: unknown): unknown => handler,
}));
jest.mock("@/lib/auth/auth", () => ({ auth: async () => null }));

import { GET, POST } from "../route";

const ELEMENTS = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

function liveRow(id: string, name: string, cuisine?: string): Recipe {
  return {
    id,
    name,
    ...(cuisine ? { cuisine } : {}),
    ingredients: [],
    instructions: [],
    elementalProperties: ELEMENTS,
  };
}

interface Served {
  success: boolean;
  recipes: Array<{ id: string; name: string; cuisine?: string }>;
  total: number;
  limit: number | null;
  offset: number;
  note?: string;
}

async function get(query = ""): Promise<Served> {
  const res = await GET(new Request(`http://localhost/api/recipes${query}`));
  expect(res.status).toBe(200);
  return res.json();
}

async function post(body: Record<string, unknown>): Promise<Served> {
  const res = await POST(
    new Request("http://localhost/api/recipes", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
  expect(res.status).toBe(200);
  return res.json();
}

const ids = (served: Served): string[] => served.recipes.map((r) => r.id);

let staticRecipes: Recipe[];

beforeAll(async () => {
  staticRecipes = await getServerRecipes();
});

/** The live database as it is when it is down: the catalog degrades to the static list. */
function degradedToStatic(): void {
  mockDegraded = true;
  mockGetAllRecipes.mockResolvedValue(staticRecipes);
}

/** A live database holding a few recipes, one with no static twin and no Fusion at all. */
const LIVE_DB_ONLY = liveRow("9a9a9a9a-0000-4000-8000-000000000001", "A Recipe Only The Database Has", "Italian");
const LIVE_OYAKODON = liveRow("e03c3505-9729-4a7e-bc0c-5ae57aff83a9", "Oyakodon (Chicken and Egg Rice Bowl)", "Japanese");
const LIVE = [LIVE_OYAKODON, LIVE_DB_ONLY];

function liveDatabase(): void {
  mockDegraded = false;
  mockGetAllRecipes.mockResolvedValue(LIVE);
}

beforeEach(() => {
  mockGetAllRecipes.mockReset();
  mockDegraded = false;
});

describe("the catalog has no limit", () => {
  beforeEach(degradedToStatic);

  it("is larger than the old 1,000 cap (control)", () => {
    expect(staticRecipes.length).toBeGreaterThan(1000);
  });

  it("serves every recipe when no limit is given", async () => {
    const served = await get();
    expect(served.total).toBe(staticRecipes.length);
    expect(served.recipes).toHaveLength(staticRecipes.length);
    expect(served.limit).toBeNull();
    expect(new Set(ids(served)).size).toBe(staticRecipes.length);
  });

  it("serves every recipe to the request the page used to make (limit=1000)... and beyond", async () => {
    expect((await get("?limit=1000")).recipes).toHaveLength(1000);
    // The old cap is gone: a larger limit is honoured rather than clamped to 1000.
    expect((await get("?limit=100000")).recipes).toHaveLength(staticRecipes.length);
  });

  it("still pages for a caller that asks for a page", async () => {
    const page = await get("?limit=25&offset=100");
    expect(page.recipes).toHaveLength(25);
    expect(page.total).toBe(staticRecipes.length);
    expect(page.offset).toBe(100);
    expect(ids(page)).toEqual(ids(await get()).slice(100, 125));
  });

  it("serves every recipe over POST, with no default or ceiling on the limit", async () => {
    expect((await post({})).recipes).toHaveLength(staticRecipes.length);
    expect((await post({ limit: 5000 })).recipes).toHaveLength(staticRecipes.length);
    expect((await post({ limit: 7 })).recipes).toHaveLength(7);
  });
});

describe("every cuisine the site links to returns its recipes", () => {
  beforeEach(degradedToStatic);

  it.each(Object.keys(CUISINES_METADATA))("%s, by slug, display name and key", async (key) => {
    const name = CUISINES_METADATA[key]?.name ?? key;
    const expected = staticRecipes.filter((r) => (r.cuisine ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase() === name.replace(/[^a-z0-9]/gi, "").toLowerCase());
    if (key !== "HSCA") expect(expected.length).toBeGreaterThan(0);

    const bySlug = await get(`?cuisine=${encodeURIComponent(cuisineToSlug(name))}`);
    const byName = await get(`?cuisine=${encodeURIComponent(name)}`);
    const byKey = await get(`?cuisine=${encodeURIComponent(key)}`);
    const publicExpected = key === "HSCA" ? 0 : expected.length;
    expect(bySlug.total).toBe(publicExpected);
    expect(byName.total).toBe(publicExpected);
    expect(byKey.total).toBe(publicExpected);
  });

  it("serves the 44 Middle Eastern recipes the slug used to miss", async () => {
    const served = await get("?cuisine=middle-eastern");
    expect(served.total).toBe(44);
    expect(served.recipes.every((r) => r.cuisine === "middle eastern")).toBe(true);
  });

  it.each(["all", "All", "all-cuisines"])("%s returns the whole catalog", async (cuisine) => {
    expect((await get(`?cuisine=${cuisine}`)).total).toBe(staticRecipes.length);
  });

  it("searches within a cuisine", async () => {
    const served = await get("?cuisine=thai&q=noodle");
    expect(served.total).toBeGreaterThan(0);
    expect(served.total).toBeLessThan(45);
  });
});

describe("the internal archive code never reaches the frontend", () => {
  it("is absent from the static fallback", async () => {
    degradedToStatic();
    // Ask for everything: the archive-coded recipes sit past the first page.
    const served = await get("?limit=100000");
    expect(staticRecipes.filter((r) => r.cuisine === "hsca").length).toBeGreaterThan(500);
    expect(served.recipes.filter((r) => r.cuisine?.toLowerCase() === "hsca")).toEqual([]);
  });

  it("cannot be filtered for", async () => {
    degradedToStatic();
    expect((await get("?cuisine=hsca")).total).toBe(0);
  });

  it("is absent when the database is unreachable and the route falls back", async () => {
    mockGetAllRecipes.mockRejectedValue(new Error("connection refused"));
    const served = await get("?limit=100000");
    expect(served.note).toMatch(/static cuisine fallback/);
    expect(served.total).toBe(staticRecipes.length);
    expect(served.recipes.some((r) => r.cuisine === "hsca")).toBe(false);
  });
});

describe("the degraded flag is shared and racy, so the list does not trust it", () => {
  // LocalRecipeService keeps one static flag that a concurrent load resets, so
  // after `await getAllRecipes()` it can describe another request's list. The
  // degraded loader hands back the static array itself; that is what is checked.
  it("still adds the static-only recipes when the flag claims 'degraded' but the list is live", async () => {
    mockDegraded = true;
    mockGetAllRecipes.mockResolvedValue(LIVE);
    const served = await get("?cuisine=fusion");
    expect(served.total).toBe(3);
    expect(ids(await get())).toEqual(expect.arrayContaining([LIVE_OYAKODON.id, LIVE_DB_ONLY.id]));
  });

  it("does not pair the static list with itself when the flag claims 'live'", async () => {
    mockDegraded = false;
    mockGetAllRecipes.mockResolvedValue(staticRecipes);
    const served = await get();
    expect(served.total).toBe(staticRecipes.length);
    expect(new Set(ids(served)).size).toBe(staticRecipes.length);
  });
});

describe("a live database is completed by the recipes only the static catalog has", () => {
  beforeEach(liveDatabase);

  it("serves the live recipes plus every static recipe without a live twin, each once", async () => {
    const served = await get();
    const index = buildRecipeIdentityIndex(
      staticRecipes.map(({ id, name, cuisine }) => ({ id, name, ...(cuisine ? { cuisine } : {}) })),
      LIVE.map(({ id, name, cuisine }) => ({ id, name, ...(cuisine ? { cuisine } : {}) })),
    );
    expect(served.total).toBe(LIVE.length + index.staticOnlyIds.length);
    expect(new Set(ids(served)).size).toBe(served.total);
    expect(ids(served)).toEqual(expect.arrayContaining([LIVE_OYAKODON.id, LIVE_DB_ONLY.id]));
  });

  it("does not list the static twin of a live recipe a second time", async () => {
    const served = await get();
    const oyakodon = served.recipes.filter((r) => /^oyakodon/i.test(r.name));
    expect(oyakodon.map((r) => r.id)).toEqual([LIVE_OYAKODON.id]);
  });

  it("lists the Fusion recipes although the database holds none", async () => {
    const served = await get("?cuisine=fusion");
    expect(served.total).toBe(3);
    expect(served.recipes.every((r) => r.id !== LIVE_DB_ONLY.id)).toBe(true);
  });

  it("lists them when the database holds some Fusion recipes of its own too", async () => {
    mockGetAllRecipes.mockResolvedValue([...LIVE, liveRow("11111111-0000-4000-8000-000000000001", "Kimchi Carbonara", "Fusion")]);
    const served = await get("?cuisine=fusion");
    // The live recipe and the three authored ones: the old rule (fall back
    // only when a cuisine has no live match) served just the live one.
    expect(served.total).toBe(4);
  });

  it("serves the same recipes as the sitemap's canonical id list", async () => {
    jest.doMock("@/lib/database", () => ({
      executeQuery: async () => ({
        rows: LIVE.map(({ id, name, cuisine }) => ({ id, name, cuisine: cuisine ?? null })),
      }),
    }));
    try {
      jest.resetModules();
      const { listCanonicalRecipeIds } = await import("@/lib/recipes/recipeRefResolver");
      const canonical = new Set(await listCanonicalRecipeIds());
      expect(canonical.size).toBeGreaterThan(LIVE.length);
      expect(new Set(ids(await get()))).toEqual(canonical);
    } finally {
      jest.dontMock("@/lib/database");
    }
  });
});
