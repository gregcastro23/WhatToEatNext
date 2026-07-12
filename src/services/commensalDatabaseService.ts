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
  SavedChart,
  BirthData,
  NatalChart,
  GroupMember,
  ElementalProperties,
} from "@/types/natalChart";
import {
  aggregateEnhancedZodiacElementals,
  isSectDiurnal,
} from "@/utils/planetaryAlchemyMapping";
import { safeJsonParse } from "@/utils/typeGuards";
import type { PoolClient } from "pg";

/**
 * Minimal client surface handed to transactional callbacks — writes issued
 * through it join the surrounding BEGIN/COMMIT.
 */
export type TransactionClient = Pick<PoolClient, "query">;

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

// In-memory fallback stores
const commensalshipsStore: Map<string, Commensalship> = new Map();
const savedChartsStore: Map<string, SavedChart> = new Map();

type DbTimestamp = Date | string | null | undefined;

interface SearchUserRow {
  id?: string | number | null;
  name?: string | null;
  email?: string | null;
}

interface LinkedCommensalProfile {
  birthData?: BirthData;
  birth_data?: BirthData;
  natalChart?: NatalChart;
  natal_chart?: NatalChart;
}

interface LinkedCommensalRow {
  commensal_id?: string | number | null;
  commensal_name?: string | null;
  commensal_email?: string | null;
  profile?: string | LinkedCommensalProfile | null;
  commensalship_id?: string | null;
  synced_at?: DbTimestamp;
}

/**
 * Row shape of the PROD saved_charts table (database/init/10-social-schema.sql):
 * structured birth fields keyed by (user_id, chart_name). There are no
 * chart_type / birth_data JSONB / natal_chart columns in prod.
 */
interface SavedChartRow {
  id?: string | null;
  user_id?: string | null;
  chart_name?: string | null;
  birth_date?: DbTimestamp;
  birth_time?: string | null;
  birth_latitude?: number | string | null;
  birth_longitude?: number | string | null;
  timezone_str?: string | null;
  is_primary?: boolean | null;
  created_at?: DbTimestamp;
  updated_at?: DbTimestamp;
}

interface ManualCompanionRow {
  id?: string | null;
  name?: string | null;
  relationship?: string | null;
  birth_data?: string | BirthData | null;
  natal_chart?: string | NatalChart | null;
  created_at?: DbTimestamp;
}

interface CommensalshipRow {
  id?: string | null;
  requester_id?: string | number | null;
  requester_name?: string | null;
  requester_email?: string | null;
  addressee_id?: string | number | null;
  addressee_name?: string | null;
  addressee_email?: string | null;
  status?: CommensalshipStatus | null;
  created_at?: DbTimestamp;
  updated_at?: DbTimestamp;
}

const dbString = (value: string | number | null | undefined, fallback = ""): string =>
  value == null ? fallback : String(value);

const dbOptionalString = (
  value: string | number | null | undefined,
): string | undefined => {
  const resolved = dbString(value);
  return resolved || undefined;
};

const dbIsoString = (value: DbTimestamp, fallback = new Date().toISOString()): string =>
  value instanceof Date ? value.toISOString() : value || fallback;

const readJsonColumn = <T>(value: string | T | null | undefined, fallback: T): T => {
  if (typeof value === "string") return safeJsonParse<T>(value, fallback) ?? fallback;
  return value ?? fallback;
};

/**
 * Local wall-clock "HH:MM:SS" at the birth location for a given instant —
 * pre-drift prod saved_charts rows store birth_time as local wall time paired
 * with timezone_str (the IANA zone). Falls back to the UTC clock (paired with
 * timezone_str "UTC") when no/invalid timezone is supplied, keeping the two
 * columns internally consistent.
 */
const localWallClock = (
  instant: Date,
  timeZone?: string,
): { time: string; tz: string } => {
  if (timeZone) {
    try {
      const time = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hourCycle: "h23",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(instant);
      return { time, tz: timeZone };
    } catch {
      // Invalid IANA zone name — fall through to UTC.
    }
  }
  return { time: instant.toISOString().slice(11, 19), tz: "UTC" };
};

const normalizeGroupRelationship = (
  value: string | null | undefined,
): GroupMember["relationship"] => {
  const allowed: Array<NonNullable<GroupMember["relationship"]>> = [
    "self",
    "family",
    "friend",
    "partner",
    "colleague",
    "other",
  ];
  return allowed.includes(value as NonNullable<GroupMember["relationship"]>)
    ? (value as GroupMember["relationship"])
    : undefined;
};

