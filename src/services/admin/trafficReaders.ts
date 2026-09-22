/**
 * page_views readers behind /admin/traffic. Server-only. Every reader
 * excludes bots (`NOT is_bot`) except `readBots`, which counts them.
 *
 * @file src/services/admin/trafficReaders.ts
 */

import { executeQuery } from "@/lib/database/connection";
import type {
  CountRow,
  RecentPageView,
  TrafficBucket,
  TrafficDimensions,
  TrafficTotals,
} from "@/services/admin/trafficTypes";

const HUMAN = "NOT is_bot";
export const ACTIVE_WINDOW_MINUTES = 5;

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
  const [base, bounce] = await Promise.all([
    executeQuery<{ pageviews: number; visitors: number; sessions: number; signed_in: number }>(
      `SELECT COUNT(*)::int AS pageviews, COUNT(DISTINCT visitor_hash)::int AS visitors,
              COUNT(DISTINCT session_id)::int AS sessions, COUNT(DISTINCT user_id)::int AS signed_in
         FROM page_views WHERE ${window} AND ${HUMAN}`,
      [interval],
    ),
    executeQuery<{ sessions: number; bounced: number; avg_pages: number | null }>(
      `SELECT COUNT(*)::int AS sessions, COUNT(*) FILTER (WHERE n = 1)::int AS bounced,
              AVG(n)::float8 AS avg_pages
         FROM (SELECT session_id, COUNT(*) AS n FROM page_views
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
    readCounts("utm_source", interval, 10, "AND utm_source IS NOT NULL"),
    readCounts("COALESCE(country, '(unknown)')", interval, 15),
    readCounts("device_type", interval, 5),
    readCounts("COALESCE(browser, '(other)')", interval, 8),
    readCounts("COALESCE(os, '(other)')", interval, 8),
  ]);
  return { referrers, utmSources, countries, devices, browsers, operatingSystems };
}

export async function readActiveNow(): Promise<{ visitors: number; pages: CountRow[] }> {
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
       FROM (SELECT DISTINCT ON (session_id) session_id, path FROM page_views
              WHERE at >= NOW() - $1::interval AND ${HUMAN} AND session_id IS NOT NULL
              ORDER BY session_id, at ASC) s
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

interface RecentRow {
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
}

function toRecent(r: RecentRow): RecentPageView {
  return {
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
        ? { id: r.user_id, email: r.email, name: r.name, isAdmin: (r.role ?? "").toUpperCase() === "ADMIN" }
        : null,
  };
}

export async function readRecent(limit = 40): Promise<RecentPageView[]> {
  const res = await executeQuery<RecentRow>(
    `SELECT pv.id::text AS id, pv.at, pv.path, pv.referrer_host, pv.country, pv.region, pv.city,
            pv.device_type, pv.browser, pv.os, pv.session_id, pv.user_id,
            u.email, COALESCE(up.name, u.name) AS name, u.role::text AS role
       FROM page_views pv
       LEFT JOIN users u ON u.id::text = pv.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE NOT pv.is_bot
      ORDER BY pv.at DESC LIMIT ${limit}`,
  );
  return res.rows.map(toRecent);
}
