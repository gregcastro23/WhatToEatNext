import {
  buildRecipeIngredientIndex,
  keysForLine,
  rankRecipeUses,
  type IngredientKeyResolver,
  type ResolvedIngredientKey,
} from "../recipeIngredientIndex";
import type { RecipeRecord } from "../types";

const KEYS: Record<string, string | ResolvedIngredientKey | readonly ResolvedIngredientKey[]> = {
  spinach: "spinach",
  "bok choy": "bok_choy",
  garlic: "garlic",
  lamb: "lamb",
  beef: "beef",
  chicken: "chicken",
  peanuts: "peanuts",
  "peanut butter": { key: "peanuts", derived: true },
  "shrimp stock": { key: "shrimp", derived: true },
  water: "water",
  "ginger-garlic paste": [
    { key: "ginger", derived: true },
    { key: "garlic", derived: true },
  ],
};
const keyOf: IngredientKeyResolver = (text) => KEYS[text.toLowerCase()] ?? null;
const nameOf = (key: string): string => key.replace(/_/g, " ");

function recipe(id: string, name: string, lines: string[]): RecipeRecord {
  return { id, name, cuisine: null, totalMinutes: null, meals: [], imageUrl: null, ingredientLines: lines };
}

describe("keysForLine", () => {
  it("resolves both sides of an 'X or Y' line and marks them alternative", () => {
    expect(keysForLine("bok choy or spinach", keyOf)).toEqual({
      keys: ["bok_choy", "spinach"],
      alternative: true,
      derived: [],
    });
  });

  it("a plain line is required", () => {
    expect(keysForLine("spinach", keyOf)).toEqual({
      keys: ["spinach"],
      alternative: false,
      derived: [],
    });
  });

  it("keeps every alternative of a comma list: 'lamb, beef, or chicken'", () => {
    expect(keysForLine("lamb, beef, or chicken", keyOf)).toEqual({
      keys: ["lamb", "beef", "chicken"],
      alternative: true,
      derived: [],
    });
  });

  it("hands a required line to the resolver whole, commas included", () => {
    // The stub knows "garlic" but not "garlic, minced": a comma split would find garlic.
    expect(keysForLine("garlic, minced", keyOf)).toEqual({
      keys: [],
      alternative: false,
      derived: [],
    });
  });

  it("tracks derived keys on single, mixed 'or', and hyphen-compound lines", () => {
    expect(keysForLine("peanut butter", keyOf)).toEqual({
      keys: ["peanuts"],
      alternative: false,
      derived: ["peanuts"],
    });
    expect(keysForLine("shrimp stock or water", keyOf)).toEqual({
      keys: ["shrimp", "water"],
      alternative: true,
      derived: ["shrimp"],
    });
    expect(keysForLine("ginger-garlic paste", keyOf)).toEqual({
      keys: ["ginger", "garlic"],
      alternative: false,
      derived: ["ginger", "garlic"],
    });
  });
});

describe("buildRecipeIngredientIndex", () => {
  const recipes = [
    recipe("r-dandan", "Dan Dan Noodles", ["bok choy or spinach", "garlic"]),
    recipe("r-pasta", "Spinach Pasta", ["spinach", "garlic"]),
    recipe("r-both", "Greens Bowl", ["bok choy or spinach", "spinach"]),
    recipe("r-dupe", "Garlic Soup", ["garlic", "garlic"]),
    recipe("r-pb", "Satay Bowl", ["peanut butter"]),
    recipe("r-pb-both", "Nutty Stir-Fry", ["peanut butter", "peanuts"]),
    recipe("r-pb-req-alt", "Mixed Peanut Dish", ["peanut butter", "peanuts or garlic"]),
  ];
  const index = buildRecipeIngredientIndex(recipes, keyOf, nameOf);

  it("lists each recipe once per ingredient", () => {
    expect(index.get("garlic")?.map((u) => u.recipeId).sort()).toEqual([
      "r-dandan",
      "r-dupe",
      "r-pasta",
      "r-pb-req-alt",
    ]);
  });

  it("a required line anywhere in the recipe overrides an alternative line", () => {
    const uses = new Map((index.get("spinach") ?? []).map((u) => [u.recipeId, u]));
    expect(uses.get("r-dandan")?.alternative).toBe(true);
    expect(uses.get("r-both")?.alternative).toBe(false);
  });

  it("direct use overrides derived, and required derived beats alternative direct", () => {
    const uses = new Map((index.get("peanuts") ?? []).map((u) => [u.recipeId, u]));
    expect(uses.get("r-pb")).toMatchObject({ alternative: false, derived: true });
    expect(uses.get("r-pb-both")).toMatchObject({ alternative: false, derived: false });
    expect(uses.get("r-pb-req-alt")).toMatchObject({ alternative: false, derived: true });
  });

  it("flags recipes whose title names the ingredient", () => {
    const uses = new Map((index.get("spinach") ?? []).map((u) => [u.recipeId, u]));
    expect(uses.get("r-pasta")?.inTitle).toBe(true);
    expect(uses.get("r-dandan")?.inTitle).toBe(false);
  });

  it("ranks title mentions, then required direct, required derived, alternative direct, alternative derived, then name", () => {
    const names = new Map(recipes.map((r) => [r.id, r.name]));
    const ranked = rankRecipeUses(index.get("spinach") ?? [], (id) => names.get(id) ?? id);
    expect(ranked.map((u) => u.recipeId)).toEqual(["r-pasta", "r-both", "r-dandan"]);

    const tierRanked = rankRecipeUses(
      [
        { recipeId: "alt-der", alternative: true, derived: true, inTitle: false },
        { recipeId: "req-der", alternative: false, derived: true, inTitle: false },
        { recipeId: "alt-dir", alternative: true, derived: false, inTitle: false },
        { recipeId: "req-dir", alternative: false, derived: false, inTitle: false },
        { recipeId: "title-der", alternative: false, derived: true, inTitle: true },
      ],
      (id) => id,
    );
    expect(tierRanked.map((u) => u.recipeId)).toEqual([
      "title-der",
      "req-dir",
      "req-der",
      "alt-dir",
      "alt-der",
    ]);
  });
});
