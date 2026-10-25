/**
 * Dashboard Panels Service
 *
 * Live data aggregations for admin dashboard panels that read from Postgres.
 * Each getter degrades gracefully — a failed query resolves to a neutral
 * `live: false` fallback so the dashboard never hard-fails.
 */

import { execSync } from "child_process";
import { PRIMARY_CUISINE_KEYS } from "@/data/cuisines/index";
import { checkDatabaseHealth, executeQuery } from "@/lib/database";
import { getDatabasePool } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { summarizeRecent } from "@/lib/observability/requestLog";
import {
  getRecentSlowQueries,
  getSlowQueryThresholdMs,
} from "@/lib/observability/slowQueryLog";
import { redisCached } from "@/lib/redis";
import {
  fetchRailwayResourceUsage,
  type ResourceUsageItem,
} from "@/services/railwayUsageService";
import { getSubscriptionRevenueBreakdown } from "@/services/subscriptionRevenueService";
import {
  tokenFlowSeriesSql,
  tokenSources24hSql,
} from "@/services/tokenEconomyQueries";

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

/** One day of ledger flow, for the 30-day mint/burn trend. */
export interface CosmicYieldFlowDay {
  /** ISO date (YYYY-MM-DD, UTC day buckets). */
  date: string;
  minted: number;
  burned: number;
}

export interface CosmicYieldData {
  /** total ESMS tokens held across all balances */
  inCirculation: number;
  minted30d: number;
  burned30d: number;
  netFlow30d: number;
  sinks24h: CosmicYieldSink[];
  /** Credit mirror of sinks24h — decomposes inflow by source_type, exposing
   *  the PA sync-credit bridge, MCP top-ups, and grants as separate lines. */
  sources24h: CosmicYieldSink[];
  /** Daily mint/burn over 30 days, computed live from the immutable ledger
   *  (GROUP BY day over created_at — no persisted aggregates needed). */
  flowSeries: { days: CosmicYieldFlowDay[]; live: boolean };
  topHolders: CosmicYieldHolder[];
  /** Total accounts holding > 0 ESMS tokens */
  holderCount?: number;
  /** Exact Gini coefficient [0, 1] across positive token balances */
  giniCoefficient?: number | null;
  /** true when computed from the live ledger; false when degraded. */
  live: boolean;
}

const COSMIC_YIELD_FALLBACK: CosmicYieldData = {
  inCirculation: 0,
  minted30d: 0,
  burned30d: 0,
  netFlow30d: 0,
  sinks24h: [],
  sources24h: [],
  flowSeries: { days: [], live: false },
  topHolders: [],
  holderCount: 0,
  giniCoefficient: null,
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
    const sourcesQuery = tokenSources24hSql();
    const flowSeriesQuery = tokenFlowSeriesSql();
    const [flowRes, circulationRes, sinksRes, holdersRes, sourcesRes, flowSeries] =
      await Promise.all([
        executeQuery(
          `SELECT
             COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0)::float8 AS minted,
             COALESCE(SUM(-amount) FILTER (WHERE amount < 0), 0)::float8 AS burned
           FROM token_transactions
           WHERE created_at > NOW() - INTERVAL '30 days'`,
        ),
        executeQuery(
          `WITH bal AS (
             SELECT
               (spirit + essence + matter + substance)::float8 AS b,
               ROW_NUMBER() OVER (ORDER BY (spirit + essence + matter + substance) ASC) AS i,
               COUNT(*) OVER () AS n
             FROM token_balances
             WHERE (spirit + essence + matter + substance) > 0
           )
           SELECT
             COALESCE((SELECT SUM(spirit + essence + matter + substance)::float8 FROM token_balances), 0) AS total,
             COALESCE(MAX(n), 0)::int AS holder_count,
             CASE
               WHEN COALESCE(MAX(n), 0) > 1 AND COALESCE(SUM(b), 0) > 0
                 THEN ((2.0 * SUM(i * b)) / (MAX(n) * SUM(b)) - (MAX(n) + 1.0) / MAX(n))::float8
               ELSE NULL
             END AS gini
           FROM bal`,
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
        executeQuery(sourcesQuery.sql, sourcesQuery.values),
        // The flow series carries its own live flag, so its failure degrades
        // only the trend strip rather than the whole panel.
        executeQuery(flowSeriesQuery.sql, flowSeriesQuery.values)
          .then((res) => ({
            days: (res.rows as Array<{ day: string; minted: number; burned: number }>).map(
              (r) => ({
                date: String(r.day),
                minted: Number(r.minted),
                burned: Number(r.burned),
              }),
            ),
            live: true,
          }))
          .catch((err) => {
            _logger.warn("[cosmicYield] 30d flow-series query failed:", err);
            return { days: [] as CosmicYieldFlowDay[], live: false };
          }),
      ]);

    const flowRow = flowRes.rows[0] as { minted?: unknown; burned?: unknown } | undefined;
    const circRow = circulationRes.rows[0] as {
      total?: unknown;
      holder_count?: unknown;
      gini?: unknown;
    } | undefined;
    const minted = Number(flowRow?.minted ?? 0);
    const burned = Number(flowRow?.burned ?? 0);
    const sinkRows = sinksRes.rows as Array<{ source_type: string; amount: number }>;
    const sourceRows = sourcesRes.rows as Array<{ source_type: string; amount: number }>;
    const holderRows = holdersRes.rows as Array<{ email: string; balance: number }>;
    const rawGini = circRow?.gini;

    return {
      inCirculation: Number(circRow?.total ?? 0),
      minted30d: minted,
      burned30d: burned,
      netFlow30d: minted - burned,
      sinks24h: sinkRows.map((r) => ({
        source: String(r.source_type),
        amount: Number(r.amount),
      })),
      sources24h: sourceRows.map((r) => ({
        source: String(r.source_type),
        amount: Number(r.amount),
      })),
      flowSeries,
      topHolders: holderRows.map((r) => ({
        handle: deriveHandle(String(r.email)),
        balance: Number(r.balance),
      })),
      holderCount: Number(circRow?.holder_count ?? holderRows.length),
      giniCoefficient:
        rawGini !== null && rawGini !== undefined && Number.isFinite(Number(rawGini))
          ? Math.max(0, Math.min(1, Math.round(Number(rawGini) * 1000) / 1000))
          : null,
      live: true,
    };
  } catch (error) {
    _logger.error("[cosmicYield] token-economy aggregation failed:", error);
    return COSMIC_YIELD_FALLBACK;
  }
}

// ─── Request series (hero trace) ───────────────────────────────────────

/** One hourly bucket of real request telemetry from request_log_entries. */
export interface RequestSeriesPoint {
  /** ISO timestamp of the bucket start (UTC hour). */
  hour: string;
  requests: number;
  /** 5xx responses in the bucket. */
  errors: number;
}

/**
 * Real 24h request/error series for the dashboard hero trace — replaces the
 * synthesized sine wave that was labelled "requests/s". Sourced from the
 * durable request_log_entries mirror (same table as errorGroups), so it
 * covers only instrumented routes; `live: false` when the table is
 * unreadable, and an empty-but-live series means genuinely no logged traffic.
 */
export interface RequestSeriesData {
  points: RequestSeriesPoint[];
  windowHours: number;
  live: boolean;
}

