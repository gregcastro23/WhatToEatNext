/**
 * Wrap a Promise with a deadline. Resolves to `fallback` if the inner Promise
 * doesn't settle within `ms` milliseconds.
 *
 * Use on server-side data fetches (DB queries, external APIs) that have no
 * native cancel/abort to avoid wedging Vercel functions until the 60s hard
 * timeout. The fallback lets callers degrade gracefully (e.g. redirect to a
 * cached page) instead of returning a runtime timeout error to the client.
 *
 * The inner Promise is not actually cancelled — Node has no general-purpose
 * cancellation — it keeps running in the background until it settles. Pair
 * with an explicit AbortController where the work supports one.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
  label?: string,
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const deadline = new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      if (label) {
        console.warn(`[withTimeout] ${label} exceeded ${ms}ms — using fallback`);
      }
      resolve(fallback);
    }, ms);
  });
  return Promise.race([
    promise.finally(() => {
      if (timer) clearTimeout(timer);
    }),
    deadline,
  ]);
}
