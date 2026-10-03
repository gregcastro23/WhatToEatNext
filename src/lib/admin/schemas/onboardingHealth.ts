/**
 * Client-side validator for GET /api/admin/onboarding-health (OnboardingFunnelPanel).
 *
 * @file src/lib/admin/schemas/onboardingHealth.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import { FlowStatusSchema } from "@/lib/admin/schemas/systemStatus";
import type {
  OnboardingHealthPayload,
  OnboardingHealthResponse,
} from "@/services/onboardingHealthService";

export const OnboardingHealthSchema = z.object({
  generatedAt: z.string(),
  overall: FlowStatusSchema,
  headline: z.string(),
  funnel: z.array(
    z.object({ id: z.string(), label: z.string(), count: z.number(), dropOff: z.number() }),
  ),
  stuckUsers: z.array(
    z.object({
      userId: z.string(),
      email: z.string(),
      name: z.string().nullable(),
      createdAt: z.string(),
      ageHours: z.number(),
      missing: z.string(),
    }),
  ),
  recentSuccesses: z.array(
    z.object({
      userId: z.string(),
      email: z.string(),
      name: z.string().nullable(),
      completedAt: z.string(),
      fullOnboarding: z.boolean(),
      dominantElement: z.string().nullable(),
    }),
  ),
  apiHealth: z.object({
    observed: z.boolean(),
    count: z.number(),
    successRate: z.number(),
    errors4xx: z.number(),
    errors5xx: z.number(),
    p50LatencyMs: z.number(),
    p95LatencyMs: z.number(),
    recentErrors: z.array(
      z.object({
        at: z.string(),
        method: z.string(),
        path: z.string(),
        status: z.number(),
        latencyMs: z.number(),
      }),
    ),
  }),
  skipRate: z.number(),
  live: z.boolean(),
});

export type OnboardingHealthView = z.infer<typeof OnboardingHealthSchema>;

type _OnboardingHealthDrift = AssertTrue<ServerSatisfies<OnboardingHealthPayload, OnboardingHealthView>>;
type _OnboardingHealthExact = AssertTrue<ServerSatisfies<OnboardingHealthView, OnboardingHealthPayload>>;

export const OnboardingHealthResponseSchema = OnboardingHealthSchema.extend({
  success: z.literal(true),
});

type _OnboardingHealthResponseDrift = AssertTrue<
  ServerSatisfies<OnboardingHealthResponse, z.infer<typeof OnboardingHealthResponseSchema>>
>;
