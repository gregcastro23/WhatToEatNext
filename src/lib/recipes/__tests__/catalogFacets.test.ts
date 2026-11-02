/**
 * The recipes page's pills and search, as pure functions over a catalog.
 *
 * A pill must select exactly the recipes its count promises, and the same
 * recipes `/api/recipes?cuisine=<slug>` serves, so the page checks that
 * against the real 1,113-recipe catalog and the real cuisine slugs.
 */
import { getServerRecipes } from "@/actions/recipes";
import { cuisineFacets, cuisineSlugOf, searchRecipes } from "@/lib/recipes/catalogFacets";
import { filterRecipes, toPublicRecipe } from "@/lib/recipes/catalogQuery";
import type { Recipe } from "@/types/recipe";
import { cuisineToSlug } from "@/utils/cuisineSlug";

const ELEMENTS = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };

function dish(name: string, cuisine: string | undefined, ingredients: string[] = [], description?: string): Recipe {
  return {
    id: name,
    name,
    ...(cuisine ? { cuisine } : {}),
    ...(description ? { description } : {}),
    ingredients: ingredients.map((ingredient) => ({ name: ingredient, amount: 1, unit: "piece" })),
    instructions: [],
    elementalProperties: ELEMENTS,
  };
}

describe("cuisineSlugOf", () => {
  it("makes the slug the cuisine cards link with", () => {
    expect(cuisineSlugOf("Middle Eastern")).toBe("middle-eastern");
    expect(cuisineSlugOf("  Thai ")).toBe("thai");
    expect(cuisineSlugOf("Tex-Mex & Grill")).toBe("tex-mex-grill");
  });
});

describe("searchRecipes", () => {
  const pool = [
    dish("Spaghetti Pomodoro", "Italian", ["spaghetti", "tomato"], "A summer classic"),
    dish("Jalapeño Poppers", "Mexican", ["jalapeño", "cheese"]),
    dish("Tomato Soup", undefined, ["tomato", "cream"]),
  ];

  it("returns the same array for a blank query", () => {
    expect(searchRecipes(pool, "")).toBe(pool);
    expect(searchRecipes(pool, "   ")).toBe(pool);
  });

  it("keeps catalog order", () => {
    expect(searchRecipes(pool, "tomato").map((r) => r.name)).toEqual(["Spaghetti Pomodoro", "Tomato Soup"]);
  });

  it("looks in name, description, cuisine and ingredients", () => {
    expect(searchRecipes(pool, "classic").map((r) => r.name)).toEqual(["Spaghetti Pomodoro"]);
    expect(searchRecipes(pool, "mexican").map((r) => r.name)).toEqual(["Jalapeño Poppers"]);
    expect(searchRecipes(pool, "cream").map((r) => r.name)).toEqual(["Tomato Soup"]);
  });

  it("wants every word, in any order", () => {
    expect(searchRecipes(pool, "tomato spaghetti").map((r) => r.name)).toEqual(["Spaghetti Pomodoro"]);
    expect(searchRecipes(pool, "tomato mexican")).toEqual([]);
  });

  it("ignores case and accents in both directions", () => {
    expect(searchRecipes(pool, "JALAPENO").map((r) => r.name)).toEqual(["Jalapeño Poppers"]);
    expect(searchRecipes(pool, "jalapeño").map((r) => r.name)).toEqual(["Jalapeño Poppers"]);
  });

  it("finds a name with a curly apostrophe whether or not the query has an apostrophe", () => {
    // The catalog spells it "SHEPHERD’S PIE" (U+2019); nobody types that.
    const shepherds = [dish("SHEPHERD’S PIE", "British")];
    for (const query of ["shepherd's pie", "shepherd’s pie", "shepherds pie", "SHEPHERD’S"]) {
      expect(searchRecipes(shepherds, query)).toEqual(shepherds);
    }
  });

  it("folds the letters that have no accent to strip, so the ASCII spelling finds them", () => {
    const folded: Array<[name: string, typed: string]> = [
      ["Authentic Bœuf Bourguignon", "boeuf"],
      ["Gỏi Cuốn đậu", "dau"],
      ["Straße Wurst", "strasse"],
      ["Smørrebrød", "smorrebrod"],
      ["Łódź Żurek", "lodz"],
      ["Æbleskiver", "aebleskiver"],
    ];
    for (const [name, typed] of folded) {
      const recipes = [dish(name, undefined)];
      expect(searchRecipes(recipes, typed)).toEqual(recipes);
      // The exact spelling keeps finding itself.
      expect(searchRecipes(recipes, name)).toEqual(recipes);
    }
  });

  it("does not match a word that is not there", () => {
    expect(searchRecipes(pool, "zzz")).toEqual([]);
  });
});

