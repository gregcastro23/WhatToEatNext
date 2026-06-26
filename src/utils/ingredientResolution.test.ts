// src/utils/ingredientResolution.test.ts

import {
  resolveIngredientByName,
  normName,
} from "@/utils/ingredientResolution";

describe("ingredientResolution.normName", () => {
  it("treats underscores like spaces (slug-form catalog names)", () => {
    expect(normName("rice_vinegar")).toBe("rice vinegar");
    expect(normName("Extra-Virgin Olive Oil")).toBe("extra virgin olive oil");
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
