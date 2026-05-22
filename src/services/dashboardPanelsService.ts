/**
 * Dashboard Panels Service
 *
 * Live data aggregations for admin dashboard panels that read from Postgres.
 * Each getter degrades gracefully — a failed query resolves to a neutral
 * `live: false` fallback so the dashboard never hard-fails.
 */

import { executeQuery } from "@/lib/database";
import { getDatabasePool } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

// ─── Cosmic Yield · token economy ──────────────────────────────────────

export interface CosmicYieldSink {
  /** token sink, e.g. "purchase" */
  source: string;
  /** tokens debited in the window */
  amount: number;
}

export interface CosmicYieldHolder {
  handle: string;
  balance: number;
}

export interface CosmicYieldData {
  /** total ESMS tokens held across all balances */
  inCirculation: number;
  minted30d: number;
  burned30d: number;
  netFlow30d: number;
  sinks24h: CosmicYieldSink[];
  topHolders: CosmicYieldHolder[];
  /** true when computed from the live ledger; false when degraded. */
  live: boolean;
}

const COSMIC_YIELD_FALLBACK: CosmicYieldData = {
  inCirculation: 0,
  minted30d: 0,
  burned30d: 0,
  netFlow30d: 0,
  sinks24h: [],
  topHolders: [],
  live: false,
};

function deriveHandle(email: string): string {
  const local = email.split("@")[0] ?? email;
  return `@${local}`;
}

/**
 * Token-economy rollup for the Cosmic Yield panel — circulation, 30-day
 * mint/burn flow, 24h sinks by source, and the top token holders. Reads the
 * immutable `token_transactions` ledger and materialized `token_balances`.
 */
export async function getCosmicYield(): Promise<CosmicYieldData> {
  try {
    const [flowRes, circulationRes, sinksRes, holdersRes] = await Promise.all([
      executeQuery(
        `SELECT
           COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0)::float8 AS minted,
           COALESCE(SUM(-amount) FILTER (WHERE amount < 0), 0)::float8 AS burned
         FROM token_transactions
         WHERE created_at > NOW() - INTERVAL '30 days'`,
      ),
      executeQuery(
        `SELECT COALESCE(SUM(spirit + essence + matter + substance), 0)::float8 AS total
         FROM token_balances`,
      ),
      executeQuery(
        `SELECT source_type, COALESCE(SUM(-amount), 0)::float8 AS amount
         FROM token_transactions
         WHERE amount < 0 AND created_at > NOW() - INTERVAL '24 hours'
         GROUP BY source_type
         ORDER BY amount DESC
         LIMIT 5`,
      ),
      executeQuery(
        `SELECT u.email, (b.spirit + b.essence + b.matter + b.substance)::float8 AS balance
         FROM token_balances b
         JOIN users u ON u.id = b.user_id
         ORDER BY balance DESC
         LIMIT 6`,
      ),
    ]);

    const minted = Number(flowRes.rows[0]?.minted ?? 0);
    const burned = Number(flowRes.rows[0]?.burned ?? 0);
    const sinkRows = sinksRes.rows as Array<{ source_type: string; amount: number }>;
    const holderRows = holdersRes.rows as Array<{ email: string; balance: number }>;

    return {
      inCirculation: Number(circulationRes.rows[0]?.total ?? 0),
      minted30d: minted,
      burned30d: burned,
      netFlow30d: minted - burned,
      sinks24h: sinkRows.map((r) => ({
        source: String(r.source_type),
        amount: Number(r.amount),
      })),
      topHolders: holderRows.map((r) => ({
        handle: deriveHandle(String(r.email)),
        balance: Number(r.balance),
      })),
      live: true,
    };
  } catch (error) {
    _logger.error("[cosmicYield] token-economy aggregation failed:", error);
    return COSMIC_YIELD_FALLBACK;
  }
}

// ─── Database observability ────────────────────────────────────────────

export interface DatabaseTable {
  name: string;
  /** estimated live row count (pg_stat) */
  rows: number;
  sizeBytes: number;
}

export interface SlowQuery {
  /** truncated SQL text */
  query: string;
  durationMs: number;
}

export interface DatabaseObservabilityData {
  pool: { total: number; idle: number; waiting: number; max: number };
  dbSizeBytes: number;
  activeConnections: number;
  /** largest tables by total relation size */
  tables: DatabaseTable[];
  /** active queries currently running longer than 200ms */
  slowQueries: SlowQuery[];
  /** true when the Postgres stat views resolved; false when degraded. */
  live: boolean;
}

/**
 * Postgres observability for the Database panel — connection-pool usage
 * (read from the in-process pg.Pool), database size, active connections,
 * largest tables, and active queries exceeding a 200ms latency threshold.
 * Uses only standard stat views — no pg_stat_statements extension required.
 */
