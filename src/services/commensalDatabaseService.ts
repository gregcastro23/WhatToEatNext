/**
 * Commensal Database Service
 * Manages commensalships (linked dining companions) and user search.
 * Uses PostgreSQL with in-memory fallback (same pattern as userDatabaseService).
 */

import { _logger } from "@/lib/logger";
import type {
  Commensalship,
  CommensalshipStatus,
  LinkedCommensal,
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
      _logger.warn("Database module not available for commensal service");
    }
  }
  return dbModule;
};

// In-memory fallback store
const commensalshipsStore: Map<string, Commensalship> = new Map();

class CommensalDatabaseService {
  // ─── User Search ─────────────────────────────────────────

  /**
   * Search for registered users by email (partial match).
   * Returns basic info only with obscured email (no sensitive data).
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
        `SELECT u.id, COALESCE(u.name, '') as name, u.email
         FROM users u
         WHERE u.email ILIKE $1
           AND u.id::text != $2
           AND u.is_active = true
         ORDER BY u.email
         LIMIT $3`,
        [`%${query}%`, excludeUserId, limit],
      );

      // Obscure email for privacy (show first 2 chars + domain)
      return result.rows.map((r: any) => {
        const email = r.email || "";
        const [local, domain] = email.split("@");
        const obscuredEmail = local && domain
          ? `${local.slice(0, 2)}***@${domain}`
          : email;

        return {
          id: r.id,
          name: r.name || "",
          email: obscuredEmail,
        };
      });
    } catch (error) {
      _logger.error("searchUsersByEmail failed:", error as any);
      return [];
    }
  }

  // ─── Commensalships ─────────────────────────────────────────

  /**
   * Send a commensal request from requester to addressee.
   * Prevents duplicates and self-requests.
   */
  async createCommensalRequest(
    requesterId: string,
    addresseeId: string,
  ): Promise<Commensalship | null> {
    if (requesterId === addresseeId) return null;

    const db = await getDbModule();
    const id = `commensal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const commensalship: Commensalship = {
      id,
      requesterId,
      addresseeId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    if (db) {
      try {
        // Check for existing commensalship in either direction
        const existing = await db.executeQuery(
          `SELECT id, status FROM commensalships
           WHERE (requester_id::text = $1 AND addressee_id::text = $2)
              OR (requester_id::text = $2 AND addressee_id::text = $1)`,
          [requesterId, addresseeId],
        );

        if (existing.rows.length > 0) {
          const row = existing.rows[0];
          if (row.status === "blocked") return null;
          // Already exists — return existing
          return this.getCommensalshipById(row.id);
        }

        await db.executeQuery(
          `INSERT INTO commensalships (id, requester_id, addressee_id, status)
           VALUES ($1, $2::uuid, $3::uuid, 'pending')`,
          [id, requesterId, addresseeId],
        );

        // Fetch with names
        return this.getCommensalshipById(id);
      } catch (error) {
        _logger.error("createCommensalRequest failed:", error as any);
        return null;
      }
    }

    // In-memory fallback
    commensalshipsStore.set(id, commensalship);
    return commensalship;
  }

  /**
   * Update commensalship status (accept, block).
   * Only the addressee can accept; either party can block.
   */
  async updateCommensalshipStatus(
    commensalshipId: string,
    newStatus: CommensalshipStatus,
    actingUserId: string,
  ): Promise<Commensalship | null> {
    const db = await getDbModule();

    if (db) {
      try {
        // Verify the acting user is a party to the commensalship
        const check = await db.executeQuery(
          `SELECT requester_id, addressee_id, status FROM commensalships WHERE id = $1`,
          [commensalshipId],
        );
        if (check.rows.length === 0) return null;

        const { requester_id, addressee_id, status } = check.rows[0];
        const isParty = actingUserId === requester_id.toString() || actingUserId === addressee_id.toString();
        if (!isParty) return null;

        // Only addressee can accept
        if (newStatus === "accepted" && actingUserId !== addressee_id.toString()) return null;
        // Can't accept if already blocked
        if (status === "blocked" && newStatus === "accepted") return null;

        await db.executeQuery(
          `UPDATE commensalships SET status = $2::commensalship_status, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [commensalshipId, newStatus],
        );

