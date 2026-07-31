/**
 * Recipe quantity parsing + the bounds a mintable quantity must satisfy.
 *
 * Extracted so the validator (`mintableRecipe.ts`) and the engine
 * (`fingerprint.ts`) share ONE definition of "what this string means". A second
 * copy in the validator would be the standard drift trap: the gate would accept
 * exactly the inputs the engine mis-reads.
 */

/**
 * Parse a recipe quantity string to a number.
 *
 * Handles mixed numbers ("1 1/2"), bare fractions ("3/4") and plain decimals.
 * Returns NaN for anything non-numeric ("to taste", "a splash") — that is a
 * SUPPORTED input, not an error: `estimateMass` deliberately falls back to a
 * nominal gram weight for it.
 *
 * ⚠️ `Number("") === 0`, and `Number.isFinite(0)` is true, so an empty string
 * parses to a legitimate-looking 0 rather than NaN. That is the single most
 * important behaviour here — see `QUANTITY_MIN`.
 */
export function parseAmount(raw: string): number {
  const s = raw.trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Smallest numeric quantity a mintable recipe may state.
 *
 * BASIS: chosen to sit far above the denormal range and far below any real
 * measure. The smallest unit in `PRECISE_UNITS` is a pinch at 0.5 g, so a
 * plausible smallest quantity is ~0.1 pinch = 5e-2; 1e-6 leaves six orders of
 * margin for exotic units while still rejecting the failure mode it exists for:
 * a denormal like `1e-320` is > 0 and finite, so it passes every naive guard,
 * but it drives `TARGET_ESMS / rawTotal` past `Number.MAX_VALUE` and the
 * normalisation scale becomes Infinity.
 */
export const QUANTITY_MIN = 1e-6;

/**
 * Largest numeric quantity a mintable recipe may state.
 *
 * BASIS: the largest multiplier any unit applies is 1000 (kg, l), so the
 * gram figure is at most 1e9 — nine orders below `Number.MAX_VALUE`, which
 * leaves the summation across ingredients no way to reach Infinity. It is also
 * absurdly generous as a recipe amount (1e6 kg). Rejects the measured overflow:
 * `1e308` is finite and passes `Number.isFinite`, but `1e308 * 1000` is
 * Infinity, which makes every ESMS total NaN.
 */
export const QUANTITY_MAX = 1e6;

export type QuantityRejection = "not_a_number" | "not_positive" | "too_small" | "too_large";

/**
 * Validate a quantity string for MINTING specifically.
 *
 * Returns null when acceptable. A non-numeric string is accepted (see
 * `parseAmount`); a numeric one must be strictly positive and within bounds.
 */
export function rejectMintQuantity(raw: string): QuantityRejection | null {
  const n = parseAmount(raw);
  // Non-numeric ("to taste") is fine — the engine assigns it a nominal mass.
  if (Number.isNaN(n)) return null;
  if (!Number.isFinite(n)) return "not_a_number";
  if (n <= 0) return "not_positive";
  if (n < QUANTITY_MIN) return "too_small";
  if (n > QUANTITY_MAX) return "too_large";
  return null;
}
