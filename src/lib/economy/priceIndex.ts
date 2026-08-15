/**
 * The Elemental Exchange Index — deterministic per-token price oracle (ADR-011).
 *
 * One number per ESMS token: the cost multiplier the market as a whole faces,
 * defined as `getPersonalizedPricingContext` evaluated at a natal chart equal
 * to the uniform baseline. Substituting `natal_q = BASELINE_WEIGHT` into
 * livePricing's affinity `(natal_q + w_q)/2 − BASELINE_WEIGHT` gives
 * `(w_q − BASELINE_WEIGHT)/2`, so:
 *
 *   EEI_q(t) = clamp( m(t) · (1 − (PERSONALIZATION_SCALE/2) · (w_q(t) − BASELINE_WEIGHT)),
 *                     PER_TOKEN_MIN, PER_TOKEN_MAX )
 *
 * Every constant is IMPORTED from livePricing — the module that actually
 * charges — never copied. Polarity is the swap-engine ruling: a token the
 * current sky emits heavily is abundant, so its index sits below the global
 * multiplier.
 *
 * Determinism contract:
 *  - All samples (current quote, t−24h reference, sparkline) come from ONE
 *    engine: the local astronomy-engine positions util. The live debit path's
 *    position source is remote-first and not reproducible; `basis.engine`
 *    names the difference.
 *  - Time is quantized to ORACLE_BUCKET_MS buckets and the snapshot is a pure
 *    function of the bucket instant, so horizontally-scaled instances return
 *    identical payloads within a bucket.
 *  - History is recomputation, never storage and never synthesis. The 24h
 *    change is the same formula at t−24h; the sparkline is the same formula
 *    at 25 hourly buckets. A flat sky honestly shows 0.00%.
 *  - On engine failure this module THROWS. The route maps that to
 *    `live: false` with no token values — a broken engine must never quote.
 *
 * The oracle prices the ten ESMS bodies with no Ascendant vessel (the
 * esmsOscillator's OSCILLATOR_BODIES precedent: the Ascendant is an
 * observer-local 24h rotation, not a sky fact) and is distance-flat, matching
 * what the live economy paths themselves price with today (ADR-011 §3).
 */

