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

// Real lines from the static recipe corpus, resolved against the real catalog.
describe("'X or Y noun': the options share the noun only the last one spells out", () => {
  it.each([
    // It resolved "beef" alone: Beef, 90% lean ground, 213 kcal per 85 g.
    ["beef or chicken broth", "beef broth"],
    ["chicken or vegetable stock", "chicken stock"],
    ["chickpea or mellow miso", "chickpea miso"], // was dried chickpeas
    ["vegetable or palm oil", "Vegetable Oil"], // was vegetables
    ["white or black pepper", "White Pepper"], // was blond roux
    // A post-modifier is not the head: "white pepper", not "white taste".
    ["white or cayenne pepper to taste", "White Pepper"],
    ["sesame or poppy seeds for top", "sesame seeds"], // was Sesame Oil
    // Three options: the head comes from the next one.
    ["white or red wine or 2 tablespoons balsamic vinegar", "white wine"],
    // A first option of qualifiers only takes the whole shared remainder.
    ["large or jumbo shrimp", "Shrimp"], // was unresolved
  ])("%s → %s", (line, food) => {
    expect(resolveIngredientByName(line)?.name).toBe(food);
  });
});

describe("the first option stands alone when there is no shared food", () => {
  it.each([
    ["honey or maple syrup", "honey"], // the catalog names no "honey syrup"
    ["water or chicken broth", "Water"],
    // "melted" is a preparation, not a kind: "ghee butter" would match
    // Clarified Butter / Ghee, a different catalog row.
    ["ghee or melted butter", "Ghee"],
    ["olive oil or neutral oil", "Olive Oil"], // the first has its own head
    ["rice syrup or 1/2 cup honey", "brown rice syrup"], // its own quantity
    ["lamb or mutton", "Lamb"],
  ])("%s → %s", (line, food) => {
    expect(resolveIngredientByName(line)?.name).toBe(food);
  });

  it("a qualifier-only first option never shrinks to a bare head noun", () => {
    // The catalog has no corn syrup and no egg noodles. "syrup" or "noodles"
    // alone would token-match an arbitrary row (agave syrup, dried soba noodles).
    expect(resolveIngredientByName("light or dark corn syrup")?.name).toBeUndefined();
    expect(resolveIngredientByName("fresh or dried egg noodles")?.name).toBeUndefined();
  });
});
