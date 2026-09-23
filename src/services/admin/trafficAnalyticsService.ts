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

import { executeQuery } from "@/lib/database/connection";
import { isMissingRelation } from "@/lib/database/pgErrors";
import { _logger } from "@/lib/logger";
import {
  ACTIVE_WINDOW_MINUTES,
  readActiveNow,
  readBots,
  readDimensions,
  readEntryPages,
  readMeta,
  readRecent,
  readSeries,
  readTopPages,
  readTotals,
} from "@/services/admin/trafficReaders";
import type {
  PageViewInsert,
  TrafficPulse,
  TrafficRange,
  TrafficStatus,
  TrafficSummary,
  TrafficTotals,
} from "@/services/admin/trafficTypes";

const RANGE_INTERVAL: Record<TrafficRange, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days" };

const RANGE_BUCKET: Record<TrafficRange, { unit: "hour" | "day"; count: number }> = {
  "24h": { unit: "hour", count: 24 },
  "7d": { unit: "day", count: 7 },
  "30d": { unit: "day", count: 30 },
};

let warnedMissingTable = false;

/**
 * Insert one page view. Never throws: analytics must not be able to break a
 * page, and the beacon has no user to show an error to.
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
        row.path, row.referrerHost, row.utmSource, row.utmMedium, row.utmCampaign,
        row.visitorHash, row.sessionId, row.userId, row.country, row.region, row.city,
        row.deviceType, row.browser, row.os, row.isBot,
      ],
      { logQuery: false },
    );
    return true;
  } catch (err) {
    if (!isMissingRelation(err)) {
      _logger.error("[traffic] page view insert failed:", err);
    } else if (!warnedMissingTable) {
      warnedMissingTable = true;
      _logger.error("[traffic] page_views missing — migration 86-admin-analytics.sql has not been applied");
    }
    return false;
  }
}

function emptyTotals(): TrafficTotals {
  return { pageviews: 0, visitors: 0, sessions: 0, signedInUsers: 0, bounceRate: null, pagesPerSession: null };
}

function emptySummary(range: TrafficRange, status: TrafficStatus, detail: string): TrafficSummary {
  return {
    generatedAt: new Date().toISOString(),
    range,
    status,
    detail,
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

function failedSummary(range: TrafficRange, err: unknown): TrafficSummary {
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

export async function getTrafficSummary(range: TrafficRange): Promise<TrafficSummary> {
  const interval = RANGE_INTERVAL[range];
  const { unit, count } = RANGE_BUCKET[range];
  const now = new Date();
  try {
    const [meta, totals, previous, activeNow, series, topPages, entryPages, dimensions, bots, recent] =
      await Promise.all([
        readMeta(),
        readTotals("NOW() - $1::interval", "NOW()", interval),
        readTotals("NOW() - 2 * $1::interval", "NOW() - $1::interval", interval),
        readActiveNow(),
        readSeries(interval, unit, count, now),
        readTopPages(interval),
        readEntryPages(interval),
        readDimensions(interval),
        readBots(interval),
        readRecent(),
      ]);
    return {
      generatedAt: now.toISOString(),
      range,
      status: "live",
      trackingSince: meta.since,
      totalPageviewsAllTime: meta.total,
      activeNow,
      totals,
      previous,
      series,
      bucketUnit: unit,
      topPages,
      entryPages,
      ...dimensions,
      bots,
      recent,
    };
  } catch (err) {
    return failedSummary(range, err);
  }
}

/** Compact numbers for the overview pulse — one query. */
export async function getTrafficPulse(): Promise<TrafficPulse> {
  try {
    const res = await executeQuery<{ active: number; pv24: number; v24: number; pvprev: number; last_at: Date | null }>(
      `SELECT
         COUNT(DISTINCT visitor_hash) FILTER (WHERE at >= NOW() - INTERVAL '${ACTIVE_WINDOW_MINUTES} minutes')::int AS active,
         COUNT(*) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS pv24,
         COUNT(DISTINCT visitor_hash) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS v24,
         COUNT(*) FILTER (WHERE at < NOW() - INTERVAL '24 hours')::int AS pvprev,
         MAX(at) AS last_at
       FROM page_views
       WHERE at >= NOW() - INTERVAL '48 hours' AND NOT is_bot`,
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
    const missing = isMissingRelation(err);
    if (!missing) _logger.error("[traffic] pulse failed:", err);
    const status: TrafficStatus = missing ? "missing-table" : "error";
    return { status, activeNow: 0, pageviews24h: 0, visitors24h: 0, pageviewsPrev24h: 0, lastVisitAt: null };
  }
}
