/**
 * Chat Database Service (docs/plans/pr3-messaging-plan.md).
 *
 * Owns the `conversations` / `conversation_members` / `messages` /
 * `message_reports` / `user_spacetime_identities` read and write paths.
 * Postgres is the CANONICAL record for every conversation kind — table chat's
 * SpacetimeDB rows are a client-side live mirror only, and DM/circle bodies
 * never touch SpacetimeDB at all (world-readable tables — plan §0).
 *
 * Modeled on tableDatabaseService's conventions: guarded
 * `UPDATE/INSERT ... RETURNING` for race-safe writes, `withTransaction` for
 * atomic multi-row writes, isolated try/catch per public method. Transaction
 * discipline: never acquire a second pool connection while holding a
 * transaction client — `...OnClient` variants take the caller's client
 * (createManualCompanionsAtomic is the canonical example of this rule).
 */

import { AUTO_HIDE_REPORT_COUNT } from "@/lib/chat/enforcement";
import { executeQuery, withTransaction } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import type {
  ChatAttachment,
  ChatMessage,
  ChatUnread,
  ConversationKind,
  ConversationMembership,
  ConversationRecord,
  InboxEntry,
  MessageReport,
  MessageReportReason,
  MessageReportStatus,
  NotifyLevel,
} from "@/types/chat";
import { safeJsonParse } from "@/utils/typeGuards";
import type { PoolClient } from "pg";


// ─── Row → domain mapping helpers ────────────────────────────────────────

type DbTimestamp = Date | string | null | undefined;
type Row = any;

const dbIso = (value: DbTimestamp, fallback = new Date().toISOString()): string =>
  value instanceof Date ? value.toISOString() : value || fallback;

const dbIsoOrNull = (value: DbTimestamp): string | null =>
  value instanceof Date ? value.toISOString() : value || null;

function readJsonColumn<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") return safeJsonParse<T>(value, fallback) ?? fallback;
  return (value as T) ?? fallback;
}

function rowToConversation(row: Row): ConversationRecord {
  return {
    id: String(row.id),
    kind: row.kind as ConversationKind,
    subjectRef: row.subject_ref ?? undefined,
    title: row.title ?? undefined,
    createdBy: row.created_by ?? undefined,
    dmUserLo: row.dm_user_lo ?? undefined,
    dmUserHi: row.dm_user_hi ?? undefined,
    lastMessageAt: dbIsoOrNull(row.last_message_at),
    archivedAt: dbIsoOrNull(row.archived_at),
    createdAt: dbIso(row.created_at),
    updatedAt: dbIso(row.updated_at),
  };
}

function rowToMembership(row: Row): ConversationMembership {
  return {
    conversationId: String(row.conversation_id),
    userId: String(row.user_id),
    role: row.role,
    notifyLevel: row.notify_level,
    mutedByHostUntil: dbIsoOrNull(row.muted_by_host_until),
    lastReadAt: dbIsoOrNull(row.last_read_at),
    lastReadMessageId: row.last_read_message_id ?? null,
    joinedAt: dbIso(row.joined_at),
    leftAt: dbIsoOrNull(row.left_at),
    banned: row.banned === true,
  };
}

function rowToMessage(row: Row): ChatMessage {
  const deleted = !!row.deleted_at;
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    senderId: String(row.sender_id),
    // Deleted messages read as empty tombstones — the body never leaves the DB.
    body: deleted ? "" : String(row.body ?? ""),
    attachments: deleted ? [] : readJsonColumn<ChatAttachment[]>(row.attachments, []),
    replyToId: row.reply_to_id ?? undefined,
    clientKey: row.client_key ?? undefined,
    createdAt: dbIso(row.created_at),
    editedAt: dbIsoOrNull(row.edited_at),
    deletedAt: dbIsoOrNull(row.deleted_at),
    senderName: row.sender_name || undefined,
    senderAvatarUrl: row.sender_image || undefined,
    senderIsAgent: row.sender_is_agent === true,
  };
}

