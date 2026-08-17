/**
 * Admin Reliability Service
 *
 * Three operator questions the admin surface could not answer before, each
 * backed by a table the cron layer has been filling for months while nothing
 * read it back:
 *
 *   1. "Is the platform getting better or worse?"  — `system_health_snapshots`
 *      holds an hourly snapshot of the full system-status payload. The reader
 *      `healthSnapshotService.getRecentSnapshotOverall()` was written for an
 *      "admin sparkline / drift indicator" that was never built, so the admin
 *      could only ever see *now*, never the trend.
 *
 *   2. "Which user-facing flows are actually flaky?" — `synthetic_probe_results`
 *      records every synthetic probe run (auth, onboarding, recommendations,
 *      stripe webhook, each cron). `systemStatusService` reduces these to a
 *      single current verdict, which discards the failure *rate* — a probe
 *      failing 1-in-10 reads as OK whenever the latest run happened to pass.
 *
 *   3. "Did anyone actually receive that alert?" — `alert_events.dispatch`
 *      records the per-channel delivery result, but `getRecentAlerts` selects
 *      only `dispatch->>'suppressed'` and drops the rest. An alert that fired
 *      and reached nobody is indistinguishable from one that was delivered.
 *
 * Honesty contract (CLAUDE.md): every getter degrades to `live: false` with
 * neutral values rather than inventing numbers. A `live: true` result with
 * zero rows means "measured, genuinely empty" — callers may render that as a
 * real zero. `live: false` means "we could not measure" and must never be
 * rendered as a zero.
 *
 * @file src/services/adminReliabilityService.ts
 */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { getRecentSnapshotOverall } from "@/services/healthSnapshotService";
import type { FlowStatus } from "@/services/systemStatusService";

// ─── 1 · Health history & drift ────────────────────────────────────────

export interface HealthHistoryPoint {
  capturedAt: string;
  overall: FlowStatus;
}

export interface HealthDrift {
  /** Share of snapshots that were not OK, this week vs the week before. */
  thisWeekBadRate: number;
  lastWeekBadRate: number;
  /** Positive = degrading, negative = improving. Null when either week is empty. */
  delta: number | null;
  thisWeekSamples: number;
  lastWeekSamples: number;
}

export interface HealthHistoryData {
  points: HealthHistoryPoint[];
  windowHours: number;
  /** Share of snapshots in-window whose overall status was OK. */
  uptimePct: number | null;
  drift: HealthDrift | null;
  live: boolean;
}

const EMPTY_HEALTH_HISTORY: HealthHistoryData = {
  points: [],
  windowHours: 0,
  uptimePct: null,
  drift: null,
  live: false,
};

/**
 * Hourly overall-status history plus a week-over-week drift comparison.
 * Reads only `captured_at`/`overall` — the full JSONB payload stays on disk.
 */
export async function getHealthHistory(
  windowHours = 168,
): Promise<HealthHistoryData> {
  const hours = Math.max(1, Math.min(Math.floor(windowHours) || 168, 720));

  try {
    // Reuses the snapshot service's own reader — the one whose docstring
    // always described an "admin sparkline / drift indicator" but which had no
    // caller until this panel existed.
    const points: HealthHistoryPoint[] = await getRecentSnapshotOverall(
      720,
      hours,
    );

    const okCount = points.filter((p) => p.overall === "OK").length;
    const uptimePct = points.length > 0 ? (okCount / points.length) * 100 : null;

    // Week-over-week drift is measured over a fixed 14d window regardless of
    // the caller's requested display window, so the comparison is stable.
    const driftRes = await executeQuery(
      `SELECT
         COUNT(*) FILTER (WHERE captured_at > now() - interval '7 days')::int AS tw_total,
         COUNT(*) FILTER (WHERE captured_at > now() - interval '7 days'
                            AND overall <> 'OK')::int AS tw_bad,
         COUNT(*) FILTER (WHERE captured_at <= now() - interval '7 days')::int AS lw_total,
         COUNT(*) FILTER (WHERE captured_at <= now() - interval '7 days'
                            AND overall <> 'OK')::int AS lw_bad
       FROM system_health_snapshots
       WHERE captured_at > now() - interval '14 days'`,
    );

    const d = driftRes.rows[0] as
      | { tw_total: number; tw_bad: number; lw_total: number; lw_bad: number }
      | undefined;

    let drift: HealthDrift | null = null;
    if (d) {
      const twTotal = Number(d.tw_total);
      const lwTotal = Number(d.lw_total);
      const thisWeekBadRate = twTotal > 0 ? Number(d.tw_bad) / twTotal : 0;
      const lastWeekBadRate = lwTotal > 0 ? Number(d.lw_bad) / lwTotal : 0;
      drift = {
        thisWeekBadRate,
        lastWeekBadRate,
        // Null rather than a fake 0 when a week has no samples to compare.
        delta:
          twTotal > 0 && lwTotal > 0
            ? thisWeekBadRate - lastWeekBadRate
            : null,
        thisWeekSamples: twTotal,
        lastWeekSamples: lwTotal,
      };
    }

    return { points, windowHours: hours, uptimePct, drift, live: true };
  } catch (error) {
    _logger.warn("[adminReliability] health history query failed:", error);
    return { ...EMPTY_HEALTH_HISTORY, windowHours: hours };
  }
}

