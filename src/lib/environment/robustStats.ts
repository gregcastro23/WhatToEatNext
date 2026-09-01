/**
 * Robust location and dispersion for the climatic baseline.
 *
 * Median and MAD rather than mean and σ, because the events this engine exists
 * to flag ARE the outliers. A classical σ lets a storm inflate the very
 * denominator that would have detected it — one hurricane widens the spread
 * enough to suppress the following month of alerts. The median is unmoved by up
 * to half the sample, so a genuine outlier stays an outlier.
 *
 * @file src/lib/environment/robustStats.ts
 */

/** MAD → σ-equivalent, for a normally distributed variable. 1/Φ⁻¹(0.75). */
export const MAD_TO_SIGMA = 1.4826;

/**
 * Below this, the sample is treated as having no measurable spread and z-scores
 * are refused rather than returned as Infinity. In kPa and °C alike, a MAD-sigma
 * this small means every observation in the window was effectively identical.
 */
const DEGENERATE_SIGMA = 1e-9;

export interface RobustStat {
  median: number;
  /** MAD × 1.4826. Zero when the sample has no spread — callers must check. */
  madSigma: number;
  sampleCount: number;
}

/**
 * Median of a numeric sample. Does not mutate the input.
 *
 * @throws RangeError on an empty sample — an empty median is not zero, and
 *   returning zero here would fabricate a baseline.
 */
export function median(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("median() requires at least one value; an empty sample has no median");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  const hi = sorted[mid];
  const lo = sorted.length % 2 === 0 ? sorted[mid - 1] : hi;
  if (hi === undefined || lo === undefined) {
    throw new RangeError("median() requires at least one value; an empty sample has no median");
  }
  return (lo + hi) / 2;
}

/**
 * Median absolute deviation, scaled to a σ-equivalent.
 *
 * Returns 0 for a degenerate sample (all values identical, or a single
 * observation). That is a real answer — "no observed spread" — and is
 * deliberately not smoothed into a small positive number, which would
 * manufacture z-scores out of nothing.
 */
export function madSigma(values: readonly number[]): number {
  if (values.length === 0) {
    throw new RangeError("madSigma() requires at least one value");
  }
  const m = median(values);
  const deviations = values.map((v) => Math.abs(v - m));
  return median(deviations) * MAD_TO_SIGMA;
}

export function robustStat(values: readonly number[]): RobustStat {
  return {
    median: median(values),
    madSigma: madSigma(values),
    sampleCount: values.length,
  };
}

/**
 * Standardize an observation against a robust baseline.
 *
 * Returns `null` — never Infinity or NaN — when the baseline has no measurable
 * spread. A degenerate window cannot say how unusual today is, and the honest
 * answer is "unknown", which callers must propagate as an ABSENT basis rather
 * than treating as zero.
 *
 * @param value Today's observation.
 * @param stat The trailing-window baseline.
 * @returns Signed z in MAD-sigmas, or null when undefined.
 */
export function robustZScore(value: number, stat: RobustStat): number | null {
  if (!Number.isFinite(value)) return null;
  if (stat.madSigma <= DEGENERATE_SIGMA) return null;
  return (value - stat.median) / stat.madSigma;
}