class CommensalDatabaseService {
  // ─── User Search ─────────────────────────────────────────

  /**
   * Search for registered users by email (partial match).
   * Returns basic info only with obscured email (no sensitive data).
   */
  async searchUsers(
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
         WHERE (u.email ILIKE $1 OR u.name ILIKE $1)
           AND u.id::text != $2
           AND u.is_active = true
         ORDER BY u.email
         LIMIT $3`,
        [`%${query}%`, excludeUserId, limit],
      );

      // Obscure email for privacy (show first 2 chars + domain)
      return result.rows.map((r: SearchUserRow) => {
        const email = r.email || "";
        const [local, domain] = email.split("@");
        const obscuredEmail = local && domain
          ? `${local.slice(0, 2)}***@${domain}`
          : email;

        return {
          id: dbString(r.id),
          name: r.name || "",
          email: obscuredEmail,
        };
      });
    } catch (error) {
      _logger.error("searchUsers failed:", error);
      return [];
    }
  }

  // ─── Commensalships ─────────────────────────────────────────

  /**
   * Send a commensal request from requester to addressee.
   * Prevents duplicates and self-requests.
   *
   * Mutual-interest shortcut: if the addressee already has a PENDING request
   * pointing back at the requester, this call is treated as consent — the
   * existing reverse row is auto-accepted (no reciprocal insert) and the
   * original requester gets the commensal_accepted notification.
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
        // Check for an existing commensalship in either direction. Returns
        // undefined when no row exists (caller should insert), otherwise the
        // resolved commensalship (or null when blocked).
        const resolveExisting = async (): Promise<
          Commensalship | null | undefined
        > => {
          const existing = await db.executeQuery(
            `SELECT id, status, requester_id FROM commensalships
             WHERE (requester_id = $1::uuid AND addressee_id = $2::uuid)
                OR (requester_id = $2::uuid AND addressee_id = $1::uuid)`,
            [requesterId, addresseeId],
          );
          if (existing.rows.length === 0) return undefined;

          const row = existing.rows[0];
          if (row.status === "blocked") return null;

          const isReversePending =
            row.status === "pending" && String(row.requester_id) === addresseeId;
          if (isReversePending) {
            // The target already requested me — mutual interest. Accept their
            // pending request instead of inserting a reciprocal row. The
            // status guard makes concurrent accepts idempotent.
            const updated = await db.executeQuery(
              `UPDATE commensalships
                  SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1 AND status = 'pending'`,
              [row.id],
            );
            if ((updated.rowCount ?? 0) > 0) {
              // Fire-and-forget: never block the request path on notification.
              void this.notifyAutoAccepted(
                addresseeId,
                requesterId,
                String(row.id),
              );
            }
          }
          return await this.getCommensalshipById(String(row.id));
        };

        const preExisting = await resolveExisting();
        if (preExisting !== undefined) return preExisting;

        try {
          await db.executeQuery(
            `INSERT INTO commensalships (id, requester_id, addressee_id, status)
             VALUES ($1, $2::uuid, $3::uuid, 'pending')`,
            [id, requesterId, addresseeId],
          );
        } catch (insertError) {
          // 23505 = unique violation: a concurrent request for this pair won
          // the race (including the reverse direction, via the unordered-pair
          // index idx_commensalships_pair). Resolve against what landed.
          if ((insertError as { code?: string })?.code === "23505") {
            const raced = await resolveExisting();
            return raced ?? null;
          }
          throw insertError;
        }

        // Fetch with names
        return await this.getCommensalshipById(id);
      } catch (error) {
        _logger.error("createCommensalRequest failed:", error);
        return null;
      }
    }

    // In-memory fallback (mirrors the DB semantics, incl. mutual auto-accept)
    const existingLocal = Array.from(commensalshipsStore.values()).find(
      (c) =>
        (c.requesterId === requesterId && c.addresseeId === addresseeId) ||
        (c.requesterId === addresseeId && c.addresseeId === requesterId),
    );
    if (existingLocal) {
      if (existingLocal.status === "blocked") return null;
      if (
        existingLocal.status === "pending" &&
        existingLocal.requesterId === addresseeId
      ) {
        existingLocal.status = "accepted";
        existingLocal.updatedAt = new Date().toISOString();
      }
      return existingLocal;
    }
    commensalshipsStore.set(id, commensalship);
    return commensalship;
  }

  /**
   * Notify the ORIGINAL requester that their pending request was accepted via
   * the mutual-interest shortcut. Fire-and-forget; failures only warn.
   */
  private async notifyAutoAccepted(
    originalRequesterId: string,
    accepterId: string,
    commensalshipId: string,
  ): Promise<void> {
    try {
      let accepterName = "Someone";
      const db = await getDbModule();
      if (db) {
        try {
          const res = await db.executeQuery(
            `SELECT COALESCE(NULLIF(profile->>'name', ''), NULLIF(name, ''), '') AS name
               FROM users WHERE id = $1::uuid`,
            [accepterId],
          );
          accepterName = res.rows[0]?.name || "Someone";
        } catch {
          // keep the generic fallback name
        }
      }
      const { notificationDatabase } = await import(
        "@/services/notificationDatabaseService"
      );
      await notificationDatabase.createNotification(
        originalRequesterId,
        "commensal_accepted",
        "Dining Companion Request Accepted",
        `${accepterName} accepted your dining companion request`,
        {
          relatedUserId: accepterId,
          metadata: { commensalshipId },
        },
      );
    } catch (error) {
      _logger.warn("notifyAutoAccepted failed (non-blocking):", error);
    }
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

        const {
          requester_id: requesterId,
          addressee_id: addresseeId,
          status,
        } = check.rows[0];
        const isParty =
          actingUserId === requesterId.toString() ||
          actingUserId === addresseeId.toString();
        if (!isParty) return null;

        // Only addressee can accept
        if (
          newStatus === "accepted" &&
          actingUserId !== addresseeId.toString()
        ) return null;
        // Can't accept if already blocked
        if (status === "blocked" && newStatus === "accepted") return null;

        // Accept is guarded (status='pending') so a concurrent block between
        // the check above and this write can never be overwritten to accepted.
        const guard = newStatus === "accepted" ? " AND status = 'pending'" : "";
        const updated = await db.executeQuery(
          `UPDATE commensalships SET status = $2::commensalship_status, updated_at = CURRENT_TIMESTAMP WHERE id = $1${guard}`,
          [commensalshipId, newStatus],
        );
        if (newStatus === "accepted" && (updated.rowCount ?? 0) === 0) {
          // The row changed under us. Re-read: an already-accepted row keeps
          // accept idempotent; anything else (e.g. now blocked) is a refusal.
          const current = await this.getCommensalshipById(commensalshipId);
          return current?.status === "accepted" ? current : null;
        }

        return await this.getCommensalshipById(commensalshipId);
      } catch (error) {
        _logger.error("updateCommensalshipStatus failed:", error);
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
        _logger.error("deleteCommensalship failed:", error);
        return false;
      }
    }

    commensalshipsStore.delete(commensalshipId);
    return true;
  }

  /**
   * Best-effort follow-edge purge after a block lands (PR 4 social graph):
   * a blocked pair must not keep following each other. Log-and-continue —
   * the block itself must never fail because the purge did. Silent, like the
   * block itself (blocks emit no notifications).
   */
  private async purgeFollowsAfterBlock(a?: string, b?: string): Promise<void> {
    if (!a || !b) return;
    try {
      const { followDatabase } = await import(
        "@/services/followDatabaseService"
      );
      await followDatabase.purgeFollowsBetween(a, b);
    } catch (error) {
      _logger.warn("purgeFollowsAfterBlock failed (non-blocking):", error);
    }
  }

  /**
   * Block a companion link. Either party may block. Upserts the pair row to
   * status='blocked', creating one when no relationship exists yet.
   * Blocked rows are excluded from linked-commensal listings (those filter on
   * status='accepted') and createCommensalRequest returns null for the pair.
   * Existing follow edges between the pair are purged in both directions.
   * Silent by design — no notifications for block/unblock.
   */
  async blockCommensal(
    actingUserId: string,
    opts: { commensalshipId?: string; targetUserId?: string },
  ): Promise<Commensalship | null> {
    const db = await getDbModule();

    if (db) {
      try {
        if (opts.commensalshipId) {
          const result = await db.executeQuery(
            `UPDATE commensalships
                SET status = 'blocked', updated_at = CURRENT_TIMESTAMP
              WHERE id = $1
                AND (requester_id = $2::uuid OR addressee_id = $2::uuid)`,
            [opts.commensalshipId, actingUserId],
          );
          if ((result.rowCount ?? 0) === 0) return null;
          const blockedRow = await this.getCommensalshipById(
            opts.commensalshipId,
          );
          await this.purgeFollowsAfterBlock(
            blockedRow?.requesterId,
            blockedRow?.addresseeId,
          );
          return blockedRow;
        }

        if (opts.targetUserId) {
          if (opts.targetUserId === actingUserId) return null;

          const existing = await db.executeQuery(
            `SELECT id FROM commensalships
             WHERE (requester_id = $1::uuid AND addressee_id = $2::uuid)
                OR (requester_id = $2::uuid AND addressee_id = $1::uuid)`,
            [actingUserId, opts.targetUserId],
          );
          if (existing.rows.length > 0) {
            const rowId = String(existing.rows[0].id);
            await db.executeQuery(
              `UPDATE commensalships
                  SET status = 'blocked', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1`,
              [rowId],
            );
            await this.purgeFollowsAfterBlock(actingUserId, opts.targetUserId);
            return await this.getCommensalshipById(rowId);
          }

          const id = `commensal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          try {
            await db.executeQuery(
              `INSERT INTO commensalships (id, requester_id, addressee_id, status)
               VALUES ($1, $2::uuid, $3::uuid, 'blocked')`,
              [id, actingUserId, opts.targetUserId],
            );
          } catch (insertError) {
            // Unordered-pair unique index: a concurrent row landed first —
            // block that one instead.
            if ((insertError as { code?: string })?.code === "23505") {
              return await this.blockCommensal(actingUserId, opts);
            }
            throw insertError;
          }
          await this.purgeFollowsAfterBlock(actingUserId, opts.targetUserId);
          return await this.getCommensalshipById(id);
        }

