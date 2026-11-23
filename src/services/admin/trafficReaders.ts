/**
 * page_views readers behind /admin/traffic. Server-only. Every reader
 * excludes bots (`NOT is_bot`) except `readBots`, which counts them.
 *
 * Gracefully supports both migration 100 (view_id, duration_ms, last_seen_at,
 * ref_tag, interactions) and baseline migration 86 via `isMissingColumn`.
 *
 * @file src/services/admin/trafficReaders.ts
 */

import { z } from "zod";
import {
  classifyInteractionTag,
  isFrustrationOrPerfTag,
  isInteractiveRoute,
} from "@/lib/analytics/interactionClassify";
import { isMissingColumn, isMissingRelation } from "@/lib/database/pgErrors";
// Every query in this file goes through the per-instance admin cap (2 at a time),
// see `adminQueryLimiter.ts`; the local name is kept so call sites are unchanged.
import { executeAdminAnalyticsQuery as executeQuery } from "@/services/admin/adminQueryLimiter";
import type {
  ActivationStickinessSummary,
  ActiveReviewerAlert,
  CountRow,
  FrictionAlerts,
  InteractionCategorySummary,
  InteractionTallies,
  InteractionTallyRow,
  LabEngagementRow,
  PlannerFunnel,
  PlannerFunnelCohort,
  RecentPageView,
  RefTagRollup,
  RetentionCohortRow,
  RouteFlowMatrixRow,
  RouteFlowNextHop,
  SessionFeedbackItem,
  SessionFeedbackStatus,
  TrafficBucket,
  TrafficDimensions,
  TrafficTotals,
  VariantCohortRow,
  VariantConfidenceLabel,
  VisitorSession,
} from "@/services/admin/trafficTypes";

export { isInteractiveRoute };

const HUMAN = "NOT is_bot AND path <> '/admin' AND path NOT LIKE '/admin/%'";
const HUMAN_PV = "NOT pv.is_bot AND pv.path <> '/admin' AND pv.path NOT LIKE '/admin/%'";
export const ACTIVE_WINDOW_MINUTES = 5;
const LIVE_NOW_WINDOW_MS = 90_000; // 90 seconds
const STUCK_DWELL_MS = 45_000; // 45 seconds
const MAX_STEP_GAP_MS = 1_800_000; // 30 minutes
const ENGAGED_DWELL_MS = 15_000; // 15 seconds

export async function readMeta(): Promise<{ since: string | null; total: number }> {
  const res = await executeQuery<{ since: Date | null; total: number }>(
    `SELECT MIN(at) AS since, COUNT(*)::int AS total FROM page_views WHERE ${HUMAN}`,
  );
  const [row] = res.rows;
  return { since: row?.since ? new Date(row.since).toISOString() : null, total: Number(row?.total ?? 0) };
}

/** Totals for [from, to), where the bounds are SQL expressions over $1 = interval. */
export async function readTotals(fromSql: string, toSql: string, interval: string): Promise<TrafficTotals> {
  const window = `at >= ${fromSql} AND at < ${toSql}`;
  const basePromise = executeQuery<{ pageviews: number; visitors: number; sessions: number; signed_in: number }>(
    `SELECT COUNT(*)::int AS pageviews, COUNT(DISTINCT visitor_hash)::int AS visitors,
            COUNT(DISTINCT COALESCE(session_id, visitor_hash))::int AS sessions, COUNT(DISTINCT user_id)::int AS signed_in
       FROM page_views WHERE ${window} AND ${HUMAN}`,
    [interval],
  );

  const bouncePromise = executeQuery<{ sessions: number; bounced: number; avg_pages: number | null }>(
    `SELECT COUNT(*)::int AS sessions,
            COUNT(*) FILTER (WHERE n = 1 AND max_dur < ${ENGAGED_DWELL_MS} AND actions = 0)::int AS bounced,
            AVG(n)::float8 AS avg_pages
       FROM (SELECT COALESCE(session_id, visitor_hash) AS sid,
                    COUNT(*) AS n,
                    MAX(COALESCE(duration_ms, 0)) AS max_dur,
                    SUM(COALESCE(jsonb_array_length(interactions), 0)) AS actions
               FROM page_views
              WHERE ${window} AND ${HUMAN}
              GROUP BY 1) s`,
    [interval],
  ).catch(async (err: unknown) => {
    if (!isMissingColumn(err)) throw err;
    return executeQuery<{ sessions: number; bounced: number; avg_pages: number | null }>(
      `SELECT COUNT(*)::int AS sessions, COUNT(*) FILTER (WHERE n = 1)::int AS bounced,
              AVG(n)::float8 AS avg_pages
         FROM (SELECT COALESCE(session_id, visitor_hash) AS sid, COUNT(*) AS n FROM page_views
                WHERE ${window} AND ${HUMAN}
                GROUP BY 1) s`,
      [interval],
    );
  });

  const [base, bounce] = await Promise.all([basePromise, bouncePromise]);
  const [b] = base.rows;
  const [s] = bounce.rows;
  const sessions = Number(s?.sessions ?? 0);
  return {
    pageviews: Number(b?.pageviews ?? 0),
    visitors: Number(b?.visitors ?? 0),
    sessions: Number(b?.sessions ?? 0),
    signedInUsers: Number(b?.signed_in ?? 0),
    bounceRate: sessions > 0 ? Number(s?.bounced ?? 0) / sessions : null,
    pagesPerSession: sessions > 0 && s?.avg_pages != null ? Number(s.avg_pages) : null,
  };
}

async function readCounts(column: string, interval: string, limit: number, extraWhere = ""): Promise<CountRow[]> {
  const res = await executeQuery<{ label: string | null; count: number; visitors: number }>(
    `SELECT ${column} AS label, COUNT(*)::int AS count, COUNT(DISTINCT visitor_hash)::int AS visitors
       FROM page_views
      WHERE at >= NOW() - $1::interval AND ${HUMAN} ${extraWhere}
      GROUP BY 1 ORDER BY count DESC LIMIT ${limit}`,
    [interval],
  );
  return res.rows.map((r) => ({ label: r.label ?? "(unknown)", count: Number(r.count), visitors: Number(r.visitors) }));
}

export async function readTopPages(interval: string): Promise<CountRow[]> {
  return readCounts("path", interval, 15);
}

export async function readDimensions(interval: string): Promise<TrafficDimensions> {
  const [referrers, utmSources, countries, devices, browsers, operatingSystems] = await Promise.all([
    readCounts("COALESCE(referrer_host, '(direct)')", interval, 12),
    readCounts("COALESCE(ref_tag, utm_source)", interval, 10, "AND COALESCE(ref_tag, utm_source) IS NOT NULL").catch(
      (err: unknown) => {
        if (!isMissingColumn(err)) throw err;
        return readCounts("utm_source", interval, 10, "AND utm_source IS NOT NULL");
      },
    ),
    readCounts("COALESCE(country, '(unknown)')", interval, 15),
    readCounts("device_type", interval, 5),
    readCounts("COALESCE(browser, '(other)')", interval, 8),
    readCounts("COALESCE(os, '(other)')", interval, 8),
  ]);
  return { referrers, utmSources, countries, devices, browsers, operatingSystems };
}

