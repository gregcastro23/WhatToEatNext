/**
 * Comment enforcement — the safety rules for feed comments (PR 5), kept out of
 * the service and routes so they can be unit-tested in isolation.
 *
 *  - body sanitation: trim, strip control chars, clamp 1–1000.
 *  - blocked-pair predicate (unordered) reused on read + write. Bodies are
 *    identity-bearing, so blocks filter BOTH directions: a blocked pair never
 *    sees each other's comments (read) and can't comment where the other is the
 *    event actor (write → 403 neutral).
 */

import { executeQuery } from "@/lib/database";

export const COMMENT_MIN = 1;
export const COMMENT_MAX = 1000;

// C0/C1 control chars, keeping \t (0x09) and \n (0x0A).
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;

/**
 * Normalize a raw comment body: strip control chars, trim, and clamp length.
 * Returns null when the result is empty or over the max (the caller 400s).
 * Bodies are stored PLAIN — the client escapes + linkifies (PR 3's rule: only
 * http(s), rel="…ugc").
 */
export function sanitizeCommentBody(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.replace(CONTROL_CHARS, "").trim();
  if (trimmed.length < COMMENT_MIN || trimmed.length > COMMENT_MAX) return null;
  return trimmed;
}

/** Unordered blocked-pair predicate (same shape as followDatabaseService). */
const BLOCKED_PAIR_SQL = `
  SELECT 1 FROM commensalships
   WHERE status = 'blocked'
     AND ((requester_id = $1::uuid AND addressee_id = $2::uuid)
       OR (requester_id = $2::uuid AND addressee_id = $1::uuid))
   LIMIT 1`;

/**
 * True when users a and b are blocked in EITHER direction. FAIL-CLOSED: the
 * caller (POST) must treat a thrown/true result as "refuse" — a comment
 * slipping past a block into the blocker's notification is the worse failure.
 * This throws on DB error so the route can 500 rather than silently allow.
 */
export async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  if (!a || !b || a === b) return false;
  const res = await executeQuery(BLOCKED_PAIR_SQL, [a, b]);
  return (res.rows?.length ?? 0) > 0;
}
