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
 *  - The integrated ESMS state is quantized once to integer micro-ESMS before
 *    weights are priced. Display rounding never feeds back into the state.
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
 * observer-local 24h rotation, not a sky fact). The production adapter adds
 * geocentric distance for the ruled Λ(r) tensor and calibrated Hamiltonian;
 * injected legacy fixtures with no distance retain the mean-distance state.
 */

import * as Astronomy from "astronomy-engine";
import {
  alchemize,
  type PlanetaryPosition,
} from "@/services/RealAlchemizeService";
import type { DegradedInfo } from "@/types/degraded";
import type { TokenType } from "@/types/economy";
import { TOKEN_TYPES } from "@/types/economy";
import {
  getAccuratePlanetaryPositionsWithMeta,
  type PlanetPositionData,
} from "@/utils/astrology/positions";
import {
  OSCILLATOR_BODIES,
  OSCILLATOR_OMEGA_RAD_PER_DAY,
  OSCILLATOR_X_BAR,
  oscillatorCoordinate,
  oscillatorEnergy,
  type OscillatorSky,
} from "@/utils/esmsOscillator";
import { MICRO_ESMS_PER_K, quantizeEsms } from "./esmsQuantization";
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
  physics: PriceIndexPhysics;
}

export interface PriceIndexPhysics {
  /** The integrated continuous Gaussian field and its one-time ledger state. */
  state: {
    continuousK: Record<TokenType, number>;
    quantizedMicroEsms: Record<TokenType, number>;
  };
  quantization: {
    unit: "micro-ESMS";
    microEsmsPerK: number;
    rounding: "floor-once";
    weights: "q_i / sum(q)";
  };
  gaussian: {
    operator: string;
    manifold: "S1";
    integralNormalization: 1;
    sigmaAffectsGlobalQuote: false;
  };
  hamiltonian: {
    coordinate: number;
    momentumPerDay: number;
    energy: number;
    omegaRadPerDay: number;
    equilibrium: number;
    role: string;
  } | null;
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
type OraclePlanetPositionData = PlanetPositionData & { distance?: number };
type OraclePositions = Partial<Record<string, OraclePlanetPositionData>>;

export type PositionsProvider = (date: Date) => {
  positions: OraclePositions;
  degraded: DegradedInfo | null;
};

/** The exact key set of OSCILLATOR_BODIES; adding a body must fail to compile here. */
type OscillatorBody = (typeof OSCILLATOR_BODIES)[number];

const ASTRONOMY_BODY: Record<OscillatorBody, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

/**
 * Oracle-only distance adapter. The shared positions module intentionally has
 * a smaller interface; the price state additionally needs geocentric range for
 * Λ(r) and the calibrated oscillator. A failed vector calculation throws — a
 * distance-flat fallback would silently price a different state.
 */
const defaultProvider: PositionsProvider = (date) => {
  const { positions: enginePositions, degraded } =
    getAccuratePlanetaryPositionsWithMeta(date);
  const positions: OraclePositions = enginePositions;
  const time = Astronomy.MakeTime(date);
  const distanceAware: OraclePositions = {
    ...positions,
  };
  for (const body of OSCILLATOR_BODIES) {
    const position = positions[body];
    if (!position) {
      throw new Error(`price-index: position engine omitted ${body}`);
    }
    const vector = Astronomy.GeoVector(ASTRONOMY_BODY[body], time, true);
    const distance = Math.hypot(vector.x, vector.y, vector.z);
    if (!Number.isFinite(distance) || distance <= 0) {
      throw new Error(
        `price-index: invalid ${body} distance ${String(distance)}`,
      );
    }
    distanceAware[body] = { ...position, distance };
  }
  return { positions: distanceAware, degraded };
};

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
  positions: Partial<Record<string, Partial<OraclePlanetPositionData>>>,
): Record<string, PlanetaryPosition> {
  const normalized: Record<string, PlanetaryPosition> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    // The oracle's local source happens not to return an Ascendant today, so
    // this is a no-op here — which is exactly why it belongs: the ten-body
    // claim in this module's header is now enforced, not merely true by
    // accident of which util answered. See PRICED_BODIES (ADR-012).
    if (!pos || !isPricedBody(planet)) continue;
    normalized[planet] = {
      sign: String(pos.sign ?? "").toLowerCase(),
      degree: Number(pos.degree ?? 0),
      minute: 0,
      isRetrograde: Boolean(pos.isRetrograde),
      // Aspects need real angular separations; this is what makes the index
      // move WITHIN signs rather than only at ingresses.
      exactLongitude:
        typeof pos.exactLongitude === "number" ? pos.exactLongitude : undefined,
      distance: typeof pos.distance === "number" ? pos.distance : undefined,
    };
  }
  return normalized;
}

