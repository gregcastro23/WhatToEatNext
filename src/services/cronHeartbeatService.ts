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
 * The registry is read from vercel.json at runtime (traced into the dashboard
 * lambda via next.config.js); when that file is absent from the bundle the
 * const fallback below — a mirror of vercel.json's non-synthetic crons —
 * keeps the panel populated rather than degrading the whole payload.
 *
 * Honesty contract: a cron with no recorded run reports state "never" (it may
 * predate heartbeats); `live: false` means the heartbeat table was unreadable.
 *
 * @file src/services/cronHeartbeatService.ts
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

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

interface CronRegistryEntry {
  name: string;
  schedule: string;
}

/**
 * Fallback mirror of vercel.json's `crons` (non-synthetic only) for when the
 * file is not in the deploy bundle. KEEP IN SYNC with vercel.json when adding
 * or rescheduling a cron — a drifted entry here only mislabels the schedule
 * column; the heartbeat rows themselves stay truthful.
 */
const FALLBACK_REGISTRY: CronRegistryEntry[] = [
  { name: "system-health-snapshot", schedule: "0 * * * *" },
  { name: "observability-prune", schedule: "0 3 * * *" },
  { name: "cache-ephemeris", schedule: "5 0 * * *" },
  { name: "prewarm-agent-recipes", schedule: "0 * * * *" },
  { name: "esms-reconciliation", schedule: "15 * * * *" },
  { name: "agents-daily-yield", schedule: "30 0 * * *" },
  { name: "chain-reconcile", schedule: "45 * * * *" },
  { name: "environmental-ingest", schedule: "10 * * * *" },
];

/**
 * Jobs scheduled OUTSIDE vercel.json — Railway cron services that call into
 * this app over HTTP. They can never appear in the vercel.json read, so they
 * are merged in unconditionally; without this, a Railway cron is invisible to
 * the heartbeat panel no matter how long it has been dead.
 *
 * `daily-digest` earned its place: between 2026-08-01 and 08-15 it failed to
 * run on five days (Aug 6, 8, 9, 10, 13) and nothing noticed, because a job
 * that never fires emits no error to notice. See
 * docs/runbooks/daily-digest-cron.md.
 *
 * The schedule is inferred from ten consecutive Railway deployments, all
 * between 09:00 and 09:05 UTC. It is used for the operator display column and
 * for `expectedIntervalMinutes`, which returns 1440 for ANY daily shape — so a
 * wrong hour here mislabels a column and cannot fabricate or delay a verdict.
 */
const EXTERNAL_REGISTRY: CronRegistryEntry[] = [
  { name: "daily-digest", schedule: "0 9 * * *" },
];

/**
 * The scheduled-job registry. Runtime read of vercel.json so a cron added
 * there shows up without touching this file; the synthetic-* probes are
 * excluded because they self-record under their own probe names and are
 * surfaced by the probe panel, not this one. Externally-scheduled jobs are
 * appended in both branches — they are not in vercel.json to be read.
 */
function readCronRegistry(): CronRegistryEntry[] {
  try {
    const raw = readFileSync(join(process.cwd(), "vercel.json"), "utf8");
    const parsed = JSON.parse(raw) as {
      crons?: Array<{ path?: string; schedule?: string }>;
    };
    const entries = (parsed.crons ?? [])
      .filter(
        (c): c is { path: string; schedule: string } =>
          typeof c.path === "string" && typeof c.schedule === "string",
      )
      .map((c) => ({
        name: c.path.replace(/^\/api\/cron\//, ""),
        schedule: c.schedule,
      }))
      .filter((c) => !c.name.startsWith("synthetic-"));
    if (entries.length > 0) return [...entries, ...EXTERNAL_REGISTRY];
  } catch {
    // Not in the bundle — the mirror below still names every known cron.
  }
  return [...FALLBACK_REGISTRY, ...EXTERNAL_REGISTRY];
}

/**
 * Expected minutes between runs for the cron-expression shapes vercel.json
 * actually uses. Unrecognized shapes assume daily — an overestimate can only
 * delay a "late" verdict, never fabricate one.
 */
export function expectedIntervalMinutes(schedule: string): number {
  const fields = schedule.trim().split(/\s+/);
  if (fields.length !== 5) return 1440;
  const [minute, hour] = fields;
  if (!minute || !hour) return 1440;
  const everyN = /^\*\/(\d+)$/.exec(minute);
  if (everyN && hour === "*") return Number(everyN[1]);
  if (/^\d+$/.test(minute) && hour === "*") return 60;
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) return 1440;
  return 1440;
}

/**
 * Record one cron run as a heartbeat row. MUST never throw — a heartbeat
 * failure must not break the cron's real work.
 */
export async function recordCronRun(
  name: string,
  opts: {
    status: CronRunStatus;
    startedAt: Date;
    latencyMs?: number;
    error?: string;
  },
): Promise<void> {
  try {
    const completedAt = new Date();
    const latencyMs =
      opts.latencyMs ??
      Math.max(completedAt.getTime() - opts.startedAt.getTime(), 0);
    await executeQuery(
      `INSERT INTO synthetic_probe_results
         (probe_name, started_at, completed_at, status, latency_ms, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        `cron:${name}`,
        opts.startedAt.toISOString(),
        completedAt.toISOString(),
        opts.status,
        Math.round(latencyMs),
        opts.error ?? null,
      ],
    );
  } catch (err) {
    console.error(`[cronHeartbeat] failed to record run for ${name}:`, err);
  }
}

export async function getCronHeartbeats(): Promise<CronHeartbeatData> {
  const registry = readCronRegistry();

  let latestByName: Map<string, { startedAt: string; status: CronRunStatus }>;
  try {
    const result = await executeQuery<{
      name: string;
      started_at: Date | null;
      status: CronRunStatus | null;
    }>(
      // One indexed LIMIT 1 descent per cron via LATERAL — the
      // (probe_name, started_at DESC) index makes each lookup O(log rows).
      `SELECT n.name, r.started_at, r.status
         FROM unnest($1::text[]) AS n(name)
         LEFT JOIN LATERAL (
           SELECT s.started_at, s.status
             FROM synthetic_probe_results s
            WHERE s.probe_name = 'cron:' || n.name
            ORDER BY s.started_at DESC
            LIMIT 1
         ) r ON true`,
      [registry.map((c) => c.name)],
    );
    latestByName = new Map(
      result.rows
        .filter((row) => row.started_at !== null && row.status !== null)
        .map((row) => [
          row.name,
          {
            startedAt: new Date(row.started_at as Date).toISOString(),
            status: row.status as CronRunStatus,
          },
        ]),
    );
  } catch (err) {
    _logger.warn("[cronHeartbeat] heartbeat query failed:", err);
    return { entries: [], live: false };
  }

  const now = Date.now();
  const entries: CronHeartbeatEntry[] = registry.map((cron) => {
    const interval = expectedIntervalMinutes(cron.schedule);
    const latest = latestByName.get(cron.name);
    let state: CronHeartbeatEntry["state"];
    if (!latest) {
      state = "never";
    } else if (latest.status !== "success") {
      state = "failing";
    } else if (now - Date.parse(latest.startedAt) > 2 * interval * 60_000) {
      state = "late";
    } else {
      state = "ok";
    }
    return {
      name: cron.name,
      schedule: cron.schedule,
      expectedIntervalMinutes: interval,
      lastRun: latest?.startedAt ?? null,
      lastStatus: latest?.status ?? null,
      state,
    };
  });

  return { entries, live: true };
}
