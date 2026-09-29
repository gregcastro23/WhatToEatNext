// src/utils/ingredientResolution.test.ts

import { unifiedIngredients } from "@/data/unified/ingredients";
import {
  resolveIngredientByName,
  normName,
} from "@/utils/ingredientResolution";

describe("ingredientResolution.normName", () => {
  it("treats underscores like spaces (slug-form catalog names)", () => {
    expect(normName("rice_vinegar")).toBe("rice vinegar");
    expect(normName("Extra-Virgin Olive Oil")).toBe("extra virgin olive oil");
  });

  it("drops an accent rather than splitting its word", () => {
    // NFKD splits "ñ" into "n" + a combining mark, which became a space:
    // "jalapen o", "cre me frai che".
    expect(normName("jalapeño")).toBe("jalapeno");
    expect(normName("crème fraîche")).toBe("creme fraiche");
    expect(normName("nước chấm")).toBe("nuoc cham");
  });
});

// Real static-recipe lines against the real catalog.
describe("accented and unaccented spellings meet", () => {
  it.each([
    ["jalapeño", "jalapenos"], // was unresolved; "jalapeno" already resolved
    ["jalapeño or bird's eye chili", "jalapenos"],
    ["creme fraiche or heavy cream", "crème fraîche"], // was unresolved
    ["gruyere cheese", "Gruyère Cheese"], // was unresolved: 4 oz in Mornay sauce
    ["mắm ruốc", "mam ruoc"], // was unresolved
  ])("%s → %s", (line, food) => {
    expect(resolveIngredientByName(line)?.name).toBe(food);
  });

  it("keeps every accented catalog name on its own row", () => {
    // The exact index is keyed through normName too, so an accented name's key
    // changed; none may now be taken by an earlier-indexed row.
    const accented = Object.values(unifiedIngredients).flatMap((ingredient) => {
      const aliases = "aliases" in ingredient ? ingredient.aliases : undefined;
      const names = [ingredient.name, ...(Array.isArray(aliases) ? aliases : [])];
      return names
        .filter((n): n is string => typeof n === "string" && n.normalize("NFKD") !== n)
        .map((name) => ({ name, ingredient }));
    });
    expect(accented.map((a) => a.name)).toEqual(
      expect.arrayContaining(["Gruyère Cheese", "béchamel sauce", "crème fraîche"]),
    );
    for (const { name, ingredient } of accented) {
      expect(resolveIngredientByName(name)).toBe(ingredient);
    }
  });
});

describe("resolveIngredientByName (shared)", () => {
  it("resolves an exact catalog name", () => {
    expect(resolveIngredientByName("Olive Oil")?.name).toBe("Olive Oil");
  });

  it("resolves a slug-named catalog entry from its human form", () => {
    // Several catalog entries store the slug in `name` ("rice_vinegar").
    // Normalizing underscores lets the human phrase resolve them.
    const hit = resolveIngredientByName("rice vinegar");
    expect(hit).toBeDefined();
    expect(hit!.name.toLowerCase()).toContain("rice");
    expect(hit!.name.toLowerCase()).toContain("vinegar");
  });

  it("strips prep adjectives and leading quantity/unit", () => {
    expect(
      resolveIngredientByName("2 tablespoons minced garlic")?.name.toLowerCase(),
    ).toContain("garlic");
  });

  it("does not over-match across word boundaries", () => {
    // Whole-word token subset: "egg" resolves an egg, never "eggplant".
    const egg = resolveIngredientByName("eggs");
    expect(egg).toBeDefined();
    expect(egg!.name.toLowerCase()).not.toContain("eggplant");
    // If "rice" resolves at all, it must be a rice — never "ice".
    const rice = resolveIngredientByName("rice");
    if (rice) expect(rice.name.toLowerCase()).toContain("rice");
  });

  it("returns undefined for nullish / empty input", () => {
    expect(resolveIngredientByName("")).toBeUndefined();
    expect(resolveIngredientByName(undefined)).toBeUndefined();
    expect(resolveIngredientByName(null)).toBeUndefined();
  });
});
