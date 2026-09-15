/**
 * Revokes sessions on sign-out.
 *
 * Stamped on NextAuth signOut events:
 * 1. Deletes the raw NextAuth session row from `sessions` (keyed by "sessionToken")
 * 2. Updates `device_sessions` setting `revoked_at = NOW()` (keyed by `id`)
 *    where `revoked_at IS NULL` (idempotent, safe on repeats).
 *
 * @file src/lib/auth/signOutSession.ts
 */

import { createLogger } from "@/utils/logger";

const logger = createLogger("auth:signOutSession");

export interface SignOutSessionTokens {
  sessionToken?: string | null | undefined;
  deviceSessionId?: string | null | undefined;
}

export async function revokeSessionsOnSignOut(
  tokens: SignOutSessionTokens,
): Promise<boolean> {
  const { sessionToken, deviceSessionId } = tokens;
  if (!sessionToken && !deviceSessionId) {
    return false;
  }

  try {
    const { executeQuery } = await import("@/lib/database");

    if (sessionToken) {
      await executeQuery(
        `DELETE FROM sessions WHERE "sessionToken" = $1`,
        [sessionToken],
      );
    }

    if (deviceSessionId) {
      await executeQuery(
        `UPDATE device_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`,
        [deviceSessionId],
      );
    }

    return true;
  } catch (e) {
    logger.warn("Session cleanup on signOut failed (non-blocking):", e);
    return false;
  }
}

export async function handleSignOutSession(token: {
  sessionId?: string;
  deviceSessionId?: string;
} | undefined): Promise<void> {
  const sessionToken = token?.sessionId;
  const deviceSessionId = token?.deviceSessionId ?? token?.sessionId;
  if (sessionToken || deviceSessionId) {
    await revokeSessionsOnSignOut({ sessionToken, deviceSessionId });
  }
}
