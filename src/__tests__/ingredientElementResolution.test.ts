/**
 * Regression tests for ingredient element resolution.
 *
 * The optional legacy scalar `element` is defined on 0 of the 1,158 catalog
 * ingredients; the real data lives in `elementalProperties` (1158/1158). Two
 * consumers read the scalar and degraded silently:
 *
 *  1. `standardizeIngredient` used `ingredient.element || "Fire"`. Because the
 *     left side is always falsy, the fallback fired for every record and
 *     labeled the entire catalog Fire — a falsy chain that reads as a
 *     deliberate default and is invisible in the output, since "Fire" is a
 *     plausible answer for any single ingredient.
 *  2. `getRecommendedCookingMethodsForIngredient` compared
 *     `String(ingredient.element ?? "")` against `String(method.element ?? "")`.
 *     Neither field exists — methods carry `elementalEffect` — so both sides
 *     were `""` and the "matching element" bonus fired for every pair. Measured
 *     over the catalog, all 31,266 ingredient/method scores were 80. Two absent
 *     fields comparing equal is the failure mode here, not a dead branch.
 *
 * These tests pin the derivation, not a replacement constant: the assertions
 * below fail both on the original code and on any "fix" that swaps one silent
 * default for another.
 */

import { allCookingMethods } from "@/data/cooking";
import { unifiedIngredientService } from "@/services/UnifiedIngredientService";
import type { Element } from "@/types/alchemy";
import {
  _resetElementResolutionReports,
  dominantElementOf,
  isElement,
  resolveIngredientElement,
} from "@/utils/elemental/ingredientElement";
import { elementalSignature } from "@/utils/elemental/signature";
import { getRecommendedCookingMethodsForIngredient } from "@/utils/recommendation/methodRecommendation";

const ELEMENTS: Element[] = ["Fire", "Water", "Earth", "Air"];

function flatCatalog(): Array<Record<string, unknown>> {
  const grouped = unifiedIngredientService.getAllIngredients();
  const flat: Array<Record<string, unknown>> = [];
  for (const items of Object.values(grouped)) {
    for (const item of items as Array<Record<string, unknown>>) flat.push(item);
  }
  return flat;
}

const methodList = Object.entries(
  allCookingMethods as unknown as Record<string, Record<string, unknown>>,
).map(([name, method]) => ({ name, ...method }));

beforeEach(() => {
  _resetElementResolutionReports();
});

describe("dominantElementOf", () => {
  it("ranks a real vector rather than reporting a fixed element", () => {
    // Garlic's actual catalog vector — Fire-dominant.
    expect(
      dominantElementOf({ Fire: 0.45, Water: 0.1, Earth: 0.3, Air: 0.15 }),
    ).toBe("Fire");
    expect(
      dominantElementOf({ Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 }),
    ).toBe("Water");
    expect(
      dominantElementOf({ Fire: 0.1, Water: 0.1, Earth: 0.7, Air: 0.1 }),
    ).toBe("Earth");
    expect(
      dominantElementOf({ Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 }),
    ).toBe("Air");
  });

  it("agrees with the canonical signature model instead of a private argmax", () => {
    const vectors = [
      { Fire: 0.4, Water: 0.4, Earth: 0.1, Air: 0.1 }, // exact tie
      { Fire: 0.0, Water: 0.5, Earth: 0.5, Air: 0.0 }, // exact tie, no Fire
      { Fire: 3, Water: 1, Earth: 2, Air: 4 }, // unnormalized
    ];
    for (const vector of vectors) {
      expect(dominantElementOf(vector)).toBe(
        elementalSignature(vector).dominant,
      );
    }
  });

  it("returns null — not an element — when the vector carries no signal", () => {
    // elementalSignature() normalizes these to an even spread and names Fire
    // by canonical tie-break, which is right for a display bar and wrong as a
    // claim about an ingredient.
    for (const empty of [
      undefined,
      null,
      {},
      { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      { Fire: NaN, Water: 0.5, Earth: 0.2, Air: 0.3 },
      { Fire: 0.5, Water: 0.5 },
      "Fire",
    ]) {
      expect(dominantElementOf(empty)).toBeNull();
    }
    expect(elementalSignature(null).dominant).toBe("Fire");
  });
});

describe("resolveIngredientElement", () => {
  it("derives from elementalProperties when no scalar is present", () => {
    expect(
      resolveIngredientElement({
        name: "kale",
        elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 },
      }),
    ).toBe("Air");
  });

  it("honours a record that declares its own element", () => {
    // So populating the scalar at the data layer later needs no change here.
    expect(
      resolveIngredientElement({
        name: "declared",
        element: "Water",
        elementalProperties: { Fire: 0.9, Water: 0.1, Earth: 0, Air: 0 },
      }),
    ).toBe("Water");
  });

  it("ignores a scalar that is not one of the four elements", () => {
    expect(
      resolveIngredientElement({
        name: "junk",
        element: "spicy",
        elementalProperties: { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 },
      }),
    ).toBe("Water");
  });

  it("returns null and reports rather than substituting an element", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      expect(resolveIngredientElement({ name: "no-basis" })).toBeNull();
      expect(resolveIngredientElement(null)).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });
});

