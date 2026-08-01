/**
 * ESMS token quantization — the RULED §6 contract (mainnet gate).
 *
 * 1 on-chain unit = 10⁻⁶ K-units ("micro-ESMS"). On-chain amounts are integers
 * only. `quantizeEsms` is the ONE quantization boundary per runtime — it is
 * applied once, at mint/settlement, to the FULL-PRECISION float64 K the engine
 * returns. Display roundings must never feed it (natal_alchemy's old
 * `round(…, 4)` was removed for exactly this reason).
 *
 * ── Rounding: floor, never round ────────────────────────────────────────────
 * A quantizer can only under-credit. This mirrors the mint-cost-pole rule
 * (PR #676): every economic error must favor the ledger, not the minter.
 *
 * ── Conservation ────────────────────────────────────────────────────────────
 * floor gives Σₖ q(Kₖ) ≤ q(ΣₖKₖ): a portfolio of parts can never quantize to
 * more than the whole. Pinned per golden chart by the conformance suites.
 *
 * ── Cross-runtime determinism ───────────────────────────────────────────────
 * TS and Python MUST produce byte-identical integers. MEASURED basis: over the
 * 20 golden charts all 80 unrounded K values are BIT-IDENTICAL across runtimes
 * (same summation order, IEEE-754 float64 in both), so `Math.floor(k * 1e6)`
 * and `math.floor(k * 1e6)` agree exactly. The fixture's `expected_micro`
 * integers are the shared witness; both conformance suites assert `===`.
 *
 * ── AMENDMENT to §6 rule 5 (idempotence), with its measurement ──────────────
 * The drafted pin `quantize(dequantize(q)) === q` is UNSATISFIABLE with pure
 * floor: `q / 1e6` is inexact in binary, and when it rounds low the EXACT
 * product `dequantize(q) · 10⁶` is already below q — so floor must lose a
 * micro. MEASURED: 1,478,721 of the 10⁸ integers in the reachable range
 * violate it (1.48%; first violator q = 249 → 248), identically in both
 * runtimes. This is floor-composition mathematics, not float noise, so no
 * implementation of float-dequantize can satisfy the drafted rule.
 *
 * The intent — no ledger information loss, no double-quantization drift — is
 * kept by construction instead:
 *   • there is NO float dequantize. `formatMicroEsms` renders an integer as its
 *     EXACT decimal K-string via integer math (q·10⁻⁶ is always exact in
 *     decimal), and `parseMicroEsms` inverts it exactly. Round-trip is
 *     lossless for every integer, pinned by test.
 *   • quantized integers therefore cannot re-enter the quantizer as floats;
 *     the negative control `floor((249/1e6)·1e6) === 248` is pinned in the
 *     conformance suites as the reason the door stays shut.
 */

/** RULED §6: 1 K-unit = 10⁶ micro-ESMS. */
export const MICRO_ESMS_PER_K = 1_000_000;

/**
 * Upper guard for a single coin's K. BASIS: the maximum reachable coin over the
 * golden set is 8.81 (chart_20, every body at its measured 2026 minimum
 * distance); 100 is more than an order of magnitude above any reachable K, so
 * crossing it is malformed input, not physics.
 */
export const ESMS_K_MAX = 100;

/**
 * THE quantization boundary: full-precision K → integer micro-ESMS, floor.
 * THROWS on malformed input rather than inventing an amount (§18k k7):
 * non-finite, negative, or beyond ESMS_K_MAX. Negative K is not mintable by
 * construction (sect allocations and weights are non-negative), so a negative
 * here means an upstream invariant broke.
 */
export function quantizeEsms(k: number): number {
  if (!Number.isFinite(k)) {
    throw new TypeError(`quantizeEsms: K must be finite, got ${String(k)}`);
  }
  if (k < 0) {
    throw new TypeError(`quantizeEsms: K must be non-negative, got ${k}`);
  }
  if (k > ESMS_K_MAX) {
    throw new TypeError(
      `quantizeEsms: K=${k} exceeds ESMS_K_MAX=${ESMS_K_MAX} — malformed input, not physics`,
    );
  }
  return Math.floor(k * MICRO_ESMS_PER_K);
}

/**
 * Exact decimal rendering of an integer micro-ESMS amount, via integer math
 * only — no float division, so no representation loss. `formatMicroEsms(249)`
 * is exactly "0.000249".
 */
export function formatMicroEsms(q: number): string {
  if (!Number.isSafeInteger(q) || q < 0) {
    throw new TypeError(`formatMicroEsms: expected a non-negative integer, got ${String(q)}`);
  }
  const whole = Math.floor(q / MICRO_ESMS_PER_K);
  const frac = q % MICRO_ESMS_PER_K;
  return `${whole}.${String(frac).padStart(6, "0")}`;
}

/**
 * Exact inverse of `formatMicroEsms` — integer parsing only.
 * `parseMicroEsms(formatMicroEsms(q)) === q` for every valid q, pinned by test.
 */
export function parseMicroEsms(s: string): number {
  const m = /^(\d+)\.(\d{6})$/.exec(s);
  if (!m) {
    throw new TypeError(`parseMicroEsms: expected "<int>.<6 digits>", got ${JSON.stringify(s)}`);
  }
  const q = Number(m[1]) * MICRO_ESMS_PER_K + Number(m[2]);
  if (!Number.isSafeInteger(q)) {
    throw new TypeError(`parseMicroEsms: ${JSON.stringify(s)} exceeds safe integer range`);
  }
  return q;
}
