/**
 * The JSON trust boundary.
 *
 * Every `await response.json()` is a point where data of unknown shape enters
 * the program wearing a type the compiler never checked. There are 644 such
 * sites in `src/`, and 316 of them pay a local `as T` for the privilege —
 * roughly 7% of the repository's entire assertion surface, spent asserting the
 * same unprovable thing 316 separate times.
 *
 * These helpers pay it ONCE, here, so that:
 *   - the claim lives in one auditable place instead of 316,
 *   - call sites shed their local assertion (the assertion-site ratchet falls
 *     rather than merely moving), and
 *   - a real validator can later be installed here, or per call through
 *     `parse`, without editing a single call site.
 *
 * ⚠️ Without `parse`, `T` is an UNVERIFIED CLAIM about the payload — exactly
 * what the `as T` it replaces was. This centralises the claim; it does not by
 * itself make it true. Pass `parse` wherever the payload actually matters.
 *
 * ⚠️ A body of `null` is valid JSON and `response.json()` returns it, so a `T`
 * that cannot represent null is already wrong for some endpoints. Keep `| null`
 * in `T` wherever the server can send it, and never silence the resulting
 * optional chain with `!` — that trades an honest check for a tracked
 * `no-unnecessary-condition`.
 *
 * @file src/lib/api/json.ts
 */

/** Thrown by {@link fetchJson} when the response status is not 2xx. */
export class HttpError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(status: number, statusText: string, url: string) {
    super(`Request to ${url} failed: ${status} ${statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.url = url;
  }
}

export interface ReadJsonOptions<T> {
  parse?: (value: unknown) => T;
}

export type ParseOrOptions<T> =
  | ((value: unknown) => T)
  | ReadJsonOptions<T>;

function extractParse<T>(
  parseOrOptions?: ParseOrOptions<T>,
): ((value: unknown) => T) | undefined {
  if (typeof parseOrOptions === "function") return parseOrOptions;
  return parseOrOptions?.parse;
}

/**
 * Read a `Response` body as JSON.
 *
 * This is the single place the repository converts an unknown payload into a
 * typed value. `parse` is the honest path: give it a narrowing function and the
 * result is checked rather than asserted.
 */
export async function readJson<T>(
  response: Response,
  parseOrOptions?: ParseOrOptions<T>,
): Promise<T> {
  const body: unknown = await response.json();
  const parse = extractParse(parseOrOptions);
  if (parse) return parse(body);
  // The one assertion, paid here instead of at every call site.
  return body as T;
}

/**
 * Read a `Response` body as JSON, returning `fallback` if reading or parsing fails.
 *
 * Use this when an endpoint can return an empty body or non-JSON payload (e.g.
 * on certain error status codes like 401/402/204) and the caller degrades
 * gracefully instead of treating a missing body as fatal.
 */
export async function safeReadJson<T>(
  response: Response,
  fallback: T,
  parseOrOptions?: ParseOrOptions<T>,
): Promise<T> {
  try {
    const body: unknown = await response.json();
    const parse = extractParse(parseOrOptions);
    if (parse) return parse(body);
    return body as T;
  } catch {
    return fallback;
  }
}

/**
 * `fetch` + {@link readJson}, throwing {@link HttpError} on a non-2xx status.
 *
 * Use this when a failed request is exceptional. When a non-2xx is an ordinary
 * outcome the caller wants to branch on, call `fetch` yourself and hand the
 * response to {@link readJson}.
 */
export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  parseOrOptions?: ParseOrOptions<T>,
): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new HttpError(
      response.status,
      response.statusText,
      typeof input === "string" ? input : String(input),
    );
  }
  return readJson<T>(response, parseOrOptions);
}
