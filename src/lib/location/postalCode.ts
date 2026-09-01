/**
 * Postal-code recognition — decides whether a typed location is a postal code
 * and, if so, which country's pattern it is.
 *
 * ── Why a pattern gate at all ───────────────────────────────────────────────
 *
 * A bare code is globally ambiguous. `[MEASURED 2026-08-17]` Querying Nominatim
 * for postal code `80202` with no country returns FOUR places:
 *
 *   80202, Bubiai, Šiaulių rajono savivaldybė, Lithuania    55.855, 23.130
 *   80202, Priluka, Grad Livno, Bosnia and Herzegovina      43.872, 16.920
 *   80202, Denver, Colorado, United States                  39.751, -104.997
 *   80202, Kenya                                            -3.349, 40.030
 *
 * So the country is not optional garnish — it is the difference between Denver
 * and the Kenyan coast. Every code this module accepts therefore carries the
 * country its pattern identifies, and that attribution is the pattern itself:
 * reproducible, not inferred from the user's IP or locale.
 *
 * ── Why only three countries ────────────────────────────────────────────────
 *
 * Each pattern below was verified against the live geocoder before being
 * claimed here (see `format` docs for the probe result). A bare four-digit code
 * — the shape used by dozens of countries from Austria to South Africa — is
 * deliberately NOT recognised: nothing in the string identifies which country
 * it belongs to, and guessing one would put a cook on the wrong continent.
 * Unrecognised input is not an error; it falls through to the free-text place
 * search, which handles city names, addresses, and codes typed with a country.
 *
 * @file src/lib/location/postalCode.ts
 */

/** Which pattern matched. The basis for the country attribution. */
export type PostalFormat = "us-zip" | "ca-postal" | "uk-postcode";

export interface ParsedPostalCode {
  /** Code normalised to the form the geocoder indexes. */
  code: string;
  /** ISO-3166-1 alpha-2, lowercase, identified by the pattern. */
  country: string;
  format: PostalFormat;
}

/**
 * US ZIP, with or without the +4 add-on.
 *
 * ⚠️ The +4 is DISCARDED, and that loses nothing *here* while looking like it
 * loses something. `[MEASURED 2026-08-17]` `postalcode=80202-1234&country=us`
 * and `postalcode=80202&country=us` return the identical centroid — the
 * geocoder indexes 5-digit codes only. A real ZIP+4 does identify a block face,
 * so the precision exists in the world; it simply is not reachable through this
 * geocoder. Normalising makes the two spellings produce one deterministic
 * result instead of two that only happen to agree.
 */
const US_ZIP = /^(\d{5})(?:-\d{4})?$/;

/**
 * Canadian postal code, `A1A 1A1`. The space is optional on input.
 *
 * `[MEASURED 2026-08-17]` `M5V 3L9` → 43.6421, -79.3853 (Toronto, CN Tower
 * block). A *partial* code (forward sortation area alone, `M5V`) returns ZERO
 * results, so the full six characters are required — a truncated code must fall
 * through to free text rather than resolve to nothing.
 */
const CA_POSTAL = /^([A-Za-z]\d[A-Za-z])\s?(\d[A-Za-z]\d)$/;

/**
 * UK postcode, `AA1A 1AA` and its shorter variants.
 *
 * `[MEASURED 2026-08-17]` `SW1A 1AA` → 51.5013, -0.1418 (City of Westminster).
 *
 * Cannot collide with {@link CA_POSTAL}: a UK inward code always ends in two
 * letters, a Canadian one always ends in a digit.
 */
const UK_POSTCODE = /^([A-Za-z]{1,2}\d[A-Za-z\d]?)\s?(\d[A-Za-z]{2})$/;

/**
 * Recognise a postal code and the country its pattern identifies.
 *
 * @returns the parsed code, or `null` when the input is not a postal code this
 * module can attribute to a country — in which case the caller should treat the
 * input as free text rather than fabricating a country for it.
 */
export function parsePostalCode(raw: string): ParsedPostalCode | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const [, usCode] = US_ZIP.exec(trimmed) ?? [];
  if (usCode !== undefined) return { code: usCode, country: "us", format: "us-zip" };

  // Canada before the UK: the patterns are disjoint, but checking the stricter
  // shape first keeps the precedence explicit rather than incidental.
  const [, caOut, caIn] = CA_POSTAL.exec(trimmed) ?? [];
  if (caOut !== undefined && caIn !== undefined) {
    return {
      code: `${caOut.toUpperCase()} ${caIn.toUpperCase()}`,
      country: "ca",
      format: "ca-postal",
    };
  }

  const [, ukOut, ukIn] = UK_POSTCODE.exec(trimmed) ?? [];
  if (ukOut !== undefined && ukIn !== undefined) {
    return {
      code: `${ukOut.toUpperCase()} ${ukIn.toUpperCase()}`,
      country: "gb",
      format: "uk-postcode",
    };
  }

  return null;
}

/**
 * Human-readable name for a format, for UI that must state where a coordinate
 * came from. Deliberately says "code", not "address": see
 * {@link POSTAL_CENTROID_CAVEAT}.
 */
export const POSTAL_FORMAT_LABEL: Readonly<Record<PostalFormat, string>> = {
  "us-zip": "ZIP code",
  "ca-postal": "postal code",
  "uk-postcode": "postcode",
};

/**
 * The one sentence any surface must be able to say about a postal-derived
 * coordinate.
 *
 * ⚠️ THERE IS NO RADIUS TO GO WITH IT, AND THAT IS A MEASUREMENT, NOT AN
 * OVERSIGHT.
 *
 * `[MEASURED 2026-08-17]` The geocoder returns a bounding box with every postal
 * result, and it is SYNTHETIC — a fixed ~0.090° × ~0.115° box drawn around a
 * point, identical for every code regardless of the real area:
 *
 *   10001 (Manhattan, ~2 km²)      latSpan 0.090072°  lonSpan 0.118436°
 *   89049 (Nye County NV, ~5000 km²) latSpan 0.090127°  lonSpan 0.114032°
 *
 * Those two differ in true extent by three orders of magnitude and by 0.00006°
 * in what the geocoder reports. Deriving "±5 km" from that box would print a
 * confident error bar whose basis is a constant, so this module publishes no
 * radius at all and the UI states the basis in words instead.
 */
export const POSTAL_CENTROID_CAVEAT =
  "a centre point for the code's area, not your street address";
