import { parseRecipeDiscoveryResponse } from "../recipeDiscoveryWireParser";

describe("recipeDiscoveryWireParser", () => {
  it("rejects null or unsuccessful payloads", () => {
    expect(parseRecipeDiscoveryResponse(JSON.parse("null"))).toEqual({
      success: false,
    });
    expect(parseRecipeDiscoveryResponse({ success: false })).toEqual({
      success: false,
    });
  });

  it("parses valid discovery buckets and drops malformed recipe items", () => {
    const parsed = parseRecipeDiscoveryResponse({
      success: true,
      similarElemental: [
        {
          id: "rec-1",
          name: "Miso Soup",
          cuisine: "Japanese",
          elementalProperties: { Water: 0.7, Fire: 0.1 },
          monicaScore: 8.4,
          isVegan: true,
        },
        { id: "bad", name: 42 },
      ],
      similarAlchemical: [{ id: "rec-2", name: "Dashi", spirit: Number.NaN }],
      sameCuisine: [],
    });

    expect(parsed).toEqual({
      success: true,
      data: {
        similarElemental: [
          {
            id: "rec-1",
            name: "Miso Soup",
            cuisine: "Japanese",
            elementalProperties: { Water: 0.7, Fire: 0.1 },
            monicaScore: 8.4,
            isVegan: true,
          },
        ],
        similarAlchemical: [{ id: "rec-2", name: "Dashi" }],
        sameCuisine: [],
      },
    });
  });
});
