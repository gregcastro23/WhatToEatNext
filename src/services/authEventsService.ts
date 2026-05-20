/**
 * Auth Events Service
 *
 * Structured audit log for sign-in / sign-out / session lifecycle events.
 * Backs admin "login attempts" metrics and per-user debug history.
 *
 * Design:
 *  - Writes are fire-and-forget: callers `void logAuthEvent(...)` so a slow
 *    or failing log row never blocks the auth flow itself.
 *  - All writes go to `auth_events`. Without DATABASE_URL we fall back to a
 *    bounded in-memory ring so dev/test still works.
 *  - The `ipHash` field is a one-way SHA-256 of the request IP — we don't
 *    want raw addresses in the table (PII).
 *
 * @file src/services/authEventsService.ts
 */

import crypto from "node:crypto";
import { _logger } from "@/lib/logger";

export type AuthEventStatus = "success" | "failure" | "info";

export type AuthEventType =
  // Sign-in lifecycle (in order)
  | "signin_started"
  | "signin_user_lookup_success"
  | "signin_user_lookup_failed"
  | "signin_user_created"
  | "signin_user_create_failed"
  | "signin_role_promoted"
  | "signin_account_link_success"
  | "signin_account_link_failed"
  | "signin_last_login_updated"
  | "signin_last_login_update_failed"
  | "signin_complete"
  | "signin_aborted"
  // OAuth provider error (rendered on /auth/error)
  | "signin_provider_error"
  // Sign-out & session events
  | "signout"
  | "session_revoked"
  | "session_revoke_all";

export interface AuthEventInput {
  type: AuthEventType;
  status: AuthEventStatus;
  userId?: string | null;
  email?: string | null;
  provider?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
}

interface InMemoryEvent extends Omit<AuthEventInput, "ip"> {
  id: number;
  ipHash: string | null;
  createdAt: Date;
}

const MEMORY_RING_SIZE = 5000;
const memoryEvents: InMemoryEvent[] = [];
let memoryId = 1;

const isServerWithDB = (): boolean =>
  typeof window === "undefined" && !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database") | null = null;
async function getDbModule() {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.warn("[authEvents] Database module unavailable");
    }
  }
  return dbModule;
}

const IP_HASH_SALT =
  process.env.AUTH_EVENTS_IP_SALT ||
  process.env.AUTH_SECRET ||
  "auth-events-default-salt-rotate-me";

function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return crypto.createHash("sha256").update(`${IP_HASH_SALT}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Fire-and-forget logger. Never throws to the caller. Returns a Promise so
 * tests can await it, but in production code you should `void` the call.
 */
export async function logAuthEvent(event: AuthEventInput): Promise<void> {
  const ipHash = hashIp(event.ip);
  const userAgent = event.userAgent?.slice(0, 512) ?? null;
  const errorMessage = event.errorMessage?.slice(0, 2000) ?? null;

  try {
    const db = await getDbModule();
    if (db) {
      await db.executeQuery(
        `INSERT INTO auth_events
           (user_id, email, event_type, status, provider, ip_hash, user_agent, error_code, error_message, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)`,
        [
          event.userId ?? null,
          event.email ? event.email.toLowerCase() : null,
          event.type,
          event.status,
          event.provider ?? null,
          ipHash,
          userAgent,
          event.errorCode ?? null,
          errorMessage,
          JSON.stringify(event.metadata ?? {}),
        ],
      );
      return;
    }
  } catch (err) {
    // Log to stderr but don't propagate — auth flow must not break on telemetry.
    _logger.warn("[authEvents] DB insert failed, falling back to memory:", err);
  }

  memoryEvents.push({
    id: memoryId++,
    type: event.type,
    status: event.status,
    userId: event.userId ?? null,
    email: event.email ?? null,
    provider: event.provider ?? null,
    ipHash,
    userAgent,
    errorCode: event.errorCode ?? null,
    errorMessage,
    metadata: event.metadata,
    createdAt: new Date(),
  });
  if (memoryEvents.length > MEMORY_RING_SIZE) {
    memoryEvents.shift();
  }
}

// ─── Query helpers (admin/metrics use) ────────────────────────────────

export interface AuthEventCounts {
  total: number;
  successes: number;
  failures: number;
  byType: Array<{ type: string; status: string; count: number }>;
}

/**
 * Aggregate event counts over the last `windowMs` milliseconds.
 * Default window: 24 hours.
 */
export async function getEventCounts(
  windowMs: number = 24 * 60 * 60 * 1000,
): Promise<AuthEventCounts> {
  const sinceDate = new Date(Date.now() - windowMs);

  try {
    const db = await getDbModule();
    if (db) {
      const result = await db.executeQuery(
        `SELECT event_type, status, COUNT(*)::int AS count
           FROM auth_events
           WHERE created_at >= $1
           GROUP BY event_type, status
           ORDER BY count DESC`,
        [sinceDate],
      );
      const byType = result.rows.map((r: any) => ({
        type: String(r.event_type),
        status: String(r.status),
        count: Number(r.count),
      }));
      const successes = byType
        .filter((r) => r.status === "success")
        .reduce((a, b) => a + b.count, 0);
      const failures = byType
        .filter((r) => r.status === "failure")
        .reduce((a, b) => a + b.count, 0);
      return {
        total: byType.reduce((a, b) => a + b.count, 0),
        successes,
        failures,
        byType,
      };
    }
  } catch (err) {
    _logger.warn("[authEvents] getEventCounts DB failed, using memory:", err);
  }

  const since = sinceDate.getTime();
  const recent = memoryEvents.filter((e) => e.createdAt.getTime() >= since);
  const bucket = new Map<string, number>();
  for (const e of recent) {
    const k = `${e.type}|${e.status}`;
    bucket.set(k, (bucket.get(k) ?? 0) + 1);
  }
  const byType = Array.from(bucket.entries()).map(([k, count]) => {
    const [type, status] = k.split("|");
    return { type, status, count };
  });
  return {
    total: recent.length,
    successes: recent.filter((e) => e.status === "success").length,
    failures: recent.filter((e) => e.status === "failure").length,
    byType,
  };
}

/**
 * Fetch the last `limit` events for a single user. Used in admin UI for
 * per-user audit history.
 */
export async function getUserEvents(
  userId: string,
  limit: number = 50,
): Promise<
  Array<{
    id: number;
    type: string;
    status: string;
    provider: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>
> {
  try {
    const db = await getDbModule();
    if (db) {
      const result = await db.executeQuery(
        `SELECT id, event_type, status, provider, error_code, error_message, metadata, created_at
           FROM auth_events
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT $2`,
        [userId, Math.min(Math.max(limit, 1), 500)],
      );
      return result.rows.map((r: any) => ({
        id: Number(r.id),
        type: String(r.event_type),
        status: String(r.status),
        provider: r.provider ?? null,
        errorCode: r.error_code ?? null,
        errorMessage: r.error_message ?? null,
        metadata: (r.metadata ?? {}) as Record<string, unknown>,
        createdAt: new Date(r.created_at).toISOString(),
      }));
    }
  } catch (err) {
    _logger.warn("[authEvents] getUserEvents DB failed, using memory:", err);
  }

  return memoryEvents
    .filter((e) => e.userId === userId)
    .slice(-limit)
    .reverse()
    .map((e) => ({
      id: e.id,
      type: e.type,
      status: e.status,
      provider: e.provider ?? null,
      errorCode: e.errorCode ?? null,
      errorMessage: e.errorMessage ?? null,
      metadata: e.metadata ?? {},
      createdAt: e.createdAt.toISOString(),
    }));
}