export async function getRequestHourlySeries(): Promise<RequestSeriesData> {
  const windowHours = 24;
  try {
    // Buckets keyed by UTC epoch rather than a driver-parsed timestamp: the
    // `AT TIME ZONE 'UTC'` truncation pins hour boundaries regardless of the
    // server's session timezone, and an epoch survives the round-trip without
    // any Date-parsing ambiguity.
    const res = await executeQuery(
      `SELECT
         EXTRACT(EPOCH FROM date_trunc('hour', at AT TIME ZONE 'UTC'))::float8 AS bucket_epoch,
         COUNT(*)::int AS requests,
         COUNT(*) FILTER (WHERE status >= 500)::int AS errors
       FROM request_log_entries
       WHERE at > NOW() - INTERVAL '24 hours'
       GROUP BY bucket_epoch
       ORDER BY bucket_epoch`,
    );

    const byEpochMs = new Map<number, { requests: number; errors: number }>();
    for (const row of res.rows as Array<{
      bucket_epoch: number;
      requests: number;
      errors: number;
    }>) {
      byEpochMs.set(Number(row.bucket_epoch) * 1000, {
        requests: Number(row.requests),
        errors: Number(row.errors),
      });
    }

    // Zero-fill every hour so the trace always has 24 points. This runs only
    // after the query succeeded, so a zero bucket is a measured "no logged
    // traffic that hour", not a masked failure.
    const hourMs = 3_600_000;
    const currentHourMs = Math.floor(Date.now() / hourMs) * hourMs;
    const points: RequestSeriesPoint[] = [];
    for (let i = windowHours - 1; i >= 0; i--) {
      const bucketMs = currentHourMs - i * hourMs;
      const bucket = byEpochMs.get(bucketMs);
      points.push({
        hour: new Date(bucketMs).toISOString(),
        requests: bucket?.requests ?? 0,
        errors: bucket?.errors ?? 0,
      });
    }

    return { points, windowHours, live: true };
  } catch (error) {
    _logger.warn("[getRequestHourlySeries] request_log_entries query failed:", error);
    return { points: [], windowHours, live: false };
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
  /** persisted slow queries from the last 24h above `slowQueryThresholdMs`, worst first */
  slowQueries: SlowQuery[];
  /** the latency threshold (ms) above which a query is treated as slow */
  slowQueryThresholdMs: number;
  /** true when the Postgres stat views resolved; false when degraded. */
  live: boolean;
}

/**
 * Postgres observability for the Database panel — connection-pool usage
 * (read from the in-process pg.Pool), database size, active connections,
 * largest tables, and persisted slow queries over the last 24h that
 * exceed `getSlowQueryThresholdMs()` (default 200ms, Railway dyno pool
 * defaults to 5 — see DB_MAX_CONNECTIONS). Uses only standard stat views
 * — no pg_stat_statements extension required. Each source degrades
 * independently so the dashboard never hard-fails.
 */
export async function getDatabaseObservability(): Promise<DatabaseObservabilityData> {
  const slowQueryThresholdMs = getSlowQueryThresholdMs();

  // Pool counters live on the in-process pool — readable without a query.
  const pool = { total: 0, idle: 0, waiting: 0, max: 0 };
  try {
    const pgPool = getDatabasePool();
    pool.total = pgPool.totalCount;
    pool.idle = pgPool.idleCount;
    pool.waiting = pgPool.waitingCount;
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
      // Filter on metric_value explicitly: the write side gates at the same
      // threshold, but a future env override on either side would otherwise
      // silently desynchronize the panel. Sort by duration so operators see
      // the worst offenders first, not just the most recent.
      executeQuery(
        `SELECT
           tags->>'query' AS query,
           metric_value::float8 AS duration_ms
         FROM system_metrics
         WHERE metric_name = 'slow_query_duration_ms'
           AND metric_value >= $1
           AND timestamp > now() - INTERVAL '24 hours'
         ORDER BY metric_value DESC
         LIMIT 5`,
        [slowQueryThresholdMs],
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

    const slowRows = slowRes.rows as Array<{ query?: unknown; duration_ms?: unknown }>;
    const dbSlowQueries = slowRows.map((r) => ({
      query: String(r.query).trim(),
      durationMs: Math.round(Number(r.duration_ms ?? 0)),
    }));

    // Merge with in-memory slow queries if fewer than 5 rows returned. The
    // in-memory ring uses the same threshold, so values are already filtered.
    let finalSlowQueries = [...dbSlowQueries];
    if (finalSlowQueries.length < 5) {
      const needed = 5 - finalSlowQueries.length;
      const inMemorySlows = getRecentSlowQueries(needed).map(entry => ({
        query: entry.preview,
        durationMs: entry.ms,
      }));
      finalSlowQueries = [...finalSlowQueries, ...inMemorySlows];
    }
    finalSlowQueries.sort((a, b) => b.durationMs - a.durationMs);

    const tableRows = tablesRes.rows as Array<{
      name: string;
      rows: number;
      size_bytes: number;
    }>;

    const sizeRow = sizeRes.rows[0] as { bytes?: unknown } | undefined;
    const connRow = connRes.rows[0] as { count?: unknown } | undefined;

    return {
      pool,
      dbSizeBytes: Number(sizeRow?.bytes ?? 0),
      activeConnections: Number(connRow?.count ?? 0),
      slowQueries: finalSlowQueries,
      slowQueryThresholdMs,
      tables: tableRows.map((r) => ({
        name: String(r.name),
        rows: Math.round(Number(r.rows)),
        sizeBytes: Number(r.size_bytes),
      })),
      live: true,
    };
  } catch (error) {
    _logger.error("[dbObservability] stat-view query failed, falling back to in-memory slow queries:", error);

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
      slowQueryThresholdMs,
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
         r.name,
         r.cuisine::text AS cuisine,
         GREATEST(
           COALESCE(r.popularity_score::float8, 0),
           COALESCE((r.read_model->'alchemical_quantities'->>'matchRate')::float8, 0)
         ) AS popularity,
         COALESCE(
           NULLIF(r.user_rating::float8, 0),
           (SELECT AVG(rr.score)::float8 FROM recipe_reflections rr WHERE rr.recipe_id = r.id::text AND rr.score IS NOT NULL),
           (SELECT AVG(uri.rating)::float8 FROM user_recipe_interactions uri WHERE uri.recipe_id = r.id::text AND uri.rating IS NOT NULL),
           0
         ) AS rating,
         GREATEST(
           COALESCE(r.rating_count, 0),
           (SELECT COUNT(*)::int FROM recipe_reflections rr WHERE rr.recipe_id = r.id::text)
           + (SELECT COUNT(*)::int FROM user_recipe_interactions uri WHERE uri.recipe_id = r.id::text)
         ) AS rating_count
       FROM recipes r
       WHERE r.is_public = true
       ORDER BY rating_count DESC, popularity DESC, r.name ASC
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
        rating: Math.round(Number(r.rating) * 10) / 10,
        ratingCount: Number(r.rating_count),
        popularity: Math.round(Number(r.popularity) * 1000) / 1000,
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
  /** Request success rate (%) over the request-log window. */
  availability: number;
  activeIncidents: number;
  /** p95 request latency (ms) over the request-log window. */
  p95: number;
  /** 5xx error rate (%) over the request-log window. */
  errRate: number;
  /** Short sha of the running deploy (Vercel build env or latest snapshot). */
  deployFreshness: string;
}

/**
 * Live platform health for the dashboard's top-bar pulse strip. Latency and
 * error rate come from the in-memory request log (`summarizeRecent`), falling
 * back to the durable `request_log_entries` table on cold start.
 */
export async function getPlatformPulse(): Promise<PlatformPulse> {
  const summary = summarizeRecent();

  let dbHealthy: boolean;
  try {
    const dbHealth = await checkDatabaseHealth();
    dbHealthy = dbHealth.healthy;
  } catch {
    dbHealthy = false;
  }

  let totalReq = summary.count;
  let errorRateRatio = summary.errorRate;
  let p95Ms = summary.p95LatencyMs;
  let deploySha = process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  if (dbHealthy && (totalReq === 0 || !deploySha)) {
    try {
      const [durableRes, shaRes] = await Promise.all([
        totalReq === 0
          ? executeQuery<{
              cnt: number;
              err_5xx: number;
              p95_ms: number | null;
            }>(
              `SELECT
                 COUNT(*)::int AS cnt,
                 COUNT(*) FILTER (WHERE status >= 500)::int AS err_5xx,
                 PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)
                   FILTER (WHERE latency_ms IS NOT NULL) AS p95_ms
               FROM request_log_entries
               WHERE at > NOW() - INTERVAL '24 hours'`,
            )
          : Promise.resolve({ rows: [] }),
        !deploySha
          ? executeQuery<{ commit_sha: string | null }>(
              `SELECT commit_sha FROM code_health_snapshots
               WHERE commit_sha IS NOT NULL AND commit_sha <> 'unknown'
               ORDER BY measured_at DESC LIMIT 1`,
            )
          : Promise.resolve({ rows: [] }),
      ]);
      const [dRow] = durableRes.rows;
      if (dRow && Number(dRow.cnt) > 0) {
        totalReq = Number(dRow.cnt);
        errorRateRatio = Number(dRow.err_5xx) / totalReq;
        p95Ms = Math.round(Number(dRow.p95_ms ?? 0));
      }
      if (!deploySha && shaRes.rows[0]?.commit_sha) {
        deploySha = shaRes.rows[0].commit_sha;
      }
    } catch {
      // Fall back to in-memory ring values
    }
  }

  const errRate = Number((errorRateRatio * 100).toFixed(2));
  const highErrors = errRate > 5;
  const highLatency = p95Ms > 1000;

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
    totalReq > 0
      ? Number(((1 - errorRateRatio) * 100).toFixed(3))
      : 100;

  return {
    state,
    score,
    availability,
    activeIncidents,
    p95: p95Ms,
    errRate,
    deployFreshness: deploySha ? `sha ${deploySha.slice(0, 7)}` : "—",
  };
}

// ─── Enriched Telemetry Getters ────────────────────────────────────────

export interface EngineStageMetric {
  stage: string;
  calls: number;
  p50Ms: number | null;
  p95Ms: number | null;
}

export interface EngineEvaluationMetrics {
  totalCritiques: number;
  critiquedRecipes: number;
  catalogCoveragePct: number;
  meanRating: number | null;
  verifiedCritiques: number;
  proposedCritiques: number;
}

export interface EnginePerformanceData {
  clickToCookRate: number;
  totalCalculations: number;
  averageLatencyMs: number;
  stages?: EngineStageMetric[];
  evaluation?: EngineEvaluationMetrics;
  live: boolean;
}

export interface PractitionerCohortsData {
  funnel: {
    landing: number;
    signup: number;
    onboarded: number;
    active: number;
    firstCook: number;
    paidPro: number;
  };
  elementalBreakdown: Array<{ element: string; count: number }>;
  live: boolean;
}

export interface CommerceSubscriptionTierRow {
  tier: string;
  status: string;
  count: number;
}

export interface CommerceSummaryData {
  mrr: number;
  /** Stripe-backed subs — actual paying customers. */
  paidSubs: number;
  recentOrders: Array<{
    id: string;
    user: string;
    type: string;
    amount: number;
    age: string;
    status: string;
  }>;
  subscriptionMix?: CommerceSubscriptionTierRow[];
  shopPurchasesTotal?: number;
  shopPurchasesUsd?: number;
  live: boolean;
}

export interface PageTelemetryData {
  foodDiary: number;
  customRecipes: number;
  restaurants: number;
  commensals: number;
  mealPlans: number;
  /** natal_charts row count — the number previously mislabelled from
   *  customRecipes on the Astronomical Engine panel. */
  natalCharts: number;
  /** Catalog cuisine count — replaces a hardcoded "184". */
  cuisines: number;
  live: boolean;
}

function formatAge(createdAt: Date): string {
  const diffMs = Date.now() - createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "1s";
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export async function getEnginePerformance(): Promise<EnginePerformanceData> {
  try {
    const [interactionsRes, calculationsRes, stagesRes, evalRes] = await Promise.all([
      executeQuery(`
        SELECT
          (
            (SELECT COUNT(*) FROM user_interactions WHERE interaction_type IN ('recipe_cook', 'food_diary_entry'))
            + (SELECT COUNT(*) FROM user_recipe_interactions)
            + (SELECT COUNT(*) FROM recipe_reflections)
          )::float8 AS cook_count,
          (
            (SELECT COUNT(*) FROM user_interactions WHERE interaction_type IN ('recipe_view', 'planetary_query'))
            + (SELECT COUNT(*) FROM request_log_entries WHERE path IN ('/api/personalized-recommendations', '/api/cuisines/recommend', '/api/generate-cosmic-recipe', '/api/recipes'))
            + (SELECT COUNT(*) FROM user_recipe_interactions)
          )::float8 AS view_count
      `),
      executeQuery(`
        SELECT
          (
            (SELECT COUNT(*) FROM user_calculations)
            + (SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'planetary_query')
            + (SELECT COUNT(*) FROM calculation_cache)
            + (SELECT COUNT(*) FROM mcp_invocations)
            + (SELECT COUNT(*) FROM request_log_entries WHERE path IN ('/api/personalized-recommendations', '/api/cuisines/recommend', '/api/generate-cosmic-recipe'))
          )::integer AS count,
          COALESCE(
            (
              SELECT AVG(latency_ms)::float8
              FROM (
                SELECT execution_time_ms AS latency_ms FROM user_calculations WHERE execution_time_ms IS NOT NULL
                UNION ALL
                SELECT latency_ms FROM request_log_entries
                WHERE path IN ('/api/personalized-recommendations', '/api/cuisines/recommend', '/api/generate-cosmic-recipe')
                  AND latency_ms IS NOT NULL
                UNION ALL
                SELECT latency_ms FROM mcp_invocations WHERE latency_ms IS NOT NULL
              ) s
            ),
            0
          )::float8 AS avg_latency
      `),
      executeQuery<{
        stage: string;
        calls: number;
        p50_ms: number | null;
        p95_ms: number | null;
      }>(`
        SELECT
          stage,
          calls::int AS calls,
          ROUND(p50_ms::numeric)::int AS p50_ms,
          ROUND(p95_ms::numeric)::int AS p95_ms
        FROM (
          SELECT
            'Ephemeris · Planetary Query' AS stage,
            (SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'planetary_query')
            + (SELECT COUNT(*) FROM mcp_invocations WHERE tool_name = 'get_live_sky_transits') AS calls,
            (SELECT PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) FROM mcp_invocations WHERE tool_name = 'get_live_sky_transits') AS p50_ms,
            (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) FROM mcp_invocations WHERE tool_name = 'get_live_sky_transits') AS p95_ms
          UNION ALL
          SELECT
            'ESMS · Natal & Calibration' AS stage,
            (SELECT COUNT(*) FROM user_profiles WHERE monica_constant IS NOT NULL) AS calls,
            (SELECT PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) FROM request_log_entries WHERE path = '/api/onboarding') AS p50_ms,
            (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) FROM request_log_entries WHERE path = '/api/onboarding') AS p95_ms
          UNION ALL
          SELECT
            'Alchemical Scorer · Recommend' AS stage,
            (SELECT COUNT(*) FROM request_log_entries WHERE path = '/api/personalized-recommendations') AS calls,
            (SELECT PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) FROM request_log_entries WHERE path = '/api/personalized-recommendations') AS p50_ms,
            (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) FROM request_log_entries WHERE path = '/api/personalized-recommendations') AS p95_ms
          UNION ALL
          SELECT
            'Cuisine Matcher · Affinity' AS stage,
            (SELECT COUNT(*) FROM request_log_entries WHERE path = '/api/cuisines/recommend') AS calls,
            (SELECT PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) FROM request_log_entries WHERE path = '/api/cuisines/recommend') AS p50_ms,
            (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) FROM request_log_entries WHERE path = '/api/cuisines/recommend') AS p95_ms
          UNION ALL
          SELECT
            'Cosmic Recipe Synthesis' AS stage,
            (SELECT COUNT(*) FROM request_log_entries WHERE path = '/api/generate-cosmic-recipe')
            + (SELECT COUNT(*) FROM mcp_invocations WHERE tool_name = 'generate_cosmic_recipe') AS calls,
            (SELECT PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms) FROM request_log_entries WHERE path = '/api/generate-cosmic-recipe') AS p50_ms,
            (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) FROM request_log_entries WHERE path = '/api/generate-cosmic-recipe') AS p95_ms
          UNION ALL
          SELECT
            'Calculation Cache · Memo' AS stage,
            (SELECT COALESCE(SUM(hit_count), COUNT(*)) FROM calculation_cache) AS calls,
            NULL::float8 AS p50_ms,
            NULL::float8 AS p95_ms
        ) t
      `).catch(() => ({ rows: [] })),
      executeQuery<{
        total_recipes: number;
        total_critiques: number;
        critiqued_recipes: number;
        verified_critiques: number;
        proposed_critiques: number;
        mean_rating: number | null;
      }>(`
        SELECT
          (SELECT COUNT(*)::int FROM recipes) AS total_recipes,
          (SELECT COUNT(*)::int FROM recipe_reflections WHERE deleted_at IS NULL AND COALESCE(hidden, false) = false) AS total_critiques,
          (SELECT COUNT(DISTINCT recipe_id)::int FROM recipe_reflections WHERE deleted_at IS NULL AND COALESCE(hidden, false) = false) AS critiqued_recipes,
          (SELECT COUNT(*)::int FROM recipe_reflections WHERE deleted_at IS NULL AND COALESCE(hidden, false) = false AND content_state = 'verified') AS verified_critiques,
          (SELECT COUNT(*)::int FROM recipe_reflections WHERE deleted_at IS NULL AND COALESCE(hidden, false) = false AND content_state = 'proposed') AS proposed_critiques,
          (SELECT ROUND(AVG(rating)::numeric, 2)::float8 FROM (
            SELECT score::float8 AS rating FROM recipe_reflections WHERE deleted_at IS NULL AND COALESCE(hidden, false) = false AND score IS NOT NULL
            UNION ALL
            SELECT rating::float8 AS rating FROM user_recipe_interactions WHERE rating IS NOT NULL
          ) r) AS mean_rating
      `).catch(() => ({ rows: [] })),
    ]);

    const cookCount = Number((interactionsRes.rows[0] as { cook_count?: unknown } | undefined)?.cook_count ?? 0);
    const viewCount = Number((interactionsRes.rows[0] as { view_count?: unknown } | undefined)?.view_count ?? 0);
    const clickToCookRate = viewCount > 0 ? Math.min(1, cookCount / viewCount) : 0;

    const totalCalculations = Number((calculationsRes.rows[0] as { count?: unknown } | undefined)?.count ?? 0);
    const averageLatencyMs = Math.round(Number((calculationsRes.rows[0] as { avg_latency?: unknown } | undefined)?.avg_latency ?? 0));

    const stages: EngineStageMetric[] = stagesRes.rows.map((r) => ({
      stage: String(r.stage),
      calls: Number(r.calls ?? 0),
      p50Ms: r.p50_ms !== null && r.p50_ms !== undefined ? Number(r.p50_ms) : null,
      p95Ms: r.p95_ms !== null && r.p95_ms !== undefined ? Number(r.p95_ms) : null,
    }));

    const [evalRow] = evalRes.rows;
    const totalRecipes = Number(evalRow?.total_recipes ?? 0);
    const critiquedRecipes = Number(evalRow?.critiqued_recipes ?? 0);
    const evaluation: EngineEvaluationMetrics = {
      totalCritiques: Number(evalRow?.total_critiques ?? 0),
      critiquedRecipes,
      catalogCoveragePct:
        totalRecipes > 0 ? Math.round((critiquedRecipes / totalRecipes) * 1000) / 10 : 0,
      meanRating:
        evalRow?.mean_rating !== null && evalRow?.mean_rating !== undefined
          ? Number(evalRow.mean_rating)
          : null,
      verifiedCritiques: Number(evalRow?.verified_critiques ?? 0),
      proposedCritiques: Number(evalRow?.proposed_critiques ?? 0),
    };

    return {
      clickToCookRate,
      totalCalculations,
      averageLatencyMs,
      stages,
      evaluation,
      live: true,
    };
  } catch (error) {
    _logger.error("[getEnginePerformance] failed:", error);
    return {
      clickToCookRate: 0,
      totalCalculations: 0,
      averageLatencyMs: 0,
      stages: [],
      live: false,
    };
  }
}

export async function getPractitionerCohorts(): Promise<PractitionerCohortsData> {
  try {
    // Read onboarding + elemental signature from the canonical user_profiles
    // columns, NOT the vestigial users.profile JSONB (which rowToUserWithProfile
    // never reads back).
    const [totalUsersRes, onboardedRes, activeRes, firstCookRes, revenue, elementalRes] = await Promise.all([
      executeQuery("SELECT COUNT(*)::integer AS count FROM users"),
      executeQuery("SELECT COUNT(*)::integer AS count FROM user_profiles WHERE onboarding_completed = true"),
      executeQuery("SELECT COUNT(*)::integer AS count FROM users WHERE is_active = true"),
      executeQuery(`
        SELECT COUNT(DISTINCT user_id)::integer AS count
        FROM (
          SELECT user_id FROM user_interactions WHERE interaction_type IN ('recipe_cook', 'food_diary_entry', 'planetary_query')
          UNION
          SELECT user_id FROM user_recipe_interactions
        ) t
      `),
      getSubscriptionRevenueBreakdown().catch(() => ({ paidSubs: 0, mrr: 0 })),
      executeQuery(`
        SELECT
          INITCAP(LOWER(COALESCE(dominant_element, 'Unknown'))) AS element,
          COUNT(*)::integer AS count
        FROM user_profiles
        WHERE dominant_element IS NOT NULL
        GROUP BY INITCAP(LOWER(COALESCE(dominant_element, 'Unknown')))
        ORDER BY count DESC
      `),
    ]);

    const signup = Number((totalUsersRes.rows[0] as { count?: unknown } | undefined)?.count ?? 0);
    const onboarded = Number((onboardedRes.rows[0] as { count?: unknown } | undefined)?.count ?? 0);
    const active = Number((activeRes.rows[0] as { count?: unknown } | undefined)?.count ?? 0);
    const firstCook = Number((firstCookRes.rows[0] as { count?: unknown } | undefined)?.count ?? 0);
    const paidPro = Number(revenue.paidSubs);

    const elementalBreakdown = (elementalRes.rows as Array<{ element: string; count: number }>).map((r) => ({
      element: String(r.element),
      count: Number(r.count),
    }));

    return {
      funnel: {
        landing: signup,
        signup,
        onboarded,
        active,
        firstCook,
        paidPro,
      },
      elementalBreakdown,
      live: true,
    };
  } catch (error) {
    _logger.error("[getPractitionerCohorts] failed:", error);
    return {
      funnel: {
        landing: 0,
        signup: 0,
        onboarded: 0,
        active: 0,
        firstCook: 0,
        paidPro: 0,
      },
      elementalBreakdown: [],
      live: false,
    };
  }
}

export async function getCommerceTelemetry(): Promise<CommerceSummaryData> {
  try {
    const [revenue, ordersRes, subMixRes, shopStatsRes] = await Promise.all([
      getSubscriptionRevenueBreakdown()
        .then((res) => ({ ...res, live: true }))
        .catch((err) => {
          _logger.warn("[getCommerceTelemetry] revenue breakdown failed:", err);
          return { paidSubs: 0, mrr: 0, live: false };
        }),
      executeQuery(`
        SELECT
          c.id::text AS id,
          COALESCE(u.email, 'Guest') AS user_email,
          'cart_handoff' AS order_type,
          0::float8 AS amount,
          c.created_at,
          c.status
        FROM cart_handoff_intents c
        LEFT JOIN users u ON u.id = c.user_id
        UNION ALL
        SELECT
          r.id::text AS id,
          COALESCE(u.email, 'Guest') AS user_email,
          'Stripe Connect' AS order_type,
          (r.total_cents / 100.0)::float8 AS amount,
          r.created_at,
          r.status
        FROM restaurant_order_intents r
        LEFT JOIN users u ON u.id::text = r.user_id
        UNION ALL
        SELECT
          p.id::text AS id,
          COALESCE(u.email, 'Guest') AS user_email,
          'shop_purchase' AS order_type,
          0::float8 AS amount,
          p.purchased_at AS created_at,
          'fulfilled' AS status
        FROM user_purchases p
        LEFT JOIN users u ON u.id = p.user_id
        ORDER BY created_at DESC
        LIMIT 5;
      `)
        .then((res) => ({ rows: res.rows, live: true }))
        .catch((err) => {
          _logger.warn("[getCommerceTelemetry] order-intents query failed:", err);
          return { rows: [], live: false };
        }),
      executeQuery<{
        tier: string;
        status: string;
        count: number;
      }>(`
        SELECT
          COALESCE(tier, 'free') AS tier,
          COALESCE(status, 'active') AS status,
          COUNT(*)::int AS count
        FROM user_subscriptions
        GROUP BY tier, status
        ORDER BY count DESC
      `).catch(() => ({ rows: [] })),
      executeQuery<{
        cnt: number;
        total_usd: number;
      }>(`
        SELECT
          COUNT(*)::int AS cnt,
          0::float8 AS total_usd
        FROM user_purchases
      `).catch(() => ({ rows: [{ cnt: 0, total_usd: 0 }] })),
    ]);

    const { paidSubs, mrr } = revenue;

    const recentOrders = (ordersRes.rows as Array<{
      id: string;
      user_email: string;
      order_type: string;
      amount: number;
      created_at: string | Date;
      status: string;
    }>).map((r) => ({
      id: String(r.id),
      user: deriveHandle(String(r.user_email)),
      type: String(r.order_type),
      amount: Number(r.amount),
      age: formatAge(new Date(r.created_at)),
      status: String(r.status),
    }));

    const subscriptionMix: CommerceSubscriptionTierRow[] = subMixRes.rows.map((r) => ({
      tier: String(r.tier),
      status: String(r.status),
      count: Number(r.count),
    }));

    const [shopRow] = shopStatsRes.rows;

    return {
      mrr,
      paidSubs,
      recentOrders,
      subscriptionMix,
      shopPurchasesTotal: Number(shopRow?.cnt ?? 0),
      shopPurchasesUsd: Number(shopRow?.total_usd ?? 0),
      live: revenue.live && ordersRes.live,
    };
  } catch (error) {
    _logger.error("[getCommerceTelemetry] failed:", error);
    return {
      mrr: 0,
      paidSubs: 0,
      recentOrders: [],
      subscriptionMix: [],
      shopPurchasesTotal: 0,
      shopPurchasesUsd: 0,
      live: false,
    };
  }
}

export async function getPageTelemetry(): Promise<PageTelemetryData> {
  // ANY failed count flips `live` — a count silently caught to 0 under
  // `live: true` is indistinguishable from a measured empty table.
  let allLive = true;
  const countOf = (sql: string, label: string): Promise<number> =>
    executeQuery(sql)
      .then((res) => Number((res.rows[0] as { count?: unknown } | undefined)?.count ?? 0))
      .catch((err) => {
        allLive = false;
        _logger.warn(`[getPageTelemetry] ${label} count failed:`, err);
        return 0;
      });

  const [foodDiary, customRecipes, restaurants, commensals, mealPlans, natalCharts] =
    await Promise.all([
      countOf(
        `SELECT (
           (SELECT COUNT(*) FROM food_diary_entries)
           + (SELECT COUNT(*) FROM user_interactions WHERE interaction_type = 'food_diary_entry')
         )::integer AS count`,
        "food_diary_entries",
      ),
      countOf(
        `SELECT (
           (SELECT COUNT(*) FROM recipes WHERE is_public = false)
           + (SELECT COUNT(*) FROM user_custom_recipes)
         )::integer AS count`,
        "custom recipes",
      ),
      countOf("SELECT COUNT(*)::integer AS count FROM restaurants", "restaurants"),
      countOf("SELECT COUNT(*)::integer AS count FROM manual_companion_charts", "manual_companion_charts"),
      countOf(
        `SELECT (
           (SELECT COUNT(*) FROM user_meal_plans)
           + (SELECT COUNT(*) FROM weekly_menus)
         )::integer AS count`,
        "user_meal_plans",
      ),
      countOf(
        `SELECT COUNT(*)::integer AS count FROM user_profiles
         WHERE natal_chart IS NOT NULL AND natal_chart <> '{}'::jsonb`,
        "natal charts",
      ),
    ]);

  return {
    foodDiary,
    customRecipes,
    restaurants,
    commensals,
    mealPlans,
    natalCharts,
    cuisines: PRIMARY_CUISINE_KEYS.length,
    live: allLive,
  };
}

// ─── Recent Alerts · alert_events table ────────────────────────────────

export type AlertSeverityValue = "info" | "warn" | "error";

export interface RecentAlertEntry {
  id: number;
  triggeredAt: string;
  component: string;
  previousStatus: string;
  currentStatus: string;
  severity: AlertSeverityValue;
  title: string;
  message: string;
  suppressed: boolean;
  /**
   * Channels this alert failed to reach, e.g. `["slack"]`. An alert that
   * fired but reached nobody is otherwise indistinguishable from a delivered
   * one, so the panel must be able to say so. Empty array = every channel
   * that was attempted succeeded.
   */
  undeliveredChannels: string[];
}

export interface RecentAlertsData {
  entries: RecentAlertEntry[];
  live: boolean;
}

/**
 * Pull the latest N rows from `alert_events` (PR #445 schema) so the
 * IncidentsPanel can show real operator alerts instead of mock incidents.
 * Returns `live: false` with an empty list when the table is missing or
 * the query fails — never throws.
 */
export async function getRecentAlerts(
  limit = 8,
): Promise<RecentAlertsData> {
  try {
    const result = await executeQuery<{
      id: number;
      triggered_at: Date;
      component: string;
      previous_status: string;
      current_status: string;
      severity: AlertSeverityValue;
      title: string;
      message: string;
      suppressed: boolean | null;
      undelivered_channels: string[] | null;
    }>(
      // `dispatch` holds one object per channel (`{"slack":{"ok":false,...}}`)
      // alongside scalar bookkeeping keys such as `suppressed`. Expanding it
      // lets us report which channels the alert failed to reach — reading
      // only `suppressed` silently hid a channel that had never worked.
      `SELECT id, triggered_at, component, previous_status, current_status,
              severity, title, message,
              COALESCE((dispatch->>'suppressed')::boolean, false) AS suppressed,
              COALESCE(
                ARRAY(
                  SELECT ch.key
                  FROM jsonb_each(dispatch) AS ch(key, value)
                  WHERE jsonb_typeof(ch.value) = 'object'
                    AND ch.value->>'ok' = 'false'
                  ORDER BY ch.key
                ),
                ARRAY[]::text[]
              ) AS undelivered_channels
       FROM alert_events
       ORDER BY triggered_at DESC
       LIMIT $1`,
      [limit],
    );

    return {
      entries: result.rows.map((row) => ({
        id: Number(row.id),
        triggeredAt: new Date(row.triggered_at).toISOString(),
        component: row.component,
        previousStatus: row.previous_status,
        currentStatus: row.current_status,
        severity: row.severity,
        title: row.title,
        message: row.message,
        suppressed: Boolean(row.suppressed),
        undeliveredChannels: row.undelivered_channels ?? [],
      })),
      live: true,
    };
  } catch (error) {
    _logger.warn("[getRecentAlerts] failed:", error);
    return { entries: [], live: false };
  }
}

// ─── Living Economy · the release's three success numbers ─────────────

export interface LivingEconomyMetrics {
  /** Amazon cart handoffs in the trailing 7 days (cart_handoff_intents). */
  affiliateClicksWeek: number;
  /** Instacart split handoffs in the trailing 7 days. */
  instacartHandoffsWeek: number;
  /** Cooked-it dish cards posted in the trailing 7 days. */
  cookedPostsWeek: number;
  /** Distinct users whose feed_visit practice fired today. */
  feedDauToday: number;
  live: boolean;
}

/**
 * The composite scorecard for the Living Economy release: affiliate-funnel
 * top (handoffs across Amazon & Instacart), the cook→share flywheel (dish cards),
 * and social pull (feed DAU via the practice ledger). Never throws.
 */
export async function getLivingEconomyMetrics(): Promise<LivingEconomyMetrics> {
  try {
    const result = await executeQuery<{
      affiliate_clicks: string;
      instacart_handoffs: string;
      cooked_posts: string;
      feed_dau: string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM cart_handoff_intents
           WHERE created_at >= now() - interval '7 days') AS affiliate_clicks,
         (SELECT COUNT(*) FROM feed_events
           WHERE event_type = 'cart_handoff'
             AND (metadata_payload->>'retailer' ILIKE '%instacart%' OR metadata_payload->>'provider' ILIKE '%instacart%')
             AND created_at >= now() - interval '7 days') AS instacart_handoffs,
         (SELECT COUNT(*) FROM feed_events
           WHERE (
             event_type IN ('made_it', 'recipe_generation', 'recipe_review', 'recipe_adapted')
             OR COALESCE((metadata_payload->>'madeIt')::boolean, false) = true
           )
             AND created_at >= now() - interval '7 days') AS cooked_posts,
         (
           (SELECT COUNT(DISTINCT user_id) FROM practice_events
             WHERE practice_type = 'feed_visit'
               AND created_at >= CURRENT_DATE)
           + (SELECT COUNT(DISTINCT actor_id) FROM feed_events
               WHERE created_at >= now() - interval '24 hours')
           + (SELECT COUNT(DISTINCT COALESCE(user_id::text, visitor_hash)) FROM page_views
               WHERE at >= now() - interval '24 hours')
         ) AS feed_dau`,
    );
    const row = result.rows[0] as {
      affiliate_clicks?: unknown;
      instacart_handoffs?: unknown;
      cooked_posts?: unknown;
      feed_dau?: unknown;
    } | undefined;
    return {
      affiliateClicksWeek: Number(row?.affiliate_clicks ?? 0),
      instacartHandoffsWeek: Number(row?.instacart_handoffs ?? 0),
      cookedPostsWeek: Number(row?.cooked_posts ?? 0),
      feedDauToday: Number(row?.feed_dau ?? 0),
      live: true,
    };
  } catch (error) {
    _logger.warn("[getLivingEconomyMetrics] failed:", error);
    return { affiliateClicksWeek: 0, instacartHandoffsWeek: 0, cookedPostsWeek: 0, feedDauToday: 0, live: false };
  }
}

// ─── Error Groups · request_log_entries rollup ────────────────────────

export interface ErrorGroupEntry {
  path: string;
  fiveXxCount: number;
  fourXxCount: number;
  totalCount: number;
  lastSeenAt: string;
}

export interface ErrorGroupsData {
  groups: ErrorGroupEntry[];
  windowMinutes: number;
  live: boolean;
}

/**
 * Bucket non-2xx requests over the last hour by path, ranked by 5xx
 * count then total. Powers the ErrorGroups panel — replaces hardcoded
 * E-7741 / E-7740 fixtures with the real recent error footprint.
 */
export async function getErrorGroupSummary(
  windowMinutes = 60,
): Promise<ErrorGroupsData> {
  try {
    const result = await executeQuery<{
      path: string;
      five_xx: number;
      four_xx: number;
      total: number;
      last_seen: Date;
    }>(
      `SELECT path,
              COUNT(*) FILTER (WHERE status >= 500)::int AS five_xx,
              COUNT(*) FILTER (WHERE status >= 400 AND status < 500)::int AS four_xx,
              COUNT(*)::int AS total,
              MAX(at) AS last_seen
       FROM request_log_entries
       WHERE at > NOW() - make_interval(mins => $1) AND status >= 400
       GROUP BY path
       ORDER BY five_xx DESC, total DESC
       LIMIT 8`,
      [windowMinutes],
    );

    return {
      groups: result.rows.map((row) => ({
        path: row.path,
        fiveXxCount: row.five_xx,
        fourXxCount: row.four_xx,
        totalCount: row.total,
        lastSeenAt: new Date(row.last_seen).toISOString(),
      })),
      windowMinutes,
      live: true,
    };
  } catch (error) {
    _logger.warn("[getErrorGroupSummary] failed:", error);
    return { groups: [], windowMinutes, live: false };
  }
}

// ─── Security Summary · auth_events rollup ─────────────────────────────

export interface SecurityFailingIp {
  ipHash: string;
  failures: number;
}

export interface SecuritySummaryData {
  signinSuccess24h: number;
  signinFailure24h: number;
  uniqueIps24h: number;
  failingIps: SecurityFailingIp[];
  /** 24 hourly buckets, oldest first, of total sign-in attempts. */
  hourlyAttempts: number[];
  live: boolean;
}

/**
 * Aggregate auth_events over the last 24h: success/failure counts,
 * unique IP count, the top 5 failure-IPs, and a 24-bucket hourly
 * histogram of attempts. Powers the SecurityPanel — replaces the
 * "84 failed sign-ins" / "6 throttled IPs" fixtures.
 */
export async function getSecuritySummary(): Promise<SecuritySummaryData> {
  const emptyHourly = Array.from({ length: 24 }, () => 0);
  try {
    const [counts, ips, hourly] = await Promise.all([
      executeQuery<{
        success: number;
        failure: number;
        unique_ips: number;
      }>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'success')::int AS success,
           COUNT(*) FILTER (WHERE status = 'failure')::int AS failure,
           COUNT(DISTINCT ip_hash) FILTER (WHERE ip_hash IS NOT NULL)::int AS unique_ips
         FROM auth_events
         WHERE created_at > NOW() - INTERVAL '24 hours'`,
      ),
      executeQuery<{ ip_hash: string; failures: number }>(
        `SELECT ip_hash, COUNT(*)::int AS failures
         FROM auth_events
         WHERE created_at > NOW() - INTERVAL '24 hours'
           AND status = 'failure'
           AND ip_hash IS NOT NULL
         GROUP BY ip_hash
         ORDER BY failures DESC
         LIMIT 5`,
      ),
      executeQuery<{ hour_bucket: number; count: number }>(
        // Bucket attempts into 24 hourly slots from oldest to newest.
        `SELECT FLOOR(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600)::int AS hour_bucket,
                COUNT(*)::int AS count
         FROM auth_events
         WHERE created_at > NOW() - INTERVAL '24 hours'
         GROUP BY hour_bucket
         ORDER BY hour_bucket`,
      ),
    ]);

    const countsRow = counts.rows[0] as {
      success?: number;
      failure?: number;
      unique_ips?: number;
    } | undefined;
    for (const row of hourly.rows) {
      const idx = 23 - row.hour_bucket;
      if (idx >= 0 && idx < 24) {
        emptyHourly[idx] = row.count;
      }
    }

    return {
      signinSuccess24h: countsRow?.success ?? 0,
      signinFailure24h: countsRow?.failure ?? 0,
      uniqueIps24h: countsRow?.unique_ips ?? 0,
      failingIps: ips.rows.map((row) => ({
        // Show only the last 6 chars of the hash so the UI surfaces something
        // identifiable without leaking the full hash.
        ipHash: row.ip_hash.slice(-6),
        failures: row.failures,
      })),
      hourlyAttempts: emptyHourly,
      live: true,
    };
  } catch (error) {
    _logger.warn("[getSecuritySummary] failed:", error);
    return {
      signinSuccess24h: 0,
      signinFailure24h: 0,
      uniqueIps24h: 0,
      failingIps: [],
      hourlyAttempts: emptyHourly,
      live: false,
    };
  }
}

// ─── Deploy History · git log ──────────────────────────────────────────

export interface DeployHistoryEntry {
  sha: string;
  author: string;
  age: string;
  message: string;
}

export function getDeployHistory(): { entries: DeployHistoryEntry[]; live: boolean } {
  // Deployed lambdas have no .git directory, so the git path below is
  // permanently dead in production. Vercel stamps the deploy's commit into
  // the build env — one honest current-deploy entry beats five fabricated
  // "unknown" rows or an execSync that fails on every poll.
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (vercelSha) {
    return {
      entries: [
        {
          sha: vercelSha.slice(0, 7),
          author: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ?? "unknown",
          // Vercel exposes no deploy timestamp env, so the age is the deploy's
          // identity, not a fabricated duration.
          age: "current",
          message: process.env.VERCEL_GIT_COMMIT_MESSAGE ?? "unknown",
        },
      ],
      live: true,
    };
  }

  // git exec is a local-dev fallback only — never in production, where it
  // would spawn a doomed subprocess on every dashboard poll.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return { entries: [], live: false };
  }

  try {
    const output = execSync('git log -n 5 --pretty=format:"%h|%an|%ar|%s"', {
      encoding: "utf-8",
      timeout: 1000,
    });
    const lines = output.split("\n").filter(Boolean);
    const entries = lines.map((line) => {
      const [sha, author, age, message] = line.split("|");
      return {
        sha: sha || "unknown",
        author: author || "unknown",
        age: age || "unknown",
        message: message || "unknown",
      };
    });
    return { entries, live: true };
  } catch (error) {
    _logger.warn("[getDeployHistory] git command failed, using empty:", error);
    return { entries: [], live: false };
  }
}

