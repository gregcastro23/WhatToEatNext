/**
 * @jest-environment jsdom
 *
 * Companion to AstrologizeApiCache.ssr.test.ts. That file proves the server no
 * longer throws on `localStorage`; this one proves the fix did not achieve
 * that by simply disabling persistence everywhere. jsdom provides a real
 * localStorage, so the guard must fall through and the cache must still
 * round-trip.
 */

const LAT = 40.7128;
const LNG = -74.006;
const WHEN = new Date("2026-08-06T12:00:00Z");
const STORAGE_KEY = "astrologize_cache";

const importFresh = async () => {
  jest.resetModules();
  return (await import("../AstrologizeApiCache")).default;
};

/** Minimal shapes matching what store()/calculateElementalValues() read. */
const seed = (cache: Awaited<ReturnType<typeof importFresh>>) =>
  cache.store(
    LAT,
    LNG,
    WHEN,
    { sunSign: "leo" } as never,
    { elementalBalance: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 } } as never,
    { Sun: { sign: "leo", degree: 14 } } as never,
  );

describe("AstrologizeApiCache in the browser (localStorage present)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("has a real localStorage in this environment (control)", () => {
    // Mirrors the ssr suite's control. If this fails, the guard would be
    // short-circuiting for the wrong reason and the round-trip proves nothing.
    expect(typeof globalThis.localStorage).toBe("object");
    expect(typeof globalThis.localStorage.getItem).toBe("function");
  });

  it("still writes the cache to localStorage", async () => {
    const cache = await importFresh();
    seed(cache);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).length).toBeGreaterThan(0);
  });

  it("rehydrates a previously persisted cache on construction", async () => {
    const first = await importFresh();
    seed(first);
    expect(first.getCacheStats().size).toBe(1);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    // Fresh module instance — its constructor must read storage back.
    const second = await importFresh();
    expect(second.getCacheStats().size).toBe(1);
  });

  it("starts empty when storage holds nothing (control)", async () => {
    localStorage.clear();
    const cache = await importFresh();
    expect(cache.getCacheStats().size).toBe(0);
  });
});
