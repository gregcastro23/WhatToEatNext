/**
 * The cuisine search over the real catalog (static list; the loader passes the
 * live one in production): versions, held-back variants and cross-cuisine
 * matches, plus parity between the held-back walk and the loader it mirrors.
 *
 * @jest-environment node
 */
import { getServerRecipes } from "@/actions/recipes";
import { loadRawCuisine, PRIMARY_CUISINE_KEYS } from "@/data/cuisines/index";
import { buildIndexForRecipes } from "../loader";
import { searchRecipeGroups } from "../recipeGroups";
import { dishKind } from "../recipeSimilar";
import { distinctRepeats, getRecipeVariants, type RecipeVariant } from "../recipeVariants";
import type { Recipe } from "@/types/recipe";
import type { SearchIndex } from "../searchIndex";
import type { RecipeSearchResponse } from "@/lib/validation/recipeSearchSchemas";

const NOW = new Date("2026-11-25T12:00:00Z");
let served: Recipe[];
let index: SearchIndex;
let variants: readonly RecipeVariant[];

beforeAll(async () => {
  served = await getServerRecipes();
  index = buildIndexForRecipes(served);
  variants = await getRecipeVariants();
}, 120_000);

const search = (query: string): RecipeSearchResponse => searchRecipeGroups(index, query, { now: NOW, variants });

async function rawNames(): Promise<string[]> {
  const files = await Promise.all(PRIMARY_CUISINE_KEYS.map((key) => loadRawCuisine(key)));
  return files.flatMap((raw) => {
    const dishes: unknown = typeof raw === "object" && raw !== null ? Reflect.get(raw, "dishes") : undefined;
    return Object.values(typeof dishes === "object" && dishes !== null ? dishes : {}).flatMap((bySeason: unknown) =>
      Object.values(typeof bySeason === "object" && bySeason !== null ? bySeason : {}).flatMap((list: unknown) =>
        Array.isArray(list)
          ? list.flatMap((dish: unknown) => {
              const name: unknown = typeof dish === "object" && dish !== null ? Reflect.get(dish, "name") : undefined;
              return typeof name === "string" && name !== "" ? [name.toLowerCase().trim()] : [];
            })
          : [],
      ),
    );
  });
}

describe("held-back versions", () => {
  it("are exactly the repeats of names the loader serves", async () => {
    const names = await rawNames();
    const servedNames = new Set(served.map((recipe) => recipe.name.toLowerCase().trim()));
    expect(new Set(names)).toEqual(servedNames);
    expect(variants.length).toBeGreaterThan(40);
    expect(variants.length).toBeLessThanOrEqual(names.length - served.length);
    expect(variants.every((variant) => servedNames.has(variant.nameKey))).toBe(true);
  });

  it("skips a repeat with the same ingredients", () => {
    const dish = (name: string, set: string): { variant: RecipeVariant; ingredientSet: string } => ({
      ingredientSet: set,
      variant: { name, nameKey: name.toLowerCase(), cuisine: null, meal: "dinner", description: null, totalMinutes: null, ingredients: [], steps: [] },
    });
    const repeats = distinctRepeats([dish("Soup", "a"), dish("Soup", "a"), dish("Soup", "b"), dish("Soup", "b")]);
    expect(repeats).toHaveLength(1);
  });

  it("never names the internal archive collection", () => {
    expect(variants.some((variant) => /hsca/i.test(variant.cuisine ?? ""))).toBe(false);
  });
});

describe("searchRecipeGroups", () => {
  it("gathers every version of a dish, held-back ones included", () => {
    const [moussaka] = search("moussaka").groups;
    expect(moussaka?.versions.length).toBeGreaterThanOrEqual(4);
    expect(moussaka?.versions.some((version) => version.onFile !== null && version.href === null)).toBe(true);
    expect(moussaka?.versions.every((version) => (version.id === null) === (version.href === null))).toBe(true);
  });

  it("offers cross-cuisine dishes with the shared ingredients as the basis", () => {
    const [moussaka] = search("moussaka").groups;
    const own = new Set(moussaka?.versions.map((version) => version.cuisine?.toLowerCase()));
    expect(moussaka?.crossCuisine.length).toBeGreaterThan(0);
    for (const match of moussaka?.crossCuisine ?? []) {
      expect(own.has(match.cuisine.toLowerCase())).toBe(false);
      expect(match.shared.length).toBeGreaterThanOrEqual(3);
    }
    expect(moussaka?.crossCuisine[0]?.shared).toContain("eggplant");
  });

  it("matches a dish named for an ingredient only with dishes that use it", () => {
    const matches = search("yu xiang eggplant").groups[0]?.crossCuisine ?? [];
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((match) => match.shared.includes("eggplant"))).toBe(true);
  });

  it("finds recipes by ingredients and says what each uses", () => {
    const result = search("eggplant tahini");
    expect(result.groups[0]?.matchedBy).toBe("ingredient");
    expect(result.groups[0]?.matchNote).toMatch(/uses/);
  });

  it("answers nothing for an empty query", () => {
    expect(search("  ").groups).toEqual([]);
  });

  it("never names the internal archive collection to the reader", () => {
    // Static ids (and so their URLs) carry the code; no visible text may.
    const shown = search("caesar salad").groups.flatMap((group) => [
      group.title,
      ...group.versions.flatMap((version) => [version.name, version.cuisine ?? "", ...version.labels]),
      ...group.crossCuisine.flatMap((match) => [match.name, match.cuisine]),
    ]);
    expect(shown.join(" ")).not.toMatch(/hsca/i);
  });
});

describe("dishKind", () => {
  it("keeps sauces, drinks and desserts apart from dishes", () => {
    expect(dishKind("Sesame Garlic Dressing", ["lunch"])).toBe("sauce");
    expect(dishKind("Mango Lassi", [])).toBe("drink");
    expect(dishKind("Baklava", ["dessert"])).toBe("dessert");
    expect(dishKind("Moussaka", ["dinner"])).toBe("dish");
  });
});
