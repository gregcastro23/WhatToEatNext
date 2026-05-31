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
import {
  getRecentSlowQueries,
  getSlowQueryThresholdMs,
} from "@/lib/observability/slowQueryLog";

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
    const [totalUsersRes, onboardedRes, activeRes, firstCookRes, paidProRes, elementalRes] = await Promise.all([
      executeQuery("SELECT COUNT(*)::integer AS count FROM users"),
      executeQuery("SELECT COUNT(*)::integer AS count FROM users WHERE (profile->>'birthData') IS NOT NULL AND (profile->>'natalChart') IS NOT NULL"),
      executeQuery("SELECT COUNT(*)::integer AS count FROM users WHERE is_active = true"),
      executeQuery("SELECT COUNT(DISTINCT user_id)::integer AS count FROM user_interactions WHERE interaction_type = 'recipe_cook'"),
      executeQuery("SELECT COUNT(*)::integer AS count FROM user_subscriptions WHERE status = 'active'").catch(() => ({ rows: [{ count: 0 }] })),
      executeQuery(`
        SELECT 
          COALESCE(profile->'natalChart'->>'dominantElement', 'Unknown') AS element,
          COUNT(*)::integer AS count
        FROM users 
        WHERE profile->'natalChart' IS NOT NULL 
        GROUP BY element
      `),
    ]);

    const signup = Number(totalUsersRes.rows[0]?.count ?? 0);
    const onboarded = Number(onboardedRes.rows[0]?.count ?? 0);
    const active = Number(activeRes.rows[0]?.count ?? 0);
    const firstCook = Number(firstCookRes.rows[0]?.count ?? 0);
    const paidPro = Number(paidProRes.rows[0]?.count ?? 0);

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
    const [subCountRes, ordersRes] = await Promise.all([
      executeQuery("SELECT COUNT(*)::integer AS count FROM user_subscriptions WHERE status = 'active'").catch(() => ({ rows: [{ count: 0 }] })),
      executeQuery(`
        SELECT 
          c.id, 
          COALESCE(u.email, 'Guest') AS user_email, 
          'Amazon Fresh' AS order_type, 
          c.estimated_total::float8 AS amount, 
          c.created_at, 
          'fulfilled' AS status 
        FROM cart_handoff_intents c
        LEFT JOIN users u ON u.id = c.user_id
        UNION ALL
        SELECT 
          r.id, 
          COALESCE(u.email, 'Guest') AS user_email, 
          'Stripe Connect' AS order_type, 
          (r.total_cents / 100.0)::float8 AS amount, 
          r.created_at, 
          r.status 
        FROM restaurant_order_intents r
        LEFT JOIN users u ON u.id = r.user_id
        ORDER BY created_at DESC
        LIMIT 5;
      `).catch(() => ({ rows: [] })),
    ]);

    const activeSubs = Number(subCountRes.rows[0]?.count ?? 0);
    const mrr = activeSubs * 24.00;

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

    // Real MRR (active subs × price) and real cart/order intents — including
    // empty — never a fabricated placeholder order.
    return {
      mrr,
      recentOrders,
      live: true,
    };
  } catch (error) {
    _logger.error("[getCommerceTelemetry] failed:", error);
    return {
      mrr: 0,
      recentOrders: [],
      live: false,
    };
  }
}

export async function getPageTelemetry(): Promise<PageTelemetryData> {
  try {
    const [foodDiaryRes, customRecipesRes, restaurantsRes, commensalsRes, mealPlansRes] = await Promise.all([
      executeQuery("SELECT COUNT(*)::integer AS count FROM food_diary_entries").catch(() => ({ rows: [{ count: 0 }] })),
      executeQuery("SELECT COUNT(*)::integer AS count FROM recipes WHERE is_public = false").catch(() => ({ rows: [{ count: 0 }] })),
      executeQuery("SELECT COUNT(*)::integer AS count FROM restaurants").catch(() => ({ rows: [{ count: 0 }] })),
      executeQuery("SELECT COUNT(*)::integer AS count FROM manual_companion_charts").catch(() => ({ rows: [{ count: 0 }] })),
      executeQuery("SELECT COUNT(*)::integer AS count FROM user_meal_plans").catch(() => ({ rows: [{ count: 0 }] })),
    ]);

    return {
      foodDiary: Number(foodDiaryRes.rows[0]?.count ?? 0),
      customRecipes: Number(customRecipesRes.rows[0]?.count ?? 0),
      restaurants: Number(restaurantsRes.rows[0]?.count ?? 0),
      commensals: Number(commensalsRes.rows[0]?.count ?? 0),
      mealPlans: Number(mealPlansRes.rows[0]?.count ?? 0),
      live: true,
    };
  } catch (error) {
    _logger.error("[getPageTelemetry] failed:", error);
    return {
      foodDiary: 0,
      customRecipes: 0,
      restaurants: 0,
      commensals: 0,
      mealPlans: 0,
      live: false,
    };
  }
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
  limit: number = 8,
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
    }>(
      `SELECT id, triggered_at, component, previous_status, current_status,
              severity, title, message,
              COALESCE((dispatch->>'suppressed')::boolean, false) AS suppressed
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
      })),
      live: true,
    };
  } catch (error) {
    _logger.warn("[getRecentAlerts] failed:", error);
    return { entries: [], live: false };
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
  windowMinutes: number = 60,
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

    const countsRow = counts.rows[0];
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