export async function readActiveNow(): Promise<{ visitors: number; pages: CountRow[] }> {
  const queryWithLastSeen = async (): Promise<{ visitors: number; pages: CountRow[] }> => {
    const recent = `COALESCE(last_seen_at, at) >= NOW() - INTERVAL '${ACTIVE_WINDOW_MINUTES} minutes' AND ${HUMAN}`;
    const [visitors, pages] = await Promise.all([
      executeQuery<{ n: number }>(`SELECT COUNT(DISTINCT visitor_hash)::int AS n FROM page_views WHERE ${recent}`),
      executeQuery<{ label: string; count: number }>(
        `SELECT path AS label, COUNT(DISTINCT visitor_hash)::int AS count FROM page_views
          WHERE ${recent} GROUP BY path ORDER BY count DESC LIMIT 8`,
      ),
    ]);
    return {
      visitors: Number(visitors.rows[0]?.n ?? 0),
      pages: pages.rows.map((r) => ({ label: r.label, count: Number(r.count) })),
    };
  };

  try {
    return await queryWithLastSeen();
  } catch (err) {
    if (!isMissingColumn(err)) throw err;
    const recent = `at >= NOW() - INTERVAL '${ACTIVE_WINDOW_MINUTES} minutes' AND ${HUMAN}`;
    const [visitors, pages] = await Promise.all([
      executeQuery<{ n: number }>(`SELECT COUNT(DISTINCT visitor_hash)::int AS n FROM page_views WHERE ${recent}`),
      executeQuery<{ label: string; count: number }>(
        `SELECT path AS label, COUNT(DISTINCT visitor_hash)::int AS count FROM page_views
          WHERE ${recent} GROUP BY path ORDER BY count DESC LIMIT 8`,
      ),
    ]);
    return {
      visitors: Number(visitors.rows[0]?.n ?? 0),
      pages: pages.rows.map((r) => ({ label: r.label, count: Number(r.count) })),
    };
  }
}

/** New York wall-clock bucket keys, oldest first, so empty buckets render as 0. */
export function bucketKeys(unit: "hour" | "day", count: number, now: Date): string[] {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const stepMs = unit === "hour" ? 3_600_000 : 86_400_000;
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const parts = fmt.formatToParts(new Date(now.getTime() - i * stepMs));
    const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? "00";
    const day = `${get("year")}-${get("month")}-${get("day")}`;
    keys.push(unit === "hour" ? `${day}T${get("hour")}` : day);
  }
  return [...new Set(keys)];
}

export async function readSeries(
  interval: string,
  unit: "hour" | "day",
  count: number,
  now: Date,
): Promise<TrafficBucket[]> {
  const pattern = unit === "hour" ? 'YYYY-MM-DD"T"HH24' : "YYYY-MM-DD";
  const res = await executeQuery<{ key: string; pageviews: number; visitors: number }>(
    `SELECT to_char(date_trunc('${unit}', at AT TIME ZONE 'America/New_York'), '${pattern}') AS key,
            COUNT(*)::int AS pageviews, COUNT(DISTINCT visitor_hash)::int AS visitors
       FROM page_views WHERE at >= NOW() - $1::interval AND ${HUMAN}
      GROUP BY 1 ORDER BY 1`,
    [interval],
  );
  const byKey = new Map(res.rows.map((r) => [r.key, r]));
  return bucketKeys(unit, count, now).map((key) => ({
    key,
    pageviews: Number(byKey.get(key)?.pageviews ?? 0),
    visitors: Number(byKey.get(key)?.visitors ?? 0),
  }));
}

/** Landing page per session — where visits start. */
export async function readEntryPages(interval: string): Promise<CountRow[]> {
  const res = await executeQuery<{ label: string; count: number }>(
    `SELECT path AS label, COUNT(*)::int AS count
       FROM (SELECT DISTINCT ON (COALESCE(session_id, visitor_hash))
                    COALESCE(session_id, visitor_hash) AS sid, path
               FROM page_views
              WHERE at >= NOW() - $1::interval AND ${HUMAN}
              ORDER BY COALESCE(session_id, visitor_hash), at ASC) s
      GROUP BY path ORDER BY count DESC LIMIT 10`,
    [interval],
  );
  return res.rows.map((r) => ({ label: r.label, count: Number(r.count) }));
}

export async function readBots(interval: string): Promise<number> {
  const res = await executeQuery<{ n: number }>(
    `SELECT COUNT(*)::int AS n FROM page_views WHERE at >= NOW() - $1::interval AND is_bot`,
    [interval],
  );
  return Number(res.rows[0]?.n ?? 0);
}

interface RefRollupRow {
  ref_tag: string;
  visitors: number;
  sessions: number;
  pageviews: number;
  engaged_sessions: number;
  median_dwell_ms: number | null;
  avg_pages: number | null;
  signed_in_users: number;
}

/**
 * Per-tag attribution rollup (?ref=) for campaign and feedback links.
 */
export async function readRefRollups(interval: string): Promise<RefTagRollup[]> {
  try {
    const res = await executeQuery<RefRollupRow>(
      `WITH s AS (
         SELECT ref_tag,
                COALESCE(session_id, visitor_hash) AS sid,
                MAX(visitor_hash) AS visitor_hash,
                MAX(user_id) AS user_id,
                COUNT(*)::int AS pages,
                GREATEST(
                  SUM(COALESCE(duration_ms, 0))::int,
                  (EXTRACT(EPOCH FROM (MAX(COALESCE(last_seen_at, at)) - MIN(at))) * 1000)::int
                ) AS dur_ms,
                SUM(COALESCE(jsonb_array_length(interactions), 0))::int AS actions
           FROM page_views
          WHERE at >= NOW() - $1::interval
            AND ${HUMAN}
            AND ref_tag IS NOT NULL
          GROUP BY ref_tag, COALESCE(session_id, visitor_hash)
       )
       SELECT ref_tag,
              COUNT(DISTINCT visitor_hash)::int AS visitors,
              COUNT(*)::int AS sessions,
              SUM(pages)::int AS pageviews,
              COUNT(*) FILTER (WHERE pages > 1 OR dur_ms >= ${ENGAGED_DWELL_MS} OR actions > 0)::int AS engaged_sessions,
              PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY dur_ms)::float8 AS median_dwell_ms,
              AVG(pages)::float8 AS avg_pages,
              COUNT(DISTINCT user_id)::int AS signed_in_users
         FROM s
        GROUP BY ref_tag
        ORDER BY sessions DESC, pageviews DESC
        LIMIT 12`,
      [interval],
    );
    return res.rows.map((r) => {
      const sessions = Number(r.sessions);
      const engagedSessions = Number(r.engaged_sessions);
      return {
        refTag: r.ref_tag,
        visitors: Number(r.visitors),
        sessions,
        pageviews: Number(r.pageviews),
        engagedSessions,
        engagedRate: sessions > 0 ? engagedSessions / sessions : 0,
        medianDwellMs: Math.round(Number(r.median_dwell_ms ?? 0)),
        avgPagesPerSession: Number(r.avg_pages ?? 0),
        signedInUsers: Number(r.signed_in_users),
      };
    });
  } catch (err) {
    if (isMissingColumn(err)) return [];
    throw err;
  }
}

interface FunnelCohortRow {
  cohort: string;
  landed: number;
  generated: number;
  refined: number;
  converted: number;
}

/**
 * Step-by-step Menu Planner -> Cart conversion funnel & side-by-side cohort
 * comparison over the selected interval.
 */