export async function getDatabaseObservability(): Promise<DatabaseObservabilityData> {
  // Pool counters live on the in-process pool — readable without a query.
  const pool = { total: 0, idle: 0, waiting: 0, max: 0 };
  try {
    const pgPool = getDatabasePool();
    pool.total = pgPool.totalCount ?? 0;
    pool.idle = pgPool.idleCount ?? 0;
    pool.waiting = pgPool.waitingCount ?? 0;
    pool.max = Number(
      (pgPool as unknown as { options?: { max?: number } }).options?.max ?? 0,
    );
  } catch (error) {
    _logger.error("[dbObservability] pool counters unavailable:", error);
  }

  try {
    const [sizeRes, connRes, slowRes, tablesRes] = await Promise.all([
      executeQuery(
        `SELECT pg_database_size(current_database())::float8 AS bytes`,
      ),
      executeQuery(
        `SELECT COUNT(*)::int AS count FROM pg_stat_activity
         WHERE datname = current_database()`,
      ),
      executeQuery(
        `SELECT
           LEFT(query, 120) AS query,
           EXTRACT(EPOCH FROM (now() - query_start)) * 1000 AS duration_ms
         FROM pg_stat_activity
         WHERE state = 'active'
           AND query_start IS NOT NULL
           AND now() - query_start > INTERVAL '200 milliseconds'
           AND query NOT ILIKE '%pg_stat_activity%'
         ORDER BY duration_ms DESC
         LIMIT 5`,
      ),
      executeQuery(
        `SELECT
           relname AS name,
           n_live_tup::float8 AS rows,
           pg_total_relation_size(relid)::float8 AS size_bytes
         FROM pg_stat_user_tables
         ORDER BY size_bytes DESC
         LIMIT 8`,
      ),
    ]);

    const slowRows = slowRes.rows as Array<{ query: string; duration_ms: number }>;
    const tableRows = tablesRes.rows as Array<{
      name: string;
      rows: number;
      size_bytes: number;
    }>;

    return {
      pool,
      dbSizeBytes: Number(sizeRes.rows[0]?.bytes ?? 0),
      activeConnections: Number(connRes.rows[0]?.count ?? 0),
      slowQueries: slowRows.map((r) => ({
        query: String(r.query ?? "").trim(),
        durationMs: Math.round(Number(r.duration_ms ?? 0)),
      })),
      tables: tableRows.map((r) => ({
        name: String(r.name),
        rows: Math.round(Number(r.rows ?? 0)),
        sizeBytes: Number(r.size_bytes ?? 0),
      })),
      live: true,
    };
  } catch (error) {
    _logger.error("[dbObservability] stat-view query failed:", error);
    return {
      pool,
      dbSizeBytes: 0,
      activeConnections: 0,
      tables: [],
      slowQueries: [],
      live: false,
    };
  }
}

// ─── Catalog · trending recipes ────────────────────────────────────────

export interface TrendingRecipe {
  name: string;
  cuisine: string;
  /** user_rating, 0–5 */
  rating: number;
  ratingCount: number;
  /** popularity_score, 0–1 */
  popularity: number;
}

export interface CatalogTrendingData {
  recipes: TrendingRecipe[];
  /** true when computed from the recipes table; false when degraded. */
  live: boolean;
}

/**
 * Top public recipes by popularity score for the Catalog panel's trending
 * list. The catalog count cards are wired separately via dashboard `stats`.
 */
export async function getCatalogTrending(): Promise<CatalogTrendingData> {
  try {
    const res = await executeQuery(
      `SELECT
         name,
         cuisine::text AS cuisine,
         popularity_score::float8 AS popularity,
         user_rating::float8 AS rating,
         rating_count
       FROM recipes
       WHERE is_public = true
       ORDER BY popularity_score DESC, rating_count DESC
       LIMIT 8`,
    );
    const rows = res.rows as Array<{
      name: string;
      cuisine: string;
      popularity: number;
      rating: number;
      rating_count: number;
    }>;
    return {
      recipes: rows.map((r) => ({
        name: String(r.name),
        cuisine: String(r.cuisine),
        rating: Number(r.rating ?? 0),
        ratingCount: Number(r.rating_count ?? 0),
        popularity: Number(r.popularity ?? 0),
      })),
      live: true,
    };
  } catch (error) {
    _logger.error("[catalogTrending] recipe popularity query failed:", error);
    return { recipes: [], live: false };
  }
}

// ─── Audit · auth events ───────────────────────────────────────────────

export interface AuditEvent {
  /** ISO timestamp */
  createdAt: string;
  email: string;
  /** e.g. "sign_in", "sign_out", "sign_in_failure" */
  eventType: string;
  /** "success" | "failure" | "info" */
  status: string;
  provider: string;
  /** hashed source IP */
  ipHash: string;
}

export interface AuditEventsData {
  events: AuditEvent[];
  /** true when the auth_events table resolved; false when degraded. */
  live: boolean;
}

/**
 * Recent structured auth events (sign-in / sign-out / failures) for the
 * Audit panel, newest first.
 */
export async function getAuditEvents(): Promise<AuditEventsData> {
  try {
    const res = await executeQuery(
      `SELECT created_at, email, event_type, status, provider, ip_hash
       FROM auth_events
       ORDER BY created_at DESC
       LIMIT 10`,
    );
    const rows = res.rows as Array<{
      created_at: string | Date;
      email: string | null;
      event_type: string;
      status: string;
      provider: string | null;
      ip_hash: string | null;
    }>;
    return {
      events: rows.map((r) => ({
        createdAt: new Date(r.created_at).toISOString(),
        email: r.email ?? "—",
        eventType: String(r.event_type),
        status: String(r.status),
        provider: r.provider ?? "—",
        ipHash: r.ip_hash ?? "—",
      })),
      live: true,
    };
  } catch (error) {
    _logger.error("[auditEvents] auth_events query failed:", error);
    return { events: [], live: false };
  }
}
