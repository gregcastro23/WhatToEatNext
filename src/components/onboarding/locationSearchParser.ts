/**
 * Wire parser for `GET /api/geocoding?q=` as `LocationSearch` reads it.
 *
 * Producer: `src/app/api/geocoding/route.ts`.
 *   - success is `{ success: true, results }` (route.ts:35-38); every refusal is
 *     `{ success: false, message }` with a 400 or 500 (route.ts:24-30, 41-47).
 *     `LocationSearch` throws on `!response.ok` before it parses, so a refusal
 *     only reaches this parser if a 2xx ever carries `success: false`.
 *   - each row is built in `src/services/geocodingService.ts:100-112`:
 *     `displayName`, `latitude`/`longitude` (`parseFloat`, which JSON turns into
 *     `null` for a NaN), `type`, `timezone` (`string | null`, never omitted) and
 *     `country`. `country` is read from Nominatim's `address.country`, and `type`
 *     is passed straight through from the third-party row (geocodingService.ts:103);
 *     the service's own type declares both but cannot guarantee them (a missing
 *     value leaves the key out of the JSON). `LocationSearch` never reads
 *     `country` and shows `type` only when it is present (`result.type && ...`),
 *     so both are optional here and a row is not dropped for lacking either.
 *
 * Failure contract (inside `performSearch`'s existing try/catch):
 *   - a body that is not a JSON object THROWS, as the old `data.success` access
 *     on `null` did;
 *   - `success` of the wrong type reads as absent (the caller then shows nothing);
 *   - with `success: true`, a missing / non-array `results` THROWS; a row that
 *     does not match is dropped, but if rows arrived and NONE matched that
 *     throws too, so schema drift is not shown as "no matches".
 *
 * Client-safe: the only non-type import is `@/lib/api/json`; the service import
 * is `import type` and is erased.
 *
 * @file src/components/onboarding/locationSearchParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";
import type { GeocodingResult } from "@/services/geocodingService";

export type LocationSearchResult = Omit<GeocodingResult, "country" | "type"> & {
  country?: string;
  type?: string;
};

export interface LocationSearchResponse {
  success?: boolean;
  results?: LocationSearchResult[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** A row in the producer's shape, or `undefined` when a required field is mistyped. */
function parseRow(value: unknown): LocationSearchResult | undefined {
  if (!isJsonRecord(value)) return undefined;
  const { displayName, latitude, longitude, type, country, timezone } = value;
  if (typeof displayName !== "string") return undefined;
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) return undefined;
  if (timezone !== null && typeof timezone !== "string") return undefined;
  return {
    displayName,
    latitude,
    longitude,
    timezone,
    ...(typeof type === "string" ? { type } : {}),
    ...(typeof country === "string" ? { country } : {}),
  };
}

function parseRows(raw: unknown): LocationSearchResult[] {
  if (!Array.isArray(raw)) {
    throw new TypeError("Location search response had no results array");
  }
  const list: readonly unknown[] = raw;
  const rows: LocationSearchResult[] = [];
  for (const item of list) {
    const row = parseRow(item);
    if (row) rows.push(row);
  }
  if (list.length > 0 && rows.length === 0) {
    throw new TypeError("No location search result matched the expected shape");
  }
  return rows;
}

/** `parse` for `readJson`. */
export function parseLocationSearchResponse(value: unknown): LocationSearchResponse {
  if (!isJsonRecord(value)) {
    throw new TypeError("Location search response was not a JSON object");
  }
  const { success, results } = value;
  if (success !== true) return typeof success === "boolean" ? { success } : {};
  return { success, results: parseRows(results) };
}
