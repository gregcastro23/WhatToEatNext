/**
 * Pure statistical helpers for alchemical / thermodynamic / kinetic series.
 *
 * Used by the period-statistics layer that aggregates pre-computed samples
 * (ESMS, thermo, elementals, per-planet contributions) into mean / stdDev /
 * percentile distributions — the "wavefunction envelope" of each quantity.
 *
 * No dependencies. Pure functions, NaN/empty-safe, treat the input as a
 * fixed sample (population stdDev, divisor N — not N−1).
 */

export interface DistributionSummary {
  count: number;
  mean: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  median: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  /** Skewness (Fisher–Pearson). 0 = symmetric. */
  skewness: number;
}

export interface ContextualValue extends DistributionSummary {
  /** The latest / current observation, kept alongside the summary. */
  current: number;
  /** (current − mean) / stdDev. NaN-safe: 0 when stdDev = 0. */
  zScore: number;
  /** Percentile rank of `current` within the sample, 0–100. */
  percentileRank: number;
}

const EMPTY_SUMMARY: DistributionSummary = {
  count: 0,
  mean: 0,
  stdDev: 0,
  variance: 0,
  min: 0,
  max: 0,
  median: 0,
  p10: 0,
  p25: 0,
  p75: 0,
  p90: 0,
  skewness: 0,
};

function sanitize(values: readonly number[]): number[] {
  const out: number[] = [];
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) out.push(v);
  }
  return out;
}

/**
 * Linear-interpolated percentile (type-7, the Excel/numpy default).
 * `q` is in [0, 1]. Assumes `sorted` is ascending and non-empty.
 */
function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const clamped = Math.min(1, Math.max(0, q));
  const pos = clamped * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  const frac = pos - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

export function summarize(values: readonly number[]): DistributionSummary {
  const xs = sanitize(values);
  const n = xs.length;
  if (n === 0) return { ...EMPTY_SUMMARY };

  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const v of xs) {
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const mean = sum / n;

  let m2 = 0;
  let m3 = 0;
  for (const v of xs) {
    const d = v - mean;
    m2 += d * d;
    m3 += d * d * d;
  }
  const variance = m2 / n;
  const stdDev = Math.sqrt(variance);

  // Fisher–Pearson skewness; safe when stdDev≈0.
  const skewness =
    stdDev > 1e-12 ? (m3 / n) / Math.pow(stdDev, 3) : 0;

  const sorted = [...xs].sort((a, b) => a - b);

  return {
    count: n,
    mean,
    stdDev,
    variance,
    min,
    max,
    median: quantile(sorted, 0.5),
    p10: quantile(sorted, 0.1),
    p25: quantile(sorted, 0.25),
    p75: quantile(sorted, 0.75),
    p90: quantile(sorted, 0.9),
    skewness,
  };
}

/**
 * Percentile rank of `value` inside `sortedAsc`, 0–100.
 * Uses average rank for ties; returns 50 when the sample is empty.
 */
export function percentileRank(
  value: number,
  sortedAsc: readonly number[],
): number {
  const n = sortedAsc.length;
  if (n === 0 || !Number.isFinite(value)) return 50;
  let below = 0;
  let equal = 0;
  for (const v of sortedAsc) {
    if (v < value) below++;
    else if (v === value) equal++;
    else break;
  }
  return ((below + 0.5 * equal) / n) * 100;
}

/**
 * Wrap a series with summary stats AND the latest observation, ready for UI.
 *
 * `current` defaults to the last value of `values` (chronological order
 * assumed, but stats are order-independent).
 */
export function contextualize(
  values: readonly number[],
  current?: number,
): ContextualValue {
  const summary = summarize(values);
  const xs = sanitize(values);
  const observed =
    current !== undefined && Number.isFinite(current)
      ? current
      : xs.length > 0
        ? xs[xs.length - 1]
        : 0;
  const z =
    summary.stdDev > 1e-12 ? (observed - summary.mean) / summary.stdDev : 0;
  const sorted = [...xs].sort((a, b) => a - b);
  return {
    ...summary,
    current: observed,
    zScore: z,
    percentileRank: percentileRank(observed, sorted),
  };
}

/**
 * Build a histogram of `values` into `bins` equal-width buckets between
 * [min, max]. Returns bucket centers + counts. Useful for the
 * "wavefunction" visualization on the stats page.
 */
export interface Histogram {
  edges: number[];      // length = bins + 1
  centers: number[];    // length = bins
  counts: number[];     // length = bins
  binWidth: number;
}

export function histogram(values: readonly number[], bins = 24): Histogram {
  const xs = sanitize(values);
  const n = xs.length;
  if (n === 0 || bins <= 0) {
    return { edges: [0, 0], centers: [0], counts: [0], binWidth: 0 };
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of xs) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  if (lo === hi) {
    // Degenerate: all values identical. Return a single-bin histogram.
    return {
      edges: [lo, hi],
      centers: [lo],
      counts: [n],
      binWidth: 0,
    };
  }
  const binWidth = (hi - lo) / bins;
  const counts = new Array<number>(bins).fill(0);
  const edges = new Array<number>(bins + 1);
  const centers = new Array<number>(bins);
  for (let i = 0; i <= bins; i++) edges[i] = lo + i * binWidth;
  for (let i = 0; i < bins; i++) centers[i] = lo + (i + 0.5) * binWidth;
  for (const v of xs) {
    let idx = Math.floor((v - lo) / binWidth);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }
  return { edges, centers, counts, binWidth };
}

/**
 * Pearson correlation between two equally-sized series. Returns 0 when
 * either series is constant or when lengths differ.
 */
export function correlation(a: readonly number[], b: readonly number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < n; i++) {
    const av = a[i];
    const bv = b[i];
    if (!Number.isFinite(av) || !Number.isFinite(bv)) return 0;
    sumA += av;
    sumB += bv;
  }
  const meanA = sumA / n;
  const meanB = sumB / n;
  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  const denom = Math.sqrt(varA * varB);
  return denom > 1e-12 ? cov / denom : 0;
}

/**
 * Format a z-score into a UI-friendly verdict.
 * |z| < 0.5 → "typical", < 1 → "normal", < 2 → "elevated", < 3 → "high",
 * else "extreme". Sign indicates direction.
 */
export function classifyZScore(z: number): {
  label: string;
  direction: "above" | "below" | "at";
  magnitude: "typical" | "normal" | "elevated" | "high" | "extreme";
} {
  const abs = Math.abs(z);
  let magnitude: "typical" | "normal" | "elevated" | "high" | "extreme";
  if (abs < 0.5) magnitude = "typical";
  else if (abs < 1) magnitude = "normal";
  else if (abs < 2) magnitude = "elevated";
  else if (abs < 3) magnitude = "high";
  else magnitude = "extreme";

  const direction: "above" | "below" | "at" =
    abs < 0.05 ? "at" : z > 0 ? "above" : "below";

  let label: string;
  if (direction === "at") label = "at mean";
  else if (magnitude === "typical") label = `slightly ${direction} mean`;
  else if (magnitude === "normal") label = `${direction} mean`;
  else if (magnitude === "elevated") label = `notably ${direction} mean`;
  else if (magnitude === "high") label = `strongly ${direction} mean`;
  else label = `extremely ${direction} mean`;

  return { label, direction, magnitude };
}
