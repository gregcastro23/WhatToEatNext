/**
 * Birth-instant timezone resolution — the wall-clock ↔ absolute-instant boundary.
 *
 * ── THE DEBT THIS EXISTS TO PAY ─────────────────────────────────────────────
 *
 * `birthData.dateTime` holds the user's WALL-CLOCK birth time labelled `Z`. It is
 * built by `new Date(<datetime-local value>).toISOString()`, so "born 14:24 in
 * Brooklyn" is stored as `1991-06-23T14:24:00.000Z` — a string that claims to be
 * a UTC instant and is not one. The true instant is 18:24Z. Every stored chart
 * was therefore computed for a sky up to a full day-part away from the real one.
 *
 * `birthData.timezone` was supposed to carry the missing information but never
 * could, because the writers that produced it disagreed on format and none
 * validated:
 *
 *   - `geocodingService` emitted `Math.round(longitude / 15)` as `UTC±N` — not an
 *     IANA name at all, and DST-blind by construction.
 *   - `OnboardingWizard` took free text behind `z.string().min(1)`.
 *   - `/api/agent-forge/ignite` fell back to `"UTC"` (with a hardcoded NY pin)
 *     whenever geocoding failed.
 *
 * MEASURED against prod 2026-08-04, the whole population is 8 human rows (the
 * other 52 `birthData` rows are agent placeholders stamped
 * `1900-01-01T12:00:00.000Z`, which is a sentinel and not a birth):
 *
 *     America/New_York  ×6      UTC-5  ×2
 *
 * and BOTH spellings are wrong on rows that carry them:
 *
 *   - the 2 `UTC-5` rows are NY-metro coordinates born 1996-10-21 and
 *     2021-10-10 — both inside EDT, where the true offset is −4, not −5;
 *   - 1 of the 6 `America/New_York` rows carries coordinates 2.82, −60.67 —
 *     Boa Vista, Roraima, Brazil. A syntactically perfect IANA string on the
 *     wrong continent;
 *   - 2 more carry `40.7498, −73.7976` bit-exact, which is the `ignite` route's
 *     "Fallback NY" literal. Their birthplace was never geocoded at all, so
 *     their zone is not a user statement and they are NOT migratable.
 *
 * That leaves 6 rows with a defensible birthplace.
 *
 * ── THE RULING ──────────────────────────────────────────────────────────────
 *
 * RULED 2026-08-04: **coordinates win.** The zone is resolved from lat/lon via
 * `tz-lookup` (a raster of the official tz boundary shapefile), and the stored
 * string is demoted to a cross-check that is REPORTED, never applied. This is
 * the only basis that is right on all the rows that have a real pin; a
 * string→string mapping table would faithfully preserve both errors above.
 *
 * Basis: DERIVED — IANA zone from tz-lookup at the birth coordinates, then the
 * exact historical UTC offset from that zone's tzdata rules at the birth instant
 * via `Intl.DateTimeFormat.formatToParts`. No fixed-offset approximation is used
 * anywhere, which is what makes the EDT rows come out at −4.
 *
 * ⚠️ SECT DOES NOT MOVE WITH THE GEOMETRY. `isSectDiurnal` is a 06:00–18:00
 * window, i.e. a LOCAL-clock quantity. Feeding it the true UTC instant inverts
 * it: MEASURED, 6 of the 8 rows flip day↔night that way, which per
 * `isSectDiurnalForBirth`'s own docs swings the profile from ~32/49/9/9 to
 * ~14/16/47/22 and rewrites the archetype. Sect must keep reading the LOCAL WALL
 * CLOCK. Only the ephemeris query moves to the true instant.
 */

import tzLookup from "tz-lookup";
import { isIanaZone, parseRawOffsetMinutes } from "./ianaZone";