function rowToReport(row: Row): MessageReport {
  return {
    id: String(row.id),
    messageId: String(row.message_id),
    conversationId: String(row.conversation_id),
    reporterId: String(row.reporter_id),
    reason: row.reason as MessageReportReason,
    detail: row.detail ?? undefined,
    status: row.status as MessageReportStatus,
    createdAt: dbIso(row.created_at),
    resolvedAt: dbIsoOrNull(row.resolved_at),
    resolvedBy: row.resolved_by ?? null,
    messageBody: row.message_body ?? undefined,
    messageSenderId: row.message_sender_id ?? undefined,
    messageHidden: row.message_hidden === true,
    conversationKind: (row.conversation_kind as ConversationKind) ?? undefined,
  };
}

/**
 * The SQL fragment excluding messages whose sender is in a blocked
 * commensalship with the viewer (either direction — plan §3: "blocked senders
 * excluded for blocker"). $viewer is interpolated as a parameter index.
 */
const notBlockedForViewerSql = (senderCol: string, viewerParam: string) => `
  NOT EXISTS (
    SELECT 1 FROM commensalships b
     WHERE b.status = 'blocked'
       AND ((b.requester_id = ${viewerParam}::uuid AND b.addressee_id = ${senderCol})
         OR (b.requester_id = ${senderCol} AND b.addressee_id = ${viewerParam}::uuid))
  )`;

export type SoftDeleteResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "forbidden" };

export type ReportResult =
  | { ok: true; alreadyReported: boolean; hidden: boolean }
  | { ok: false; reason: "not_found" };

class ChatDatabaseService {
  // ─── Relationship lookups (commensalships) ─────────────────────────

