/**
 * Indexed reads that refuse instead of inventing.
 *
 * Under `noUncheckedIndexedAccess` every `values[i]` is `number | undefined`.
 * The tempting `values[i] ?? 0` (or `?? 1` for a conductivity) would turn an
 * off-by-one into a plausible-looking physical number. Every index the
 * simulator reads is in range by construction, so an `undefined` is a bug,
 * and a bug should throw.
 *
 * @file src/lib/baking/sim/strict.ts
 */

export function at(values: readonly number[], i: number): number {
  const value = values[i];
  if (value === undefined) throw new RangeError(`index ${i} is outside an array of length ${values.length}`);
  return value;
}

export function item<T>(values: readonly T[], i: number): T {
  const value = values[i];
  if (value === undefined) throw new RangeError(`index ${i} is outside an array of length ${values.length}`);
  return value;
}
