/**
 * Table venue geocoding helper (PR 6, docs/plans/pr6-discovery-mobile-plan.md
 * §1). Shared by POST /api/tables and PATCH /api/tables/[tableId].
 *
 * PRIVACY INVARIANT: a home venue NEVER carries coordinates. For a
 * restaurant/other venue with an address but no client-supplied coords, a
 * best-effort server-side geocode runs — failure-tolerant (coords stay null,
 * the table still saves).
 *
 * @file src/lib/tables/venueGeo.ts
 */

import { geocodeLocation } from "@/services/geocodingService";

export interface ResolvedVenueCoords {
  venueLat: number | null;
  venueLng: number | null;
}

/**
 * Resolve discovery coordinates for a table venue. Returns `null` when a home
 * venue was given coordinates (the caller rejects the request); otherwise
 * returns the coords to persist (possibly {null, null}).
 */
export async function resolveVenueCoords(
  venue: { type: string; address?: string },
  venueLat?: number,
  venueLng?: number,
): Promise<ResolvedVenueCoords | null> {
  if (venue.type === "home") {
    if (venueLat != null || venueLng != null) return null; // reject — home never geocoded
    return { venueLat: null, venueLng: null };
  }
  if (venueLat != null && venueLng != null) {
    return { venueLat, venueLng };
  }
  if (venue.address && venue.address.trim().length >= 2) {
    try {
      const results = await geocodeLocation(venue.address);
      const best = results[0];
      if (best && Number.isFinite(best.latitude) && Number.isFinite(best.longitude)) {
        return { venueLat: best.latitude, venueLng: best.longitude };
      }
    } catch {
      // Geocode failed — coords stay null, table still saves.
    }
  }
  return { venueLat: null, venueLng: null };
}
