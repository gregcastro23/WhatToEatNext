/**
 * @jest-environment node
 *
 * Every reader of the bundled catalog gets the same answer about a recipe the
 * operator unpublished: the planner and quiz pools, the home recommender,
 * /discover, the detail page and the sitemap all read `getServerRecipes()`
 * (or the pre-built index, or the resolver built on it), so the rule lives
 * there. These tests run the real 1,113-recipe bundled catalog with only the
 * database and the live catalog mocked.
 *
 * The table is read behind the request, never waited for: the first call after
 * it changes still serves the old set, and the read lands for the next. Hence
 * `setTable` and `nextRefresh`, which make the call and let the read finish.
 */
import { getServerRecipeIndex, getServerRecipes } from "@/actions/recipes";
import { quizCatalogResponse, quizDishRecipe } from "@/lib/quiz/serverCatalog";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";
import { CATALOG_TTL_MS } from "../catalogTtl";
import { indexRecipeIdAliases } from "../recipeIdentity";
import {
  listCanonicalRecipeIds,
  loadCanonicalCatalog,
  loadStaticTwinBridge,
  resolveRecipeRef,
  servesStaticFallback,
} from "../recipeRefResolver";
import * as unpublished from "../unpublishedCopies";

const mockDbRows = jest.fn<Promise<{ rows: unknown[] }>, []>();
const mockLive = jest.fn<Promise<Recipe[]>, []>();
const mockLogError = jest.fn();

jest.mock("server-only", () => ({}));
// A short connection timeout, so that the one wait a cold process makes for a hung table is short.
jest.mock("@/lib/database/config", () => {
  const actual = jest.requireActual<typeof import("@/lib/database/config")>("@/lib/database/config");
  return { ...actual, databaseConfig: { ...actual.databaseConfig, connectionTimeout: 400 } };
});
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

/** An unpublished row named like a given bundled recipe. */
function unpublishedLike(recipe: Recipe, n: number): Row {
  return { id: `8e6c9d85-0000-4000-8000-${String(n).padStart(12, "0")}`, name: recipe.name, cuisine: recipe.cuisine ?? "", published: false };
}

/** An unpublished row named like a real bundled Fusion recipe, so a second recipe can be hidden. */
function fusionUnpublished(): Row {
  const fusion = bundled.find((r) => r.cuisine === "fusion");
  if (!fusion) throw new Error("no Fusion recipe in the bundled catalog");
  return { id: "7d5b8c74-0000-4000-8000-000000000003", name: fusion.name, cuisine: "Fusion", published: false };
}

/** The rows of the recipes table: the live rows, flagged published, and `extra` rows. */
function rowsOf(extra: Row[]): { rows: unknown[] } {
  return {
    rows: [
      ...[LIVE_OYAKODON, LIVE_ONLY].map((r) => ({ id: r.id, name: r.name, cuisine: r.cuisine, published: true })),
      ...extra,
    ],
  };
}
function table(...extra: Row[]): void {
  mockDbRows.mockImplementation(async () => rowsOf(extra));
}

let clock = 1_000_000_000_000;

/** Let a read that is under way, and the handlers behind it, finish. */
const settle = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

/** A call, and the read it begins: afterwards the served view is current. */
async function catchUp(): Promise<void> {
  await getServerRecipes();
  await settle();
}

/** The live catalog's next refresh: its TTL passes, and the first call after it brings the new read in. */
async function nextRefresh(): Promise<void> {
  clock += CATALOG_TTL_MS;
  await catchUp();
}

/** Change the table, let the served view follow. */
async function setTable(...extra: Row[]): Promise<void> {
  table(...extra);
  await nextRefresh();
}

/** Resolves to the value, or to "stuck" if it has not settled in `ms`: a call that waits on a hung table would never. */
async function within<T>(promise: Promise<T>, ms = 8000): Promise<T | "stuck"> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stuck = new Promise<"stuck">((resolve) => {
    timer = setTimeout(() => resolve("stuck"), ms);
  });
  try {
    return await Promise.race([promise, stuck]);
  } finally {
    clearTimeout(timer);
  }
}

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

