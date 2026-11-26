import {
  parseAlchmTrendsResponse,
  parseHealthPayload,
  parsePlanetaryContributionsResponse,
} from "../alchmTelemetryWireParsers";
import { parsePersonalizedRecommendationsResponse } from "../personalizedRecsWireParser";

describe("alchmTelemetryWireParsers", () => {
  describe("parseHealthPayload", () => {
    it("handles null and non-string service entries", () => {
      expect(parseHealthPayload(JSON.parse("null"))).toBeNull();
      expect(
        parseHealthPayload({
          status: "healthy",
          timestamp: "2026-11-26T00:00:00Z",
          services: { database: "healthy", bad: 42 },
        }),
      ).toEqual({
        status: "healthy",
        timestamp: "2026-11-26T00:00:00Z",
        services: { database: "healthy" },
      });
    });
  });

  describe("parsePlanetaryContributionsResponse", () => {
    const validRow = {
      name: "Sun",
      position: { sign: "sagittarius", degree: 4, minute: 12, exactLongitude: 244.2, isRetrograde: false },
      esms: { Spirit: 10, Essence: 5, Matter: 2, Substance: 3 },
      signElement: null,
      sectElement: "Fire",
      signQuality: "Mutable",
      transition: {
        nextSign: "capricorn",
        estimatedDate: "2026-12-21T15:00:00.000Z",
        daysUntil: 25,
        direction: "forward",
      },
    };

    it("accepts valid payload and omits null signElement", () => {
      const parsed = parsePlanetaryContributionsResponse({
        planets: [validRow],
        isDiurnal: true,
        timestamp: "2026-11-26T12:00:00.000Z",
      });
      expect(parsed.planets).toHaveLength(1);
      expect(parsed.planets[0]?.signElement).toBeUndefined();
    });

    it("throws on malformed envelopes or all-malformed planet rows", () => {
      expect(() => parsePlanetaryContributionsResponse(JSON.parse("null"))).toThrow();
      expect(() =>
        parsePlanetaryContributionsResponse({
          planets: [{ name: "Sun", position: { sign: "aries", degree: Number.NaN } }],
          isDiurnal: true,
          timestamp: "2026-11-26T12:00:00.000Z",
        }),
      ).toThrow();
    });
  });

  describe("parseAlchmTrendsResponse", () => {
    it("parses valid trend points and rejects non-finite or all-malformed payloads", () => {
      const parsed = parseAlchmTrendsResponse({
        trends: [
          {
            time: "12:00",
            iso: "2026-11-26T12:00:00.000Z",
            Spirit: 10,
            Essence: 11,
            Matter: 12,
            Substance: 13,
            Fire: 14,
            isDiurnal: true,
          },
          { time: "bad", Spirit: Number.POSITIVE_INFINITY },
        ],
      });
      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.Fire).toBe(14);

      expect(() => parseAlchmTrendsResponse(JSON.parse("null"))).toThrow();
      expect(() => parseAlchmTrendsResponse({ trends: [{ time: "bad" }] })).toThrow();
    });
  });

  describe("parsePersonalizedRecommendationsResponse", () => {
    it("preserves null chartComparison and degraded currentAlchemy", () => {
      expect(parsePersonalizedRecommendationsResponse(JSON.parse("null"))).toEqual({
        success: false,
      });
      const parsed = parsePersonalizedRecommendationsResponse({
        success: true,
        data: {
          chartComparison: null,
          currentAlchemy: {
            kalchm: 1.25,
            monica: 0.45,
            esms: { Spirit: 1, Essence: 2, Matter: 3, Substance: 4 },
            dominantElement: "Earth",
            degraded: true,
          },
          recommendations: {
            favorableElements: ["Earth"],
            challengingElements: ["Air"],
            harmonicPlanets: ["Saturn"],
            insights: ["Ground with roots"],
            suggestedCuisines: ["Italian"],
            suggestedCookingMethods: ["Braising"],
          },
        },
      });
      expect(parsed.success).toBe(true);
      expect(parsed.data?.chartComparison).toBeNull();
      expect(parsed.data?.currentAlchemy?.degraded).toBe(true);
    });
  });
});
