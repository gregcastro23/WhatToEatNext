import { detectNonRealFlags } from "../ingredientReality";

describe("detectNonRealFlags", () => {
  it("returns no flags for a real, curated ingredient card", () => {
    const real = `{
      name: "Chicken",
      description: "Domesticated fowl with mild, slightly sweet flesh that carries seasonings.",
      elementalProperties: { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
      qualities: ["adaptable", "mild", "versatile"],
      nutritionalProfile: { calories: 165, source: "USDA FoodData Central" },
    }`;
    expect(detectNonRealFlags(real)).toEqual([]);
  });

  it("flags an auto-generated coverage stub", () => {
    expect(detectNonRealFlags(`{ name: "x", provenance: "generated" }`)).toContain(
      "generated_stub",
    );
  });

  it("flags placeholder/default nutrition sources", () => {
    expect(
      detectNonRealFlags(`{ nutritionalProfile: { source: "Recipe-derived coverage entry" } }`),
    ).toContain("nutrition_placeholder");
    expect(
      detectNonRealFlags(`{ nutritionalProfile: { source: "category default" } }`),
    ).toContain("nutrition_placeholder");
  });

  it("flags boilerplate descriptions", () => {
    expect(
      detectNonRealFlags(`{ description: "Foo is a recipe-linked ingredient captured from live cuisine data." }`),
    ).toContain("description_boilerplate");
  });

  it("flags the placeholder qualities array", () => {
    expect(
      detectNonRealFlags(`{ qualities: ["recipe-linked", "standardized"] }`),
    ).toContain("qualities_placeholder");
  });

  it("flags a uniform 0.25 elemental default", () => {
    expect(
      detectNonRealFlags(`{ elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 } }`),
    ).toContain("elemental_uniform_default");
  });

  it("accumulates multiple markers on a fully-stubbed card", () => {
    const stub = `{
      name: "thit kho tau",
      provenance: "generated",
      description: "Thit Kho Tau is a recipe-linked ingredient captured from live cuisine data.",
      qualities: ["recipe-linked", "standardized"],
      nutritionalProfile: { source: "Recipe-derived coverage entry" },
    }`;
    expect(detectNonRealFlags(stub).sort()).toEqual(
      ["description_boilerplate", "generated_stub", "nutrition_placeholder", "qualities_placeholder"].sort(),
    );
  });
});
