/**
 * Quantile calculation helper for scripts and statistical measurements.
 *
 * @file scripts/lib/quantile.ts
 */

export function q(xs: number[], p: number): number {
  const s = [...xs].sort((a, b) => a - b);
  const val = s[Math.floor((s.length - 1) * p)];
  if (val === undefined) {
    throw new Error("q() called on empty array or out of bounds index");
  }
  return val;
}
