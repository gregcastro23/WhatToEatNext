/**
 * Client-side validator for GET /api/admin/jobs.
 *
 * @file src/lib/admin/schemas/jobs.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { JobsPayload } from "@/services/admin/jobs/jobsTypes";

const RunStatusSchema = z.enum(["success", "failure", "timeout"]);

const RunSchema = z.object({
  startedAt: z.string(),
  status: RunStatusSchema,
  latencyMs: z.number().nullable(),
});

const StatsSchema = z.object({
  runs7d: z.number(),
  failures7d: z.number(),
  timeouts7d: z.number(),
  runs24h: z.number(),
  p50Ms: z.number().nullable(),
  p95Ms: z.number().nullable(),
  maxMs: z.number().nullable(),
  lastRunAt: z.string().nullable(),
  lastStatus: RunStatusSchema.nullable(),
  lastError: z.string().nullable(),
  lastErrorAt: z.string().nullable(),
  lastDetails: z.record(z.string(), z.unknown()).nullable(),
});

const JobSchema = z.object({
  name: z.string(),
  kind: z.enum(["cron", "probe"]),
  host: z.enum(["vercel", "railway"]),
  schedule: z.string(),
  scheduleLabel: z.string(),
  expectedIntervalMinutes: z.number(),
  functionLimitSeconds: z.number(),
  state: z.enum(["ok", "retrying", "late", "failing", "never"]),
  expected24h: z.number().nullable(),
  missed24h: z.number().nullable(),
  headroomUsed: z.number().nullable(),
  stats: StatsSchema,
  recent: z.array(RunSchema),
});

export const JobsSchema = z.object({
  generatedAt: z.string(),
  live: z.boolean(),
  alertsLive: z.boolean(),
  errors: z.array(z.string()),
  jobs: z.array(JobSchema),
  minuteLoad: z.array(z.object({ minute: z.number(), jobs: z.array(z.string()) })),
  alerts: z.array(
    z.object({
      component: z.string(),
      fired: z.number(),
      emailed: z.number(),
      suppressed: z.number(),
      worsened: z.number(),
      recovered: z.number(),
      lastTitle: z.string().nullable(),
      lastAt: z.string().nullable(),
    }),
  ),
  alertWindowDays: z.number(),
});

export type JobsView = z.infer<typeof JobsSchema>;
export type JobView = JobsView["jobs"][number];

type _JobsDrift = AssertTrue<ServerSatisfies<JobsPayload, JobsView>>;