beforeEach(async () => {
  process.env.DATABASE_URL = "postgresql://test@localhost/test";
  mockDbRows.mockReset();
  mockLogError.mockReset();
  mockLive.mockReset();
  mockLive.mockImplementation(async () => [LIVE_OYAKODON, LIVE_ONLY]);
  clock += CATALOG_TTL_MS * 10;
  pinClock();
  await setTable(); // every test starts from a table with nothing unpublished
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
  beforeEach(async () => setTable(HAEMUL_UNPUBLISHED));

  it("leaves out that recipe and no other", async () => {
    const served = await getServerRecipes();
    expect(served).toHaveLength(bundled.length - 1);
    expect(idsOf(bundled).filter((id) => !idsOf(served).includes(id))).toEqual([haemul().id]);
  });

  it("leaves it out of every bucket of the pre-built index, and only it", async () => {
    await setTable();
    const baseline = indexed(await getServerRecipeIndex());
    const inBuckets = baseline.filter((id) => id === haemul().id).length;
    expect(inBuckets).toBeGreaterThan(0); // the control: it is in the index to begin with

    await setTable(HAEMUL_UNPUBLISHED);
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
    await setTable(HAEMUL_UNPUBLISHED, HAEMUL_PUBLISHED);
    expect(idsOf(await getServerRecipes())).toContain(haemul().id);
    expect(indexed(await getServerRecipeIndex())).toContain(haemul().id);
  });
});

describe("the array callers compare by identity", () => {
  it("is one array while the hidden set is unchanged, across calls and across refreshes", async () => {
    await setTable(HAEMUL_UNPUBLISHED);
    const first = await getServerRecipes();
    expect(first).not.toBe(bundled);
    expect(await getServerRecipes()).toBe(first);
    await nextRefresh();
    expect(await getServerRecipes()).toBe(first);
  });

  it("is replaced when the set changes, and is the loaded array again when it empties", async () => {
    await setTable(HAEMUL_UNPUBLISHED);
    const one = await getServerRecipes();
    await setTable(HAEMUL_UNPUBLISHED, fusionUnpublished());
    const two = await getServerRecipes();
    expect(two).not.toBe(one);
    expect(two.length).toBeLessThan(one.length);

    await setTable();
    expect(await getServerRecipes()).toBe(bundled);
  });

  it("is one array for concurrent callers, from one read", async () => {
    table(HAEMUL_UNPUBLISHED);
    mockDbRows.mockClear();
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("@/actions/recipes");
      const all = await Promise.all([fresh.getServerRecipes(), fresh.getServerRecipes(), fresh.getServerRecipes()]);
      expect(all[1]).toBe(all[0]);
      expect(all[2]).toBe(all[0]);
      expect(all[0]).toHaveLength(bundled.length - 1);
    });
    expect(mockDbRows).toHaveBeenCalledTimes(1);
  });

  it("still counts an array handed out before the hidden set changed as the static list", async () => {
    await setTable(HAEMUL_UNPUBLISHED);
    const before = await getServerRecipes(); // what a degraded live catalog took as its fallback
    await setTable(HAEMUL_UNPUBLISHED, fusionUnpublished());
    const after = await getServerRecipes();
    expect(after).not.toBe(before);
    expect(servesStaticFallback(before, after)).toBe(true);
    expect(servesStaticFallback([LIVE_OYAKODON], after)).toBe(false); // a real live catalog is not
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
    await setTable(HAEMUL_UNPUBLISHED);
    const hidden = await getServerRecipes();
    mockDbRows.mockRejectedValue(new Error("connection reset"));
    await nextRefresh();
    expect(await getServerRecipes()).toBe(hidden);
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });
});

