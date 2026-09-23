/**
 * /admin/jobs — every scheduled job and synthetic probe, judged by what it
 * actually recorded rather than by what vercel.json promises.
 *
 * Three questions the alert emails could not answer:
 *   - Is a job silently dying? `missed24h` compares the runs the schedule owed
 *     in the last 24h with the rows that exist. A run Vercel kills at
 *     `maxDuration` leaves no row, so it shows here and nowhere else.
 *   - Is a job about to be killed? `headroomUsed` is its 7-day p95 over its
 *     function limit.
 *   - Which component keeps emailing? Alert volume per component, split into
 *     what reached an inbox and what the cooldown held back.
 *
 * State uses the same `evaluateHeartbeat` verdict the hourly alerting cron
 * uses, so this page and the emails can never disagree.
 *
 * @file src/services/admin/jobs/jobsService.ts
 */

import { countFiresBetween, describeSchedule, expectedIntervalMinutes, parseSchedule } from "@/lib/cron/cronSchedule";
import { _logger } from "@/lib/logger";
import { readAlertNoise, readRecentRuns, readRunStats } from "@/services/admin/jobs/jobsReaders";
import type { JobRow, JobRun, JobRunStats, JobsPayload, MinuteLoad } from "@/services/admin/jobs/jobsTypes";
import { evaluateHeartbeat } from "@/services/cronHeartbeatService";
import { listScheduledJobs, type ScheduledJob } from "@/services/cronRegistry";

const ALERT_WINDOW_DAYS = 7;
const DAY_MS = 86_400_000;
/** Fires this recent may still be running; they are not counted as owed yet. */
const IN_FLIGHT_MS = 2 * 60_000;

const EMPTY_STATS: JobRunStats = {
  runs7d: 0,
  failures7d: 0,
  timeouts7d: 0,
  runs24h: 0,
  p50Ms: null,
  p95Ms: null,
  maxMs: null,
  lastRunAt: null,
  lastStatus: null,
  lastError: null,
  lastErrorAt: null,
  lastDetails: null,
};

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function buildJobRow(job: ScheduledJob, stats: JobRunStats, recent: JobRun[], nowMs: number): JobRow {
  const interval = expectedIntervalMinutes(job.schedule);
  const [latest = null, previous = null] = recent;
  const expected24h = countFiresBetween(job.schedule, nowMs - DAY_MS, nowMs - IN_FLIGHT_MS);
  return {
    name: job.name,
    kind: job.kind,
    host: job.host,
    schedule: job.schedule,
    scheduleLabel: describeSchedule(job.schedule),
    expectedIntervalMinutes: interval,
    functionLimitSeconds: job.functionLimitSeconds,
    state: evaluateHeartbeat({ intervalMinutes: interval, latest, previous, nowMs }),
    expected24h,
    missed24h: expected24h === null ? null : Math.max(0, expected24h - stats.runs24h),
    headroomUsed: stats.p95Ms === null ? null : stats.p95Ms / (job.functionLimitSeconds * 1000),
    stats,
    recent,
  };
}

/** Hourly-or-faster jobs per minute of the hour — the pile-up view. */
export function minuteLoad(jobs: readonly ScheduledJob[]): MinuteLoad[] {
  const load: MinuteLoad[] = Array.from({ length: 60 }, (_, minute) => ({ minute, jobs: [] }));
  for (const job of jobs) {
    const parsed = parseSchedule(job.schedule);
    if (parsed?.hours.length !== 24) continue;
    for (const m of parsed.minutes) load[m]?.jobs.push(job.name);
  }
  return load;
}

async function readRuns(jobs: ScheduledJob[], errors: string[]): Promise<{
  stats: Map<string, JobRunStats>;
  recent: Map<string, JobRun[]>;
} | null> {
  const keys = jobs.map((job) => job.recordKey);
  try {
    const [stats, recent] = await Promise.all([readRunStats(keys), readRecentRuns(keys)]);
    return { stats, recent };
  } catch (err) {
    _logger.error("[admin/jobs] run history read failed:", err);
    errors.push(`run history: ${errorText(err)}`);
    return null;
  }
}

async function readAlerts(errors: string[]): Promise<JobsPayload["alerts"] | null> {
  try {
    return await readAlertNoise(ALERT_WINDOW_DAYS);
  } catch (err) {
    _logger.error("[admin/jobs] alert history read failed:", err);
    errors.push(`alert history: ${errorText(err)}`);
    return null;
  }
}

export async function getJobsOverview(): Promise<JobsPayload> {
  const jobs = listScheduledJobs();
  const errors: string[] = [];
  const [runs, alerts] = await Promise.all([readRuns(jobs, errors), readAlerts(errors)]);
  const nowMs = Date.now();
  return {
    generatedAt: new Date(nowMs).toISOString(),
    live: runs !== null,
    alertsLive: alerts !== null,
    errors,
    jobs: runs
      ? jobs.map((job) =>
          buildJobRow(job, runs.stats.get(job.recordKey) ?? EMPTY_STATS, runs.recent.get(job.recordKey) ?? [], nowMs),
        )
      : [],
    minuteLoad: minuteLoad(jobs),
    alerts: alerts ?? [],
    alertWindowDays: ALERT_WINDOW_DAYS,
  };
}
