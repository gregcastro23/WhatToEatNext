/**
 * Traffic analytics — who is visiting alchm.kitchen, from where, and what
 * they read. Server-only.
 *
 * Source: the first-party `page_views` table (migration 86), written by the
 * public beacon POST /api/track/pageview. Bots are recorded (is_bot) but are
 * excluded from every human-facing number and reported as their own count.
 *
 * Counting rules, stated because each is a choice:
 *   - "visitors" = distinct visitor_hash. The hash rotates every UTC day, so
 *     over a multi-day range this is the SUM of daily uniques (a person who
 *     came on 3 days counts 3). Labelled "visitor-days" in the UI for 7d/30d.
 *   - "sessions" = distinct per-tab session ids.
 *   - "bounce" = a session with exactly one page view.
 *   - Buckets use the America/New_York day, matching userInsightsService.
 *
 * @file src/services/admin/trafficAnalyticsService.ts
 */

import type { DeviceType } from "@/lib/analytics/pageViewClassify";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

export type TrafficRange = "24h" | "7d" | "30d";

const RANGE_INTERVAL: Record<TrafficRange, string> = {
  "24h": "24 hours",
  "7d": "7 days",
  "30d": "30 days",
};

const RANGE_BUCKET: Record<TrafficRange, { unit: "hour" | "day"; count: number }> = {
  "24h": { unit: "hour", count: 24 },
  "7d": { unit: "day", count: 7 },
  "30d": { unit: "day", count: 30 },
};

/** Window for "on the site right now". */
const ACTIVE_WINDOW_MINUTES = 5;

export interface PageViewInsert {
  path: string;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  visitorHash: string;
  sessionId: string | null;
  userId: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: DeviceType;
  browser: string | null;
  os: string | null;
  isBot: boolean;
}

export function isMissingRelation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === "42P01"
  );
}

let warnedMissingTable = false;

/**
 * Insert one page view. Never throws: analytics must not be able to break a
 * page, and the beacon has no user to show an error to. Returns whether the
 * row landed so the route can answer honestly.
 */
