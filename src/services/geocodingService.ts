/**
 * Geocoding Service
 * Converts location names (city, address) to latitude/longitude coordinates
 * Uses OpenStreetMap's Nominatim API (free, no API key required)
 */

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
        const primary = parts[0];
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
