/**
 * @jest-environment node
 *
 * How an upstream deadline breach must be RECOGNISED.
 *
 * `/api/generate-cosmic-recipe` bounds its Planetary Agents call with
 * `AbortSignal.timeout(PA_TIMEOUT_MS)` and reports a breach as 504 rather than
 * 500, so the route-health panel blames the service that actually owns the
 * latency instead of recording a WTEN server fault. That branch is only
 * reached if the rejection is correctly identified.
 *
 * The trap this file exists to pin: `AbortSignal.timeout` rejects with a
 * **DOMException**, not an `Error`. Whether `DOMException instanceof Error`
 * holds is REALM-DEPENDENT.
 *
 *   `[MEASURED 2026-08-19]` real Node v22.23.1 — including the rejection from
 *   a genuine aborted `fetch` — reports `instanceof Error === true`.
 *   This jest node environment reports `false` for the identical construct.
 *
 * So a guard written as `error instanceof Error && error.name === ...` passes
 * in production and silently fails elsewhere, and the failure mode is invisible:
 * the route still answers, it just misattributes every upstream timeout as its
 * own 500. The route therefore checks `.name` WITHOUT `instanceof`, and the
 * first case below is what keeps it that way.
 *
 * Context: `[MEASURED 2026-08-19]` PA's POST /api/generate-recipe answered 200
 * in 23.0–30.8s across four samples while its /health answered in 0.35s, so
 * the deadline sits at 45s — above the observed band, below maxDuration=60.
 */

/** Exactly the predicate the route uses. Keep the two in step. */
function isTimeout(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "TimeoutError"
  );
}

async function abortedReason(): Promise<unknown> {
  const signal = AbortSignal.timeout(5);
  await new Promise<void>((resolve) => {
    signal.addEventListener("abort", () => resolve(), { once: true });
  });
  return signal.reason;
}

describe("upstream timeout recognition", () => {
  it("identifies the abort reason without relying on instanceof Error", async () => {
    const reason = await abortedReason();

    expect(isTimeout(reason)).toBe(true);
  });

  it("documents WHY instanceof is unsafe: it is realm-dependent", async () => {
    const reason = await abortedReason();

    // The name is stable across realms — this is the part worth depending on.
    expect((reason as { name?: unknown }).name).toBe("TimeoutError");
    expect(String((reason as object).constructor.name)).toBe("DOMException");

    // The instanceof is NOT stable. Real Node v22.23.1 says true here; this
    // environment says false. If this assertion ever starts failing, jest's
    // realm has converged with Node's — the route's name-only guard is still
    // correct either way, which is the point.
    expect(reason instanceof Error).toBe(false);
  });

  it("does not mistake an ordinary upstream error for a timeout", async () => {
    // Control: the 504 branch must not swallow genuine server faults, or the
    // route would stop reporting its own failures entirely.
    expect(isTimeout(new Error("connection reset"))).toBe(false);
    expect(isTimeout(new TypeError("fetch failed"))).toBe(false);
    expect(isTimeout(null)).toBe(false);
    expect(isTimeout(undefined)).toBe(false);
    expect(isTimeout("TimeoutError")).toBe(false);
  });
});
