/**
 * Auth-aware fetch wrapper with graceful error handling.
 *
 * Handles:
 * - 401 → session expired, triggers re-auth
 * - 403 with upgrade_required → returns typed upgrade response
 * - 500 → returns error with retry hint
 * - Network errors → returns offline indicator
 *
 * @file src/lib/api/fetchWithAuth.ts
 */

import { signIn } from "next-auth/react";

export interface FetchResult<T = unknown> {
  ok: boolean;
  data?: T;
  status: number;
  /** User-friendly error message (never raw stack traces) */
  error?: string;
  /** Whether the error is due to premium feature restriction */
  upgradeRequired?: boolean;
  /** Whether the device appears to be offline */
  offline?: boolean;
}

/**
 * Fetch wrapper that adds credentials and handles common error patterns.
 * Returns a typed result object instead of throwing, so callers never
 * need try/catch blocks.
 */
export async function fetchWithAuth<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<FetchResult<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    // Session expired — redirect to sign in
    if (response.status === 401) {
      // Don't trigger redirect for background/prefetch requests
      if (typeof window !== "undefined") {
        void signIn(undefined, { callbackUrl: window.location.href });
      }
      return {
        ok: false,
        status: 401,
        error: "Your session has expired. Signing you back in...",
      };
    }

    // Premium feature restriction
    if (response.status === 403) {
      try {
        const body = await response.json();
        if (body.upgrade_required) {
          return {
            ok: false,
            status: 403,
            error: body.message || "This feature requires a Premium subscription.",
            upgradeRequired: true,
          };
        }
      } catch {
        // Non-JSON 403 response
      }
      return {
        ok: false,
        status: 403,
        error: "You don't have permission to access this resource.",
      };
    }

    // Server error
    if (response.status >= 500) {
      return {
        ok: false,
        status: response.status,
        error: "Something went wrong. Please try again in a moment.",
      };
    }

    // Client errors (400, 404, 422, etc.)
    if (!response.ok) {
      try {
        const body = await response.json();
        return {
          ok: false,
          status: response.status,
          error: body.message || body.error || `Request failed (${response.status})`,
        };
      } catch {
        return {
          ok: false,
          status: response.status,
          error: `Request failed (${response.status})`,
        };
      }
    }

    // Success
    const data = await response.json() as T;
    return { ok: true, data, status: response.status };
  } catch (err) {
    // Network error — likely offline
    const isOffline =
      typeof navigator !== "undefined" && !navigator.onLine;

    return {
      ok: false,
      status: 0,
      error: isOffline
        ? "You appear to be offline. Your changes will sync when you reconnect."
        : "Unable to connect to the server. Please check your connection.",
      offline: isOffline || true,
    };
  }
}
