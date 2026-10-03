/**
 * getSearchIndex while the database is slow (production, 2026-09-24): the
 * catalog query timed out after ~6 s on every uncached search because the
 * static fallback was never cached. The loader now reuses a degraded index for
 * a minute, shares one load between concurrent callers, and keeps a live index
 * when a refresh fails. LocalRecipeService is mocked at the module boundary;
 * each test loads a fresh loader (jest.config resetModules).
 */
import type { Recipe } from "@/types/recipe";

const mockGetAllRecipes = jest.fn<Promise<Recipe[]>, []>();
const mockIsCatalogDegraded = jest.fn<boolean, []>();

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getAllRecipes: () => mockGetAllRecipes(),
    isCatalogDegraded: () => mockIsCatalogDegraded(),
  },
}));

type Loader = typeof import("../loader");

function freshLoader(): Loader {
  let loader: Loader | null = null;
  jest.isolateModules(() => {
    loader = jest.requireActual<Loader>("../loader");
  });
  if (!loader) throw new Error("loader did not load");
  return loader;
}

const T0 = 1_790_000_000_000;

function at(ms: number): void {
  jest.spyOn(Date, "now").mockReturnValue(ms);
}

describe("getSearchIndex under a slow database", () => {
  it("reuses a degraded index for 60 s instead of re-running the catalog query", async () => {
    const { getSearchIndex } = freshLoader();
    const fallback: Recipe[] = [];
    mockGetAllRecipes.mockResolvedValue(fallback);
    mockIsCatalogDegraded.mockReturnValue(true);
    at(T0);
    const first = await getSearchIndex();
    at(T0 + 59_000);
    expect(await getSearchIndex()).toBe(first);
    expect(mockGetAllRecipes).toHaveBeenCalledTimes(1);
    at(T0 + 61_000);
    await getSearchIndex();
    expect(mockGetAllRecipes).toHaveBeenCalledTimes(2);
  }, 60_000);

  it("concurrent callers share one catalog load", async () => {
    const { getSearchIndex } = freshLoader();
    let release: (recipes: Recipe[]) => void = () => undefined;
    mockGetAllRecipes.mockReturnValue(new Promise<Recipe[]>((resolve) => (release = resolve)));
    mockIsCatalogDegraded.mockReturnValue(false);
    const pending = [getSearchIndex(), getSearchIndex(), getSearchIndex()];
    release([]);
    const [a, b, c] = await Promise.all(pending);
    expect(mockGetAllRecipes).toHaveBeenCalledTimes(1);
    expect(b).toBe(a);
    expect(c).toBe(a);
  }, 60_000);

  it("a failed refresh keeps the last live index", async () => {
    const { getSearchIndex } = freshLoader();
    mockGetAllRecipes.mockResolvedValueOnce([]);
    mockIsCatalogDegraded.mockReturnValueOnce(false);
    const live = await getSearchIndex();
    mockGetAllRecipes.mockResolvedValueOnce([]);
    mockIsCatalogDegraded.mockReturnValueOnce(true);
    expect(await getSearchIndex()).toBe(live);
  }, 60_000);

  it("control: a healthy catalog is asked every time, and a new catalog rebuilds the index", async () => {
    const { getSearchIndex } = freshLoader();
    mockIsCatalogDegraded.mockReturnValue(false);
    mockGetAllRecipes.mockResolvedValueOnce([]);
    const first = await getSearchIndex();
    mockGetAllRecipes.mockResolvedValueOnce([]);
    const second = await getSearchIndex();
    expect(mockGetAllRecipes).toHaveBeenCalledTimes(2);
    expect(second).not.toBe(first);
  }, 60_000);
});
