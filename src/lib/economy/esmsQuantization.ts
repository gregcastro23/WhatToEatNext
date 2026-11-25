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

// ── Ledger claim-bridge quantization (DECIMAL(12, 4) → on-chain 18-dp) ────────
// Off-chain Postgres balances accumulate across sessions (`token_balances` is
// DECIMAL(12, 4), reaching > 100 K-units in prod), so the claim bridge cannot
// apply single-chart `ESMS_K_MAX = 100`. It uses the same §6 discipline instead:
// floor-never-round, fail-closed on malformed values, integer-math decimal
// formatting, and never re-quantizing already-stored claim amounts on retry.

/** Off-chain Postgres ledger precision (`DECIMAL(12, 4)`): 1 token = 10⁴ ledger units. */
export const LEDGER_ESMS_SCALE = 10_000;

/** Exact maximum value representable in Postgres `DECIMAL(12, 4)` (8 integer + 4 decimal digits). */
export const LEDGER_ESMS_MAX = 99_999_999.9999;

const LEDGER_ESMS_MAX_UNITS = 999_999_999_999;

export interface EsmsTokenQuad {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface EsmsDecimalQuad {
  spirit: string;
  essence: string;
  matter: string;
  substance: string;
}

export interface QuantizedClaimAmounts {
  units: EsmsTokenQuad;
  decimalStrings: EsmsDecimalQuad;
  numericAmounts: EsmsTokenQuad;
  totalUnits: number;
}

/**
 * Quantize a cumulative off-chain ESMS balance to integer `10⁻⁴` ledger units,
 * flooring so the bridge never mints or debits more than the user holds.
 */
export function quantizeLedgerEsms(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new TypeError(`quantizeLedgerEsms: amount must be finite, got ${String(amount)}`);
  }
  if (amount < 0) {
    throw new TypeError(`quantizeLedgerEsms: amount must be non-negative, got ${amount}`);
  }
  if (amount > LEDGER_ESMS_MAX) {
    throw new TypeError(
      `quantizeLedgerEsms: amount=${amount} exceeds LEDGER_ESMS_MAX=${LEDGER_ESMS_MAX}`,
    );
  }
  return Math.floor(amount * LEDGER_ESMS_SCALE);
}

/**
 * Exact 4-dp decimal string from integer `10⁻⁴` ledger units via integer math
 * only — no scientific notation and directly safe for `viem` `parseUnits(v, 18)`.
 */
export function formatLedgerEsms(units: number): string {
  if (!Number.isSafeInteger(units) || units < 0 || units > LEDGER_ESMS_MAX_UNITS) {
    throw new TypeError(
      `formatLedgerEsms: expected non-negative ledger units <= ${LEDGER_ESMS_MAX_UNITS}, got ${String(units)}`,
    );
  }
  const whole = Math.floor(units / LEDGER_ESMS_SCALE);
  const frac = units % LEDGER_ESMS_SCALE;
  return `${whole}.${String(frac).padStart(4, "0")}`;
}

/** Parse a canonical decimal string (`<int>` or `<int>.<1..4 digits>`) to integer ledger units. */
export function parseLedgerEsms(s: string): number {
  const m = /^(\d+)(?:\.(\d{1,4}))?$/.exec(s);
  if (!m) {
    throw new TypeError(`parseLedgerEsms: expected "<int>[.<1..4 digits>]", got ${JSON.stringify(s)}`);
  }
  const frac4 = (m[2] ?? "").padEnd(4, "0");
  const units = Number(m[1]) * LEDGER_ESMS_SCALE + Number(frac4);
  if (!Number.isSafeInteger(units) || units > LEDGER_ESMS_MAX_UNITS) {
    throw new TypeError(`parseLedgerEsms: ${JSON.stringify(s)} exceeds DECIMAL(12, 4) range`);
  }
  return units;
}

/**
 * Format an already-quantized `DECIMAL(12, 4)` claim amount for mint retries and
 * reconciliation without re-entering `Math.floor(n * 10_000)`.
 */
export function formatStoredLedgerEsms(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new TypeError(`formatStoredLedgerEsms: amount must be finite, got ${String(amount)}`);
  }
  if (amount < 0) {
    throw new TypeError(`formatStoredLedgerEsms: amount must be non-negative, got ${amount}`);
  }
  if (amount > LEDGER_ESMS_MAX) {
    throw new TypeError(
      `formatStoredLedgerEsms: amount=${amount} exceeds LEDGER_ESMS_MAX=${LEDGER_ESMS_MAX}`,
    );
  }
  return formatLedgerEsms(parseLedgerEsms(amount.toFixed(4)));
}

/** Quantize all four ESMS axes once at the off-chain → on-chain claim boundary. */
export function quantizeClaimAmounts(balances: EsmsTokenQuad): QuantizedClaimAmounts {
  const units: EsmsTokenQuad = {
    spirit: quantizeLedgerEsms(balances.spirit),
    essence: quantizeLedgerEsms(balances.essence),
    matter: quantizeLedgerEsms(balances.matter),
    substance: quantizeLedgerEsms(balances.substance),
  };
  const decimalStrings: EsmsDecimalQuad = {
    spirit: formatLedgerEsms(units.spirit),
    essence: formatLedgerEsms(units.essence),
    matter: formatLedgerEsms(units.matter),
    substance: formatLedgerEsms(units.substance),
  };
  const numericAmounts: EsmsTokenQuad = {
    spirit: Number(decimalStrings.spirit),
    essence: Number(decimalStrings.essence),
    matter: Number(decimalStrings.matter),
    substance: Number(decimalStrings.substance),
  };
  const totalUnits = units.spirit + units.essence + units.matter + units.substance;
  return { units, decimalStrings, numericAmounts, totalUnits };
}
