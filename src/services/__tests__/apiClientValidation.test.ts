import { AlchemicalApiClient } from "@/services/AlchemicalApiClient";
import {
  AlchemicalElementalPropertiesSchema,
  ThermodynamicsResultSchema,
  PlanetaryPositionsResponseSchema,
} from "@/lib/validation/alchemicalBackendSchemas";
import {
  AstrologizeResponseSchema,
  RecipeRecommendationResponseSchema,
} from "@/lib/validation/astrologySchemas";
import {
  RailwayGraphQLResponseSchema,
  GithubIssuesResponseSchema,
  GooglePlacesResponseSchema,
  McpNetworkSummarySchema,
} from "@/lib/validation/serviceResponseSchemas";

describe("Response-Side Narrowing Schemas & Client Validation", () => {
  describe("AlchemicalBackendSchemas", () => {
    it("validates AlchemicalElementalProperties correctly", () => {
      const valid = { Fire: 0.25, Water: 0.35, Earth: 0.2, Air: 0.2 };
      expect(AlchemicalElementalPropertiesSchema.parse(valid)).toEqual(valid);

      const invalid = { Fire: -1, Water: 0.5, Earth: 0.2, Air: 0.3 };
      expect(() => AlchemicalElementalPropertiesSchema.parse(invalid)).toThrow();
    });

    it("validates ThermodynamicsResult correctly", () => {
      const valid = {
        heat: 0.8,
        entropy: 0.3,
        reactivity: 0.6,
        gregsEnergy: 42,
        equilibrium: 0.9,
      };
      expect(ThermodynamicsResultSchema.parse(valid)).toEqual(valid);

      const missing = { heat: 0.8 };
      expect(() => ThermodynamicsResultSchema.parse(missing)).toThrow();
    });

    it("validates PlanetaryPositionsResponse structure", () => {
      const valid = {
        primary_chart: { Sun: { sign: "Aries" } },
        is_collective: false,
        participant_count: 1,
      };
      expect(PlanetaryPositionsResponseSchema.parse(valid)).toMatchObject(valid);

      const invalid = { is_collective: "not-a-bool" };
      expect(() => PlanetaryPositionsResponseSchema.parse(invalid)).toThrow();
    });
  });

  describe("AstrologySchemas", () => {
    it("validates AstrologizeResponse correctly", () => {
      const valid = {
        _celestialBodies: {
          all: [
            {
              key: "sun",
              label: "Sun",
              Sign: { key: "ari", zodiac: "tropical", label: "Aries" },
              ChartPosition: {
                Ecliptic: {
                  DecimalDegrees: 15.5,
                  ArcDegrees: { degrees: 15, minutes: 30, seconds: 0 },
                },
              },
              isRetrograde: false,
            },
          ],
        },
      };
      expect(AstrologizeResponseSchema.parse(valid)).toMatchObject(valid);

      const invalid = { _celestialBodies: { all: "invalid" } };
      expect(() => AstrologizeResponseSchema.parse(invalid)).toThrow();
    });

    it("validates RecipeRecommendationResponse with matching ingredients", () => {
      const valid = {
        request_params: {},
        lunar_phase: { phase_name: "Waxing Gibbous" },
        seasonal_context: {
          current_zodiac_season: "Virgo",
          boosted_ingredients: {},
        },
        recommendations: [
          {
            recipe_id: "rec_123",
            name: "Sun Soup",
            weighted_environmental_score: 0.95,
            matching_ingredients: [
              {
                ingredient: "Saffron",
                sign: "Leo",
                base_affinity: 0.9,
                lunar_modifier: 1.1,
                seasonal_modifier: 1.0,
                weighted_environmental_score: 0.99,
              },
            ],
            isEnvironmentalMatch: true,
            optimal_cooking_window: {
              date: "2026-09-09",
              start_time: "12:00",
              food_type: "soup",
            },
            elementalProperties: {
              Fire: 0.6,
              Water: 0.2,
              Earth: 0.1,
              Air: 0.1,
            },
            spirit_score: 0.8,
            matter_score: 0.5,
            essence_score: 0.7,
            substance_score: 0.4,
            kinetic_val: 0.6,
            thermo_val: 0.7,
            total_potency_score: 0.85,
            collective_potency_modifier_applied: 1.0,
          },
        ],
      };
      expect(RecipeRecommendationResponseSchema.parse(valid)).toMatchObject(valid);
    });
  });

  describe("ServiceResponseSchemas", () => {
    it("validates RailwayGraphQLResponse", () => {
      const valid = {
        data: {
          usage: [{ measurement: "CPU_USAGE", value: 12.5 }],
        },
      };
      expect(RailwayGraphQLResponseSchema.parse(valid)).toMatchObject(valid);
    });

    it("validates GithubIssuesResponseSchema", () => {
      const valid = [
        {
          number: 101,
          title: "Fix cosmic bug",
          html_url: "https://github.com/issue/101",
          updated_at: "2026-09-09T00:00:00Z",
        },
      ];
      expect(GithubIssuesResponseSchema.parse(valid)).toEqual(valid);

      const invalid = [{ number: "not-a-number" }];
      expect(() => GithubIssuesResponseSchema.parse(invalid)).toThrow();
    });

    it("validates GooglePlacesResponseSchema", () => {
      const valid = {
        places: [
          {
            id: "place_1",
            displayName: { text: "Alchemist Cafe" },
            formattedAddress: "123 Solar Way",
            rating: 4.8,
          },
        ],
      };
      expect(GooglePlacesResponseSchema.parse(valid)).toMatchObject(valid);
    });

    it("validates McpNetworkSummarySchema", () => {
      const valid = {
        live: true,
        verdict: "OK" as const,
        totals: {
          calls: 100,
          success: 98,
          failures: 2,
          errorRate: 0.02,
        },
        byTool: [
          {
            tool: "calculate_chart",
            calls: 50,
            failures: 0,
          },
        ],
      };
      expect(McpNetworkSummarySchema.parse(valid)).toMatchObject(valid);
    });
  });

  describe("AlchemicalApiClient Fallback Resiliency", () => {
    it("falls back to balanced elements on malformed elemental response", async () => {
      const client = new AlchemicalApiClient();
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ bad: "response" }), { status: 200 }),
      );

      try {
        const result = await client.calculateElementalBalance(["basil"]);
        expect(result).toEqual({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 });
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
