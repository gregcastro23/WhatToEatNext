/**
 * Tests for data/planets.ts — planetary mass data and weight normalization.
 */
import { PLANET_WEIGHTS, planetaryData } from "@/data/planets";

describe("PLANET_WEIGHTS", () => {
  const expectedPlanets = [
    "Sun", "Jupiter", "Saturn", "Neptune", "Uranus",
    "Earth", "Venus", "Mars", "Mercury", "Moon", "Pluto",
  ];

  it("contains all 11 celestial bodies", () => {
    for (const planet of expectedPlanets) {
      expect(PLANET_WEIGHTS).toHaveProperty(planet);
    }
    expect(Object.keys(PLANET_WEIGHTS)).toHaveLength(11);
  });

  it("all weights are positive numbers", () => {
    for (const [name, weight] of Object.entries(PLANET_WEIGHTS)) {
      expect(typeof weight).toBe("number");
      expect(weight).toBeGreaterThan(0);
    }
  });

  it("Sun is the heaviest body", () => {
    const maxWeight = Math.max(...Object.values(PLANET_WEIGHTS));
    expect(PLANET_WEIGHTS.Sun).toBe(maxWeight);
  });

  it("Pluto is the lightest body", () => {
    const minWeight = Math.min(...Object.values(PLANET_WEIGHTS));
    expect(PLANET_WEIGHTS.Pluto).toBe(minWeight);
  });

  it("Earth is exactly 1.0 (reference mass)", () => {
    expect(PLANET_WEIGHTS.Earth).toBe(1.0);
  });

  it("maintains correct mass ordering", () => {
    expect(PLANET_WEIGHTS.Sun).toBeGreaterThan(PLANET_WEIGHTS.Jupiter);
    expect(PLANET_WEIGHTS.Jupiter).toBeGreaterThan(PLANET_WEIGHTS.Saturn);
    expect(PLANET_WEIGHTS.Saturn).toBeGreaterThan(PLANET_WEIGHTS.Neptune);
    expect(PLANET_WEIGHTS.Neptune).toBeGreaterThan(PLANET_WEIGHTS.Uranus);
    expect(PLANET_WEIGHTS.Uranus).toBeGreaterThan(PLANET_WEIGHTS.Earth);
    expect(PLANET_WEIGHTS.Earth).toBeGreaterThan(PLANET_WEIGHTS.Venus);
    expect(PLANET_WEIGHTS.Venus).toBeGreaterThan(PLANET_WEIGHTS.Mars);
    expect(PLANET_WEIGHTS.Mars).toBeGreaterThan(PLANET_WEIGHTS.Mercury);
    expect(PLANET_WEIGHTS.Mercury).toBeGreaterThan(PLANET_WEIGHTS.Moon);
    expect(PLANET_WEIGHTS.Moon).toBeGreaterThan(PLANET_WEIGHTS.Pluto);
  });
});

describe("the removed Pluto-anchored scale", () => {
  it("stays removed — no mass normalizer may anchor at a member of its own set", () => {
    // REGRESSION GUARD (ADR-009). `normalizePlanetWeight` anchored its minimum
    // AT Pluto, so Pluto normalized to exactly 0 and contributed nothing to any
    // chart it appeared in. The whole module is asserted to no longer export it,
    // because the cheapest way to undo this migration is to add it back.
    const planets = jest.requireActual("@/data/planets") as Record<string, unknown>;
    expect(planets.normalizePlanetWeight).toBeUndefined();
    // POSITIVE CONTROL — the module IS loaded and DOES export things, so the
    // assertion above is a real absence rather than a failed import.
    expect(typeof planets.PLANET_WEIGHTS).toBe("object");
    // ADR-009 decision 5b: the orbital-period scale is gone too, so this module
    // now exports NEITHER normalizer. `PLANET_WEIGHTS` above carries the
    // positive-control job alone.
    expect(planets.normalizeAlchmWeight).toBeUndefined();
    expect(planets.PLANET_ALCHM_PERIODS).toBeUndefined();
  });
});

describe("planetaryData", () => {
  it("contains data for major planets", () => {
    const expected = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
    for (const planet of expected) {
      expect(planetaryData).toHaveProperty(planet);
    }
  });

  it("each planet has element, foodCorrespondences, cookingMethods, and governs", () => {
    for (const [name, data] of Object.entries(planetaryData)) {
      expect(data).toHaveProperty("element");
      expect(data).toHaveProperty("foodCorrespondences");
      expect(data).toHaveProperty("cookingMethods");
      expect(data).toHaveProperty("governs");
      expect(Array.isArray(data.foodCorrespondences)).toBe(true);
      expect(Array.isArray(data.cookingMethods)).toBe(true);
      expect(Array.isArray(data.governs)).toBe(true);
    }
  });

  it("physicalWeight matches PLANET_WEIGHTS", () => {
    for (const [name, data] of Object.entries(planetaryData)) {
      expect(data.physicalWeight).toBe(PLANET_WEIGHTS[name]);
    }
  });
});