describe("cuisineFacets", () => {
  const all = [
    dish("a", "Italian"),
    dish("b", "Italian"),
    dish("c", "Italian"),
    dish("d", "Thai"),
    dish("e", "Thai"),
    dish("f", "Greek"),
    dish("g", undefined),
  ];

  it("lists each cuisine once, biggest first, ties by name", () => {
    expect(cuisineFacets(all, all).map((f) => [f.name, f.total])).toEqual([
      ["Italian", 3],
      ["Thai", 2],
      ["Greek", 1],
    ]);
  });

  it("counts a cuisine's matching recipes separately from its total", () => {
    const matching = [all[0], all[3]].filter((r): r is Recipe => r !== undefined);
    const facets = cuisineFacets(all, matching);
    expect(facets.find((f) => f.name === "Italian")).toMatchObject({ total: 3, matching: 1 });
    expect(facets.find((f) => f.name === "Thai")).toMatchObject({ total: 2, matching: 1 });
    expect(facets.find((f) => f.name === "Greek")).toMatchObject({ total: 1, matching: 0 });
  });

  it("gives a recipe with no cuisine no pill", () => {
    expect(cuisineFacets([dish("x", undefined)], [dish("x", undefined)])).toEqual([]);
  });

  it("treats the spellings of one cuisine as one", () => {
    const facets = cuisineFacets([dish("a", "Middle Eastern"), dish("b", "MiddleEastern"), dish("c", "middle-eastern")], []);
    expect(facets).toHaveLength(1);
    expect(facets[0]).toMatchObject({ total: 3, slug: "middle-eastern" });
  });

  it("names a cuisine in Title Case, whichever spelling comes first", () => {
    // The bundled catalog spells cuisines in lower case ("middle eastern"); live
    // rows use "Middle Eastern". The pill must not depend on which sorts first.
    const bundled = dish("a", "middle eastern");
    const live = dish("b", "Middle Eastern");
    expect(cuisineFacets([bundled, live], []).map((f) => f.name)).toEqual(["Middle Eastern"]);
    expect(cuisineFacets([live, bundled], []).map((f) => f.name)).toEqual(["Middle Eastern"]);
    expect(cuisineFacets([dish("c", "fusion")], []).map((f) => f.name)).toEqual(["Fusion"]);
  });
});

describe("over the real catalog", () => {
  let catalog: Recipe[];
  beforeAll(async () => {
    catalog = (await getServerRecipes()).map(toPublicRecipe);
  }, 60_000);

  it("has a pill for every cuisine, and the pills' counts add up to the recipes that have one", () => {
    const facets = cuisineFacets(catalog, catalog);
    expect(facets.length).toBeGreaterThan(10);
    const withCuisine = catalog.filter((r) => r.cuisine).length;
    expect(facets.reduce((sum, f) => sum + f.total, 0)).toBe(withCuisine);
  });

  it("labels every pill with a capital letter, as the cuisine cards do", () => {
    for (const facet of cuisineFacets(catalog, catalog)) {
      expect({ label: facet.name, capitalised: /^\p{Lu}/u.test(facet.name) }).toEqual({ label: facet.name, capitalised: true });
    }
  });

  it("makes each pill select exactly the recipes it counts, the way the API does", () => {
    // The page filters with filterRecipes, the function /api/recipes runs; a
    // cuisine whose name contains another's would make a pill select more than
    // it counts.
    for (const facet of cuisineFacets(catalog, catalog)) {
      expect({ cuisine: facet.name, selected: filterRecipes(catalog, { cuisine: facet.slug }).length }).toEqual({
        cuisine: facet.name,
        selected: facet.total,
      });
    }
  });

  it("gives each pill the slug the rest of the site uses for that cuisine", () => {
    for (const facet of cuisineFacets(catalog, catalog)) {
      expect({ cuisine: facet.name, slug: facet.slug }).toEqual({ cuisine: facet.name, slug: cuisineToSlug(facet.name) });
    }
  });

  it("never shows an internal archive code as a cuisine", () => {
    const names = cuisineFacets(catalog, catalog).map((f) => f.name.toLowerCase());
    expect(names).not.toContain("hsca");
  });

  it("finds recipes by an ingredient, and every hit really lists it", () => {
    const hits = searchRecipes(catalog, "saffron");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThan(catalog.length);
    for (const hit of hits) {
      const text = [hit.name, hit.description, hit.cuisine, ...(hit.ingredients ?? []).map((i) => i.name)]
        .join(" ")
        .toLowerCase();
      expect(text).toContain("saffron");
    }
  });
});
