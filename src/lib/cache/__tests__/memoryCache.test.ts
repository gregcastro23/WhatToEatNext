import { memoize, invalidate, clearAll } from "@/lib/cache/memoryCache";

describe("memoryCache", () => {
  beforeEach(() => {
    clearAll();
  });

  it("computes the value on first call and caches it", async () => {
    let calls = 0;
    const compute = jest.fn(async () => {
      calls += 1;
      return calls;
    });
    const first = await memoize("k1", 1000, compute);
    const second = await memoize("k1", 1000, compute);
    expect(first).toBe(1);
    expect(second).toBe(1);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it("recomputes after the TTL elapses", async () => {
    const now = jest.spyOn(Date, "now");
    now.mockReturnValue(1_000_000);

    let counter = 0;
    const compute = async () => ++counter;

    expect(await memoize("k-ttl", 500, compute)).toBe(1);
    // Still inside the TTL window — cached.
    now.mockReturnValue(1_000_400);
    expect(await memoize("k-ttl", 500, compute)).toBe(1);
    // Past the TTL — re-compute.
    now.mockReturnValue(1_000_700);
    expect(await memoize("k-ttl", 500, compute)).toBe(2);

    now.mockRestore();
  });

  it("dedupes concurrent in-flight calls onto a single computation", async () => {
    let resolve: (v: number) => void = () => {};
    const computePromise = new Promise<number>((r) => {
      resolve = r;
    });
    const compute = jest.fn(() => computePromise);
    // Three concurrent callers — only one compute() invocation expected.
    const [a, b, c] = await Promise.all([
      (async () => memoize("k-conc", 1000, compute))(),
      memoize("k-conc", 1000, compute),
      memoize("k-conc", 1000, compute),
      (resolve(42), Promise.resolve(0)),
    ]);
    expect(a).toBe(42);
    expect(b).toBe(42);
    expect(c).toBe(42);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  it("does not cache when the compute throws", async () => {
    let attempt = 0;
    const compute = async () => {
      attempt += 1;
      if (attempt === 1) throw new Error("transient");
      return "ok";
    };

    await expect(memoize("k-throw", 1000, compute)).rejects.toThrow("transient");
    // Second call must retry — no cached error.
    const second = await memoize("k-throw", 1000, compute);
    expect(second).toBe("ok");
    expect(attempt).toBe(2);
  });

  it("invalidate() drops a specific key", async () => {
    let counter = 0;
    const compute = async () => ++counter;
    await memoize("a", 60_000, compute);
    await memoize("b", 60_000, compute);
    invalidate("a");
    expect(await memoize("a", 60_000, compute)).toBe(3);
    // b is still cached.
    expect(await memoize("b", 60_000, compute)).toBe(2);
  });
});
