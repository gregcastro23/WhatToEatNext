/**
 * Client-side validator for GET /api/admin/traffic-digest.
 *
 * Mirrors `TrafficDigestResponse` from the server service with a compile-time
 * `ServerSatisfies` check so server/client contract drift fails `tsc`.
 * Zero server runtime imports — safe for client components.
 *
 * @file src/lib/admin/schemas/trafficDigest.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import {
  VariantCohortRowSchema,
  VariantConfidenceLabelSchema,
} from "@/lib/admin/schemas/traffic";
import type { TrafficDigestResponse } from "@/services/admin/trafficDigestTypes";

export const DigestFindingSchema = z.object({
  category: z.enum(["traffic", "friction", "experiment", "feedback"]),
  title: z.string(),
  detail: z.string(),
  severity: z.enum(["info", "warn", "critical"]),
  actionHref: z.string().nullable(),
});

export const DigestActionSchema = z.object({
  priority: z.enum(["P0", "P1", "P2"]),
  action: z.string(),
  rationale: z.string(),
  targetPath: z.string().nullable(),
});

export const DigestNarrativeSchema = z.object({
  headline: z.string(),
  severity: z.enum(["healthy", "watch", "action_needed"]),
  executiveSummary: z.string(),
  topFindings: z.array(DigestFindingSchema),
  recommendedActions: z.array(DigestActionSchema),
});

const DigestTotalsSchema = z.object({
  pageviews: z.number(),
  visitors: z.number(),
  sessions: z.number(),
  signedInUsers: z.number(),
  bounceRate: z.number().nullable(),
  pagesPerSession: z.number().nullable(),
});

export const DigestTopRouteItemSchema = z.object({
  path: z.string(),
  views: z.number(),
  sessions: z.number(),
  bounceRatePct: z.number(),
  avgDwellMs: z.number(),
  frictionCount: z.number(),
});

export const DigestFrictionSignalItemSchema = z.object({
  tag: z.string(),
  label: z.string(),
  tone: z.enum(["friction", "error"]),
  totalCount: z.number(),
  uniqueSessions: z.number(),
  topPath: z.string(),
});

export const DigestOpenFeedbackItemSchema = z.object({
  id: z.string(),
  at: z.string(),
  path: z.string(),
  rating: z.number().nullable(),
  note: z.string(),
  refTag: z.string().nullable(),
  sessionId: z.string().nullable(),
});

export const DigestExperimentSummarySchema = z.object({
  experimentKey: z.string(),
  variants: z.array(VariantCohortRowSchema),
  leaderVariant: z.string().nullable(),
  liftVsControlPct: z.number().nullable(),
  confidenceLabel: VariantConfidenceLabelSchema.nullable(),
});

export const DigestFrictionSummarySchema = z.object({
  rageClicks: z.number(),
  deadClicks: z.number(),
  quickBacks: z.number(),
  slowCwvHits: z.number(),
  errorSessions60m: z.number(),
  errorBurstTriggered: z.boolean(),
  topErrorTag: z.string().nullable(),
  topZeroResultQuery: z
    .object({
      slug: z.string(),
      sessions: z.number(),
    })
    .nullable(),
  activeReviewerCount: z.number(),
});

export const TrafficDigestFactsSchema = z.object({
  range: z.enum(["24h", "7d"]),
  liveSources: z.number(),
  totalSources: z.number(),
  degradedSources: z.array(z.string()),
  totals: DigestTotalsSchema,
  previous: DigestTotalsSchema,
  pageviewsDeltaPct: z.number().nullable(),
  activationRatePct: z.number().nullable(),
  frustrationRatePct: z.number().nullable(),
  dauCount: z.number().nullable(),
  wauCount: z.number().nullable(),
  topRoutes: z.array(DigestTopRouteItemSchema),
  frictionSummary: DigestFrictionSummarySchema,
  frictionSignals: z.array(DigestFrictionSignalItemSchema),
  experiment: DigestExperimentSummarySchema.nullable(),
  openFeedbackCount: z.number(),
  openLowRatingCount: z.number(),
  openFeedback: z.array(DigestOpenFeedbackItemSchema),
});

export const TrafficDigestResponseSchema = z.object({
  success: z.literal(true),
  generatedAt: z.string(),
  range: z.enum(["24h", "7d"]),
  live: z.boolean(),
  synthesisMode: z.enum(["ai", "deterministic"]),
  model: z.string().nullable(),
  fallbackReason: z.string().nullable(),
  narrative: DigestNarrativeSchema,
  facts: TrafficDigestFactsSchema,
});

export type TrafficDigestView = z.infer<typeof TrafficDigestResponseSchema>;

type _TrafficDigestDrift = AssertTrue<
  ServerSatisfies<TrafficDigestResponse, TrafficDigestView>
>;
