/**
 * Server-side display-identity resolver — the ONE helper that turns user ids
 * into the real name + avatar shown on identity-bearing surfaces (feed
 * comments, PR 5). Comments are always real-identity (locked decision 4); PR 4
 * already flipped the feed default and owns the avatar column, so the read
 * chain is the same one the follow lists use:
 *
 *   name  = COALESCE(user_profiles.name, users.name)   ← 'Alchemist' last resort
 *   image = COALESCE(user_profiles.avatar_url, users.image)  ← null → client
 *           renders the element sigil fallback (never an invented face).
 *
 * Deliberate asymmetry vs cooked cards: a cooked card's POSTER stays
 * chart-persona (the share route forces shareName:false), while COMMENTERS are
 * real-identity. That is by design. This helper NEVER returns an email.
 *
 * When PR 4's avatar/handle pipeline evolves, only this helper's internals
 * change — comment code stays put.
 */

import { executeQuery } from "@/lib/database";

export interface DisplayIdentity {
  userId: string;
  name: string;
  image: string | null;
  isAgent: boolean;
  /** Dominant element for the client sigil fallback when image is null. */
  dominantElement: string | null;
}

/**
 * Resolve display identity for a batch of user ids in one query. Returns a map
 * keyed by user id; ids with no row are simply absent (callers default). Empty
 * input short-circuits without a DB round-trip.
 */
export async function resolveDisplayIdentity(
  userIds: string[],
): Promise<Record<string, DisplayIdentity>> {
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (unique.length === 0) return {};

  const res = await executeQuery<{
    id: string;
    name: string | null;
    image: string | null;
    is_agent: boolean;
    dominant_element: string | null;
  }>(
    `SELECT u.id,
            COALESCE(NULLIF(up.name, ''), NULLIF(u.name, ''), 'Alchemist') AS name,
            COALESCE(up.avatar_url, u.image) AS image,
            COALESCE(u.is_agent, false) AS is_agent,
            up.dominant_element
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id = ANY($1::uuid[])`,
    [unique],
  );

  const out: Record<string, DisplayIdentity> = {};
  for (const row of res.rows) {
    out[row.id] = {
      userId: row.id,
      name: row.name || "Alchemist",
      image: row.image || null,
      isAgent: row.is_agent === true,
      dominantElement: row.dominant_element || null,
    };
  }
  return out;
}
