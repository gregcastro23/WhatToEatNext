import {
  parseAlchemizeMenuResponse,
  parseAlchemizeOptInResponse,
  parseFavoriteRestaurantIdsResponse,
  parseRestaurantSearchResponse,
} from "../restaurantWireParsers";

describe("restaurantWireParsers", () => {
  describe("parseFavoriteRestaurantIdsResponse", () => {
    it("rejects JSON null, primitives, and non-string array entries", () => {
      expect(parseFavoriteRestaurantIdsResponse(JSON.parse("null"))).toEqual({
        success: false,
        favoriteIds: [],
      });
      expect(parseFavoriteRestaurantIdsResponse("bad")).toEqual({
        success: false,
        favoriteIds: [],
      });
      expect(
        parseFavoriteRestaurantIdsResponse({
          success: true,
          favoriteIds: ["r1", 42, null, "r2"],
        }),
      ).toEqual({ success: true, favoriteIds: ["r1", "r2"] });
    });
  });

  describe("parseAlchemizeMenuResponse", () => {
    const validMenu = {
      restaurantId: "rest-1",
      restaurantName: "Hearth & Salt",
      sourceUrl: "https://hearth.example",
      sourceType: "website",
      elementalSignature: { Fire: 40, Water: 20, Earth: 25, Air: 15, dominant: "Fire" },
      topIngredients: ["Garlic"],
      dishes: [
        {
          id: "d1",
          name: "Charred Cabbage",
          category: "Mains",
          description: "Wood-roasted",
          price: "$18",
          ingredients: ["Cabbage"],
          elementalProfile: { Fire: 50, Water: 10, Earth: 30, Air: 10 },
          dominantElement: "Fire",
          techniques: ["Roasting"],
          textures: ["Crisp"],
          dietaryTags: ["Vegan"],
        },
      ],
      summary: { archetype: "Solar Forge", dishCount: 1, topTechnique: "Roasting" },
    };

    it("parses valid producer menu payload and drops malformed dishes", () => {
      const parsed = parseAlchemizeMenuResponse({
        success: true,
        menu: {
          ...validMenu,
          dishes: [...validMenu.dishes, { id: "bad", name: 123 }],
        },
      });
      expect(parsed.success).toBe(true);
      expect(parsed.menu?.dishes).toHaveLength(1);
      expect(parsed.menu?.elementalSignature.dominant).toBe("Fire");
    });

    it("omits menu when null or missing required summary/signature", () => {
      expect(parseAlchemizeMenuResponse(JSON.parse("null"))).toEqual({ success: false });
      expect(
        parseAlchemizeMenuResponse({
          success: true,
          menu: { ...validMenu, elementalSignature: { Fire: Number.NaN } },
        }),
      ).toEqual({ success: true });
    });
  });

  describe("parseAlchemizeOptInResponse", () => {
    it("extracts success and optional error string cleanly", () => {
      expect(parseAlchemizeOptInResponse(JSON.parse("null"))).toEqual({ success: false });
      expect(parseAlchemizeOptInResponse({ success: false, error: "Invalid email" })).toEqual({
        success: false,
        error: "Invalid email",
      });
      expect(parseAlchemizeOptInResponse({ success: true, error: 99 })).toEqual({
        success: true,
      });
    });
  });

  describe("parseRestaurantSearchResponse", () => {
    it("keeps valid FoursquarePlace rows and filters malformed rows", () => {
      const parsed = parseRestaurantSearchResponse({
        success: true,
        results: [
          {
            fsq_id: "fsq-1",
            name: "Bistro Luna",
            location: { locality: "Brooklyn", region: "NY" },
            categories: [{ name: "Bistro", icon: { prefix: "p_", suffix: ".png" } }, { name: 7 }],
            rating: 8.9,
            distance: Number.POSITIVE_INFINITY,
            link: "https://foursquare.com/v/fsq-1",
          },
          { fsq_id: "", name: "Missing ID" },
          null,
        ],
      });
      expect(parsed.success).toBe(true);
      expect(parsed.results).toEqual([
        {
          fsq_id: "fsq-1",
          name: "Bistro Luna",
          location: { locality: "Brooklyn", region: "NY" },
          categories: [{ name: "Bistro", icon: { prefix: "p_", suffix: ".png" } }],
          rating: 8.9,
          link: "https://foursquare.com/v/fsq-1",
        },
      ]);
    });
  });
});