export async function readPlannerFunnel(interval: string): Promise<PlannerFunnel> {
  try {
    const res = await executeQuery<FunnelCohortRow>(
      `WITH s AS (
         SELECT COALESCE(session_id, visitor_hash) AS sid,
                (ARRAY_AGG(path ORDER BY at ASC))[1] AS entry_path,
                MAX(ref_tag) AS ref_tag,
                BOOL_OR(
                  path IN ('/menu-planner', '/meal-plan')
                  OR path LIKE '/menu-planner/%'
                  OR EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(interactions) AS act
                     WHERE act LIKE 'plan:%' OR act LIKE 'planner:%'
                  )
                ) AS landed,
                BOOL_OR(
                  EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(interactions) AS act
                     WHERE act IN ('plan:fill_week', 'plan:fill_day')
                        OR act LIKE 'planner:draft-week:%'
                        OR act LIKE 'planner:ingredient-plan:%'
                  )
                ) AS generated,
                BOOL_OR(
                  EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(interactions) AS act
                     WHERE act LIKE 'plan:swap_meal:%'
                        OR act LIKE 'plan:filter_element:%'
                  )
                ) AS refined,
                BOOL_OR(
                  EXISTS (
                    SELECT 1 FROM jsonb_array_elements_text(interactions) AS act
                     WHERE act LIKE 'plan:grocery_export:%'
                        OR act IN ('conversion:cart_handoff', 'conversion:amazon_cart')
                  )
                ) AS converted
           FROM page_views
          WHERE at >= NOW() - $1::interval AND ${HUMAN}
          GROUP BY 1
       )
       SELECT 'all' AS cohort,
              COUNT(*) FILTER (WHERE landed)::int AS landed,
              COUNT(*) FILTER (WHERE landed AND (generated OR refined OR converted))::int AS generated,
              COUNT(*) FILTER (WHERE landed AND (refined OR converted))::int AS refined,
              COUNT(*) FILTER (WHERE landed AND converted)::int AS converted
         FROM s
       UNION ALL
       SELECT 'Via ?ref= Share Link' AS cohort,
              COUNT(*) FILTER (WHERE landed AND ref_tag IS NOT NULL)::int,
              COUNT(*) FILTER (WHERE landed AND ref_tag IS NOT NULL AND (generated OR refined OR converted))::int,
              COUNT(*) FILTER (WHERE landed AND ref_tag IS NOT NULL AND (refined OR converted))::int,
              COUNT(*) FILTER (WHERE landed AND ref_tag IS NOT NULL AND converted)::int
         FROM s
       UNION ALL
       SELECT 'Direct / Organic' AS cohort,
              COUNT(*) FILTER (WHERE landed AND ref_tag IS NULL)::int,
              COUNT(*) FILTER (WHERE landed AND ref_tag IS NULL AND (generated OR refined OR converted))::int,
              COUNT(*) FILTER (WHERE landed AND ref_tag IS NULL AND (refined OR converted))::int,
              COUNT(*) FILTER (WHERE landed AND ref_tag IS NULL AND converted)::int
         FROM s
       UNION ALL
       SELECT 'Entry: /menu-planner' AS cohort,
              COUNT(*) FILTER (WHERE landed AND entry_path LIKE '/menu-planner%')::int,
              COUNT(*) FILTER (WHERE landed AND entry_path LIKE '/menu-planner%' AND (generated OR refined OR converted))::int,
              COUNT(*) FILTER (WHERE landed AND entry_path LIKE '/menu-planner%' AND (refined OR converted))::int,
              COUNT(*) FILTER (WHERE landed AND entry_path LIKE '/menu-planner%' AND converted)::int
         FROM s
       UNION ALL
       SELECT 'Entry: / (Home)' AS cohort,
              COUNT(*) FILTER (WHERE landed AND entry_path = '/')::int,
              COUNT(*) FILTER (WHERE landed AND entry_path = '/' AND (generated OR refined OR converted))::int,
              COUNT(*) FILTER (WHERE landed AND entry_path = '/' AND (refined OR converted))::int,
              COUNT(*) FILTER (WHERE landed AND entry_path = '/' AND converted)::int
         FROM s`,
      [interval],
    );

    const allRow = res.rows.find((r) => r.cohort === "all") ?? {
      cohort: "all",
      landed: 0,
      generated: 0,
      refined: 0,
      converted: 0,
    };
    const top = Math.max(1, Number(allRow.landed));
    const landed = Number(allRow.landed);
    const generated = Number(allRow.generated);
    const refined = Number(allRow.refined);
    const converted = Number(allRow.converted);

    const stages = [
      { stage: "1. Landed on /menu-planner", sessions: landed, rate: landed > 0 ? 1 : 0 },
      { stage: "2. Generated / Drafted Plan", sessions: generated, rate: landed > 0 ? generated / top : 0 },
      { stage: "3. Refined / Balanced Plan", sessions: refined, rate: landed > 0 ? refined / top : 0 },
      { stage: "4. Exported / Cart Handoff", sessions: converted, rate: landed > 0 ? converted / top : 0 },
    ];

    const cohorts: PlannerFunnelCohort[] = res.rows
      .filter((r) => r.cohort !== "all" && Number(r.landed) > 0)
      .map((r) => {
        const cLanded = Number(r.landed);
        const cConverted = Number(r.converted);
        return {
          label: r.cohort,
          landed: cLanded,
          generated: Number(r.generated),
          refined: Number(r.refined),
          converted: cConverted,
          conversionRate: cLanded > 0 ? cConverted / cLanded : 0,
        };
      });

    return { stages, cohorts };
  } catch (err) {
    if (isMissingColumn(err) || isMissingRelation(err)) {
      return { stages: [], cohorts: [] };
    }
    throw err;
  }
}

/**
 * Rank the most-used Kitchen & Celestial Lab tabs (`tab:*`) and solver
 * executions (`patch:solve:*`) alongside median dwell time.
 */
export async function readLabEngagement(interval: string): Promise<LabEngagementRow[]> {
  try {
    const res = await executeQuery<{
      tag: string;
      sessions: number;
      median_dwell_ms: number | null;
    }>(
      `SELECT act AS tag,
              COUNT(DISTINCT COALESCE(pv.session_id, pv.visitor_hash))::int AS sessions,
              PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY COALESCE(pv.duration_ms, 0))::float8 AS median_dwell_ms
         FROM page_views pv,
              LATERAL jsonb_array_elements_text(pv.interactions) AS act
        WHERE pv.at >= NOW() - $1::interval
          AND ${HUMAN_PV}
          AND (act LIKE 'tab:%' OR act LIKE 'patch:solve:%')
        GROUP BY act
        ORDER BY sessions DESC, median_dwell_ms DESC
        LIMIT 12`,
      [interval],
    );
    return res.rows.map((r) => ({
      tag: r.tag,
      kind: r.tag.startsWith("patch:solve:") ? "solver" : "tab",
      sessions: Number(r.sessions),
      medianDwellMs: Math.round(Number(r.median_dwell_ms ?? 0)),
    }));
  } catch (err) {
    if (isMissingColumn(err) || isMissingRelation(err)) return [];
    throw err;
  }
}

interface FeedbackRow {
  id: string;
  at: Date;
  view_id: string | null;
  session_id: string | null;
  visitor_hash: string | null;
  path: string;
  ref_tag: string | null;
  rating: number | null;
  note: string;
  status?: string | null;
  resolved_at?: Date | null;
}

function normalizeFeedbackStatus(raw: string | null | undefined): SessionFeedbackStatus {
  if (raw === "resolved" || raw === "dismissed") return raw;
  return "open";
}

