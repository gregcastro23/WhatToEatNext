/**
 * The scheduled-job registry — every cron and synthetic probe, where it runs,
 * and where its runs are recorded.
 *
 * vercel.json is imported (bundled into every lambda) rather than read from
 * disk: the old runtime `readFileSync` was only traced into the dashboard
 * lambda, so the hourly alerting cron silently ran on a hand-kept mirror that
 * could drift from the real schedule.
 *
 * @file src/services/cronRegistry.ts
 */

import { z } from "zod";
import vercelConfigRaw from "../../vercel.json";

export type JobKind = "cron" | "probe";

export interface ScheduledJob {
  /** Route name under /api/cron/, e.g. "prewarm-agent-recipes". */
  name: string;
  /** Five-field UTC cron expression. */
  schedule: string;
  host: "vercel" | "railway";
  kind: JobKind;
  /** `probe_name` its runs are written under in synthetic_probe_results. */
  recordKey: string;
  /** The platform kill line: the route's `maxDuration`, in seconds. */
  functionLimitSeconds: number;
}

const VercelCronsSchema = z.object({
  crons: z.array(z.object({ path: z.string(), schedule: z.string() })).default([]),
});

/** Synthetic probes record under their own probe names, not `cron:<route>`. */
const PROBE_RECORD_KEYS: Readonly<Record<string, string>> = {
  "synthetic-onboarding": "onboarding-skip",
  "synthetic-cosmic-recipe": "cosmic-recipe",
  "synthetic-recommendations": "recommendations",
  "synthetic-stripe-webhook": "stripe-webhook",
  "synthetic-auth-handshake": "auth-handshake",
  "synthetic-auth-signin": "auth-signin",
  "synthetic-mcp": "mcp",
};

/**
 * Each route's exported `maxDuration`. Pinned against the route files by
 * src/services/__tests__/cronRegistry.test.ts, so a changed limit fails CI
 * instead of silently mislabelling headroom. Routes without an export fall
 * back to vercel.json's `src/app/api/**` default of 60s.
 */
const FUNCTION_LIMIT_SECONDS: Readonly<Record<string, number>> = {
  "agents-daily-yield": 60,
  "cache-ephemeris": 30,
  "chain-reconcile": 60,
  "environmental-ingest": 60,
  "esms-reconciliation": 60,
  "observability-prune": 30,
  "prewarm-agent-recipes": 60,
  "synthetic-auth-handshake": 30,
  "synthetic-auth-signin": 30,
  "synthetic-cosmic-recipe": 60,
  "synthetic-mcp": 60,
  "synthetic-onboarding": 30,
  "synthetic-recommendations": 30,
  "synthetic-stripe-webhook": 30,
  "system-health-snapshot": 60,
};
const DEFAULT_FUNCTION_LIMIT_SECONDS = 60;

/**
 * Jobs scheduled OUTSIDE vercel.json — Railway cron services that call into
 * this app over HTTP, so they can never appear in the vercel.json read.
 * `daily-digest` failed to run on five days between 2026-08-01 and 08-15 and
 * nothing noticed (docs/runbooks/daily-digest-cron.md). Its schedule is
 * inferred from ten consecutive Railway deployments, all 09:00–09:05 UTC.
 */
const EXTERNAL_JOBS: readonly ScheduledJob[] = [
  {
    name: "daily-digest",
    schedule: "0 9 * * *",
    host: "railway",
    kind: "cron",
    recordKey: "cron:daily-digest",
    functionLimitSeconds: DEFAULT_FUNCTION_LIMIT_SECONDS,
  },
];

function toJob(cron: { path: string; schedule: string }): ScheduledJob {
  const name = cron.path.replace(/^\/api\/cron\//, "");
  const probeKey = PROBE_RECORD_KEYS[name];
  return {
    name,
    schedule: cron.schedule,
    host: "vercel",
    kind: probeKey ? "probe" : "cron",
    recordKey: probeKey ?? `cron:${name}`,
    functionLimitSeconds: FUNCTION_LIMIT_SECONDS[name] ?? DEFAULT_FUNCTION_LIMIT_SECONDS,
  };
}

/** Every scheduled job: vercel.json crons (probes included) plus external ones. */
export function listScheduledJobs(): ScheduledJob[] {
  const parsed = VercelCronsSchema.safeParse(vercelConfigRaw);
  const crons = parsed.success ? parsed.data.crons : [];
  return [...crons.map(toJob), ...EXTERNAL_JOBS];
}

/** Heartbeat-bearing jobs only — probes self-report through the probe panel. */
export function listHeartbeatJobs(): ScheduledJob[] {
  return listScheduledJobs().filter((job) => job.kind === "cron");
}
