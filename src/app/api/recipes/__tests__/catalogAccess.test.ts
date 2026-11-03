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
import { cuisineFacets } from "@/lib/recipes/catalogFacets";
import { buildRecipeIdentityIndex } from "@/lib/recipes/recipeIdentity";
import { CATALOG_TTL_MS } from "@/lib/recipes/catalogTtl";
import { listCanonicalRecipeIds } from "@/lib/recipes/recipeRefResolver";
import { readPublication } from "@/lib/recipes/unpublishedCopies";
import { cuisineToSlug } from "@/utils/cuisineSlug";
import type { Recipe } from "@/types/recipe";

const mockGetAllRecipes = jest.fn<Promise<Recipe[]>, []>();
const mockDbRows = jest.fn<Promise<{ rows: unknown[] }>, []>();
const mockLogError = jest.fn();
let mockDegraded = false;

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getAllRecipes: () => mockGetAllRecipes(),
    getRecipeById: async (id: string) => (await mockGetAllRecipes()).find((r) => r.id === id) ?? null,
    isCatalogDegraded: () => mockDegraded,
  },
}));
jest.mock("@/lib/database", () => ({ executeQuery: () => mockDbRows() }));
jest.mock("@/lib/logger", () => ({
  ...jest.requireActual<typeof import("@/lib/logger")>("@/lib/logger"),
  _logger: { error: (...args: unknown[]) => mockLogError(...args), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
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
  recipes: Recipe[];
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

// These tests exercise the catalog list's own guard against an unpublished
// recipe's copy, so the bundled catalog must reach it whole: no database is
// configured here, whatever the developer's shell exports. The same rule one
// layer down, in getServerRecipes, is tested in servedStaticCatalog.test.ts.
const savedUrls = { url: process.env.DATABASE_URL, publicUrl: process.env.DATABASE_PUBLIC_URL };

beforeAll(async () => {
  delete process.env.DATABASE_URL;
  delete process.env.DATABASE_PUBLIC_URL;
  staticRecipes = await getServerRecipes();
});

afterAll(() => {
  if (savedUrls.url !== undefined) process.env.DATABASE_URL = savedUrls.url;
  if (savedUrls.publicUrl !== undefined) process.env.DATABASE_PUBLIC_URL = savedUrls.publicUrl;
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

/** A new array each time: the resolver caches per live array, so each test is its own catalog refresh. */
function liveDatabase(): void {
  mockDegraded = false;
  mockGetAllRecipes.mockResolvedValue([...LIVE]);
}

/** The table is read once per live catalog refresh; each test starts a new one. */
let clock = 1_000_000_000_000;

/** The live catalog's next refresh: its TTL passes, it hands back a new array, and the read behind the first request lands. */
async function nextRefresh(): Promise<void> {
  clock += CATALOG_TTL_MS;
  mockGetAllRecipes.mockResolvedValue([...LIVE]);
  // The table is read behind the first request after the TTL; let that read land.
  await readPublication().catch(() => undefined);
  await new Promise((resolve) => setTimeout(resolve, 0));
}

interface IdentityRow {
  id: string;
  name: string;
  cuisine: string | null;
}

const identityRow = ({ id, name, cuisine }: Recipe): IdentityRow => ({ id, name, cuisine: cuisine ?? null });

/**
 * The recipes table as the one identity query sees it: the live rows, flagged
 * published, then `unpublished` (or the error) for the rest.
 */
function recipesTable(unpublished: IdentityRow[] | Error = []): void {
  mockDbRows.mockImplementation(async () => {
    if (unpublished instanceof Error) throw unpublished;
    return {
      rows: [
        ...LIVE.map((r) => ({ ...identityRow(r), published: true })),
        ...unpublished.map((r) => ({ ...r, published: false })),
      ],
    };
  });
}

beforeEach(() => {
  mockGetAllRecipes.mockReset();
  mockLogError.mockReset();
  mockDbRows.mockReset();
  mockDegraded = false;
  clock += CATALOG_TTL_MS * 10;
  jest.spyOn(Date, "now").mockImplementation(() => clock);
  recipesTable();
});

afterEach(() => jest.restoreAllMocks());

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

  it("serves the live recipes plus every static recipe without a live twin (none unpublished), each once", async () => {
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
    const canonical = new Set(await listCanonicalRecipeIds());
    expect(canonical.size).toBeGreaterThan(LIVE.length);
    expect(new Set(ids(await get()))).toEqual(canonical);
  });
});

describe("the static copy of an unpublished recipe is not listed", () => {
  beforeEach(liveDatabase);

  /** The one static recipe named like a row the operator unpublished (#558). */
  function haemulPajeon(): Recipe {
    const [first, ...others] = staticRecipes.filter((r) => r.name === "Haemul Pajeon");
    expect(others).toHaveLength(0);
    if (!first) throw new Error("Haemul Pajeon is not in the static catalog");
    return first;
  }
  const UNPUBLISHED_HAEMUL: IdentityRow = {
    id: "5b3f6a52-0000-4000-8000-000000000001",
    name: "Haemul Pajeon",
    cuisine: "Korean",
  };

  async function canonicalIds(): Promise<Set<string>> {
    return new Set(await listCanonicalRecipeIds());
  }

  it("lists it while its database row is public or absent (control)", async () => {
    const served = await get();
    expect(ids(served)).toContain(haemulPajeon().id);
    expect(await canonicalIds()).toContain(haemulPajeon().id);
  });

  it("drops it, and only it, from the catalog and from the sitemap alike", async () => {
    const before = await get();
    recipesTable([UNPUBLISHED_HAEMUL]);
    await nextRefresh();
    const after = await get();
    expect(after.total).toBe(before.total - 1);
    expect(ids(before).filter((id) => !ids(after).includes(id))).toEqual([haemulPajeon().id]);
    expect(await canonicalIds()).not.toContain(haemulPajeon().id);
    expect(new Set(ids(after))).toEqual(await canonicalIds());
  });

  it("still lists the live recipes, and the static ones no unpublished row names", async () => {
    recipesTable([UNPUBLISHED_HAEMUL]);
    const served = await get();
    expect(ids(served)).toEqual(expect.arrayContaining([LIVE_OYAKODON.id, LIVE_DB_ONLY.id]));
    expect((await get("?cuisine=fusion")).total).toBe(3);
  });

  it("keeps the copy hidden when a later read of the unpublished rows fails, and logs it", async () => {
    recipesTable([UNPUBLISHED_HAEMUL]);
    const healthy = await get();
    recipesTable(new Error("connection reset"));
    await nextRefresh(); // asks again, and fails
    const degraded = await get();
    expect(ids(degraded)).toEqual(ids(healthy));
    expect(ids(degraded)).not.toContain(haemulPajeon().id);
    expect((await get("?cuisine=fusion")).total).toBe(3);
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it("lists every static-only recipe, Fusion's included, in a process that has never been able to read the table", async () => {
    recipesTable(new Error("connection reset"));
    const fresh: { GET?: typeof GET } = {};
    await jest.isolateModulesAsync(async () => {
      fresh.GET = (await import("../route")).GET;
    });
    const request = async (query: string): Promise<Served> =>
      (await fresh.GET?.(new Request(`http://localhost/api/recipes${query}`)))?.json();
    const index = buildRecipeIdentityIndex(
      staticRecipes.map(({ id, name, cuisine }) => ({ id, name, ...(cuisine ? { cuisine } : {}) })),
      LIVE.map(({ id, name, cuisine }) => ({ id, name, ...(cuisine ? { cuisine } : {}) })),
    );
    const served = await request("");
    expect(served.total).toBe(LIVE.length + index.staticOnlyIds.length);
    expect(ids(served)).toContain(haemulPajeon().id); // the hollow copy is listed until the table can be read
    expect((await request("?cuisine=fusion")).total).toBe(3);
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it("falls back to every static id in the sitemap in a process that has never read the table", async () => {
    recipesTable(new Error("connection reset"));
    const fresh: { list?: typeof listCanonicalRecipeIds } = {};
    await jest.isolateModulesAsync(async () => {
      fresh.list = (await import("@/lib/recipes/recipeRefResolver")).listCanonicalRecipeIds;
    });
    const canonical = new Set(await fresh.list?.());
    expect(canonical).toContain(haemulPajeon().id);
    expect(canonical.size).toBe(new Set(staticRecipes.map((r) => r.id)).size);
  });

  it("asks the database once per catalog refresh, not once per request", async () => {
    await get();
    await get("?cuisine=fusion");
    await get("?limit=10");
    expect(mockDbRows).toHaveBeenCalledTimes(1);
    await nextRefresh();
    await get();
    expect(mockDbRows).toHaveBeenCalledTimes(2);
  });
});

/** The 14 recipes the operator had unpublished, as the recipes table held them [MEASURED 2026-11-03, production, read-only]. */
const PRODUCTION_UNPUBLISHED: IdentityRow[] = [
  ["Bánh Mì Ốp La", "Vietnamese"],
  ["Bua Loi", "Thai"],
  ["Cháo", "Vietnamese"],
  ["Chè Ba Màu", "Vietnamese"],
  ["Gaeng Panang Neua", "Thai"],
  ["Haemul Pajeon", "Korean"],
  ["Hotteok", "Korean"],
  ["Japchae", "Korean"],
  ["Khao Soi Gai", "Thai"],
  ["Lẩu Thái", "Vietnamese"],
  ["Sangkaya Fak Thong", "Thai"],
  ["Songpyeon", "Korean"],
  ["Thịt Kho Tàu", "Vietnamese"],
  ["Tub Tim Grob", "Thai"],
].map(([name, cuisine], n) => ({
  id: `a1b2c3d4-0000-4000-8000-${String(n + 1).padStart(12, "0")}`,
  name: name ?? "",
  cuisine: cuisine ?? null,
}));

describe("every cuisine category stays filled", () => {
  beforeEach(liveDatabase);

  const categories = Object.keys(CUISINES_METADATA).filter((key) => key !== "HSCA");

  it.each(categories)("%s still has recipes with the operator's 14 unpublished recipes left out", async (key) => {
    recipesTable(PRODUCTION_UNPUBLISHED);
    await nextRefresh();
    const name = CUISINES_METADATA[key]?.name ?? key;
    expect((await get(`?cuisine=${encodeURIComponent(cuisineToSlug(name))}`)).total).toBeGreaterThan(0);
  });

  it("keeps all three Fusion recipes, which exist only as bundled copies, whatever the table says", async () => {
    recipesTable(PRODUCTION_UNPUBLISHED);
    await nextRefresh();
    expect((await get("?cuisine=fusion")).total).toBe(3);
    recipesTable(new Error("connection reset"));
    await nextRefresh();
    expect((await get("?cuisine=fusion")).total).toBe(3);
  });

  it("never leaves the pills short of a category", async () => {
    recipesTable(PRODUCTION_UNPUBLISHED);
    await nextRefresh();
    const all = (await get()).recipes;
    const pills = cuisineFacets(all, all).map((facet) => facet.slug).sort();
    expect(pills).toEqual(categories.map((key) => cuisineToSlug(CUISINES_METADATA[key]?.name ?? key)).sort());
  });
});
