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

    const minted = Number(flowRes.rows[0]?.minted ?? 0);
    const burned = Number(flowRes.rows[0]?.burned ?? 0);
    const sinkRows = sinksRes.rows as Array<{ source_type: string; amount: number }>;
    const sourceRows = sourcesRes.rows as Array<{ source_type: string; amount: number }>;
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
      sources24h: sourceRows.map((r) => ({
        source: String(r.source_type),
        amount: Number(r.amount),
      })),
      flowSeries,
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

    const dbSlowQueries = (slowRes.rows || []).map((r) => ({
      query: String(r.query ?? "").trim(),
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

    return {
      pool,
      dbSizeBytes: Number(sizeRes.rows[0]?.bytes ?? 0),
      activeConnections: Number(connRes.rows[0]?.count ?? 0),
      slowQueries: finalSlowQueries,
      slowQueryThresholdMs,
      tables: tableRows.map((r) => ({
        name: String(r.name),
        rows: Math.round(Number(r.rows ?? 0)),
        sizeBytes: Number(r.size_bytes ?? 0),
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
  /** Short sha of the running deploy (Vercel build env), or "—" when the
   *  deploy identity is unknown. NOT process uptime — a recycled lambda
   *  restarts the clock without a deploy, so uptime says nothing about
   *  deploy freshness. */
  deployFreshness: string;
}

/**
 * Live platform health for the dashboard's top-bar pulse strip. Latency and
 * error rate come from the in-memory request log (`summarizeRecent`), DB
 * reachability from a health probe, and deploy identity from the Vercel build
 * env. No external uptime/APM service is required — degraded signals lower
 * the score rather than failing the panel.
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

  const deploySha = process.env.VERCEL_GIT_COMMIT_SHA;

  return {
    state,
    score,
    availability,
    activeIncidents,
    p95: summary.p95LatencyMs,
    errRate,
    deployFreshness: deploySha ? `sha ${deploySha.slice(0, 7)}` : "—",
  };
}

// ─── Enriched Telemetry Getters ────────────────────────────────────────

export interface EnginePerformanceData {
  clickToCookRate: number;
  totalCalculations: number;
  averageLatencyMs: number;
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

export interface CommerceSummaryData {
  mrr: number;
  /** Stripe-backed subs — actual paying customers. */
  paidSubs: number;
  /** Premium subs with no Stripe link — provisioned/agent accounts, $0 revenue. */
  provisionedSubs: number;
  recentOrders: Array<{
    id: string;
    user: string;
    type: string;
    amount: number;
    age: string;
    status: string;
  }>;
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
    const [interactionsRes, calculationsRes] = await Promise.all([
      executeQuery(`
        SELECT 
          COUNT(*) FILTER (WHERE interaction_type = 'recipe_cook')::float8 AS cook_count,
          COUNT(*) FILTER (WHERE interaction_type = 'recipe_view')::float8 AS view_count
        FROM user_interactions;
      `),
      executeQuery(`
        SELECT 
          COUNT(*)::integer AS count,
          COALESCE(AVG(execution_time_ms), 0)::float8 AS avg_latency
        FROM user_calculations;
      `),
    ]);

    const cookCount = Number(interactionsRes.rows[0]?.cook_count ?? 0);
    const viewCount = Number(interactionsRes.rows[0]?.view_count ?? 0);
    const clickToCookRate = viewCount > 0 ? cookCount / viewCount : 0;

    const totalCalculations = Number(calculationsRes.rows[0]?.count ?? 0);
    const averageLatencyMs = Math.round(Number(calculationsRes.rows[0]?.avg_latency ?? 0));

    // Report real values — including zero — never a fabricated placeholder.
    return {
      clickToCookRate,
      totalCalculations,
      averageLatencyMs,
      live: true,
    };
  } catch (error) {
    _logger.error("[getEnginePerformance] failed:", error);
    return {
      clickToCookRate: 0,
      totalCalculations: 0,
      averageLatencyMs: 0,
      live: false,
    };
  }
}

export async function getPractitionerCohorts(): Promise<PractitionerCohortsData> {
  try {
    // Read onboarding + elemental signature from the canonical user_profiles
    // columns, NOT the vestigial users.profile JSONB (which rowToUserWithProfile
    // never reads back). The JSONB lagged reality badly — it showed ~61
    // "onboarded" and a 99.6%-"Unknown" elemental split, while the normalized
    // columns give the honest counts the rest of the dashboard already uses.
    // paidPro comes from the same revenue breakdown that drives the Commerce
    // MRR panel, so "Paid Pro" can never again contradict "MRR $0" by counting
    // the ~950 comp/provisioned premium accounts as conversions.
    const [totalUsersRes, onboardedRes, activeRes, firstCookRes, revenue, elementalRes] = await Promise.all([
      executeQuery("SELECT COUNT(*)::integer AS count FROM users"),
      executeQuery("SELECT COUNT(*)::integer AS count FROM user_profiles WHERE onboarding_completed = true"),
      executeQuery("SELECT COUNT(*)::integer AS count FROM users WHERE is_active = true"),
      executeQuery("SELECT COUNT(DISTINCT user_id)::integer AS count FROM user_interactions WHERE interaction_type = 'recipe_cook'"),
      getSubscriptionRevenueBreakdown().catch(() => ({ paidSubs: 0, provisionedSubs: 0, mrr: 0 })),
      executeQuery(`
        SELECT
          COALESCE(dominant_element, 'Unknown') AS element,
          COUNT(*)::integer AS count
        FROM user_profiles
        WHERE dominant_element IS NOT NULL
        GROUP BY element
      `),
    ]);

    const signup = Number(totalUsersRes.rows[0]?.count ?? 0);
    const onboarded = Number(onboardedRes.rows[0]?.count ?? 0);
    const active = Number(activeRes.rows[0]?.count ?? 0);
    const firstCook = Number(firstCookRes.rows[0]?.count ?? 0);
    const paidPro = Number(revenue.paidSubs ?? 0);

    const elementalBreakdown = (elementalRes.rows as Array<{ element: string; count: number }>).map((r) => ({
      element: String(r.element),
      count: Number(r.count),
    }));

    return {
      funnel: {
        // Landing-page traffic isn't instrumented yet, so the funnel starts
        // at the first measured stage (signup) rather than a fabricated top.
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
    // Any sub-source failure must flip `live` — a caught-to-zero MRR or a
    // caught-to-[] order list under `live: true` is fabricated data.
    let revenueLive = true;
    let ordersLive = true;
    const [revenue, ordersRes] = await Promise.all([
      getSubscriptionRevenueBreakdown().catch((err) => {
        revenueLive = false;
        _logger.warn("[getCommerceTelemetry] revenue breakdown failed:", err);
        return { paidSubs: 0, provisionedSubs: 0, mrr: 0 };
      }),
      // Coded to the DEPLOYED cart_handoff_intents schema, which has drifted
      // from database/init/24: the live table has a real `status` column and
      // NO estimated_total (the init file has the inverse), so the previous
      // `'fulfilled' AS status` was fabricated AND the column reference made
      // the whole statement unpreparable in production. A handoff row is an
      // intent, not an order — the user pays Amazon, not us — so its
      // on-platform transacted amount is a true 0, not a placeholder.
      // `u.id::text = r.user_id`: restaurant_order_intents.user_id is TEXT
      // while users.id is uuid, and `uuid = text` has no operator — uncast,
      // this arm never prepared either.
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
        ORDER BY created_at DESC
        LIMIT 5;
      `).catch((err) => {
        ordersLive = false;
        _logger.warn("[getCommerceTelemetry] order-intents query failed:", err);
        return { rows: [] };
      }),
    ]);

    const { paidSubs, provisionedSubs, mrr } = revenue;

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

    // Real MRR (Stripe-backed subs × price) and real cart/order intents —
    // including empty — never a fabricated placeholder order.
    return {
      mrr,
      paidSubs,
      provisionedSubs,
      recentOrders,
      live: revenueLive && ordersLive,
    };
  } catch (error) {
    _logger.error("[getCommerceTelemetry] failed:", error);
    return {
      mrr: 0,
      paidSubs: 0,
      provisionedSubs: 0,
      recentOrders: [],
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
      .then((res) => Number(res.rows[0]?.count ?? 0))
      .catch((err) => {
        allLive = false;
        _logger.warn(`[getPageTelemetry] ${label} count failed:`, err);
        return 0;
      });

  const [foodDiary, customRecipes, restaurants, commensals, mealPlans, natalCharts] =
    await Promise.all([
      countOf("SELECT COUNT(*)::integer AS count FROM food_diary_entries", "food_diary_entries"),
      countOf("SELECT COUNT(*)::integer AS count FROM recipes WHERE is_public = false", "custom recipes"),
      countOf("SELECT COUNT(*)::integer AS count FROM restaurants", "restaurants"),
      countOf("SELECT COUNT(*)::integer AS count FROM manual_companion_charts", "manual_companion_charts"),
      countOf("SELECT COUNT(*)::integer AS count FROM user_meal_plans", "user_meal_plans"),
      // There is no natal_charts TABLE — computed charts live in the
      // user_profiles.natal_chart JSONB column, with '{}' meaning "not yet
      // computed" (same predicate as onboardingHealthService's funnel).
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
    // DERIVED from the src/data cuisines registry (the catalog source of
    // truth) — there is no cuisines DB table. A static count cannot fail,
    // so it does not participate in `live`.
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
  /** Cooked-it dish cards posted in the trailing 7 days. */
  cookedPostsWeek: number;
  /** Distinct users whose feed_visit practice fired today. */
  feedDauToday: number;
  live: boolean;
}

/**
 * The composite scorecard for the Living Economy release: affiliate-funnel
 * top (handoffs), the cook→share flywheel (dish cards), and social pull
 * (feed DAU via the practice ledger). Never throws.
 */
export async function getLivingEconomyMetrics(): Promise<LivingEconomyMetrics> {
  try {
    const result = await executeQuery<{
      affiliate_clicks: string;
      cooked_posts: string;
      feed_dau: string;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM cart_handoff_intents
           WHERE created_at >= now() - interval '7 days') AS affiliate_clicks,
         (SELECT COUNT(*) FROM feed_events
           WHERE event_type = 'made_it'
             AND metadata_payload->>'card' = 'cooked'
             AND created_at >= now() - interval '7 days') AS cooked_posts,
         (SELECT COUNT(DISTINCT user_id) FROM practice_events
           WHERE practice_type = 'feed_visit'
             AND created_at >= CURRENT_DATE) AS feed_dau`,
    );
    const [row] = result.rows;
    return {
      affiliateClicksWeek: Number(row?.affiliate_clicks ?? 0),
      cookedPostsWeek: Number(row?.cooked_posts ?? 0),
      feedDauToday: Number(row?.feed_dau ?? 0),
      live: true,
    };
  } catch (error) {
    _logger.warn("[getLivingEconomyMetrics] failed:", error);
    return { affiliateClicksWeek: 0, cookedPostsWeek: 0, feedDauToday: 0, live: false };
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

    const [countsRow] = counts.rows;
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
          author: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || "unknown",
          // Vercel exposes no deploy timestamp env, so the age is the deploy's
          // identity, not a fabricated duration.
          age: "current",
          message: process.env.VERCEL_GIT_COMMIT_MESSAGE || "unknown",
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
       LIMIT 10`
    );

    const regions: GeoRegion[] = result.rows.map((row) => {
      let name = row.tz ? row.tz.split("/").pop()?.replace(/_/g, " ") ?? "Unknown" : "Unknown";
      if (name === "Unknown" && Number(row.lat) === 40.6782 && Number(row.lng) === -74.0059) {
        name = "New York";
      }
      return {
        name,
        lat: Number(row.lat),
        lng: Number(row.lng),
        count: Number(row.count),
      };
    });

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
    // Standard cohort retention query over last 5 weeks
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
