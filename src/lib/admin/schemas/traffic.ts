/**
 * Client-side validator for GET /api/admin/traffic.
 *
 * The compile-time check at the bottom fails the build if the server's
 * `TrafficSummary` stops satisfying this schema, so the two cannot drift
 * silently. The import is type-only: no server code reaches the client bundle.
 *
 * @file src/lib/admin/schemas/traffic.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type { TrafficSummary } from "@/services/admin/trafficTypes";

export const CountRowSchema = z.object({
  label: z.string(),
  count: z.number(),
  visitors: z.number().optional(),
});

const TotalsSchema = z.object({
  pageviews: z.number(),
  visitors: z.number(),
  sessions: z.number(),
  signedInUsers: z.number(),
  bounceRate: z.number().nullable(),
  pagesPerSession: z.number().nullable(),
});

const TrafficUserSchema = z
  .object({ id: z.string(), email: z.string(), name: z.string().nullable(), isAdmin: z.boolean() })
  .nullable();

export const VisitorSessionStepSchema = z.object({
  id: z.string(),
  at: z.string(),
  path: z.string(),
  durationMs: z.number(),
  refTag: z.string().nullable(),
  interactions: z.array(z.string()),
});

export const SessionFeedbackItemSchema = z.object({
  id: z.string(),
  at: z.string(),
  viewId: z.string().nullable(),
  sessionId: z.string().nullable(),
  visitorHash: z.string().nullable(),
  path: z.string(),
  refTag: z.string().nullable(),
  rating: z.number().nullable(),
  note: z.string(),
  status: z.enum(["open", "resolved", "dismissed"]).optional(),
  resolvedAt: z.string().nullable().optional(),
});

export const VisitorSessionSchema = z.object({
  sessionKey: z.string(),
  visitorHash: z.string(),
  sessionId: z.string().nullable(),
  startedAt: z.string(),
  lastSeenAt: z.string(),
  totalDurationMs: z.number(),
  pageCount: z.number(),
  engaged: z.boolean(),
  activeNow: z.boolean(),
  liveNow90s: z.boolean().optional(),
  isStuck: z.boolean().optional(),
  hasError: z.boolean().optional(),
  hasFriction: z.boolean().optional(),
  visitNumber: z.number().optional(),
  priorSessionKeys: z.array(z.string()).optional(),
  entryPath: z.string(),
  exitPath: z.string(),
  referrerHost: z.string().nullable(),
  utmSource: z.string().nullable(),
  refTag: z.string().nullable(),
  country: z.string().nullable(),
  region: z.string().nullable(),
  city: z.string().nullable(),
  deviceType: z.string(),
  browser: z.string().nullable(),
  os: z.string().nullable(),
  user: TrafficUserSchema,
  steps: z.array(VisitorSessionStepSchema),
  feedback: z.array(SessionFeedbackItemSchema).optional(),
});

export const RefTagRollupSchema = z.object({
  refTag: z.string(),
  visitors: z.number(),
  sessions: z.number(),
  pageviews: z.number(),
  engagedSessions: z.number(),
  engagedRate: z.number(),
  medianDwellMs: z.number(),
  avgPagesPerSession: z.number(),
  signedInUsers: z.number(),
});

export const PlannerFunnelStageSchema = z.object({
  stage: z.string(),
  sessions: z.number(),
  rate: z.number(),
});

export const PlannerFunnelCohortSchema = z.object({
  label: z.string(),
  landed: z.number(),
  generated: z.number(),
  refined: z.number(),
  converted: z.number(),
  conversionRate: z.number(),
});

export const PlannerFunnelSchema = z.object({
  stages: z.array(PlannerFunnelStageSchema),
  cohorts: z.array(PlannerFunnelCohortSchema),
});

export const LabEngagementRowSchema = z.object({
  tag: z.string(),
  kind: z.enum(["tab", "solver"]),
  sessions: z.number(),
  medianDwellMs: z.number(),
});

export const ActiveReviewerAlertSchema = z.object({
  sessionKey: z.string(),
  refTag: z.string(),
  path: z.string(),
  lastSeenAt: z.string(),
  visitorHash: z.string(),
});

export const FrictionAlertsSchema = z.object({
  errorSessions60m: z.number(),
  errorBurstTriggered: z.boolean(),
  topErrorTag: z.string().nullable(),
  topZeroResultQuery: z
    .object({
      slug: z.string(),
      sessions: z.number(),
    })
    .nullable(),
  activeReviewers: z.array(ActiveReviewerAlertSchema),
});

export const InteractionTallyRowSchema = z.object({
  tag: z.string(),
  category: z.string(),
  tone: z.enum(["conversion", "friction", "error", "feature"]),
  totalCount: z.number(),
  uniqueViews: z.number(),
  uniqueSessions: z.number(),
  uniqueVisitors: z.number(),
  sessionReachPct: z.number(),
  avgDwellMs: z.number(),
  topPath: z.string(),
  lastSeenAt: z.string(),
});

export const InteractionCategorySummarySchema = z.object({
  category: z.string(),
  totalCount: z.number(),
  uniqueSessions: z.number(),
  sessionReachPct: z.number(),
});

export const InteractionTalliesSchema = z.object({
  totalInteractions: z.number(),
  totalSessionsWithInteractions: z.number(),
  categories: z.array(InteractionCategorySummarySchema),
  rows: z.array(InteractionTallyRowSchema),
});

export const RouteFlowNextHopSchema = z.object({
  path: z.string(),
  count: z.number(),
});

export const RouteFlowMatrixRowSchema = z.object({
  path: z.string(),
  totalViews: z.number(),
  uniqueSessions: z.number(),
  entryCount: z.number(),
  entryRatePct: z.number(),
  exitCount: z.number(),
  exitRatePct: z.number(),
  singlePageBounceRatePct: z.number(),
  avgDwellMs: z.number(),
  frictionCount: z.number(),
  topNextPaths: z.array(RouteFlowNextHopSchema),
});

export const VariantConfidenceLabelSchema = z.enum(["Insufficient Data", "Trending", "Statistically Significant (95%+)"]);

export const VariantCohortRowSchema = z.object({
  variant: z.string(), sessions: z.number(), activatedSessions: z.number(), activationRatePct: z.number(),
  frustratedSessions: z.number(), frustrationRatePct: z.number(),
  liftVsControlPct: z.number().nullable().optional(), confidenceLabel: VariantConfidenceLabelSchema.optional(),
});

export const RetentionCohortRowSchema = z.object({
  cohortStart: z.string(), cohortLabel: z.string(), newVisitors: z.number(),
  activatedFirstDayPct: z.number(), d1ReturnPct: z.number(), d3ReturnPct: z.number(), d7ReturnPct: z.number(),
});

export const ActivationStickinessSummarySchema = z.object({
  totalVisitors: z.number(),
  newVisitors: z.number(),
  returningVisitors: z.number(),
  returningRatePct: z.number(),
  activatedSessions: z.number(),
  activationRatePct: z.number(),
  avgTimeToFirstActionMs: z.number().nullable(),
  frustratedSessions: z.number(),
  frustrationRatePct: z.number(),
  dauCount: z.number(),
  wauCount: z.number(),
  stickinessRatioPct: z.number(),
  variants: z.array(VariantCohortRowSchema).optional(),
});

export const TrafficSummarySchema = z.object({
  generatedAt: z.string(),
  range: z.enum(["24h", "7d", "30d"]),
  status: z.enum(["live", "missing-table", "error"]),
  detail: z.string().optional(),
  trackingSince: z.string().nullable(),
  totalPageviewsAllTime: z.number(),
  activeNow: z.object({ visitors: z.number(), pages: z.array(CountRowSchema) }),
  totals: TotalsSchema,
  previous: TotalsSchema,
  series: z.array(z.object({ key: z.string(), pageviews: z.number(), visitors: z.number() })),
  bucketUnit: z.enum(["hour", "day"]),
  topPages: z.array(CountRowSchema),
  entryPages: z.array(CountRowSchema),
  referrers: z.array(CountRowSchema),
  utmSources: z.array(CountRowSchema),
  countries: z.array(CountRowSchema),
  devices: z.array(CountRowSchema),
  browsers: z.array(CountRowSchema),
  operatingSystems: z.array(CountRowSchema),
  bots: z.number(),
  recent: z.array(
    z.object({
      id: z.string(),
      viewId: z.string().nullable().optional(),
      at: z.string(),
      lastSeenAt: z.string().optional(),
      path: z.string(),
      referrerHost: z.string().nullable(),
      country: z.string().nullable(),
      region: z.string().nullable(),
      city: z.string().nullable(),
      deviceType: z.string(),
      browser: z.string().nullable(),
      os: z.string().nullable(),
      sessionId: z.string().nullable(),
      visitorHash: z.string().optional(),
      durationMs: z.number().optional(),
      refTag: z.string().nullable().optional(),
      interactions: z.array(z.string()).optional(),
      stepIndex: z.number().optional(),
      stepCount: z.number().optional(),
      isEntry: z.boolean().optional(),
      isExit: z.boolean().optional(),
      isEngaged: z.boolean().optional(),
      isLive: z.boolean().optional(),
      visitNumber: z.number().optional(),
      feedback: z.array(SessionFeedbackItemSchema).optional(),
      user: TrafficUserSchema,
    }),
  ),
  sessions: z.array(VisitorSessionSchema).optional(),
  refRollups: z.array(RefTagRollupSchema).optional(),
  plannerFunnel: PlannerFunnelSchema.optional(),
  labEngagement: z.array(LabEngagementRowSchema).optional(),
  feedback: z.array(SessionFeedbackItemSchema).optional(),
  frictionAlerts: FrictionAlertsSchema.optional(),
  interactionTallies: InteractionTalliesSchema.optional(),
  routeFlowMatrix: z.array(RouteFlowMatrixRowSchema).optional(),
  activationStickiness: ActivationStickinessSummarySchema.optional(),
  retentionCohorts: z.array(RetentionCohortRowSchema).optional(),
});

export type TrafficSummaryView = z.infer<typeof TrafficSummarySchema>;

type _TrafficDrift = AssertTrue<ServerSatisfies<TrafficSummary, TrafficSummaryView>>;