// ─── Feature Flags ──────────────────────────────────────────────────────

export interface FeatureFlagEntry {
  name: string;
  status: "ENABLED" | "DISABLED";
  description: string;
  source: string;
}

export function getFeatureFlags(): { flags: FeatureFlagEntry[]; live: boolean } {
  const flags: FeatureFlagEntry[] = [
    {
      name: "Additive-only elemental logic",
      status: process.env.ADDITIVE_ONLY_ELEMENTS === "true" ? "ENABLED" : "DISABLED",
      description: "Additive-only planetary calculations without negative penalties",
      source: "ADDITIVE_ONLY_ELEMENTS",
    },
    {
      name: "Astrological debugging UI",
      status: process.env.NEXT_PUBLIC_ENABLE_ASTRO_DEBUG === "true" ? "ENABLED" : "DISABLED",
      description: "Enables astro debug console overlay in current chart view",
      source: "NEXT_PUBLIC_ENABLE_ASTRO_DEBUG",
    },
    {
      name: "Privy Web3 authentication",
      status: process.env.NEXT_PUBLIC_PRIVY_APP_ID ? "ENABLED" : "DISABLED",
      description: "Unified EVM wallet + social login via Privy SDK",
      source: "NEXT_PUBLIC_PRIVY_APP_ID",
    },
    {
      name: "Stripe Pro payments",
      status: process.env.STRIPE_SECRET_KEY ? "ENABLED" : "DISABLED",
      description: "Handles user upgrades and Pro tier subscriptions",
      source: "STRIPE_SECRET_KEY",
    },
    {
      name: "Resend email notifications",
      status: process.env.RESEND_API_KEY ? "ENABLED" : "DISABLED",
      description: "Transactional transit updates and meal plan emails",
      source: "RESEND_API_KEY",
    },
  ];
  return { flags, live: true };
}

