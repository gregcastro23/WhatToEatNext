/**
 * MCP recipe search covers the whole catalog.
 *
 * generate_cosmic_recipe passed `limit: 50` to RecipeService.searchRecipes,
 * which slices the catalog BEFORE the handler's prompt and element filters
 * run: a search only ever saw the first 50 recipes, whatever the catalog held
 * (1,113 in the static catalog). The other MCP tests mock RecipeService, which
 * is how this went unseen; this one runs the real service over a catalog
 * larger than the old window.
 */
import type { Recipe } from "@/types/recipe";

const CATALOG_SIZE = 120;

/** Hoisted, so the mock factory below can build the same catalog the tests count. */
function mockRecipe(n: number): Recipe {
  return {
    id: `recipe-${n}`,
    name: n === 100 ? "The Needle Stew" : `Plain Recipe ${n}`,
    cuisine: n > 110 ? "Thai" : "Italian",
    ingredients: [],
    instructions: [],
    elementalProperties:
      n === 115
        ? { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 }
        : { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 },
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
  };
}

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getAllRecipes: async () => Array.from({ length: 120 }, (_, i) => mockRecipe(i + 1)),
    isCatalogDegraded: () => false,
  },
}));
jest.mock("@/lib/mcp/invocationLog", () => ({
  recordInvocation: jest.fn().mockResolvedValue(undefined),
}));

import { generateCosmicRecipe, invokeTool, structuredToolContent } from "@/lib/mcp/tools";
import { validateToolOutput } from "@/lib/mcp/validation";

interface Search {
  totalMatching: number;
  returnedCount: number;
  offset: number;
  recipes: Array<{ id: string; name: string }>;
}

function isSearch(value: unknown): value is Search {
  return (
    typeof value === "object" &&
    value !== null &&
    "totalMatching" in value &&
    "returnedCount" in value &&
    "offset" in value &&
    "recipes" in value &&
    Array.isArray(value.recipes)
  );
}

async function search(args: Parameters<typeof generateCosmicRecipe>[0] = {}): Promise<Search> {
  const result = await generateCosmicRecipe(args);
  expect(result.ok).toBe(true);
  if (!isSearch(result.data)) throw new Error("Not a recipe search result");
  return result.data;
}

describe("generate_cosmic_recipe searches the whole catalog", () => {
  it("is searching a catalog larger than the old 50-recipe window (control)", () => {
    expect(CATALOG_SIZE).toBeGreaterThan(50);
  });

  it("counts every recipe, not the first 50", async () => {
    const found = await search();
    expect(found.totalMatching).toBe(CATALOG_SIZE);
    expect(found.returnedCount).toBe(5);
    expect(found.offset).toBe(0);
  });

  it("finds a recipe by prompt wherever it sits in the catalog", async () => {
    const found = await search({ prompt: "needle" });
    expect(found.totalMatching).toBe(1);
    expect(found.recipes.map((r) => r.id)).toEqual(["recipe-100"]);
  });

  it("filters by cuisine and element across the whole catalog", async () => {
    expect((await search({ cuisine: "thai" })).totalMatching).toBe(10);
    const fire = await search({ dominantElement: "Fire" });
    expect(fire.recipes.map((r) => r.id)).toEqual(["recipe-115"]);
  });
});

describe("limit and offset reach every recipe, with no maximum", () => {
  it("returns every match when asked", async () => {
    const all = await search({ limit: 1_000_000 });
    expect(all.returnedCount).toBe(CATALOG_SIZE);
    expect(new Set(all.recipes.map((r) => r.id)).size).toBe(CATALOG_SIZE);
  });

  it("pages through the catalog without gaps or repeats", async () => {
    const seen: string[] = [];
    for (let offset = 0; offset < CATALOG_SIZE; offset += 25) {
      const page = await search({ limit: 25, offset });
      expect(page.offset).toBe(offset);
      seen.push(...page.recipes.map((r) => r.id));
    }
    expect(seen).toHaveLength(CATALOG_SIZE);
    expect(new Set(seen).size).toBe(CATALOG_SIZE);
  });

  it("returns a short last page and an empty page past the end", async () => {
    expect((await search({ limit: 10, offset: 115 })).returnedCount).toBe(5);
    expect((await search({ limit: 10, offset: 500 })).returnedCount).toBe(0);
  });

  it("accepts them over the wire and publishes a conforming result", async () => {
    const result = await invokeTool("generate_cosmic_recipe", { limit: 120, offset: 0 });
    expect(result.ok).toBe(true);
    expect(validateToolOutput("generate_cosmic_recipe", structuredToolContent(result))).toBeNull();
    expect(result.summary.returnedCount).toBe(CATALOG_SIZE);
  });

  it.each([{ limit: 0 }, { limit: -1 }, { limit: 1.5 }, { offset: -1 }, { limit: "5" }])(
    "rejects %j before doing any work",
    async (args) => {
      const result = await invokeTool("generate_cosmic_recipe", args);
      expect(result.errorCode).toBe("INVALID_ARGS");
    },
  );
});