export interface SkySample {
  eei: Record<TokenType, number>;
  weights: Record<TokenType, number>;
  continuousK: Record<TokenType, number>;
  quantizedMicroEsms: Record<TokenType, number>;
  aNumber: number;
  multiplier: number;
  dominantElement: string;
  sunSign: string;
  isDiurnal: boolean;
  degradedReasons: string[];
  oscillatorCoordinates: { diurnal: number; nocturnal: number } | null;
}

function oscillatorCoordinatesFor(
  positions: OraclePositions,
): { diurnal: number; nocturnal: number } | null {
  const withDistance = OSCILLATOR_BODIES.filter(
    (body) => typeof positions[body]?.distance === "number",
  );
  if (withDistance.length === 0) return null;
  if (withDistance.length !== OSCILLATOR_BODIES.length) {
    throw new Error(
      `price-index: oscillator needs ${OSCILLATOR_BODIES.length} distances, got ${withDistance.length}`,
    );
  }

  const sky: OscillatorSky = {};
  for (const body of OSCILLATOR_BODIES) {
    const position = positions[body];
    if (
      !position ||
      !Number.isFinite(position.distance) ||
      position.distance === undefined ||
      position.distance <= 0
    ) {
      throw new Error(`price-index: oscillator received invalid ${body} state`);
    }
    sky[body] = {
      sign: position.sign,
      degree: position.degree,
      exactLongitude: position.exactLongitude,
      distanceAu: position.distance,
    };
  }
  return {
    diurnal: oscillatorCoordinate(sky, true),
    nocturnal: oscillatorCoordinate(sky, false),
  };
}

/**
 * One sky sample: canonical alchemize → weights → EEI. Throws on a
 * non-positive ESMS total — with ten gated bodies and non-negative weights
 * that is unreachable from a healthy engine, so it means the engine broke,
 * and a broken engine must never price (the prototype's `$1.0000` fallback
 * is the defect class this throw exists to make inexpressible).
 */
