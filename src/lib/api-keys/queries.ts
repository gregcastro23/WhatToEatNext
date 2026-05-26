/**
 * Postgres queries for `api_keys` — used by the user-facing API key
 * management routes (`src/app/api/account/api-keys/*`).
 *
 * Soft-revoke (`is_active = false`) is the canonical "revoke" operation
 * — `mcp_invocations.api_key_id` has `ON DELETE SET NULL` so a hard
 * delete would orphan historical telemetry. Soft-revoke preserves the
 * audit trail and the user can still see "revoked" keys until pruned.
 */

import { executeQuery } from "@/lib/database";
import { generateApiKey, type MintedKey } from "./keyMint";

const DEFAULT_SCOPES = ["mcp:invoke"] as const;

/** Strip leading/trailing whitespace and cap at 32 chars per scope. */
function normalizeScopes(input: unknown): string[] {
  if (!Array.isArray(input)) return [...DEFAULT_SCOPES];
  const seen = new Set<string>();
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const s = raw.trim().slice(0, 32);
    if (s.length === 0) continue;
    seen.add(s);
  }
  return seen.size === 0 ? [...DEFAULT_SCOPES] : Array.from(seen);
}

/** Validate + canonicalize a future expires-at ISO string. */
function normalizeExpiresAt(input: unknown): Date | null {
  if (input == null) return null;
  if (typeof input !== "string" || input.length === 0) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  if (d.getTime() <= Date.now()) return null;
  return d;
}

export interface ApiKeyRow {
  id: string;
  name: string;
  scopes: string[];
  rate_limit_tier: string;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
}

export interface MintApiKeyInput {
  userId: string;
  name: string;
  scopes?: unknown;
  expiresAt?: unknown;
  rateLimitTier?: string;
}

export interface MintApiKeyResult {
  row: ApiKeyRow;
  /** Plaintext — show ONCE, do not persist. */
  plaintext: string;
}

/**
 * Insert a new key row. Returns the persisted row + the plaintext key
 * (the only opportunity to surface the plaintext to the caller).
 */
export async function mintApiKey(
  input: MintApiKeyInput,
): Promise<MintApiKeyResult> {
  const name = input.name.trim().slice(0, 100);
  if (name.length === 0) {
    throw new Error("name must be non-empty");
  }
  const scopes = normalizeScopes(input.scopes);
  const expiresAt = normalizeExpiresAt(input.expiresAt);
  const rateLimitTier =
    typeof input.rateLimitTier === "string" && input.rateLimitTier.length > 0
      ? input.rateLimitTier.slice(0, 20)
      : "authenticated";

  const minted: MintedKey = generateApiKey();
  const result = await executeQuery<ApiKeyRow>(
    `INSERT INTO api_keys (user_id, name, key_hash, scopes, rate_limit_tier, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, scopes, rate_limit_tier, is_active, expires_at, last_used_at, usage_count, created_at`,
    [input.userId, name, minted.hash, scopes, rateLimitTier, expiresAt],
  );
  if (result.rows.length === 0) {
    throw new Error("Failed to persist api_key");
  }
  return { row: result.rows[0], plaintext: minted.plaintext };
}

/** List a user's keys (active and revoked), newest first. */
export async function listUserApiKeys(userId: string): Promise<ApiKeyRow[]> {
  const result = await executeQuery<ApiKeyRow>(
    `SELECT id, name, scopes, rate_limit_tier, is_active, expires_at, last_used_at, usage_count, created_at
       FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100`,
    [userId],
  );
  return result.rows;
}

/**
 * Soft-revoke a key owned by `userId`. Returns the revoked row id, or
 * null when the key doesn't exist, isn't owned by this user, or was
 * already revoked. Never hard-deletes — preserves the FK chain from
 * `mcp_invocations.api_key_id`.
 */
export async function revokeApiKey(
  userId: string,
  keyId: string,
): Promise<string | null> {
  const result = await executeQuery<{ id: string }>(
    `UPDATE api_keys
        SET is_active = false
      WHERE id = $1 AND user_id = $2 AND is_active = true
      RETURNING id`,
    [keyId, userId],
  );
  return result.rows[0]?.id ?? null;
}
