/**
 * feedCommentsDatabaseService — comments attached to feed events (PR 5).
 *
 * Flat threads v1 (no reply_to_id). Author display is real-identity, resolved
 * through the single `resolveDisplayIdentity` helper (never an email). Reads
 * exclude deleted + hidden rows (except the viewer's own hidden) and filter
 * blocked pairs BOTH directions via a NOT EXISTS anti-join. Bodies are stored
 * plain; the client escapes + linkifies.
 */

import { executeQuery } from "@/lib/database";
import { resolveFeedActorReveal } from "@/lib/feed/identity";
import { _logger } from "@/lib/logger";
import { resolveDisplayIdentity } from "@/lib/social/identity";

export interface FeedComment {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  authorIsAgent: boolean;
  authorElement: string | null;
  body: string;
  createdAt: string;
  /** Author is the event's actor (design-spec §3.4: copper name tint). */
  isEventActor: boolean;
}

export interface CommentPage {
  comments: FeedComment[]; // ascending (oldest→newest) for render
  nextCursor: string | null; // pass back as ?before= for older comments
}

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 50;
const AUTO_HIDE_THRESHOLD = 3;

interface CommentRow {
  id: string;
  event_id: string;
  author_id: string;
  body: string;
  created_at: Date | string;
  event_actor_id: string;
  // Event-identity signal — used ONLY for comments authored by the event actor,
  // so an anonymous poster's own comment can't de-anonymize their post.
  event_actor_is_agent: boolean;
  event_actor_share_identity: boolean | null;
  event_metadata: unknown;
}

/**
 * The event actor's OWN comment must inherit the post's anonymity: if the feed
 * event was posted concealed (PR 4 stamp share=false / legacy opt-out / current
 * opt-out), rendering their real name here — and the copper "the cook" marker —
 * would silently link the anonymous post to the real person. So for any comment
 * where the author IS the event actor, we gate on resolveFeedActorReveal of the
 * EVENT: concealed → "Anonymous Alchemist", no avatar, no isEventActor marker.
 * Every OTHER commenter keeps real identity (locked decision 4).
 */
function eventActorRevealed(row: CommentRow): boolean {
  return resolveFeedActorReveal({
    isAgent: row.event_actor_is_agent === true,
    metadata: row.event_metadata,
    currentShareIdentity: row.event_actor_share_identity,
  });
}