export async function readSessionFeedback(limit = 50): Promise<SessionFeedbackItem[]> {
  try {
    let rows: FeedbackRow[];
    try {
      ({ rows } = await executeQuery<FeedbackRow>(
        `SELECT id::text AS id, at, view_id, session_id, visitor_hash, path, ref_tag, rating, note,
                COALESCE(status, 'open') AS status, resolved_at
           FROM session_feedback
          ORDER BY at DESC
          LIMIT ${limit}`,
      ));
    } catch (err) {
      if (!isMissingColumn(err)) throw err;
      ({ rows } = await executeQuery<FeedbackRow>(
        `SELECT id::text AS id, at, view_id, session_id, visitor_hash, path, ref_tag, rating, note
           FROM session_feedback
          ORDER BY at DESC
          LIMIT ${limit}`,
      ));
    }
    return rows.map((r) => ({
      id: r.id,
      at: new Date(r.at).toISOString(),
      viewId: r.view_id,
      sessionId: r.session_id,
      visitorHash: r.visitor_hash,
      path: r.path,
      refTag: r.ref_tag,
      rating: r.rating !== null ? Number(r.rating) : null,
      note: r.note,
      status: normalizeFeedbackStatus(r.status),
      resolvedAt: r.resolved_at ? new Date(r.resolved_at).toISOString() : null,
    }));
  } catch (err) {
    if (isMissingRelation(err) || isMissingColumn(err)) return [];
    throw err;
  }
}

/**
 * Threshold-based spike & regression detectors for /admin:
 *   1. Client Error Burst: unique visitor sessions hitting `error:*` in last 60m
 *   2. Zero-Result Search Spike: top `search:zero_results:<slug>` in last 24h
 *   3. Live VIP / Share-Link Arrival: sessions with `ref_tag` active in last 15m
 */
export async function readFrictionAlerts(): Promise<FrictionAlerts> {
  try {
    const [errorRes, searchRes, reviewerRes] = await Promise.all([
      executeQuery<{ sessions: number; top_tag: string | null }>(
        `WITH errs AS (
           SELECT COALESCE(pv.session_id, pv.visitor_hash) AS sid, act
             FROM page_views pv,
                  LATERAL jsonb_array_elements_text(pv.interactions) AS act
            WHERE pv.at >= NOW() - INTERVAL '60 minutes'
              AND ${HUMAN_PV}
              AND act LIKE 'error:%'
         )
         SELECT (SELECT COUNT(DISTINCT sid)::int FROM errs) AS sessions,
                (SELECT act FROM errs GROUP BY act ORDER BY COUNT(DISTINCT sid) DESC LIMIT 1) AS top_tag`,
      ),
      executeQuery<{ act: string; sessions: number }>(
        `SELECT act, COUNT(DISTINCT COALESCE(pv.session_id, pv.visitor_hash))::int AS sessions
           FROM page_views pv,
                LATERAL jsonb_array_elements_text(pv.interactions) AS act
          WHERE pv.at >= NOW() - INTERVAL '24 hours'
            AND ${HUMAN_PV}
            AND act LIKE 'search:zero_results:%'
          GROUP BY act
          ORDER BY sessions DESC
          LIMIT 1`,
      ),
      executeQuery<{
        sid: string;
        ref_tag: string;
        path: string;
        last_seen_at: Date;
        visitor_hash: string;
      }>(
        `SELECT DISTINCT ON (COALESCE(session_id, visitor_hash))
                COALESCE(session_id, visitor_hash) AS sid,
                ref_tag,
                path,
                COALESCE(last_seen_at, at) AS last_seen_at,
                visitor_hash
           FROM page_views
          WHERE COALESCE(last_seen_at, at) >= NOW() - INTERVAL '15 minutes'
            AND ${HUMAN}
            AND ref_tag IS NOT NULL
          ORDER BY COALESCE(session_id, visitor_hash), COALESCE(last_seen_at, at) DESC
          LIMIT 5`,
      ),
    ]);

    const errorSessions60m = Number(errorRes.rows[0]?.sessions ?? 0);
    const topErrorTag = errorRes.rows[0]?.top_tag ?? null;
    const [topSearch] = searchRes.rows;
    const topZeroResultQuery = topSearch
      ? {
          slug: topSearch.act.replace(/^search:zero_results:/, ""),
          sessions: Number(topSearch.sessions),
        }
      : null;

    const activeReviewers: ActiveReviewerAlert[] = reviewerRes.rows.map((r) => ({
      sessionKey: r.sid,
      refTag: r.ref_tag,
      path: r.path,
      lastSeenAt: new Date(r.last_seen_at).toISOString(),
      visitorHash: r.visitor_hash,
    }));

    return {
      errorSessions60m,
      errorBurstTriggered: errorSessions60m >= 3,
      topErrorTag,
      topZeroResultQuery,
      activeReviewers,
    };
  } catch (err) {
    if (isMissingColumn(err) || isMissingRelation(err)) {
      return {
        errorSessions60m: 0,
        errorBurstTriggered: false,
        topErrorTag: null,
        topZeroResultQuery: null,
        activeReviewers: [],
      };
    }
    throw err;
  }
}

interface InteractionTallyQueryRow {
  tag: string | null;
  category: string | null;
  total_count: number;
  unique_views: number;
  unique_sessions: number;
  unique_visitors: number;
  avg_dwell_ms: number | null;
  last_seen_at: Date | null;
  top_path: string | null;
  total_sessions: number | null;
}

/**
 * Unnest `page_views.interactions` across the active time window to compute
 * exact tallies, session reach percentages, average dwell times, and top
 * routes for every interaction across the site.
 */
export async function readInteractionTallies(interval: string): Promise<InteractionTallies> {
  try {
    const res = await executeQuery<InteractionTallyQueryRow>(
      `WITH base AS (
         SELECT COALESCE(view_id, id::text) AS view_key,
                COALESCE(session_id, visitor_hash, id::text) AS session_key,
                COALESCE(user_id::text, visitor_hash, session_id, id::text) AS visitor_key,
                path,
                COALESCE(duration_ms, 0) AS duration_ms,
                COALESCE(last_seen_at, at) AS seen_at,
                COALESCE(interactions, '[]'::jsonb) AS interactions
           FROM page_views
          WHERE at >= NOW() - $1::interval
            AND ${HUMAN}
       ),
       totals AS (
         SELECT COUNT(DISTINCT session_key)::int AS total_sessions FROM base
       ),
       expanded AS (
         SELECT b.view_key,
                b.session_key,
                b.visitor_key,
                b.path,
                b.duration_ms,
                b.seen_at,
                elem AS raw_tag,
                SPLIT_PART(elem, ':', 1) AS category
           FROM base b,
                LATERAL jsonb_array_elements_text(b.interactions) AS elem
       )
       SELECT e.raw_tag AS tag,
              e.category AS category,
              COUNT(*)::int AS total_count,
              COUNT(DISTINCT e.view_key)::int AS unique_views,
              COUNT(DISTINCT e.session_key)::int AS unique_sessions,
              COUNT(DISTINCT e.visitor_key)::int AS unique_visitors,
              ROUND(AVG(e.duration_ms))::int AS avg_dwell_ms,
              MAX(e.seen_at) AS last_seen_at,
              MODE() WITHIN GROUP (ORDER BY e.path) AS top_path,
              MAX(t.total_sessions)::int AS total_sessions
         FROM expanded e
         CROSS JOIN totals t
        GROUP BY GROUPING SETS ((e.raw_tag, e.category), (e.category), ())
        ORDER BY total_count DESC NULLS LAST, unique_sessions DESC NULLS LAST
        LIMIT 250`,
      [interval],
    );

    const grandTotal = res.rows.find((r) => r.tag === null && r.category === null);
    const totalSessions = Math.max(0, Number(grandTotal?.total_sessions ?? 0));
    const totalInteractions = Number(grandTotal?.total_count ?? 0);
    const totalSessionsWithInteractions = Number(grandTotal?.unique_sessions ?? 0);

    const categories: InteractionCategorySummary[] = res.rows
      .filter((r): r is InteractionTallyQueryRow & { category: string } => r.tag === null && r.category !== null)
      .map((r) => {
        const uniqueSessions = Number(r.unique_sessions);
        return {
          category: r.category,
          totalCount: Number(r.total_count),
          uniqueSessions,
          sessionReachPct: totalSessions > 0 ? uniqueSessions / totalSessions : 0,
        };
      });

    const rows: InteractionTallyRow[] = res.rows
      .filter((r): r is InteractionTallyQueryRow & { tag: string; category: string } => r.tag !== null && r.category !== null)
      .map((r) => {
        const uniqueSessions = Number(r.unique_sessions);
        return {
          tag: r.tag,
          category: r.category,
          tone: classifyInteractionTag(r.tag).tone,
          totalCount: Number(r.total_count),
          uniqueViews: Number(r.unique_views),
          uniqueSessions,
          uniqueVisitors: Number(r.unique_visitors),
          sessionReachPct: totalSessions > 0 ? uniqueSessions / totalSessions : 0,
          avgDwellMs: Math.round(Number(r.avg_dwell_ms ?? 0)),
          topPath: r.top_path ?? "/",
          lastSeenAt: r.last_seen_at ? new Date(r.last_seen_at).toISOString() : new Date(0).toISOString(),
        };
      });

    return {
      totalInteractions,
      totalSessionsWithInteractions,
      categories,
      rows,
    };
  } catch (err) {
    if (isMissingColumn(err) || isMissingRelation(err)) {
      return {
        totalInteractions: 0,
        totalSessionsWithInteractions: 0,
        categories: [],
        rows: [],
      };
    }
    throw err;
  }
}

