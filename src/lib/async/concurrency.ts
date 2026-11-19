/**
 * Lightweight FIFO concurrency limiter for bounding per-invocation fan-out
 * (e.g. keeping admin telemetry DB queries within serverless `pg` pool caps).
 *
 * @file src/lib/async/concurrency.ts
 */

export type ConcurrencyLimiter = <T>(task: () => Promise<T>) => Promise<T>;

/** Create a FIFO limiter ensuring at most `maxConcurrency` tasks run at once. */
export function createConcurrencyLimiter(maxConcurrency: number): ConcurrencyLimiter {
  if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
    throw new RangeError(
      `maxConcurrency must be a positive integer (got ${maxConcurrency})`,
    );
  }

  let active = 0;
  const queue: Array<() => void> = [];

  const release = (): void => {
    const next = queue.shift();
    if (next) {
      // Hand the active slot directly to the next queued waiter so concurrent
      // callers arriving before the microtask resumes cannot steal capacity.
      next();
      return;
    }
    active -= 1;
  };

  return async <T>(task: () => Promise<T>): Promise<T> => {
    if (active >= maxConcurrency) {
      await new Promise<void>((resolve): void => {
        queue.push(resolve);
      });
    } else {
      active += 1;
    }
    try {
      return await task();
    } finally {
      release();
    }
  };
}
