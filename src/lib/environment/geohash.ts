/**
 * Geohash encoding for the environmental cache key.
 *
 * Precision 5 (~4.9 × 4.9 km) is the cache key for weather. Finer than that is
 * false precision: Open-Meteo's model grid is ~11 km, so a p6 key would produce
 * ~30× the rows while resolving detail the upstream data does not contain.
 *
 * Elevation is deliberately NOT derived from this key. A ~5 km cell in rugged
 * terrain can span enough elevation to move the boiling point by more than a
 * degree, and elevation is the dominant term in the whole engine — it is stored
 * per-location at full DEM fidelity instead.
 *
 * Coarsening to p5 also means no precise user location enters a URL, a query
 * string, or an access log.
 *
 * @file src/lib/environment/geohash.ts
 */

import { createHash } from "node:crypto";

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

/** The precision used for every environmental cache key. */
export const ENVIRONMENT_GEOHASH_PRECISION = 5;

/**
 * Encode a coordinate as a geohash.
 *
 * @param latitude  Degrees, −90…90.
 * @param longitude Degrees, −180…180.
 * @param precision Characters of output. Defaults to the environmental standard.
 */
export function encodeGeohash(
  latitude: number,
  longitude: number,
  precision: number = ENVIRONMENT_GEOHASH_PRECISION,
): string {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError(`latitude must be within -90..90, received ${latitude}`);
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError(`longitude must be within -180..180, received ${longitude}`);
  }
  if (!Number.isInteger(precision) || precision < 1 || precision > 12) {
    throw new RangeError(`precision must be an integer within 1..12, received ${precision}`);
  }

  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;

  let hash = "";
  let bit = 0;
  let chunk = 0;
  let evenBit = true; // even bits index longitude, odd bits latitude

  while (hash.length < precision) {
    if (evenBit) {
      const lonMid = (lonMin + lonMax) / 2;
      if (longitude >= lonMid) {
        chunk = (chunk << 1) + 1;
        lonMin = lonMid;
      } else {
        chunk = chunk << 1;
        lonMax = lonMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (latitude >= latMid) {
        chunk = (chunk << 1) + 1;
        latMin = latMid;
      } else {
        chunk = chunk << 1;
        latMax = latMid;
      }
    }
    evenBit = !evenBit;

    if (++bit === 5) {
      hash += BASE32[chunk];
      bit = 0;
      chunk = 0;
    }
  }

  return hash;
}

/**
 * Centre of a geohash cell.
 *
 * Correct for querying a weather provider, since the cell is smaller than the
 * model grid. NOT a source of elevation — see the file header.
 */
export function decodeGeohashCenter(geohash: string): { latitude: number; longitude: number } {
  if (!/^[0-9bcdefghjkmnpqrstuvwxyz]+$/.test(geohash)) {
    throw new RangeError(`invalid geohash: ${geohash}`);
  }

  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  let evenBit = true;

  for (const char of geohash) {
    const index = BASE32.indexOf(char);
    for (let shift = 4; shift >= 0; shift--) {
      const bitValue = (index >> shift) & 1;
      if (evenBit) {
        const lonMid = (lonMin + lonMax) / 2;
        if (bitValue === 1) lonMin = lonMid;
        else lonMax = lonMid;
      } else {
        const latMid = (latMin + latMax) / 2;
        if (bitValue === 1) latMin = latMid;
        else latMax = latMid;
      }
      evenBit = !evenBit;
    }
  }

  return {
    latitude: (latMin + latMax) / 2,
    longitude: (lonMin + lonMax) / 2,
  };
}

/**
 * The UTC hour at which this geohash is sampled, 0–23.
 *
 * Sampling the SAME hour every day keeps the semidiurnal atmospheric tide
 * (~1–2 hPa, a real periodic signal) out of the window's dispersion. Left in, it
 * inflates MAD and desensitizes every z-score computed against it.
 *
 * Deriving the hour from the geohash also spreads the global fleet's ingestion
 * evenly across the day instead of stampeding one cron minute.
 */
export function sampleHourForGeohash(geohash: string): number {
  // MUST stay byte-identical to the SQL in buildSelectGeohashesDueForSampling:
  //   MOD(ABS(('x' || SUBSTR(MD5(geohash5), 1, 8))::bit(32)::bigint), 24)
  //
  // Postgres casts bit(32) to bigint UNSIGNED, so the JavaScript equivalent is
  // parseInt of the first 8 hex digits — NOT `| 0`, which would sign-extend and
  // disagree on ~6 of every 7 cells.
  //
  // This function previously used a *31 charCode polynomial while the SQL used
  // MD5. [MEASURED 2026-08-01] the two disagreed for 297 of 306 geohashes
  // (97.1%, i.e. pure chance), which meant the cron woke a cell at one hour and
  // then tried to keep a reading from a different one. A test asserts the two
  // agree against a real PostgreSQL.
  const digest = createHash("md5").update(geohash).digest("hex").slice(0, 8);
  return parseInt(digest, 16) % 24;
}