// ─── Resource Usage MTD ─────────────────────────────────────────────────

export interface ResourceUsageData {
  items: ResourceUsageItem[];
  provider: string;
  periodLabel: string;
  live: boolean;
}

const RESOURCE_USAGE_NO_SOURCE: ResourceUsageData = {
  items: [],
  provider: "Railway",
  periodLabel: "",
  live: false,
};

/**
 * Real Railway resource usage (month-to-date actual + projected month-end), in
 * metered quantities — NOT dollars. (Railway's API exposes usage but no
 * authoritative cost, and Vercel exposes no spend on this plan, so a dollar
 * panel can't be built without fabricating; this replaced the old fabricated
 * "Cost Burndown" — see railwayUsageService.) Cached ~15 min because the
 * Railway GraphQL call is slow/rate-limited and usage moves slowly. Falls back
 * to the honest "not connected" state when RAILWAY_API_TOKEN is unset or the
 * call fails, so the panel never invents numbers.
 */
export async function getResourceUsage(): Promise<ResourceUsageData> {
  try {
    const usage = await redisCached("dashboard:railway-usage", 900, () =>
      fetchRailwayResourceUsage(),
    );
    if (!usage) return RESOURCE_USAGE_NO_SOURCE;
    return { ...usage, live: true };
  } catch (error) {
    _logger.warn("[getResourceUsage] failed:", error);
    return RESOURCE_USAGE_NO_SOURCE;
  }
}

