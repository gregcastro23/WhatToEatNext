/**
 * Notification Database Service
 *
 * Manages persistent user notifications in PostgreSQL.
 * Follows the same pattern as socialDatabaseService (lazy DB import, in-memory fallback).
 */

import { _logger } from "@/lib/logger";
import type {
  NotificationMetadata,
  NotificationType,
  UserNotification,
} from "@/types/notification";

const isServerWithDB = (): boolean => {
  return typeof window === "undefined" && !!process.env.DATABASE_URL;
};

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.warn("Database module not available for notification service");
    }
  }
  return dbModule;
};

// ─── In-memory fallback ─────────────────────────────────
const notificationsStore: Map<string, UserNotification> = new Map();

interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  related_user_id?: string | null;
  related_user_name?: string | null;
  metadata?: string | NotificationMetadata | null;
  created_at?: Date | string | null;
  expires_at?: Date | string | null;
}

const toIsoString = (value: Date | string | null | undefined): string =>
  value instanceof Date ? value.toISOString() : value || new Date().toISOString();

const toOptionalIsoString = (
  value: Date | string | null | undefined,
): string | undefined =>
  value instanceof Date ? value.toISOString() : value || undefined;

const parseNotificationMetadata = (
  value: NotificationRow["metadata"],
): NotificationMetadata => {
  if (typeof value === "string") return JSON.parse(value) as NotificationMetadata;
  return value || {};
};

function rowToNotification(row: NotificationRow): UserNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    relatedUserId: row.related_user_id || undefined,
    relatedUserName: row.related_user_name || undefined,
    metadata: parseNotificationMetadata(row.metadata),
    createdAt: toIsoString(row.created_at),
    expiresAt: toOptionalIsoString(row.expires_at),
  };
}

