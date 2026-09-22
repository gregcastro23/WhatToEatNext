/**
 * Cron heartbeats — last-run visibility for every scheduled job.
 *
 * The synthetic probes already record each run in `synthetic_probe_results`,
 * but the remaining crons (reconciliation, pruning, cache warming…) emit
 * alerts only on problems and write no run record — a dead cron is silence
 * indistinguishable from health. Every cron route therefore records a
 * heartbeat row per run via `recordCronRun()` (probe_name `cron:<name>`, same
 * table, no new schema), and `getCronHeartbeats()` evaluates each job against
 * its declared schedule (src/services/cronRegistry.ts).
 *
 * Verdicts are built to page on a job that is actually broken, not on one bad
 * tick. Measured 2026-09-22: `prewarm-agent-recipes` lost ONE heartbeat to a
 * DB read timeout at 20:00 UTC, and because the watchdog ran in the same
 * minute as the job and "late" meant `> 2 × interval`, the 21:00 snapshot saw
 * a 2h00m gap and emailed "Scheduled jobs degraded" — then "recovered" an hour
 * later. So:
 *   - a sub-daily job is `late` after two consecutive missed runs plus grace,
 *     and `failing` after two consecutive failed runs; a single failure is
 *     `retrying` (visible, not alertable) because the next tick self-heals;
 *   - a daily-or-slower job has no next tick to wait for — one missed or
 *     failed run is the alarm.
 *
 * Honesty contract: no recorded run reports state "never"; `live: false`
 * means the heartbeat table was unreadable.
 *
 * @file src/services/cronHeartbeatService.ts
 */

import { expectedIntervalMinutes } from "@/lib/cron/cronSchedule";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { listHeartbeatJobs } from "@/services/cronRegistry";

export { expectedIntervalMinutes } from "@/lib/cron/cronSchedule";

export type CronRunStatus = "success" | "failure" | "timeout";

export type CronHeartbeatState = "ok" | "retrying" | "late" | "failing" | "never";

export interface CronHeartbeatEntry {
  /** Cron route name, e.g. "esms-reconciliation". */
  name: string;
  /** Cron expression, for operator display. */
  schedule: string;
  /** Widest gap between scheduled fires, in minutes. */
  expectedIntervalMinutes: number;
  /** ISO timestamp of the latest recorded run, null if none recorded. */
  lastRun: string | null;
  lastStatus: CronRunStatus | null;
  /**
   * ok       → last run recent and successful
   * retrying → a sub-daily job's latest run failed but the one before it did
   *            not; its next tick decides (not alertable on its own)
   * late     → no run inside the lateness window (see `lateAfterMinutes`)
   * failing  → consecutive failures (sub-daily) or one failure (daily)
   * never    → no heartbeat rows (job predates heartbeats, or is dead)
   */
  state: CronHeartbeatState;
}

export interface CronHeartbeatData {
  entries: CronHeartbeatEntry[];
  live: boolean;
}

export interface CronRun {
  startedAt: string;
  status: CronRunStatus;
}

const MINUTES_PER_DAY = 1440;
const LATE_GRACE_MINUTES = 15;
const RECORD_RETRY_DELAY_MS = 1_000;

function isRunStatus(value: unknown): value is CronRunStatus {
  return value === "success" || value === "failure" || value === "timeout";
}

/**
 * Minutes of silence before a job is `late`: two missed runs for a sub-daily
 * job, one for daily-or-slower, plus a grace so a watchdog that fires in the
 * same minute as the job never races its heartbeat.
 */
export function lateAfterMinutes(intervalMinutes: number): number {
  const missedRuns = intervalMinutes < MINUTES_PER_DAY ? 2 : 1;
  const grace = Math.max(LATE_GRACE_MINUTES, Math.round(intervalMinutes * 0.1));
  return missedRuns * intervalMinutes + grace;
}

/** Pure verdict for one job from its two most recent runs. Exported for tests. */
export function evaluateHeartbeat(args: {
  intervalMinutes: number;
  latest: CronRun | null;
  previous: CronRun | null;
  nowMs: number;
}): CronHeartbeatState {
  const { intervalMinutes, latest, previous, nowMs } = args;
  if (!latest) return "never";
  const silentMinutes = (nowMs - Date.parse(latest.startedAt)) / 60_000;
  if (silentMinutes > lateAfterMinutes(intervalMinutes)) return "late";
  if (latest.status === "success") return "ok";
  const daily = intervalMinutes >= MINUTES_PER_DAY;
  if (daily || (previous !== null && previous.status !== "success")) return "failing";
  return "retrying";
}