interface RouteFlowQueryRow {
  path: string;
  total_views: number;
  unique_sessions: number;
  entry_count: number;
  exit_count: number;
  bounced_entries: number;
  avg_dwell_ms: number;
  friction_count: number;
  top_next_paths: unknown;
}

const NextHopListSchema = z.array(z.object({ path: z.string(), count: z.coerce.number() }));

function parseNextPaths(raw: unknown): RouteFlowNextHop[] {
  const parsed = NextHopListSchema.safeParse(raw);
  if (!parsed.success) return [];
  return parsed.data.filter(
    (item) => item.path.length > 0 && Number.isFinite(item.count) && item.count > 0,
  );
}

/**
 * Compute per-route entry rates, exit rates, single-page bounce rates,
 * friction hits, and top subsequent routes (Pathfinder) across human sessions.
 */
export async function readRouteFlowMatrix(interval: string): Promise<RouteFlowMatrixRow[]> {
  try {
    const res = await executeQuery<RouteFlowQueryRow>(
      `WITH ordered AS (
         SELECT COALESCE(session_id, visitor_hash, id::text) AS sid,
                path,
                ROW_NUMBER() OVER (
                  PARTITION BY COALESCE(session_id, visitor_hash, id::text)
                  ORDER BY at ASC, id ASC
                ) AS step_num,
                COUNT(*) OVER (
                  PARTITION BY COALESCE(session_id, visitor_hash, id::text)
                ) AS step_count,
                LEAD(path) OVER (
                  PARTITION BY COALESCE(session_id, visitor_hash, id::text)
                  ORDER BY at ASC, id ASC
                ) AS next_path,
                COALESCE(duration_ms, 0) AS duration_ms,
                COALESCE(jsonb_array_length(interactions), 0) AS action_count,
                EXISTS (
                  SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(interactions, '[]'::jsonb)) AS act
                   WHERE act LIKE 'friction:%' OR act LIKE 'error:%' OR act LIKE 'perf:slow_%'
                ) AS has_friction
           FROM page_views
          WHERE at >= NOW() - $1::interval
            AND ${HUMAN}
       ),
       route_stats AS (
         SELECT path,
                COUNT(*)::int AS total_views,
                COUNT(DISTINCT sid)::int AS unique_sessions,
                COUNT(DISTINCT sid) FILTER (WHERE step_num = 1)::int AS entry_count,
                COUNT(DISTINCT sid) FILTER (WHERE step_num = step_count)::int AS exit_count,
                COUNT(DISTINCT sid) FILTER (
                  WHERE step_num = 1 AND step_count = 1 AND duration_ms < ${ENGAGED_DWELL_MS} AND action_count = 0
                )::int AS bounced_entries,
                COALESCE(ROUND(AVG(duration_ms)), 0)::int AS avg_dwell_ms,
                COUNT(*) FILTER (WHERE has_friction)::int AS friction_count
           FROM ordered
          GROUP BY path
          ORDER BY total_views DESC, unique_sessions DESC
          LIMIT 15
       ),
       transitions AS (
         SELECT path,
                next_path,
                COUNT(*)::int AS cnt,
                ROW_NUMBER() OVER (PARTITION BY path ORDER BY COUNT(*) DESC, next_path ASC) AS rn
           FROM ordered
          WHERE next_path IS NOT NULL
            AND next_path <> path
            AND path IN (SELECT path FROM route_stats)
          GROUP BY path, next_path
       ),
       next_agg AS (
         SELECT path,
                COALESCE(
                  jsonb_agg(jsonb_build_object('path', next_path, 'count', cnt) ORDER BY rn)
                    FILTER (WHERE rn <= 3),
                  '[]'::jsonb
                ) AS top_next_paths
           FROM transitions
          GROUP BY path
       )
       SELECT rs.path,
              rs.total_views,
              rs.unique_sessions,
              rs.entry_count,
              rs.exit_count,
              rs.bounced_entries,
              rs.avg_dwell_ms,
              rs.friction_count,
              COALESCE(na.top_next_paths, '[]'::jsonb) AS top_next_paths
         FROM route_stats rs
         LEFT JOIN next_agg na ON na.path = rs.path
        ORDER BY rs.total_views DESC, rs.unique_sessions DESC`,
      [interval],
    );

    return res.rows.map((r) => {
      const uniqueSessions = Math.max(0, Number(r.unique_sessions));
      const entryCount = Math.max(0, Number(r.entry_count));
      const exitCount = Math.max(0, Number(r.exit_count));
      const bouncedEntries = Math.max(0, Number(r.bounced_entries));
      return {
        path: r.path,
        totalViews: Number(r.total_views),
        uniqueSessions,
        entryCount,
        entryRatePct: uniqueSessions > 0 ? entryCount / uniqueSessions : 0,
        exitCount,
        exitRatePct: uniqueSessions > 0 ? exitCount / uniqueSessions : 0,
        singlePageBounceRatePct: entryCount > 0 ? bouncedEntries / entryCount : 0,
        avgDwellMs: Math.round(Number(r.avg_dwell_ms)),
        frictionCount: Number(r.friction_count),
        topNextPaths: parseNextPaths(r.top_next_paths),
      };
    });
  } catch (err) {
    if (isMissingColumn(err) || isMissingRelation(err)) return [];
    throw err;
  }
}

interface ActivationStickinessQueryRow {
  total_visitors: number;
  returning_visitors: number;
  total_sessions: number;
  activated_sessions: number;
  avg_ttfa_ms: number | null;
  frustrated_sessions: number;
  dau_count: number;
  wau_count: number;
  variants_json?: unknown;
}

const RawVariantListSchema = z.array(
  z.object({
    variant: z.string(),
    sessions: z.coerce.number(),
    activatedSessions: z.coerce.number(),
    frustratedSessions: z.coerce.number(),
  }),
);

