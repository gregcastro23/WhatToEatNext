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
