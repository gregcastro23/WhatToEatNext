/**
 * Admin API Response Schemas
 *
 * Strongly-typed Zod schemas for admin panel API endpoints.
 * Typed as z.ZodType<T> so schema definitions cannot drift from
 * underlying service and domain types without triggering compile errors.
 *
 * @file src/lib/validation/adminResponseSchemas.ts
 */

import { z } from "zod";
import type { LaunchReadinessReport } from "@/services/launchReadinessService";
import type { ActivityCategory } from "@/services/liveActivityService";

// ── Launch Readiness Response Schema ───────────────────────────────────────

export const ReadinessCheckSchema = z
  .object({
    label: z.string(),
    source: z.string(),
    ok: z.boolean(),
    kind: z.enum(["flag", "secret", "config"]),
    isPublic: z.boolean(),
  })
  .passthrough();

export const SubsystemReadinessSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    description: z.string(),
    status: z.enum(["READY", "PARTIAL", "OFF"]),
    configured: z.number(),
    total: z.number(),
    checks: z.array(ReadinessCheckSchema),
  })
  .passthrough();

export const SettlementBacklogSchema = z
  .object({
    pending: z.number(),
    oldestPendingAgeHours: z.number().nullable().optional().default(null),
    live: z.boolean(),
  })
  .passthrough();

export const LaunchReadinessResponseSchema: z.ZodType<
  { success: boolean } & LaunchReadinessReport
> = z
  .object({
    success: z.boolean(),
    subsystems: z.array(SubsystemReadinessSchema),
    settlement: SettlementBacklogSchema,
    readyCount: z.number(),
    generatedAt: z.string(),
  })
  .passthrough();

// ── Live Activity Response Schema ──────────────────────────────────────────

export const ActivityActorSchema = z
  .object({
    userId: z.string(),
    email: z.string(),
    name: z.string().nullable(),
    isAgent: z.boolean(),
  })
  .nullable();

export const ActivityEventSchema = z
  .object({
    id: z.string(),
    at: z.string(),
    category: z.enum([
      "signup",
      "auth",
      "onboarding",
      "recipe",
      "economy",
      "agent",
      "diary",
      "visit",
    ]),
    type: z.string(),
    description: z.string(),
    status: z.enum(["success", "failure", "info"]),
    actor: ActivityActorSchema,
    context: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export const LiveActivityPayloadSchema = z
  .object({
    generatedAt: z.string(),
    windowHours: z.number(),
    events: z.array(ActivityEventSchema),
    countsByCategory: z.record(z.string(), z.number()).transform((counts) => {
      const full: Record<ActivityCategory, number> = {
        signup: counts.signup ?? 0,
        auth: counts.auth ?? 0,
        onboarding: counts.onboarding ?? 0,
        recipe: counts.recipe ?? 0,
        economy: counts.economy ?? 0,
        agent: counts.agent ?? 0,
        diary: counts.diary ?? 0,
        visit: counts.visit ?? 0,
      };
      return full;
    }),
    live: z.boolean(),
  })
  .passthrough();

export type LiveActivityEvent = z.infer<typeof ActivityEventSchema>;
export type LiveActivityPayload = z.infer<typeof LiveActivityPayloadSchema>;

export const LiveActivityResponseSchema: z.ZodType<
  { success: boolean } & LiveActivityPayload
> = z
  .object({
    success: z.boolean(),
    generatedAt: z.string(),
    windowHours: z.number(),
    events: z.array(ActivityEventSchema),
    countsByCategory: z.record(z.string(), z.number()).transform((counts) => {
      const full: Record<ActivityCategory, number> = {
        signup: counts.signup ?? 0,
        auth: counts.auth ?? 0,
        onboarding: counts.onboarding ?? 0,
        recipe: counts.recipe ?? 0,
        economy: counts.economy ?? 0,
        agent: counts.agent ?? 0,
        diary: counts.diary ?? 0,
        visit: counts.visit ?? 0,
      };
      return full;
    }),
    live: z.boolean(),
  })
  .passthrough();

// ── Observability / Api Route Health Schema ────────────────────────────────

export interface RequestEntry {
  id: number;
  at: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
}

export interface ObservabilitySummary {
  count: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;
  topPaths: Array<{ path: string; count: number }>;
}

export const ObservabilityResponseSchema = z
  .object({
    success: z.boolean(),
    generatedAt: z.string().optional(),
    requests: z.object({
      summary: z.object({
        count: z.number(),
        p50LatencyMs: z.number(),
        p95LatencyMs: z.number(),
        p99LatencyMs: z.number(),
        errorRate: z.number(),
        topPaths: z.array(z.object({ path: z.string(), count: z.number() })),
      }),
      recent: z.array(
        z.object({
          id: z.number(),
          at: z.string(),
          method: z.string(),
          path: z.string(),
          status: z.number(),
          latencyMs: z.number(),
        }),
      ),
      recentFailures: z.array(
        z.object({
          id: z.number(),
          at: z.string(),
          method: z.string(),
          path: z.string(),
          status: z.number(),
          latencyMs: z.number(),
        }),
      ),
    }),
    slowQueries: z
      .object({
        summary: z.unknown(),
        recent: z.array(z.object({ ms: z.number(), preview: z.string() })),
      })
      .optional(),
  })
  .passthrough();

export type ObservabilityResponse = z.infer<typeof ObservabilityResponseSchema>;
