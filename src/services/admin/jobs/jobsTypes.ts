/**
 * Payload for GET /api/admin/jobs — every scheduled job and synthetic probe,
 * how it has actually been running, and how much alert noise it produced.
 *
 * @file src/services/admin/jobs/jobsTypes.ts
 */

import type { CronHeartbeatState } from "@/services/cronHeartbeatService";
import type { JobKind } from "@/services/cronRegistry";

export type JobRunStatus = "success" | "failure" | "timeout";

export interface JobRun {
  startedAt: string;
  status: JobRunStatus;
  latencyMs: number | null;
}

export interface JobRunStats {
  runs7d: number;
  failures7d: number;
  timeouts7d: number;
  runs24h: number;
  p50Ms: number | null;
  p95Ms: number | null;
  maxMs: number | null;
  lastRunAt: string | null;
  lastStatus: JobRunStatus | null;
  /** Most recent non-empty error in the window, and when it happened. */
  lastError: string | null;
  lastErrorAt: string | null;
  /** `response_payload` of the latest run — heartbeat details or probe snapshot. */
  lastDetails: Record<string, unknown> | null;
}

export interface JobRow {
  name: string;
  kind: JobKind;
  host: "vercel" | "railway";
  schedule: string;
  scheduleLabel: string;
  expectedIntervalMinutes: number;
  functionLimitSeconds: number;
  state: CronHeartbeatState;
  /** Due in the last 24h (excluding the last 2 minutes), null if unparseable. */
  expected24h: number | null;
  /** max(0, expected − recorded): runs that left no row — killed or never fired. */
  missed24h: number | null;
  /** p95 / function limit; ≥ 0.8 means the job runs close to being killed. */
  headroomUsed: number | null;
  stats: JobRunStats;
  /** Most recent runs, newest first (at most 24). */
  recent: JobRun[];
}

export interface MinuteLoad {
  minute: number;
  jobs: string[];
}

export interface AlertNoiseRow {
  component: string;
  /** Alert rows recorded (every transition, delivered or not). */
  fired: number;
  /** Rows whose email sink reported success — what actually reached an inbox. */
  emailed: number;
  suppressed: number;
  worsened: number;
  recovered: number;
  lastTitle: string | null;
  lastAt: string | null;
}

export interface JobsPayload {
  generatedAt: string;
  /** False when the run table could not be read — the numbers below are then absent, not zero. */
  live: boolean;
  alertsLive: boolean;
  errors: string[];
  jobs: JobRow[];
  /** Hourly-or-faster jobs per minute of the hour (UTC). */
  minuteLoad: MinuteLoad[];
  alerts: AlertNoiseRow[];
  alertWindowDays: number;
}
