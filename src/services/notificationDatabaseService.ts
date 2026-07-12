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
   * Create OR bump an event-scoped notification — at most ONE unread row per
   * (recipient, event, type). The first actor INSERTs `firstMessage`; each
   * later actor bumps that row's count + lastActorName instead of adding a new
   * bell entry, and rewrites the message from `bumpTemplate` (identical dedup
   * rule to PR 3 §6 chat notifications, so the two systems converge on one
   * method). Returns the new or bumped row, or null.
   *
   * `bumpTemplate` must contain the literal tokens `__ACTOR__` (replaced with
   * the newest actor's name) and `__OTHERS__` (replaced with the count of the
   * OTHER actors already folded in — i.e. the pre-increment count). Example:
   * "__ACTOR__ and __OTHERS__ others commented on Solstice Feast".
   *
   * The batching upsert is a single round-trip CTE: the UPDATE runs first and,
   * only when it matched nothing, the INSERT lands.
   */
  async createOrBumpEventNotification(args: {
    recipientId: string;
    actorId: string;
    type: NotificationType;
    eventId: string;
    title: string;
    firstMessage: string;
    bumpTemplate: string;
    lastActorName: string;
    extraMetadata?: Record<string, unknown>;
  }): Promise<UserNotification | null> {
    const db = await getDbModule();
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const baseMetadata = {
      ...(args.extraMetadata ?? {}),
      eventId: args.eventId,
      count: 1,
      lastActorName: args.lastActorName,
    };

    const renderBump = (others: number): string =>
      args.bumpTemplate.replace(/__ACTOR__/g, args.lastActorName).replace(/__OTHERS__/g, String(others));

    if (!db) {
      // In-memory fallback: find an existing unread row for this recipient+event+type.
      const existing = Array.from(notificationsStore.values()).find(
        (n) =>
          n.userId === args.recipientId &&
          n.type === args.type &&
          !n.isRead &&
          n.metadata?.eventId === args.eventId,
      );
      if (existing) {
        const prior = (existing.metadata?.count as number) ?? 1;
        existing.metadata = { ...existing.metadata, count: prior + 1, lastActorName: args.lastActorName };
        existing.message = renderBump(prior); // "others" = the pre-increment count
        return existing;
      }
      const created: UserNotification = {
        id,
        userId: args.recipientId,
        type: args.type,
        title: args.title,
        message: args.firstMessage,
        isRead: false,
        relatedUserId: args.actorId,
        metadata: baseMetadata,
        createdAt: new Date().toISOString(),
      };
      notificationsStore.set(id, created);
      return created;
    }

    try {
      // The bump template with __ACTOR__ resolved in JS; __OTHERS__ resolved in
      // SQL to the pre-increment count so the message stays truthful under races.
      const actorResolvedTemplate = args.bumpTemplate.replace(/__ACTOR__/g, args.lastActorName);
      const result = await db.executeQuery(
        `WITH bumped AS (
           UPDATE notifications
              SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
                    'count', COALESCE((metadata->>'count')::int, 1) + 1,
                    'lastActorName', $6::text),
                  message = replace($7, '__OTHERS__',
                    COALESCE((metadata->>'count')::int, 1)::text),
                  related_user_id = $3,
                  updated_at = now()
            WHERE user_id = $2 AND type = $4::notification_type
              AND is_read = false
              AND metadata->>'eventId' = $5
            RETURNING id, user_id, type, title, message, related_user_id, metadata,
                      created_at, expires_at, is_read
         ),
         inserted AS (
           INSERT INTO notifications (id, user_id, type, title, message, related_user_id, metadata)
           SELECT $1, $2, $4::notification_type, $8, $9, $3, $10
           WHERE NOT EXISTS (SELECT 1 FROM bumped)
           RETURNING id, user_id, type, title, message, related_user_id, metadata,
                     created_at, expires_at, is_read
         )
         SELECT * FROM bumped
         UNION ALL
         SELECT * FROM inserted`,
        [
          id, // $1 new id
          args.recipientId, // $2
          args.actorId, // $3
          args.type, // $4
          args.eventId, // $5
          args.lastActorName, // $6
          actorResolvedTemplate, // $7 — SQL substitutes __OTHERS__
          args.title, // $8
          args.firstMessage, // $9 (count = 1 on fresh insert)
          JSON.stringify(baseMetadata), // $10
        ],
      );
      const row = result.rows[0];
      return row ? rowToNotification(row) : null;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === "23503") {
        _logger.warn(
          "[Notification] FK violation on createOrBumpEventNotification — recipient missing, skipping",
          { recipientId: args.recipientId, type: args.type },
        );
        return null;
      }
      _logger.error("createOrBumpEventNotification failed:", error);
      return null;
    }
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
