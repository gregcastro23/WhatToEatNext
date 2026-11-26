import {
  parseCommunityAgentsResponse,
  parseCuisineSignaturesResponse,
  parseRecommendedIngredientsResponse,
} from "../kitchenLabWireParsers";

describe("kitchenLabWireParsers", () => {
  describe("parseRecommendedIngredientsResponse", () => {
    const validItem = {
      id: "garlic",
      name: "Garlic",
      category: "aromatics",
      elemental_affinity: "fire",
      planet: "Mars",
      hue: 15,
      match_score: 0.91,
      thermo: { spirit: 0.4, essence: 0.2, matter: 0.2, substance: 0.2 },
      image_url: "ingredients/garlic.png",
    };

    it("keeps valid items and drops non-finite or invalid affinity rows", () => {
      expect(parseRecommendedIngredientsResponse(JSON.parse("null"))).toEqual([]);
      expect(
        parseRecommendedIngredientsResponse({
          ingredients: [
            validItem,
            { ...validItem, elemental_affinity: "aether" },
            { ...validItem, hue: Number.NaN },
          ],
        }),
      ).toEqual([validItem]);
    });
  });

  describe("parseCuisineSignaturesResponse", () => {
    it("parses valid cuisine signatures and preserves total or falls back to count", () => {
      expect(parseCuisineSignaturesResponse(JSON.parse("null"))).toBeNull();
      expect(
        parseCuisineSignaturesResponse({
          total: 14,
          cuisines: [
            {
              id: "italian",
              name: "Italian",
              region: "MED·IT",
              match: 0.85,
              signature: [0.25, 0.2, 0.35, 0.2],
            },
            { id: "bad", name: "Bad", region: "X", match: 0.5, signature: [1, 2] },
          ],
        }),
      ).toEqual({
        total: 14,
        cuisines: [
          {
            id: "italian",
            name: "Italian",
            region: "MED·IT",
            match: 0.85,
            signature: [0.25, 0.2, 0.35, 0.2],
          },
        ],
      });
    });
  });

  describe("parseCommunityAgentsResponse", () => {
    it("filters malformed agent rows and handles null/missing fields", () => {
      expect(parseCommunityAgentsResponse(JSON.parse("null"))).toEqual([]);
      expect(
        parseCommunityAgentsResponse({
          agents: [
            { userId: "u1", name: "Pythagoras", bio: null, dominantElement: "Air" },
            { userId: "", name: "Invalid", bio: "x", dominantElement: null },
          ],
        }),
      ).toEqual([
        { userId: "u1", name: "Pythagoras", bio: null, dominantElement: "Air" },
      ]);
    });
  });
});
