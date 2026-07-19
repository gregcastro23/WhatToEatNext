/**
 * Tests for aspectKinematics — the shared applying/separating finite-difference
 * model used by /api/alchm-quantities/aspects and the free-body-diagram builder.
 *
 * All scenarios are hand-computable: simple longitude/speed pairs where the
 * expected orb change per day is obvious by inspection.
 */
import {
  computeAspectKinematics,
  computeOrb,
  STATIONARY_EPS,
} from "@/utils/aspectKinematics";

describe("computeOrb", () => {
  test("distance from an exact square is zero", () => {
    expect(computeOrb(10, 100, 90)).toBeCloseTo(0, 9);
  });

  test("simple square orb", () => {
    // 92° apart on a 90° aspect → 2° orb.
    expect(computeOrb(0, 92, 90)).toBeCloseTo(2, 9);
  });

  test("wraps across 0° Aries", () => {
    // 350° and 10° are 20° apart, not 340°.
    expect(computeOrb(350, 10, 0)).toBeCloseTo(20, 9);
  });

  test("uses minimal separation (never above 180°)", () => {
    expect(computeOrb(0, 180, 180)).toBeCloseTo(0, 9);
    expect(computeOrb(355, 5, 90)).toBeCloseTo(80, 9);
  });
});

describe("computeAspectKinematics", () => {
  test("applying: faster body behind, closing a 92° square at 1°/day", () => {
    // Body 1 at 0° moving +1°/day, body 2 held at 92°: separation shrinks
    // toward the exact 90° square, so the 2° orb closes at exactly 1°/day.
    const k = computeAspectKinematics(0, 92, 90, 1.0, 0);

    expect(k.orbVelocity).toBeCloseTo(-1.0, 6);
    expect(k.applying).toBe(true);
    expect(k.state).toBe("applying");
    // daysToExact ≈ orb / |orbVelocity| = 2 / 1.
    expect(k.daysToExact).toBeCloseTo(2, 6);
    expect(k.relativeAngularVelocity).toBeCloseTo(1.0, 9);
  });

  test("applying: fast partner ahead closing a trine from below", () => {
    // Separation 110° growing toward the exact 120° trine at 12°/day
    // (13 − 1); the 10° orb closes in 10/12 days.
    const k = computeAspectKinematics(100, 210, 120, 1, 13);

    expect(k.orbVelocity).toBeCloseTo(-12, 6);
    expect(k.state).toBe("applying");
    expect(k.applying).toBe(true);
    expect(k.daysToExact).toBeCloseTo(10 / 12, 6);
    expect(k.relativeAngularVelocity).toBeCloseTo(-12, 9);
  });

  test("applying across the 0° Aries wrap", () => {
    // 355° chasing 5° into a conjunction: 10° orb closing at 1°/day.
    const k = computeAspectKinematics(355, 5, 0, 1.0, 0);

    expect(k.orbVelocity).toBeCloseTo(-1.0, 6);
    expect(k.state).toBe("applying");
    expect(k.daysToExact).toBeCloseTo(10, 6);
  });

  test("separating: faster body moving past an 88° square", () => {
    // Body 1 at 0° moving +1°/day away from body 2 at 88°: the separation
    // shrinks below 88°, moving AWAY from the exact 90° square.
    const k = computeAspectKinematics(0, 88, 90, 1.0, 0);

    expect(k.orbVelocity).toBeCloseTo(+1.0, 6);
    expect(k.applying).toBe(false);
    expect(k.state).toBe("separating");
    // daysToExact is positive on both sides: days SINCE exact here.
    expect(k.daysToExact).toBeCloseTo(2, 6);
  });

  test("stationary: equal speeds hold the orb → 9999 days sentinel", () => {
    // Both bodies advance at 0.7°/day, so the 2° orb never changes.
    const k = computeAspectKinematics(10, 102, 90, 0.7, 0.7);

    expect(Math.abs(k.orbVelocity)).toBeLessThan(STATIONARY_EPS);
    expect(k.applying).toBe(false);
    expect(k.state).toBe("stationary");
    expect(k.daysToExact).toBe(9999);
    expect(k.relativeAngularVelocity).toBeCloseTo(0, 9);
  });

  test("retrograde speeds are honored (negative daily motion)", () => {
    // Body 1 at 94° retrograding −1°/day toward the 90° square with a body
    // held at 0°: separation 94 → 90, orb closing at 1°/day.
    const k = computeAspectKinematics(94, 0, 90, -1.0, 0);

    expect(k.orbVelocity).toBeCloseTo(-1.0, 6);
    expect(k.state).toBe("applying");
    expect(k.daysToExact).toBeCloseTo(4, 6);
    expect(k.relativeAngularVelocity).toBeCloseTo(-1.0, 9);
  });
});
