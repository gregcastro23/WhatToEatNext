import {
  buildRecipeIngredientIndex,
  keysForLine,
  rankRecipeUses,
  type IngredientKeyResolver,
} from "../recipeIngredientIndex";
import type { RecipeRecord } from "../types";

const KEYS: Record<string, string> = {
  spinach: "spinach",
  "bok choy": "bok_choy",
  garlic: "garlic",
  lamb: "lamb",
  beef: "beef",
  chicken: "chicken",
};
const keyOf: IngredientKeyResolver = (text) => KEYS[text.toLowerCase()] ?? null;
const nameOf = (key: string): string => key.replace(/_/g, " ");

function recipe(id: string, name: string, lines: string[]): RecipeRecord {
  return { id, name, cuisine: null, totalMinutes: null, imageUrl: null, ingredientLines: lines };
}

describe("keysForLine", () => {
  it("resolves both sides of an 'X or Y' line and marks them alternative", () => {
    expect(keysForLine("bok choy or spinach", keyOf)).toEqual({ keys: ["bok_choy", "spinach"], alternative: true });
  });

  it("a plain line is required", () => {
    expect(keysForLine("spinach", keyOf)).toEqual({ keys: ["spinach"], alternative: false });
  });

  it("keeps every alternative of a comma list: 'lamb, beef, or chicken'", () => {
    expect(keysForLine("lamb, beef, or chicken", keyOf)).toEqual({
      keys: ["lamb", "beef", "chicken"],
      alternative: true,
    });
  });

  it("hands a required line to the resolver whole, commas included", () => {
    // The stub knows "garlic" but not "garlic, minced": a comma split would find garlic.
    expect(keysForLine("garlic, minced", keyOf)).toEqual({ keys: [], alternative: false });
  });
});

describe("buildRecipeIngredientIndex", () => {
  const recipes = [
    recipe("r-dandan", "Dan Dan Noodles", ["bok choy or spinach", "garlic"]),
    recipe("r-pasta", "Spinach Pasta", ["spinach", "garlic"]),
    recipe("r-both", "Greens Bowl", ["bok choy or spinach", "spinach"]),
    recipe("r-dupe", "Garlic Soup", ["garlic", "garlic"]),
  ];
  const index = buildRecipeIngredientIndex(recipes, keyOf, nameOf);

  it("lists each recipe once per ingredient", () => {
    expect(index.get("garlic")?.map((u) => u.recipeId).sort()).toEqual(["r-dandan", "r-dupe", "r-pasta"]);
  });

  it("a required line anywhere in the recipe overrides an alternative line", () => {
    const uses = new Map((index.get("spinach") ?? []).map((u) => [u.recipeId, u]));
    expect(uses.get("r-dandan")?.alternative).toBe(true);
    expect(uses.get("r-both")?.alternative).toBe(false);
  });

  it("flags recipes whose title names the ingredient", () => {
    const uses = new Map((index.get("spinach") ?? []).map((u) => [u.recipeId, u]));
    expect(uses.get("r-pasta")?.inTitle).toBe(true);
    expect(uses.get("r-dandan")?.inTitle).toBe(false);
  });

  it("ranks title mentions, then required, then name", () => {
    const names = new Map(recipes.map((r) => [r.id, r.name]));
    const ranked = rankRecipeUses(index.get("spinach") ?? [], (id) => names.get(id) ?? id);
    expect(ranked.map((u) => u.recipeId)).toEqual(["r-pasta", "r-both", "r-dandan"]);
  });
});
