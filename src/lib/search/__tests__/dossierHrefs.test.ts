/**
 * Hero href → dossier. The hero card links to /ingredients/<slug>; the dossier
 * reads GET /api/ingredients/<param>, which resolves through
 * resolveCatalogIngredient: exact, over the union catalog.
 *
 * Before Phase 2.5a the API used IngredientService.getIngredientByName: the
 * unified catalog only, with a substring fallback. [MEASURED 2026-09-23] 15 of
 * 921 names landed on a different card ("Apple Cider Vinegar" → Apple). This
 * file pinned that list; it is now empty, and every spelling a link can carry
 * must reach its own card.
 */
import { allIngredients } from "@/data/ingredients";
import { unifiedIngredients } from "@/data/unified/ingredients";
import { getIngredientCatalog, resolveCatalogIngredient } from "@/lib/ingredients/ingredientCatalog";
import { buildIndexForRecipes } from "../loader";

const catalog = getIngredientCatalog();

function resolvedKey(param: string): string | null {
  return resolveCatalogIngredient(param)?.entry.key ?? null;
}

describe("hero href → dossier resolution", () => {
  it("every search hero href is a canonical slug of its own card", () => {
    const index = buildIndexForRecipes([]);
    const wrong = index.entities
      .filter(({ entity }) => entity.kind === "ingredient")
      .filter(({ entity }) => {
        const resolved = resolveCatalogIngredient(entity.href.replace("/ingredients/", ""));
        return resolved?.entry.key !== entity.key || !resolved.isCanonical;
      })
      .map(({ entity }) => entity.href);
    expect(wrong).toEqual([]);
    expect(index.ingredients.size).toBe(catalog.entries.length);
  });

  it("every card resolves to itself by slug, key and name (no spelling claimed twice)", () => {
    const misroutes = catalog.entries
      .flatMap(({ key, slug, name }) => [slug, key, name].map((param) => ({ key, param })))
      .filter(({ key, param }) => resolvedKey(param) !== key)
      .map(({ key, param }) => `${param}→${resolvedKey(param) ?? "null"} (want ${key})`);
    expect(misroutes).toEqual([]);
  });

  it("every src/data card resolves by name: 921/921, zero misroutes", () => {
    const misroutes = Object.entries(allIngredients)
      .filter(([key, card]) => {
        const hit = resolveCatalogIngredient(card.name)?.entry;
        return hit?.key !== key && !hit?.aliases.includes(key);
      })
      .map(([key]) => key);
    expect(Object.keys(allIngredients)).toHaveLength(921);
    expect(misroutes).toEqual([]);
  });

  it("every ticker link reaches its card: the ticker resolves each unified card by name", () => {
    const misroutes = Object.entries(unifiedIngredients)
      .filter(([key, card]) => {
        const hit = resolveCatalogIngredient(card.name)?.entry;
        return hit?.key !== key && !hit?.aliases.includes(key);
      })
      .map(([key, card]) => `${card.name} (want ${key})`);
    expect(misroutes).toEqual([]);
  });
});

describe("resolveCatalogIngredient", () => {
  it("names the card the old substring fallback got wrong", () => {
    expect(resolvedKey("Apple Cider Vinegar")).toBe("apple_cider_vinegar");
    expect(resolvedKey("parmesan")).toBe("parmesan");
  });

  it("marks only the canonical slug as canonical", () => {
    expect(resolveCatalogIngredient("black-pepper")?.isCanonical).toBe(true);
    for (const alias of ["black_pepper", "Black Pepper", "black pepper"]) {
      expect(resolveCatalogIngredient(alias)).toMatchObject({ entry: { slug: "black-pepper" }, isCanonical: false });
    }
  });

  it("a merged plural card is an alias of its singular", () => {
    expect(resolveCatalogIngredient("bay leaves")).toMatchObject({ entry: { key: "bay_leaf" }, isCanonical: false });
    expect(resolvedKey("bay_leaves")).toBe("bay_leaf");
  });

  it("brings in the unified-only cards: eggs arrive", () => {
    expect(resolveCatalogIngredient("chicken-egg")).toMatchObject({ entry: { name: "Chicken Egg" }, isCanonical: true });
  });

  it("never guesses: no substring or containment fallback", () => {
    // "vinegar" alone IS a card (the generic one); these are not.
    for (const param of ["fresh basil leaves", "apple cider vinegar reduction", "vinegars and oils", "", "---"]) {
      expect(resolveCatalogIngredient(param)).toBeNull();
    }
  });
});