  /**
   * Blocked in EITHER direction. Fails CLOSED (treated as blocked) — for
   * messaging the block is a safety boundary, unlike table invites where the
   * equivalent check fails open.
   */
  async isBlockedBetween(userId1: string, userId2: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `SELECT 1 FROM commensalships
          WHERE status = 'blocked'
            AND ((requester_id = $1::uuid AND addressee_id = $2::uuid)
              OR (requester_id = $2::uuid AND addressee_id = $1::uuid))
          LIMIT 1`,
        [userId1, userId2],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.error("isBlockedBetween failed — failing CLOSED for chat:", error);
      return true;
    }
  }

  async hasAcceptedCommensalship(userId1: string, userId2: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `SELECT 1 FROM commensalships
          WHERE status = 'accepted'
            AND ((requester_id = $1::uuid AND addressee_id = $2::uuid)
              OR (requester_id = $2::uuid AND addressee_id = $1::uuid))
          LIMIT 1`,
        [userId1, userId2],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.warn("hasAcceptedCommensalship failed — treating as not linked:", error);
      return false;
    }
  }

  // ─── Conversation ensure/create ────────────────────────────────────

  /**
   * Idempotently ensure the table's conversation on the CALLER'S transaction
   * client (never acquires its own connection — safe to run inside the
   * go-live transaction). Creates the conversation (subject_ref = tables.id,
   * Reconciliation 1) and seeds conversation_members from the table's joined
   * user members; tables.host_id gets role='host' — the authoritative host,
   * no first-ensurer workaround.
   */
  async ensureTableConversationOnClient(
    client: Pick<PoolClient, "query">,
    table: { id: string; hostId: string; title: string },
  ): Promise<string> {
    await client.query(
      `INSERT INTO conversations (kind, subject_ref, title, created_by)
       VALUES ('table', $1, $2, $3::uuid)
       ON CONFLICT (kind, subject_ref) WHERE kind <> 'dm' DO NOTHING`,
      [table.id, table.title, table.hostId],
    );
    const conv = await client.query(
      `SELECT id FROM conversations WHERE kind = 'table' AND subject_ref = $1`,
      [table.id],
    );
    const conversationId = conv.rows[0].id as string;

    await client.query(
      `INSERT INTO conversation_members (conversation_id, user_id, role)
       SELECT $1::uuid, tm.user_id,
              CASE WHEN tm.user_id = $3::uuid THEN 'host' ELSE 'member' END
         FROM table_members tm
        WHERE tm.table_id = $2 AND tm.user_id IS NOT NULL AND tm.rsvp_status = 'joined'
       ON CONFLICT (conversation_id, user_id) DO NOTHING`,
      [conversationId, table.id, table.hostId],
    );
    return conversationId;
  }

  /**
   * Standalone ensure (healing path for the POST /api/chat/conversations
   * route): reads the table row itself and runs the seed in one transaction.
   * Returns null when the table doesn't exist or hasn't gone live yet.
   */
  async ensureTableConversation(tableId: string): Promise<ConversationRecord | null> {
    try {
      const conversationId = await withTransaction(async (client) => {
        const tableResult = await client.query(
          `SELECT id, host_id, title, status FROM tables WHERE id = $1`,
          [tableId],
        );
        if (tableResult.rows.length === 0) return null;
        const row = tableResult.rows[0];
        if (row.status !== "live" && row.status !== "memory") return null;
        return await this.ensureTableConversationOnClient(client, {
          id: String(row.id),
          hostId: String(row.host_id),
          title: String(row.title),
        });
      });
      if (!conversationId) return null;
      return await this.getConversationById(conversationId);
    } catch (error) {
      _logger.error("ensureTableConversation failed:", error);
      return null;
    }
  }

  /**
   * Late joiner: a user who joined the table AFTER go-live gets their
   * conversation_members row on first entry to the chat. Only succeeds for
   * joined table members; no-ops (returns existing) otherwise.
   */
  async ensureTableMembership(
    conversationId: string,
    tableId: string,
    userId: string,
  ): Promise<ConversationMembership | null> {
    try {
      const result = await executeQuery(
        `INSERT INTO conversation_members (conversation_id, user_id, role)
         SELECT $1::uuid, $3::uuid,
                CASE WHEN t.host_id = $3::uuid THEN 'host' ELSE 'member' END
           FROM tables t
          WHERE t.id = $2
            AND EXISTS (
              SELECT 1 FROM table_members tm
               WHERE tm.table_id = $2 AND tm.user_id = $3::uuid AND tm.rsvp_status = 'joined'
            )
         ON CONFLICT (conversation_id, user_id) DO NOTHING`,
        [conversationId, tableId, userId],
      );
      void result;
      return await this.getMembership(conversationId, userId);
    } catch (error) {
      _logger.error("ensureTableMembership failed:", error);
      return null;
    }
  }

  /**
   * Idempotently ensure the canonical DM conversation for a user pair
   * (dm_user_lo < dm_user_hi — the unique partial index makes this race-safe)
   * and both membership rows. Relationship gates (blocks, accepted
   * commensalship, flags) are the ROUTE's job before calling this.
   */
  async ensureDmConversation(
    userA: string,
    userB: string,
  ): Promise<ConversationRecord | null> {
    // Canonicalize to match the DB CHECK `dm_user_lo < dm_user_hi`, which
    // compares as the `uuid` TYPE (lowercase-normalized) — NOT as raw text.
    // z.string().uuid() accepts uppercase, so a mixed-case otherUserId could
    // make a case-sensitive JS .sort() disagree with uuid ordering and violate
    // the CHECK on INSERT. Lowercasing first makes JS ordering match Postgres.
    const a = userA.toLowerCase();
    const b = userB.toLowerCase();
    const [lo, hi] = [a, b].sort();
    try {
      const conversationId = await withTransaction(async (client) => {
        await client.query(
          `INSERT INTO conversations (kind, dm_user_lo, dm_user_hi, created_by)
           VALUES ('dm', $1::uuid, $2::uuid, $3::uuid)
           ON CONFLICT (dm_user_lo, dm_user_hi) WHERE kind = 'dm' DO NOTHING`,
          [lo, hi, userA],
        );
        const conv = await client.query(
          `SELECT id FROM conversations WHERE kind = 'dm' AND dm_user_lo = $1::uuid AND dm_user_hi = $2::uuid`,
          [lo, hi],
        );
        const id = conv.rows[0].id as string;
        await client.query(
          `INSERT INTO conversation_members (conversation_id, user_id, role)
           VALUES ($1::uuid, $2::uuid, 'member'), ($1::uuid, $3::uuid, 'member')
           ON CONFLICT (conversation_id, user_id) DO NOTHING`,
          [id, lo, hi],
        );
        return id;
      });
      return await this.getConversationById(conversationId);
    } catch (error) {
      _logger.error("ensureDmConversation failed:", error);
      return null;
    }
  }

  /**
   * Create a circle conversation (creator = host) and seed members. The
   * circle has no external entity in v1 — subject_ref is a fresh opaque id
   * minted by the DB (the conversation's own uuid, stamped after insert).
   */
  async createCircleConversation(
    creatorId: string,
    title: string,
    memberIds: string[],
  ): Promise<ConversationRecord | null> {
    try {
      const conversationId = await withTransaction(async (client) => {
        const conv = await client.query(
          `INSERT INTO conversations (kind, subject_ref, title, created_by)
           VALUES ('circle', 'circle:' || uuid_generate_v4()::text, $1, $2::uuid)
           RETURNING id`,
          [title, creatorId],
        );
        const id = conv.rows[0].id as string;
        await client.query(
          `INSERT INTO conversation_members (conversation_id, user_id, role)
           VALUES ($1::uuid, $2::uuid, 'host')
           ON CONFLICT (conversation_id, user_id) DO NOTHING`,
          [id, creatorId],
        );
        for (const memberId of memberIds) {
          if (memberId === creatorId) continue;
          await client.query(
            `INSERT INTO conversation_members (conversation_id, user_id, role)
             VALUES ($1::uuid, $2::uuid, 'member')
             ON CONFLICT (conversation_id, user_id) DO NOTHING`,
            [id, memberId],
          );
        }
        return id;
      });
      return await this.getConversationById(conversationId);
    } catch (error) {
      _logger.error("createCircleConversation failed:", error);
      return null;
    }
  }

  // ─── Reads ─────────────────────────────────────────────────────────

  async getConversationById(conversationId: string): Promise<ConversationRecord | null> {
    try {
      const result = await executeQuery(
        `SELECT * FROM conversations WHERE id = $1::uuid`,
        [conversationId],
      );
      if (result.rows.length === 0) return null;
      return rowToConversation(result.rows[0]);
    } catch (error) {
      _logger.error("getConversationById failed:", error);
      return null;
    }
  }

  async getMembership(
    conversationId: string,
    userId: string,
  ): Promise<ConversationMembership | null> {
    try {
      const result = await executeQuery(
        `SELECT * FROM conversation_members WHERE conversation_id = $1::uuid AND user_id = $2::uuid`,
        [conversationId, userId],
      );
      if (result.rows.length === 0) return null;
      return rowToMembership(result.rows[0]);
    } catch (error) {
      _logger.error("getMembership failed:", error);
      return null;
    }
  }

  /**
   * Inbox: the viewer's active memberships with conversation, newest visible
   * message preview (hidden/deleted/blocked-sender messages skipped), unread
   * count, and — for DMs — the counterpart's display identity. Never selects
   * emails.
   */
  async listInbox(userId: string, limit = 50): Promise<InboxEntry[]> {
    try {
      const result = await executeQuery(
        `SELECT c.*,
                cm.role AS my_role, cm.notify_level AS my_notify_level, cm.last_read_at AS my_last_read_at,
                lm.id AS last_msg_id, lm.sender_id AS last_msg_sender_id,
                lm.body AS last_msg_body, lm.created_at AS last_msg_created_at,
                COALESCE(lup.name, lu.name) AS last_msg_sender_name,
                other_u.id AS other_id, COALESCE(oup.name, other_u.name) AS other_name,
                other_u.image AS other_image, other_u.is_agent AS other_is_agent,
                (SELECT COUNT(*)::int FROM messages m
                  WHERE m.conversation_id = c.id
                    AND m.sender_id <> $1::uuid
                    AND m.deleted_at IS NULL AND m.hidden = false
                    AND (cm.last_read_at IS NULL OR m.created_at > cm.last_read_at)
                    AND ${notBlockedForViewerSql("m.sender_id", "$1")}
                ) AS unread_count
           FROM conversation_members cm
           JOIN conversations c ON c.id = cm.conversation_id
           LEFT JOIN LATERAL (
             SELECT m.id, m.sender_id, m.body, m.created_at
               FROM messages m
              WHERE m.conversation_id = c.id
                AND m.deleted_at IS NULL AND m.hidden = false
                AND ${notBlockedForViewerSql("m.sender_id", "$1")}
              ORDER BY m.created_at DESC, m.id DESC
              LIMIT 1
           ) lm ON true
           LEFT JOIN users lu ON lm.sender_id = lu.id
           LEFT JOIN user_profiles lup ON lm.sender_id = lup.user_id
           LEFT JOIN users other_u
             ON c.kind = 'dm'
            AND other_u.id = CASE WHEN c.dm_user_lo = $1::uuid THEN c.dm_user_hi ELSE c.dm_user_lo END
           LEFT JOIN user_profiles oup ON other_u.id = oup.user_id
          WHERE cm.user_id = $1::uuid
            AND cm.left_at IS NULL AND cm.banned = false
            AND (c.kind <> 'dm' OR ${notBlockedForViewerSql("other_u.id", "$1")})
          ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
          LIMIT $2`,
        [userId, limit],
      );
      return result.rows.map((row: Row): InboxEntry => {
        const conversation = rowToConversation(row);
        return {
          conversation,
          membership: {
            role: row.my_role,
            notifyLevel: row.my_notify_level,
            lastReadAt: dbIsoOrNull(row.my_last_read_at),
          },
          lastMessage: row.last_msg_id
            ? {
                id: String(row.last_msg_id),
                senderId: String(row.last_msg_sender_id),
                senderName: row.last_msg_sender_name || undefined,
                body: String(row.last_msg_body ?? "").slice(0, 140),
                createdAt: dbIso(row.last_msg_created_at),
              }
            : null,
          unreadCount: row.unread_count ?? 0,
          otherUser: row.other_id
            ? {
                id: String(row.other_id),
                name: row.other_name || undefined,
                avatarUrl: row.other_image || undefined,
                isAgent: row.other_is_agent === true,
              }
            : undefined,
        };
      });
    } catch (error) {
      _logger.error("listInbox failed:", error);
      return [];
    }
  }

  /**
   * Keyset-paginated messages, newest first. `before` is a (createdAt, id)
   * cursor. Hidden messages are filtered; deleted return as tombstones;
   * blocked senders' messages are excluded for the viewer.
   */
  async listMessages(
    conversationId: string,
    viewerId: string,
    opts?: { limit?: number; before?: { createdAt: string; id: string } },
  ): Promise<ChatMessage[]> {
    const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 100);
    try {
      const params: unknown[] = [conversationId, viewerId, limit];
      let cursorClause = "";
      if (opts?.before) {
        cursorClause = `AND (m.created_at, m.id) < ($4::timestamptz, $5::uuid)`;
        params.push(opts.before.createdAt, opts.before.id);
      }
      const result = await executeQuery(
        `SELECT m.*,
                COALESCE(up.name, u.name) AS sender_name,
                u.image AS sender_image,
                u.is_agent AS sender_is_agent
           FROM messages m
           LEFT JOIN users u ON m.sender_id = u.id
           LEFT JOIN user_profiles up ON m.sender_id = up.user_id
          WHERE m.conversation_id = $1::uuid
            AND m.hidden = false
            AND ${notBlockedForViewerSql("m.sender_id", "$2")}
            ${cursorClause}
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT $3`,
        params,
      );
      return result.rows.map(rowToMessage);
    } catch (error) {
      _logger.error("listMessages failed:", error);
      return [];
    }
  }

  // ─── Send ──────────────────────────────────────────────────────────

  /**
   * Insert a message idempotently on (conversation, sender, clientKey) and
   * bump the conversation's last_message_at in the same transaction. A
   * clientKey replay returns the ORIGINAL row with `replay: true` so the
   * route can skip notifications/practices.
   */
  async insertMessage(input: {
    conversationId: string;
    senderId: string;
    body: string;
    attachments: ChatAttachment[];
    replyToId?: string;
    clientKey?: string;
  }): Promise<{ message: ChatMessage; replay: boolean } | null> {
    try {
      return await withTransaction(async (client) => {
        const inserted = await client.query(
          `INSERT INTO messages (conversation_id, sender_id, body, attachments, reply_to_id, client_key)
           VALUES ($1::uuid, $2::uuid, $3, $4, $5::uuid, $6)
           ON CONFLICT (conversation_id, sender_id, client_key) WHERE client_key IS NOT NULL DO NOTHING
           RETURNING *`,
          [
            input.conversationId,
            input.senderId,
            input.body,
            JSON.stringify(input.attachments),
            input.replyToId ?? null,
            input.clientKey ?? null,
          ],
        );
        if (inserted.rows.length > 0) {
          await client.query(
            `UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = $1::uuid`,
            [input.conversationId],
          );
          return { message: rowToMessage(inserted.rows[0]), replay: false };
        }
        // clientKey replay — return the original.
        const existing = await client.query(
          `SELECT * FROM messages
            WHERE conversation_id = $1::uuid AND sender_id = $2::uuid AND client_key = $3`,
          [input.conversationId, input.senderId, input.clientKey ?? null],
        );
        if (existing.rows.length === 0) return null;
        return { message: rowToMessage(existing.rows[0]), replay: true };
      });
    } catch (error) {
      _logger.error("insertMessage failed:", error);
      return null;
    }
  }

  /** Reply target lookup for the enforcement chain's same-conversation rule. */
  async getMessageConversationId(messageId: string): Promise<string | null> {
    try {
      const result = await executeQuery(
        `SELECT conversation_id FROM messages WHERE id = $1::uuid`,
        [messageId],
      );
      return result.rows.length > 0 ? String(result.rows[0].conversation_id) : null;
    } catch (error) {
      _logger.error("getMessageConversationId failed:", error);
      return null;
    }
  }

  /**
   * Recipients who should receive a chat notification for a new message: active
   * members other than the sender, whose notify_level is not 'none', not
   * host-muted, and not in a blocked relationship with the sender (either
   * direction). Table conversations never call this (their badge is the unread
   * endpoint). Never selects emails.
   */
  async getNotifiableRecipients(
    conversationId: string,
    senderId: string,
  ): Promise<Array<{ userId: string; role: string }>> {
    try {
      const result = await executeQuery(
        `SELECT cm.user_id, cm.role
           FROM conversation_members cm
          WHERE cm.conversation_id = $1::uuid
            AND cm.user_id <> $2::uuid
            AND cm.left_at IS NULL AND cm.banned = false
            AND cm.notify_level <> 'none'
            AND ${notBlockedForViewerSql("$2::uuid", "cm.user_id")}`,
        [conversationId, senderId],
      );
      return result.rows.map((row: Row) => ({ userId: String(row.user_id), role: row.role }));
    } catch (error) {
      _logger.error("getNotifiableRecipients failed:", error);
      return [];
    }
  }

  /** Distinct senders so the route can recognize dm_thread_started for both parties. */
  async countDistinctSenders(conversationId: string): Promise<number> {
    try {
      const result = await executeQuery(
        `SELECT COUNT(DISTINCT sender_id)::int AS n FROM messages
          WHERE conversation_id = $1::uuid AND deleted_at IS NULL`,
        [conversationId],
      );
      return result.rows[0]?.n ?? 0;
    } catch (error) {
      _logger.error("countDistinctSenders failed:", error);
      return 0;
    }
  }

  // ─── Read state / mute / moderation ────────────────────────────────

  async markRead(
    conversationId: string,
    userId: string,
    messageId?: string,
  ): Promise<boolean> {
    try {
      const result = await executeQuery(
        `UPDATE conversation_members
            SET last_read_at = CURRENT_TIMESTAMP, last_read_message_id = COALESCE($3::uuid, last_read_message_id)
          WHERE conversation_id = $1::uuid AND user_id = $2::uuid
          RETURNING user_id`,
        [conversationId, userId, messageId ?? null],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.error("markRead failed:", error);
      return false;
    }
  }

  async setNotifyLevel(
    conversationId: string,
    userId: string,
    level: NotifyLevel,
  ): Promise<boolean> {
    try {
      const result = await executeQuery(
        `UPDATE conversation_members SET notify_level = $3
          WHERE conversation_id = $1::uuid AND user_id = $2::uuid
          RETURNING user_id`,
        [conversationId, userId, level],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.error("setNotifyLevel failed:", error);
      return false;
    }
  }

  /** Host-only checks live in the route; this just writes the mute window. */
  async setHostMute(
    conversationId: string,
    targetUserId: string,
    until: string | null,
  ): Promise<boolean> {
    try {
      const result = await executeQuery(
        `UPDATE conversation_members SET muted_by_host_until = $3
          WHERE conversation_id = $1::uuid AND user_id = $2::uuid
          RETURNING user_id`,
        [conversationId, targetUserId, until],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.error("setHostMute failed:", error);
      return false;
    }
  }

  /** Kick = banned + left_at; the member can no longer read or rejoin. */
  async kickMember(conversationId: string, targetUserId: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `UPDATE conversation_members SET banned = true, left_at = CURRENT_TIMESTAMP
          WHERE conversation_id = $1::uuid AND user_id = $2::uuid
          RETURNING user_id`,
        [conversationId, targetUserId],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.error("kickMember failed:", error);
      return false;
    }
  }

  async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `UPDATE conversations SET archived_at = CURRENT_TIMESTAMP
          WHERE id = $1::uuid AND archived_at IS NULL
          RETURNING id`,
        [conversationId],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.error("archiveConversation failed:", error);
      return false;
    }
  }

  /** Archive a table's conversation on the caller's transaction client (close path). */
  async archiveTableConversationOnClient(
    client: Pick<PoolClient, "query">,
    tableId: string,
  ): Promise<void> {
    await client.query(
      `UPDATE conversations SET archived_at = CURRENT_TIMESTAMP
        WHERE kind = 'table' AND subject_ref = $1 AND archived_at IS NULL`,
      [tableId],
    );
  }

  // ─── Delete / report ───────────────────────────────────────────────

  /**
   * Soft delete: allowed for the sender, the conversation host, or an admin.
   * The body stays in the DB (30-day moderation window) but every read path
   * returns a tombstone.
   */
  async softDeleteMessage(
    messageId: string,
    actorId: string,
    opts?: { isAdmin?: boolean },
  ): Promise<SoftDeleteResult> {
    try {
      const context = await executeQuery(
        `SELECT m.sender_id, m.deleted_at, cm.role AS actor_role
           FROM messages m
           LEFT JOIN conversation_members cm
             ON cm.conversation_id = m.conversation_id AND cm.user_id = $2::uuid
          WHERE m.id = $1::uuid`,
        [messageId, actorId],
      );
      if (context.rows.length === 0) return { ok: false, reason: "not_found" };
      const row = context.rows[0];
      const allowed =
        opts?.isAdmin === true ||
        String(row.sender_id) === actorId ||
        row.actor_role === "host";
      if (!allowed) return { ok: false, reason: "forbidden" };
      if (row.deleted_at) return { ok: true }; // idempotent

      await executeQuery(
        `UPDATE messages SET deleted_at = CURRENT_TIMESTAMP, deleted_by = $2::uuid
          WHERE id = $1::uuid AND deleted_at IS NULL`,
        [messageId, actorId],
      );
      return { ok: true };
    } catch (error) {
      _logger.error("softDeleteMessage failed:", error);
      return { ok: false, reason: "not_found" };
    }
  }

  /**
   * File a report (unique per reporter+message) and auto-hide the message at
   * AUTO_HIDE_REPORT_COUNT distinct reporters — one transaction so the count
   * and the hide can't diverge.
   */
  async reportMessage(
    messageId: string,
    reporterId: string,
    reason: MessageReportReason,
    detail?: string,
  ): Promise<ReportResult> {
    try {
      return await withTransaction(async (client) => {
        const msg = await client.query(
          `SELECT conversation_id FROM messages WHERE id = $1::uuid FOR UPDATE`,
          [messageId],
        );
        if (msg.rows.length === 0) return { ok: false as const, reason: "not_found" as const };
        const conversationId = msg.rows[0].conversation_id as string;

        const inserted = await client.query(
          `INSERT INTO message_reports (message_id, conversation_id, reporter_id, reason, detail)
           VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5)
           ON CONFLICT ON CONSTRAINT uniq_message_report DO NOTHING
           RETURNING id`,
          [messageId, conversationId, reporterId, reason, detail ?? null],
        );
        if (inserted.rows.length === 0) {
          const current = await client.query(
            `SELECT hidden FROM messages WHERE id = $1::uuid`,
            [messageId],
          );
          return {
            ok: true as const,
            alreadyReported: true,
            hidden: current.rows[0]?.hidden === true,
          };
        }

        const updated = await client.query(
          `UPDATE messages
              SET flagged_count = flagged_count + 1,
                  hidden = hidden OR (flagged_count + 1 >= $2)
            WHERE id = $1::uuid
            RETURNING hidden`,
          [messageId, AUTO_HIDE_REPORT_COUNT],
        );
        return {
          ok: true as const,
          alreadyReported: false,
          hidden: updated.rows[0]?.hidden === true,
        };
      });
    } catch (error) {
      _logger.error("reportMessage failed:", error);
      return { ok: false, reason: "not_found" };
    }
  }

  // ─── Unread aggregate ──────────────────────────────────────────────

  async getUnread(userId: string): Promise<ChatUnread> {
    try {
      const result = await executeQuery(
        `SELECT cm.conversation_id, COUNT(m.id)::int AS unread
           FROM conversation_members cm
           JOIN messages m
             ON m.conversation_id = cm.conversation_id
            AND m.sender_id <> $1::uuid
            AND m.deleted_at IS NULL AND m.hidden = false
            AND (cm.last_read_at IS NULL OR m.created_at > cm.last_read_at)
          WHERE cm.user_id = $1::uuid AND cm.left_at IS NULL AND cm.banned = false
            AND ${notBlockedForViewerSql("m.sender_id", "$1")}
          GROUP BY cm.conversation_id`,
        [userId],
      );
      const byConversation: Record<string, number> = {};
      let total = 0;
      for (const row of result.rows) {
        const n = row.unread ?? 0;
        byConversation[String(row.conversation_id)] = n;
        total += n;
      }
      return { total, byConversation };
    } catch (error) {
      _logger.error("getUnread failed:", error);
      return { total: 0, byConversation: {} };
    }
  }

  // ─── Spacetime identity binding (telemetry only, never authorization) ──

  async bindSpacetimeIdentity(userId: string, identityHex: string): Promise<boolean> {
    const normalized = identityHex.trim().toLowerCase();
    if (!/^(0x)?[0-9a-f]{8,64}$/.test(normalized)) return false;
    try {
      await executeQuery(
        `INSERT INTO user_spacetime_identities (user_id, identity_hex)
         VALUES ($1::uuid, $2)
         ON CONFLICT (user_id, identity_hex) DO NOTHING`,
        [userId, normalized],
      );
      return true;
    } catch (error) {
      _logger.error("bindSpacetimeIdentity failed:", error);
      return false;
    }
  }

  // ─── Admin: reports queue ──────────────────────────────────────────

  async listReports(opts?: {
    status?: MessageReportStatus;
    limit?: number;
  }): Promise<MessageReport[]> {
    const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
    try {
      const params: unknown[] = [limit];
      let statusClause = "";
      if (opts?.status) {
        statusClause = "WHERE r.status = $2";
        params.push(opts.status);
      }
      const result = await executeQuery(
        `SELECT r.*,
                m.body AS message_body, m.sender_id AS message_sender_id, m.hidden AS message_hidden,
                c.kind AS conversation_kind
           FROM message_reports r
           JOIN messages m ON r.message_id = m.id
           JOIN conversations c ON r.conversation_id = c.id
           ${statusClause}
          ORDER BY r.created_at DESC
          LIMIT $1`,
        params,
      );
      return result.rows.map(rowToReport);
    } catch (error) {
      _logger.error("listReports failed:", error);
      return [];
    }
  }

  /**
   * Resolve a report. 'actioned' also hides the message; 'dismissed' unhides
   * it ONLY when no other open/actioned report keeps it hidden.
   */
  async resolveReport(
    reportId: string,
    adminId: string,
    status: Exclude<MessageReportStatus, "open">,
  ): Promise<MessageReport | null> {
    try {
      return await withTransaction(async (client) => {
        const updated = await client.query(
          `UPDATE message_reports
              SET status = $2, resolved_at = CURRENT_TIMESTAMP, resolved_by = $3::uuid
            WHERE id = $1::uuid
            RETURNING *`,
          [reportId, status, adminId],
        );
        if (updated.rows.length === 0) return null;
        const report = rowToReport(updated.rows[0]);

        if (status === "actioned") {
          await client.query(
            `UPDATE messages SET hidden = true WHERE id = $1::uuid`,
            [report.messageId],
          );
        } else if (status === "dismissed") {
          await client.query(
            `UPDATE messages m SET hidden = false
              WHERE m.id = $1::uuid
                AND m.flagged_count < $2
                AND NOT EXISTS (
                  SELECT 1 FROM message_reports r
                   WHERE r.message_id = m.id AND r.status = 'actioned'
                )`,
            [report.messageId, AUTO_HIDE_REPORT_COUNT],
          );
        }
        return report;
      });
    } catch (error) {
      _logger.error("resolveReport failed:", error);
      return null;
    }
  }
}

export const chatDatabase = new ChatDatabaseService();
