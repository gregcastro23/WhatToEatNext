/**
 * Regression tests for `IngredientFilterService`'s dietary filter.
 *
 * ## The defect
 *
 * `applyDietaryFilter` read seven boolean flags (`isVegan`, `isVegetarian`,
 * `isGlutenFree`, `isDairyFree`, `isNutFree`, `isLowSodium`, `isLowSugar`)
 * straight off each record and dropped the record when the flag was falsy.
 * Not one of the 372 ingredients in this catalog defines any of those seven
 * flags, so every dietary constraint excluded everything:
 * `filterIngredients({ dietary: { isVegan: true } })` returned `{}` where the
 * unfiltered call returns 6 categories and 372 ingredients.
 *
 * ## Why these assertions are shaped the way they are
 *
 * The snapshot witness that was supposed to cover this path recorded
 * `{veganProteinCount: 0, veganVegetableCount: 0}` and read as passing. It was
 * vacuous twice over: the filter returned nothing, *and* it looked up
 * `.proteins`/`.vegetables` while the service returns `Proteins`/`Vegetables`,
 * so `?? 0` turned an absent key into a real-looking zero. Both failure modes
 * are pinned below - the exact key casing is asserted, counts are read without
 * a `??` fallback, and each count is bounded on both sides so that "nothing
 * came back" cannot pass.
 *
 * Counts were measured against this catalog on 2026-09-02. They are pinned
 * rather than bounded loosely so that a change in the ingredient data or the
 * classifier has to be looked at by a person.
 */

import type { IngredientMapping } from "@/data/ingredients/types";
import {
  IngredientFilterService,
  INGREDIENT_GROUPS,
  type IngredientFilter,
} from "@/services/IngredientFilterService";
import { classifyIngredientDiet } from "@/utils/ingredientDietaryClassification";

const service = IngredientFilterService.getInstance();

// The service's own argument and return types, not widened stand-ins. An
// `as unknown as` bridge here would let the returned shape drift out from
// under these assertions without anything failing.
type Catalog = Record<string, IngredientMapping[]>;

const filter = (f: IngredientFilter): Catalog => service.filterIngredients(f);

const flatten = (c: Catalog): IngredientMapping[] => Object.values(c).flat();

const lowerNames = (c: Catalog): Set<string> =>
  new Set(flatten(c).map((r) => r.name.toLowerCase()));

const CATALOG_CATEGORIES = 6;
const CATALOG_SIZE = 372;

describe("the catalog this filter runs against", () => {
  it("returns every category with no filter applied", () => {
    const all = filter({});
    expect(Object.keys(all)).toHaveLength(CATALOG_CATEGORIES);
    expect(flatten(all)).toHaveLength(CATALOG_SIZE);
  });

  it("carries a curated display name on every record", () => {
    // `filterIngredients` used to substitute the object key when a record had
    // no `name`. Nothing ever needed that: `name` is required on
    // `IngredientMapping` and all 372 records define one, so the fallback was
    // dead code the type checker could see. This is what keeps it dead - if a
    // record ever ships without a name, `.trim()` throws here rather than the
    // service quietly handing back an ingredient named after its slug.
    const names = flatten(filter({})).map((r) => r.name);
    expect(names).toHaveLength(CATALOG_SIZE);
    expect(names.filter((n) => n.trim() === "")).toEqual([]);
  });

  it("carries none of the seven dietary flags the old predicate read", () => {
    // This is *why* the old filter excluded everything, and it is still true:
    // the fix derives the answer instead of reading a flag. If someone
    // reintroduces flag-reading, this records that there is nothing to read.
    const flags = [
      "isVegan",
      "isVegetarian",
      "isGlutenFree",
      "isDairyFree",
      "isNutFree",
      "isLowSodium",
      "isLowSugar",
    ];
    const withAnyFlag = flatten(filter({})).filter((record) =>
      // Key presence, not a truthy value: a record carrying `isVegan: false`
      // or `isVegan: undefined` would still be something to read, and the
      // claim being pinned is that there is nothing to read at all.
      flags.some((flag) => flag in record),
    );
    expect(withAnyFlag).toHaveLength(0);
  });

  it("keys categories in the capitalised form callers must index by", () => {
    // The snapshot witness read `.proteins`/`.vegetables` and got `undefined`,
    // which `?? 0` rendered as a plausible zero. Pin the real casing.
    const all = filter({});
    expect(Object.keys(all)).toEqual([
      INGREDIENT_GROUPS.PROTEINS,
      INGREDIENT_GROUPS.VEGETABLES,
      INGREDIENT_GROUPS.FRUITS,
      INGREDIENT_GROUPS.HERBS,
      INGREDIENT_GROUPS.SPICES,
      INGREDIENT_GROUPS.GRAINS,
    ]);
    expect(all.proteins).toBeUndefined();
    expect(all.vegetables).toBeUndefined();
  });
});

