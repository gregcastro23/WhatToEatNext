/**
 * Shared Bearer JWT fallback resolution for session-first endpoints.
 *
 * Preserves primary NextAuth cookie sessions while allowing Bearer JWT callers
 * to authenticate through `validateToken`. Propagates 503 status when user
 * liveness checks fail due to database unavailability instead of emitting 401.
 *
 * @file src/lib/auth/bearerFallback.ts
 */

import { NextResponse } from "next/server";

export type BearerOrSessionResolution =
  | { userId: string }
  | { error: NextResponse };

/**
 * Resolve `userId` from a validated NextAuth session ID or a Bearer JWT.
 * Returns `{ error }` on failure, preserving HTTP 503 for DB unavailability.
 */
export async function resolveBearerOrSessionUser(
  sessionUserId: string | null | undefined,
  request: Request,
): Promise<BearerOrSessionResolution> {
  if (sessionUserId) {
    return { userId: sessionUserId };
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    try {
      const { validateToken } = await import("@/lib/auth/validateRequest");
      const result = await validateToken(authHeader.slice(7));
      if (result.valid && result.user) {
        return { userId: result.user.userId };
      }
      if (result.statusCode === 503) {
        return {
          error: NextResponse.json(
            {
              success: false,
              error:
                result.error ?? "Authentication service temporarily unavailable",
            },
            { status: 503 },
          ),
        };
      }
    } catch {
      /* invalid token — fall through to 401 */
    }
  }

  return {
    error: NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    ),
  };
}
