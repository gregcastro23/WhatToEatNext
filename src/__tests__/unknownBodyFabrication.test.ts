import {
  inertialMassWeight,
  isExcludedAspectBody,
  EXCLUDED_ASPECT_BODIES,
  aggregateZodiacElementals,
  aggregateEnhancedZodiacElementals,
} from "@/utils/planetaryAlchemyMapping";
import { PLANET_WEIGHTS } from "@/data/planets";

/**
 * The unknown-body fabrication, and the gate that ends it.
 *
 * `inertialMassWeight` read `PLANET_WEIGHTS[planet] ?? 1.0`, with a source note
 * claiming the fallback was harmless because "every caller filters to the
 * known-body set first". That claim was FALSE. Instrumenting the function across
 * the full suite recorded **2920 calls with an unknown body** — NorthNode and
 * SouthNode, 1460 each — every one silently given Earth's relative mass.
 *
 * Both leaks came from this module's own aggregators, which had no exclusion
 * gate at all while `RealAlchemizeService` had one. Between them those two
 * functions feed natalChartService, /api/user/charts, restaurantDiscoveryService,
 * AstrologicalService, commensalDatabaseService and ChartComparisonService.
 *
 * ⚠️ The fabricated weight was uniquely hard to spot: `PLANET_WEIGHTS.Earth` is
 * exactly 1.0 — the same literal the fallback used — so an unknown body produced
 * a weight IDENTICAL to a legitimate "Earth" call, and heavier than Mars,
 * Mercury, the Moon and Pluto.
 */

const NODE_SPELLINGS = [
  "North Node", "NorthNode", "north node", "SOUTHNODE",
  "South Node", "True Node", "Mean Node", "MC", "mc",
  "Chiron", "Lilith", "Vertex", "Pars Fortune", "ParsFortune",
];

const REAL_BODIES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
];

describe("unknown bodies can no longer fabricate a mass", () => {
  it("POSITIVE CONTROL: the known bodies all still resolve", () => {
    // Without this, a gate that swallowed everything would pass every assertion
    // below by making the throw unreachable.
    for (const b of REAL_BODIES) {
      expect(inertialMassWeight(b)).toBeGreaterThan(0);
    }
    expect(inertialMassWeight("Ascendant")).toBe(1.0);
    expect(inertialMassWeight("Sun")).toBe(1.0);
  });

  it("THROWS instead of returning Earth's mass", () => {
    for (const b of ["ZZ_NOT_A_BODY", "Ceres", "Eris", ""]) {
      expect(() => inertialMassWeight(b)).toThrow(/no mass for/);
    }
  });

  it("names the excluded case specifically, so the fix is obvious from the message", () => {
    expect(() => inertialMassWeight("North Node")).toThrow(/EXCLUDED body/);
    expect(() => inertialMassWeight("ZZ_NOT_A_BODY")).toThrow(/Unknown body/);
  });

  it("would have returned EARTH's weight — the value that used to be fabricated", () => {
    // Pins what the old fallback produced, so the severity stays legible: 0.3984
    // is heavier than four real planets.
    const earth = inertialMassWeight("Earth");
    expect(earth).toBeCloseTo(0.3984248957794913, 12);
    for (const lighter of ["Mars", "Mercury", "Moon", "Pluto"]) {
      expect(inertialMassWeight(lighter)).toBeLessThan(earth);
    }
  });

  it("recognises every spelling the backends emit", () => {
    for (const s of NODE_SPELLINGS) expect(isExcludedAspectBody(s)).toBe(true);
    for (const b of [...REAL_BODIES, "Ascendant"]) {
      expect(isExcludedAspectBody(b)).toBe(false);
    }
    expect(EXCLUDED_ASPECT_BODIES.size).toBe(9);
  });
});

describe("both aggregators gate abstract bodies out", () => {
  const REAL_SKY: Record<string, string> = {
    Sun: "Leo", Moon: "Pisces", Mercury: "Cancer", Venus: "Virgo",
    Mars: "Gemini", Jupiter: "Leo", Saturn: "Aries", Uranus: "Gemini",
    Neptune: "Aries", Pluto: "Aquarius",
  };
  // Nodes and MC placed in Fire signs, so an ungated run would visibly skew Fire.
  const WITH_PHANTOMS: Record<string, string> = {
    ...REAL_SKY,
    "North Node": "Aries", "South Node": "Leo", MC: "Sagittarius",
  };

  it("aggregateZodiacElementals ignores them entirely", () => {
    const a = aggregateZodiacElementals(REAL_SKY);
    const b = aggregateZodiacElementals(WITH_PHANTOMS);
    for (const k of ["Fire", "Water", "Earth", "Air"] as const) {
      expect(b[k]).toBeCloseTo(a[k], 12);
    }
  });

  it("aggregateEnhancedZodiacElementals ignores them entirely, in both sects", () => {
    for (const diurnal of [true, false]) {
      const a = aggregateEnhancedZodiacElementals(REAL_SKY, diurnal);
      const b = aggregateEnhancedZodiacElementals(WITH_PHANTOMS, diurnal);
      for (const k of ["Fire", "Water", "Earth", "Air"] as const) {
        expect(b[k]).toBeCloseTo(a[k], 12);
      }
    }
  });

  it("NEGATIVE CONTROL: an identical NON-excluded key in the same sign DOES move it", () => {
    // Guards against a vacuous pass. If this fixture were element-insensitive,
    // the two tests above would pass without the gate doing anything.
    //
    // The A/B is exact: same sign, same shape, one extra key either way. "Earth"
    // is a real PLANET_WEIGHTS entry and is NOT excluded; "North Node" is
    // excluded. Only the gate separates them.
    //
    // (An earlier version of this control moved Jupiter Leo -> Sagittarius and
    // asserted the totals shifted. They did not: both are FIRE signs, so the
    // "control" changed nothing and failed — correctly.)
    const base = aggregateZodiacElementals(REAL_SKY);
    const withExcluded = aggregateZodiacElementals({ ...REAL_SKY, "North Node": "Aries" });
    const withIncluded = aggregateZodiacElementals({ ...REAL_SKY, Earth: "Aries" });

    const moved = (x: typeof base) =>
      (["Fire", "Water", "Earth", "Air"] as const).some(
        (k) => Math.abs(x[k] - base[k]) > 1e-9,
      );

    expect(moved(withExcluded)).toBe(false); // gated
    expect(moved(withIncluded)).toBe(true); // weighted, so the fixture IS sensitive
  });

  it("PLANET_WEIGHTS still has no entry for any excluded body", () => {
    // The gate and the table must not disagree: an excluded body that ALSO had a
    // mass entry would be silently weighted by whichever check ran first.
    for (const s of NODE_SPELLINGS) {
      expect(PLANET_WEIGHTS[s]).toBeUndefined();
    }
  });
});
