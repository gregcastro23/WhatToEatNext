/**
 * Follow Database Service — the asymmetric public-reach layer of the social
 * graph (migration 64). Commensalships stay the mutual inner circle; a follow
 * is one-directional and needs no consent.
 *
 * Block semantics (no DB trigger by design — see migration 64 comment):
 *   - WRITE side is FAIL-CLOSED: follow() refuses when the blocked-pair check
 *     cannot be completed (a transient 500 on a follow button is cheap; a
 *     follow slipping past a block notifies the blocker — the worse failure).
 *   - blockCommensal() purges existing edges both ways (purgeFollowsBetween).
 *   - LIST reads stay fail-open with a blocked-pair anti-join as backstop for
 *     viewer↔listed pairs the write-time purge can't know about.
 */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import type {
  FollowCounts,
  FollowListEntry,
  FollowListPage,
  FollowState,
  FollowWriteResult,
} from "@/types/social";

const MAX_LIST_LIMIT = 50;
const DEFAULT_LIST_LIMIT = 30;

/** Blocked-pair predicate reused across write/read paths (unordered pair). */
const BLOCKED_PAIR_SQL = `
  SELECT 1 FROM commensalships
   WHERE status = 'blocked'
     AND ((requester_id = $1::uuid AND addressee_id = $2::uuid)
       OR (requester_id = $2::uuid AND addressee_id = $1::uuid))
   LIMIT 1`;

interface FollowListRow {
  user_id: string;
  created_at: Date | string;
  name: string;
  avatar_url: string | null;
  is_agent: boolean;
  dominant_element: string | null;
  followed_by_viewer: boolean;
}

