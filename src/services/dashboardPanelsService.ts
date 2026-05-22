/**
 * Dashboard Panels Service
 *
 * Live data aggregations for admin dashboard panels that read from Postgres.
 * Each getter degrades gracefully — a failed query resolves to a neutral
 * `live: false` fallback so the dashboard never hard-fails.
 */

import { checkDatabaseHealth, executeQuery } from "@/lib/database";
import { getDatabasePool } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { summarizeRecent } from "@/lib/observability/requestLog";
import { getRecentSlowQueries } from "@/lib/observability/slowQueryLog";

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
           tags->>'query' AS query,
           metric_value::float8 AS duration_ms
         FROM system_metrics
         WHERE metric_name = 'slow_query_duration_ms'
           AND timestamp > now() - INTERVAL '24 hours'
         ORDER BY timestamp DESC
         LIMIT 5`
      ).catch(err => {
        _logger.warn("[dbObservability] failed to query system_metrics for slow queries, falling back:", err);
        return { rows: [] };
      }),
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

    const dbSlowQueries = (slowRes.rows || []).map((r) => ({
      query: String(r.query ?? "").trim(),
      durationMs: Math.round(Number(r.duration_ms ?? 0)),
    }));

    // Merge with in-memory slow queries if fewer than 5 rows returned
    let finalSlowQueries = [...dbSlowQueries];
    if (finalSlowQueries.length < 5) {
      const needed = 5 - finalSlowQueries.length;
      const inMemorySlows = getRecentSlowQueries(needed).map(entry => ({
        query: entry.preview,
        durationMs: entry.ms,
      }));
      finalSlowQueries = [...finalSlowQueries, ...inMemorySlows];
    }

    const tableRows = tablesRes.rows as Array<{
      name: string;
      rows: number;
      size_bytes: number;
    }>;

    return {
      pool,
      dbSizeBytes: Number(sizeRes.rows[0]?.bytes ?? 0),
      activeConnections: Number(connRes.rows[0]?.count ?? 0),
      slowQueries: finalSlowQueries,
      tables: tableRows.map((r) => ({
        name: String(r.name),
        rows: Math.round(Number(r.rows ?? 0)),
        sizeBytes: Number(r.size_bytes ?? 0),
      })),
      live: true,
    };
  } catch (error) {
    _logger.error("[dbObservability] stat-view query failed, falling back to in-memory slow queries:", error);
    
    // Fall back completely to in-memory slow queries when query fails
    const fallbackSlowQueries = getRecentSlowQueries(5).map(entry => ({
      query: entry.preview,
      durationMs: entry.ms,
    }));

    return {
      pool,
      dbSizeBytes: 0,
      activeConnections: 0,
      tables: [],
      slowQueries: fallbackSlowQueries,
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

// ─── Platform Pulse · top-bar health strip ─────────────────────────────

export interface PlatformPulse {
  state: "NOMINAL" | "DEGRADED" | "INCIDENT";
  /** Composite 0–100 health score. */
  score: number;
  /** Request success rate (%) over the in-memory request-log window. */
  availability: number;
  activeIncidents: number;
  /** p95 request latency (ms) over the request-log window. */
  p95: number;
  /** 5xx error rate (%) over the request-log window. */
  errRate: number;
  /** Time since this server process started (≈ time since last deploy). */
  deployFreshness: string;
}

function formatProcessUptime(seconds: number): string {
  if (seconds < 90) return `${Math.round(seconds)}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 36) {
    const remMinutes = minutes % 60;
    return remMinutes > 0 ? `${hours}h ${remMinutes}m` : `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}

/**
 * Live platform health for the dashboard's top-bar pulse strip. Latency and
 * error rate come from the in-memory request log (`summarizeRecent`), DB
 * reachability from a health probe, and deploy freshness from process uptime.
 * No external uptime/APM service is required — degraded signals lower the
 * score rather than failing the panel.
 */
export async function getPlatformPulse(): Promise<PlatformPulse> {
  const summary = summarizeRecent();

  let dbHealthy = false;
  try {
    const dbHealth = await checkDatabaseHealth();
    dbHealthy = dbHealth.healthy;
  } catch {
    dbHealthy = false;
  }

  const errRate = Number((summary.errorRate * 100).toFixed(2));
  const highErrors = errRate > 5;
  const highLatency = summary.p95LatencyMs > 1000;

  let activeIncidents = 0;
  if (!dbHealthy) activeIncidents += 1;
  if (highErrors) activeIncidents += 1;

  let state: PlatformPulse["state"] = "NOMINAL";
  if (!dbHealthy) state = "INCIDENT";
  else if (highErrors || highLatency) state = "DEGRADED";

  // Start at 100, deduct for each degraded signal.
  let score = 100;
  if (!dbHealthy) score -= 60;
  score -= Math.min(30, errRate * 3);
  if (highLatency) score -= 10;
  score = Math.max(0, Number(score.toFixed(1)));

  const availability =
    summary.count > 0
      ? Number(((1 - summary.errorRate) * 100).toFixed(3))
      : 100;

  return {
    state,
    score,
    availability,
    activeIncidents,
    p95: summary.p95LatencyMs,
    errRate,
    deployFreshness: formatProcessUptime(process.uptime()),
  };
}