export function computeSkySample(
  positions: OraclePositions,
  date: Date,
  incomingDegraded: DegradedInfo | null = null,
): SkySample {
  const alch = alchemize(asPlanetaryPositions(positions), null, date, {
    incomingDegraded,
  });
  const continuousK: Record<TokenType, number> = {
    Spirit: Number(alch.esms.Spirit || 0),
    Essence: Number(alch.esms.Essence || 0),
    Matter: Number(alch.esms.Matter || 0),
    Substance: Number(alch.esms.Substance || 0),
  };
  const quantizedMicroEsms = {} as Record<TokenType, number>;
  for (const token of TOKEN_TYPES) {
    quantizedMicroEsms[token] = quantizeEsms(continuousK[token]);
  }
  const totalMicro = TOKEN_TYPES.reduce(
    (sum, token) => sum + quantizedMicroEsms[token],
    0,
  );
  const total = totalMicro / MICRO_ESMS_PER_K;
  if (!(totalMicro > 0) || !Number.isFinite(totalMicro)) {
    throw new Error(
      `price-index: engine returned unusable ESMS total after quantization ${String(totalMicro)}`,
    );
  }

  const multiplier = globalMultiplierForANumber(total);
  const weights = {} as Record<TokenType, number>;
  const eei = {} as Record<TokenType, number>;
  for (const token of TOKEN_TYPES) {
    const w = quantizedMicroEsms[token] / totalMicro;
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
    continuousK,
    quantizedMicroEsms,
    aNumber: round(total, 4),
    multiplier: round(multiplier, 4),
    dominantElement: alch.metadata.dominantElement,
    sunSign: alch.metadata.sunSign,
    isDiurnal: alch.metadata.isDiurnal,
    degradedReasons: alch.degraded?.reasons ? [...alch.degraded.reasons] : [],
    oscillatorCoordinates: oscillatorCoordinatesFor(positions),
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
  const bucketMs =
    Math.floor(at.getTime() / ORACLE_BUCKET_MS) * ORACLE_BUCKET_MS;

  const samples: SkySample[] = [];
  for (let h = SPARKLINE_HOURS; h >= 0; h--) {
    const sampleDate = new Date(bucketMs - h * 3_600_000);
    const { positions, degraded } = provider(sampleDate);
    samples.push(computeSkySample(positions, sampleDate, degraded));
  }

  const now = samples[samples.length - 1];
  const [dayAgo] = samples;
  const previousHour = samples[samples.length - 2];
  if (!now || !dayAgo || !previousHour) {
    throw new Error(
      `price-index: sparkline needs at least 2 samples, built ${samples.length}`,
    );
  }

  const tokens: TokenIndexQuote[] = TOKEN_TYPES.map((token) => ({
    token,
    index: now.eei[token],
    change24hPct: round((now.eei[token] / dayAgo.eei[token] - 1) * 100, 2),
    weight: round(now.weights[token], 4),
    sparkline: samples.map((s) => s.eei[token]),
  }));

  const mean = (sample: SkySample): number =>
    (sample.eei.Spirit +
      sample.eei.Essence +
      sample.eei.Matter +
      sample.eei.Substance) /
    4;
  const compositeIndex = round(mean(now), INDEX_ROUND_DIGITS);
  const composite24hPct = round((mean(now) / mean(dayAgo) - 1) * 100, 2);

  const sect = now.isDiurnal ? "diurnal" : "nocturnal";
  const coordinate = now.oscillatorCoordinates?.[sect];
  const previousCoordinate = previousHour.oscillatorCoordinates?.[sect];
  const hamiltonian =
    coordinate === undefined || previousCoordinate === undefined
      ? null
      : {
          coordinate: round(coordinate, 8),
          // Samples are one hour apart; convert dx/hour to dx/day.
          momentumPerDay: round((coordinate - previousCoordinate) * 24, 8),
          energy: round(
            oscillatorEnergy(
              coordinate,
              (coordinate - previousCoordinate) * 24,
              now.isDiurnal,
            ),
            8,
          ),
          omegaRadPerDay: OSCILLATOR_OMEGA_RAD_PER_DAY,
          equilibrium: now.isDiurnal
            ? OSCILLATOR_X_BAR.diurnal
            : OSCILLATOR_X_BAR.nocturnal,
          role: "calibrated state audit; not a monetary forcing term or market-value claim",
        };

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
      model: "ADR-011/013 canonical-esms-index v2",
      engine:
        "astronomy-engine (local), 10 ESMS bodies, geocentric longitude + distance, degree-level dignity + aspects, no Ascendant vessel",
      constants:
        "pricing imported from livePricing.ts; quantization from esmsQuantization.ts; Hamiltonian from esmsOscillator.ts",
    },
    physics: {
      state: {
        continuousK: Object.fromEntries(
          TOKEN_TYPES.map((token) => [token, round(now.continuousK[token], 8)]),
        ) as Record<TokenType, number>,
        quantizedMicroEsms: { ...now.quantizedMicroEsms },
      },
      quantization: {
        unit: "micro-ESMS",
        microEsmsPerK: MICRO_ESMS_PER_K,
        rounding: "floor-once",
        weights: "q_i / sum(q)",
      },
      gaussian: {
        operator: "Psi(theta,t) = S(sect) Lambda(r) g(theta-theta_p)",
        manifold: "S1",
        integralNormalization: 1,
        sigmaAffectsGlobalQuote: false,
      },
      hamiltonian,
    },
  };
}

// One snapshot per bucket per instance. Deterministic across instances by
// construction, so this memo is a cost optimization, not a consistency risk.
let memo: { bucketMs: number; snapshot: PriceIndexSnapshot } | null = null;

export function getLivePriceIndexSnapshot(
  now: Date = new Date(),
): PriceIndexSnapshot {
  const bucketMs =
    Math.floor(now.getTime() / ORACLE_BUCKET_MS) * ORACLE_BUCKET_MS;
  if (memo?.bucketMs === bucketMs) return memo.snapshot;
  const snapshot = buildPriceIndexSnapshot(new Date(bucketMs));
  memo = { bucketMs, snapshot };
  return snapshot;
}

/** Test hook: drop the per-bucket memo. */
export function clearPriceIndexMemo(): void {
  memo = null;
}