function evaluateArmVsBaseline(arm: VariantCohortRow, baseline: VariantCohortRow): VariantCohortRow {
  if (arm.variant === baseline.variant) {
    return {
      ...arm,
      liftVsControlPct: null,
      confidenceLabel: baseline.sessions >= 20 ? "Trending" : "Insufficient Data",
    };
  }
  const p0 = baseline.activationRatePct;
  const p1 = arm.activationRatePct;
  const rawLift = p0 > 0 ? ((p1 - p0) / p0) * 100 : (p1 - p0) * 100;
  const liftVsControlPct = Math.round(rawLift * 10) / 10;
  let confidenceLabel: VariantConfidenceLabel = "Insufficient Data";
  if (arm.sessions >= 20 && baseline.sessions >= 20) {
    const totalN = arm.sessions + baseline.sessions;
    const pooled = (arm.activatedSessions + baseline.activatedSessions) / totalN;
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / arm.sessions + 1 / baseline.sessions));
    const zScore = se > 0 ? Math.abs(p1 - p0) / se : 0;
    confidenceLabel = zScore >= 1.96 ? "Statistically Significant (95%+)" : "Trending";
  }
  return { ...arm, liftVsControlPct, confidenceLabel };
}

export function computeVariantLiftAndConfidence(rows: VariantCohortRow[]): VariantCohortRow[] {
  if (rows.length === 0) return [];
  const [first] = rows;
  if (!first) return [];
  if (rows.length < 2) {
    return rows.map((r) => ({ ...r, liftVsControlPct: null, confidenceLabel: "Insufficient Data" }));
  }
  const baseline =
    rows.find((r) => /[=:]control$/i.test(r.variant)) ??
    rows.reduce((low, cur) => (cur.activationRatePct < low.activationRatePct ? cur : low), first);
  return rows.map((arm) => evaluateArmVsBaseline(arm, baseline));
}

function parseVariantCohorts(raw: unknown): VariantCohortRow[] {
  const parsed = RawVariantListSchema.safeParse(raw);
  if (!parsed.success) return [];
  const out: VariantCohortRow[] = [];
  for (const item of parsed.data) {
    if (!item.variant || !Number.isFinite(item.sessions) || item.sessions <= 0) continue;
    const sessions = Math.max(0, item.sessions);
    const activatedSessions = Math.max(0, item.activatedSessions);
    const frustratedSessions = Math.max(0, item.frustratedSessions);
    out.push({
      variant: item.variant,
      sessions,
      activatedSessions,
      activationRatePct: activatedSessions / sessions,
      frustratedSessions,
      frustrationRatePct: frustratedSessions / sessions,
    });
  }
  return computeVariantLiftAndConfidence(out);
}

export function emptyActivationStickiness(): ActivationStickinessSummary {
  return {
    totalVisitors: 0,
    newVisitors: 0,
    returningVisitors: 0,
    returningRatePct: 0,
    activatedSessions: 0,
    activationRatePct: 0,
    avgTimeToFirstActionMs: null,
    frustratedSessions: 0,
    frustrationRatePct: 0,
    dauCount: 0,
    wauCount: 0,
    stickinessRatioPct: 0,
  };
}

/**
 * Product health pulse across human visitors: core value activation rate,
 * average time-to-first-key-action, frustration rate, returning rate,
 * DAU/WAU stickiness ratio, and UI variant cohorts (`variant:*`).
 */
export async function readActivationAndStickiness(interval: string): Promise<ActivationStickinessSummary> {
  try {
    const res = await executeQuery<ActivationStickinessQueryRow>(
      `WITH win AS (
         SELECT at,
                at::date AS view_day,
                COALESCE(session_id, visitor_hash, id::text) AS sid,
                COALESCE(user_id::text, visitor_hash) AS visitor_key,
                COALESCE(interactions, '[]'::jsonb) AS interactions,
                EXISTS (
                  SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(interactions, '[]'::jsonb)) AS a
                   WHERE a LIKE 'plan:%'
                      OR a LIKE 'patch:solve:%'
                      OR a LIKE 'conversion:%'
                      OR a LIKE 'search:query:%'
                      OR a LIKE 'tab:cauldron_step_%'
                ) AS has_activation,
                EXISTS (
                  SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(interactions, '[]'::jsonb)) AS a
                   WHERE a LIKE 'friction:%'
                      OR a LIKE 'error:%'
                ) AS has_friction
           FROM page_views
          WHERE at >= NOW() - $1::interval
            AND ${HUMAN}
       ),
       session_stats AS (
         SELECT sid,
                BOOL_OR(has_activation) AS is_activated,
                BOOL_OR(has_friction) AS is_frustrated,
                CASE
                  WHEN BOOL_OR(has_activation) THEN
                    GREATEST(
                      0,
                      EXTRACT(EPOCH FROM (MIN(at) FILTER (WHERE has_activation) - MIN(at))) * 1000
                    )::float8
                  ELSE NULL
                END AS ttfa_ms
           FROM win
          GROUP BY sid
       ),
       visitor_stats AS (
         SELECT visitor_key,
                (COUNT(DISTINCT sid) > 1 OR COUNT(DISTINCT view_day) > 1) AS is_returning
           FROM win
          GROUP BY visitor_key
       ),
       variant_sessions AS (
         SELECT DISTINCT w.sid,
                elem AS variant_tag
           FROM win w,
                LATERAL jsonb_array_elements_text(w.interactions) AS elem
          WHERE elem LIKE 'variant:%'
       ),
       variant_stats AS (
         SELECT vs.variant_tag AS variant,
                COUNT(DISTINCT vs.sid)::int AS sessions,
                COUNT(DISTINCT vs.sid) FILTER (WHERE ss.is_activated)::int AS activated_sessions,
                COUNT(DISTINCT vs.sid) FILTER (WHERE ss.is_frustrated)::int AS frustrated_sessions
           FROM variant_sessions vs
           JOIN session_stats ss ON ss.sid = vs.sid
          GROUP BY vs.variant_tag
          ORDER BY sessions DESC, vs.variant_tag ASC
          LIMIT 8
       ),
       variants_agg AS (
         SELECT COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'variant', variant,
               'sessions', sessions,
               'activatedSessions', activated_sessions,
               'frustratedSessions', frustrated_sessions
             )
           ),
           '[]'::jsonb
         ) AS variants_json
         FROM variant_stats
       ),
       stickiness AS (
         SELECT COUNT(DISTINCT visitor_hash) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS dau_count,
                COUNT(DISTINCT visitor_hash)::int AS wau_count
           FROM page_views
          WHERE at >= NOW() - INTERVAL '7 days'
            AND ${HUMAN}
       )
       SELECT (SELECT COUNT(*)::int FROM visitor_stats) AS total_visitors,
              (SELECT COUNT(*) FILTER (WHERE is_returning)::int FROM visitor_stats) AS returning_visitors,
              (SELECT COUNT(*)::int FROM session_stats) AS total_sessions,
              (SELECT COUNT(*) FILTER (WHERE is_activated)::int FROM session_stats) AS activated_sessions,
              (SELECT ROUND(AVG(ttfa_ms))::float8 FROM session_stats WHERE ttfa_ms IS NOT NULL) AS avg_ttfa_ms,
              (SELECT COUNT(*) FILTER (WHERE is_frustrated)::int FROM session_stats) AS frustrated_sessions,
              st.dau_count,
              st.wau_count,
              (SELECT variants_json FROM variants_agg) AS variants_json
         FROM stickiness st`,
      [interval],
    );

    const [row] = res.rows;
    if (!row) return emptyActivationStickiness();

    const totalVisitors = Number(row.total_visitors);
    const returningVisitors = Number(row.returning_visitors);
    const newVisitors = Math.max(0, totalVisitors - returningVisitors);
    const totalSessions = Number(row.total_sessions);
    const activatedSessions = Number(row.activated_sessions);
    const frustratedSessions = Number(row.frustrated_sessions);
    const dauCount = Number(row.dau_count);
    const wauCount = Number(row.wau_count);
    const variants = parseVariantCohorts(row.variants_json);

    return {
      totalVisitors,
      newVisitors,
      returningVisitors,
      returningRatePct: totalVisitors > 0 ? returningVisitors / totalVisitors : 0,
      activatedSessions,
      activationRatePct: totalSessions > 0 ? activatedSessions / totalSessions : 0,
      avgTimeToFirstActionMs: row.avg_ttfa_ms !== null ? Math.round(Number(row.avg_ttfa_ms)) : null,
      frustratedSessions,
      frustrationRatePct: totalSessions > 0 ? frustratedSessions / totalSessions : 0,
      dauCount,
      wauCount,
      stickinessRatioPct: wauCount > 0 ? Math.min(1, dauCount / wauCount) : 0,
      ...(variants.length > 0 ? { variants } : {}),
    };
  } catch (err) {
    if (isMissingColumn(err) || isMissingRelation(err)) return emptyActivationStickiness();
    throw err;
  }
}

