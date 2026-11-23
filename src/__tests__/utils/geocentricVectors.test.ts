/**
 * Guards the geocentric distance fallback.
 *
 * `positionVec` used to resolve a missing distance to a flat 1 AU for every
 * body. That is an invented geometry, not a neutral default: it placed Pluto at
 * Earth's own orbital radius, ~35x too close, and the error flowed into both the
 * position vector and the chain-rule velocity that scales with `r`.
 *
 * It was the LIVE path, not an edge case — no stored natal chart in production
 * carries a distance on any planet (0 of 75 measured 2026-08-03), because
 * `calculateNatalChart` emits `{name, sign, position}` only.
 */

import { describe, expect, it } from "@jest/globals";

import {
  ESMS_COUPLING_R2_FLOOR_AU2,
  esmsCouplingGain,
  magnitude,
  positionVec,
  resolveGeocentricDistanceAu,
} from "@/utils/astrology/geocentricVectors";
import { PLANET_MEAN_GEOCENTRIC_AU } from "@/utils/planetaryAlchemyMapping";

/** The shape every stored chart actually has: longitude, no distance. */
const NO_DISTANCE = { exactLongitude: 300.25, isRetrograde: false };

describe("resolveGeocentricDistanceAu", () => {
  it("falls back to Pluto's own mean range, not 1 AU", () => {
    // The regression this file exists for. Expectations are read from the
    // table rather than hardcoded, so the pin round-trips from its basis.
    const r = resolveGeocentricDistanceAu("Pluto", NO_DISTANCE);
    expect(r).toBe(PLANET_MEAN_GEOCENTRIC_AU.Pluto);
    expect(r).toBeGreaterThan(35);
    expect(r).not.toBe(1);
  });

  it("falls back to each body's own mean range", () => {
    for (const [planet, rBar] of Object.entries(PLANET_MEAN_GEOCENTRIC_AU)) {
      expect(resolveGeocentricDistanceAu(planet, NO_DISTANCE)).toBe(rBar);
    }
  });

  it("prefers a real supplied distance over the mean", () => {
    expect(
      resolveGeocentricDistanceAu("Pluto", { ...NO_DISTANCE, distance: 30.7389 }),
    ).toBeCloseTo(30.7389, 6);
  });

  it("rejects a non-positive distance rather than collapsing to the origin", () => {
    // `toFinite` passes a literal 0 straight through, so finiteness alone is not
    // enough of a guard — 0 AU is impossible for every body here and would send
    // the 1/r^2 coupling to its clamp.
    for (const bad of [0, -1, Number.NaN, undefined, null, "nonsense"]) {
      expect(
        resolveGeocentricDistanceAu("Pluto", { ...NO_DISTANCE, distance: bad }),
      ).toBe(PLANET_MEAN_GEOCENTRIC_AU.Pluto);
    }
  });

  it("uses unit radius only for bodies with no distance concept", () => {
    // The Ascendant is a chart angle, not an orbiting body — it has no entry in
    // the mean-distance table, the same special case getGravitationalInertia
    // applies when rBar is undefined.
    expect(PLANET_MEAN_GEOCENTRIC_AU.Ascendant).toBeUndefined();
    expect(resolveGeocentricDistanceAu("Ascendant", NO_DISTANCE)).toBe(1);
    expect(resolveGeocentricDistanceAu("NotABody", NO_DISTANCE)).toBe(1);
  });
});

describe("positionVec", () => {
  it("places a distance-less Pluto at its mean range, not 1 AU", () => {
    const { r } = positionVec("Pluto", NO_DISTANCE);
    expect(magnitude(r)).toBeCloseTo(PLANET_MEAN_GEOCENTRIC_AU.Pluto, 9);
    // The pre-fix behaviour, stated explicitly so a revert cannot pass quietly.
    expect(magnitude(r)).not.toBeCloseTo(1, 3);
  });

  it("separates the outer planets instead of stacking them on one shell", () => {
    // Under the old fallback every body sat at |r| = 1, so the whole solar
    // system collapsed onto a single sphere and the 1/r^2 coupling was uniform.
    const radii = ["Moon", "Sun", "Mars", "Jupiter", "Saturn", "Neptune", "Pluto"].map(
      (p) => magnitude(positionVec(p, NO_DISTANCE).r),
    );
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]).toBeGreaterThan(radii[i - 1]);
    }
    expect(new Set(radii.map((v) => v.toFixed(6))).size).toBe(radii.length);
  });

  it("scales the 1/r^2 coupling by the corrected range", () => {
    // The route's own gain, imported — not a re-typed copy of its expression,
    // which would keep passing if the route's clamp changed. Pluto's coupling
    // must be ~1/35.53^2, not the 1.0 a unit radius produced.
    const coupling = (planet: string): number =>
      esmsCouplingGain(positionVec(planet, NO_DISTANCE).r);
    expect(coupling("Pluto")).toBeCloseTo(
      1 / PLANET_MEAN_GEOCENTRIC_AU.Pluto ** 2,
      12,
    );
    expect(coupling("Pluto")).toBeLessThan(coupling("Sun") / 1000);
  });

  it("scales the chain-rule velocity by the corrected range too", () => {
    // The defect corrupted velocity as well as position: every term except the
    // radial one carries a factor of r.
    const moving = { ...NO_DISTANCE, longitudeSpeed: 0.01 };
    const v = positionVec("Pluto", moving).v;
    const expected = PLANET_MEAN_GEOCENTRIC_AU.Pluto * 0.01 * (Math.PI / 180);
    expect(magnitude(v)).toBeCloseTo(expected, 9);
  });

  it("keeps a zero radial rate neutral rather than inventing one", () => {
    // distanceSpeed's 0 default is a genuine neutral, unlike the distance one:
    // it drops the rDot terms and leaves the body moving tangentially.
    const still = positionVec("Pluto", NO_DISTANCE);
    expect(magnitude(still.v)).toBe(0);
    const radial = positionVec("Pluto", { ...NO_DISTANCE, distanceSpeed: 0.5 });
    expect(magnitude(radial.v)).toBeCloseTo(0.5, 9);
  });
});

