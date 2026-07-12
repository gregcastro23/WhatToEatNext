/**
 * Table Database Service (docs/plans/pr2-table-entity-plan.md).
 *
 * Owns the `tables` / `table_members` / `table_invites` / `table_photos` /
 * `table_comments` write and read paths. Postgres is the sole authoritative
 * record across the whole lifecycle (planned -> live -> memory, or
 * planned/live -> cancelled). Modeled directly on
 * src/services/commensalDatabaseService.ts's conventions: guarded
 * `UPDATE ... WHERE ... RETURNING` for race-safe transitions, `withTransaction`
 * for atomic multi-row writes, isolated try/catch per query so one source's
 * failure never masks a fallback.
 *
 * Composite-chart recomputation is delegated to
 * src/lib/tables/composite.ts (`computeAndStoreTableComposite`) rather than
 * inlined here — it has its own I/O surface (user_profiles, manual_companion_charts,
 * the recipe catalog) and is intentionally decoupled so it never needs to reach
 * back into this service (no import cycle).
 */

import { randomBytes } from "crypto";
import { executeQuery, withTransaction } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { computeAndStoreTableComposite } from "@/lib/tables/composite";
import type {
  TableComment,
  TableDetail,
  TableInvite,
  TableInvitePreview,
  TableMember,
  TableMemoryPayload,
  TableMenuItem,
  TablePhoto,
  TableRecord,
  TableStatus,
  TableVenue,
  TableVisibility,
} from "@/types/table";
import { safeJsonParse } from "@/utils/typeGuards";

export const MAX_TABLE_MEMBERS = 24;
export const MAX_TABLE_PHOTOS = 12;

export type TableListScope = "upcoming" | "past" | "hosting" | "all";

export type AddMemberFailureReason =
  | "not_found"
  | "not_host"
  | "blocked"
  | "cap_exceeded"
  | "duplicate";

export type AddMemberResult =
  | { ok: true; member: TableMember }
  | { ok: false; reason: AddMemberFailureReason };

export type RemoveMemberResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "forbidden" };

export type RsvpResult =
  | { ok: true; member: TableMember; table: TableRecord }
  | { ok: false; reason: "not_found" };

export type RedeemInviteResult =
  | { ok: true; tableId: string; alreadyMember: boolean }
  | { ok: false; reason: "invalid" | "expired" | "closed" | "blocked" | "cap_exceeded" };

// ─── Row → domain mapping helpers ────────────────────────────────────────

type DbTimestamp = Date | string | null | undefined;

const dbIsoString = (value: DbTimestamp, fallback = new Date().toISOString()): string =>
  value instanceof Date ? value.toISOString() : value || fallback;

const dbString = (value: string | number | null | undefined, fallback = ""): string =>
  value == null ? fallback : String(value);

function readJsonColumn<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") return safeJsonParse<T>(value, fallback) ?? fallback;
  return (value as T) ?? fallback;
}

// The pooled client surface handed to withTransaction's callback exposes
// `.query`; row shapes below are read generically (the pg driver returns
// `any` rows) and mapped by hand — same posture as commensalDatabaseService.
type Row = any;

class TableDatabaseService {
  private rowToTableRecord(row: Row): TableRecord {
    const venue: TableVenue = {
      type: row.venue_type,
      restaurantId: row.venue_restaurant_id ?? undefined,
      name: row.venue_name ?? undefined,
      address: row.venue_address ?? undefined,
    };
    return {
      id: dbString(row.id),
      hostId: dbString(row.host_id),
      title: row.title,
      description: row.description ?? undefined,
      scheduledAt: dbIsoString(row.scheduled_at),
      venue,
      status: row.status,
      visibility: row.visibility,
      compositeSnapshot: readJsonColumn(row.composite_snapshot, null),
      compositeUpdatedAt: row.composite_updated_at ? dbIsoString(row.composite_updated_at) : null,
      menu: readJsonColumn<TableMenuItem[]>(row.menu, []),
      memory: readJsonColumn<TableMemoryPayload | null>(row.memory, null),
      wentLiveAt: row.went_live_at ? dbIsoString(row.went_live_at) : null,
      closedAt: row.closed_at ? dbIsoString(row.closed_at) : null,
      feedEventId: row.feed_event_id ?? null,
      createdAt: dbIsoString(row.created_at),
      updatedAt: dbIsoString(row.updated_at),
    };
  }

  private rowToTableMember(row: Row): TableMember {
    return {
      id: dbString(row.id),
      tableId: dbString(row.table_id),
      userId: row.user_id ?? undefined,
      manualCompanionChartId: row.manual_companion_chart_id ?? undefined,
      role: row.role,
      rsvpStatus: row.rsvp_status,
      joinedVia: row.joined_via ?? undefined,
      invitedBy: row.invited_by ?? undefined,
      displayName: row.display_name ?? undefined,
      rsvpAt: row.rsvp_at ? dbIsoString(row.rsvp_at) : undefined,
      createdAt: dbIsoString(row.created_at),
      updatedAt: dbIsoString(row.updated_at),
      name: (row.user_name || row.display_name || undefined) ?? undefined,
      avatarUrl: row.user_image ?? undefined,
      isAgent: row.user_is_agent === true,
    };
  }

