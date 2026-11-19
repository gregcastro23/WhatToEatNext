/** @jest-environment node */
/**
 * Unit tests for `createConcurrencyLimiter`.
 *
 * @file src/lib/async/__tests__/concurrency.test.ts
 */

import { createConcurrencyLimiter } from "../concurrency";

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (err: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<T>((res, rej): void => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("createConcurrencyLimiter", () => {
  it("caps in-flight tasks at maxConcurrency and preserves resolved values", async () => {
    const limit = createConcurrencyLimiter(2);
    let inFlight = 0;
    let peak = 0;

    const results = await Promise.all(
      Array.from({ length: 8 }, (_, idx): Promise<number> =>
        limit(async (): Promise<number> => {
          inFlight += 1;
          peak = Math.max(peak, inFlight);
          await new Promise<void>((r): void => {
            setTimeout(r, 10);
          });
          inFlight -= 1;
          return idx * 2;
        }),
      ),
    );

    expect(peak).toBeLessThanOrEqual(2);
    expect(peak).toBe(2);
    expect(results).toEqual([0, 2, 4, 6, 8, 10, 12, 14]);
  });

  it("releases slots when tasks reject and runs queued waiters in FIFO order", async () => {
    const limit = createConcurrencyLimiter(2);
    const gates = [deferred<string>(), deferred<string>()];
    const [g0, g1] = gates;
    if (!g0 || !g1) throw new Error("expected deferred gates");
    const order: string[] = [];

    const p1 = limit((): Promise<string> => {
      order.push("t1");
      return g0.promise;
    });
    const p2 = limit((): Promise<string> => {
      order.push("t2");
      return g1.promise;
    });
    const p3 = limit(async (): Promise<string> => {
      order.push("t3");
      return "ok-3";
    });
    const p4 = limit(async (): Promise<string> => {
      order.push("t4");
      return "ok-4";
    });

    expect(order).toEqual(["t1", "t2"]);
    g0.reject(new Error("boom"));
    await expect(p1).rejects.toThrow("boom");
    g1.resolve("ok-2");

    await expect(Promise.all([p2, p3, p4])).resolves.toEqual(["ok-2", "ok-3", "ok-4"]);
    expect(order).toEqual(["t1", "t2", "t3", "t4"]);
  });

  it("rejects invalid maxConcurrency bounds", () => {
    expect(() => createConcurrencyLimiter(0)).toThrow(RangeError);
    expect(() => createConcurrencyLimiter(-1)).toThrow(RangeError);
    expect(() => createConcurrencyLimiter(1.5)).toThrow(RangeError);
    expect(() => createConcurrencyLimiter(Number.NaN)).toThrow(RangeError);
  });
});
