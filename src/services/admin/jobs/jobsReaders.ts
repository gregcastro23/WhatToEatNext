/**
 * SQL readers behind /admin/jobs. Every run of every cron and synthetic probe
 * lands in `synthetic_probe_results` (crons as `cron:<name>`), and every
 * status transition in `alert_events`; these read both back.
 *
 * @file src/services/admin/jobs/jobsReaders.ts
 */

import { executeQuery } from "@/lib/database/connection";
import type { AlertNoiseRow, JobRun, JobRunStats, JobRunStatus } from "@/services/admin/jobs/jobsTypes";

const RECENT_RUNS_PER_JOB = 24;

function isRunStatus(value: unknown): value is JobRunStatus {
  return value === "success" || value === "failure" || value === "timeout";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function iso(value: Date | string | null): string | null {
  return value === null ? null : new Date(value).toISOString();
}

function num(value: number | string | null): number | null {
  return value === null ? null : Number(value);
}

interface StatsRow {
  probe_name: string;
  runs7d: number;
  failures7d: number;
  timeouts7d: number;
  runs24h: number;
  p50: number | null;
  p95: number | null;
  max_ms: number | null;
  last_run_at: Date | null;
  last_status: string | null;
  last_error: string | null;
  last_error_at: Date | null;
  last_details: unknown;
}

function toStats(row: StatsRow): JobRunStats {
  return {
    runs7d: row.runs7d,
    failures7d: row.failures7d,
    timeouts7d: row.timeouts7d,
    runs24h: row.runs24h,
    p50Ms: num(row.p50),
    p95Ms: num(row.p95),
    maxMs: num(row.max_ms),
    lastRunAt: iso(row.last_run_at),
    lastStatus: isRunStatus(row.last_status) ? row.last_status : null,
    lastError: row.last_error,
    lastErrorAt: iso(row.last_error_at),
    lastDetails: isRecord(row.last_details) ? row.last_details : null,
  };
}

/** Seven-day run statistics per record key (`cron:<name>` or a probe name). */
export async function readRunStats(recordKeys: string[]): Promise<Map<string, JobRunStats>> {
  const result = await executeQuery<StatsRow & Record<string, unknown>>(
    `SELECT probe_name,
            COUNT(*)::int AS runs7d,
            COUNT(*) FILTER (WHERE status = 'failure')::int AS failures7d,
            COUNT(*) FILTER (WHERE status = 'timeout')::int AS timeouts7d,
            COUNT(*) FILTER (WHERE started_at > now() - interval '24 hours')::int AS runs24h,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms)::int AS p50,
            PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::int AS p95,
            MAX(latency_ms)::int AS max_ms,
            MAX(started_at) AS last_run_at,
            (ARRAY_AGG(status ORDER BY started_at DESC))[1] AS last_status,
            (ARRAY_AGG(error_message ORDER BY started_at DESC)
               FILTER (WHERE error_message IS NOT NULL))[1] AS last_error,
            MAX(started_at) FILTER (WHERE error_message IS NOT NULL) AS last_error_at,
            (ARRAY_AGG(response_payload ORDER BY started_at DESC))[1] AS last_details
       FROM synthetic_probe_results
      WHERE probe_name = ANY($1::text[])
        AND started_at > now() - interval '7 days'
      GROUP BY probe_name`,
    [recordKeys],
  );
  return new Map(result.rows.map((row) => [row.probe_name, toStats(row)]));
}

interface RecentRow {
  probe_name: string;
  started_at: Date;
  status: string;
  latency_ms: number | null;
}

/**
 * The latest runs per record key, newest first, with no time bound — a daily
 * job that last ran eight days ago must read `late`, not `never`. One
 * LIMIT-bounded index descent per key via LATERAL.
 */
export async function readRecentRuns(recordKeys: string[]): Promise<Map<string, JobRun[]>> {
  const result = await executeQuery<RecentRow & Record<string, unknown>>(
    `SELECT n.key AS probe_name, r.started_at, r.status, r.latency_ms
       FROM unnest($1::text[]) AS n(key)
       CROSS JOIN LATERAL (
         SELECT s.started_at, s.status, s.latency_ms
           FROM synthetic_probe_results s
          WHERE s.probe_name = n.key
          ORDER BY s.started_at DESC
          LIMIT $2
       ) r
      ORDER BY n.key, r.started_at DESC`,
    [recordKeys, RECENT_RUNS_PER_JOB],
  );
  const runs = new Map<string, JobRun[]>();
  for (const row of result.rows) {
    if (!isRunStatus(row.status)) continue;
    const list = runs.get(row.probe_name) ?? [];
    list.push({ startedAt: new Date(row.started_at).toISOString(), status: row.status, latencyMs: row.latency_ms });
    runs.set(row.probe_name, list);
  }
  return runs;
}

interface AlertRow {
  component: string;
  fired: number;
  emailed: number;
  suppressed: number;
  worsened: number;
  recovered: number;
  last_title: string | null;
  last_at: Date | null;
}

/** Per-component alert volume: what fired, what reached an inbox, what the cooldown held back. */
export async function readAlertNoise(days: number): Promise<AlertNoiseRow[]> {
  const result = await executeQuery<AlertRow & Record<string, unknown>>(
    `SELECT component,
            COUNT(*)::int AS fired,
            COUNT(*) FILTER (WHERE dispatch->'email'->>'ok' = 'true')::int AS emailed,
            COUNT(*) FILTER (WHERE COALESCE((dispatch->>'suppressed')::boolean, false))::int AS suppressed,
            COUNT(*) FILTER (WHERE current_status IN ('DEGRADED', 'INCIDENT'))::int AS worsened,
            COUNT(*) FILTER (WHERE current_status = 'OK')::int AS recovered,
            (ARRAY_AGG(title ORDER BY triggered_at DESC))[1] AS last_title,
            MAX(triggered_at) AS last_at
       FROM alert_events
      WHERE triggered_at > now() - make_interval(days => $1)
      GROUP BY component
      ORDER BY fired DESC, component`,
    [days],
  );
  return result.rows.map((row) => ({
    component: row.component,
    fired: row.fired,
    emailed: row.emailed,
    suppressed: row.suppressed,
    worsened: row.worsened,
    recovered: row.recovered,
    lastTitle: row.last_title,
    lastAt: iso(row.last_at),
  }));
}
