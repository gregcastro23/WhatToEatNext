/**
 * Route-name derivation for the NextAuth catch-all.
 *
 * `/api/auth/[...nextauth]` is one route file serving a whole family of URLs
 * (`callback/google`, `signin/google`, `csrf`, `signout`, `session`, ...).
 * Recording all of them under the Next.js *filesystem* identifier
 * `"/api/auth/[...nextauth]"` throws away the only thing a prefix matcher can
 * act on: `summarizePath` matches with `path.startsWith(prefix)`
 * (`requestLog.ts`), and
 *
 *   "/api/auth/[...nextauth]".startsWith("/api/auth/callback/google") === false
 *
 * so `probeGoogleOAuthDependency` (`systemStatusService.ts`) could never
 * observe a callback and the Google OAuth tile read UNKNOWN unconditionally.
 * `[MEASURED 2026-08-19]` production `request_log_entries` held exactly one
 * distinct auth path over 30 days — `/api/auth/[...nextauth]`, 42 rows.
 *
 * Why an allowlist rather than the raw pathname: the catch-all answers ANY
 * `/api/auth/<anything>`, so a scanner hitting `/api/auth/.env` would mint a
 * new bucket per distinct URL. Two consumers group by exact path and then
 * truncate — the error-group query in `dashboardPanelsService` (`LIMIT 8`) and
 * `summarizeRecent().topPaths` (`slice(0, 10)`) — so unbounded path diversity
 * would push real routes off both lists. The allowlist caps the bucket count
 * at 16.
 *
 * Every output starts with `/api/auth`, which keeps the existing
 * `summarizePath("/api/auth", FIVE_MIN)` consumer matching exactly the same
 * set of entries it matches today — only the labels change.
 *
 * @file src/lib/observability/authRouteName.ts
 */

/** Auth.js endpoints reachable through the catch-all. */
const AUTH_ACTIONS = new Set([
  "signin",
  "signout",
  "callback",
  "csrf",
  "providers",
  "session",
  "error",
  "verify-request",
  "_log",
]);

/**
 * Providers this app actually registers. Mirrors `buildProviders()` in
 * `src/lib/auth/auth.config.ts` — Google always, Amazon when its credentials
 * are set. Anything else collapses to `:provider` so an unknown provider
 * cannot mint an unbounded number of buckets.
 */
const AUTH_PROVIDERS = new Set(["google", "amazon"]);

/** Bucket for any path that is not a recognised Auth.js endpoint. */
export const AUTH_ROUTE_FALLBACK = "/api/auth/:unknown";

/**
 * Map a request pathname onto a stable, bounded, prefix-matchable route name.
 * Always returns a string beginning with `/api/auth`.
 */
export function deriveAuthRouteName(pathname: string): string {
  const [ns, area, action, provider, ...rest] = pathname
    .split("/")
    .filter(Boolean);
  if (ns !== "api" || area !== "auth") return AUTH_ROUTE_FALLBACK;
  if (!action || !AUTH_ACTIONS.has(action)) return AUTH_ROUTE_FALLBACK;

  // `signin` and `callback` carry a provider segment; everything else is bare.
  if (action === "callback" || action === "signin") {
    if (rest.length > 0) return AUTH_ROUTE_FALLBACK;
    if (!provider) return `/api/auth/${action}`;
    return AUTH_PROVIDERS.has(provider)
      ? `/api/auth/${action}/${provider}`
      : `/api/auth/${action}/:provider`;
  }

  if (provider !== undefined) return AUTH_ROUTE_FALLBACK;
  return `/api/auth/${action}`;
}