interface RecentRow {
  id: string;
  view_id?: string | null;
  at: Date;
  last_seen_at?: Date | null;
  path: string;
  referrer_host: string | null;
  utm_source?: string | null;
  ref_tag?: string | null;
  duration_ms?: number | null;
  interactions?: unknown;
  country: string | null;
  region: string | null;
  city: string | null;
  device_type: string;
  browser: string | null;
  os: string | null;
  session_id: string | null;
  visitor_hash?: string | null;
  user_id: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
}

function parseInteractions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.length > 0).slice(0, 50);
}

export async function readRecent(limit = 80, interval = "30 days"): Promise<RecentPageView[]> {
  let rows: RecentRow[];
  try {
    ({ rows } = await executeQuery<RecentRow>(
      `SELECT pv.id::text AS id, pv.view_id, pv.at, pv.last_seen_at, pv.path, pv.referrer_host,
              pv.utm_source, pv.ref_tag, pv.duration_ms, pv.interactions,
              pv.country, pv.region, pv.city,
              pv.device_type, pv.browser, pv.os, pv.session_id, pv.visitor_hash, pv.user_id,
              u.email, COALESCE(up.name, u.name) AS name, u.role::text AS role
         FROM page_views pv
         LEFT JOIN users u ON u.id::text = pv.user_id
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE ${HUMAN_PV}
          AND pv.at >= NOW() - $1::interval
        ORDER BY pv.at DESC LIMIT ${limit}`,
      [interval],
    ));
  } catch (err) {
    if (!isMissingColumn(err)) throw err;
    ({ rows } = await executeQuery<RecentRow>(
      `SELECT pv.id::text AS id, pv.at, pv.path, pv.referrer_host, pv.utm_source,
              pv.country, pv.region, pv.city,
              pv.device_type, pv.browser, pv.os, pv.session_id, pv.visitor_hash, pv.user_id,
              u.email, COALESCE(up.name, u.name) AS name, u.role::text AS role
         FROM page_views pv
         LEFT JOIN users u ON u.id::text = pv.user_id
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE ${HUMAN_PV}
          AND pv.at >= NOW() - $1::interval
        ORDER BY pv.at DESC LIMIT ${limit}`,
      [interval],
    ));
  }

  // `rows` are ordered newest-first. Track the newest (subsequent) timestamp
  // seen per session key so we can infer step duration when explicit
  // `duration_ms` is 0 (e.g. historical rows or mid-navigation steps).
  const nextStepAtBySession = new Map<string, number>();
  const nowMs = Date.now();

  return rows.map((r) => {
    const atMs = new Date(r.at).getTime();
    const sKey = r.session_id ?? r.visitor_hash ?? r.id;
    const nextAtMs = nextStepAtBySession.get(sKey);
    nextStepAtBySession.set(sKey, atMs);

    const explicitMs = Number(r.duration_ms ?? 0);
    const inferredMs =
      nextAtMs !== undefined && nextAtMs > atMs && nextAtMs - atMs <= MAX_STEP_GAP_MS
        ? nextAtMs - atMs
        : 0;
    const durationMs = Math.max(explicitMs, inferredMs);
    const interactions = parseInteractions(r.interactions);
    const lastSeenMs = r.last_seen_at ? new Date(r.last_seen_at).getTime() : atMs + durationMs;

    return {
      id: r.id,
      viewId: r.view_id ?? null,
      at: new Date(r.at).toISOString(),
      lastSeenAt: new Date(lastSeenMs).toISOString(),
      path: r.path,
      referrerHost: r.referrer_host,
      country: r.country,
      region: r.region,
      city: r.city,
      deviceType: r.device_type,
      browser: r.browser,
      os: r.os,
      sessionId: r.session_id,
      visitorHash: r.visitor_hash ?? sKey.slice(0, 24),
      durationMs,
      refTag: r.ref_tag ?? r.utm_source ?? null,
      interactions,
      isEngaged: durationMs >= ENGAGED_DWELL_MS || interactions.length > 0,
      isLive: lastSeenMs >= nowMs - LIVE_NOW_WINDOW_MS,
      user:
        r.user_id && r.email
          ? { id: r.user_id, email: r.email, name: r.name, isAdmin: (r.role ?? "").toUpperCase() === "ADMIN" }
          : null,
    };
  });
}

/**
 * Decorate individual `RecentPageView` rows with their session step position
 * (Entry / Step i/N / Exit), session engagement, visit number, and attached
 * contextual feedback for the Every Site View (Raw Ledger) view.
 */
export function enrichRecentPageViews(
  recent: RecentPageView[],
  sessions: VisitorSession[],
): RecentPageView[] {
  const bySessionKey = new Map<string, VisitorSession>();
  for (const s of sessions) {
    bySessionKey.set(s.sessionKey, s);
  }

  return recent.map((pv) => {
    const key = pv.sessionId ?? pv.visitorHash ?? pv.id;
    const sess = bySessionKey.get(key);
    if (!sess) return pv;
    const idx = sess.steps.findIndex((st) => st.id === pv.id);
    const stepCount = sess.steps.length;
    const stepIndex = idx >= 0 ? idx + 1 : 1;
    const pvFeedback = (sess.feedback ?? []).filter(
      (f) =>
        (Boolean(pv.viewId) && f.viewId === pv.viewId) ||
        (!f.viewId && f.path === pv.path),
    );
    return {
      ...pv,
      stepIndex,
      stepCount,
      isEntry: stepIndex === 1,
      isExit: stepIndex === stepCount,
      isEngaged: Boolean(pv.isEngaged) || sess.engaged,
      isLive: Boolean(pv.isLive ?? sess.liveNow90s),
      ...(sess.visitNumber !== undefined ? { visitNumber: sess.visitNumber } : {}),
      feedback: pvFeedback,
    };
  });
}

/**
 * Group recent page views into chronological Visitor Sessions so the operator
 * can trace a single viewer's path through the site, total dwell time, and
 * in-page actions.
 */
