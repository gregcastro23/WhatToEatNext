/**
 * Social Database Service
 * Manages friendships, saved charts, and user search for the social features.
 * Uses PostgreSQL with in-memory fallback (same pattern as userDatabaseService).
 */

import { _logger } from "@/lib/logger";
import type {
  Friendship,
  FriendshipStatus,
  SavedChart,
  LinkedFriend,
  BirthData,
  NatalChart,
} from "@/types/natalChart";

const isServerWithDB = (): boolean => {
  return typeof window === "undefined" && !!process.env.DATABASE_URL;
};

let dbModule: typeof import("@/lib/database") | null = null;
const getDbModule = async () => {
  if (!dbModule && isServerWithDB()) {
    try {
      dbModule = await import("@/lib/database");
    } catch {
      _logger.warn("Database module not available for social service");
    }
  }
  return dbModule;
};

// ─── In-memory fallback stores ───────────────────────────
const friendshipsStore: Map<string, Friendship> = new Map();
const savedChartsStore: Map<string, SavedChart> = new Map();

class SocialDatabaseService {
  // ─── User Search ─────────────────────────────────────────

  /**
   * Search for registered users by email (partial match).
   * Returns basic info only (no sensitive data).
   */
  async searchUsersByEmail(
    query: string,
    excludeUserId: string,
    limit = 10,
  ): Promise<Array<{ id: string; name: string; email: string }>> {
    const db = await getDbModule();
    if (!db) return [];

    try {
      const result = await db.executeQuery(
        `SELECT u.id, COALESCE(up.name, u.name, '') as name, u.email
         FROM users u
         LEFT JOIN user_profiles up ON u.id = up.user_id
         WHERE u.email ILIKE $1
           AND u.id != $2
           AND u.is_active = true
         ORDER BY u.email
         LIMIT $3`,
        [`%${query}%`, excludeUserId, limit],
      );
      return result.rows.map((r: any) => ({
        id: r.id,
        name: r.name || "",
        email: r.email,
      }));
    } catch (error) {
      _logger.error("searchUsersByEmail failed:", error as any);
      return [];
    }
  }

  // ─── Friendships ─────────────────────────────────────────

  /**
   * Send a friend request from requester to addressee.
   * Prevents duplicates and self-requests.
   */
  async createFriendRequest(
    requesterId: string,
    addresseeId: string,
  ): Promise<Friendship | null> {
    if (requesterId === addresseeId) return null;

    const db = await getDbModule();
    const id = `friendship_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const friendship: Friendship = {
      id,
      requesterId,
      addresseeId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        // Check for existing friendship in either direction
        const existing = await db.executeQuery(
          `SELECT id, status FROM friendships
           WHERE (requester_id = $1 AND addressee_id = $2)
              OR (requester_id = $2 AND addressee_id = $1)`,
          [requesterId, addresseeId],
        );

        if (existing.rows.length > 0) {
          const row = existing.rows[0];
          if (row.status === "blocked") return null;
          // Already exists — return existing
          return this.getFriendshipById(row.id);
        }

        await db.executeQuery(
          `INSERT INTO friendships (id, requester_id, addressee_id, status)
           VALUES ($1, $2, $3, 'pending')`,
          [id, requesterId, addresseeId],
        );

        // Fetch with names
        return this.getFriendshipById(id);
      } catch (error) {
        _logger.error("createFriendRequest failed:", error as any);
        return null;
      }
    }

    // In-memory fallback
    friendshipsStore.set(id, friendship);
    return friendship;
  }

  /**
   * Update friendship status (accept, block).
   * Only the addressee can accept; either party can block.
   */
  async updateFriendshipStatus(
    friendshipId: string,
    newStatus: FriendshipStatus,
    actingUserId: string,
  ): Promise<Friendship | null> {
    const db = await getDbModule();

    if (db) {
      try {
        // Verify the acting user is a party to the friendship
        const check = await db.executeQuery(
          `SELECT requester_id, addressee_id, status FROM friendships WHERE id = $1`,
          [friendshipId],
        );
        if (check.rows.length === 0) return null;

        const { requester_id, addressee_id, status } = check.rows[0];
        const isParty = actingUserId === requester_id || actingUserId === addressee_id;
        if (!isParty) return null;

        // Only addressee can accept
        if (newStatus === "accepted" && actingUserId !== addressee_id) return null;
        // Can't accept if already blocked
        if (status === "blocked" && newStatus === "accepted") return null;

        await db.executeQuery(
          `UPDATE friendships SET status = $2::friendship_status, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [friendshipId, newStatus],
        );

