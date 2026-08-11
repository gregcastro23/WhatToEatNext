/**
 * Cron heartbeats — last-run visibility for every scheduled job.
 *
 * The synthetic probes already record each run in `synthetic_probe_results`,
 * but the remaining crons (reconciliation, pruning, cache warming…) emit
 * alerts only on problems and write no run record — a dead cron is silence
 * indistinguishable from health. Notably, the alerting snapshot cron itself
 * had no watchdog.
 *
 * Fix: every cron route records a heartbeat row per run via `recordCronRun()`
 * (probe_name `cron:<name>` in the existing `synthetic_probe_results` table —
 * no new schema), and `getCronHeartbeats()` evaluates staleness against each
 * job's vercel.json cadence.
 *
 * Honesty contract: a cron with no recorded run reports state "never" (it may
 * predate heartbeats); `live: false` means the heartbeat table was unreadable.
 *
 * @file src/services/cronHeartbeatService.ts
 */

export type CronRunStatus = "success" | "failure" | "timeout";

export interface CronHeartbeatEntry {
  /** Cron route name, e.g. "esms-reconciliation". */
  name: string;
  /** Cron expression from vercel.json, for operator display. */
  schedule: string;
  /** Expected minutes between runs, derived from the schedule. */
  expectedIntervalMinutes: number;
  /** ISO timestamp of the latest recorded run, null if none recorded. */
  lastRun: string | null;
  lastStatus: CronRunStatus | null;
  /**
   * ok      → last run recent and successful
   * late    → no run within ~2x the expected cadence
   * failing → latest recorded run did not succeed
   * never   → no heartbeat rows (job predates heartbeats, or is dead)
   */
  state: "ok" | "late" | "failing" | "never";
}

export interface CronHeartbeatData {
  entries: CronHeartbeatEntry[];
  live: boolean;
}

/**
 * NOT YET WIRED — skeleton. The implementation inserts a
 * `synthetic_probe_results` row (probe_name `cron:<name>`) and must never
 * throw: a heartbeat failure must not break the cron's real work.
 */
export async function recordCronRun(
  _name: string,
  _opts: {
    status: CronRunStatus;
    startedAt: Date;
    latencyMs?: number;
    error?: string;
  },
): Promise<void> {
  // Implementation inserts the heartbeat row; failures are logged and eaten.
}

/**
 * NOT YET WIRED — skeleton returning the honest degraded state. The
 * implementation reads the latest `cron:*` heartbeat per job and evaluates
 * staleness against the vercel.json cadence registry.
 */
export async function getCronHeartbeats(): Promise<CronHeartbeatData> {
  return { entries: [], live: false };
}
