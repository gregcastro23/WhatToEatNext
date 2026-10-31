import {
  cuisineKey,
  filterRecipes,
  pageOf,
  parseCatalogWindow,
  toPublicRecipe,
} from "@/lib/recipes/catalogQuery";
import type { Recipe } from "@/types/recipe";

const ELEMENTS = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

function recipe(
  id: string,
  name: string,
  extra: Partial<Recipe> = {},
): Recipe {
  return {
    id,
    name,
    ingredients: [],
    instructions: [],
    elementalProperties: ELEMENTS,
    ...extra,
  };
}

const SHAKSHUKA = recipe("1", "Shakshuka", { cuisine: "Middle Eastern", description: "Eggs in tomato" });
const ARCHIVE_STEW = recipe("4", "Archive Stew", { cuisine: "hsca" });
const NO_CUISINE_SOUP = recipe("5", "No Cuisine Soup");

const POOL = [
  SHAKSHUKA,
  recipe("2", "Pad Thai", { cuisine: "Thai", ingredients: [{ name: "Rice Noodles", amount: 1, unit: "lb" }] }),
  recipe("3", "Fusion Tacos", { cuisine: "fusion" }),
  ARCHIVE_STEW,
  NO_CUISINE_SOUP,
  recipe("6", "Fiery Chili", { cuisine: "Mexican", elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 } }),
];

const names = (recipes: readonly Recipe[]): string[] => recipes.map((r) => r.name);

describe("cuisineKey", () => {
  it.each([
    ["Middle Eastern", "middleeastern"],
    ["middle-eastern", "middleeastern"],
    ["MiddleEastern", "middleeastern"],
    ["  Middle   Eastern ", "middleeastern"],
    ["Latin-American", "latinamerican"],
    ["", ""],
  ])("reduces %j to %j", (input, expected) => {
    expect(cuisineKey(input)).toBe(expected);
  });
});

describe("filterRecipes cuisine", () => {
  it.each(["Middle Eastern", "middle-eastern", "MiddleEastern", "middle eastern", "MIDDLE_EASTERN"])(
    "finds a Middle Eastern recipe by %j",
    (cuisine) => {
      expect(names(filterRecipes(POOL, { cuisine }))).toEqual(["Shakshuka"]);
    },
  );

  it.each([undefined, null, "", "   ", "all", "All", "all-cuisines", "All Cuisines"])(
    "treats %j as every cuisine",
    (cuisine) => {
      expect(filterRecipes(POOL, { cuisine })).toHaveLength(POOL.length);
    },
  );

  it("keeps the earlier substring behaviour for partial terms", () => {
    expect(names(filterRecipes(POOL, { cuisine: "mex" }))).toEqual(["Fiery Chili"]);
  });

  it("matches a recipe without a cuisine only when no cuisine is asked for", () => {
    expect(names(filterRecipes(POOL, { cuisine: "soup" }))).toEqual([]);
  });

  it("does not let the internal archive code be filtered for", () => {
    // A public recipe has already had "hsca" removed; the filter sees none.
    const served = POOL.map(toPublicRecipe);
    expect(filterRecipes(served, { cuisine: "hsca" })).toEqual([]);
  });
});

describe("filterRecipes search and element", () => {
  it("searches name, description, cuisine and ingredient names", () => {
    expect(names(filterRecipes(POOL, { search: "tomato" }))).toEqual(["Shakshuka"]);
    expect(names(filterRecipes(POOL, { search: "noodles" }))).toEqual(["Pad Thai"]);
    expect(names(filterRecipes(POOL, { search: "fusion" }))).toEqual(["Fusion Tacos"]);
  });

  it("selects by dominant element", () => {
    expect(names(filterRecipes(POOL, { element: "fire" }))).toContain("Fiery Chili");
  });

  it("combines filters", () => {
    expect(filterRecipes(POOL, { cuisine: "thai", search: "tomato" })).toEqual([]);
  });
});

describe("toPublicRecipe", () => {
  it("removes the internal archive code and nothing else", () => {
    const served = toPublicRecipe(ARCHIVE_STEW);
    expect(served).not.toHaveProperty("cuisine");
    expect(served).toMatchObject({ id: "4", name: "Archive Stew" });
  });

  it("leaves real cuisines, and recipes without one, as they are", () => {
    expect(toPublicRecipe(SHAKSHUKA)).toBe(SHAKSHUKA);
    expect(toPublicRecipe(NO_CUISINE_SOUP)).toBe(NO_CUISINE_SOUP);
  });
});

describe("the page window never caps the catalog", () => {
  it("reads no limit as unlimited", () => {
    expect(parseCatalogWindow(null, null)).toEqual({ limit: null, offset: 0 });
    expect(parseCatalogWindow(undefined, undefined)).toEqual({ limit: null, offset: 0 });
    expect(parseCatalogWindow("", "")).toEqual({ limit: null, offset: 0 });
  });

  it("treats an invalid limit as no limit rather than a small default", () => {
    for (const bad of ["abc", "0", "-5", "1.5"])
      expect(parseCatalogWindow(bad, null).limit).toBeNull();
  });

  it("honours any positive limit, with no ceiling", () => {
    expect(parseCatalogWindow("25", "10")).toEqual({ limit: 25, offset: 10 });
    expect(parseCatalogWindow("5000000", null).limit).toBe(5_000_000);
  });

  it("ignores a negative or fractional offset", () => {
    expect(parseCatalogWindow(null, "-3").offset).toBe(0);
    expect(parseCatalogWindow(null, "2.5").offset).toBe(0);
  });

  it("returns everything from the offset when unlimited, and exactly a page otherwise", () => {
    const items = Array.from({ length: 2500 }, (_, i) => i);
    expect(pageOf(items, { limit: null, offset: 0 })).toHaveLength(2500);
    expect(pageOf(items, { limit: null, offset: 100 })).toHaveLength(2400);
    expect(pageOf(items, { limit: 10, offset: 5 })).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    expect(pageOf(items, { limit: 100000, offset: 0 })).toHaveLength(2500);
  });
});
