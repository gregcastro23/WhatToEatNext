/**
 * API key minting + hashing.
 *
 * The plaintext key is shown to the user EXACTLY ONCE at mint time;
 * persistence stores only `sha256(plaintext)`. Lookups (in
 * `src/lib/mcp/auth.ts`) re-hash the inbound key and look it up by
 * `key_hash`.
 *
 * Format: `sk_alchm_live_<43-char base64url>` — fixed 32-byte random
 * payload encoded url-safely. The prefix is searchable in logs and
 * tells users at a glance what kind of token they hold.
 */

import { createHash, randomBytes } from "node:crypto";

const PLAINTEXT_PREFIX = "sk_alchm_live_";

export interface MintedKey {
  /** The full plaintext key. Show once, never persist. */
  plaintext: string;
  /** sha256 hex digest — what gets written to `api_keys.key_hash`. */
  hash: string;
}

/**
 * Generate a new API key. The plaintext is 32 bytes of CSPRNG entropy
 * encoded base64url (43 chars, no padding) with the `sk_alchm_live_`
 * prefix attached.
 */
export function generateApiKey(): MintedKey {
  const random = randomBytes(32);
  const body = random
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  const plaintext = `${PLAINTEXT_PREFIX}${body}`;
  return { plaintext, hash: hashApiKey(plaintext) };
}

/** sha256 hex digest of an API key. Used for both mint and lookup. */
export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/** Best-effort visual: `sk_alchm_live_…aBcD` — used in list UI. */
export function maskApiKey(plaintext: string): string {
  if (!plaintext.startsWith(PLAINTEXT_PREFIX)) {
    return `…${plaintext.slice(-4)}`;
  }
  const tail = plaintext.slice(-4);
  return `${PLAINTEXT_PREFIX}…${tail}`;
}