export async function recordPageView(row: PageViewInsert): Promise<boolean> {
  try {
    await executeQuery(
      `INSERT INTO page_views (
         path, referrer_host, utm_source, utm_medium, utm_campaign,
         visitor_hash, session_id, user_id, country, region, city,
         device_type, browser, os, is_bot
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        row.path,
        row.referrerHost,
        row.utmSource,
        row.utmMedium,
        row.utmCampaign,
        row.visitorHash,
        row.sessionId,
        row.userId,
        row.country,
        row.region,
        row.city,
        row.deviceType,
        row.browser,
        row.os,
        row.isBot,
      ],
      { logQuery: false },
    );
    return true;
  } catch (err) {
    if (isMissingRelation(err)) {
      if (!warnedMissingTable) {
        warnedMissingTable = true;
        _logger.error(
          "[traffic] page_views table missing — migration 86-admin-analytics.sql has not been applied",
        );
      }
      return false;
    }
    _logger.error("[traffic] page view insert failed:", err);
    return false;
  }
}

// ─── Summary ────────────────────────────────────────────────────────────────

export interface TrafficTotals {
  pageviews: number;
  visitors: number;
  sessions: number;
  signedInUsers: number;
  bounceRate: number | null;
  pagesPerSession: number | null;
}

export interface TrafficBucket {
  /** ISO-ish local label key: "2026-09-22" or "2026-09-22T14". */
  key: string;
  pageviews: number;
  visitors: number;
}

export interface CountRow {
  label: string;
  count: number;
  visitors?: number;
}

export interface RecentPageView {
  id: string;
  at: string;
  path: string;
  referrerHost: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: string;
  browser: string | null;
  os: string | null;
  sessionId: string | null;
  user: { id: string; email: string; name: string | null; isAdmin: boolean } | null;
}

export interface TrafficSummary {
  generatedAt: string;
  range: TrafficRange;
  /**
   * `live` — page_views was read. `missing-table` — migration 86 not applied.
   * `error` — the read failed. Only `live` carries numbers.
   */
  status: "live" | "missing-table" | "error";
  detail?: string;
  trackingSince: string | null;
  totalPageviewsAllTime: number;
  activeNow: { visitors: number; pages: CountRow[] };
  totals: TrafficTotals;
  previous: TrafficTotals;
  series: TrafficBucket[];
  bucketUnit: "hour" | "day";
  topPages: CountRow[];
  entryPages: CountRow[];
  referrers: CountRow[];
  utmSources: CountRow[];
  countries: CountRow[];
  devices: CountRow[];
  browsers: CountRow[];
  operatingSystems: CountRow[];
  bots: number;
  recent: RecentPageView[];
}

function emptyTotals(): TrafficTotals {
  return {
    pageviews: 0,
    visitors: 0,
    sessions: 0,
    signedInUsers: 0,
    bounceRate: null,
    pagesPerSession: null,
  };
}

function emptySummary(
  range: TrafficRange,
  status: TrafficSummary["status"],
  detail?: string,
): TrafficSummary {
  return {
    generatedAt: new Date().toISOString(),
    range,
    status,
    ...(detail !== undefined ? { detail } : {}),
    trackingSince: null,
    totalPageviewsAllTime: 0,
    activeNow: { visitors: 0, pages: [] },
    totals: emptyTotals(),
    previous: emptyTotals(),
    series: [],
    bucketUnit: RANGE_BUCKET[range].unit,
    topPages: [],
    entryPages: [],
    referrers: [],
    utmSources: [],
    countries: [],
    devices: [],
    browsers: [],
    operatingSystems: [],
    bots: 0,
    recent: [],
  };
}

const HUMAN = "NOT is_bot";

async function readTotals(fromSql: string, toSql: string, interval: string): Promise<TrafficTotals> {
  const window = `at >= ${fromSql} AND at < ${toSql}`;
  const [base, bounce] = await Promise.all([
    executeQuery<{ pageviews: number; visitors: number; sessions: number; signed_in: number }>(
      `SELECT COUNT(*)::int AS pageviews,
              COUNT(DISTINCT visitor_hash)::int AS visitors,
              COUNT(DISTINCT session_id)::int AS sessions,
              COUNT(DISTINCT user_id)::int AS signed_in
         FROM page_views
        WHERE ${window} AND ${HUMAN}`,
      [interval],
    ),
    executeQuery<{ sessions: number; bounced: number; avg_pages: number | null }>(
      `SELECT COUNT(*)::int AS sessions,
              COUNT(*) FILTER (WHERE n = 1)::int AS bounced,
              AVG(n)::float8 AS avg_pages
         FROM (SELECT session_id, COUNT(*) AS n
                 FROM page_views
                WHERE ${window} AND ${HUMAN} AND session_id IS NOT NULL
                GROUP BY session_id) s`,
      [interval],
    ),
  ]);
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

async function readCounts(
  column: string,
  interval: string,
  limit: number,
  extraWhere = "",
): Promise<CountRow[]> {
  const result = await executeQuery<{ label: string | null; count: number; visitors: number }>(
    `SELECT ${column} AS label,
            COUNT(*)::int AS count,
            COUNT(DISTINCT visitor_hash)::int AS visitors
       FROM page_views
      WHERE at >= NOW() - $1::interval AND ${HUMAN} ${extraWhere}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT ${limit}`,
    [interval],
  );
  return result.rows.map((r) => ({
    label: r.label ?? "(unknown)",
    count: Number(r.count),
    visitors: Number(r.visitors),
  }));
}

/** New York wall-clock bucket keys, oldest first, for zero-filling. */
function bucketKeys(unit: "hour" | "day", count: number, now: Date): string[] {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const keys: string[] = [];
  const stepMs = unit === "hour" ? 3_600_000 : 86_400_000;
  for (let i = count - 1; i >= 0; i -= 1) {
    const parts = fmt.formatToParts(new Date(now.getTime() - i * stepMs));
    const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? "00";
    const day = `${get("year")}-${get("month")}-${get("day")}`;
    keys.push(unit === "hour" ? `${day}T${get("hour")}` : day);
  }
  return [...new Set(keys)];
}

export async function getTrafficSummary(range: TrafficRange): Promise<TrafficSummary> {
  const interval = RANGE_INTERVAL[range];
  const { unit, count } = RANGE_BUCKET[range];
  const now = new Date();

  try {
    const [
      meta,
      totals,
      previous,
      activeVisitors,
      activePages,
      seriesRes,
      topPages,
      entryRes,
      referrers,
      utmSources,
      countries,
      devices,
      browsers,
      operatingSystems,
      botsRes,
      recentRes,
    ] = await Promise.all([
      executeQuery<{ since: Date | null; total: number }>(
        `SELECT MIN(at) AS since, COUNT(*)::int AS total FROM page_views WHERE ${HUMAN}`,
      ),
      readTotals("NOW() - $1::interval", "NOW()", interval),
      readTotals("NOW() - 2 * $1::interval", "NOW() - $1::interval", interval),
      executeQuery<{ n: number }>(
        `SELECT COUNT(DISTINCT visitor_hash)::int AS n
           FROM page_views
          WHERE at >= NOW() - INTERVAL '${ACTIVE_WINDOW_MINUTES} minutes' AND ${HUMAN}`,
      ),
      executeQuery<{ label: string; count: number }>(
        `SELECT path AS label, COUNT(DISTINCT visitor_hash)::int AS count
           FROM page_views
          WHERE at >= NOW() - INTERVAL '${ACTIVE_WINDOW_MINUTES} minutes' AND ${HUMAN}
          GROUP BY path ORDER BY count DESC LIMIT 8`,
      ),
      executeQuery<{ key: string; pageviews: number; visitors: number }>(
        `SELECT to_char(date_trunc('${unit}', at AT TIME ZONE 'America/New_York'),
                        '${unit === "hour" ? 'YYYY-MM-DD"T"HH24' : "YYYY-MM-DD"}') AS key,
                COUNT(*)::int AS pageviews,
                COUNT(DISTINCT visitor_hash)::int AS visitors
           FROM page_views
          WHERE at >= NOW() - $1::interval AND ${HUMAN}
          GROUP BY 1 ORDER BY 1`,
        [interval],
      ),
      readCounts("path", interval, 15),
      executeQuery<{ label: string; count: number }>(
        `SELECT path AS label, COUNT(*)::int AS count
           FROM (SELECT DISTINCT ON (session_id) session_id, path
                   FROM page_views
                  WHERE at >= NOW() - $1::interval AND ${HUMAN} AND session_id IS NOT NULL
                  ORDER BY session_id, at ASC) s
          GROUP BY path ORDER BY count DESC LIMIT 10`,
        [interval],
      ),
      readCounts("COALESCE(referrer_host, '(direct)')", interval, 12),
      readCounts("utm_source", interval, 10, "AND utm_source IS NOT NULL"),
      readCounts("COALESCE(country, '(unknown)')", interval, 15),
      readCounts("device_type", interval, 5),
      readCounts("COALESCE(browser, '(other)')", interval, 8),
      readCounts("COALESCE(os, '(other)')", interval, 8),
      executeQuery<{ n: number }>(
        `SELECT COUNT(*)::int AS n FROM page_views WHERE at >= NOW() - $1::interval AND is_bot`,
        [interval],
      ),
      executeQuery<{
        id: string;
        at: Date;
        path: string;
        referrer_host: string | null;
        country: string | null;
        region: string | null;
        city: string | null;
        device_type: string;
        browser: string | null;
        os: string | null;
        session_id: string | null;
        user_id: string | null;
        email: string | null;
        name: string | null;
        role: string | null;
      }>(
        `SELECT pv.id::text AS id, pv.at, pv.path, pv.referrer_host, pv.country,
                pv.region, pv.city, pv.device_type, pv.browser, pv.os,
                pv.session_id, pv.user_id,
                u.email, COALESCE(up.name, u.name) AS name, u.role::text AS role
           FROM page_views pv
           LEFT JOIN users u ON u.id::text = pv.user_id
           LEFT JOIN user_profiles up ON up.user_id = u.id
          WHERE NOT pv.is_bot
          ORDER BY pv.at DESC
          LIMIT 40`,
      ),
    ]);

    const seriesMap = new Map(seriesRes.rows.map((r) => [r.key, r]));
    const series: TrafficBucket[] = bucketKeys(unit, count, now).map((key) => {
      const hit = seriesMap.get(key);
      return {
        key,
        pageviews: Number(hit?.pageviews ?? 0),
        visitors: Number(hit?.visitors ?? 0),
      };
    });

    const since = meta.rows[0]?.since;
    return {
      generatedAt: now.toISOString(),
      range,
      status: "live",
      trackingSince: since ? new Date(since).toISOString() : null,
      totalPageviewsAllTime: Number(meta.rows[0]?.total ?? 0),
      activeNow: {
        visitors: Number(activeVisitors.rows[0]?.n ?? 0),
        pages: activePages.rows.map((r) => ({ label: r.label, count: Number(r.count) })),
      },
      totals,
      previous,
      series,
      bucketUnit: unit,
      topPages,
      entryPages: entryRes.rows.map((r) => ({ label: r.label, count: Number(r.count) })),
      referrers,
      utmSources,
      countries,
      devices,
      browsers,
      operatingSystems,
      bots: Number(botsRes.rows[0]?.n ?? 0),
      recent: recentRes.rows.map((r) => ({
        id: r.id,
        at: new Date(r.at).toISOString(),
        path: r.path,
        referrerHost: r.referrer_host,
        country: r.country,
        region: r.region,
        city: r.city,
        deviceType: r.device_type,
        browser: r.browser,
        os: r.os,
        sessionId: r.session_id,
        user:
          r.user_id && r.email
            ? {
                id: r.user_id,
                email: r.email,
                name: r.name,
                isAdmin: (r.role ?? "").toUpperCase() === "ADMIN",
              }
            : null,
      })),
    };
  } catch (err) {
    if (isMissingRelation(err)) {
      return emptySummary(
        range,
        "missing-table",
        "page_views does not exist yet — migration 86-admin-analytics.sql applies on the next backend deploy",
      );
    }
    _logger.error("[traffic] summary failed:", err);
    return emptySummary(range, "error", err instanceof Error ? err.message : "query failed");
  }
}

// ─── Compact numbers for the overview pulse ─────────────────────────────────

export interface TrafficPulse {
  status: TrafficSummary["status"];
  activeNow: number;
  pageviews24h: number;
  visitors24h: number;
  pageviewsPrev24h: number;
  lastVisitAt: string | null;
}

export async function getTrafficPulse(): Promise<TrafficPulse> {
  try {
    const res = await executeQuery<{
      active: number;
      pv24: number;
      v24: number;
      pvprev: number;
      last_at: Date | null;
    }>(
      `SELECT
         COUNT(DISTINCT visitor_hash) FILTER (WHERE at >= NOW() - INTERVAL '${ACTIVE_WINDOW_MINUTES} minutes')::int AS active,
         COUNT(*) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS pv24,
         COUNT(DISTINCT visitor_hash) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS v24,
         COUNT(*) FILTER (WHERE at < NOW() - INTERVAL '24 hours')::int AS pvprev,
         MAX(at) AS last_at
       FROM page_views
       WHERE at >= NOW() - INTERVAL '48 hours' AND ${HUMAN}`,
    );
    const [r] = res.rows;
    return {
      status: "live",
      activeNow: Number(r?.active ?? 0),
      pageviews24h: Number(r?.pv24 ?? 0),
      visitors24h: Number(r?.v24 ?? 0),
      pageviewsPrev24h: Number(r?.pvprev ?? 0),
      lastVisitAt: r?.last_at ? new Date(r.last_at).toISOString() : null,
    };
  } catch (err) {
    const status = isMissingRelation(err) ? "missing-table" : "error";
    if (status === "error") _logger.error("[traffic] pulse failed:", err);
    return {
      status,
      activeNow: 0,
      pageviews24h: 0,
      visitors24h: 0,
      pageviewsPrev24h: 0,
      lastVisitAt: null,
    };
  }
}
