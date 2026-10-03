/**
 * Wire types for the /profile/security surface: GET /api/auth/sessions and
 * GET /api/internal/agent-sync/status. The routes build these, and the client
 * schemas in src/lib/validation/accountResponseSchemas.ts are drift-guarded
 * against them.
 *
 * @file src/types/authSessions.ts
 */

/** One row of the session list. */
export interface AuthSessionRow {
  id: string;
  sub: string;
  device: string;
  loc: string;
  time: string;
  current: boolean;
}

/** GET /api/auth/sessions (200). */
export interface AuthSessionsResponse {
  sessions: AuthSessionRow[];
  /** "db" when read from device_sessions, "jwt-fallback" when the DB could not be read. */
  source: "db" | "jwt-fallback";
  /** Signup date as ISO-8601; null when the users row could not be read. */
  memberSince: string | null;
  /** Development only: why the DB read failed. */
  error?: string;
}

/** GET /api/internal/agent-sync/status (always 200). */
export interface AgentSyncStatusResponse {
  active: boolean;
  /** Null when the user has never synced or the backend was unreachable. */
  lastSync: string | null;
  /** "db" when sourced from a local mirror, "proxy" when forwarded from FastAPI, "fallback" otherwise. */
  source: "proxy" | "fallback" | "db";
  /** Free-form diagnostic (only in dev). */
  reason?: string;
}