import { alchemize, type PlanetaryPosition } from "@/services/RealAlchemizeService";
import type { DegradedInfo } from "@/types/degraded";
import type { TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";
import {
  getAccuratePlanetaryPositionsWithMeta,
  type PlanetPositionData,
} from "@/utils/astrology/positions";
import {
  BASELINE_WEIGHT,
  PER_TOKEN_MAX,
  PER_TOKEN_MIN,
  PERSONALIZATION_SCALE,
  globalMultiplierForANumber,
  isPricedBody,
} from "./livePricing";

/** Snapshot granularity. One minute: below display resolution for the fastest
 *  mover (the Moon drifts ~0.009°/min), above any burst of client polls. */
export const ORACLE_BUCKET_MS = 60_000;

/** The 24h window is sampled hourly, endpoints inclusive → 25 points. */
export const SPARKLINE_HOURS = 24;
export const SPARKLINE_POINTS = SPARKLINE_HOURS + 1;

export const INDEX_ROUND_DIGITS = 4;

export type CoinKey = "spirit" | "essence" | "matter" | "substance";

export interface TokenIndexQuote {
  token: TokenType;
  /** EEI in index points; 1.0000 = calm balanced sky (A at its center). */
  index: number;
  /** Real recomputation at t−24h — same formula, same engine. */
  change24hPct: number;
  /** Normalized current-sky ESMS share (sums to 1 across tokens). */
  weight: number;
  /** SPARKLINE_POINTS hourly values of THE SAME index, oldest → newest. */
  sparkline: number[];
}

export interface PriceIndexSnapshot {
  /** Start of the minute bucket this snapshot is pinned to (UTC ISO). */
  bucketStartUtc: string;
  aNumber: number;
  multiplier: number;
  dominantElement: string;
  sunSign: string;
  isDiurnal: boolean;
  tokens: TokenIndexQuote[];
  /** mean(EEI) — moves with the A-number by construction (never constant). */
  compositeIndex: number;
  composite24hPct: number;
  /** Union of degrade reasons across all samples; null when fully live. */
  degraded: string[] | null;
  basis: {
    model: string;
    engine: string;
    constants: string;
  };
}

/** Per-axis circulating supply as served beside the quotes (route-attached). */
export interface EsmsSupplyBlock {
  live: boolean;
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

/**
 * The wire shape GET /api/economy/price-index serves — the one authority for
 * both the route (produces) and the ticker client (consumes, type-only
 * import so no server code reaches the browser bundle).
 */
export interface PriceIndexApiPayload extends PriceIndexSnapshot {
  success: true;
  live: true;
  generatedAt: string;
  railsUsd: import("./usdRails").UsdRails;
  supply: EsmsSupplyBlock;
}

/** Positions at an instant plus the util's own honesty metadata. */
export type PositionsProvider = (date: Date) => {
  positions: Record<string, PlanetPositionData>;
  degraded: DegradedInfo | null;
};

const defaultProvider: PositionsProvider = (date) =>
  getAccuratePlanetaryPositionsWithMeta(date);

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Same adapter shape celestial.ts/livePricing.ts feed the engine.
 *
 * The parameter is `Partial<PlanetPositionData>` on purpose. `PlanetPositionData`
 * declares every field required, but this adapter sits on a boundary: the
 * positions arrive from an ephemeris provider, and in the sibling debit path
 * from a remote HTTP backend, so the interface is a *claim* about that data
 * rather than a guarantee. Typing the input as complete would make the `??`
 * guards below provably dead code — which is exactly what the linter reported
 * — and deleting them would trade a real runtime guard for a compile-time
 * fiction. Widening the parameter keeps the guards live and makes the type
 * tell the truth: fields may be missing.
 */
function asPlanetaryPositions(
  positions: Record<string, Partial<PlanetPositionData>>,
): Record<string, PlanetaryPosition> {
  const normalized: Record<string, PlanetaryPosition> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    // The oracle's local source happens not to return an Ascendant today, so
    // this is a no-op here — which is exactly why it belongs: the ten-body
    // claim in this module's header is now enforced, not merely true by
    // accident of which util answered. See PRICED_BODIES (ADR-012).
    if (!isPricedBody(planet)) continue;
    normalized[planet] = {
      sign: String(pos.sign ?? "").toLowerCase(),
      degree: Number(pos.degree ?? 0),
      minute: 0,
      isRetrograde: Boolean(pos.isRetrograde),
      // Aspects need real angular separations; this is what makes the index
      // move WITHIN signs rather than only at ingresses.
      exactLongitude:
        typeof pos.exactLongitude === "number" ? pos.exactLongitude : undefined,
    };
  }
  return normalized;
}

interface SkySample {
  eei: Record<TokenType, number>;
  weights: Record<TokenType, number>;
  aNumber: number;
  multiplier: number;
  dominantElement: string;
  sunSign: string;
  isDiurnal: boolean;
  degradedReasons: string[];
}

/**
 * One sky sample: canonical alchemize → weights → EEI. Throws on a
 * non-positive ESMS total — with ten gated bodies and non-negative weights
 * that is unreachable from a healthy engine, so it means the engine broke,
 * and a broken engine must never price (the prototype's `$1.0000` fallback
 * is the defect class this throw exists to make inexpressible).
 */
export function computeSkySample(
  positions: Record<string, PlanetPositionData>,
  date: Date,
  incomingDegraded: DegradedInfo | null = null,
): SkySample {
  const alch = alchemize(asPlanetaryPositions(positions), null, date, {
    incomingDegraded,
  });
  const esms = {
    Spirit: Number(alch.esms.Spirit || 0),
    Essence: Number(alch.esms.Essence || 0),
    Matter: Number(alch.esms.Matter || 0),
    Substance: Number(alch.esms.Substance || 0),
  };
  const total = esms.Spirit + esms.Essence + esms.Matter + esms.Substance;
  if (!(total > 0) || !Number.isFinite(total)) {
    throw new Error(
      `price-index: engine returned unusable ESMS total ${String(total)}`,
    );
  }

  const multiplier = globalMultiplierForANumber(total);
  const weights = {} as Record<TokenType, number>;
  const eei = {} as Record<TokenType, number>;
  for (const token of TOKEN_TYPES) {
    const w = esms[token] / total;
    weights[token] = w;
    // The neutral participant's affinity is (BASELINE + w)/2 − BASELINE
    // = (w − BASELINE)/2; the rest is livePricing's per-token formula.
    const neutralAffinity = (w - BASELINE_WEIGHT) / 2;
    eei[token] = round(
      clamp(
        multiplier * (1 - PERSONALIZATION_SCALE * neutralAffinity),
        PER_TOKEN_MIN,
        PER_TOKEN_MAX,
      ),
      INDEX_ROUND_DIGITS,
    );
  }

  return {
    eei,
    weights,
    aNumber: round(total, 4),
    multiplier: round(multiplier, 4),
    dominantElement: alch.metadata.dominantElement,
    sunSign: alch.metadata.sunSign,
    isDiurnal: alch.metadata.isDiurnal,
    degradedReasons: alch.degraded?.reasons ? [...alch.degraded.reasons] : [],
  };
}

/**
 * The full snapshot for the bucket containing `at`. Pure in
 * (bucket(at), provider): replaying the same bucket always rebuilds the same
 * payload. Samples run oldest → newest so the positions util's module cache
 * ends the pass holding "now" for other callers.
 */
export function buildPriceIndexSnapshot(
  at: Date,
  provider: PositionsProvider = defaultProvider,
): PriceIndexSnapshot {
  const bucketMs = Math.floor(at.getTime() / ORACLE_BUCKET_MS) * ORACLE_BUCKET_MS;

  const samples: SkySample[] = [];
  for (let h = SPARKLINE_HOURS; h >= 0; h--) {
    const sampleDate = new Date(bucketMs - h * 3_600_000);
    const { positions, degraded } = provider(sampleDate);
    samples.push(computeSkySample(positions, sampleDate, degraded));
  }

  const now = samples[samples.length - 1];
  const [dayAgo] = samples;

  const tokens: TokenIndexQuote[] = TOKEN_TYPES.map((token) => ({
    token,
    index: now.eei[token],
    change24hPct: round((now.eei[token] / dayAgo.eei[token] - 1) * 100, 2),
    weight: round(now.weights[token], 4),
    sparkline: samples.map((s) => s.eei[token]),
  }));

  const mean = (sample: SkySample): number =>
    (sample.eei.Spirit + sample.eei.Essence + sample.eei.Matter + sample.eei.Substance) / 4;
  const compositeIndex = round(mean(now), INDEX_ROUND_DIGITS);
  const composite24hPct = round((mean(now) / mean(dayAgo) - 1) * 100, 2);

  const degraded = [
    ...new Set(samples.flatMap((s) => s.degradedReasons)),
  ].sort();

  return {
    bucketStartUtc: new Date(bucketMs).toISOString(),
    aNumber: now.aNumber,
    multiplier: now.multiplier,
    dominantElement: now.dominantElement,
    sunSign: now.sunSign,
    isDiurnal: now.isDiurnal,
    tokens,
    compositeIndex,
    composite24hPct,
    degraded: degraded.length > 0 ? degraded : null,
    basis: {
      model: "ADR-011 elemental-exchange-index v1",
      engine:
        "astronomy-engine (local), 10 ESMS bodies, degree-level dignity + aspects, distance-flat, no Ascendant vessel",
      constants: "imported from src/lib/economy/livePricing.ts",
    },
  };
}

// One snapshot per bucket per instance. Deterministic across instances by
// construction, so this memo is a cost optimization, not a consistency risk.
let memo: { bucketMs: number; snapshot: PriceIndexSnapshot } | null = null;

export function getLivePriceIndexSnapshot(now: Date = new Date()): PriceIndexSnapshot {
  const bucketMs = Math.floor(now.getTime() / ORACLE_BUCKET_MS) * ORACLE_BUCKET_MS;
  if (memo?.bucketMs === bucketMs) return memo.snapshot;
  const snapshot = buildPriceIndexSnapshot(new Date(bucketMs));
  memo = { bucketMs, snapshot };
  return snapshot;
}

/** Test hook: drop the per-bucket memo. */
export function clearPriceIndexMemo(): void {
  memo = null;
}
