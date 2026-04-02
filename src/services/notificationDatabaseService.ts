/**
 * Notification Database Service
 *
 * Manages persistent user notifications in PostgreSQL.
 * Follows the same pattern as socialDatabaseService (lazy DB import, in-memory fallback).
 */

import { _logger } from "@/lib/logger";
import type { NotificationType, UserNotification } from "@/types/notification";

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

function rowToNotification(row: any): UserNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    relatedUserId: row.related_user_id || undefined,
    relatedUserName: row.related_user_name || undefined,
    metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : (row.metadata || {}),
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    expiresAt: row.expires_at?.toISOString?.() || row.expires_at || undefined,
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
        _logger.error("createNotification failed:", error as any);
        return null;
      }
    }

    // In-memory fallback
    notificationsStore.set(id, notification);
    return notification;
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
        _logger.error("getNotificationsForUser failed:", error as any);
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
        _logger.error("getUnreadCount failed:", error as any);
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
        _logger.error("markAsRead failed:", error as any);
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
        _logger.error("markAllAsRead failed:", error as any);
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
          `SELECT id FROM notifications
           WHERE user_id = $1 AND type = 'daily_insight'
             AND created_at >= CURRENT_DATE
           LIMIT 1`,
          [userId],
        );
        return (result.rows?.length || 0) > 0;
      } catch (error) {
        _logger.error("hasDailyInsightToday failed:", error as any);
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
        _logger.error("deleteExpired failed:", error as any);
        return 0;
      }
    }

    return 0;
  }
}

export const notificationDatabase = new NotificationDatabaseService();