  private rowToTableInvite(row: Row): TableInvite {
    return {
      id: dbString(row.id),
      tableId: dbString(row.table_id),
      token: row.token,
      url: `/t/${row.token}`,
      createdBy: dbString(row.created_by),
      maxUses: Number(row.max_uses),
      useCount: Number(row.use_count),
      expiresAt: dbIsoString(row.expires_at),
      revokedAt: row.revoked_at ? dbIsoString(row.revoked_at) : null,
      createdAt: dbIsoString(row.created_at),
    };
  }

  private rowToTablePhoto(row: Row): TablePhoto {
    return {
      id: dbString(row.id),
      tableId: dbString(row.table_id),
      uploaderId: dbString(row.uploader_id),
      url: row.url,
      createdAt: dbIsoString(row.created_at),
    };
  }

  private rowToTableComment(row: Row): TableComment {
    return {
      id: dbString(row.id),
      tableId: dbString(row.table_id),
      authorId: dbString(row.author_id),
      authorName: row.author_name ?? undefined,
      body: row.body,
      createdAt: dbIsoString(row.created_at),
    };
  }

  private static readonly MEMBER_SELECT = `
    SELECT tm.*, COALESCE(up.name, u.name) AS user_name, u.image AS user_image, u.is_agent AS user_is_agent
      FROM table_members tm
      LEFT JOIN users u ON tm.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
  `;

  private async getMemberById(memberId: string): Promise<TableMember | null> {
    try {
      const result = await executeQuery(
        `${TableDatabaseService.MEMBER_SELECT} WHERE tm.id = $1`,
        [memberId],
      );
      if (result.rows.length === 0) return null;
      return this.rowToTableMember(result.rows[0]);
    } catch (error) {
      _logger.error("getMemberById failed:", error);
      return null;
    }
  }

  // ─── Reads ──────────────────────────────────────────────────

  async getTableHostAndStatus(
    tableId: string,
  ): Promise<{ hostId: string; status: TableStatus } | null> {
    try {
      const result = await executeQuery(`SELECT host_id, status FROM tables WHERE id = $1`, [
        tableId,
      ]);
      if (result.rows.length === 0) return null;
      return { hostId: dbString(result.rows[0].host_id), status: result.rows[0].status };
    } catch (error) {
      _logger.error("getTableHostAndStatus failed:", error);
      return null;
    }
  }

  /**
   * Full detail. `invites` is populated only when `viewerId` is the host —
   * callers (routes) are responsible for the broader access decision (any-
   * status member, or anyone when memory + public) using the returned
   * `members`/`hostId`/`status`/`visibility`.
   */
  async getTableDetail(tableId: string, viewerId: string | null): Promise<TableDetail | null> {
    try {
      const tableResult = await executeQuery(`SELECT * FROM tables WHERE id = $1`, [tableId]);
      if (tableResult.rows.length === 0) return null;
      const table = this.rowToTableRecord(tableResult.rows[0]);

      const membersResult = await executeQuery(
        `${TableDatabaseService.MEMBER_SELECT} WHERE tm.table_id = $1 ORDER BY tm.created_at ASC`,
        [tableId],
      );
      const members = membersResult.rows.map((r: Row) => this.rowToTableMember(r));

      const photos = await this.listPhotos(tableId);

      let invites: TableInvite[] | undefined;
      if (viewerId && viewerId === table.hostId) {
        const invitesResult = await executeQuery(
          `SELECT * FROM table_invites WHERE table_id = $1 ORDER BY created_at DESC`,
          [tableId],
        );
        invites = invitesResult.rows.map((r: Row) => this.rowToTableInvite(r));
      }

      return { ...table, members, photos, invites };
    } catch (error) {
      _logger.error("getTableDetail failed:", error);
      return null;
    }
  }

  async listTablesForUser(userId: string, scope: TableListScope = "all"): Promise<TableRecord[]> {
    try {
      let query: string;
      switch (scope) {
        case "hosting":
          query = `SELECT * FROM tables WHERE host_id = $1::uuid ORDER BY scheduled_at DESC LIMIT 200`;
          break;
        case "upcoming":
          query = `
            SELECT t.* FROM tables t
            JOIN table_members tm ON tm.table_id = t.id AND tm.user_id = $1::uuid
            WHERE t.status IN ('planned','live')
            ORDER BY t.scheduled_at ASC LIMIT 200`;
          break;
        case "past":
          query = `
            SELECT t.* FROM tables t
            JOIN table_members tm ON tm.table_id = t.id AND tm.user_id = $1::uuid
            WHERE t.status IN ('memory','cancelled')
            ORDER BY COALESCE(t.closed_at, t.scheduled_at) DESC LIMIT 200`;
          break;
        case "all":
        default:
          query = `
            SELECT DISTINCT t.* FROM tables t
            JOIN table_members tm ON tm.table_id = t.id AND tm.user_id = $1::uuid
            ORDER BY t.scheduled_at DESC LIMIT 200`;
          break;
      }
      const result = await executeQuery(query, [userId]);
      return result.rows.map((r: Row) => this.rowToTableRecord(r));
    } catch (error) {
      _logger.error("listTablesForUser failed:", error);
      return [];
    }
  }

