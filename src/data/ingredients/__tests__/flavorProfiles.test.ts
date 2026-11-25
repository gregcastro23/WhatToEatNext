import {
  enrichIngredientsWithFlavorProfiles,
  type IngredientWithFlavorProfile,
} from "../flavorProfiles";

describe("enrichIngredientsWithFlavorProfiles", () => {
  it("populates missing flavorProfile and preserves existing profiles", () => {
    const customProfile = {
      spicy: 0.9,
      sweet: 0.1,
      sour: 0.1,
      bitter: 0.1,
      salty: 0.2,
      umami: 0.3,
    };

    const items: IngredientWithFlavorProfile[] = [
      {
        name: "onion",
        category: "vegetables",
        elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
      },
      {
        name: "custom chili",
        category: "spices",
        elementalProperties: { Fire: 0.8, Water: 0.1, Earth: 0.05, Air: 0.05 },
        flavorProfile: customProfile,
      },
    ];

    const enriched = enrichIngredientsWithFlavorProfiles(items);

    expect(enriched[0]?.flavorProfile).toEqual({
      spicy: 0.4,
      sweet: 0.3,
      sour: 0.1,
      bitter: 0.1,
      salty: 0.1,
      umami: 0.4,
    });
    expect(enriched[1]?.flavorProfile).toBe(customProfile);
  });
});
