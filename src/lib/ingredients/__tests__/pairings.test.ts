/**
 * Pairings linked to their cards (omnibar Phase 4): exact resolution only,
 * the card itself and repeats dropped, capped for the hero.
 */
import { getIngredientCatalog } from "../ingredientCatalog";
import { MAX_PAIRINGS, resolvePairings } from "../pairings";

describe("resolvePairings", () => {
  it("links card names, keeps other names as text, drops the card itself and repeats", () => {
    expect(resolvePairings(["Garlic", "garlic", "spinach", "a pinch of moonlight"], "spinach")).toEqual([
      { name: "Garlic", slug: "garlic" },
      { name: "a pinch of moonlight", slug: null },
    ]);
  });

  it("never guesses: a near-miss spelling is text, not the nearest card", () => {
    expect(resolvePairings(["garlik"], "spinach")).toEqual([{ name: "garlik", slug: null }]);
  });

  it(`caps at ${MAX_PAIRINGS}`, () => {
    const names = [...getIngredientCatalog().entries].slice(0, 20).map((entry) => entry.name);
    expect(resolvePairings(names, "none")).toHaveLength(MAX_PAIRINGS);
  });

  it("every linked slug is a real card (dossier URLs resolve)", () => {
    const { bySlug, entries } = getIngredientCatalog();
    const sample = entries.slice(0, 200).flatMap((entry) => resolvePairings(["garlic", "lemon", "olive oil", "onion", entry.name], entry.slug));
    expect(sample.filter((link) => link.slug !== null && !bySlug.has(link.slug))).toEqual([]);
  });
});
