import * as Astronomy from "astronomy-engine";
import fixture from "../../../docs/physics/esms_conformance.json";
import { PLANET_WEIGHTS, normalizePlanetWeight } from "@/data/planets";
import {
  ASCENDANT_VESSEL_WEIGHT,
  calculatePositionalAscendantVessel,
  getGravitationalInertia,
  getTidalPull,
  inertialMassWeight,
  PLANET_MEAN_GEOCENTRIC_AU,
  PLANETARY_SECTARIAN_ESMS,
  ZODIAC_ELEMENTS,
  type AlchemicalElement,
  type ZodiacSignType,
} from "@/utils/planetaryAlchemyMapping";

describe("ESMS 2.0 Unified Physics Model Conformance Suite", () => {
  it("has 20 golden test charts in fixture", () => {
    expect(fixture.charts.length).toBe(20);
  });

  fixture.charts.forEach((chart) => {
    it(`evaluates ${chart.id} (${chart.name}) without NaN/null`, () => {
      const positions = chart.planetary_positions as Record<string, { sign: string; degree: number; distance?: number }>;
      const isDiurnal = chart.is_diurnal ?? true;
      const sectKey = isDiurnal ? "diurnal" : "nocturnal";

      let spirit = 0;
      let essence = 0;
      let matter = 0;
      let substance = 0;
      let totalInertia = 0;

      const validBodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
      
      const elementsRaw: Record<AlchemicalElement, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };

      for (const [body, pos] of Object.entries(positions)) {
        if (!validBodies.includes(body)) continue;
        const signClean = pos.sign.charAt(0).toUpperCase() + pos.sign.slice(1).toLowerCase();
        const elem = ZODIAC_ELEMENTS[signClean as ZodiacSignType] ?? "Earth";

        const inertia = getGravitationalInertia(body, pos.distance);
        totalInertia += inertia;
        elementsRaw[elem as AlchemicalElement] += inertia;

        const sectEsms = PLANETARY_SECTARIAN_ESMS[body as keyof typeof PLANETARY_SECTARIAN_ESMS]?.[sectKey] ?? {
          Spirit: 0, Essence: 0, Matter: 0, Substance: 0
        };

        spirit += sectEsms.Spirit * inertia;
        essence += sectEsms.Essence * inertia;
        matter += sectEsms.Matter * inertia;
        substance += sectEsms.Substance * inertia;
      }

      // Ascendant Vessel
      const ascPos = positions.Ascendant ?? { sign: "aries", degree: 0 };
      const ascVessel = calculatePositionalAscendantVessel(ascPos.sign, ascPos.degree);
      const ascInertia = getGravitationalInertia("Ascendant");
      totalInertia += ascInertia;

      spirit += ascVessel.Spirit * ascInertia;
      essence += ascVessel.Essence * ascInertia;
      matter += ascVessel.Matter * ascInertia;
      substance += ascVessel.Substance * ascInertia;

      expect(Number.isFinite(spirit)).toBe(true);
      expect(Number.isFinite(essence)).toBe(true);
      expect(Number.isFinite(matter)).toBe(true);
      expect(Number.isFinite(substance)).toBe(true);
      expect(Number.isFinite(totalInertia)).toBe(true);

      const earthVal = elementsRaw.Earth / (Object.values(elementsRaw).reduce((a, b) => a + b, 0) || 1);
      const reactivity = (matter + earthVal) ** 2;
      expect(Number.isFinite(reactivity)).toBe(true);

      const lnArg = (spirit + essence + 0.05) / (matter + substance + 0.05);
      const monica = 1.618 * Math.log(Math.max(lnArg, 1e-6));
      expect(Number.isFinite(monica)).toBe(true);

      // REGRESSION — the vessel must actually LAND. The Python port zeroed the
      // Ascendant weight (its period entry is that scale's log-minimum) and
      // every diurnal chart collapsed to Matter = Substance = 0 while all the
      // finiteness assertions above kept passing. Only a value assertion sees it.
      expect(matter).toBeGreaterThan(0);
      expect(substance).toBeGreaterThan(0);

      // CROSS-RUNTIME PARITY — the fixture's `expected` blocks are the PYTHON
      // engine's output (calculate_natal_alchemical_quantities, rounded 4dp).
      // The TS functions must reproduce them; before this, both suites asserted
      // only finiteness, which is how a 2x mass-basis divergence stayed green.
      // Tolerance covers Python's 4dp rounding (5e-5) plus float noise; a basis
      // divergence is O(0.1+) and cannot hide under it.
      const expected = (chart as { expected?: Record<string, number> }).expected;
      expect(expected).toBeDefined();
      expect(spirit).toBeCloseTo(expected!.spirit, 3);
      expect(essence).toBeCloseTo(expected!.essence, 3);
      expect(matter).toBeCloseTo(expected!.matter, 3);
      expect(substance).toBeCloseTo(expected!.substance, 3);
    });
  });

  it("pins the source tables to the fixture — the shared parity witness", () => {
    expect((fixture as { epoch_mean_geocentric_au?: Record<string, number> }).epoch_mean_geocentric_au)
      .toEqual(PLANET_MEAN_GEOCENTRIC_AU);
    expect((fixture as { mass_weights?: Record<string, number> }).mass_weights)
      .toEqual(PLANET_WEIGHTS);
  });

  it("annihilates no charted body on the inertial mass scale", () => {
    // normalizePlanetWeight anchors AT Pluto, so Pluto is exactly 0 on that
    // scale — the same extremum-annihilation that zeroed the Ascendant on the
    // period scale (PR #683). POSITIVE CONTROL first: the trap is real.
    expect(normalizePlanetWeight(PLANET_WEIGHTS.Pluto)).toBe(0);
    // The inertial scale anchors one decade below Pluto (RULED): all bodies > 0.
    expect(inertialMassWeight("Sun")).toBe(1.0);
    for (const body of Object.keys(PLANET_MEAN_GEOCENTRIC_AU)) {
      expect(inertialMassWeight(body)).toBeGreaterThan(0);
    }
    // Re-derivable pin, mirrored in test_esms_conformance.py.
    const expectPluto =
      (Math.log10(0.0022) - Math.log10(0.00022)) /
      (Math.log10(333054.2532) - Math.log10(0.00022));
    expect(inertialMassWeight("Pluto")).toBeCloseTo(expectPluto, 12);
  });

  it("makes Λ relative: r = r̄ gives exactly the weight, and the real Moon no longer detonates", () => {
    // REGRESSION: under the old M/r², the Moon's real distance (0.00257 AU)
    // produced inertia ≈ 43,043 vs the Sun's 0.51 — live natal ESMS was 99.99%
    // Moon and canonical kalchm overflowed into the φ fallback (spec §7).
    const rBar = PLANET_MEAN_GEOCENTRIC_AU.Moon;
    expect(getGravitationalInertia("Moon", rBar)).toBe(inertialMassWeight("Moon"));
    const atPerigee = getGravitationalInertia("Moon", 0.002384073736896684);
    expect(atPerigee).toBeLessThan(0.25); // O(weight), not 43,043
    expect(atPerigee).toBeGreaterThan(inertialMassWeight("Moon")); // perigee amplifies
  });

  it("re-derives the epoch-mean geocentric distances from the ephemeris", () => {
    // PLANET_MEAN_GEOCENTRIC_AU is MEASURED, and this is where it is re-measured
    // — the stated basis (2026 epoch, 6-hour grid, astronomy-engine GeoVector)
    // run for real, not trusted as a comment. If astronomy-engine or the epoch
    // definition changes, THIS fails and names the cause.
    const epoch = (fixture as { epoch?: { startUtc: string; samples: number; stepHours: number } }).epoch;
    expect(epoch).toBeDefined();
    const bodies: Array<[string, Astronomy.Body]> = [
      ["Sun", Astronomy.Body.Sun], ["Moon", Astronomy.Body.Moon],
      ["Mercury", Astronomy.Body.Mercury], ["Venus", Astronomy.Body.Venus],
      ["Mars", Astronomy.Body.Mars], ["Jupiter", Astronomy.Body.Jupiter],
      ["Saturn", Astronomy.Body.Saturn], ["Uranus", Astronomy.Body.Uranus],
      ["Neptune", Astronomy.Body.Neptune], ["Pluto", Astronomy.Body.Pluto],
    ];
    const start = Date.parse(epoch!.startUtc);
    const stepMs = epoch!.stepHours * 3600 * 1000;
    const sums: Record<string, number> = {};
    for (let i = 0; i < epoch!.samples; i++) {
      const t = Astronomy.MakeTime(new Date(start + i * stepMs));
      for (const [name, body] of bodies) {
        const v = Astronomy.GeoVector(body, t, true);
        sums[name] = (sums[name] ?? 0) + Math.hypot(v.x, v.y, v.z) / epoch!.samples;
      }
    }
    for (const [name] of bodies) {
      expect(sums[name]).toBeCloseTo(PLANET_MEAN_GEOCENTRIC_AU[name], 10);
    }
  });

  it("pins the Ascendant vessel weight to the RULED anchor 1.0 in both runtimes", () => {
    // test_esms_conformance.py pins the identical value on the Python side.
    expect(ASCENDANT_VESSEL_WEIGHT).toBe(1.0);
    expect(getGravitationalInertia("Ascendant")).toBe(1.0); // r = 1.0 AU
    expect(getTidalPull("Ascendant")).toBe(1.0);
    // POSITIVE CONTROL — what the accidental `?? 1.0` fallback used to produce:
    // Earth's relative MASS through the mass normalizer, ≈ 0.3249, not a ruling.
    expect(PLANET_WEIGHTS["Ascendant" as keyof typeof PLANET_WEIGHTS]).toBeUndefined();
    expect(normalizePlanetWeight(1.0)).toBeCloseTo(0.3248835368415509, 12);
    expect(normalizePlanetWeight(1.0)).not.toBe(ASCENDANT_VESSEL_WEIGHT);
  });
});