async function insertRun(name: string, run: {
  startedAt: Date;
  completedAt: Date;
  status: CronRunStatus;
  latencyMs: number;
  error: string | null;
  details: Record<string, unknown>;
}): Promise<void> {
  await executeQuery(
    `INSERT INTO synthetic_probe_results
       (probe_name, started_at, completed_at, status, latency_ms, error_message, response_payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [
      `cron:${name}`,
      run.startedAt.toISOString(),
      run.completedAt.toISOString(),
      run.status,
      Math.round(run.latencyMs),
      run.error,
      JSON.stringify(run.details),
    ],
  );
}

/**
 * Record one cron run as a heartbeat row. MUST never throw — a heartbeat
 * failure must not break the cron's real work. One retry: the row that went
 * missing on 2026-09-22 was lost to a single 6s read timeout during the
 * top-of-hour burst, and a lost row reads exactly like a dead job.
 * `details` lands in `response_payload` for the admin Jobs page.
 */
export async function recordCronRun(
  name: string,
  opts: {
    status: CronRunStatus;
    startedAt: Date;
    latencyMs?: number;
    error?: string;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  const completedAt = new Date();
  const run = {
    startedAt: opts.startedAt,
    completedAt,
    status: opts.status,
    latencyMs: opts.latencyMs ?? Math.max(completedAt.getTime() - opts.startedAt.getTime(), 0),
    error: opts.error ?? null,
    details: opts.details ?? {},
  };
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await insertRun(name, run);
      return;
    } catch (err) {
      if (attempt === 2) {
        _logger.error(`[cronHeartbeat] failed to record run for ${name}:`, err);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, RECORD_RETRY_DELAY_MS));
    }
  }
}

interface RecentRunRow {
  name: string;
  started_at: Date | null;
  status: string | null;
}

/** The two most recent runs per job name, newest first. */
async function readRecentRuns(names: string[]): Promise<Map<string, CronRun[]>> {
  const result = await executeQuery<RecentRunRow & Record<string, unknown>>(
    // One indexed LIMIT 2 descent per job via LATERAL — the
    // (probe_name, started_at DESC) index keeps each lookup O(log rows).
    `SELECT n.name, r.started_at, r.status
       FROM unnest($1::text[]) AS n(name)
       LEFT JOIN LATERAL (
         SELECT s.started_at, s.status
           FROM synthetic_probe_results s
          WHERE s.probe_name = 'cron:' || n.name
          ORDER BY s.started_at DESC
          LIMIT 2
       ) r ON true
      ORDER BY n.name, r.started_at DESC`,
    [names],
  );
  const runs = new Map<string, CronRun[]>();
  for (const row of result.rows) {
    if (row.started_at === null || !isRunStatus(row.status)) continue;
    const list = runs.get(row.name) ?? [];
    list.push({ startedAt: new Date(row.started_at).toISOString(), status: row.status });
    runs.set(row.name, list);
  }
  return runs;
}

export async function getCronHeartbeats(): Promise<CronHeartbeatData> {
  const registry = listHeartbeatJobs();
  let runsByName: Map<string, CronRun[]>;
  try {
    runsByName = await readRecentRuns(registry.map((job) => job.name));
  } catch (err) {
    _logger.warn("[cronHeartbeat] heartbeat query failed:", err);
    return { entries: [], live: false };
  }

  const nowMs = Date.now();
  const entries = registry.map((job): CronHeartbeatEntry => {
    const interval = expectedIntervalMinutes(job.schedule);
    const [latest = null, previous = null] = runsByName.get(job.name) ?? [];
    return {
      name: job.name,
      schedule: job.schedule,
      expectedIntervalMinutes: interval,
      lastRun: latest?.startedAt ?? null,
      lastStatus: latest?.status ?? null,
      state: evaluateHeartbeat({ intervalMinutes: interval, latest, previous, nowMs }),
    };
  });
  return { entries, live: true };
}
