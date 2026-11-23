/**
 * Traffic analytics — who is visiting alchm.kitchen, from where, and what
 * they read. Server-only.
 *
 * Source: the first-party `page_views` table (migrations 86 + 100), written by
 * the public beacon POST /api/track/pageview. Bots are recorded (is_bot) but
 * are excluded from every human-facing number and reported as their own count.
 *
 * Counting rules, stated because each is a choice:
 *   - "visitors" = distinct visitor_hash. The hash rotates every UTC day, so
 *     over a multi-day range this is the SUM of daily uniques (a person who
 *     came on 3 days counts 3). Labelled "visitor-days" in the UI for 7d/30d.
 *   - "sessions" = distinct per-tab session ids (or visitor_hash when blocked).
 *   - "bounce" = a session with 1 page view, < 15s dwell time, and 0 actions.
 *   - Buckets use the America/New_York day, matching userInsightsService.
 *
 * @file src/services/admin/trafficAnalyticsService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { isMissingColumn, isMissingRelation } from "@/lib/database/pgErrors";
import { runAfterResponse } from "@/lib/hooks/runAfterResponse";
import { _logger } from "@/lib/logger";
import {
  ACTIVE_WINDOW_MINUTES,
  buildVisitorSessions,
  emptyActivationStickiness,
  enrichRecentPageViews,
  readActivationAndStickiness,
  readActiveNow,
  readBots,
  readDimensions,
  readEntryPages,
  readFrictionAlerts,
  readInteractionTallies,
  readLabEngagement,
  readMeta,
  readPlannerFunnel,
  readRecent,
  readRefRollups,
  readRetentionCohorts,
  readRouteFlowMatrix,
  readSeries,
  readSessionFeedback,
  readTopPages,
  readTotals,
} from "@/services/admin/trafficReaders";
import type {
  PageViewInsert,
  SessionFeedbackStatus,
  TrafficPulse,
  TrafficRange,
  TrafficStatus,
  TrafficSummary,
  TrafficTotals,
} from "@/services/admin/trafficTypes";
import {
  evaluateFeedbackWebhookAlert,
  evaluatePageViewWebhookAlerts,
} from "@/services/admin/webhookAlertService";

const RANGE_INTERVAL: Record<TrafficRange, string> = { "24h": "24 hours", "7d": "7 days", "30d": "30 days" };

const RANGE_BUCKET: Record<TrafficRange, { unit: "hour" | "day"; count: number }> = {
  "24h": { unit: "hour", count: 24 },
  "7d": { unit: "day", count: 7 },
  "30d": { unit: "day", count: 30 },
};

let warnedMissingTable = false;

async function insertBaselinePageView(row: PageViewInsert): Promise<void> {
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
}

/**
 * When a visitor signs in mid-session, retroactively attribute earlier
 * anonymous page views from the same browser-tab `session_id` to their user.
 */
async function stitchSessionUser(sessionId: string, userId: string): Promise<void> {
  try {
    await executeQuery(
      `UPDATE page_views
          SET user_id = $1
        WHERE session_id = $2
          AND user_id IS NULL
          AND NOT is_bot`,
      [userId, sessionId],
      { logQuery: false },
    );
  } catch {
    // Non-fatal best-effort attribution
  }
}

async function upsertExtendedPageView(
  row: PageViewInsert,
  viewId: string | null,
  durationMs: number,
  refTag: string | null,
  interactions: string[],
): Promise<void> {
  try {
    await executeQuery(
      `INSERT INTO page_views (
         view_id, path, referrer_host, utm_source, utm_medium, utm_campaign,
         ref_tag, duration_ms, interactions, last_seen_at,
         visitor_hash, session_id, user_id, country, region, city,
         device_type, browser, os, is_bot
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,NOW(),$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       ON CONFLICT (view_id) WHERE view_id IS NOT NULL
       DO UPDATE SET
         duration_ms = GREATEST(page_views.duration_ms, EXCLUDED.duration_ms),
         last_seen_at = NOW(),
         user_id = COALESCE(page_views.user_id, EXCLUDED.user_id),
         ref_tag = COALESCE(page_views.ref_tag, EXCLUDED.ref_tag),
         interactions = CASE
           WHEN jsonb_array_length(EXCLUDED.interactions) >= jsonb_array_length(page_views.interactions)
           THEN EXCLUDED.interactions
           ELSE page_views.interactions
         END
       WHERE COALESCE(jsonb_array_length(page_views.interactions), 0) <= 60`,
      [
        viewId, row.path, row.referrerHost, row.utmSource, row.utmMedium, row.utmCampaign,
        refTag, durationMs, JSON.stringify(interactions),
        row.visitorHash, row.sessionId, row.userId, row.country, row.region, row.city,
        row.deviceType, row.browser, row.os, row.isBot,
      ],
      { logQuery: false },
    );
  } catch (err) {
    if (!isMissingColumn(err)) throw err;
    if (durationMs === 0 && interactions.length === 0) await insertBaselinePageView(row);
  }
}