describe("when the recipes table does not answer at all", () => {
  const hang = (): void => {
    mockDbRows.mockImplementation(() => new Promise(() => undefined));
  };

  it("holds a cold process for one connection timeout, once, and then serves the whole bundled catalog", async () => {
    hang();
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("@/actions/recipes");
      const served = await within(fresh.getServerRecipes());
      expect(served).not.toBe("stuck");
      expect(Array.isArray(served) && served.map((r) => String(r.id))).toEqual(idsOf(bundled));

      // The wait is made once: the next call, with the table still hung, is prompt.
      const started = performance.now();
      expect(await within(fresh.getServerRecipes())).not.toBe("stuck");
      expect(performance.now() - started).toBeLessThan(150);
    });
  });

  // A read that never answers stays "in flight" for the module that began it, so each
  // of these runs in a module registry of its own and leaves the shared one alone.
  it("does not hold up a warm call: the set last read is served while the refresh hangs", async () => {
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("@/actions/recipes");
      table(HAEMUL_UNPUBLISHED);
      await fresh.getServerRecipes();
      await settle();
      const hidden = await fresh.getServerRecipes();
      expect(hidden).toHaveLength(bundled.length - 1);

      hang();
      mockDbRows.mockClear();
      clock += CATALOG_TTL_MS * 100;
      expect(await within(fresh.getServerRecipes())).toBe(hidden);
      expect(await within(fresh.getServerRecipeIndex())).not.toBe("stuck");
      expect(await within(fresh.getServerRecipes())).toBe(hidden);
      expect(mockDbRows).toHaveBeenCalledTimes(1); // one refresh at a time, not one per call
    });
  });

  it("does not hold up the readers of a degraded live catalog", async () => {
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("@/actions/recipes");
      const resolver = await import("../recipeRefResolver");
      table(HAEMUL_UNPUBLISHED);
      await fresh.getServerRecipes();
      await settle();
      hang();
      clock += CATALOG_TTL_MS * 100;
      // The live catalog failed and fell back to the bundled list; every later reader of that list is prompt.
      mockLive.mockImplementation(() => fresh.getServerRecipes());
      expect(await within(resolver.loadCanonicalCatalog())).not.toBe("stuck");
      expect(await within(resolver.resolveRecipeRef(haemul().id))).toBeNull();
    });
  });
});

describe("with no database configured", () => {
  it("asks nothing and serves the whole bundled catalog", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.DATABASE_PUBLIC_URL;
    table(HAEMUL_UNPUBLISHED);
    mockDbRows.mockClear();
    clock += CATALOG_TTL_MS;
    await catchUp();
    expect(await getServerRecipes()).toBe(bundled);
    expect(mockDbRows).not.toHaveBeenCalled();
  });
});

describe("the first call of a cold process", () => {
  it("is already filtered when the read can only land after the bundled catalog is built", async () => {
    // The build is one synchronous run, so a real socket cannot be served inside it: the read lands just
    // after, on a later turn of the event loop (a mock that answers in microtasks lands before the call
    // looks, and cannot tell a call that waits from one that does not). Here the table answers on a timer,
    // and only once the catalog's build has logged that it is done.
    let release: () => void = () => undefined;
    const built = new Promise<void>((resolve) => {
      release = resolve;
    });
    mockDbRows.mockImplementation(async () => {
      await built;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return rowsOf([HAEMUL_UNPUBLISHED]);
    });
    jest.spyOn(console, "info").mockImplementation((...args: unknown[]) => {
      if (args.some((a) => String(a).includes("Loaded"))) release();
    });
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("@/actions/recipes");
      const served = await within(fresh.getServerRecipes());
      expect(served).not.toBe("stuck");
      expect(Array.isArray(served) && served.map((r) => String(r.id))).not.toContain(haemul().id);
    });
  });
});

describe("the cost of asking", () => {
  it("begins the read once the bundled catalog is built, not beside the build", async () => {
    // The build is one synchronous run, so a read begun beside it cannot be served until it ends, and
    // would be logged as a slow query on every cold start for the time the build held it.
    table(HAEMUL_UNPUBLISHED);
    mockDbRows.mockClear();
    await jest.isolateModulesAsync(async () => {
      const fresh = await import("@/actions/recipes");
      const pending = fresh.getServerRecipes();
      expect(mockDbRows).not.toHaveBeenCalled(); // the build is still running
      expect(idsOf(await pending)).not.toContain(haemul().id); // and the first call is filtered all the same
      expect(mockDbRows).toHaveBeenCalledTimes(1);
    });
  });

  it("works the rule out once per read of the table, not once per call", async () => {
    await setTable(HAEMUL_UNPUBLISHED);
    await catchUp(); // the view has now seen the read that brought the new set in
    const rule = jest.spyOn(unpublished, "hiddenStaticIds");
    const afterFirst = rule.mock.calls.length;

    await getServerRecipes();
    await getServerRecipeIndex();
    await Promise.all([getServerRecipes(), getServerRecipes()]);
    expect(rule).toHaveBeenCalledTimes(afterFirst);

    await nextRefresh();
    await catchUp();
    expect(rule).toHaveBeenCalledTimes(afterFirst + 1); // one new read of the table, one new evaluation
  });
});

