import fixture from "../../../docs/physics/esms_conformance.json";
import {
  calculatePlanetaryKinetics,
  calculateSMES,
  getCulinaryRecommendations,
  optimizeRecipe,
  toAlchemyPlanetaryPositions,
  toAstrologyUtilsPlanetPositions,
  toRealAlchemizePositions,
  UnifiedCalculationEngine,
} from "@/calculations/index";
import type { CelestialPosition } from "@/types/celestial";

describe("Unified Alchemical Calculation Engine Behavioral Witness", () => {
  describe("Track A: Producer-Shaped Celestial Position Adapter Integrity", () => {
    it("preserves arcminute when producer emits 'minute' (Case 1: singular, live producer shape)", () => {
      const input: Record<string, CelestialPosition> = {
        Sun: {
          sign: "leo",
          degree: 15,
          minute: 42,
          exactLongitude: 135.7,
          isRetrograde: false,
        },
        Mars: {
          sign: "scorpio",
          degree: 28,
          minute: 59,
          exactLongitude: 238.9833,
          isRetrograde: true,
        },
      };

      const realAlchemize = toRealAlchemizePositions(input);
      expect(realAlchemize.Sun.minute).toBe(42);
      expect(realAlchemize.Sun.sign).toBe("leo");
      expect(realAlchemize.Sun.degree).toBe(15);
      expect(realAlchemize.Sun.exactLongitude).toBe(135.7);
      expect(realAlchemize.Mars.minute).toBe(59);
      expect(realAlchemize.Mars.isRetrograde).toBe(true);

      const alchemy = toAlchemyPlanetaryPositions(input);
      expect(alchemy.Sun.minute).toBe(42);
      expect(alchemy.Sun.sign).toBe("leo");
      expect(alchemy.Mars.minute).toBe(59);

      const astrologyUtils = toAstrologyUtilsPlanetPositions(input);
      expect(astrologyUtils.Sun.minute).toBe(42);
      expect(astrologyUtils.Sun.sign).toBe("leo");
      expect(astrologyUtils.Mars.minute).toBe(59);
    });

    it("preserves arcminute when producer emits 'minutes' (Case 2: legacy plural shape)", () => {
      const input: Record<string, CelestialPosition> = {
        Venus: {
          sign: "taurus",
          degree: 4,
          minutes: 18,
          exactLongitude: 34.3,
          isRetrograde: false,
        },
        Jupiter: {
          sign: "sagittarius",
          degree: 11,
          minutes: 35,
          exactLongitude: 251.5833,
          isRetrograde: false,
        },
      };

      const realAlchemize = toRealAlchemizePositions(input);
      expect(realAlchemize.Venus.minute).toBe(18);
      expect(realAlchemize.Jupiter.minute).toBe(35);

      const alchemy = toAlchemyPlanetaryPositions(input);
      expect(alchemy.Venus.minute).toBe(18);
      expect(alchemy.Jupiter.minute).toBe(35);

      const astrologyUtils = toAstrologyUtilsPlanetPositions(input);
      expect(astrologyUtils.Venus.minute).toBe(18);
      expect(astrologyUtils.Jupiter.minute).toBe(35);
    });

    it("falls back to 0 (or undefined) when neither minute nor minutes is provided (Case 3: bare degree)", () => {
      const input: Record<string, CelestialPosition> = {
        Moon: {
          sign: "cancer",
          degree: 12,
        },
      };

      const realAlchemize = toRealAlchemizePositions(input);
      expect(realAlchemize.Moon.minute).toBe(0);
      expect(realAlchemize.Moon.degree).toBe(12);

      const alchemy = toAlchemyPlanetaryPositions(input);
      expect(alchemy.Moon.minute).toBeUndefined();

      const astrologyUtils = toAstrologyUtilsPlanetPositions(input);
      expect(astrologyUtils.Moon.minute).toBe(0);
    });

    it("prefers 'minute' over 'minutes' when both are populated", () => {
      const input: Record<string, CelestialPosition> = {
        Saturn: {
          sign: "capricorn",
          degree: 20,
          minute: 45,
          minutes: 10,
        },
      };

      const realAlchemize = toRealAlchemizePositions(input);
      expect(realAlchemize.Saturn.minute).toBe(45);

      const alchemy = toAlchemyPlanetaryPositions(input);
      expect(alchemy.Saturn.minute).toBe(45);

      const astrologyUtils = toAstrologyUtilsPlanetPositions(input);
      expect(astrologyUtils.Saturn.minute).toBe(45);
    });
  });

  describe("Track A: SMES Calculation Smoke Parity across 20 Golden Charts", () => {
    it("has 20 golden test charts in fixture", () => {
      expect(fixture.charts.length).toBe(20);
    });

    fixture.charts.forEach((chart) => {
      it(`calculates SMES for ${chart.id} (${chart.name}) without NaN/null`, async () => {
        const engine = new UnifiedCalculationEngine();
        const positions = chart.planetary_positions as Record<
          string,
          { sign: string; degree: number; distance?: number }
        >;

        const celestialPositions: Record<string, CelestialPosition> = {};
        for (const [planet, pos] of Object.entries(positions)) {
          celestialPositions[planet] = {
            sign: pos.sign as import("@/types/celestial").ZodiacSignType,
            degree: pos.degree,
            exactLongitude: pos.degree,
            isRetrograde: false,
          };
        }

        const result = await engine.calculateSMES({
          planetaryPositions: celestialPositions,
          useCache: false,
        });

        // Finiteness assertions
        expect(Number.isFinite(result.spirit)).toBe(true);
        expect(Number.isFinite(result.essence)).toBe(true);
        expect(Number.isFinite(result.matter)).toBe(true);
        expect(Number.isFinite(result.substance)).toBe(true);
        expect(Number.isFinite(result.energy)).toBe(true);

        // Positive quantities
        expect(result.matter).toBeGreaterThan(0);
        expect(result.substance).toBeGreaterThan(0);

        // Elements
        expect(result.elements).toBeDefined();
        expect(Number.isFinite(result.elements.Fire)).toBe(true);
        expect(Number.isFinite(result.elements.Water)).toBe(true);
        expect(Number.isFinite(result.elements.Earth)).toBe(true);
        expect(Number.isFinite(result.elements.Air)).toBe(true);

        // Planetary influences
        expect(result.planetaryInfluence).toBeDefined();
        expect(typeof result.planetaryInfluence.dominantPlanet).toBe("string");
        expect(Number.isFinite(result.planetaryInfluence.planetaryStrength)).toBe(true);

        // Kinetics
        expect(result.kinetics).toBeDefined();
        expect(Number.isFinite(result.kinetics.momentum)).toBe(true);
        expect(Number.isFinite(result.kinetics.force)).toBe(true);
      });
    });
  });

  describe("Track A: High-Level Culinary & Kinetics Workflows", () => {
    const testPositions: Record<string, CelestialPosition> = {
      Sun: { sign: "aries", degree: 10, minute: 15, exactLongitude: 10.25, isRetrograde: false },
      Moon: { sign: "taurus", degree: 5, minute: 30, exactLongitude: 35.5, isRetrograde: false },
      Mars: { sign: "leo", degree: 20, minute: 45, exactLongitude: 140.75, isRetrograde: false },
      Venus: { sign: "pisces", degree: 27, minute: 0, exactLongitude: 357.0, isRetrograde: false },
    };

    it("optimizes recipe against live SMES and elemental profile", async () => {
      const optimization = await optimizeRecipe(
        "Solar Saffron Risotto",
        { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
        { planetaryPositions: testPositions, useCache: false },
      );

      expect(optimization.recipe.name).toBe("Solar Saffron Risotto");
      expect(Number.isFinite(optimization.recipe.compatibility)).toBe(true);
      expect(optimization.recipe.compatibility).toBeGreaterThanOrEqual(0);
      expect(optimization.recipe.smesProfile.spirit).toBeDefined();
      expect(optimization.recipe.smesProfile.matter).toBeDefined();
      expect(optimization.recommendations.cuisine).toBeDefined();
      expect(Array.isArray(optimization.recommendations.dishes)).toBe(true);
      expect(Array.isArray(optimization.timing.optimalHours)).toBe(true);
    });

    it("generates culinary recommendations with cuisines, ingredients, and cooking methods", async () => {
      const recs = await getCulinaryRecommendations({
        planetaryPositions: testPositions,
        useCache: false,
      });

      expect(Array.isArray(recs.cuisines)).toBe(true);
      expect(recs.cuisines.length).toBeGreaterThan(0);
      expect(typeof recs.cuisines[0].name).toBe("string");
      expect(Array.isArray(recs.ingredients)).toBe(true);
      expect(Array.isArray(recs.cookingMethods)).toBe(true);
      expect(recs.timing.optimal.length).toBeGreaterThan(0);
    });

    it("calculates planetary kinetics metrics", () => {
      const kinetics = calculatePlanetaryKinetics({
        currentPositions: { Sun: "aries", Moon: "taurus", Mars: "leo" },
        previousPositions: { Sun: "pisces", Moon: "aries", Mars: "cancer" },
        timeInterval: 86400,
      });

      expect(kinetics).toBeDefined();
      expect(Number.isFinite(kinetics.forceMagnitude)).toBe(true);
      expect(Number.isFinite(kinetics.charge)).toBe(true);
    });
  });
});