/**
 * The 1/r^2 coupling floor behind `esmsForce` (residual 1 of the ESMS 2.0 list).
 *
 * Every test here is a CHARACTERIZATION of the current behaviour. The 0.01 AU^2
 * floor has no recorded basis and no ruling, so nothing below asserts that 0.1 AU
 * is the right number — only that the code does what this file says, so a change
 * to it is deliberate. The literals 0.01 and 100 are pinned directly and NOT read
 * back from the export: a test that derives its expectation from the constant it
 * checks passes under any mutation of that constant.
 */
describe("esmsCouplingGain", () => {
  const MEAN = PLANET_MEAN_GEOCENTRIC_AU;
  // The table is `Record<string, number>`, so a bare lookup is `number | undefined`;
  // a missing body should fail loudly here, not become NaN in an expectation.
  const meanAu = (planet: string): number => {
    const au = MEAN[planet];
    if (au === undefined) throw new Error(`no mean geocentric range for ${planet}`);
    return au;
  };
  const gainAtMean = (planet: string): number =>
    esmsCouplingGain(positionVec(planet, NO_DISTANCE).r);
  const atRange = (au: number): number => esmsCouplingGain({ x: au, y: 0, z: 0 });

  it("pins the floor at 0.01 AU^2, so the gain tops out at exactly 100", () => {
    expect(ESMS_COUPLING_R2_FLOOR_AU2).toBe(0.01);
    expect(atRange(0)).toBe(100); // a collapsed vector is capped, never Infinity
  });

  it("clamps the Moon and no other body", () => {
    // Read from the measured table, so adding a body that also lands under 0.1 AU
    // fails here instead of silently joining the clamped regime.
    const clamped = Object.entries(MEAN)
      .filter(([, au]) => au * au < 0.01)
      .map(([planet]) => planet);
    expect(clamped).toEqual(["Moon"]);
  });

  it("is plain inverse-square for every body above the floor", () => {
    for (const [planet, au] of Object.entries(MEAN)) {
      if (planet === "Moon") continue;
      expect(gainAtMean(planet)).toBeCloseTo(1 / (au * au), 12);
    }
  });

  it("holds the Moon flat at 100, blind to its real distance", () => {
    // Anything under 0.1 AU gives the same gain, so the Moon's perigee-to-apogee
    // swing (and any distance error) cannot reach esmsForce through the coupling.
    for (const scale of [0.1, 0.5, 1, 2, 10]) {
      const r = positionVec("Moon", { exactLongitude: 10, distance: meanAu("Moon") * scale }).r;
      expect(esmsCouplingGain(r)).toBe(100);
    }
  });

  it("switches regime at 0.1 AU without a jump", () => {
    expect(atRange(0.05)).toBe(100);
    expect(atRange(0.1)).toBeCloseTo(100, 9);
    expect(atRange(0.2)).toBeCloseTo(25, 9);
    expect(atRange(0.05)).toBeGreaterThanOrEqual(atRange(0.1));
    expect(atRange(0.1)).toBeGreaterThanOrEqual(atRange(0.2));
  });

  it("discards over three orders of magnitude of the Moon's unclamped coupling", () => {
    const unclamped = 1 / (meanAu("Moon") * meanAu("Moon")); // ~1.5e5 at the mean range
    expect(unclamped / gainAtMean("Moon")).toBeGreaterThan(1000);
  });

  it("is what keeps the Moon's force within an order of magnitude of the Sun's", () => {
    // Speeds from mean motion. BASIS: sidereal month 27.321661 d and tropical
    // year 365.24219 d, converted to deg/day. Force per unit ESMS weight is
    // |v| * gain, as the route sums it.
    const speed = (planet: string, degPerDay: number): number =>
      magnitude(positionVec(planet, { exactLongitude: 100, longitudeSpeed: degPerDay }).v);
    const moonSpeed = speed("Moon", 360 / 27.321661);
    const sunForce = speed("Sun", 360 / 365.24219) * gainAtMean("Sun");

    const clampedRatio = (moonSpeed * gainAtMean("Moon")) / sunForce;
    const unclampedRatio = moonSpeed / (meanAu("Moon") * meanAu("Moon")) / sunForce;

    expect(clampedRatio).toBeLessThan(10);
    // The counterfactual: without the floor the Moon would swamp the Sun
    // thousands of times over. The floor, not physics, sets the Moon's share.
    expect(unclampedRatio).toBeGreaterThan(1000);
  });
});
