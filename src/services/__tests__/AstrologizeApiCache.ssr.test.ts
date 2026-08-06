/**
 * @jest-environment node
 *
 * The `node` environment is the point of this file — it has no `localStorage`,
 * exactly like the Vercel server runtime. Under jsdom these assertions would
 * pass trivially whether or not the guard exists.
 *
 * Regression guard for the build-log error:
 *   "Failed to load astrologize cache from localStorage:
 *    ReferenceError: localStorage is not defined
 *      at g.loadFromStorage (.next/server/app/api/feed/share/route.js)"
 *
 * The module ends in `export default new AstrologizeApiCache()`, so importing
 * it from any server route ran the constructor → loadFromStorage() → boom. The
 * throw was swallowed by a try/catch, so the build stayed green while the
 * error fired on every cold start of that route.
 *
 * NOTE: the spy is created inside each test, not at describe scope. This
 * project sets `restoreMocks: true`, which restores a describe-scoped spy
 * after the FIRST test — leaving later tests asserting against a dead spy
 * whose `mock.calls` is always empty, i.e. passing no matter what the code
 * does. The `captures console.warn at all` control below fails loudly if that
 * ever silently regresses.
 */

const importFresh = async () => {
  jest.resetModules();
  return import("../AstrologizeApiCache");
};

const localStorageWarnings = (spy: jest.SpyInstance) =>
  spy.mock.calls.filter((args) =>
    args.some((a) => typeof a === "string" && a.includes("localStorage")),
  );

describe("AstrologizeApiCache on the server (no localStorage)", () => {
  it("has no localStorage in this environment (control)", () => {
    // If this fails, the file is running under jsdom and proves nothing.
    expect(typeof (globalThis as { localStorage?: unknown }).localStorage).toBe(
      "undefined",
    );
  });

  it("captures console.warn at all (control for restoreMocks)", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    console.warn("probe localStorage sentinel");
    expect(localStorageWarnings(spy)).toHaveLength(1);
    spy.mockRestore();
  });

  it("imports without throwing, even though construction is a side effect", async () => {
    await expect(importFresh()).resolves.toBeDefined();
  });

  it("does not log a localStorage failure on import", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    await importFresh();
    expect(localStorageWarnings(spy)).toEqual([]);
    spy.mockRestore();
  });

  it("still exposes a usable cache instance server-side", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const mod = await importFresh();
    expect(mod.default).toBeDefined();
    // Constructed fine; it just starts empty rather than rehydrating from a
    // storage API that does not exist here.
    expect(typeof mod.default).toBe("object");
    spy.mockRestore();
  });
});
