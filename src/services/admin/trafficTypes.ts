/**
 * Types for first-party traffic analytics (page_views, migrations 86, 100, 101).
 *
 * @file src/services/admin/trafficTypes.ts
 */

import {
  classifyInteractionTag,
  type ClassifiedInteraction,
  type DeviceType,
  type InteractionTone,
} from "@/lib/analytics/pageViewClassify";

export { classifyInteractionTag, type ClassifiedInteraction, type InteractionTone };

export type TrafficRange = "24h" | "7d" | "30d";

export type TrafficStatus = "live" | "missing-table" | "error";

export interface PageViewInsert {
  viewId?: string | null;
  path: string;
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  refTag?: string | null;
  durationMs?: number;
  interactions?: string[];
  visitorHash: string;
  sessionId: string | null;
  userId: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: DeviceType;
  browser: string | null;
  os: string | null;
  isBot: boolean;
}

export interface TrafficTotals {
  pageviews: number;
  visitors: number;
  sessions: number;
  signedInUsers: number;
  bounceRate: number | null;
  pagesPerSession: number | null;
}

export interface TrafficBucket {
  /** New York wall-clock key: "2026-09-22" (day) or "2026-09-22T14" (hour). */
  key: string;
  pageviews: number;
  visitors: number;
}

export interface CountRow { label: string; count: number; visitors?: number }

export interface RecentPageView {
  id: string;
  viewId?: string | null;
  at: string;
  lastSeenAt?: string;
  path: string;
  referrerHost: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: string;
  browser: string | null;
  os: string | null;
  sessionId: string | null;
  visitorHash?: string;
  durationMs?: number;
  refTag?: string | null;
  interactions?: string[];
  stepIndex?: number;
  stepCount?: number;
  isEntry?: boolean;
  isExit?: boolean;
  isEngaged?: boolean;
  isLive?: boolean;
  visitNumber?: number;
  feedback?: SessionFeedbackItem[];
  user: { id: string; email: string; name: string | null; isAdmin: boolean } | null;
}

export interface VisitorSessionStep {
  id: string;
  at: string;
  path: string;
  durationMs: number;
  refTag: string | null;
  interactions: string[];
}

export type SessionFeedbackStatus = "open" | "resolved" | "dismissed";

export interface SessionFeedbackItem {
  id: string;
  at: string;
  viewId: string | null;
  sessionId: string | null;
  visitorHash: string | null;
  path: string;
  refTag: string | null;
  rating: number | null;
  note: string;
  status?: SessionFeedbackStatus;
  resolvedAt?: string | null;
}

export interface VisitorSession {
  sessionKey: string;
  visitorHash: string;
  sessionId: string | null;
  startedAt: string;
  lastSeenAt: string;
  totalDurationMs: number;
  pageCount: number;
  engaged: boolean;
  activeNow: boolean;
  liveNow90s?: boolean;
  isStuck?: boolean;
  hasError?: boolean;
  hasFriction?: boolean;
  visitNumber?: number;
  priorSessionKeys?: string[];
  entryPath: string;
  exitPath: string;
  referrerHost: string | null;
  utmSource: string | null;
  refTag: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: string;
  browser: string | null;
  os: string | null;
  user: { id: string; email: string; name: string | null; isAdmin: boolean } | null;
  steps: VisitorSessionStep[];
  feedback?: SessionFeedbackItem[];
}

export interface RefTagRollup {
  refTag: string;
  visitors: number;
  sessions: number;
  pageviews: number;
  engagedSessions: number;
  engagedRate: number;
  medianDwellMs: number;
  avgPagesPerSession: number;
  signedInUsers: number;
}

export interface PlannerFunnelStage { stage: string; sessions: number; rate: number }
export interface PlannerFunnelCohort { label: string; landed: number; generated: number; refined: number; converted: number; conversionRate: number }
export interface PlannerFunnel { stages: PlannerFunnelStage[]; cohorts: PlannerFunnelCohort[] }
export interface LabEngagementRow { tag: string; kind: "tab" | "solver"; sessions: number; medianDwellMs: number }
export interface ActiveReviewerAlert { sessionKey: string; refTag: string; path: string; lastSeenAt: string; visitorHash: string }