/**
 * Insert or update one page view. Never throws: analytics must not be able to
 * break a page, and the beacon has no user to show an error to.
 */
export async function recordPageView(row: PageViewInsert): Promise<boolean> {
  const viewId = row.viewId ?? null;
  const durationMs = row.durationMs ?? 0;
  const refTag = row.refTag ?? null;
  const interactions = row.interactions ?? [];

  try {
    if (viewId !== null || durationMs > 0 || refTag !== null || interactions.length > 0) {
      await upsertExtendedPageView(row, viewId, durationMs, refTag, interactions);
    } else {
      await insertBaselinePageView(row);
    }
    const { userId, sessionId } = row;
    if (userId && sessionId && !row.isBot) {
      // Not a bare un-awaited promise: the route returns right after this function,
      // Vercel then freezes the instance, and a write left in flight is resumed
      // later as a "Query read timeout" (seen at 337-373 s in production). The
      // helper registers it with `after()` so the invocation stays alive for it.
      runAfterResponse("traffic.stitchSessionUser", () => stitchSessionUser(sessionId, userId));
    }
    evaluatePageViewWebhookAlerts(row).catch(() => undefined);
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
    sessions: [],
    refRollups: [],
    plannerFunnel: { stages: [], cohorts: [] },
    labEngagement: [],
    feedback: [],
    frictionAlerts: {
      errorSessions60m: 0,
      errorBurstTriggered: false,
      topErrorTag: null,
      topZeroResultQuery: null,
      activeReviewers: [],
    },
    interactionTallies: {
      totalInteractions: 0,
      totalSessionsWithInteractions: 0,
      categories: [],
      rows: [],
    },
    routeFlowMatrix: [],
    activationStickiness: emptyActivationStickiness(),
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
  const retentionDays = range === "24h" ? 7 : range === "7d" ? 14 : 30;
  try {
    const [
      meta, totals, previous, activeNow, series, topPages, entryPages, dimensions, bots, rawRecent,
      refRollups, plannerFunnel, labEngagement, feedback, frictionAlerts, interactionTallies,
      routeFlowMatrix, activationStickiness, retentionCohorts,
    ] = await Promise.all([
      readMeta(), readTotals("NOW() - $1::interval", "NOW()", interval),
      readTotals("NOW() - 2 * $1::interval", "NOW() - $1::interval", interval), readActiveNow(),
      readSeries(interval, unit, count, now), readTopPages(interval), readEntryPages(interval),
      readDimensions(interval), readBots(interval), readRecent(80, interval), readRefRollups(interval),
      readPlannerFunnel(interval), readLabEngagement(interval), readSessionFeedback(50),
      readFrictionAlerts(), readInteractionTallies(interval), readRouteFlowMatrix(interval),
      readActivationAndStickiness(interval), readRetentionCohorts(retentionDays),
    ]);
    const sessions = buildVisitorSessions(rawRecent, now, feedback);
    const recent = enrichRecentPageViews(rawRecent, sessions);
    return {
      generatedAt: now.toISOString(), range, status: "live", trackingSince: meta.since,
      totalPageviewsAllTime: meta.total, activeNow, totals, previous, series, bucketUnit: unit,
      topPages, entryPages, ...dimensions, bots, recent, sessions, refRollups, plannerFunnel,
      labEngagement, feedback, frictionAlerts, interactionTallies, routeFlowMatrix, activationStickiness, retentionCohorts,
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
         COUNT(DISTINCT visitor_hash) FILTER (WHERE COALESCE(last_seen_at, at) >= NOW() - INTERVAL '${ACTIVE_WINDOW_MINUTES} minutes')::int AS active,
         COUNT(*) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS pv24,
         COUNT(DISTINCT visitor_hash) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS v24,
         COUNT(*) FILTER (WHERE at < NOW() - INTERVAL '24 hours')::int AS pvprev,
         MAX(COALESCE(last_seen_at, at)) AS last_at
       FROM page_views
       WHERE at >= NOW() - INTERVAL '48 hours' AND NOT is_bot AND path <> '/admin' AND path NOT LIKE '/admin/%'`,
    ).catch(async (err: unknown) => {
      if (!isMissingColumn(err)) throw err;
      return executeQuery<{ active: number; pv24: number; v24: number; pvprev: number; last_at: Date | null }>(
        `SELECT
           COUNT(DISTINCT visitor_hash) FILTER (WHERE at >= NOW() - INTERVAL '${ACTIVE_WINDOW_MINUTES} minutes')::int AS active,
           COUNT(*) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS pv24,
           COUNT(DISTINCT visitor_hash) FILTER (WHERE at >= NOW() - INTERVAL '24 hours')::int AS v24,
           COUNT(*) FILTER (WHERE at < NOW() - INTERVAL '24 hours')::int AS pvprev,
           MAX(at) AS last_at
         FROM page_views
         WHERE at >= NOW() - INTERVAL '48 hours' AND NOT is_bot AND path <> '/admin' AND path NOT LIKE '/admin/%'`,
      );
    });
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

export interface SessionFeedbackInsert {
  viewId: string | null;
  sessionId: string | null;
  visitorHash: string;
  userId: string | null;
  path: string;
  refTag: string | null;
  rating: number | null;
  note: string;
}

/**
 * Persist contextual micro-feedback tied to `view_id` and `session_id`, and
 * append a conversion marker to `page_views.interactions` so the feedback event
 * is also visible in the interaction stream.
 */
export async function recordSessionFeedback(input: SessionFeedbackInsert): Promise<boolean> {
  const tag = input.rating ? `conversion:feedback_${input.rating}star` : "conversion:feedback_note";
  try {
    await executeQuery(
      `INSERT INTO session_feedback (
         view_id, session_id, visitor_hash, user_id, path, ref_tag, rating, note
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        input.viewId,
        input.sessionId,
        input.visitorHash,
        input.userId,
        input.path,
        input.refTag,
        input.rating,
        input.note,
      ],
      { logQuery: false },
    ).catch((err: unknown) => {
      if (!isMissingRelation(err)) throw err;
    });

    if (input.viewId) {
      await executeQuery(
        `UPDATE page_views
            SET interactions = CASE
              WHEN NOT (interactions @> to_jsonb($2::text))
               AND COALESCE(jsonb_array_length(interactions), 0) <= 60
              THEN interactions || to_jsonb($2::text)
              ELSE interactions
            END,
            last_seen_at = NOW()
          WHERE view_id = $1`,
        [input.viewId, tag],
        { logQuery: false },
      ).catch(() => undefined);
    }
    evaluateFeedbackWebhookAlert(input).catch(() => undefined);
    return true;
  } catch (err) {
    _logger.error("[traffic] session feedback insert failed:", err);
    return false;
  }
}

export interface SessionFeedbackStatusUpdate {
  id: string;
  status: SessionFeedbackStatus;
  resolvedAt: string | null;
}

/**
 * Update `session_feedback.status` (`open` | `resolved` | `dismissed`) and
 * `resolved_at` timestamp so operators can triage issues out of open queues.
 */
export async function updateSessionFeedbackStatus(
  id: string,
  status: SessionFeedbackStatus,
): Promise<SessionFeedbackStatusUpdate | null> {
  try {
    const res = await executeQuery<{
      id: string;
      status: string;
      resolved_at: Date | null;
    }>(
      `UPDATE session_feedback
          SET status = $2,
              resolved_at = CASE
                WHEN $2 IN ('resolved', 'dismissed') THEN NOW()
                ELSE NULL
              END
        WHERE id = $1::bigint
        RETURNING id::text AS id, status, resolved_at`,
      [id, status],
      { logQuery: false },
    );
    const [row] = res.rows;
    if (!row) return null;
    const normalizedStatus: SessionFeedbackStatus =
      row.status === "resolved" || row.status === "dismissed" ? row.status : "open";
    return {
      id: row.id,
      status: normalizedStatus,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : null,
    };
  } catch (err) {
    if (isMissingColumn(err) || isMissingRelation(err)) {
      return null;
    }
    throw err;
  }
}