// ─── 2 · Synthetic probe reliability ───────────────────────────────────

export interface ProbeReliabilityRow {
  probeName: string;
  runs: number;
  failures: number;
  /** 0–1. Runs are the denominator, so this is a true rate, not a count. */
  failureRate: number;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
  maxLatencyMs: number | null;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastError: string | null;
}

export interface ProbeReliabilityData {
  probes: ProbeReliabilityRow[];
  windowDays: number;
  totalRuns: number;
  totalFailures: number;
  live: boolean;
}

/**
 * Per-probe reliability over a rolling window. Surfaces the failure *rate*
 * that the single-verdict system-status view collapses away.
 */
export async function getProbeReliability(
  windowDays = 7,
): Promise<ProbeReliabilityData> {
  const days = Math.max(1, Math.min(Math.floor(windowDays) || 7, 90));

  try {
    const result = await executeQuery(
      `SELECT
         probe_name,
         COUNT(*)::int AS runs,
         COUNT(*) FILTER (WHERE status <> 'success')::int AS failures,
         PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms)::int AS p50,
         PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::int AS p95,
         MAX(latency_ms)::int AS max_ms,
         MAX(started_at) AS last_run_at,
         (ARRAY_AGG(status ORDER BY started_at DESC))[1] AS last_status,
         (ARRAY_AGG(error_message ORDER BY started_at DESC)
            FILTER (WHERE error_message IS NOT NULL))[1] AS last_error
       FROM synthetic_probe_results
       WHERE started_at > now() - make_interval(days => $1)
       GROUP BY probe_name
       ORDER BY failures DESC, runs DESC`,
      [days],
    );

    const probes: ProbeReliabilityRow[] = result.rows.map(
      (row: Record<string, unknown>) => {
        const runs = Number(row.runs) || 0;
        const failures = Number(row.failures) || 0;
        return {
          probeName: String(row.probe_name),
          runs,
          failures,
          failureRate: runs > 0 ? failures / runs : 0,
          p50LatencyMs: row.p50 === null ? null : Number(row.p50),
          p95LatencyMs: row.p95 === null ? null : Number(row.p95),
          maxLatencyMs: row.max_ms === null ? null : Number(row.max_ms),
          lastRunAt: row.last_run_at
            ? new Date(row.last_run_at as string).toISOString()
            : null,
          lastStatus: row.last_status ? String(row.last_status) : null,
          lastError: row.last_error ? String(row.last_error) : null,
        };
      },
    );

    return {
      probes,
      windowDays: days,
      totalRuns: probes.reduce((sum, p) => sum + p.runs, 0),
      totalFailures: probes.reduce((sum, p) => sum + p.failures, 0),
      live: true,
    };
  } catch (error) {
    _logger.warn("[adminReliability] probe reliability query failed:", error);
    return {
      probes: [],
      windowDays: days,
      totalRuns: 0,
      totalFailures: 0,
      live: false,
    };
  }
}

// ─── 3 · Alert delivery ────────────────────────────────────────────────

