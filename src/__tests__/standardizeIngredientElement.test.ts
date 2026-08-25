/**
 * Regression test for `standardizeIngredient`'s element field.
 *
 * It read `ingredient.element || "Fire"`. The scalar is defined on 0 of the
 * 1,158 catalog records, so the fallback fired for every ingredient and the
 * whole catalog came out Fire. The element is now derived from the record's own
 * `elementalProperties` through the canonical signature model.
 *
 * `standardizeIngredient` is module-private and reachable only through
 * `getAllIngredients()`, which loads the nine ingredient data modules by
 * dynamic import — so they are mocked here. That is also the only way to reach
 * it at all: against the real data `getAllIngredients()` throws in the
 * astrological-profile filter above it (a separate, pre-existing defect,
 * documented in place and deliberately left alone), because it dereferences
 * `elementalAffinity.base` without a guard.
 */

const profile = {
  elementalAffinity: { base: "Fire" },
  rulingPlanets: ["Sun"],
};

const vegetables = {
  "test carrot": {
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
    astrologicalProfile: profile,
  },
  "test kale": {
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 },
    astrologicalProfile: profile,
  },
  "test chili": {
    elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 },
    astrologicalProfile: profile,
  },
  "test cucumber": {
    elementalProperties: { Fire: 0.05, Water: 0.75, Earth: 0.1, Air: 0.1 },
    astrologicalProfile: profile,
  },
  "test declared": {
    element: "Water",
    elementalProperties: { Fire: 0.9, Water: 0.1, Earth: 0, Air: 0 },
    astrologicalProfile: profile,
  },
};

jest.mock("@/data/ingredients/vegetables", () => ({ vegetables }));
jest.mock("@/data/ingredients/fruits", () => ({ fruits: {} }));
jest.mock("@/data/ingredients/herbs", () => ({ herbs: {} }));
jest.mock("@/data/ingredients/spices", () => ({ spices: {} }));
jest.mock("@/data/ingredients/proteins", () => ({ _proteins: {} }));
jest.mock("@/data/ingredients/grains", () => ({ grains: {} }));
jest.mock("@/data/ingredients/seasonings", () => ({ seasonings: {} }));
jest.mock("@/data/ingredients/oils", () => ({ oils: {} }));
jest.mock("@/data/ingredients/vinegars", () => ({ vinegars: {} }));

import { getAllIngredients } from "@/utils/recommendation/ingredientRecommendation";

describe("standardizeIngredient element", () => {
  it("derives each element from the record's own vector", async () => {
    const list = await getAllIngredients();
    const byName = new Map(list.map((i) => [i.name, i]));

    expect(byName.size).toBe(Object.keys(vegetables).length);
    expect(byName.get("test carrot")?.element).toBe("Earth");
    expect(byName.get("test kale")?.element).toBe("Air");
    expect(byName.get("test chili")?.element).toBe("Fire");
    expect(byName.get("test cucumber")?.element).toBe("Water");
  });

  it("does not stamp every ingredient Fire", async () => {
    // THE failing condition: the original produced Fire for all five.
    const list = await getAllIngredients();
    const elements = list.map((i) => i.element);
    expect(new Set(elements).size).toBeGreaterThan(1);
    expect(elements.filter((e) => e === "Fire")).toHaveLength(1);
  });

  it("keeps the scalar consistent with the vector it ships alongside", async () => {
    const list = await getAllIngredients();
    for (const ingredient of list) {
      if (ingredient.name === "test declared") continue;
      const values = ingredient.elementalProperties as Record<string, number>;
      const best = (["Fire", "Water", "Earth", "Air"] as const).reduce((a, b) =>
        values[b] > values[a] ? b : a,
      );
      expect(ingredient.element).toBe(best);
    }
  });

  it("honours a record that declares its own element", async () => {
    const list = await getAllIngredients();
    const declared = list.find((i) => i.name === "test declared");
    expect(declared?.element).toBe("Water");
  });
});
