/**
 * Geocoding Service
 * Converts location names (city, address) to latitude/longitude coordinates
 * Uses OpenStreetMap's Nominatim API (free, no API key required)
 */

import type { ParsedPostalCode, PostalFormat } from "@/lib/location/postalCode";
import { _logger } from "@/lib/logger";
import { resolveBirthZone } from "@/utils/astrology/birthTimezone";

export interface GeocodingResult {
  displayName: string;
  latitude: number;
  longitude: number;
  type: string; // city, town, village, etc.
  country: string;
  /**
   * IANA zone name for these coordinates, e.g. "America/New_York", or null when
   * the pin resolves to no zone. Basis: DERIVED — tz boundary data at lat/lon.
   *
   * Renamed from `estimatedTimezone`, which held a `UTC±N` longitude estimate.
   * The rename is deliberate: the old field's values are not valid inputs to the
   * new one, so any reader still expecting the old shape must fail to compile
   * rather than silently receive an IANA name where it wanted an offset.
   */
  timezone: string | null;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    country: string;
    [key: string]: string | undefined;
  };
}

const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Search for locations by name
 * Returns up to 5 results
 */
export async function geocodeLocation(
  locationName: string,
): Promise<GeocodingResult[]> {
  try {
    if (!locationName || locationName.trim().length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      q: locationName,
      format: "json",
      limit: "10", // fetch slightly more to allow for deduping
      addressdetails: "1",
    });

    const response = await fetch(`${NOMINATIM_API_URL}?${params.toString()}`, {
      headers: {
        "User-Agent": "WhatToEatNext/1.0 (cookingwithcastrollc@gmail.com)", // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data: NominatimResult[] = await response.json();

    const uniqueResults: GeocodingResult[] = [];
    const seen = new Set<string>();

    for (const result of data) {
      const { primary, secondary } = (() => {
        // Simple distinct location key creation based on displayName primary/secondary
        const parts = result.display_name.split(",").map((p) => p.trim());
        if (parts.length <= 2) {
          return { primary: parts[0], secondary: parts.slice(1).join(", ") };
        }
        const [primary] = parts;
        const secondary = [parts[1], parts[parts.length - 1]].filter(Boolean).join(", ");
        return { primary, secondary };
      })();

      const dedupKey = `${primary}-${secondary}`;
      if (!seen.has(dedupKey)) {
        seen.add(dedupKey);
        
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        uniqueResults.push({
          displayName: result.display_name,
          latitude: lat,
          longitude: lon,
          type: result.type,
          country: result.address.country,
          // Resolved from the tz boundary data, NOT from `Math.round(lon / 15)`.
          // The longitude estimate this replaces was DST-blind and never emitted
          // an IANA name at all, so it could not be used to date a birth chart —
          // see `resolveBirthZone`'s docs for the two classes of error it caused
          // in prod. `null` when the pin resolves to no zone; never fabricated.
          timezone: resolveBirthZone({ latitude: lat, longitude: lon }).zone,
        });

        if (uniqueResults.length >= 5) break; // Limit to 5 unique results
      }
    }

    return uniqueResults;
  } catch (error) {
    _logger.error("Geocoding error:", error);
    throw new Error("Failed to geocode location", { cause: error });
  }
}

/**
 * A postal code resolved to a coordinate.
 *
 * ⚠️ NOTE WHAT IS ABSENT: there is no accuracy radius. The geocoder's bounding
 * box for a postal result is a fixed-size synthetic box, measured identical for
 * a 2 km² and a 5,000 km² code — see `POSTAL_CENTROID_CAVEAT` for the numbers.
 * A surface that needs to tell the user how precise this is must say what it is
 * (a code-area centre point) rather than print a fabricated distance.
 */
export interface PostalCodeResolution {
  /** The code as queried, normalised. */
  postalCode: string;
  /** ISO-3166-1 alpha-2 country the pattern identified. */
  country: string;
  format: PostalFormat;
  /** Full geocoder display name. */
  displayName: string;
  /**
   * Town / city the code sits in, or `null` when the geocoder resolved none.
   *
   * ⚠️ `null` IS A QUALITY SIGNAL, NOT A COSMETIC GAP. `[MEASURED 2026-08-17]`
   * US ZIP `96950` (Saipan, Northern Mariana Islands) resolves to 17.436N
   * 130.039E — open water in the Philippine Sea, roughly 500 km from the real
   * place — and its display name is the bare `"96950, United States"` with no
   * locality at all. The missing locality is the only cheap tell that the pin
   * is junk, so it is surfaced rather than smoothed over: a caller showing a
   * confirmed town lets the user catch a wrong pin, and a caller with no town
   * must say so instead of implying the match was verified.
   */
  locality: string | null;
  latitude: number;
  longitude: number;
}

/**
 * The postal response as it actually arrives.
 *
 * Deliberately NOT `NominatimResult`: that interface declares `address` as
 * always present with a required `country`, which does not hold for sparse
 * postal entries (the `96950` case documented above carries no locality keys at
 * all). Reusing it would let this function index a possibly-absent object under
 * a type that promises it is there.
 */
interface NominatimPostalResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string | undefined>;
}

/** Locality-bearing keys in a Nominatim address, most specific first. */
const LOCALITY_KEYS = [
  "city",
  "town",
  "village",
  "hamlet",
  "municipality",
  "suburb",
  "county",
] as const;

/**
 * Resolve a parsed postal code to a coordinate via Nominatim's STRUCTURED
 * query.
 *
 * Structured (`postalcode=` + `country=`), never free text: the free-text form
 * of a bare code matches four countries — see `parsePostalCode`'s header for the
 * measured result. `null` when the code does not resolve; callers must not
 * substitute a nearby guess.
 */
export async function resolvePostalCode(
  parsed: ParsedPostalCode,
): Promise<PostalCodeResolution | null> {
  const params = new URLSearchParams({
    postalcode: parsed.code,
    country: parsed.country,
    format: "json",
    addressdetails: "1",
    limit: "1",
  });

  const response = await fetch(`${NOMINATIM_API_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": "WhatToEatNext/1.0 (cookingwithcastrollc@gmail.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding API returned ${response.status}`);
  }

  const data = (await response.json()) as NominatimPostalResult[];
  const [first] = data;
  if (!first) return null;

  const latitude = parseFloat(first.lat);
  const longitude = parseFloat(first.lon);
  // A code that resolves to an unparseable coordinate is a failed resolution,
  // not a resolution to 0,0 — which is a real place in the Gulf of Guinea.
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const address = first.address ?? {};
  const locality =
    LOCALITY_KEYS.map((key) => address[key])
      .find((value): value is string => typeof value === "string" && value.trim().length > 0)
      ?.trim() ?? null;

  return {
    postalCode: parsed.code,
    country: parsed.country,
    format: parsed.format,
    displayName: first.display_name,
    locality,
    latitude,
    longitude,
  };
}

/**
 * Get a single best match for a location
 */
export async function geocodeLocationSingle(
  locationName: string,
): Promise<GeocodingResult | null> {
  const results = await geocodeLocation(locationName);
  return results.length > 0 ? results[0] : null;
}

/**
 * Reverse geocode: get location name from coordinates
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: "json",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          "User-Agent": "WhatToEatNext/1.0",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding API returned ${response.status}`);
    }

    const data = await response.json();
    return data.display_name || null;
  } catch (error) {
    _logger.error("Reverse geocoding error:", error);
    return null;
  }
}