export interface AlertChannelDelivery {
  channel: string;
  attempted: number;
  delivered: number;
  failed: number;
  /** 0–1 share of attempts that reached the channel. */
  deliveryRate: number;
  lastError: string | null;
  lastFailureAt: string | null;
}

export interface AlertDeliveryData {
  windowDays: number;
  alertsFired: number;
  suppressed: number;
  channels: AlertChannelDelivery[];
  live: boolean;
}

/**
 * Per-channel delivery outcomes for alerts fired in-window.
 *
 * Channels are discovered by expanding the `dispatch` JSONB rather than
 * hardcoding a known list, so a channel added later shows up without a code
 * change. The `jsonb_typeof = 'object'` guard skips scalar bookkeeping keys
 * such as `suppressed`, which sit alongside the channel objects.
 */
export async function getAlertDelivery(
  windowDays = 30,
): Promise<AlertDeliveryData> {
  const days = Math.max(1, Math.min(Math.floor(windowDays) || 30, 365));

  try {
    const totalsRes = await executeQuery(
      `SELECT
         COUNT(*)::int AS fired,
         COUNT(*) FILTER (
           WHERE COALESCE((dispatch->>'suppressed')::boolean, false)
         )::int AS suppressed
       FROM alert_events
       WHERE triggered_at > now() - make_interval(days => $1)`,
      [days],
    );

    const totals = totalsRes.rows[0] as
      | { fired: number; suppressed: number }
      | undefined;

    const channelRes = await executeQuery(
      `SELECT
         ch.key AS channel,
         COUNT(*)::int AS attempted,
         COUNT(*) FILTER (WHERE ch.value->>'ok' = 'true')::int AS delivered,
         COUNT(*) FILTER (WHERE ch.value->>'ok' = 'false')::int AS failed,
         MAX(a.triggered_at) FILTER (WHERE ch.value->>'ok' = 'false')
           AS last_failure_at,
         (ARRAY_AGG(ch.value->>'error' ORDER BY a.triggered_at DESC)
            FILTER (WHERE ch.value->>'ok' = 'false'))[1] AS last_error
       FROM alert_events a
       CROSS JOIN LATERAL jsonb_each(a.dispatch) AS ch(key, value)
       WHERE a.triggered_at > now() - make_interval(days => $1)
         AND jsonb_typeof(ch.value) = 'object'
       GROUP BY ch.key
       ORDER BY failed DESC, attempted DESC`,
      [days],
    );

    const channels: AlertChannelDelivery[] = channelRes.rows.map(
      (row: Record<string, unknown>) => {
        const attempted = Number(row.attempted) || 0;
        const delivered = Number(row.delivered) || 0;
        return {
          channel: String(row.channel),
          attempted,
          delivered,
          failed: Number(row.failed) || 0,
          deliveryRate: attempted > 0 ? delivered / attempted : 0,
          lastError: row.last_error ? String(row.last_error) : null,
          lastFailureAt: row.last_failure_at
            ? new Date(row.last_failure_at as string).toISOString()
            : null,
        };
      },
    );

    return {
      windowDays: days,
      alertsFired: Number(totals?.fired ?? 0),
      suppressed: Number(totals?.suppressed ?? 0),
      channels,
      live: true,
    };
  } catch (error) {
    _logger.warn("[adminReliability] alert delivery query failed:", error);
    return {
      windowDays: days,
      alertsFired: 0,
      suppressed: 0,
      channels: [],
      live: false,
    };
  }
}

// ─── Combined payload ──────────────────────────────────────────────────

export interface AdminReliabilityPayload {
  generatedAt: string;
  health: HealthHistoryData;
  probes: ProbeReliabilityData;
  alerts: AlertDeliveryData;
}

/**
 * All three reliability reads, in parallel. Each degrades independently so a
 * single failing source cannot blank the panel.
 */
export async function getAdminReliability(options?: {
  historyHours?: number;
  probeDays?: number;
  alertDays?: number;
}): Promise<AdminReliabilityPayload> {
  const [health, probes, alerts] = await Promise.all([
    getHealthHistory(options?.historyHours ?? 168),
    getProbeReliability(options?.probeDays ?? 7),
    getAlertDelivery(options?.alertDays ?? 30),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    health,
    probes,
    alerts,
  };
}
