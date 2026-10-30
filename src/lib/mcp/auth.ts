/**
 * MCP Auth + Token Gate
 *
 * Resolves the calling user from one of:
 *   1. `_meta.apiKey` on the tool call arguments (the canonical path —
 *      Claude Desktop / Cursor configs pass it through every call).
 *   2. `MCP_USER_API_KEY` or `ALCHM_MCP_USER_API_KEY` env var.
 *   3. An explicit `_meta.internalSecret` matching `INTERNAL_API_SECRET`
 *      resolves to the synthetic probe user (cron / internal callers).
 *
 * Without DATABASE_URL, credential-free reads use anonymous demo mode.
 * Explicit credentials cannot be verified and fail closed; writes require
 * an authenticated owner and settled payment (see ./billing).
 *
 * @file mcp-server/src/auth.ts
 */

import { createHash } from "node:crypto";
import { safeEqual } from "@/lib/hooks/secureCompare";

const isServerWithDB = (): boolean => !!process.env.DATABASE_URL;

let dbModule: typeof import("@/lib/database/connection") | null | undefined =
  undefined;

async function getDb(): Promise<
  typeof import("@/lib/database/connection") | null
> {
  if (!isServerWithDB()) return null;
  if (dbModule !== undefined) return dbModule;
  try {
    dbModule = await import("@/lib/database/connection");
  } catch {
    dbModule = null;
  }
  return dbModule;
}

export interface ResolvedCaller {
  userId: string | null;
  apiKeyId: string | null;
  /** Free-form identifier persisted on the invocation row. */
  caller: string;
  /** True when the caller is the synthetic-probe internal user. */
  isSynthetic: boolean;
  /**
   * `api_keys.rate_limit_tier` value for the key that authenticated this
   * call. Null when no key was used (anonymous, synthetic, or DB
   * unavailable). Drives the per-key RPM cap via `rpmForTier()`.
   */
  rateLimitTier: string | null;
  authError?: "INVALID_KEY" | "UNAVAILABLE";
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function extractApiKey(args: Record<string, unknown>): string | null {
  const meta = args._meta;
  if (isRecord(meta)) {
    const m = meta;
    if (typeof m.apiKey === "string" && m.apiKey.length > 0) return m.apiKey;
    if (typeof m.authKey === "string" && m.authKey.length > 0) return m.authKey;
  }
  if (typeof args._authKey === "string" && args._authKey.length > 0) {
    return args._authKey;
  }
  if (typeof args._apiKey === "string" && args._apiKey.length > 0) {
    return args._apiKey;
  }
  if (process.env.MCP_USER_API_KEY) return process.env.MCP_USER_API_KEY;
  if (process.env.ALCHM_MCP_USER_API_KEY)
    return process.env.ALCHM_MCP_USER_API_KEY;
  return null;
}

function extractCallerTag(args: Record<string, unknown>): string {
  const meta = args._meta;
  if (isRecord(meta)) {
    const c = meta.caller;
    if (typeof c === "string" && c.length > 0) return c.slice(0, 64);
  }
  return "unknown";
}

/**
 * Resolve the caller for one tool invocation. Never throws — when the
 * key is invalid or no DB is available, returns an anonymous record so
 * the tool can still produce a degraded response.
 */
export async function resolveCaller(
  args: Record<string, unknown>,
): Promise<ResolvedCaller> {
  const callerTag = extractCallerTag(args);

  // Internal cron secret path — used by the synthetic probe so it
  // doesn't need to mint and ship a real API key.
  const internal = isRecord(args._meta) ? args._meta : undefined;
  const internalSecret =
    typeof internal?.internalSecret === "string"
      ? internal.internalSecret
      : undefined;
  if (safeEqual(internalSecret, process.env.INTERNAL_API_SECRET)) {
    return {
      userId: process.env.SYNTHETIC_PROBE_USER_ID ?? null,
      apiKeyId: null,
      caller: callerTag === "unknown" ? "synthetic-probe" : callerTag,
      isSynthetic: true,
      rateLimitTier: null,
    };
  }

  const key = extractApiKey(args);
  if (!key) {
    return {
      userId: null,
      apiKeyId: null,
      caller: callerTag,
      isSynthetic: false,
      rateLimitTier: null,
    };
  }

  const db = await getDb();
  if (!db) {
    // Explicit credentials must never silently downgrade to anonymous access.
    return {
      userId: null,
      apiKeyId: null,
      caller: callerTag,
      isSynthetic: false,
      rateLimitTier: null,
      authError: "UNAVAILABLE",
    };
  }

  try {
    const result = await db.executeQuery<{
      id: string;
      user_id: string | null;
      rate_limit_tier: string | null;
    }>(
      `UPDATE api_keys
         SET last_used_at = NOW(),
             usage_count = usage_count + 1
       WHERE key_hash = $1
         AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
       RETURNING id, user_id, rate_limit_tier`,
      [hashKey(key)],
    );
    const [keyRow] = result.rows;
    if (!keyRow) {
      return {
        userId: null,
        apiKeyId: null,
        caller: callerTag,
        isSynthetic: false,
        rateLimitTier: null,
        authError: "INVALID_KEY",
      };
    }
    return {
      userId: keyRow.user_id,
      apiKeyId: keyRow.id,
      caller: callerTag,
      isSynthetic: false,
      rateLimitTier: keyRow.rate_limit_tier ?? null,
    };
  } catch (err) {
    process.stderr.write(`[mcp/auth] key lookup failed: ${String(err)}\n`);
    return {
      userId: null,
      apiKeyId: null,
      caller: callerTag,
      isSynthetic: false,
      rateLimitTier: null,
      authError: "UNAVAILABLE",
    };
  }
}