// ─── Practitioner Geography ─────────────────────────────────────────────

export interface GeoRegion {
  name: string;
  lat: number;
  lng: number;
  count: number;
}

export interface PractitionerGeoData {
  regions: GeoRegion[];
  live: boolean;
}

export async function getPractitionerGeo(): Promise<PractitionerGeoData> {
  try {
    const result = await executeQuery<{
      lat: string;
      lng: string;
      tz: string | null;
      count: number;
    }>(
      `SELECT
         COALESCE((birth_data->>'latitude')::float8, 0) as lat,
         COALESCE((birth_data->>'longitude')::float8, 0) as lng,
         birth_data->>'timezone' as tz,
         COUNT(*)::int as count
       FROM user_profiles
       WHERE birth_data IS NOT NULL AND birth_data->>'latitude' IS NOT NULL
       GROUP BY lat, lng, tz
       ORDER BY count DESC
       LIMIT 30`
    );

    const byName = new Map<string, { latSum: number; lngSum: number; count: number }>();
    for (const row of result.rows) {
      const lat = Number(row.lat);
      const lng = Number(row.lng);
      const cnt = Number(row.count);
      let name = row.tz ? row.tz.split("/").pop()?.replace(/_/g, " ") ?? "Unknown" : "Unknown";
      if (name === "Unknown" && Math.abs(lat - 40.7) < 0.2 && Math.abs(lng - -74.0) < 0.3) {
        name = "New York";
      }
      const prev = byName.get(name);
      if (prev) {
        prev.latSum += lat * cnt;
        prev.lngSum += lng * cnt;
        prev.count += cnt;
      } else {
        byName.set(name, { latSum: lat * cnt, lngSum: lng * cnt, count: cnt });
      }
    }

    const regions: GeoRegion[] = Array.from(byName.entries())
      .map(([name, g]) => ({
        name,
        lat: g.count > 0 ? Math.round((g.latSum / g.count) * 10000) / 10000 : 0,
        lng: g.count > 0 ? Math.round((g.lngSum / g.count) * 10000) / 10000 : 0,
        count: g.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      regions,
      live: true,
    };
  } catch (error) {
    _logger.warn("[getPractitionerGeo] failed:", error);
    return { regions: [], live: false };
  }
}

// ─── Cohort Retention Heatmap ───────────────────────────────────────────

export interface CohortRetentionEntry {
  cohortWeek: string;
  cohortSize: number;
  w1Active: number;
  w2Active: number;
  w4Active: number;
}

export interface CohortRetentionData {
  cohorts: CohortRetentionEntry[];
  live: boolean;
}

export async function getCohortRetention(): Promise<CohortRetentionData> {
  try {
    // Standard cohort retention query over last 5 weeks.
    // Note: user_interactions uses `timestamp`, not `created_at`.
    const result = await executeQuery<{
      cohort_week: string | Date;
      cohort_size: number;
      w1_active: number;
      w2_active: number;
      w4_active: number;
    }>(
      `WITH cohorts AS (
         SELECT
           id AS user_id,
           date_trunc('week', created_at) AS cohort_week,
           created_at
         FROM users
         WHERE is_active = true
       ),
       activity AS (
         SELECT user_id, created_at AS activity_time FROM token_transactions
         UNION
         SELECT user_id, created_at AS activity_time FROM user_interactions
         UNION
         SELECT actor_id AS user_id, created_at AS activity_time FROM feed_events WHERE actor_id IS NOT NULL
         UNION
         SELECT user_id, created_at AS activity_time FROM user_recipe_interactions
         UNION
         SELECT u.id AS user_id, a.created_at AS activity_time FROM auth_events a JOIN users u ON u.email = a.email
       )
       SELECT
         c.cohort_week,
         COUNT(DISTINCT c.user_id)::int AS cohort_size,
         COUNT(DISTINCT CASE WHEN a.activity_time >= c.created_at + INTERVAL '1 day' AND a.activity_time < c.created_at + INTERVAL '7 days' THEN c.user_id END)::int AS w1_active,
         COUNT(DISTINCT CASE WHEN a.activity_time >= c.created_at + INTERVAL '7 days' AND a.activity_time < c.created_at + INTERVAL '14 days' THEN c.user_id END)::int AS w2_active,
         COUNT(DISTINCT CASE WHEN a.activity_time >= c.created_at + INTERVAL '14 days' AND a.activity_time < c.created_at + INTERVAL '30 days' THEN c.user_id END)::int AS w4_active
       FROM cohorts c
       LEFT JOIN activity a ON c.user_id = a.user_id
       GROUP BY c.cohort_week
       ORDER BY c.cohort_week DESC
       LIMIT 5`
    );

    const cohorts: CohortRetentionEntry[] = result.rows.map((row) => ({
      cohortWeek: new Date(row.cohort_week).toISOString(),
      cohortSize: Number(row.cohort_size),
      w1Active: Number(row.w1_active),
      w2Active: Number(row.w2_active),
      w4Active: Number(row.w4_active),
    }));

    return {
      cohorts,
      live: true,
    };
  } catch (error) {
    _logger.warn("[getCohortRetention] failed:", error);
    return { cohorts: [], live: false };
  }
}

// ─── ESMS · Alchemical Distribution (read_model + user_profiles) ───────

export interface SemsAxisStats {
  key: "Spirit" | "Essence" | "Matter" | "Substance";
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  /** 8 histogram bins across [0, 1] */
  bins: number[];
}

export interface SemsDistributionData {
  recipeCount: number;
  axes: SemsAxisStats[];
  aSharpMean: number;
  harmonyMean: number;
  elementalMeans: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  monicaCalibration: {
    calibratedProfiles: number;
    meanConstant: number;
    methods: Array<{ method: string; count: number }>;
  };
  live: boolean;
}

const SEMS_FALLBACK: SemsDistributionData = {
  recipeCount: 0,
  axes: [],
  aSharpMean: 0,
  harmonyMean: 0,
  elementalMeans: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
  monicaCalibration: { calibratedProfiles: 0, meanConstant: 0, methods: [] },
  live: false,
};

export async function getSemsDistribution(): Promise<SemsDistributionData> {
  try {
    const [recipesRes, monicaRes] = await Promise.all([
      executeQuery<{
        spirit: number;
        essence: number;
        matter: number;
        substance: number;
        a_sharp: number;
        match_rate: number;
        fire: number;
        water: number;
        earth: number;
        air: number;
      }>(`
        SELECT
          COALESCE((read_model->'alchemical_quantities'->>'spirit')::float8, 0) AS spirit,
          COALESCE((read_model->'alchemical_quantities'->>'essence')::float8, 0) AS essence,
          COALESCE((read_model->'alchemical_quantities'->>'matter')::float8, 0) AS matter,
          COALESCE((read_model->'alchemical_quantities'->>'substance')::float8, 0) AS substance,
          COALESCE((read_model->'alchemical_quantities'->>'totalASharp')::float8, 0) AS a_sharp,
          COALESCE((read_model->'alchemical_quantities'->>'matchRate')::float8, 0) AS match_rate,
          COALESCE((read_model->'elemental_properties'->>'fire')::float8, 0) AS fire,
          COALESCE((read_model->'elemental_properties'->>'water')::float8, 0) AS water,
          COALESCE((read_model->'elemental_properties'->>'earth')::float8, 0) AS earth,
          COALESCE((read_model->'elemental_properties'->>'air')::float8, 0) AS air
        FROM recipes
        WHERE read_model->'alchemical_quantities' IS NOT NULL
      `),
      executeQuery<{
        method: string;
        cnt: number;
        avg_const: number | null;
      }>(`
        SELECT
          COALESCE(NULLIF(monica_method, ''), 'uncalibrated') AS method,
          COUNT(*)::int AS cnt,
          AVG(monica_constant)::float8 AS avg_const
        FROM user_profiles
        WHERE monica_constant IS NOT NULL
        GROUP BY COALESCE(NULLIF(monica_method, ''), 'uncalibrated')
        ORDER BY cnt DESC
      `),
    ]);

    const { rows } = recipesRes;
    const n = rows.length;
    if (n === 0) return SEMS_FALLBACK;

    const buildAxis = (
      key: SemsAxisStats["key"],
      pick: (r: (typeof rows)[number]) => number,
    ): SemsAxisStats => {
      const vals = rows.map((r) => Number(pick(r) || 0));
      const sum = vals.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const variance = vals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
      const stdDev = Math.sqrt(variance);
      let min = Infinity;
      let max = -Infinity;
      for (const v of vals) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const span = Math.max(0.0001, max - min);
      const bins = [0, 0, 0, 0, 0, 0, 0, 0];
      for (const v of vals) {
        const idx = Math.min(7, Math.max(0, Math.floor(((v - min) / span) * 8)));
        bins[idx] = (bins[idx] ?? 0) + 1;
      }
      return {
        key,
        mean: Math.round(mean * 1000) / 1000,
        stdDev: Math.round(stdDev * 1000) / 1000,
        min: Math.round(min * 1000) / 1000,
        max: Math.round(max * 1000) / 1000,
        bins,
      };
    };

    const axes: SemsAxisStats[] = [
      buildAxis("Spirit", (r) => r.spirit),
      buildAxis("Essence", (r) => r.essence),
      buildAxis("Matter", (r) => r.matter),
      buildAxis("Substance", (r) => r.substance),
    ];

    const avgOf = (pick: (r: (typeof rows)[number]) => number) =>
      Math.round((rows.reduce((s, r) => s + Number(pick(r) || 0), 0) / n) * 1000) / 1000;

    let totalCalibrated = 0;
    let weightedConstSum = 0;
    const methods: Array<{ method: string; count: number }> = [];
    for (const m of monicaRes.rows) {
      const cnt = Number(m.cnt || 0);
      totalCalibrated += cnt;
      weightedConstSum += cnt * Number(m.avg_const ?? 0);
      methods.push({ method: String(m.method), count: cnt });
    }

    return {
      recipeCount: n,
      axes,
      aSharpMean: avgOf((r) => r.a_sharp),
      harmonyMean: avgOf((r) => r.match_rate),
      elementalMeans: {
        Fire: avgOf((r) => r.fire),
        Water: avgOf((r) => r.water),
        Earth: avgOf((r) => r.earth),
        Air: avgOf((r) => r.air),
      },
      monicaCalibration: {
        calibratedProfiles: totalCalibrated,
        meanConstant:
          totalCalibrated > 0
            ? Math.round((weightedConstSum / totalCalibrated) * 1000) / 1000
            : 0,
        methods,
      },
      live: true,
    };
  } catch (error) {
    _logger.warn("[getSemsDistribution] failed:", error);
    return SEMS_FALLBACK;
  }
}

// ─── Route Heatmap & Canonical Route Telemetry ─────────────────────────

export interface RouteHeatmapEntry {
  path: string;
  /** 12 2-hour buckets across the trailing window, oldest to newest */
  buckets: number[];
  totalRequests: number;
  p95Ms: number | null;
  errors5xx: number;
  errors4xx: number;
}

export interface CanonicalRouteStats {
  path: string;
  views7d: number;
  visitors7d: number;
  apiCalls7d: number;
  p95Ms: number | null;
  errorRate5xx: number;
}

export interface RouteHeatmapData {
  windowHours: number;
  bucketLabels: string[];
  routes: RouteHeatmapEntry[];
  canonicalRoutes: CanonicalRouteStats[];
  live: boolean;
}

export async function getRouteHeatmap(): Promise<RouteHeatmapData> {
  const bucketLabels = [
    "-22h", "-20h", "-18h", "-16h", "-14h", "-12h",
    "-10h", "-8h", "-6h", "-4h", "-2h", "now",
  ];
  try {
    const [topRoutesRes, bucketsRes, pageViewsRes] = await Promise.all([
      executeQuery<{
        path: string;
        total: number;
        p95_ms: number | null;
        err_5xx: number;
        err_4xx: number;
      }>(`
        SELECT
          path,
          COUNT(*)::int AS total,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)
            FILTER (WHERE latency_ms IS NOT NULL) AS p95_ms,
          COUNT(*) FILTER (WHERE status >= 500)::int AS err_5xx,
          COUNT(*) FILTER (WHERE status >= 400 AND status < 500)::int AS err_4xx
        FROM request_log_entries
        WHERE at >= NOW() - INTERVAL '7 days'
        GROUP BY path
        ORDER BY total DESC
        LIMIT 8
      `),
      executeQuery<{
        path: string;
        slot: number;
        cnt: number;
      }>(`
        SELECT
          path,
          LEAST(11, GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - at)) / 7200)::int)) AS slot,
          COUNT(*)::int AS cnt
        FROM request_log_entries
        WHERE at >= NOW() - INTERVAL '24 hours'
        GROUP BY path, slot
      `),
      executeQuery<{
        path: string;
        views: number;
        visitors: number;
      }>(`
        SELECT
          path,
          COUNT(*)::int AS views,
          COUNT(DISTINCT COALESCE(user_id::text, visitor_hash))::int AS visitors
        FROM page_views
        WHERE at >= NOW() - INTERVAL '7 days'
        GROUP BY path
      `),
    ]);

    const bucketMap = new Map<string, number[]>();
    for (const r of bucketsRes.rows) {
      const p = String(r.path);
      if (!bucketMap.has(p)) {
        bucketMap.set(p, Array.from({ length: 12 }, () => 0));
      }
      const arr = bucketMap.get(p)!;
      const idx = 11 - Number(r.slot);
      if (idx >= 0 && idx < 12) {
        arr[idx] = (arr[idx] ?? 0) + Number(r.cnt);
      }
    }

    const routes: RouteHeatmapEntry[] = topRoutesRes.rows.map((r) => {
      const p = String(r.path);
      return {
        path: p,
        buckets: bucketMap.get(p) ?? Array.from({ length: 12 }, () => 0),
        totalRequests: Number(r.total),
        p95Ms: r.p95_ms !== null && r.p95_ms !== undefined ? Math.round(Number(r.p95_ms)) : null,
        errors5xx: Number(r.err_5xx),
        errors4xx: Number(r.err_4xx),
      };
    });

    const pvMap = new Map<string, { views: number; visitors: number }>();
    for (const r of pageViewsRes.rows) {
      pvMap.set(String(r.path), {
        views: Number(r.views),
        visitors: Number(r.visitors),
      });
    }

    const reqMap = new Map<
      string,
      { total: number; p95Ms: number | null; err5xx: number }
    >();
    for (const r of topRoutesRes.rows) {
      reqMap.set(String(r.path), {
        total: Number(r.total),
        p95Ms: r.p95_ms !== null && r.p95_ms !== undefined ? Math.round(Number(r.p95_ms)) : null,
        err5xx: Number(r.err_5xx),
      });
    }

    const canonicalDefs: Array<{ path: string; apiMatch?: string }> = [
      { path: "/", apiMatch: "/api/personalized-recommendations" },
      { path: "/recipes", apiMatch: "/api/recipes" },
      { path: "/cuisines", apiMatch: "/api/cuisines/recommend" },
      { path: "/ingredients" },
      { path: "/cooking-methods" },
      { path: "/planetary-chart" },
      { path: "/alchemical-pillars" },
      { path: "/menu-planner" },
      { path: "/food-diary" },
      { path: "/profile" },
      { path: "/onboarding", apiMatch: "/api/onboarding" },
      { path: "/quantities", apiMatch: "/api/generate-cosmic-recipe" },
    ];

    const canonicalRoutes: CanonicalRouteStats[] = canonicalDefs.map((def) => {
      const pv = pvMap.get(def.path) ?? { views: 0, visitors: 0 };
      const api = def.apiMatch ? reqMap.get(def.apiMatch) : undefined;
      return {
        path: def.path,
        views7d: pv.views,
        visitors7d: pv.visitors,
        apiCalls7d: api?.total ?? 0,
        p95Ms: api?.p95Ms ?? null,
        errorRate5xx:
          api && api.total > 0
            ? Math.round((api.err5xx / api.total) * 10000) / 100
            : 0,
      };
    });

    return {
      windowHours: 24,
      bucketLabels,
      routes,
      canonicalRoutes,
      live: true,
    };
  } catch (error) {
    _logger.warn("[getRouteHeatmap] failed:", error);
    return {
      windowHours: 24,
      bucketLabels,
      routes: [],
      canonicalRoutes: [],
      live: false,
    };
  }
}