// Re-exported so server-side callers have a single import for the whole
// boundary. The primitives themselves live in `ianaZone.ts` because they need
// only `Intl`, and client components must be able to validate a zone without
// pulling tz-lookup's boundary raster into the browser bundle.
export {
  isIanaZone,
  parseRawOffsetMinutes,
  zoneOffsetMinutes,
  wallClockToInstant,
  instantToWallClock,
} from "./ianaZone";
export type { WallClockResolution, InstantResolution } from "./ianaZone";

/** How a zone was arrived at. Never fabricated — an unresolvable zone is `null`. */
export type ZoneBasis =
  /** DERIVED from birth coordinates via the tz boundary data. The normal path. */
  | "DERIVED_FROM_COORDINATES"
  /** The stored string, used only when coordinates are absent or unusable. */
  | "STORED_IANA_STRING"
  /** Nothing usable. Callers must degrade, not guess. */
  | "ABSENT";

export interface ResolvedZone {
  /** IANA zone name, or null when nothing defensible could be resolved. */
  zone: string | null;
  basis: ZoneBasis;
  /**
   * The raw stored `birthData.timezone`, preserved verbatim for auditing.
   * Never used to compute an offset when coordinates are available.
   */
  storedTimezone?: string;
  /**
   * True when `storedTimezone` is a valid IANA name that names a DIFFERENT zone
   * than the coordinates resolved to. The signal that a row's two fields
   * disagree about where the birth happened (e.g. the Boa Vista row).
   */
  storedDisagrees: boolean;
  /** True when `storedTimezone` is a `UTC±N` offset rather than an IANA name. */
  storedIsRawOffset: boolean;
}

/**
 * Resolve the IANA zone for a birth record.
 *
 * Coordinates win over the stored string — see the RULING above. The stored
 * string is still parsed and compared so that disagreements surface in the
 * migration report instead of being silently overwritten.
 */
export function resolveBirthZone(input: {
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}): ResolvedZone {
  const stored = typeof input.timezone === "string" ? input.timezone.trim() : "";
  const storedIsRawOffset = stored !== "" && parseRawOffsetMinutes(stored) !== null;
  const storedIsIana = stored !== "" && !storedIsRawOffset && isIanaZone(stored);

  const lat = input.latitude;
  const lon = input.longitude;
  const hasCoords =
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lon === "number" &&
    Number.isFinite(lon) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lon) <= 180;

  if (hasCoords) {
    let zone: string | null = null;
    try {
      zone = tzLookup(lat, lon);
    } catch {
      zone = null; // tz-lookup throws on out-of-range input; treated as unresolvable.
    }
    if (zone && isIanaZone(zone)) {
      return {
        zone,
        basis: "DERIVED_FROM_COORDINATES",
        storedTimezone: stored || undefined,
        storedDisagrees: storedIsIana && stored !== zone,
        storedIsRawOffset,
      };
    }
  }

  // No usable coordinates. A stored IANA name is better than nothing; a raw
  // `UTC±N` is NOT accepted as a substitute, because it is exactly the
  // DST-blind approximation this module exists to retire.
  if (storedIsIana) {
    return {
      zone: stored,
      basis: "STORED_IANA_STRING",
      storedTimezone: stored,
      storedDisagrees: false,
      storedIsRawOffset: false,
    };
  }

  return {
    zone: null,
    basis: "ABSENT",
    storedTimezone: stored || undefined,
    storedDisagrees: false,
    storedIsRawOffset,
  };
}

/**
 * The `ignite` route's retired "Fallback NY" pin. Rows carrying it bit-exact
 * never had their birthplace geocoded, so their coordinates — and every zone
 * derived from them — are fabrications rather than anything the user supplied.
 *
 * Kept as a named constant so the migration can refuse those rows explicitly
 * instead of confidently re-dating a chart from a literal.
 */
export const IGNITE_FALLBACK_PIN = { latitude: 40.7498, longitude: -73.7976 } as const;

/** True when this pin is the retired `ignite` fallback rather than a real place. */
export function isFabricatedFallbackPin(latitude: number, longitude: number): boolean {
  return (
    latitude === IGNITE_FALLBACK_PIN.latitude && longitude === IGNITE_FALLBACK_PIN.longitude
  );
}