describe("the hidden set follows the table, one recipe or the other", () => {
  it("is replaced when one recipe is republished and another unpublished, at the same count", async () => {
    await setTable(HAEMUL_UNPUBLISHED);
    const first = await getServerRecipes();
    await setTable(fusionUnpublished());
    const second = await getServerRecipes();
    expect(second).not.toBe(first);
    expect(second).toHaveLength(first.length);
    expect(idsOf(first).filter((id) => !idsOf(second).includes(id))).toHaveLength(1);
    expect(idsOf(second).filter((id) => !idsOf(first).includes(id))).toEqual([haemul().id]);
  });

  it("hides the first and the last bundled recipe like any other", async () => {
    const named = bundled.filter((r) => bundled.filter((o) => o.name === r.name).length === 1);
    const first = named[0];
    const last = named[named.length - 1];
    if (!first || !last) throw new Error("no uniquely named bundled recipes");
    expect(bundled.indexOf(first)).toBeLessThan(5);
    expect(bundled.indexOf(last)).toBeGreaterThan(bundled.length - 5);
    await setTable(unpublishedLike(first, 1), unpublishedLike(last, 2));
    const served = idsOf(await getServerRecipes());
    expect(served).not.toContain(String(first.id));
    expect(served).not.toContain(String(last.id));
    expect(served).toHaveLength(bundled.length - 2);
  });
});

describe("the sitemap's own list", () => {
  it("is the served static list when the database holds no published row at all", async () => {
    mockDbRows.mockImplementation(async () => ({ rows: [HAEMUL_UNPUBLISHED] }));
    await nextRefresh();
    const served = idsOf(await getServerRecipes());
    expect(served).not.toContain(haemul().id);
    expect(new Set(await listCanonicalRecipeIds())).toEqual(new Set(served));
  });
});

describe("a database configured only by DATABASE_PUBLIC_URL", () => {
  it("hides the recipe: the pool reads that variable when DATABASE_URL is absent", async () => {
    delete process.env.DATABASE_URL;
    process.env.DATABASE_PUBLIC_URL = "postgresql://test@localhost/test";
    try {
      await setTable(HAEMUL_UNPUBLISHED);
      expect(idsOf(await getServerRecipes())).not.toContain(haemul().id);
    } finally {
      delete process.env.DATABASE_PUBLIC_URL;
    }
  });
});

describe("what is built from the served catalog follows the hidden set", () => {
  it("rebuilds the quiz catalog when a recipe is unpublished or republished, and the dish route agrees", async () => {
    const dish = (await quizCatalogResponse()).dishes[0];
    if (!dish) throw new Error("the quiz catalog is empty");
    const recipe = await quizDishRecipe(dish.id);
    if (!recipe) throw new Error("the control failed: the first quiz dish has no recipe"); // it is a quiz dish to begin with

    await setTable(unpublishedLike(recipe, 3));
    expect((await quizCatalogResponse()).dishes.map((d) => d.id)).not.toContain(dish.id);
    expect(await quizDishRecipe(dish.id)).toBeNull();

    await setTable();
    expect((await quizCatalogResponse()).dishes.map((d) => d.id)).toContain(dish.id);
    expect(await quizDishRecipe(dish.id)).not.toBeNull();
  });

  it("refreshes UnifiedRecipeService's copy on the catalog's TTL, not never", async () => {
    const service = UnifiedRecipeService.getInstance();
    expect((await service.getAllRecipes()).map((r) => String(r.id))).toContain(haemul().id);

    table(HAEMUL_UNPUBLISHED);
    clock += CATALOG_TTL_MS - 1;
    expect((await service.getAllRecipes()).map((r) => String(r.id))).toContain(haemul().id); // still fresh

    await nextRefresh(); // the TTL has passed and the served catalog has caught up
    expect((await service.getAllRecipes()).map((r) => String(r.id))).not.toContain(haemul().id);
  });
});