export interface FrictionAlerts {
  errorSessions60m: number;
  errorBurstTriggered: boolean;
  topErrorTag: string | null;
  topZeroResultQuery: { slug: string; sessions: number } | null;
  activeReviewers: ActiveReviewerAlert[];
}

export interface InteractionTallyRow {
  tag: string;
  category: string;
  tone: InteractionTone;
  totalCount: number;
  uniqueViews: number;
  uniqueSessions: number;
  uniqueVisitors: number;
  sessionReachPct: number;
  avgDwellMs: number;
  topPath: string;
  lastSeenAt: string;
}

export interface InteractionCategorySummary {
  category: string;
  totalCount: number;
  uniqueSessions: number;
  sessionReachPct: number;
}

export interface InteractionTallies { totalInteractions: number; totalSessionsWithInteractions: number; categories: InteractionCategorySummary[]; rows: InteractionTallyRow[] }
export interface RouteFlowNextHop { path: string; count: number }

export interface RouteFlowMatrixRow {
  path: string;
  totalViews: number;
  uniqueSessions: number;
  entryCount: number;
  entryRatePct: number;
  exitCount: number;
  exitRatePct: number;
  singlePageBounceRatePct: number;
  avgDwellMs: number;
  frictionCount: number;
  topNextPaths: RouteFlowNextHop[];
}

export type VariantConfidenceLabel =
  | "Insufficient Data"
  | "Trending"
  | "Statistically Significant (95%+)";

export interface VariantCohortRow {
  variant: string;
  sessions: number;
  activatedSessions: number;
  activationRatePct: number;
  frustratedSessions: number;
  frustrationRatePct: number;
  liftVsControlPct?: number | null;
  confidenceLabel?: VariantConfidenceLabel;
}

export interface RetentionCohortRow {
  cohortStart: string;
  cohortLabel: string;
  newVisitors: number;
  activatedFirstDayPct: number;
  d1ReturnPct: number;
  d3ReturnPct: number;
  d7ReturnPct: number;
}

export interface ActivationStickinessSummary {
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;
  returningRatePct: number;
  activatedSessions: number;
  activationRatePct: number;
  avgTimeToFirstActionMs: number | null;
  frustratedSessions: number;
  frustrationRatePct: number;
  dauCount: number;
  wauCount: number;
  stickinessRatioPct: number;
  variants?: VariantCohortRow[];
}

export interface TrafficDimensions {
  referrers: CountRow[];
  utmSources: CountRow[];
  countries: CountRow[];
  devices: CountRow[];
  browsers: CountRow[];
  operatingSystems: CountRow[];
}

export interface TrafficSummary extends TrafficDimensions {
  generatedAt: string;
  range: TrafficRange;
  /** Only `live` carries numbers; the others explain why there are none. */
  status: TrafficStatus;
  detail?: string;
  trackingSince: string | null;
  totalPageviewsAllTime: number;
  activeNow: { visitors: number; pages: CountRow[] };
  totals: TrafficTotals;
  previous: TrafficTotals;
  series: TrafficBucket[];
  bucketUnit: "hour" | "day";
  topPages: CountRow[];
  entryPages: CountRow[];
  bots: number;
  recent: RecentPageView[];
  sessions?: VisitorSession[];
  refRollups?: RefTagRollup[];
  plannerFunnel?: PlannerFunnel;
  labEngagement?: LabEngagementRow[];
  feedback?: SessionFeedbackItem[];
  frictionAlerts?: FrictionAlerts;
  interactionTallies?: InteractionTallies;
  routeFlowMatrix?: RouteFlowMatrixRow[];
  activationStickiness?: ActivationStickinessSummary;
  retentionCohorts?: RetentionCohortRow[];
}

export interface TrafficPulse {
  status: TrafficStatus;
  activeNow: number;
  pageviews24h: number;
  visitors24h: number;
  pageviewsPrev24h: number;
  lastVisitAt: string | null;
}