export function buildVisitorSessions(
  recent: RecentPageView[],
  now = new Date(),
  feedback: SessionFeedbackItem[] = [],
): VisitorSession[] {
  const activeCutoffMs = now.getTime() - ACTIVE_WINDOW_MINUTES * 60_000;
  const liveNowCutoffMs = now.getTime() - LIVE_NOW_WINDOW_MS;
  const byKey = new Map<string, RecentPageView[]>();

  for (const pv of recent) {
    const key = pv.sessionId ?? pv.visitorHash ?? pv.id;
    const list = byKey.get(key);
    if (list) {
      list.push(pv);
    } else {
      byKey.set(key, [pv]);
    }
  }

  const sessions: VisitorSession[] = [];
  for (const [sessionKey, viewsDesc] of byKey.entries()) {
    // Sort chronological (oldest -> newest) to reconstruct the user's journey.
    const viewsAsc = [...viewsDesc].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
    const [first] = viewsAsc;
    const last = viewsAsc[viewsAsc.length - 1];
    if (!first || !last) continue;

    const steps = viewsAsc.map((v) => ({
      id: v.id,
      at: v.at,
      path: v.path,
      durationMs: v.durationMs ?? 0,
      refTag: v.refTag ?? null,
      interactions: v.interactions ?? [],
    }));

    const sumStepMs = steps.reduce((acc, s) => acc + s.durationMs, 0);
    const spanMs = Math.max(0, new Date(last.at).getTime() - new Date(first.at).getTime());
    const totalDurationMs = Math.max(sumStepMs, spanMs + (last.durationMs ?? 0));
    const lastSeenMs = new Date(last.at).getTime() + (last.durationMs ?? 0);
    const lastSeenAt = new Date(lastSeenMs).toISOString();
    const totalActions = steps.reduce((acc, s) => acc + s.interactions.length, 0);
    const hasError = steps.some((s) => s.interactions.some((act) => act.startsWith("error:")));
    const isStuck =
      totalDurationMs > STUCK_DWELL_MS &&
      totalActions === 0 &&
      steps.some((s) => isInteractiveRoute(s.path));
    const hasFriction =
      steps.some((s) => s.interactions.some((act) => isFrustrationOrPerfTag(act))) || isStuck;
    const signedInUser = viewsAsc.find((v) => v.user !== null)?.user ?? null;
    const firstRefHost = viewsAsc.find((v) => v.referrerHost !== null)?.referrerHost ?? null;
    const firstRefTag = viewsAsc.find((v) => v.refTag != null)?.refTag ?? null;

    const sessionFeedback = feedback.filter(
      (f) =>
        (Boolean(f.sessionId) && f.sessionId === first.sessionId) ||
        (Boolean(f.visitorHash) && f.visitorHash === (first.visitorHash ?? sessionKey.slice(0, 24))),
    );

    sessions.push({
      sessionKey,
      visitorHash: first.visitorHash ?? sessionKey.slice(0, 24),
      sessionId: first.sessionId,
      startedAt: first.at,
      lastSeenAt,
      totalDurationMs,
      pageCount: steps.length,
      engaged: steps.length > 1 || totalDurationMs >= ENGAGED_DWELL_MS || totalActions > 0 || sessionFeedback.length > 0,
      activeNow: lastSeenMs >= activeCutoffMs,
      liveNow90s: lastSeenMs >= liveNowCutoffMs,
      isStuck,
      hasError,
      hasFriction,
      entryPath: first.path,
      exitPath: last.path,
      referrerHost: firstRefHost,
      utmSource: firstRefTag,
      refTag: firstRefTag,
      country: first.country,
      region: first.region,
      city: first.city,
      deviceType: first.deviceType,
      browser: first.browser,
      os: first.os,
      user: signedInUser,
      steps,
      feedback: sessionFeedback,
    });
  }

  // Group sessions by returning identity (signed-in user id or visitorHash)
  // in chronological order to assign `visitNumber` and `priorSessionKeys`.
  const byIdentity = new Map<string, VisitorSession[]>();
  for (const s of [...sessions].sort((a, b) => (a.startedAt < b.startedAt ? -1 : a.startedAt > b.startedAt ? 1 : 0))) {
    const identityKey = s.user ? `u:${s.user.id}` : `v:${s.visitorHash}`;
    const list = byIdentity.get(identityKey) ?? [];
    s.visitNumber = list.length + 1;
    s.priorSessionKeys = list.map((prior) => prior.sessionKey);
    list.push(s);
    byIdentity.set(identityKey, list);
  }

  return sessions.sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : a.lastSeenAt > b.lastSeenAt ? -1 : 0));
}

interface RetentionCohortQueryRow {
  cohort_start: string;
  new_visitors: number;
  activated_day0: number;
  returned_d1: number;
  returned_d3: number;
  returned_d7: number;
}

const RETENTION_COHORTS_SQL = `WITH first_seen AS (
   SELECT COALESCE(user_id::text, visitor_hash) AS visitor_key, MIN(at::date) AS cohort_day
     FROM page_views
    WHERE ${HUMAN}
    GROUP BY COALESCE(user_id::text, visitor_hash)
   HAVING MIN(at::date) >= CURRENT_DATE - ($1::int - 1)
 ),
 visitor_activity AS (
   SELECT fs.visitor_key,
          fs.cohort_day,
          BOOL_OR(
            pv.at::date = fs.cohort_day
            AND EXISTS (
              SELECT 1
                FROM jsonb_array_elements_text(COALESCE(pv.interactions, '[]'::jsonb)) AS a
               WHERE a LIKE 'plan:%'
                  OR a LIKE 'patch:solve:%'
                  OR a LIKE 'conversion:%'
                  OR a LIKE 'search:query:%'
                  OR a LIKE 'tab:cauldron_step_%'
            )
          ) AS activated_day0,
          BOOL_OR(pv.at::date >= fs.cohort_day + 1) AS returned_d1,
          BOOL_OR(pv.at::date >= fs.cohort_day + 3) AS returned_d3,
          BOOL_OR(pv.at::date >= fs.cohort_day + 7) AS returned_d7
     FROM first_seen fs
     JOIN page_views pv
       ON COALESCE(pv.user_id::text, pv.visitor_hash) = fs.visitor_key
      AND pv.at::date >= fs.cohort_day
      AND ${HUMAN_PV}
    GROUP BY fs.visitor_key, fs.cohort_day
 )
 SELECT cohort_day::text AS cohort_start,
        COUNT(*)::int AS new_visitors,
        COUNT(*) FILTER (WHERE activated_day0)::int AS activated_day0,
        COUNT(*) FILTER (WHERE returned_d1)::int AS returned_d1,
        COUNT(*) FILTER (WHERE returned_d3)::int AS returned_d3,
        COUNT(*) FILTER (WHERE returned_d7)::int AS returned_d7
   FROM visitor_activity
  GROUP BY cohort_day
  ORDER BY cohort_day DESC
  LIMIT 7`;

function formatCohortDayLabel(cohortStart: string): string {
  const parsed = new Date(`${cohortStart.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return cohortStart;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/**
 * Group human visitors by first-seen cohort day within the window and compute
 * Day-0 activation plus Day-1 / Day-3 / Day-7 return percentages.
 */
export async function readRetentionCohorts(days = 14): Promise<RetentionCohortRow[]> {
  const safeDays = Math.max(1, Math.min(90, Math.round(days)));
  try {
    const res = await executeQuery<RetentionCohortQueryRow>(RETENTION_COHORTS_SQL, [safeDays]);
    return res.rows.map((r) => {
      const n = Math.max(1, Number(r.new_visitors));
      const cohortStart = String(r.cohort_start).slice(0, 10);
      return {
        cohortStart,
        cohortLabel: formatCohortDayLabel(cohortStart),
        newVisitors: Number(r.new_visitors),
        activatedFirstDayPct: Number(r.activated_day0) / n,
        d1ReturnPct: Number(r.returned_d1) / n,
        d3ReturnPct: Number(r.returned_d3) / n,
        d7ReturnPct: Number(r.returned_d7) / n,
      };
    });
  } catch (err) {
    if (isMissingColumn(err) || isMissingRelation(err)) return [];
    throw err;
  }
}
