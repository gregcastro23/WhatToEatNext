/**
 * Shared `global.fetch` mock installer.
 *
 * The routes and components under test read only `ok`, `status`, `json()` and
 * `text()` off a response, so tests hand back Response-shaped object literals
 * rather than constructing real `Response` objects. That is unsound — a literal
 * is not a `Response` — and every call site used to assert it away with its own
 * `as unknown as typeof fetch`. This module is the single place that assertion
 * lives, so there is one spot to audit rather than twenty.
 *
 * Not a test file: `testPathIgnorePatterns` keeps Jest from collecting it.
 */

/** Assert a Jest mock into `fetch`'s position. The one unsound step. */
export const asFetch = (mock: jest.Mock): typeof fetch =>
  mock as unknown as typeof fetch;

/**
 * Install `mock` as `global.fetch` and hand it back for assertions:
 *
 *   const spy = installFetchMock(jest.fn().mockResolvedValue({ ok: true }));
 *   expect(spy).toHaveBeenCalledWith("/api/thing", expect.anything());
 */
export const installFetchMock = (mock: jest.Mock): jest.Mock => {
  global.fetch = asFetch(mock);
  return mock;
};
