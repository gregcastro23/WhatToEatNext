/**
 * @jest-environment node
 *
 * Verifies pickSolarReturnRecipes:
 * - prefers recipes from top-ranked solar-return cuisines (id/name normalized)
 * - falls back to elemental fit when no cuisine matches the catalog
 * - is deterministic for a given seed
 */
import { describe, expect, it } from "@jest/globals";
import type { Recipe } from "@/types/recipe";
import { pickSolarReturnRecipes } from "@/utils/solarReturnRecipes";

const mk = (id: string, cuisine: string, el: Partial<Recipe["elementalProperties"]> = {}): Recipe => ({
  id,
  name: `Recipe ${id}`,
  cuisine,
  ingredients: [],
  instructions: [],
  elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25, ...el },
});

const matches = [
  { id: "middleEastern", name: "Middle Eastern" },
  { id: "japanese", name: "Japanese" },
];
const chart = { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 };

describe("pickSolarReturnRecipes", () => {
  it("prefers top-ranked cuisine recipes and normalizes cuisine keys", () => {
    const recipes = [mk("a", "French"), mk("b", "Japanese"), mk("c", "Middle Eastern")];
    const out = pickSolarReturnRecipes(recipes, matches, chart, "autumn", "2001-11-05");
    expect(out.map((r) => r.id)).toEqual(["c", "b"]);
    expect(out[0]?.matchedCuisine).toBe("Middle Eastern");
  });

  it("falls back to elemental fit when no cuisine matches", () => {
    const recipes = [mk("a", "French", { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 }), mk("b", "German")];
    const out = pickSolarReturnRecipes(recipes, matches, chart, "autumn", "2001-11-05");
    expect(out.length).toBe(2);
    expect(out.every((r) => r.matchedCuisine === null)).toBe(true);
  });

  it("is deterministic for a seed and respects limit", () => {
    const recipes = Array.from({ length: 20 }, (_, i) => mk(String(i), "Japanese"));
    const a = pickSolarReturnRecipes(recipes, matches, chart, "spring", "1999-03-01", 3);
    const b = pickSolarReturnRecipes(recipes, matches, chart, "spring", "1999-03-01", 3);
    expect(a).toEqual(b);
    expect(a.length).toBe(3);
  });

  it("returns empty for empty catalog", () => {
    expect(pickSolarReturnRecipes([], matches, chart, "spring", "x")).toEqual([]);
  });

  it("maps regional cuisine profiles (Cantonese) onto the Chinese catalog label", () => {
    const recipes = [mk("a", "Chinese"), mk("b", "French")];
    const out = pickSolarReturnRecipes(recipes, [{ id: "cantonese", name: "Cantonese" }], chart, "autumn", "s");
    expect(out.map((r) => r.id)).toEqual(["a"]);
    expect(out[0]?.matchedCuisine).toBe("Cantonese");
  });

  it("dedupes near-duplicate dishes and spreads picks across cuisines", () => {
    const named = (id: string, name: string, cuisine: string, el = {}): Recipe => ({
      ...mk(id, cuisine, el),
      name,
    });
    // Olivier variants match the chart exactly, so both outrank the rest.
    const recipes = [
      named("1", "Authentic Olivier Salad", "Middle Eastern", chart),
      named("2", "Olivier Salad", "Middle Eastern", chart),
      named("3", "Shawarma", "Middle Eastern"),
      named("4", "Falafel", "Middle Eastern"),
      named("5", "Ramen", "Japanese"),
    ];
    const out = pickSolarReturnRecipes(recipes, matches, chart, "autumn", "s", 3);
    const names = out.map((r) => r.name);
    expect(names.filter((n) => n.includes("Olivier")).length).toBe(1);
    expect(names).toContain("Ramen");
    expect(out.length).toBe(3);
  });
});