describe("vegan filtering returns a real, non-empty subset", () => {
  it("returns every category, with fewer ingredients than the catalog", () => {
    // The failing condition was `{}` - no categories at all.
    const vegan = filter({ dietary: { isVegan: true } });
    expect(Object.keys(vegan)).toHaveLength(CATALOG_CATEGORIES);
    expect(flatten(vegan).length).toBeGreaterThan(0);
    expect(flatten(vegan).length).toBeLessThan(CATALOG_SIZE);
    expect(flatten(vegan)).toHaveLength(314);
  });

  it("thins the protein category without emptying it", () => {
    // Read without a `??` fallback: an absent key must throw, not read as 0.
    const proteins = filter({ dietary: { isVegan: true } })[
      INGREDIENT_GROUPS.PROTEINS
    ];
    expect(proteins).toBeDefined();
    expect(proteins).toHaveLength(20);
    expect(filter({})[INGREDIENT_GROUPS.PROTEINS]).toHaveLength(76);
  });

  it("leaves the all-plant categories untouched", () => {
    const vegan = filter({ dietary: { isVegan: true } });
    const all = filter({});
    for (const group of [
      INGREDIENT_GROUPS.VEGETABLES,
      INGREDIENT_GROUPS.FRUITS,
      INGREDIENT_GROUPS.GRAINS,
    ]) {
      expect(vegan[group]).toHaveLength(all[group].length);
    }
  });

  it("excludes flesh, dairy and eggs by name", () => {
    const names = lowerNames(filter({ dietary: { isVegan: true } }));
    for (const animalProduct of [
      "salmon",
      "chicken",
      "beef",
      "shrimp",
      "butter",
      "cheddar cheese",
      "greek yogurt",
      "chicken egg",
      "egg yolk",
    ]) {
      expect(names.has(animalProduct)).toBe(false);
    }
  });

  it("excludes animal products filed outside the protein category", () => {
    // Proves the filter classifies records rather than dropping one category:
    // the catalog files these two under Spices and Herbs.
    const names = lowerNames(filter({ dietary: { isVegan: true } }));
    expect(names.has("shrimp paste")).toBe(false);
    expect(names.has("pork sausage")).toBe(false);
  });

  it("keeps plant proteins and plant staples", () => {
    const names = lowerNames(filter({ dietary: { isVegan: true } }));
    for (const plant of [
      "tempeh",
      "seitan",
      "black beans",
      "lentils",
      "garlic",
      "quinoa",
      // Contains a dairy term in its name and must survive it.
      "custard apple (cherimoya)",
    ]) {
      expect(names.has(plant)).toBe(true);
    }
  });

  it("agrees with the classifier on every record in the catalog", () => {
    // Corpus-wide rather than spot-checked: nothing non-compliant leaks
    // through, and nothing compliant is dropped. Keyed by category+name
    // because each call rebuilds its records, so identity never matches and
    // names repeat across categories.
    const key = (category: string, record: IngredientMapping) =>
      `${category}::${record.name}`;
    const collect = (c: Catalog): Set<string> =>
      new Set(
        Object.entries(c).flatMap(([category, records]) =>
          records.map((record) => key(category, record)),
        ),
      );

    const returned = collect(filter({ dietary: { isVegan: true } }));
    const all = filter({});
    let compliantCount = 0;
    for (const [category, records] of Object.entries(all)) {
      for (const record of records) {
        const compliant =
          classifyIngredientDiet(record).isVegan === "compliant";
        if (compliant) compliantCount++;
        expect({
          record: key(category, record),
          returned: returned.has(key(category, record)),
        }).toEqual({
          record: key(category, record),
          returned: compliant,
        });
      }
    }
    // The comparison above passes vacuously if the classifier calls nothing
    // compliant; it does not.
    expect(compliantCount).toBe(314);
    // Equal to compliantCount, not merely close to it: a category+name key
    // collapses duplicate records, so any divergence here means the catalog
    // has grown a duplicate entry. Fruits carried four - "Passion Fruit",
    // "Quince" and "Loquat" defined twice each in fruits/, and "apples"
    // alongside the richer "apple" card - all since removed.
    expect(returned.size).toBe(compliantCount);
    expect(returned.size).toBe(314);
  });
});