class NotificationDatabaseService {
  // ─── Create ─────────────────────────────────────────────

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    opts?: {
      relatedUserId?: string;
      metadata?: Record<string, any>;
      expiresAt?: string;
    },
  ): Promise<UserNotification | null> {
    const db = await getDbModule();
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const notification: UserNotification = {
      id,
      userId,
      type,
      title,
      message,
      isRead: false,
      relatedUserId: opts?.relatedUserId,
      metadata: opts?.metadata || {},
      createdAt: now,
      expiresAt: opts?.expiresAt,
    };

    if (db) {
      try {
        const result = await db.executeQuery(
          `INSERT INTO notifications (id, user_id, type, title, message, related_user_id, metadata, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            id,
            userId,
            type,
            title,
            message,
            opts?.relatedUserId || null,
            JSON.stringify(opts?.metadata || {}),
            opts?.expiresAt || null,
          ],
        );
        if (result.rows.length > 0) {
          return rowToNotification(result.rows[0]);
        }
      } catch (error) {
        // FK violation (23503) means user_id doesn't exist in users — silently
        // skip rather than logging at error level. This happens for legitimate
        // edge cases like demo-flow callers passing synthetic IDs or sessions
        // outliving the underlying user row, and it pollutes the error stream
        // when it's safe to ignore.
        const code = (error as { code?: string })?.code;
        if (code === "23503") {
          _logger.warn(
            "[Notification] FK violation on createNotification — user_id missing, skipping",
            { userId, type },
          );
          return null;
        }
        _logger.error("createNotification failed:", error);
        return null;
      }
    }

    // In-memory fallback
    notificationsStore.set(id, notification);
    return notification;
  }

  /**
   * Chat dedup upsert (docs/plans/pr3-messaging-plan.md §6): keep AT MOST ONE
   * unread notification row per (recipient, conversation). If an unread row of
   * a chat type already exists for this conversation, bump its folded unread
   * count + refresh the preview/timestamp; otherwise insert a fresh row. Table
   * chat emits NO notification (its badge is /api/chat/unread) — only
   * dm_message / circle_message / table_chat_mention flow through here.
   *
   * All work runs on ONE transaction client (the SELECT ... FOR UPDATE guards
   * the read-modify-write against a racing second message).
   */
  async createOrBumpEventNotification(
    userId: string,
    type: NotificationType,
    conversationId: string,
    opts: {
      title: string;
      message: string;
      relatedUserId?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<UserNotification | null> {
    const db = await getDbModule();
    if (!db) {
      // In-memory fallback: best-effort single-row dedup.
      const existing = Array.from(notificationsStore.values()).find(
        (n) =>
          n.userId === userId &&
          n.type === type &&
          !n.isRead &&
          n.metadata?.conversationId === conversationId,
      );
      if (existing) {
        const count = (existing.metadata?.unreadCount ?? 1) + 1;
        existing.metadata = { ...existing.metadata, unreadCount: count, messagePreview: opts.message };
        existing.message = opts.message;
        existing.createdAt = new Date().toISOString();
        return existing;
      }
      return this.createNotification(userId, type, opts.title, opts.message, {
        relatedUserId: opts.relatedUserId,
        metadata: { ...opts.metadata, conversationId, unreadCount: 1, messagePreview: opts.message },
      });
    }

    try {
      const { withTransaction } = await import("@/lib/database/connection");
      const result = await withTransaction(async (client) => {
        // Serialize concurrent first-messages for the SAME (recipient,
        // conversation): SELECT ... FOR UPDATE locks NOTHING on an empty
        // result, so two racing inserts would both find no row and each
        // INSERT, violating the one-unread-row invariant. A transaction-scoped
        // advisory lock keyed on (user, type, conversation) makes the loser
        // wait until the winner commits — then its SELECT sees the winner's row
        // and takes the UPDATE branch. hashtextextended(text, 0) -> bigint
        // feeds the single-arg lock; collisions only serialize unrelated pairs,
        // never miss.
        await client.query(
          `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
          [`${userId}:${type}:${conversationId}`],
        );

        const found = await client.query(
          `SELECT id, metadata FROM notifications
            WHERE user_id = $1::uuid AND type = $2 AND is_read = false
              AND metadata->>'conversationId' = $3
            ORDER BY created_at DESC
            LIMIT 1
            FOR UPDATE`,
          [userId, type, conversationId],
        );

        if (found.rows.length > 0) {
          const row = found.rows[0];
          const prev = parseNotificationMetadata(row.metadata);
          const nextCount = (typeof prev.unreadCount === "number" ? prev.unreadCount : 1) + 1;
          const nextMeta = {
            ...prev,
            ...opts.metadata,
            conversationId,
            unreadCount: nextCount,
            messagePreview: opts.message,
          };
          const updated = await client.query(
            `UPDATE notifications
                SET message = $2, metadata = $3, created_at = CURRENT_TIMESTAMP, is_read = false
              WHERE id = $1
              RETURNING *`,
            [row.id, opts.message, JSON.stringify(nextMeta)],
          );
          return updated.rows[0];
        }

        const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const meta = {
          ...opts.metadata,
          conversationId,
          unreadCount: 1,
          messagePreview: opts.message,
        };
        const inserted = await client.query(
          `INSERT INTO notifications (id, user_id, type, title, message, related_user_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [id, userId, type, opts.title, opts.message, opts.relatedUserId ?? null, JSON.stringify(meta)],
        );
        return inserted.rows[0];
      });
      return result ? rowToNotification(result) : null;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "23503") {
        _logger.warn("[Notification] FK violation on createOrBumpEventNotification — skipping", {
          userId,
          type,
        });
        return null;
      }
      _logger.error("createOrBumpEventNotification failed:", error);
      return null;
    }
  }

  /**
   * Mark a conversation's chat notifications read for a recipient — called
   * when they open/read the conversation (the deduped row is cleared so the
   * bell count drops). Table chat has no rows here; this is a no-op for it.
   */
  async clearChatNotifications(userId: string, conversationId: string): Promise<number> {
    const db = await getDbModule();
    if (db) {
      try {
        const result = await db.executeQuery(
          `UPDATE notifications SET is_read = true
            WHERE user_id = $1::uuid AND is_read = false
              AND type IN ('dm_message','circle_message','table_chat_mention')
              AND metadata->>'conversationId' = $2
            RETURNING id`,
          [userId, conversationId],
        );
        return result.rows?.length || 0;
      } catch (error) {
        _logger.error("clearChatNotifications failed:", error);
        return 0;
      }
    }

    let count = 0;
    notificationsStore.forEach((n) => {
      if (
        n.userId === userId &&
        !n.isRead &&
        n.metadata?.conversationId === conversationId &&
        (n.type === "dm_message" || n.type === "circle_message" || n.type === "table_chat_mention")
      ) {
        n.isRead = true;
        count++;
      }
    });
    return count;
  }

  // ─── Read ───────────────────────────────────────────────

  async getNotificationsForUser(
    userId: string,
    opts?: { unreadOnly?: boolean; limit?: number; offset?: number },
  ): Promise<UserNotification[]> {
    const limit = opts?.limit ?? 20;
    const offset = opts?.offset ?? 0;
    const db = await getDbModule();

    if (db) {
      try {
        const unreadClause = opts?.unreadOnly ? "AND n.is_read = false" : "";
        const result = await db.executeQuery(
          `SELECT n.*,
                  COALESCE(up.name, ru.name, '') AS related_user_name
           FROM notifications n
           LEFT JOIN users ru ON n.related_user_id = ru.id
           LEFT JOIN user_profiles up ON n.related_user_id = up.user_id
           WHERE n.user_id = $1
             AND (n.expires_at IS NULL OR n.expires_at > NOW())
             ${unreadClause}
           ORDER BY n.created_at DESC
           LIMIT $2 OFFSET $3`,
          [userId, limit, offset],
        );
        return result.rows.map(rowToNotification);
      } catch (error) {
        _logger.error("getNotificationsForUser failed:", error);
        return [];
      }
    }

    // In-memory fallback
    let items = Array.from(notificationsStore.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (opts?.unreadOnly) items = items.filter((n) => !n.isRead);
    return items.slice(offset, offset + limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT COUNT(*)::int AS count FROM notifications
           WHERE user_id = $1 AND is_read = false
             AND (expires_at IS NULL OR expires_at > NOW())`,
          [userId],
        );
        return result.rows[0]?.count || 0;
      } catch (error) {
        _logger.error("getUnreadCount failed:", error);
        return 0;
      }
    }

    return Array.from(notificationsStore.values()).filter(
      (n) => n.userId === userId && !n.isRead,
    ).length;
  }

  // ─── Update ─────────────────────────────────────────────

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `UPDATE notifications SET is_read = true
           WHERE id = $1 AND user_id = $2
           RETURNING id`,
          [notificationId, userId],
        );
        return (result.rows?.length || 0) > 0;
      } catch (error) {
        _logger.error("markAsRead failed:", error);
        return false;
      }
    }

    const n = notificationsStore.get(notificationId);
    if (n && n.userId === userId) {
      n.isRead = true;
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `UPDATE notifications SET is_read = true
           WHERE user_id = $1 AND is_read = false
           RETURNING id`,
          [userId],
        );
        return result.rows?.length || 0;
      } catch (error) {
        _logger.error("markAllAsRead failed:", error);
        return 0;
      }
    }

    let count = 0;
    notificationsStore.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    });
    return count;
  }

  // ─── Check for existing daily insight today ─────────────

  async hasDailyInsightToday(userId: string): Promise<boolean> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          // "Today" = the current New York calendar day (domain timezone), not the
          // DB session's CURRENT_DATE (UTC), so the once-per-day dedupe rolls over
          // at ET midnight rather than UTC midnight.
          `SELECT id FROM notifications
           WHERE user_id = $1 AND type = 'daily_insight'
             AND created_at >= date_trunc('day', now() AT TIME ZONE 'America/New_York') AT TIME ZONE 'America/New_York'
           LIMIT 1`,
          [userId],
        );
        return (result.rows?.length || 0) > 0;
      } catch (error) {
        _logger.error("hasDailyInsightToday failed:", error);
        return false;
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    return Array.from(notificationsStore.values()).some(
      (n) => n.userId === userId && n.type === "daily_insight" && n.createdAt.startsWith(today),
    );
  }

  // ─── Cleanup ────────────────────────────────────────────

  async deleteExpired(): Promise<number> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `DELETE FROM notifications WHERE expires_at IS NOT NULL AND expires_at < NOW() RETURNING id`,
        );
        return result.rows?.length || 0;
      } catch (error) {
        _logger.error("deleteExpired failed:", error);
        return 0;
      }
    }

    return 0;
  }
}

export const notificationDatabase = new NotificationDatabaseService();