        return this.getCommensalshipById(commensalshipId);
      } catch (error) {
        _logger.error("updateCommensalshipStatus failed:", error as any);
        return null;
      }
    }

    // In-memory fallback
    const c = commensalshipsStore.get(commensalshipId);
    if (!c) return null;
    c.status = newStatus;
    c.updatedAt = new Date().toISOString();
    return c;
  }

  /**
   * Delete a commensalship (reject / remove commensal).
   */
  async deleteCommensalship(
    commensalshipId: string,
    actingUserId: string,
  ): Promise<boolean> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `DELETE FROM commensalships
           WHERE id = $1 AND (requester_id::text = $2 OR addressee_id::text = $2)`,
          [commensalshipId, actingUserId],
        );
        return (result.rowCount ?? 0) > 0;
      } catch (error) {
        _logger.error("deleteCommensalship failed:", error as any);
        return false;
      }
    }

    commensalshipsStore.delete(commensalshipId);
    return true;
  }

  /**
   * Get all commensalships for a user (both directions).
   */
  async getCommensalshipsForUser(userId: string): Promise<Commensalship[]> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT c.id, c.requester_id, c.addressee_id, c.status,
                  c.created_at, c.updated_at,
                  COALESCE(u_req.name, '') as requester_name,
                  u_req.email as requester_email,
                  COALESCE(u_adr.name, '') as addressee_name,
                  u_adr.email as addressee_email
           FROM commensalships c
           JOIN users u_req ON c.requester_id = u_req.id
           JOIN users u_adr ON c.addressee_id = u_adr.id
           WHERE c.requester_id::text = $1 OR c.addressee_id::text = $1
           ORDER BY c.updated_at DESC`,
          [userId],
        );

        return result.rows.map((r: any) => this.rowToCommensalship(r));
      } catch (error) {
        _logger.error("getCommensalshipsForUser failed:", error as any);
        return [];
      }
    }

    // In-memory fallback
    return Array.from(commensalshipsStore.values()).filter(
      (c) => c.requesterId === userId || c.addresseeId === userId,
    );
  }

  /**
   * Get accepted commensals with their natal chart data (for dining companion sync).
   */
  async getLinkedCommensalsForUser(userId: string): Promise<LinkedCommensal[]> {
    const db = await getDbModule();
    if (!db) return [];

    try {
      const result = await db.executeQuery(
        `SELECT
            CASE WHEN c.requester_id::text = $1 THEN c.addressee_id ELSE c.requester_id END as commensal_id,
            CASE WHEN c.requester_id::text = $1 THEN COALESCE(u_adr.name, '') ELSE COALESCE(u_req.name, '') END as commensal_name,
            CASE WHEN c.requester_id::text = $1 THEN u_adr.email ELSE u_req.email END as commensal_email,
            CASE WHEN c.requester_id::text = $1 THEN u_adr.profile ELSE u_req.profile END as profile,
            c.id as commensalship_id,
            c.updated_at as synced_at
         FROM commensalships c
         JOIN users u_req ON c.requester_id = u_req.id
         JOIN users u_adr ON c.addressee_id = u_adr.id
         WHERE (c.requester_id::text = $1 OR c.addressee_id::text = $1)
           AND c.status = 'accepted'`,
        [userId],
      );

      return result.rows
        .filter((r: any) => {
          // Only include commensals who have completed onboarding (have natal chart)
          const profile = typeof r.profile === "string" ? JSON.parse(r.profile) : r.profile;
          return profile?.natalChart && Object.keys(profile.natalChart).length > 0;
        })
        .map((r: any) => {
          const profile = typeof r.profile === "string" ? JSON.parse(r.profile) : r.profile;
          return {
            userId: r.commensal_id.toString(),
            name: r.commensal_name,
            email: r.commensal_email,
            natalChart: profile.natalChart as NatalChart,
            birthData: profile.birthData as BirthData,
            commensalshipId: r.commensalship_id,
            syncedAt: r.synced_at?.toISOString?.() ?? new Date().toISOString(),
          } as LinkedCommensal;
        });
    } catch (error) {
      _logger.error("getLinkedCommensalsForUser failed:", error as any);
      return [];
    }
  }

  /**
   * Get pending commensal requests for a user (requests they received).
   */
  async getPendingRequestsForUser(userId: string): Promise<Commensalship[]> {
    const db = await getDbModule();

    if (db) {
      try {
        const result = await db.executeQuery(
          `SELECT c.id, c.requester_id, c.addressee_id, c.status,
                  c.created_at, c.updated_at,
                  COALESCE(u_req.name, '') as requester_name,
                  u_req.email as requester_email,
                  COALESCE(u_adr.name, '') as addressee_name,
                  u_adr.email as addressee_email
           FROM commensalships c
           JOIN users u_req ON c.requester_id = u_req.id
           JOIN users u_adr ON c.addressee_id = u_adr.id
           WHERE c.addressee_id::text = $1 AND c.status = 'pending'
           ORDER BY c.created_at DESC`,
          [userId],
        );

        return result.rows.map((r: any) => this.rowToCommensalship(r));
      } catch (error) {
        _logger.error("getPendingRequestsForUser failed:", error as any);
        return [];
      }
    }

    return Array.from(commensalshipsStore.values()).filter(
      (c) => c.addresseeId === userId && c.status === "pending",
    );
  }

  private async getCommensalshipById(id: string): Promise<Commensalship | null> {
    const db = await getDbModule();
    if (!db) return commensalshipsStore.get(id) || null;

    try {
      const result = await db.executeQuery(
        `SELECT c.id, c.requester_id, c.addressee_id, c.status,
                c.created_at, c.updated_at,
                COALESCE(u_req.name, '') as requester_name,
                u_req.email as requester_email,
                COALESCE(u_adr.name, '') as addressee_name,
                u_adr.email as addressee_email
         FROM commensalships c
         JOIN users u_req ON c.requester_id = u_req.id
         JOIN users u_adr ON c.addressee_id = u_adr.id
         WHERE c.id = $1`,
        [id],
      );
      if (result.rows.length === 0) return null;
      return this.rowToCommensalship(result.rows[0]);
    } catch {
      return null;
    }
  }

  private rowToCommensalship(row: any): Commensalship {
    return {
      id: row.id,
      requesterId: row.requester_id.toString(),
      requesterName: row.requester_name || undefined,
      requesterEmail: row.requester_email || undefined,
      addresseeId: row.addressee_id.toString(),
      addresseeName: row.addressee_name || undefined,
      addresseeEmail: row.addressee_email || undefined,
      status: row.status as CommensalshipStatus,
      createdAt: row.created_at?.toISOString?.() ?? row.created_at,
      updatedAt: row.updated_at?.toISOString?.() ?? row.updated_at,
    };
  }
}

export const commensalDatabase = new CommensalDatabaseService();
