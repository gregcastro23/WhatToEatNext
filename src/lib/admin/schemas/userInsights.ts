/**
 * Client-side validator for GET /api/admin/users/insights (UserInsightsPanel).
 *
 * @file src/lib/admin/schemas/userInsights.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { UserInsightsPayload, UserInsightsResponse } from "@/services/userInsightsService";

const CountBySchema = z.object({ count: z.number() });

export const UserInsightsSchema = z.object({
  generatedAt: z.string(),
  live: z.boolean(),
  totals: z.object({
    all: z.number(),
    humans: z.number(),
    agents: z.number(),
    active: z.number(),
    admins: z.number(),
  }),
  signups: z.object({
    last24h: z.number(),
    last7d: z.number(),
    last30d: z.number(),
    trend: z.array(CountBySchema.extend({ day: z.string() })),
  }),
  activity: z.object({
    activeIn24h: z.number(),
    activeIn7d: z.number(),
    activeIn30d: z.number(),
    neverLoggedIn: z.number(),
    dormantOver30d: z.number(),
    activeSessions: z.number(),
  }),
  onboarding: z.object({
    completed: z.number(),
    pending: z.number(),
    completionRate: z.number(),
    completedLast7d: z.number(),
    medianMinutesToComplete: z.number().nullable(),
  }),
  tiers: z.object({
    free: z.number(),
    premium: z.number(),
    admin: z.number(),
    visitors: z.number().exactOptional(),
    accountHolders: z.number().exactOptional(),
    activeHolders: z.number().exactOptional(),
  }),
  elements: z.object({
    fire: z.number(),
    water: z.number(),
    earth: z.number(),
    air: z.number(),
    unknown: z.number(),
  }),
  modalities: z.object({
    cardinal: z.number(),
    fixed: z.number(),
    mutable: z.number(),
    unknown: z.number(),
  }),
  sunSigns: z.array(CountBySchema.extend({ sign: z.string() })),
});

export type UserInsightsView = z.infer<typeof UserInsightsSchema>;

type _UserInsightsDrift = AssertTrue<ServerSatisfies<UserInsightsPayload, UserInsightsView>>;
type _UserInsightsExact = AssertTrue<ServerSatisfies<UserInsightsView, UserInsightsPayload>>;

export const UserInsightsResponseSchema = UserInsightsSchema.extend({ success: z.literal(true) });

type _UserInsightsResponseDrift = AssertTrue<
  ServerSatisfies<UserInsightsResponse, z.infer<typeof UserInsightsResponseSchema>>
>;
