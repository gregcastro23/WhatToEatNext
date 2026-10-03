/**
 * Client-side validator for GET /api/admin/reliability (ReliabilityPanel).
 *
 * @file src/lib/admin/schemas/reliability.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import { FlowStatusSchema } from "@/lib/admin/schemas/systemStatus";
import type {
  AdminReliabilityPayload,
  AdminReliabilityResponse,
} from "@/services/adminReliabilityService";

export const ReliabilitySchema = z.object({
  generatedAt: z.string(),
  health: z.object({
    points: z.array(z.object({ capturedAt: z.string(), overall: FlowStatusSchema })),
    windowHours: z.number(),
    uptimePct: z.number().nullable(),
    drift: z
      .object({
        thisWeekBadRate: z.number(),
        lastWeekBadRate: z.number(),
        delta: z.number().nullable(),
        thisWeekSamples: z.number(),
        lastWeekSamples: z.number(),
      })
      .nullable(),
    live: z.boolean(),
  }),
  probes: z.object({
    probes: z.array(
      z.object({
        probeName: z.string(),
        runs: z.number(),
        failures: z.number(),
        failureRate: z.number(),
        p50LatencyMs: z.number().nullable(),
        p95LatencyMs: z.number().nullable(),
        maxLatencyMs: z.number().nullable(),
        lastRunAt: z.string().nullable(),
        lastStatus: z.string().nullable(),
        lastError: z.string().nullable(),
      }),
    ),
    windowDays: z.number(),
    totalRuns: z.number(),
    totalFailures: z.number(),
    live: z.boolean(),
  }),
  alerts: z.object({
    windowDays: z.number(),
    alertsFired: z.number(),
    suppressed: z.number(),
    channels: z.array(
      z.object({
        channel: z.string(),
        attempted: z.number(),
        delivered: z.number(),
        failed: z.number(),
        deliveryRate: z.number(),
        lastError: z.string().nullable(),
        lastFailureAt: z.string().nullable(),
      }),
    ),
    live: z.boolean(),
  }),
});

export type ReliabilityView = z.infer<typeof ReliabilitySchema>;

type _ReliabilityDrift = AssertTrue<ServerSatisfies<AdminReliabilityPayload, ReliabilityView>>;
type _ReliabilityExact = AssertTrue<ServerSatisfies<ReliabilityView, AdminReliabilityPayload>>;

export const ReliabilityResponseSchema = ReliabilitySchema.extend({ success: z.literal(true) });

type _ReliabilityResponseDrift = AssertTrue<
  ServerSatisfies<AdminReliabilityResponse, z.infer<typeof ReliabilityResponseSchema>>
>;
