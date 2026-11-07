/**
 * GET /api/cuisines/recommend answers in one of two shapes, and the parser has
 * to read both.
 *
 * The backend answer is built the way the route's backend branch builds it
 * (route.ts forwards the Python list as `cuisineRecommendations` and has no
 * `recommendations` to forward), from a verbatim trim of a real capture: see
 * src/__tests__/helpers/railwayCuisinesFixture.ts. The local answer is the
 * engine's own list [MEASURED 2026-11-03, dev server with the backend down]:
 * Fire dominant, Air second, so Fire's first three cuisines then Air's first two.
 */
import { RAILWAY_CUISINES_RECOMMEND } from "../../../__tests__/helpers/railwayCuisinesFixture";
import { parseCuisineResponse } from "../parseCuisineResponse";

const BACKEND_ANSWER = {
  success: true,
  source: "backend",
  personalized: false,
  cuisineRecommendations: RAILWAY_CUISINES_RECOMMEND.cuisine_recommendations,
  recipeCounts: { vietnamese: 41, chinese: 40, thai: 42 },
  calculatedAt: "2026-11-03T04:00:00.000Z",
};

const LOCAL_ANSWER = {
  success: true,
  source: "local",
  personalized: false,
  dominantElement: "Fire",
  secondaryElement: "Air",
  recommendations: {
    cuisines: ["Mexican", "Indian", "African", "Chinese", "Vietnamese"],
    cookingMethods: ["Grilling"],
    flavors: ["Spicy"],
  },
  elementDistribution: { Fire: 4, Water: 2, Earth: 2, Air: 2 },
  recipeCounts: { mexican: 40 },
  calculatedAt: "2026-11-03T04:00:00.000Z",
};

describe("parseCuisineResponse", () => {
  describe("the Railway backend's answer", () => {
    it("lists the cuisines in the backend's order", () => {
      expect(parseCuisineResponse(BACKEND_ANSWER).map((c) => c.name)).toEqual(["Vietnamese", "Chinese", "Thai"]);
    });

    it("passes each cuisine's fields through", () => {
      const [vietnamese] = parseCuisineResponse(BACKEND_ANSWER);
      const source = RAILWAY_CUISINES_RECOMMEND.cuisine_recommendations[0];

      expect(vietnamese).toMatchObject({
        cuisine_id: "vietnamese",
        name: "Vietnamese",
        description: source.description,
        elemental_properties: source.elemental_properties,
        astrological_score: source.astrological_score,
      });
      expect(vietnamese?.nested_recipes?.map((r) => r.name)).toEqual(source.nested_recipes.map((r) => r.name));
    });

    it("keeps a score as a number, and an unscored entry as null", () => {
      const scores = (answer: unknown): Array<number | null | undefined> =>
        parseCuisineResponse(answer).map((c) => c.astrological_score);

      expect(scores(BACKEND_ANSWER)).toEqual([0.8496, 0.8489, 0.8371].map((s) => expect.closeTo(s, 3)));
      expect(scores({ cuisineRecommendations: [{ name: "African", astrological_score: null }] })).toEqual([null]);
      expect(scores({ cuisineRecommendations: [{ name: "African" }] })).toEqual([null]);
      expect(scores({ cuisineRecommendations: [{ name: "African", astrological_score: "high" }] })).toEqual([null]);
    });

    it("takes the slug as cuisine_id, else the lower-cased name", () => {
      const parsed = parseCuisineResponse({
        cuisineRecommendations: [{ name: "Middle Eastern", cuisine_id: "middle-eastern" }, { name: "Thai" }],
      });
      expect(parsed.map((c) => c.cuisine_id)).toEqual(["middle-eastern", "thai"]);
    });

    it("keeps only numeric element and flavour values", () => {
      const [cuisine] = parseCuisineResponse({
        cuisineRecommendations: [
          {
            name: "Thai",
            elemental_properties: { Fire: 0.5, Water: "lots" },
            flavor_profile: { Sweet: 0.4, Sour: "x" },
          },
        ],
      });
      expect(cuisine?.elemental_properties).toEqual({ Fire: 0.5 });
      expect(cuisine?.flavor_profile).toEqual({ Sweet: 0.4 });

      const [bare] = parseCuisineResponse({
        cuisineRecommendations: [{ name: "Thai", elemental_properties: { Fire: "lots" }, flavor_profile: {} }],
      });
      expect(bare).not.toHaveProperty("elemental_properties");
      expect(bare).not.toHaveProperty("flavor_profile");
    });

    it("skips entries without a name instead of stopping at them", () => {
      const answer = { success: true, cuisineRecommendations: [{ cuisine_id: "x" }, null, 7, { name: "Thai" }] };
      expect(parseCuisineResponse(answer).map((c) => c.name)).toEqual(["Thai"]);
    });
  });

  describe("the local engine's answer", () => {
    it("lists the names in order, with no score", () => {
      const parsed = parseCuisineResponse(LOCAL_ANSWER);

      expect(parsed.map((c) => c.name)).toEqual(["Mexican", "Indian", "African", "Chinese", "Vietnamese"]);
      expect(parsed.map((c) => c.cuisine_id)).toEqual(["mexican", "indian", "african", "chinese", "vietnamese"]);
      expect(parsed[0]).not.toHaveProperty("astrological_score");
    });

    it("keeps only the names that are strings", () => {
      const answer = { recommendations: { cuisines: [null, 7, "Thai", { name: "Greek" }] } };
      expect(parseCuisineResponse(answer).map((c) => c.name)).toEqual(["Thai"]);
    });
  });

  describe("a body that carries both, or neither", () => {
    it("prefers the rich list", () => {
      const both = { ...LOCAL_ANSWER, cuisineRecommendations: BACKEND_ANSWER.cuisineRecommendations };
      expect(parseCuisineResponse(both)[0]?.name).toBe("Vietnamese");
    });

    it("falls back to the names when the rich list holds nothing usable", () => {
      expect(parseCuisineResponse({ ...LOCAL_ANSWER, cuisineRecommendations: [] })[0]?.name).toBe("Mexican");
      expect(parseCuisineResponse({ ...LOCAL_ANSWER, cuisineRecommendations: [{ cuisine_id: "x" }, null, 7] })[0]?.name).toBe(
        "Mexican",
      );
      expect(parseCuisineResponse({ ...LOCAL_ANSWER, cuisineRecommendations: "Thai" })[0]?.name).toBe("Mexican");
    });

    it.each([
      null,
      undefined,
      "text",
      7,
      [],
      {},
      { success: false },
      { cuisineRecommendations: "Thai" },
      { recommendations: {} },
      { recommendations: "x" },
    ])("returns no cuisines for %p", (payload) => {
      expect(parseCuisineResponse(payload)).toEqual([]);
    });
  });
});