  async isAnyMember(tableId: string, userId: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `SELECT 1 FROM table_members WHERE table_id = $1 AND user_id = $2::uuid LIMIT 1`,
        [tableId, userId],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.error("isAnyMember failed:", error);
      return false;
    }
  }

  async isJoinedMember(tableId: string, userId: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `SELECT 1 FROM table_members WHERE table_id = $1 AND user_id = $2::uuid AND rsvp_status = 'joined' LIMIT 1`,
        [tableId, userId],
      );
      return result.rows.length > 0;
    } catch (error) {
      _logger.error("isJoinedMember failed:", error);
      return false;
    }
  }

  private async isBlockedPair(userId1: string, userId2: string): Promise<boolean> {
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
      // Fail open: a transient block-check error should not brick a
      // dinner-party invite. Blocking is best-effort abuse mitigation here,
      // not a security boundary.
      _logger.warn("isBlockedPair check failed, failing open (treating as not blocked):", error);
      return false;
    }
  }

  private async hasAcceptedCommensalship(userId1: string, userId2: string): Promise<boolean> {
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
      _logger.warn("hasAcceptedCommensalship check failed, defaulting to 'search':", error);
      return false;
    }
  }

  // ─── Create ─────────────────────────────────────────────────

  /**
   * Insert the table row and its host member row in one transaction — a
   * failure anywhere rolls both back, so a table can never exist without its
   * host as a joined member.
   */
  async createTable(
    hostId: string,
    input: {
      title: string;
      description?: string;
      scheduledAt: string;
      venue: TableVenue;
      visibility?: TableVisibility;
      menu?: TableMenuItem[];
    },
  ): Promise<TableDetail | null> {
    try {
      const tableId = await withTransaction(async (client) => {
        const tableResult = await client.query(
          `INSERT INTO tables
             (host_id, title, description, scheduled_at, venue_type, venue_restaurant_id, venue_name, venue_address, visibility, menu)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           RETURNING id`,
          [
            hostId,
            input.title,
            input.description ?? null,
            input.scheduledAt,
            input.venue.type,
            input.venue.restaurantId ?? null,
            input.venue.name ?? null,
            input.venue.address ?? null,
            input.visibility ?? "commensals",
            JSON.stringify(input.menu ?? []),
          ],
        );
        const id = tableResult.rows[0].id as string;
        await client.query(
          `INSERT INTO table_members (table_id, user_id, role, rsvp_status, joined_via, rsvp_at)
           VALUES ($1, $2::uuid, 'host', 'joined', 'host', CURRENT_TIMESTAMP)`,
          [id, hostId],
        );
        return id;
      });
      return await this.getTableDetail(tableId, hostId);
    } catch (error) {
      _logger.error("createTable failed:", error);
      return null;
    }
  }

  // ─── Edit ───────────────────────────────────────────────────

  /** Core fields — planned only. */
  async updateTableCore(
    tableId: string,
    hostId: string,
    patch: {
      title?: string;
      description?: string;
      scheduledAt?: string;
      venue?: TableVenue;
      visibility?: TableVisibility;
    },
  ): Promise<TableRecord | null> {
    const sets: string[] = [];
    const params: unknown[] = [tableId, hostId];
    let n = 3;

    if (patch.title !== undefined) {
      sets.push(`title = $${n++}`);
      params.push(patch.title);
    }
    if (patch.description !== undefined) {
      sets.push(`description = $${n++}`);
      params.push(patch.description);
    }
    if (patch.scheduledAt !== undefined) {
      sets.push(`scheduled_at = $${n++}`);
      params.push(patch.scheduledAt);
    }
    if (patch.venue !== undefined) {
      sets.push(`venue_type = $${n++}`);
      params.push(patch.venue.type);
      sets.push(`venue_restaurant_id = $${n++}`);
      params.push(patch.venue.restaurantId ?? null);
      sets.push(`venue_name = $${n++}`);
      params.push(patch.venue.name ?? null);
      sets.push(`venue_address = $${n++}`);
      params.push(patch.venue.address ?? null);
    }
    if (patch.visibility !== undefined) {
      sets.push(`visibility = $${n++}`);
      params.push(patch.visibility);
    }
    if (sets.length === 0) return null;

    try {
      const result = await executeQuery(
        `UPDATE tables SET ${sets.join(", ")}
          WHERE id = $1 AND host_id = $2::uuid AND status = 'planned'
        RETURNING *`,
        params,
      );
      if (result.rows.length === 0) return null;
      return this.rowToTableRecord(result.rows[0]);
    } catch (error) {
      _logger.error("updateTableCore failed:", error);
      return null;
    }
  }

  /** Menu — editable in planned or live. */
  async updateTableMenu(
    tableId: string,
    hostId: string,
    menu: TableMenuItem[],
  ): Promise<TableRecord | null> {
    try {
      const result = await executeQuery(
        `UPDATE tables SET menu = $3
          WHERE id = $1 AND host_id = $2::uuid AND status IN ('planned', 'live')
        RETURNING *`,
        [tableId, hostId, JSON.stringify(menu)],
      );
      if (result.rows.length === 0) return null;
      return this.rowToTableRecord(result.rows[0]);
    } catch (error) {
      _logger.error("updateTableMenu failed:", error);
      return null;
    }
  }

  // ─── Lifecycle transitions (host-only, race-safe guarded UPDATE) ────

  /**
   * planned -> live (host-only, race-safe guarded UPDATE) AND, on the SAME
   * transaction client, ensure the Table's chat conversation exists with its
   * members seeded (PR 3 — docs/plans/tables-program-sequencing.md
   * Reconciliation 1: subject_ref = tables.id, host = tables.host_id). The
   * conversation ensure is a no-op ON CONFLICT, so a re-run (or a table that
   * never uses chat) costs nothing. chatDatabaseService is imported lazily so
   * the two services stay decoupled at module load.
   */
  async goLive(tableId: string, hostId: string): Promise<TableRecord | null> {
    try {
      const row = await withTransaction(async (client) => {
        const result = await client.query(
          `UPDATE tables SET status = 'live', went_live_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND host_id = $2::uuid AND status = 'planned'
          RETURNING *`,
          [tableId, hostId],
        );
        if (result.rows.length === 0) return null;
        const tableRow = result.rows[0];
        const { chatDatabase } = await import("@/services/chatDatabaseService");
        await chatDatabase.ensureTableConversationOnClient(client, {
          id: String(tableRow.id),
          hostId: String(tableRow.host_id),
          title: String(tableRow.title),
        });
        return tableRow;
      });
      if (!row) return null;
      return this.rowToTableRecord(row);
    } catch (error) {
      _logger.error("goLive failed:", error);
      return null;
    }
  }

  async cancelTable(tableId: string, hostId: string): Promise<TableRecord | null> {
    try {
      const result = await executeQuery(
        `UPDATE tables SET status = 'cancelled'
          WHERE id = $1 AND host_id = $2::uuid AND status IN ('planned','live')
        RETURNING *`,
        [tableId, hostId],
      );
      if (result.rows.length === 0) return null;
      return this.rowToTableRecord(result.rows[0]);
    } catch (error) {
      _logger.error("cancelTable failed:", error);
      return null;
    }
  }

  /**
   * Close: re-reads table + joined members + photos, builds the frozen
   * `memory` JSONB, flips status/closed_at, inserts the `table_memory` feed
   * event, and stamps `feed_event_id` — all inside one transaction. The
   * `table_memory_posted` notification fan-out happens AFTER commit
   * (fire-and-forget) since it uses its own pooled connection via
   * notificationDatabaseService.
   */
  async closeTable(tableId: string, hostId: string): Promise<TableRecord | null> {
    try {
      const outcome = await withTransaction(async (client) => {
        const tableResult = await client.query(
          `SELECT * FROM tables WHERE id = $1 AND host_id = $2::uuid AND status = 'live' FOR UPDATE`,
          [tableId, hostId],
        );
        if (tableResult.rows.length === 0) return null;
        const tableRow = tableResult.rows[0];

        const membersResult = await client.query(
          `SELECT tm.user_id, tm.display_name, COALESCE(up.name, u.name) AS user_name
             FROM table_members tm
             LEFT JOIN users u ON tm.user_id = u.id
             LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE tm.table_id = $1 AND tm.rsvp_status = 'joined'`,
          [tableId],
        );

        const photosResult = await client.query(
          `SELECT url FROM table_photos WHERE table_id = $1 ORDER BY created_at ASC LIMIT 6`,
          [tableId],
        );

        const guests = membersResult.rows.map((r: Row) => ({
          name: r.user_name || r.display_name || "A guest",
          userId: r.user_id ?? undefined,
        }));

        const compositeSnapshot = readJsonColumn<{
          compositeChart?: {
            dominantElement: string;
            dominantModality: string;
            elementalBalance: Record<string, number>;
            alchemicalProperties: Record<string, number>;
          };
        } | null>(tableRow.composite_snapshot, null);
        const composite = compositeSnapshot?.compositeChart
          ? {
              dominantElement: compositeSnapshot.compositeChart.dominantElement,
              dominantModality: compositeSnapshot.compositeChart.dominantModality,
              elementalBalance: compositeSnapshot.compositeChart.elementalBalance,
              alchemicalProperties: compositeSnapshot.compositeChart.alchemicalProperties,
            }
          : undefined;

        const closedAtIso = new Date().toISOString();
        const memory: TableMemoryPayload = {
          card: "table_memory",
          tableId,
          title: tableRow.title,
          scheduledAt: dbIsoString(tableRow.scheduled_at),
          closedAt: closedAtIso,
          venue: { type: tableRow.venue_type, name: tableRow.venue_name ?? undefined },
          guests,
          guestCount: guests.length,
          composite,
          menu: readJsonColumn<TableMenuItem[]>(tableRow.menu, []).slice(0, 8),
          photoUrls: photosResult.rows.map((r: Row) => r.url).slice(0, 6),
          shareName: true,
        };

        const feedResult = await client.query(
          `INSERT INTO feed_events (actor_id, event_type, metadata_payload)
           VALUES ($1::uuid, 'table_memory', $2)
           RETURNING id`,
          [hostId, JSON.stringify(memory)],
        );
        const feedEventId = feedResult.rows[0].id;

        const finalResult = await client.query(
          `UPDATE tables
              SET status = 'memory', closed_at = $2, memory = $3, feed_event_id = $4
            WHERE id = $1
          RETURNING *`,
          [tableId, closedAtIso, JSON.stringify(memory), feedEventId],
        );

        // PR 3: the Postgres chat record is canonical and survives close —
        // only archive the conversation (read-only) here, on this same
        // transaction client. The Spacetime mirror rows are pruned separately
        // by the module's close_table_session reducer
        // (docs/plans/tables-program-sequencing.md Reconciliation 1).
        const { chatDatabase } = await import("@/services/chatDatabaseService");
        await chatDatabase.archiveTableConversationOnClient(client, tableId);

        const finalRecord = this.rowToTableRecord(finalResult.rows[0]);
        return {
          table: finalRecord,
          joinedUserIds: guests.map((g) => g.userId).filter((id): id is string => !!id),
        };
      });

      if (!outcome) return null;

      void this.notifyTableMemoryPosted(outcome.table, outcome.joinedUserIds);
      return outcome.table;
    } catch (error) {
      _logger.error("closeTable failed:", error);
      return null;
    }
  }

  private async notifyTableMemoryPosted(table: TableRecord, joinedUserIds: string[]): Promise<void> {
    try {
      const { notificationDatabase } = await import("@/services/notificationDatabaseService");
      const photoCount = table.memory?.photoUrls.length ?? 0;
      await Promise.all(
        joinedUserIds.map((userId) =>
          notificationDatabase
            .createNotification(
              userId,
              "table_memory_posted",
              "Table Memory Saved",
              `The memory from "${table.title}" is ready to relive.`,
              {
                metadata: {
                  tableId: table.id,
                  tableTitle: table.title,
                  feedEventId: table.feedEventId ?? undefined,
                  photoCount,
                },
              },
            )
            .catch((err) =>
              _logger.warn(`notifyTableMemoryPosted: failed for user ${userId}:`, err),
            ),
        ),
      );
    } catch (error) {
      _logger.warn("notifyTableMemoryPosted failed (non-blocking):", error);
    }
  }

  // ─── Members ────────────────────────────────────────────────

  /** Host invites a registered user (human or agent) by id. Creates an
   * `invited` row — the invitee must RSVP to join. */
  async addRegisteredMember(
    tableId: string,
    hostId: string,
    targetUserId: string,
  ): Promise<AddMemberResult> {
    try {
      const table = await this.getTableHostAndStatus(tableId);
      if (!table) return { ok: false, reason: "not_found" };
      if (table.hostId !== hostId) return { ok: false, reason: "not_host" };
      if (table.status !== "planned" && table.status !== "live") {
        return { ok: false, reason: "not_found" };
      }
      if (targetUserId === hostId) return { ok: false, reason: "duplicate" };

      if (await this.isBlockedPair(hostId, targetUserId)) {
        return { ok: false, reason: "blocked" };
      }

      const countResult = await executeQuery(
        `SELECT COUNT(*)::int AS n FROM table_members WHERE table_id = $1`,
        [tableId],
      );
      if ((countResult.rows[0]?.n ?? 0) >= MAX_TABLE_MEMBERS) {
        return { ok: false, reason: "cap_exceeded" };
      }

      const joinedVia = (await this.hasAcceptedCommensalship(hostId, targetUserId))
        ? "invite"
        : "search";

      try {
        const insertResult = await executeQuery(
          `INSERT INTO table_members (table_id, user_id, role, rsvp_status, joined_via, invited_by)
           VALUES ($1, $2::uuid, 'guest', 'invited', $3, $4::uuid)
           RETURNING id`,
          [tableId, targetUserId, joinedVia, hostId],
        );
        const member = await this.getMemberById(insertResult.rows[0].id);
        return member ? { ok: true, member } : { ok: false, reason: "not_found" };
      } catch (insertError) {
        if ((insertError as { code?: string })?.code === "23505") {
          return { ok: false, reason: "duplicate" };
        }
        throw insertError;
      }
    } catch (error) {
      _logger.error("addRegisteredMember failed:", error);
      return { ok: false, reason: "not_found" };
    }
  }

  /** Host attaches one of their own offline manual companions — joins
   * immediately (they can't RSVP for themselves) and triggers a recompute. */
  async addManualMember(
    tableId: string,
    hostId: string,
    manualCompanionChartId: string,
  ): Promise<AddMemberResult> {
    try {
      const table = await this.getTableHostAndStatus(tableId);
      if (!table) return { ok: false, reason: "not_found" };
      if (table.hostId !== hostId) return { ok: false, reason: "not_host" };
      if (table.status !== "planned" && table.status !== "live") {
        return { ok: false, reason: "not_found" };
      }

      const chartResult = await executeQuery(
        `SELECT id, name FROM manual_companion_charts WHERE id = $1 AND owner_id = $2::uuid`,
        [manualCompanionChartId, hostId],
      );
      if (chartResult.rows.length === 0) return { ok: false, reason: "not_found" };

      const countResult = await executeQuery(
        `SELECT COUNT(*)::int AS n FROM table_members WHERE table_id = $1`,
        [tableId],
      );
      if ((countResult.rows[0]?.n ?? 0) >= MAX_TABLE_MEMBERS) {
        return { ok: false, reason: "cap_exceeded" };
      }

      try {
        const insertResult = await executeQuery(
          `INSERT INTO table_members
             (table_id, manual_companion_chart_id, role, rsvp_status, joined_via, invited_by, display_name, rsvp_at)
           VALUES ($1, $2, 'guest', 'joined', 'manual', $3::uuid, $4, CURRENT_TIMESTAMP)
           RETURNING id`,
          [tableId, manualCompanionChartId, hostId, chartResult.rows[0].name],
        );
        const member = await this.getMemberById(insertResult.rows[0].id);
        if (!member) return { ok: false, reason: "not_found" };

        await computeAndStoreTableComposite(tableId);
        return { ok: true, member };
      } catch (insertError) {
        if ((insertError as { code?: string })?.code === "23505") {
          return { ok: false, reason: "duplicate" };
        }
        throw insertError;
      }
    } catch (error) {
      _logger.error("addManualMember failed:", error);
      return { ok: false, reason: "not_found" };
    }
  }

  /** Host removes anyone; a member may remove themselves. The host's own
   * row can never be removed this way — leaving a hosted table means
   * cancelling it. */
  async removeMember(
    tableId: string,
    memberId: string,
    actingUserId: string,
  ): Promise<RemoveMemberResult> {
    try {
      const memberResult = await executeQuery(
        `SELECT tm.id, tm.user_id, tm.role, tm.rsvp_status, t.host_id, t.status
           FROM table_members tm
           JOIN tables t ON t.id = tm.table_id
          WHERE tm.id = $1 AND tm.table_id = $2`,
        [memberId, tableId],
      );
      if (memberResult.rows.length === 0) return { ok: false, reason: "not_found" };
      const row = memberResult.rows[0];

      if (row.role === "host") return { ok: false, reason: "forbidden" };

      const isHost = dbString(row.host_id) === actingUserId;
      const isSelf = row.user_id != null && dbString(row.user_id) === actingUserId;
      if (!isHost && !isSelf) return { ok: false, reason: "forbidden" };

      const deleteResult = await executeQuery(`DELETE FROM table_members WHERE id = $1`, [
        memberId,
      ]);
      if ((deleteResult.rowCount ?? 0) === 0) return { ok: false, reason: "not_found" };

      // Recompute only while the table is still live/planned — never overwrite
      // a memory table's frozen composite snapshot.
      if (row.rsvp_status === "joined" && (row.status === "planned" || row.status === "live")) {
        await computeAndStoreTableComposite(tableId);
      }
      return { ok: true };
    } catch (error) {
      _logger.error("removeMember failed:", error);
      return { ok: false, reason: "not_found" };
    }
  }

  /** Requires an existing `invited` row for this user — created by
   * `addRegisteredMember` (search/invite) or auto-created via invite-link
   * redemption (which upserts straight to `joined`, bypassing RSVP). */
  async rsvp(
    tableId: string,
    userId: string,
    response: "joined" | "declined",
  ): Promise<RsvpResult> {
    try {
      // A terminal (memory/cancelled) table cannot be RSVP'd into — joining it
      // would trigger a recompute over its frozen composite snapshot.
      const table = await this.getTableHostAndStatus(tableId);
      if (!table) return { ok: false, reason: "not_found" };
      if (table.status !== "planned" && table.status !== "live") {
        return { ok: false, reason: "not_found" };
      }

      const updateResult = await executeQuery(
        `UPDATE table_members SET rsvp_status = $3, rsvp_at = CURRENT_TIMESTAMP
          WHERE table_id = $1 AND user_id = $2::uuid AND rsvp_status = 'invited'
        RETURNING id`,
        [tableId, userId, response],
      );
      if (updateResult.rows.length === 0) return { ok: false, reason: "not_found" };

      const member = await this.getMemberById(updateResult.rows[0].id);
      if (!member) return { ok: false, reason: "not_found" };

      if (response === "joined") {
        await computeAndStoreTableComposite(tableId);
      }

      const tableResult = await executeQuery(`SELECT * FROM tables WHERE id = $1`, [tableId]);
      if (tableResult.rows.length === 0) return { ok: false, reason: "not_found" };
      const tableRecord = this.rowToTableRecord(tableResult.rows[0]);

      return { ok: true, member, table: tableRecord };
    } catch (error) {
      _logger.error("rsvp failed:", error);
      return { ok: false, reason: "not_found" };
    }
  }

  // ─── Invites ────────────────────────────────────────────────

  async issueInvite(
    tableId: string,
    hostId: string,
    opts: { expiresInHours?: number; maxUses?: number } = {},
  ): Promise<TableInvite | null> {
    try {
      const table = await this.getTableHostAndStatus(tableId);
      if (!table || table.hostId !== hostId) return null;

      const token = randomBytes(24).toString("base64url");
      const expiresInHours = opts.expiresInHours ?? 168;
      const maxUses = opts.maxUses ?? 20;

      const result = await executeQuery(
        `INSERT INTO table_invites (table_id, token, created_by, max_uses, expires_at)
         VALUES ($1, $2, $3::uuid, $4, CURRENT_TIMESTAMP + ($5 || ' hours')::interval)
         RETURNING *`,
        [tableId, token, hostId, maxUses, expiresInHours],
      );
      return this.rowToTableInvite(result.rows[0]);
    } catch (error) {
      _logger.error("issueInvite failed:", error);
      return null;
    }
  }

  async revokeInvite(tableId: string, inviteId: string, hostId: string): Promise<boolean> {
    try {
      const result = await executeQuery(
        `UPDATE table_invites ti SET revoked_at = CURRENT_TIMESTAMP
          FROM tables t
         WHERE ti.id = $1 AND ti.table_id = $2 AND ti.revoked_at IS NULL
           AND t.id = ti.table_id AND t.host_id = $3::uuid`,
        [inviteId, tableId, hostId],
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      _logger.error("revokeInvite failed:", error);
      return false;
    }
  }

  /** Public, unauthenticated preview — card-level only, never the member list. */
  async getInvitePreview(token: string): Promise<TableInvitePreview | null> {
    try {
      const result = await executeQuery(
        `SELECT ti.expires_at, ti.revoked_at, ti.use_count, ti.max_uses,
                t.title, t.scheduled_at, t.venue_name,
                COALESCE(up.name, u.name) AS host_name,
                (SELECT COUNT(*)::int FROM table_members m
                  WHERE m.table_id = t.id AND m.rsvp_status = 'joined') AS joined_count
           FROM table_invites ti
           JOIN tables t ON t.id = ti.table_id
           LEFT JOIN users u ON u.id = t.host_id
           LEFT JOIN user_profiles up ON up.user_id = u.id
          WHERE ti.token = $1`,
        [token],
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      const valid =
        !row.revoked_at &&
        new Date(row.expires_at).getTime() > Date.now() &&
        Number(row.use_count) < Number(row.max_uses);

      return {
        tableTitle: row.title,
        hostName: row.host_name || "Someone",
        scheduledAt: dbIsoString(row.scheduled_at),
        venueName: row.venue_name ?? undefined,
        joinedCount: Number(row.joined_count) || 0,
        valid,
      };
    } catch (error) {
      _logger.error("getInvitePreview failed:", error);
      return null;
    }
  }

  /**
   * Atomic consume. Enforcement order:
   *  1. Token → table; table must be joinable (planned|live) — a closed
   *     (memory/cancelled) table never re-opens via a stale link, and joining
   *     it would corrupt the frozen composite snapshot.
   *  2. Block check against the host — a user the host blocked cannot slip in
   *     via a forwarded bearer link (parity with the host-add path).
   *  3. Existing member: an already-`joined` row is a no-op success; an
   *     `invited`/`declined` row is upgraded to `joined` (no use spent) so a
   *     guest who clicks the link instead of the RSVP button still joins.
   *  4. New member: cap check + guarded `use_count += 1` + member insert, all
   *     on ONE transaction client so a burned use always has its membership
   *     (a concurrent racer's insert winning is treated as success).
   */
  async redeemInvite(
    token: string,
    userId: string,
    via: "link" | "qr",
  ): Promise<RedeemInviteResult> {
    try {
      const inviteResult = await executeQuery(`SELECT table_id FROM table_invites WHERE token = $1`, [
        token,
      ]);
      if (inviteResult.rows.length === 0) return { ok: false, reason: "invalid" };
      const tableId = dbString(inviteResult.rows[0].table_id);

      const table = await this.getTableHostAndStatus(tableId);
      if (!table) return { ok: false, reason: "invalid" };
      if (table.status !== "planned" && table.status !== "live") {
        return { ok: false, reason: "closed" };
      }
      if (await this.isBlockedPair(table.hostId, userId)) {
        return { ok: false, reason: "blocked" };
      }

      const existing = await executeQuery(
        `SELECT id, rsvp_status FROM table_members WHERE table_id = $1 AND user_id = $2::uuid`,
        [tableId, userId],
      );
      if (existing.rows.length > 0) {
        if (existing.rows[0].rsvp_status === "joined") {
          return { ok: true, tableId, alreadyMember: true };
        }
        // invited / declined → join without spending a use.
        await executeQuery(
          `UPDATE table_members SET rsvp_status = 'joined', rsvp_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND table_id = $2`,
          [existing.rows[0].id, tableId],
        );
        await computeAndStoreTableComposite(tableId);
        return { ok: true, tableId, alreadyMember: true };
      }

      const outcome = await withTransaction(async (client) => {
        const countResult = await client.query(
          `SELECT COUNT(*)::int AS n FROM table_members WHERE table_id = $1`,
          [tableId],
        );
        if ((countResult.rows[0]?.n ?? 0) >= MAX_TABLE_MEMBERS) {
          return "cap" as const;
        }

        const consumed = await client.query(
          `UPDATE table_invites SET use_count = use_count + 1
            WHERE token = $1 AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP
              AND use_count < max_uses
          RETURNING table_id`,
          [token],
        );
        if (consumed.rows.length === 0) return "expired" as const;

        try {
          await client.query(
            `INSERT INTO table_members (table_id, user_id, role, rsvp_status, joined_via, rsvp_at)
             VALUES ($1, $2::uuid, 'guest', 'joined', $3, CURRENT_TIMESTAMP)`,
            [tableId, userId, via],
          );
        } catch (insertError) {
          // A concurrent redemption for the same user landed first — the
          // member row exists either way, so this is still a success.
          if ((insertError as { code?: string })?.code !== "23505") throw insertError;
        }
        return "ok" as const;
      });

      if (outcome === "cap") return { ok: false, reason: "cap_exceeded" };
      if (outcome === "expired") return { ok: false, reason: "expired" };

      await computeAndStoreTableComposite(tableId);
      return { ok: true, tableId, alreadyMember: false };
    } catch (error) {
      _logger.error("redeemInvite failed:", error);
      return { ok: false, reason: "invalid" };
    }
  }

  // ─── Photos & comments ──────────────────────────────────────

  async addPhoto(tableId: string, uploaderId: string, url: string): Promise<TablePhoto | null> {
    try {
      const countResult = await executeQuery(
        `SELECT COUNT(*)::int AS n FROM table_photos WHERE table_id = $1`,
        [tableId],
      );
      if ((countResult.rows[0]?.n ?? 0) >= MAX_TABLE_PHOTOS) return null;

      const result = await executeQuery(
        `INSERT INTO table_photos (table_id, uploader_id, url) VALUES ($1, $2::uuid, $3) RETURNING *`,
        [tableId, uploaderId, url],
      );
      return this.rowToTablePhoto(result.rows[0]);
    } catch (error) {
      _logger.error("addPhoto failed:", error);
      return null;
    }
  }

  async listPhotos(tableId: string): Promise<TablePhoto[]> {
    try {
      const result = await executeQuery(
        `SELECT * FROM table_photos WHERE table_id = $1 ORDER BY created_at ASC`,
        [tableId],
      );
      return result.rows.map((r: Row) => this.rowToTablePhoto(r));
    } catch (error) {
      _logger.error("listPhotos failed:", error);
      return [];
    }
  }

  async addComment(tableId: string, authorId: string, body: string): Promise<TableComment | null> {
    try {
      const result = await executeQuery(
        `INSERT INTO table_comments (table_id, author_id, body) VALUES ($1, $2::uuid, $3) RETURNING *`,
        [tableId, authorId, body],
      );
      return this.rowToTableComment(result.rows[0]);
    } catch (error) {
      _logger.error("addComment failed:", error);
      return null;
    }
  }

  async listComments(tableId: string): Promise<TableComment[]> {
    try {
      const result = await executeQuery(
        `SELECT c.*, COALESCE(up.name, u.name) AS author_name
           FROM table_comments c
           LEFT JOIN users u ON u.id = c.author_id
           LEFT JOIN user_profiles up ON up.user_id = u.id
          WHERE c.table_id = $1 ORDER BY c.created_at ASC`,
        [tableId],
      );
      return result.rows.map((r: Row) => this.rowToTableComment(r));
    } catch (error) {
      _logger.error("listComments failed:", error);
      return [];
    }
  }
}

export const tableDatabase = new TableDatabaseService();
