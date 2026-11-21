/**
 * Resolve the signed-in user id for best-effort interaction tracking.
 *
 * Only calls `auth()` when an Auth.js session cookie is present, so anonymous
 * public traffic pays zero session-decoding cost. Call this while the request
 * is still in flight; never from inside an `after()` task.
 *
 * @file src/lib/auth/resolveTrackingUserId.ts
 */

import { _logger } from "@/lib/logger";

// Auth.js v5 session cookie, optionally `__Secure-` prefixed and/or chunked (`.0`, `.1`).
const AUTH_SESSION_COOKIE = /(?:^|;\s*)(?:__Secure-)?authjs\.session-token(?:\.\d+)?=/;

export function hasAuthSessionCookie(cookieHeader: string | null): boolean {
  return cookieHeader !== null && AUTH_SESSION_COOKIE.test(cookieHeader);
}

/** Never throws; returns `null` for anonymous, stale, or failed lookups. */
export async function resolveTrackingUserId(request: Request): Promise<string | null> {
  if (!hasAuthSessionCookie(request.headers.get("cookie"))) return null;
  try {
    const { auth } = await import("@/lib/auth/auth");
    const session = await auth();
    return session?.user?.id ?? null;
  } catch (err) {
    _logger.warn("Interaction tracking auth lookup failed:", err);
    return null;
  }
}