        return this.getFriendshipById(friendshipId);
      } catch (error) {
        _logger.error("updateFriendshipStatus failed:", error as any);
        return null;
      }
    }

    // In-memory fallback
    const f = friendshipsStore.get(friendshipId);
    if (!f) return null;
    f.status = newStatus;
    f.updatedAt = new Date().toISOString();
    return f;
  }

  /**
   * Delete a friendship (reject / unfriend).
   */
  async deleteFriendship(
    friendshipId: string,
    actingUserId: string,
  ): Promise<boolean> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `DELETE FROM friendships
           WHERE id = $1 AND (requester_id = $2 OR addressee_id = $2)`,
          [friendshipId, actingUserId],
        );
        return (result.rowCount ?? 0) > 0;
      } catch (error) {
        _logger.error("deleteFriendship failed:", error as any);
        return false;
      }
    }

    friendshipsStore.delete(friendshipId);
    return true;
  }

  /**
   * Get all friendships for a user (both directions).
   */
  async getFriendshipsForUser(userId: string): Promise<Friendship[]> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT f.id, f.requester_id, f.addressee_id, f.status,
                  f.created_at, f.updated_at,
                  COALESCE(up_req.name, u_req.name, '') as requester_name,
                  u_req.email as requester_email,
                  COALESCE(up_adr.name, u_adr.name, '') as addressee_name,
                  u_adr.email as addressee_email
           FROM friendships f
           JOIN users u_req ON f.requester_id = u_req.id
           JOIN users u_adr ON f.addressee_id = u_adr.id
           LEFT JOIN user_profiles up_req ON f.requester_id = up_req.user_id
           LEFT JOIN user_profiles up_adr ON f.addressee_id = up_adr.user_id
           WHERE f.requester_id = $1 OR f.addressee_id = $1
           ORDER BY f.updated_at DESC`,
          [userId],
        );

        return result.rows.map((r: any) => this.rowToFriendship(r));
      } catch (error) {
        _logger.error("getFriendshipsForUser failed:", error as any);
        return [];
      }
    }

    // In-memory fallback
    return Array.from(friendshipsStore.values()).filter(
      (f) => f.requesterId === userId || f.addresseeId === userId,
    );
  }

  /**
   * Get accepted friends with their natal chart data (for dining companion sync).
   */
  async getLinkedFriendsForUser(userId: string): Promise<LinkedFriend[]> {
    const db = await getDbModule();
    if (!db) return [];

    try {
      const result = await db.executeQuery(
        `SELECT
            CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END as friend_id,
            CASE WHEN f.requester_id = $1 THEN COALESCE(up_adr.name, u_adr.name, '') ELSE COALESCE(up_req.name, u_req.name, '') END as friend_name,
            CASE WHEN f.requester_id = $1 THEN u_adr.email ELSE u_req.email END as friend_email,
            CASE WHEN f.requester_id = $1 THEN up_adr.natal_chart ELSE up_req.natal_chart END as natal_chart,
            CASE WHEN f.requester_id = $1 THEN up_adr.birth_data ELSE up_req.birth_data END as birth_data,
            f.id as friendship_id,
            f.updated_at as synced_at
         FROM friendships f
         JOIN users u_req ON f.requester_id = u_req.id
         JOIN users u_adr ON f.addressee_id = u_adr.id
         LEFT JOIN user_profiles up_req ON f.requester_id = up_req.user_id
         LEFT JOIN user_profiles up_adr ON f.addressee_id = up_adr.user_id
         WHERE (f.requester_id = $1 OR f.addressee_id = $1)
           AND f.status = 'accepted'`,
        [userId],
      );

      return result.rows
        .filter((r: any) => {
          // Only include friends who have completed onboarding (have natal chart)
          const chart = typeof r.natal_chart === "string" ? JSON.parse(r.natal_chart) : r.natal_chart;
          return chart && Object.keys(chart).length > 0;
        })
        .map((r: any) => {
          const natalChart = typeof r.natal_chart === "string" ? JSON.parse(r.natal_chart) : r.natal_chart;
          const birthData = typeof r.birth_data === "string" ? JSON.parse(r.birth_data) : r.birth_data;
          return {
            userId: r.friend_id,
            name: r.friend_name,
            email: r.friend_email,
            natalChart,
            birthData,
            friendshipId: r.friendship_id,
            syncedAt: r.synced_at?.toISOString?.() ?? new Date().toISOString(),
          } as LinkedFriend;
        });
    } catch (error) {
      _logger.error("getLinkedFriendsForUser failed:", error as any);
      return [];
    }
  }

  private async getFriendshipById(id: string): Promise<Friendship | null> {
    const db = await getDbModule();
    if (!db) return friendshipsStore.get(id) || null;

    try {
      const result = await db.executeQuery(
        `SELECT f.id, f.requester_id, f.addressee_id, f.status,
                f.created_at, f.updated_at,
                COALESCE(up_req.name, u_req.name, '') as requester_name,
                u_req.email as requester_email,
                COALESCE(up_adr.name, u_adr.name, '') as addressee_name,
                u_adr.email as addressee_email
         FROM friendships f
         JOIN users u_req ON f.requester_id = u_req.id
         JOIN users u_adr ON f.addressee_id = u_adr.id
         LEFT JOIN user_profiles up_req ON f.requester_id = up_req.user_id
         LEFT JOIN user_profiles up_adr ON f.addressee_id = up_adr.user_id
         WHERE f.id = $1`,
        [id],
      );
      if (result.rows.length === 0) return null;
      return this.rowToFriendship(result.rows[0]);
    } catch {
      return null;
    }
  }

  private rowToFriendship(row: any): Friendship {
    return {
      id: row.id,
      requesterId: row.requester_id,
      requesterName: row.requester_name || undefined,
      requesterEmail: row.requester_email || undefined,
      addresseeId: row.addressee_id,
      addresseeName: row.addressee_name || undefined,
      addresseeEmail: row.addressee_email || undefined,
      status: row.status as FriendshipStatus,
      createdAt: row.created_at?.toISOString?.() ?? row.created_at,
      updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
    };
  }

  // ─── Saved Charts (Cosmic Identities) ───────────────────

  /**
   * Get all saved charts for a user.
   */
  async getSavedChartsForUser(userId: string): Promise<SavedChart[]> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT * FROM saved_charts WHERE owner_id = $1 ORDER BY is_primary DESC, created_at ASC`,
          [userId],
        );
        return result.rows.map((r: any) => this.rowToSavedChart(r));
      } catch (error) {
        _logger.error("getSavedChartsForUser failed:", error as any);
        return [];
      }
    }

    return Array.from(savedChartsStore.values()).filter((c) => c.ownerId === userId);
  }

  /**
   * Create a new saved chart (cosmic identity or manual companion chart).
   */
  async createSavedChart(data: {
    ownerId: string;
    label: string;
    chartType: SavedChart["chartType"];
    birthData: BirthData;
    natalChart: NatalChart;
    isPrimary?: boolean;
  }): Promise<SavedChart | null> {
    const db = await getDbModule();
    const id = `chart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const chart: SavedChart = {
      id,
      ownerId: data.ownerId,
      label: data.label,
      chartType: data.chartType,
      birthData: data.birthData,
      natalChart: data.natalChart,
      isPrimary: data.isPrimary ?? false,
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO saved_charts (id, owner_id, label, chart_type, birth_data, natal_chart, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            id,
            data.ownerId,
            data.label,
            data.chartType,
            JSON.stringify(data.birthData),
            JSON.stringify(data.natalChart),
            data.isPrimary ?? false,
          ],
        );
        return chart;
      } catch (error) {
        _logger.error("createSavedChart failed:", error as any);
        return null;
      }
    }

    savedChartsStore.set(id, chart);
    return chart;
  }

  /**
   * Delete a saved chart (only if owned by the user and not the primary chart).
   */
  async deleteSavedChart(chartId: string, userId: string): Promise<boolean> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `DELETE FROM saved_charts WHERE id = $1 AND owner_id = $2 AND is_primary = false`,
          [chartId, userId],
        );
        return (result.rowCount ?? 0) > 0;
      } catch (error) {
        _logger.error("deleteSavedChart failed:", error as any);
        return false;
      }
    }

    const chart = savedChartsStore.get(chartId);
    if (chart && chart.ownerId === userId && !chart.isPrimary) {
      savedChartsStore.delete(chartId);
      return true;
    }
    return false;
  }

  private rowToSavedChart(row: any): SavedChart {
    return {
      id: row.id,
      ownerId: row.owner_id,
      label: row.label,
      chartType: row.chart_type,
      birthData: typeof row.birth_data === "string" ? JSON.parse(row.birth_data) : row.birth_data,
      natalChart: typeof row.natal_chart === "string" ? JSON.parse(row.natal_chart) : row.natal_chart,
      isPrimary: row.is_primary,
      createdAt: row.created_at?.toISOString?.() ?? row.created_at,
      updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
    };
  }
}

export const socialDatabase = new SocialDatabaseService();
