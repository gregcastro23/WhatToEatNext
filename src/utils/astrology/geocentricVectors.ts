/**
 * Geocentric ecliptic Cartesian position/velocity vectors for a celestial body.
 *
 * Reference frame: GEOCENTRIC ecliptic of date — x toward 0° Aries, y toward
 * 90° Cancer, z toward the north ecliptic pole. All inputs are measured with
 * Earth at the origin, the only frame astrology recognises.
 *
 * Extracted from `src/app/api/alchm-quantities/route.ts` so the geometry can be
 * asserted directly. Inside the route it was reachable only through a four-way
 * alchemically-weighted sum, which is why the distance defect below survived:
 * no test could see a single body's vector.
 */

import { PLANET_MEAN_GEOCENTRIC_AU } from "@/utils/planetaryAlchemyMapping";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const DEG2RAD = Math.PI / 180;

export const magnitude = (v: Vec3): number =>
  Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

function toFinite(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Resolve the geocentric range in AU for a body.
 *
 * `[FIXED 2026-08-03]` This used to be `toFinite(pos?.distance, 1)` — a flat
 * 1 AU for EVERY body whose position record carried no distance. That is not a
 * neutral default, it is an invented geometry: it places Pluto (r̄ = 35.53 AU)
 * at Earth's own orbital radius, ~35× too close, and the error propagates into
 * both the position vector and the chain-rule velocity that depends on `r`.
 *
 * The fallback was the LIVE path, not an edge case: no stored natal chart in
 * production carries a distance on any planet (0 of 75 measured 2026-08-03),
 * because `calculateNatalChart` emits `{name, sign, position}` and the
 * astrologize response has no distance field.
 *
 * The correct fallback is the body's own MEAN geocentric distance, matching
 * `getGravitationalInertia` (planetaryAlchemyMapping.ts), where substituting r̄
 * yields a neutral (r̄/r)² = 1 instead of a wrong position. A body with no
 * distance concept at all (Ascendant, or an unknown key) has no r̄ and falls
 * back to unit radius — the same special case the inertia path applies.
 *
 * Guards on `> 0` rather than mere finiteness: `toFinite` passes a literal 0
 * straight through, and a 0 AU range is physically impossible for every body
 * here — it would collapse the vector to the origin and send the 1/r² coupling
 * to its clamp.
 */
export function resolveGeocentricDistanceAu(planet: string, pos: unknown): number {
  const raw = toFinite((pos as { distance?: unknown } | null)?.distance, 0);
  if (raw > 0) return raw;
  return PLANET_MEAN_GEOCENTRIC_AU[planet] ?? 1;
}

/**
 * Floor on r² (AU²) inside the inverse-square ESMS force coupling, so the gain
 * can never exceed 1 / 0.01 = 100. Equivalent to treating every body closer than
 * 0.1 AU as if it sat at 0.1 AU.
 *
 * BASIS: none recorded for this value. It arrived in 2a7bc9b2 (2026-05-16); that
 * commit's message, the docs and the tests give no rationale for it. Sibling
 * `Math.max(0.01, …)` floors in the same commit are annotated "Floor avoids ÷0",
 * so a divide-by-zero guard was probably the intent — inferred, not stated, and a
 * guard against ÷0 would not need a floor this large: it is what flattens the
 * Moon. Neither measured nor ruled. Pinned by `geocentricVectors.test.ts` so a
 * change is deliberate, not an endorsement. Residual (1) of the ESMS 2.0 list,
 * `docs/physics/UNIFIED_PHYSICS_MODEL.md`.
 */
export const ESMS_COUPLING_R2_FLOOR_AU2 = 0.01;

/**
 * Inverse-square coupling gain applied to a body's velocity when the route sums
 * `esmsForce`: `1 / max(|r|², ESMS_COUPLING_R2_FLOOR_AU2)`.
 *
 * The floor binds for exactly one body. Over `PLANET_MEAN_GEOCENTRIC_AU` the
 * Moon (r̄ ≈ 0.00257 AU) is the only entry below 0.1 AU, so its gain is flat at
 * 100 whatever its real distance, where an unclamped 1/r̄² would be ≈ 1.5e5.
 * Every other body sits in the plain inverse-square regime. That is the Moon's
 * "different amplitude regime".
 *
 * Extracted from `src/app/api/alchm-quantities/route.ts` for the same reason as
 * `positionVec`: inline, the clamp was reachable only through a four-way weighted
 * sum, and the one test that touched it re-typed the expression, so it asserted
 * its own copy and not what the route does.
 */
export function esmsCouplingGain(r: Vec3): number {
  const m = magnitude(r);
  return 1 / Math.max(m * m, ESMS_COUPLING_R2_FLOOR_AU2);
}

/**
 * Build the 3D geocentric position and its time derivative for one body.
 *
 * `distanceSpeed` still defaults to 0, and that IS a neutral default unlike the
 * distance one: a zero radial rate drops the `rDot` terms and leaves the body
 * moving tangentially at its (mean) radius. It biases nothing in the way a
 * wrong `r` does — it only omits a component nobody supplied.
 */
export function positionVec(
  planet: string,
  pos: unknown,
): { r: Vec3; v: Vec3 } {
  const p = pos as Record<string, unknown> | null;
  const lon = toFinite(p?.exactLongitude) * DEG2RAD;
  const lat = toFinite(p?.eclipticLatitude) * DEG2RAD;
  const r = resolveGeocentricDistanceAu(planet, pos);
  const lonDot = toFinite(p?.longitudeSpeed) * DEG2RAD; // rad/day
  const latDot = toFinite(p?.latitudeSpeed) * DEG2RAD; // rad/day
  const rDot = toFinite(p?.distanceSpeed); // AU/day

  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  const cosLon = Math.cos(lon);
  const sinLon = Math.sin(lon);

  const position: Vec3 = {
    x: r * cosLat * cosLon,
    y: r * cosLat * sinLon,
    z: r * sinLat,
  };
  // dP/dt by chain rule
  const velocity: Vec3 = {
    x:
      rDot * cosLat * cosLon -
      r * sinLat * latDot * cosLon -
      r * cosLat * sinLon * lonDot,
    y:
      rDot * cosLat * sinLon -
      r * sinLat * latDot * sinLon +
      r * cosLat * cosLon * lonDot,
    z: rDot * sinLat + r * cosLat * latDot,
  };
  return { r: position, v: velocity };
}