        return null;
      } catch (error) {
        _logger.error("blockCommensal failed:", error);
        return null;
      }
    }

    // In-memory fallback
    const local = opts.commensalshipId
      ? commensalshipsStore.get(opts.commensalshipId)
      : Array.from(commensalshipsStore.values()).find(
          (c) =>
            (c.requesterId === actingUserId && c.addresseeId === opts.targetUserId) ||
            (c.requesterId === opts.targetUserId && c.addresseeId === actingUserId),
        );
    if (local) {
      const isParty =
        local.requesterId === actingUserId || local.addresseeId === actingUserId;
      if (!isParty) return null;
      local.status = "blocked";
      local.updatedAt = new Date().toISOString();
      return local;
    }
    if (opts.targetUserId && opts.targetUserId !== actingUserId) {
      const now = new Date().toISOString();
      const created: Commensalship = {
        id: `commensal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        requesterId: actingUserId,
        addresseeId: opts.targetUserId,
        status: "blocked",
        createdAt: now,
        updatedAt: now,
      };
      commensalshipsStore.set(created.id, created);
      return created;
    }
    return null;
  }

  /**
   * Unblock: delete the blocked pair row so a fresh request becomes possible.
   * LIMITATION: the schema has no blocked_by column, so either party may clear
   * a block (the blocker can simply re-block).
   */
  async unblockCommensal(
    actingUserId: string,
    opts: { commensalshipId?: string; targetUserId?: string },
  ): Promise<boolean> {
    const db = await getDbModule();

    if (db) {
      try {
        if (opts.commensalshipId) {
          const result = await db.executeQuery(
            `DELETE FROM commensalships
              WHERE id = $1 AND status = 'blocked'
                AND (requester_id = $2::uuid OR addressee_id = $2::uuid)`,
            [opts.commensalshipId, actingUserId],
          );
          return (result.rowCount ?? 0) > 0;
        }
        if (opts.targetUserId) {
          const result = await db.executeQuery(
            `DELETE FROM commensalships
              WHERE status = 'blocked'
                AND ((requester_id = $1::uuid AND addressee_id = $2::uuid)
                  OR (requester_id = $2::uuid AND addressee_id = $1::uuid))`,
            [actingUserId, opts.targetUserId],
          );
          return (result.rowCount ?? 0) > 0;
        }
        return false;
      } catch (error) {
        _logger.error("unblockCommensal failed:", error);
        return false;
      }
    }

    // In-memory fallback
    const local = opts.commensalshipId
      ? commensalshipsStore.get(opts.commensalshipId)
      : Array.from(commensalshipsStore.values()).find(
          (c) =>
            (c.requesterId === actingUserId && c.addresseeId === opts.targetUserId) ||
            (c.requesterId === opts.targetUserId && c.addresseeId === actingUserId),
        );
    if (!local || local.status !== "blocked") return false;
    const isParty =
      local.requesterId === actingUserId || local.addresseeId === actingUserId;
    if (!isParty) return false;
    commensalshipsStore.delete(local.id);
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

        return result.rows.map((r: CommensalshipRow) => this.rowToCommensalship(r));
      } catch (error) {
        _logger.error("getCommensalshipsForUser failed:", error);
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
        .filter((r: LinkedCommensalRow) => {
          // Only include commensals who have completed onboarding (have natal chart)
          const profile = readJsonColumn<LinkedCommensalProfile>(r.profile, {});
          return !!profile.natalChart && Object.keys(profile.natalChart).length > 0;
        })
        .map((r: LinkedCommensalRow) => {
          const profile = readJsonColumn<LinkedCommensalProfile>(r.profile, {});
          const birthData = profile.birthData || profile.birth_data;
          const natalChart = profile.natalChart || profile.natal_chart;
          
          return {
            userId: dbString(r.commensal_id),
            name: dbString(r.commensal_name),
            email: dbString(r.commensal_email),
            natalChart: natalChart as NatalChart,
            birthData: birthData as BirthData,
            commensalshipId: dbString(r.commensalship_id),
            syncedAt: dbIsoString(r.synced_at),
          };
        });
    } catch (error) {
      _logger.error("getLinkedCommensalsForUser failed:", error);
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

        return result.rows.map((r: CommensalshipRow) => this.rowToCommensalship(r));
      } catch (error) {
        _logger.error("getPendingRequestsForUser failed:", error);
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

  // ─── Saved Charts (Cosmic Identities) ───────────────────────
  // Moved here from the removed socialDatabaseService.

  private static readonly SAVED_CHART_COLUMNS = `id, user_id, chart_name, birth_date, birth_time,
          birth_latitude, birth_longitude, timezone_str, is_primary, created_at, updated_at`;

  async getSavedChartsForUser(userId: string): Promise<SavedChart[]> {
    const db = await getDbModule();
    if (db) {
      try {
        // LIMIT is a safety ceiling, not pagination — a user's saved charts are
        // inherently few; the cap just bounds a pathological/abuse-driven read.
        const result = await db.executeQuery(
          `SELECT ${CommensalDatabaseService.SAVED_CHART_COLUMNS}
             FROM saved_charts
            WHERE user_id = $1::uuid
            ORDER BY is_primary DESC, created_at ASC
            LIMIT 500`,
          [userId],
        );
        return result.rows.map((r: SavedChartRow) => this.rowToSavedChart(r));
      } catch (error) {
        _logger.error("getSavedChartsForUser failed:", error);
        return [];
      }
    }
    return Array.from(savedChartsStore.values()).filter((c) => c.ownerId === userId);
  }

  /**
   * Persist a saved chart. Prod saved_charts stores structured birth fields
   * only (no natal_chart JSONB), so the caller-computed natalChart/chartType
   * are echoed back on the returned object for API-response shape but are not
   * stored. Upserts on (user_id, chart_name): re-saving an existing name
   * refreshes its birth fields instead of failing or silently discarding
   * the caller's new data.
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
    const now = new Date().toISOString();

    if (db) {
      try {
        const birthDate = new Date(data.birthData.dateTime);
        if (Number.isNaN(birthDate.getTime())) {
          _logger.error("createSavedChart: invalid birthData.dateTime");
          return null;
        }
        // birth_time is LOCAL wall time at the birth location (matching
        // pre-drift prod rows); birth_date is the birth instant (timestamptz
        // normalizes to UTC internally, so the ISO instant is correct).
        const wall = localWallClock(birthDate, data.birthData.timezone);
        const insert = await db.executeQuery(
          `INSERT INTO saved_charts
             (user_id, chart_name, birth_date, birth_time, birth_latitude,
              birth_longitude, timezone_str, is_primary)
           VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (user_id, chart_name) DO UPDATE SET
             birth_date = EXCLUDED.birth_date,
             birth_time = EXCLUDED.birth_time,
             birth_latitude = EXCLUDED.birth_latitude,
             birth_longitude = EXCLUDED.birth_longitude,
             timezone_str = EXCLUDED.timezone_str,
             is_primary = EXCLUDED.is_primary,
             updated_at = NOW()
           RETURNING id, created_at, updated_at`,
          [
            data.ownerId,
            data.label,
            birthDate.toISOString(),
            wall.time,
            data.birthData.latitude,
            data.birthData.longitude,
            wall.tz,
            data.isPrimary ?? false,
          ],
        );

        const row = insert.rows[0];
        if (!row) {
          _logger.error("createSavedChart: upsert returned no row");
          return null;
        }
        return {
          id: dbString(row.id),
          ownerId: data.ownerId,
          label: data.label,
          chartType: data.chartType,
          birthData: data.birthData,
          natalChart: data.natalChart,
          isPrimary: data.isPrimary ?? false,
          createdAt: dbIsoString(row.created_at, now),
          updatedAt: dbIsoString(row.updated_at, now),
        };
      } catch (error) {
        _logger.error("createSavedChart failed:", error);
        return null;
      }
    }

    const id = `chart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const chart: SavedChart = {
      id, ownerId: data.ownerId, label: data.label, chartType: data.chartType,
      birthData: data.birthData, natalChart: data.natalChart,
      isPrimary: data.isPrimary ?? false, createdAt: now, updatedAt: now,
    };
    savedChartsStore.set(id, chart);
    return chart;
  }

  private rowToSavedChart(row: SavedChartRow): SavedChart {
    return {
      id: dbString(row.id),
      ownerId: dbString(row.user_id),
      label: dbString(row.chart_name),
      // Prod saved_charts rows are user-owned cosmic identities (manual
      // companions live in manual_companion_charts) — there is no chart_type
      // column to read.
      chartType: "cosmic_identity",
      birthData: {
        dateTime: dbIsoString(row.birth_date, ""),
        latitude: Number(row.birth_latitude ?? 0),
        longitude: Number(row.birth_longitude ?? 0),
        timezone: row.timezone_str || undefined,
      },
      // No natal chart is stored in prod — callers needing planetary data must
      // recompute from birthData. Empty object preserves the SavedChart shape.
      natalChart: {} as NatalChart,
      isPrimary: row.is_primary === true,
      createdAt: dbIsoString(row.created_at),
      updatedAt: dbIsoString(row.updated_at),
    };
  }

  // ─── Manual Companion Charts (Brand Term: Commensals) ───────

  async getManualCompanionsForUser(userId: string): Promise<GroupMember[]> {
    const db = await getDbModule();
    if (db) {
      try {
        // LIMIT is a safety ceiling, not pagination — bounds a pathological read.
        const result = await db.executeQuery(
          `SELECT * FROM manual_companion_charts WHERE owner_id::text = $1 ORDER BY created_at DESC LIMIT 500`,
          [userId],
        );
        return result.rows.map((r: ManualCompanionRow) => ({
          id: dbString(r.id),
          name: dbString(r.name),
          relationship: normalizeGroupRelationship(r.relationship),
          birthData: readJsonColumn<BirthData>(r.birth_data, {} as BirthData),
          natalChart: readJsonColumn<NatalChart>(r.natal_chart, {} as NatalChart),
          createdAt: dbIsoString(r.created_at),
        }));
      } catch (error) {
        _logger.error("getManualCompanionsForUser failed:", error);
        return [];
      }
    }
    return [];
  }

  async createManualCompanion(data: {
    ownerId: string;
    name: string;
    relationship?: string;
    birthData: BirthData;
    natalChart: NatalChart;
  }): Promise<GroupMember | null> {
    const db = await getDbModule();
    const id = `commensal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (db) {
      try {
        await db.executeQuery(
          `INSERT INTO manual_companion_charts (id, owner_id, name, relationship, birth_data, natal_chart)
           VALUES ($1, $2::uuid, $3, $4, $5, $6)`,
          [id, data.ownerId, data.name, data.relationship || "friend",
           JSON.stringify(data.birthData), JSON.stringify(data.natalChart)],
        );
        return {
          id,
          name: data.name,
          relationship: normalizeGroupRelationship(data.relationship),
          birthData: data.birthData,
          natalChart: data.natalChart,
          createdAt: now,
        };
      } catch (error) {
        _logger.error("createManualCompanion failed:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Persist a batch of manual companions AND run a group-registration step as
   * ONE atomic unit. Everything — companion inserts and whatever registerGroup
   * writes — runs on the SAME checked-out client inside one BEGIN/COMMIT, so a
   * failure anywhere rolls the whole write back (no orphaned companions, no
   * group pointing at members that never landed, and no group committed while
   * its companions vanish).
   *
   * IMPORTANT: registerGroup receives the transaction client and MUST issue
   * its writes through it. It must NOT acquire additional pooled connections
   * (e.g. via other services) — the pool is small and hold-and-acquire under
   * concurrency starves it, and any independently-committed write would break
   * atomicity in the reverse direction.
   *
   * Returns the created members, or null on failure (everything rolled back).
   */
  async createManualCompanionsAtomic(
    ownerId: string,
    companions: Array<{
      name: string;
      relationship?: string;
      birthData: BirthData;
      natalChart: NatalChart;
    }>,
    registerGroup: (
      created: GroupMember[],
      client: TransactionClient,
    ) => Promise<void>,
  ): Promise<GroupMember[] | null> {
    const db = await getDbModule();
    if (!db) return null;

    try {
      return await db.withTransaction(async (client) => {
        const created: GroupMember[] = [];
        for (const c of companions) {
          const id = `commensal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await client.query(
            `INSERT INTO manual_companion_charts (id, owner_id, name, relationship, birth_data, natal_chart)
             VALUES ($1, $2::uuid, $3, $4, $5, $6)`,
            [
              id,
              ownerId,
              c.name,
              c.relationship || "friend",
              JSON.stringify(c.birthData),
              JSON.stringify(c.natalChart),
            ],
          );
          created.push({
            id,
            name: c.name,
            relationship: normalizeGroupRelationship(c.relationship),
            birthData: c.birthData,
            natalChart: c.natalChart,
            createdAt: new Date().toISOString(),
          });
        }
        // Register the group on the same client, inside the same transaction.
        await registerGroup(created, client);
        return created;
      });
    } catch (error) {
      _logger.error(
        "createManualCompanionsAtomic failed (rolled back):",
        error,
      );
      return null;
    }
  }

  async deleteManualCompanion(id: string, ownerId: string): Promise<boolean> {
    const db = await getDbModule();
    if (db) {
      try {
        const result = await db.executeQuery(
          `DELETE FROM manual_companion_charts WHERE id = $1 AND owner_id::text = $2`,
          [id, ownerId],
        );
        return (result.rowCount ?? 0) > 0;
      } catch (error) {
        _logger.error("deleteManualCompanion failed:", error);
        return false;
      }
    }
    return false;
  }

  async updateManualCompanion(
    id: string,
    ownerId: string,
    patch: {
      name?: string;
      relationship?: string;
      birthData?: BirthData;
      natalChart?: NatalChart;
    },
  ): Promise<GroupMember | null> {
    const db = await getDbModule();
    if (!db) return null;

    const sets: string[] = [];
    const params: unknown[] = [id, ownerId];
    let n = 3;

    if (patch.name !== undefined) {
      sets.push(`name = $${n++}`);
      params.push(patch.name);
    }
    if (patch.relationship !== undefined) {
      sets.push(`relationship = $${n++}`);
      params.push(patch.relationship);
    }
    if (patch.birthData !== undefined) {
      sets.push(`birth_data = $${n++}`);
      params.push(JSON.stringify(patch.birthData));
    }
    if (patch.natalChart !== undefined) {
      sets.push(`natal_chart = $${n++}`);
      params.push(JSON.stringify(patch.natalChart));
    }

    if (sets.length === 0) return null;

    try {
      const result = await db.executeQuery<{
        id: string;
        name: string;
        relationship: string | null;
        birth_data: unknown;
        natal_chart: unknown;
        created_at: Date | string;
      }>(
        `UPDATE manual_companion_charts
         SET ${sets.join(", ")}
         WHERE id = $1 AND owner_id::text = $2
         RETURNING id, name, relationship, birth_data, natal_chart, created_at`,
        params,
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        relationship: (row.relationship ?? undefined) as GroupMember["relationship"],
        birthData: row.birth_data as BirthData,
        natalChart: row.natal_chart as NatalChart,
        createdAt: row.created_at?.toString() ?? new Date().toISOString(),
      };
    } catch (error) {
      _logger.error("updateManualCompanion failed:", error);
      return null;
    }
  }

  // ─── Elemental Profile ──────────────────────────────────────

  /**
   * Load a user's primary elemental profile.
   *
   * Sequential fallback chain — each step is isolated in its OWN try/catch so
   * a failure (e.g. schema drift) in one source can never mask the next:
   *   1. user_profiles.natal_chart column — the canonical profile write target
   *      (userDatabaseService.updateUserProfile dual-writes here).
   *   2. users.profile JSONB ->'natalChart' — legacy write path; heals users
   *      whose chart only ever landed in the profile blob.
   *   3. Give up → null with a warn log.
   *
   * NOTE: prod saved_charts has NO natal_chart column (see
   * database/init/10-social-schema.sql), so it is intentionally not consulted.
   * Recomputes from planetaryPositions when a stored elementalBalance is
   * missing or stale-shaped.
   *
   * Returns null when the user has no chart on file — callers must handle.
   */
  async getUserElementalProfile(
    userId: string,
  ): Promise<ElementalProperties | null> {
    const db = await getDbModule();
    if (!db) return null;

    // 1. Canonical: user_profiles structured columns.
    try {
      const result = await db.executeQuery(
        `SELECT natal_chart, birth_data FROM user_profiles WHERE user_id = $1::uuid`,
        [userId],
      );
      if (result.rows.length > 0) {
        const profile = this.extractElementalProfile(result.rows[0]);
        if (profile) return profile;
      }
    } catch (error) {
      _logger.warn(
        "getUserElementalProfile: user_profiles read failed, falling back to users.profile JSONB:",
        error,
      );
    }

    // 2. Legacy: users.profile JSONB.
    try {
      const result = await db.executeQuery(
        `SELECT profile FROM users WHERE id = $1::uuid`,
        [userId],
      );
      if (result.rows.length > 0) {
        const profile = typeof result.rows[0].profile === "string"
          ? safeJsonParse(result.rows[0].profile)
          : result.rows[0].profile;
        const natalChart = profile?.natalChart || profile?.natal_chart;
        const birthData = profile?.birthData || profile?.birth_data;
        if (natalChart) {
          const extracted = this.extractElementalProfile({
            natal_chart: natalChart,
            birth_data: birthData,
          });
          if (extracted) return extracted;
        }
      }
    } catch (error) {
      _logger.warn(
        "getUserElementalProfile: users.profile JSONB fallback failed:",
        error,
      );
    }

    // 3. Nothing usable on file.
    _logger.warn(
      `getUserElementalProfile: no elemental profile found for user ${userId}`,
    );
    return null;
  }

  private extractElementalProfile(row: {
    natal_chart: unknown;
    birth_data: unknown;
  }): ElementalProperties | null {
    const natalChart = (typeof row.natal_chart === "string"
      ? safeJsonParse(row.natal_chart)
      : row.natal_chart) as Partial<NatalChart> | null;
    if (!natalChart) return null;

    if (
      natalChart.elementalBalance &&
      typeof natalChart.elementalBalance === "object" &&
      "Fire" in natalChart.elementalBalance
    ) {
      return natalChart.elementalBalance;
    }

    if (natalChart.planetaryPositions) {
      const positions: Record<string, string> = {};
      for (const [planet, sign] of Object.entries(natalChart.planetaryPositions)) {
        positions[planet] = String(sign);
      }
      if (Object.keys(positions).length === 0) return null;

      const birthData = (typeof row.birth_data === "string"
        ? safeJsonParse(row.birth_data)
        : row.birth_data) as Partial<BirthData> | null;
      const birthDate = birthData?.dateTime
        ? new Date(birthData.dateTime)
        : undefined;
      return aggregateEnhancedZodiacElementals(positions, isSectDiurnal(birthDate));
    }

    return null;
  }

  // ─── Internal helpers ────────────────────────────────────────
  private rowToCommensalship(row: CommensalshipRow): Commensalship {
    return {
      id: dbString(row.id),
      requesterId: dbString(row.requester_id),
      requesterName: dbOptionalString(row.requester_name),
      requesterEmail: dbOptionalString(row.requester_email),
      addresseeId: dbString(row.addressee_id),
      addresseeName: dbOptionalString(row.addressee_name),
      addresseeEmail: dbOptionalString(row.addressee_email),
      status: row.status || "pending",
      createdAt: dbIsoString(row.created_at),
      updatedAt: dbIsoString(row.updated_at),
    };
  }
}

export const commensalDatabase = new CommensalDatabaseService();
