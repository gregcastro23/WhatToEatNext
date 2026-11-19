/**
 * Types for the AI Daily Traffic & Friction Digest executive card on /admin.
 *
 * Kept dependency-light so both server synthesis/collection modules and
 * client-side Zod schema drift checks can import types safely.
 *
 * @file src/services/admin/trafficDigestTypes.ts
 */

import type {
  TrafficTotals,
  VariantCohortRow,
  VariantConfidenceLabel,
} from "@/services/admin/trafficTypes";

export type TrafficDigestRange = "24h" | "7d";

export type DigestSeverity = "healthy" | "watch" | "action_needed";

export type DigestFindingCategory =
  | "traffic"
  | "friction"
  | "experiment"
  | "feedback";

export type DigestFindingSeverity = "info" | "warn" | "critical";

export type DigestSynthesisMode = "ai" | "deterministic";

export interface DigestFinding {
  category: DigestFindingCategory;
  title: string;
  detail: string;
  severity: DigestFindingSeverity;
  actionHref: string | null;
}

export interface DigestAction {
  priority: "P0" | "P1" | "P2";
  action: string;
  rationale: string;
  targetPath: string | null;
}

export interface DigestNarrative {
  headline: string;
  severity: DigestSeverity;
  executiveSummary: string;
  topFindings: DigestFinding[];
  recommendedActions: DigestAction[];
}

export interface DigestTopRouteItem {
  path: string;
  views: number;
  sessions: number;
  bounceRatePct: number;
  avgDwellMs: number;
  frictionCount: number;
}

export interface DigestFrictionSignalItem {
  tag: string;
  label: string;
  tone: "friction" | "error";
  totalCount: number;
  uniqueSessions: number;
  topPath: string;
}

export interface DigestOpenFeedbackItem {
  id: string;
  at: string;
  path: string;
  rating: number | null;
  note: string;
  refTag: string | null;
  sessionId: string | null;
}

export interface DigestExperimentSummary {
  experimentKey: string;
  variants: VariantCohortRow[];
  leaderVariant: string | null;
  liftVsControlPct: number | null;
  confidenceLabel: VariantConfidenceLabel | null;
}

export interface DigestFrictionSummary {
  rageClicks: number;
  deadClicks: number;
  quickBacks: number;
  slowCwvHits: number;
  errorSessions60m: number;
  errorBurstTriggered: boolean;
  topErrorTag: string | null;
  topZeroResultQuery: { slug: string; sessions: number } | null;
  activeReviewerCount: number;
}

export interface TrafficDigestFacts {
  range: TrafficDigestRange;
  liveSources: number;
  totalSources: number;
  degradedSources: string[];
  totals: TrafficTotals;
  previous: TrafficTotals;
  pageviewsDeltaPct: number | null;
  activationRatePct: number | null;
  frustrationRatePct: number | null;
  dauCount: number | null;
  wauCount: number | null;
  topRoutes: DigestTopRouteItem[];
  frictionSummary: DigestFrictionSummary;
  frictionSignals: DigestFrictionSignalItem[];
  experiment: DigestExperimentSummary | null;
  openFeedbackCount: number;
  openLowRatingCount: number;
  openFeedback: DigestOpenFeedbackItem[];
}

export interface TrafficDigestResponse {
  success: true;
  generatedAt: string;
  range: TrafficDigestRange;
  live: boolean;
  synthesisMode: DigestSynthesisMode;
  model: string | null;
  fallbackReason: string | null;
  narrative: DigestNarrative;
  facts: TrafficDigestFacts;
}