describe("the catalog resolves to more than one element", () => {
  const catalog = flatCatalog();

  it("has a scalar `element` on no record, so reading it is a passthrough", () => {
    // The precondition for the bug. If this ever fails the data layer started
    // populating the scalar and the fallback branches deserve a fresh look.
    const withScalar = catalog.filter((i) => isElement(i.element));
    expect(catalog.length).toBeGreaterThan(1000);
    expect(withScalar).toHaveLength(0);
  });

  it("resolves every record from its vector, with no element unresolvable", () => {
    const unresolved = catalog.filter(
      (i) => resolveIngredientElement(i) === null,
    );
    expect(unresolved).toHaveLength(0);
  });

  it("does not label the whole catalog one element", () => {
    // THE failing condition: before the fix this was Fire 1158 / 1158.
    const counts: Record<string, number> = {};
    for (const ingredient of catalog) {
      const element = resolveIngredientElement(ingredient);
      if (element) counts[element] = (counts[element] ?? 0) + 1;
    }
    for (const element of ELEMENTS) {
      expect(counts[element]).toBeGreaterThan(0);
    }
    // No single element may account for even half the catalog.
    for (const element of ELEMENTS) {
      expect(counts[element]).toBeLessThan(catalog.length / 2);
    }
  });

  it("gives an ingredient the element its own vector ranks first", () => {
    for (const ingredient of catalog.slice(0, 200)) {
      expect(resolveIngredientElement(ingredient)).toBe(
        elementalSignature(
          ingredient.elementalProperties as Parameters<
            typeof elementalSignature
          >[0],
        ).dominant,
      );
    }
  });
});

describe("getRecommendedCookingMethodsForIngredient", () => {
  const catalog = flatCatalog();
  const garlic = catalog.find(
    (i) => String(i.name).toLowerCase() === "garlic",
  ) as Record<string, unknown>;

  it("has cooking methods whose element must also be derived", () => {
    // The other half of the comparison: methods carry `elementalEffect`, not
    // `element`, so resolving only the ingredient would leave the branch dead.
    expect(methodList.length).toBeGreaterThan(10);
    expect(methodList.filter((m) => isElement(m.element))).toHaveLength(0);
    expect(
      methodList.filter((m) => dominantElementOf(m.elementalEffect) !== null)
        .length,
    ).toBe(methodList.length);
  });

  it("no longer scores every method identically", () => {
    // Before the fix every pair scored 80 — 31,266 of 31,266 — because the
    // element bonus was awarded on `"" === ""`.
    const scores = getRecommendedCookingMethodsForIngredient(
      garlic as never,
      methodList as never,
      methodList.length,
    );
    expect(scores.length).toBe(methodList.length);
    expect(new Set(scores.map((s) => s.compatibility)).size).toBeGreaterThan(1);
  });

  it("scores an element-matched method above an unmatched one", () => {
    const element = resolveIngredientElement(garlic);
    expect(element).toBe("Fire");

    const matched = methodList.find(
      (m) => dominantElementOf(m.elementalEffect) === element,
    );
    const unmatched = methodList.find(
      (m) => dominantElementOf(m.elementalEffect) !== element,
    );
    expect(matched).toBeDefined();
    expect(unmatched).toBeDefined();

    const scores = getRecommendedCookingMethodsForIngredient(
      garlic as never,
      [matched, unmatched] as never,
      2,
    );
    const byName = new Map(scores.map((s) => [s.method, s.compatibility]));
    expect(byName.get(String(matched!.name))).toBeGreaterThan(
      byName.get(String(unmatched!.name))!,
    );
  });

  it("separates ingredients of different elements across the catalog", () => {
    // A Fire ingredient and a Water ingredient must not rank methods alike.
    const fire = catalog.find((i) => resolveIngredientElement(i) === "Fire");
    const water = catalog.find((i) => resolveIngredientElement(i) === "Water");
    expect(fire).toBeDefined();
    expect(water).toBeDefined();

    const rank = (ingredient: Record<string, unknown>) =>
      getRecommendedCookingMethodsForIngredient(
        ingredient as never,
        methodList as never,
        methodList.length,
      )
        .map((s) => `${s.method}:${s.compatibility}`)
        .join("|");

    expect(rank(fire!)).not.toEqual(rank(water!));
  });

  it("still honours a method that declares its own element scalar", () => {
    const declared = [
      { name: "declared-fire", element: "Fire", elementalEffect: { Fire: 0, Water: 1, Earth: 0, Air: 0 } },
      { name: "declared-water", element: "Water", elementalEffect: { Fire: 1, Water: 0, Earth: 0, Air: 0 } },
    ];
    const scores = getRecommendedCookingMethodsForIngredient(
      garlic as never,
      declared as never,
      2,
    );
    const byName = new Map(scores.map((s) => [s.method, s.compatibility]));
    expect(byName.get("declared-fire")).toBeGreaterThan(
      byName.get("declared-water")!,
    );
  });

  it("does not invent a match for an ingredient with no elemental basis", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      const scores = getRecommendedCookingMethodsForIngredient(
        { name: "no-basis" } as never,
        methodList as never,
        methodList.length,
      );
      expect(new Set(scores.map((s) => s.compatibility)).size).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});