/** Opaque keyset cursor: `<created_at ISO>|<user id>`. */
function encodeCursor(createdAt: Date | string, userId: string): string {
  const iso = createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString();
  return Buffer.from(`${iso}|${userId}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; userId: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const idx = raw.indexOf("|");
    if (idx <= 0) return null;
    const createdAt = raw.slice(0, idx);
    const userId = raw.slice(idx + 1);
    if (Number.isNaN(Date.parse(createdAt)) || !userId) return null;
    return { createdAt, userId };
  } catch {
    return null;
  }
}

function rowToEntry(row: FollowListRow): FollowListEntry {
  return {
    userId: String(row.user_id),
    name: row.name || "Alchemist",
    avatarUrl: row.avatar_url || null,
    isAgent: row.is_agent === true,
    dominantElement: row.dominant_element || null,
    followedByViewer: row.followed_by_viewer === true,
  };
}

class FollowDatabaseService {
  /**
   * Create a follow edge. Idempotent: re-following a standing edge returns
   * `created: false` (the signal that suppresses duplicate notifications and
   * practice rewards). Fail-closed on the block check — errors THROW so the
   * route 500s instead of letting a follow slip past a block.
   */
  async follow(followerId: string, followeeId: string): Promise<FollowWriteResult> {
    if (followerId === followeeId) return { ok: false, reason: "self" };

    // Target must exist and be active. Agents are followable — they're
    // first-class users; the ROUTE skips notification/practice for them.
    const target = await executeQuery<{ is_agent: boolean }>(
      `SELECT COALESCE(is_agent, false) AS is_agent
         FROM users WHERE id = $1::uuid AND is_active = true`,
      [followeeId],
    );
    if (target.rows.length === 0) return { ok: false, reason: "not_found" };
    const followeeIsAgent = target.rows[0].is_agent === true;

    // FAIL-CLOSED block check: no try/catch — a failure here must abort.
    const blocked = await executeQuery(BLOCKED_PAIR_SQL, [followerId, followeeId]);
    if (blocked.rows.length > 0) return { ok: false, reason: "blocked" };

    const ins = await executeQuery(
      `INSERT INTO follows (follower_id, followee_id)
       VALUES ($1::uuid, $2::uuid)
       ON CONFLICT (follower_id, followee_id) DO NOTHING`,
      [followerId, followeeId],
    );
    return { ok: true, created: (ins.rowCount ?? 0) === 1, followeeIsAgent };
  }

  /** Idempotent unfollow. Returns whether an edge was actually removed. */
  async unfollow(followerId: string, followeeId: string): Promise<boolean> {
    const res = await executeQuery(
      `DELETE FROM follows WHERE follower_id = $1::uuid AND followee_id = $2::uuid`,
      [followerId, followeeId],
    );
    return (res.rowCount ?? 0) > 0;
  }

  async getFollowCounts(userId: string): Promise<FollowCounts> {
    const res = await executeQuery<{ followers: string; following: string }>(
      `SELECT
         (SELECT COUNT(*) FROM follows WHERE followee_id = $1::uuid) AS followers,
         (SELECT COUNT(*) FROM follows WHERE follower_id = $1::uuid) AS following`,
      [userId],
    );
    const row = res.rows[0];
    return {
      followers: Number(row?.followers ?? 0),
      following: Number(row?.following ?? 0),
    };
  }

  /** Both directions of viewer↔target in one query. */
  async getFollowState(viewerId: string, targetId: string): Promise<FollowState> {
    const res = await executeQuery<{ follows: boolean; followed_by: boolean }>(
      `SELECT
         EXISTS(SELECT 1 FROM follows WHERE follower_id = $1::uuid AND followee_id = $2::uuid) AS follows,
         EXISTS(SELECT 1 FROM follows WHERE follower_id = $2::uuid AND followee_id = $1::uuid) AS followed_by`,
      [viewerId, targetId],
    );
    const row = res.rows[0];
    return {
      follows: row?.follows === true,
      followedBy: row?.followed_by === true,
    };
  }

  /** True when the followee's first-ever follower row just landed. */
  async hasExactlyOneFollower(followeeId: string): Promise<boolean> {
    const res = await executeQuery<{ n: string }>(
      `SELECT COUNT(*)::int AS n FROM follows WHERE followee_id = $1::uuid`,
      [followeeId],
    );
    return Number(res.rows[0]?.n ?? 0) === 1;
  }

  async listFollowers(
    userId: string,
    viewerId: string | null,
    opts: { limit?: number; cursor?: string | null } = {},
  ): Promise<FollowListPage> {
    return this.listEdges("followers", userId, viewerId, opts);
  }

  async listFollowing(
    userId: string,
    viewerId: string | null,
    opts: { limit?: number; cursor?: string | null } = {},
  ): Promise<FollowListPage> {
    return this.listEdges("following", userId, viewerId, opts);
  }

  /**
   * Shared list read. Keyset-paginated on (created_at, listed user id) DESC.
   * Block filtering at read time: the anti-join hides anyone in a blocked
   * pair with the VIEWER (write-time purge already handled owner↔listed).
   * Fail-open by returning [] on error — lists are display, not a boundary.
   */
  private async listEdges(
    direction: "followers" | "following",
    userId: string,
    viewerId: string | null,
    opts: { limit?: number; cursor?: string | null },
  ): Promise<FollowListPage> {
    const limit = Math.min(Math.max(1, opts.limit ?? DEFAULT_LIST_LIMIT), MAX_LIST_LIMIT);
    const cursor = opts.cursor ? decodeCursor(opts.cursor) : null;

    const listedCol = direction === "followers" ? "f.follower_id" : "f.followee_id";
    const anchorCol = direction === "followers" ? "f.followee_id" : "f.follower_id";

    const params: unknown[] = [userId, viewerId, limit];
    let cursorClause = "";
    if (cursor) {
      params.push(cursor.createdAt, cursor.userId);
      cursorClause = `AND (f.created_at, ${listedCol}) < ($4::timestamptz, $5::uuid)`;
    }

    try {
      const res = await executeQuery<FollowListRow>(
        `SELECT ${listedCol} AS user_id, f.created_at,
                COALESCE(NULLIF(up.name, ''), NULLIF(u.name, ''), 'Alchemist') AS name,
                COALESCE(up.avatar_url, u.image) AS avatar_url,
                COALESCE(u.is_agent, false) AS is_agent,
                up.dominant_element,
                CASE WHEN $2::uuid IS NULL THEN false
                     ELSE EXISTS(SELECT 1 FROM follows vf
                                  WHERE vf.follower_id = $2::uuid
                                    AND vf.followee_id = ${listedCol})
                END AS followed_by_viewer
           FROM follows f
           JOIN users u ON u.id = ${listedCol}
           LEFT JOIN user_profiles up ON up.user_id = u.id
          WHERE ${anchorCol} = $1::uuid
            AND ($2::uuid IS NULL OR NOT EXISTS (
                  SELECT 1 FROM commensalships b
                   WHERE b.status = 'blocked'
                     AND ((b.requester_id = $2::uuid AND b.addressee_id = ${listedCol})
                       OR (b.requester_id = ${listedCol} AND b.addressee_id = $2::uuid))))
            ${cursorClause}
          ORDER BY f.created_at DESC, ${listedCol} DESC
          LIMIT $3`,
        params,
      );

      const entries = res.rows.map(rowToEntry);
      const last = res.rows[res.rows.length - 1];
      const nextCursor =
        res.rows.length === limit && last
          ? encodeCursor(last.created_at, String(last.user_id))
          : null;
      return { entries, nextCursor };
    } catch (error) {
      _logger.error(`listEdges(${direction}) failed:`, error);
      return { entries: [], nextCursor: null };
    }
  }

  /**
   * Remove edges both ways between a newly-blocked pair. Called from
   * commensalDatabaseService.blockCommensal — log-and-continue there (the
   * block itself must not fail because the purge did).
   */
  async purgeFollowsBetween(a: string, b: string): Promise<number> {
    const res = await executeQuery(
      `DELETE FROM follows
        WHERE (follower_id = $1::uuid AND followee_id = $2::uuid)
           OR (follower_id = $2::uuid AND followee_id = $1::uuid)`,
      [a, b],
    );
    return res.rowCount ?? 0;
  }
}

export const followDatabase = new FollowDatabaseService();