describe("vegetarian is a strict superset of vegan", () => {
  it("keeps dairy and eggs that vegan drops", () => {
    const vegetarian = lowerNames(filter({ dietary: { isVegetarian: true } }));
    const vegan = lowerNames(filter({ dietary: { isVegan: true } }));

    for (const name of ["butter", "cheddar cheese", "chicken egg", "egg yolk"]) {
      expect(vegetarian.has(name)).toBe(true);
      expect(vegan.has(name)).toBe(false);
    }
  });

  it("drops flesh from both", () => {
    const vegetarian = lowerNames(filter({ dietary: { isVegetarian: true } }));
    const vegan = lowerNames(filter({ dietary: { isVegan: true } }));
    for (const name of ["salmon", "chicken", "beef", "pork sausage"]) {
      expect(vegetarian.has(name)).toBe(false);
      expect(vegan.has(name)).toBe(false);
    }
  });

  it("contains every vegan result and more", () => {
    const vegetarian = lowerNames(filter({ dietary: { isVegetarian: true } }));
    const vegan = lowerNames(filter({ dietary: { isVegan: true } }));
    for (const name of vegan) expect(vegetarian.has(name)).toBe(true);
    expect(vegetarian.size).toBeGreaterThan(vegan.size);
    expect(flatten(filter({ dietary: { isVegetarian: true } }))).toHaveLength(
      345,
    );
  });
});

describe("allergen claims require attestation and are never derived", () => {
  it("returns only the records that positively attest gluten-free", () => {
    const glutenFree = filter({ dietary: { isGlutenFree: true } });
    const names = [...lowerNames(glutenFree)].sort();
    // Five records attest it. Deriving the claim from a name would return
    // hundreds; reading an absent flag returned none.
    expect(names).toEqual([
      "amaranth",
      "buckwheat",
      "chia seeds",
      "flaxseed",
      "quinoa",
    ]);
  });

  it("returns nothing for claims no record attests", () => {
    // Nut-free and dairy-free are attested by 0 of 372 records. Empty is the
    // correct, safe answer here - unlike vegan, where empty was the bug.
    expect(flatten(filter({ dietary: { isNutFree: true } }))).toHaveLength(0);
    expect(flatten(filter({ dietary: { isDairyFree: true } }))).toHaveLength(0);
  });
});

describe("constraints the catalog cannot answer are rejected, not ignored", () => {
  it("returns no categories for low-sodium and low-sugar", () => {
    expect(Object.keys(filter({ dietary: { isLowSodium: true } }))).toHaveLength(
      0,
    );
    expect(Object.keys(filter({ dietary: { isLowSugar: true } }))).toHaveLength(
      0,
    );
  });

  it("rejects the whole request even when paired with a satisfiable one", () => {
    // Answering the vegan half and silently dropping the sodium half would
    // hand back results that do not meet what was asked for.
    expect(
      Object.keys(filter({ dietary: { isVegan: true, isLowSodium: true } })),
    ).toHaveLength(0);
  });
});

describe("dietary filtering composes with the other filters", () => {
  it("intersects with a category filter", () => {
    const veganProteins = filter({
      dietary: { isVegan: true },
      categories: [INGREDIENT_GROUPS.PROTEINS],
    });
    expect(Object.keys(veganProteins)).toEqual([INGREDIENT_GROUPS.PROTEINS]);
    expect(veganProteins[INGREDIENT_GROUPS.PROTEINS]).toHaveLength(20);
  });

  it("intersects with a search query", () => {
    const beans = filter({
      dietary: { isVegan: true },
      searchQuery: "beans",
    });
    const names = lowerNames(beans);
    expect(names.size).toBeGreaterThan(0);
    expect(names.has("black beans")).toBe(true);
  });
});
