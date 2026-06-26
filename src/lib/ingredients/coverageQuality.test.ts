import { isBoilerplateCoverageIngredient } from "@/lib/ingredients/coverageQuality";

describe("isBoilerplateCoverageIngredient", () => {
  it("flags the auto-generated boilerplate description", () => {
    expect(
      isBoilerplateCoverageIngredient({
        description:
          "Foo is a recipe-linked ingredient captured from live cuisine data to ensure full coverage.",
      }),
    ).toBe(true);
  });

  it("flags explicit schema stand-ins", () => {
    expect(
      isBoilerplateCoverageIngredient({
        description:
          "Schema stand-in for recipe-specific binder or emulsifier. Replace with concrete ingredient names during recipe curation.",
      }),
    ).toBe(true);
  });

  it("does not flag a real curated ingredient", () => {
    expect(
      isBoilerplateCoverageIngredient({
        description:
          "Brick-red Yucatecan seasoning paste of ground annatto, spices, and vinegar.",
      }),
    ).toBe(false);
  });

  it("is safe on missing / non-string descriptions", () => {
    expect(isBoilerplateCoverageIngredient(null)).toBe(false);
    expect(isBoilerplateCoverageIngredient(undefined)).toBe(false);
    expect(isBoilerplateCoverageIngredient({})).toBe(false);
    expect(isBoilerplateCoverageIngredient({ description: 42 })).toBe(false);
  });
});
