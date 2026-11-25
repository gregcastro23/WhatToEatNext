// src/utils/memoize.ts

/**
 * A simple memoization function for pure functions with stringifiable arguments.
 *
 * @param fn The function to memoize.
 * @returns A memoized version of the function.
 */
export function memoize<Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
): (...args: Args) => Result {
  const cache = new Map<string, { value: Result }>();

  return (...args: Args): Result => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result });
    return result;
  };
}