function encodeCursor(createdAt: Date | string, id: string): string {
  const iso = createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString();
  return Buffer.from(`${iso}|${id}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; id: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const idx = raw.indexOf("|");
    if (idx <= 0) return null;
    const createdAt = raw.slice(0, idx);
    const id = raw.slice(idx + 1);
    if (Number.isNaN(Date.parse(createdAt)) || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

class FeedCommentsDatabaseService {
  /** The actor of a feed event (poster). null when the event doesn't exist. */
  async getEventActor(eventId: string): Promise<string | null> {
    const res = await executeQuery<{ actor_id: string }>(
      "SELECT actor_id FROM feed_events WHERE id = $1::uuid",
      [eventId],
    );
    return res.rows[0]?.actor_id ?? null;
  }

  /**
   * The event actor plus whether their identity is REVEALED on the post itself
   * (resolveFeedActorReveal). Used so the actor's own comment inherits the
   * post's anonymity — an anonymous poster's comment must not surface their
   * real name or the "the cook" marker.
   */
  async getEventActorReveal(eventId: string): Promise<{ actorId: string; revealed: boolean } | null> {
    const res = await executeQuery<{
      actor_id: string;
      is_agent: boolean;
      share_identity: boolean | null;
      metadata_payload: unknown;
    }>(
      `SELECT f.actor_id,
              COALESCE(u.is_agent, false) AS is_agent,
              up.share_identity,
              f.metadata_payload
         FROM feed_events f
         JOIN users u ON u.id = f.actor_id
         LEFT JOIN user_profiles up ON up.user_id = f.actor_id
        WHERE f.id = $1::uuid`,
      [eventId],
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      actorId: row.actor_id,
      revealed: resolveFeedActorReveal({
        isAgent: row.is_agent === true,
        metadata: row.metadata_payload,
        currentShareIdentity: row.share_identity,
      }),
    };
  }

  /**
   * Keyset-paginated comment page (newest-first fetch, returned ascending).
   * `viewerId` scopes the blocked-pair anti-join + the "own hidden" exception;
   * pass null for anonymous readers (hidden rows all excluded, no block filter).
   */
  async listComments(
    eventId: string,
    viewerId: string | null,
    opts: { limit?: number; before?: string | null } = {},
  ): Promise<CommentPage> {
    const limit = Math.min(Math.max(1, opts.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
    const cursor = opts.before ? decodeCursor(opts.before) : null;

    const params: unknown[] = [eventId, viewerId, limit];
    let cursorClause = "";
    if (cursor) {
      params.push(cursor.createdAt, cursor.id);
      cursorClause = "AND (c.created_at, c.id) < ($4::timestamptz, $5::uuid)";
    }

    try {
      const res = await executeQuery<CommentRow>(
        `SELECT c.id, c.event_id, c.author_id, c.body, c.created_at,
                f.actor_id AS event_actor_id,
                f.metadata_payload AS event_metadata,
                COALESCE(eu.is_agent, false) AS event_actor_is_agent,
                eup.share_identity AS event_actor_share_identity
           FROM feed_comments c
           JOIN feed_events f ON f.id = c.event_id
           JOIN users eu ON eu.id = f.actor_id
           LEFT JOIN user_profiles eup ON eup.user_id = f.actor_id
          WHERE c.event_id = $1::uuid
            AND c.deleted_at IS NULL
            -- hidden rows are excluded, except the viewer's own
            AND (NOT c.hidden OR c.author_id = $2::uuid)
            -- blocked BOTH directions between viewer and author
            AND ($2::uuid IS NULL OR NOT EXISTS (
                  SELECT 1 FROM commensalships b
                   WHERE b.status = 'blocked'
                     AND ((b.requester_id = $2::uuid AND b.addressee_id = c.author_id)
                       OR (b.requester_id = c.author_id AND b.addressee_id = $2::uuid))))
            ${cursorClause}
          ORDER BY c.created_at DESC, c.id DESC
          LIMIT $3`,
        params,
      );

      const rows = res.rows;
      const identities = await resolveDisplayIdentity(rows.map((r) => r.author_id));

      const descending: FeedComment[] = rows.map((row) => {
        const identity = identities[row.author_id];
        const isActor = row.author_id === row.event_actor_id;
        // The event actor's own comment inherits the post's anonymity.
        const conceal = isActor && !eventActorRevealed(row);
        return {
          id: row.id,
          eventId: row.event_id,
          authorId: row.author_id,
          authorName: conceal ? "Anonymous Alchemist" : identity?.name ?? "Alchemist",
          authorImage: conceal ? null : identity?.image ?? null,
          authorIsAgent: identity?.isAgent ?? false,
          authorElement: conceal ? null : identity?.dominantElement ?? null,
          body: row.body,
          createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
          isEventActor: isActor && !conceal,
        };
      });

      const last = rows[rows.length - 1];
      const nextCursor = rows.length === limit && last ? encodeCursor(last.created_at, last.id) : null;

      // Render oldest→newest; the cursor still points at the oldest fetched row.
      return { comments: descending.reverse(), nextCursor };
    } catch (error) {
      _logger.error("[feedComments] listComments failed:", error);
      return { comments: [], nextCursor: null };
    }
  }

  /** Insert a comment and return its canonical, identity-resolved form. */
  async createComment(eventId: string, authorId: string, body: string): Promise<FeedComment | null> {
    const ins = await executeQuery<{ id: string; created_at: Date | string }>(
      `INSERT INTO feed_comments (event_id, author_id, body)
       VALUES ($1::uuid, $2::uuid, $3)
       RETURNING id, created_at`,
      [eventId, authorId, body],
    );
    const row = ins.rows[0];
    if (!row) return null;

    const [identities, eventReveal] = await Promise.all([
      resolveDisplayIdentity([authorId]),
      this.getEventActorReveal(eventId),
    ]);
    const identity = identities[authorId];

    const isActor = authorId === eventReveal?.actorId;
    // The author's own comment inherits the post's anonymity (privacy parity
    // with listComments): concealed event → no real name, no avatar, no marker.
    const conceal = isActor && eventReveal?.revealed === false;

    return {
      id: row.id,
      eventId,
      authorId,
      authorName: conceal ? "Anonymous Alchemist" : identity?.name ?? "Alchemist",
      authorImage: conceal ? null : identity?.image ?? null,
      authorIsAgent: identity?.isAgent ?? false,
      authorElement: conceal ? null : identity?.dominantElement ?? null,
      body,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      isEventActor: isActor && !conceal,
    };
  }

  /**
   * Soft-delete a comment. Author OR admin only. Returns true when a row was
   * flipped (idempotent — already-deleted rows report false). `isAdmin`
   * bypasses the author check.
   */
  async deleteComment(commentId: string, actorId: string, isAdmin: boolean): Promise<boolean> {
    const res = await executeQuery(
      `UPDATE feed_comments
          SET deleted_at = now(), deleted_by = $2::uuid
        WHERE id = $1::uuid
          AND deleted_at IS NULL
          AND ($3 OR author_id = $2::uuid)`,
      [commentId, actorId, isAdmin],
    );
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * File a report (unique per reporter), bump flagged_count, and auto-hide the
   * comment once it reaches AUTO_HIDE_THRESHOLD distinct reports. Returns
   * `{ reported, hidden }`; a duplicate report is a quiet no-op (reported:false).
   */
  async reportComment(
    commentId: string,
    reporterId: string,
    reason: string,
    detail: string | null,
  ): Promise<{ reported: boolean; hidden: boolean }> {
    const ins = await executeQuery(
      `INSERT INTO feed_comment_reports (comment_id, reporter_id, reason, detail)
       VALUES ($1::uuid, $2::uuid, $3, $4)
       ON CONFLICT ON CONSTRAINT uniq_feed_comment_report DO NOTHING
       RETURNING id`,
      [commentId, reporterId, reason, detail],
    );
    if ((ins.rowCount ?? 0) === 0) {
      return { reported: false, hidden: false };
    }

    // Recount distinct reporters and auto-hide at threshold (idempotent).
    const upd = await executeQuery<{ hidden: boolean; flagged_count: number }>(
      `UPDATE feed_comments c
          SET flagged_count = sub.n,
              hidden = (sub.n >= $2)
         FROM (SELECT COUNT(*)::int AS n FROM feed_comment_reports WHERE comment_id = $1::uuid) sub
        WHERE c.id = $1::uuid
        RETURNING c.hidden, c.flagged_count`,
      [commentId, AUTO_HIDE_THRESHOLD],
    );
    return { reported: true, hidden: upd.rows[0]?.hidden === true };
  }

  // ── Admin triage ──────────────────────────────────────────────────────────

  async listReports(
    status: string | null,
    opts: { limit?: number; offset?: number } = {},
  ): Promise<
    Array<{
      id: string;
      commentId: string;
      reporterId: string;
      reason: string;
      detail: string | null;
      status: string;
      createdAt: string;
      commentBody: string | null;
      commentHidden: boolean | null;
      commentDeleted: boolean;
    }>
  > {
    const limit = Math.min(Math.max(1, opts.limit ?? 50), 100);
    const offset = Math.max(0, opts.offset ?? 0);
    const statusClause = status ? "WHERE r.status = $3" : "";
    const params: unknown[] = [limit, offset];
    if (status) params.push(status);

    const res = await executeQuery(
      `SELECT r.id, r.comment_id, r.reporter_id, r.reason, r.detail, r.status, r.created_at,
              c.body AS comment_body, c.hidden AS comment_hidden,
              (c.deleted_at IS NOT NULL) AS comment_deleted
         FROM feed_comment_reports r
         LEFT JOIN feed_comments c ON c.id = r.comment_id
         ${statusClause}
        ORDER BY r.created_at DESC
        LIMIT $1 OFFSET $2`,
      params,
    );
    return res.rows.map((row: any) => ({
      id: row.id,
      commentId: row.comment_id,
      reporterId: row.reporter_id,
      reason: row.reason,
      detail: row.detail ?? null,
      status: row.status,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      commentBody: row.comment_body ?? null,
      commentHidden: row.comment_hidden ?? null,
      commentDeleted: row.comment_deleted === true,
    }));
  }

  /** Set a report's status; records resolver + timestamp for non-open states. */
  async resolveReport(reportId: string, status: string, adminId: string): Promise<boolean> {
    const res = await executeQuery(
      `UPDATE feed_comment_reports
          SET status = $2,
              resolved_at = CASE WHEN $2 = 'open' THEN NULL ELSE now() END,
              resolved_by = CASE WHEN $2 = 'open' THEN NULL ELSE $3::uuid END
        WHERE id = $1::uuid`,
      [reportId, status, adminId],
    );
    return (res.rowCount ?? 0) > 0;
  }
}

export const feedCommentsDatabase = new FeedCommentsDatabaseService();
