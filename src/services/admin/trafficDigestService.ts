/**
 * Traffic & Friction Digest service for /admin.
 *
 * Aggregates existing first-party readers (totals, route flows, active friction
 * alerts, interaction tallies, A/B variant lift, and open user feedback) in
 * parallel via `Promise.allSettled`, then synthesizes an executive summary.
 *
 * @file src/services/admin/trafficDigestService.ts
 */

import { classifyInteractionTag } from "@/lib/analytics/interactionClassify";
import { createConcurrencyLimiter } from "@/lib/async/concurrency";
import { invalidate, memoize } from "@/lib/cache/memoryCache";
import { synthesizeDigestNarrative } from "@/services/admin/trafficDigestSynthesis";
import type {
  DigestExperimentSummary,
  DigestFrictionSignalItem,
  DigestFrictionSummary,
  DigestOpenFeedbackItem,
  DigestTopRouteItem,
  TrafficDigestFacts,
  TrafficDigestRange,
  TrafficDigestResponse,
} from "@/services/admin/trafficDigestTypes";
import {
  readActivationAndStickiness,
  readFrictionAlerts,
  readInteractionTallies,
  readRouteFlowMatrix,
  readSessionFeedback,
  readTotals,
} from "@/services/admin/trafficReaders";
import type {
  ActivationStickinessSummary,
  FrictionAlerts,
  InteractionTallies,
  RouteFlowMatrixRow,
  SessionFeedbackItem,
  TrafficTotals,
  VariantCohortRow,
} from "@/services/admin/trafficTypes";

const TOTAL_DIGEST_SOURCES = 7;
const DIGEST_CACHE_TTL_MS = 5 * 60_000;
const REFRESH_COOLDOWN_MS = 15_000;

const lastForcedRefreshByRange = new Map<TrafficDigestRange, number>();

function emptyTotals(): TrafficTotals {
  return {
    pageviews: 0,
    visitors: 0,
    sessions: 0,
    signedInUsers: 0,
    bounceRate: null,
    pagesPerSession: null,
  };
}

function emptyFrictionSummary(): DigestFrictionSummary {
  return {
    rageClicks: 0,
    deadClicks: 0,
    quickBacks: 0,
    slowCwvHits: 0,
    errorSessions60m: 0,
    errorBurstTriggered: false,
    topErrorTag: null,
    topZeroResultQuery: null,
    activeReviewerCount: 0,
  };
}

function buildTopRoutes(rows: RouteFlowMatrixRow[]): DigestTopRouteItem[] {
  return rows.slice(0, 6).map((row) => ({
    path: row.path,
    views: row.totalViews,
    sessions: row.uniqueSessions,
    bounceRatePct: row.singlePageBounceRatePct,
    avgDwellMs: row.avgDwellMs,
    frictionCount: row.frictionCount,
  }));
}

function buildFrictionMetrics(
  tallies: InteractionTallies | null,
  alerts: FrictionAlerts | null,
): { summary: DigestFrictionSummary; signals: DigestFrictionSignalItem[] } {
  const summary = emptyFrictionSummary();
  const signals: DigestFrictionSignalItem[] = [];

  if (alerts) {
    summary.errorSessions60m = alerts.errorSessions60m;
    summary.errorBurstTriggered = alerts.errorBurstTriggered;
    summary.topErrorTag = alerts.topErrorTag;
    summary.topZeroResultQuery = alerts.topZeroResultQuery;
    summary.activeReviewerCount = alerts.activeReviewers.length;
  }

  if (tallies) {
    for (const row of tallies.rows) {
      if (row.tag.startsWith("friction:rage_click")) summary.rageClicks += row.totalCount;
      else if (row.tag.startsWith("friction:dead_click")) summary.deadClicks += row.totalCount;
      else if (row.tag.startsWith("friction:quick_back")) summary.quickBacks += row.totalCount;
      else if (row.tag.startsWith("perf:slow_")) summary.slowCwvHits += row.totalCount;

      if ((row.tone === "friction" || row.tone === "error") && signals.length < 8) {
        signals.push({
          tag: row.tag,
          label: classifyInteractionTag(row.tag).label,
          tone: row.tone,
          totalCount: row.totalCount,
          uniqueSessions: row.uniqueSessions,
          topPath: row.topPath,
        });
      }
    }
  }

  return { summary, signals };
}

function parseExperimentKey(tag: string): string {
  const body = tag.replace(/^variant:/i, "");
  const [prefix] = body.split(/[=:]/);
  return prefix && prefix.length > 0 ? prefix : "ui";
}

function buildExperimentSummary(
  activation: ActivationStickinessSummary | null,
): DigestExperimentSummary | null {
  const variants = activation?.variants ?? [];
  if (variants.length === 0) return null;

  const fastStartArms = variants.filter((v) =>
    /^variant:fast_start_cta[=:]/i.test(v.variant),
  );
  let experimentKey = "fast_start_cta";
  let arms: VariantCohortRow[] = fastStartArms;

  if (arms.length === 0) {
    const [primary] = [...variants].sort((a, b) => b.sessions - a.sessions);
    if (!primary) return null;
    experimentKey = parseExperimentKey(primary.variant);
    arms = variants.filter((v) => parseExperimentKey(v.variant) === experimentKey);
  }

  const nonControl = arms.filter((v) => !/[=:]control$/i.test(v.variant));
  const candidates = nonControl.length > 0 ? nonControl : arms;
  const [leader] = [...candidates].sort(
    (a, b) => b.activationRatePct - a.activationRatePct || b.sessions - a.sessions,
  );

  return {
    experimentKey,
    variants: arms,
    leaderVariant: leader?.variant ?? null,
    liftVsControlPct: leader?.liftVsControlPct ?? null,
    confidenceLabel: leader?.confidenceLabel ?? null,
  };
}

function buildOpenFeedback(items: SessionFeedbackItem[] | null): {
  openFeedbackCount: number;
  openLowRatingCount: number;
  openFeedback: DigestOpenFeedbackItem[];
} {
  if (!items) {
    return { openFeedbackCount: 0, openLowRatingCount: 0, openFeedback: [] };
  }
  const open = items.filter((item) => (item.status ?? "open") === "open");
  const openLowRatingCount = open.filter(
    (item) => item.rating !== null && item.rating <= 3,
  ).length;
  const openFeedback: DigestOpenFeedbackItem[] = open.slice(0, 8).map((item) => ({
    id: item.id,
    at: item.at,
    path: item.path,
    rating: item.rating,
    note: item.note.slice(0, 280),
    refTag: item.refTag,
    sessionId: item.sessionId,
  }));
  return { openFeedbackCount: open.length, openLowRatingCount, openFeedback };
}

function settledOrNull<T>(
  result: PromiseSettledResult<T>,
  label: string,
  degraded: string[],
): T | null {
  if (result.status === "fulfilled") return result.value;
  degraded.push(label);
  return null;
}

type SettledDigestSources = [
  PromiseSettledResult<TrafficTotals>,
  PromiseSettledResult<TrafficTotals>,
  PromiseSettledResult<RouteFlowMatrixRow[]>,
  PromiseSettledResult<FrictionAlerts>,
  PromiseSettledResult<InteractionTallies>,
  PromiseSettledResult<ActivationStickinessSummary>,
  PromiseSettledResult<SessionFeedbackItem[]>,
];

function assembleDigestFacts(
  range: TrafficDigestRange,
  settled: SettledDigestSources,
): TrafficDigestFacts {
  const degradedSources: string[] = [];
  const totals = settledOrNull(settled[0], "totals", degradedSources);
  const previous = settledOrNull(settled[1], "previous", degradedSources);
  const routeFlow = settledOrNull(settled[2], "routes", degradedSources);
  const alerts = settledOrNull(settled[3], "frictionAlerts", degradedSources);
  const tallies = settledOrNull(settled[4], "interactions", degradedSources);
  const activation = settledOrNull(settled[5], "activation", degradedSources);
  const feedback = settledOrNull(settled[6], "feedback", degradedSources);
  const liveSources = TOTAL_DIGEST_SOURCES - degradedSources.length;
  const { summary: frictionSummary, signals: frictionSignals } = buildFrictionMetrics(tallies, alerts);
  const { openFeedbackCount, openLowRatingCount, openFeedback } = buildOpenFeedback(feedback);
  const pageviewsDeltaPct =
    totals && previous && previous.pageviews > 0
      ? Math.round(((totals.pageviews - previous.pageviews) / previous.pageviews) * 1000) / 10
      : null;
  return {
    range, liveSources, totalSources: TOTAL_DIGEST_SOURCES, degradedSources,
    totals: totals ?? emptyTotals(), previous: previous ?? emptyTotals(), pageviewsDeltaPct,
    activationRatePct: activation ? activation.activationRatePct : null,
    frustrationRatePct: activation ? activation.frustrationRatePct : null,
    dauCount: activation ? activation.dauCount : null,
    wauCount: activation ? activation.wauCount : null,
    topRoutes: buildTopRoutes(routeFlow ?? []), frictionSummary, frictionSignals,
    experiment: buildExperimentSummary(activation), openFeedbackCount, openLowRatingCount, openFeedback,
  };
}

export async function getTrafficFrictionDigest(
  range: TrafficDigestRange,
  opts: { skipAi?: boolean } = {},
): Promise<TrafficDigestResponse> {
  const interval = range === "7d" ? "7 days" : "24 hours";
  const dbLimit = createConcurrencyLimiter(2);
  const settled: SettledDigestSources = await Promise.allSettled([
    dbLimit(() => readTotals("NOW() - $1::interval", "NOW()", interval)),
    dbLimit(() => readTotals("NOW() - 2 * $1::interval", "NOW() - $1::interval", interval)),
    dbLimit(() => readRouteFlowMatrix(interval)),
    dbLimit(() => readFrictionAlerts()),
    dbLimit(() => readInteractionTallies(interval)),
    dbLimit(() => readActivationAndStickiness(interval)),
    dbLimit(() => readSessionFeedback(30)),
  ]);
  const facts = assembleDigestFacts(range, settled);
  const synthesis = await synthesizeDigestNarrative(facts, opts);
  return {
    success: true,
    generatedAt: new Date().toISOString(),
    range,
    live: facts.liveSources > 0,
    synthesisMode: synthesis.synthesisMode,
    model: synthesis.model,
    fallbackReason: synthesis.fallbackReason,
    narrative: synthesis.narrative,
    facts,
  };
}

/** Cache digest reads for 5m; manual refreshes honor a per-range 15s cooldown. */
export async function getCachedTrafficFrictionDigest(
  range: TrafficDigestRange,
  forceRefresh: boolean,
): Promise<TrafficDigestResponse> {
  const cacheKey = `admin:traffic-digest:${range}`;
  if (forceRefresh) {
    const now = Date.now();
    const lastRefresh = lastForcedRefreshByRange.get(range) ?? 0;
    if (now - lastRefresh >= REFRESH_COOLDOWN_MS) {
      lastForcedRefreshByRange.set(range, now);
      invalidate(cacheKey);
    }
  }
  return memoize(cacheKey, DIGEST_CACHE_TTL_MS, () => getTrafficFrictionDigest(range));
}

export function resetTrafficDigestCooldownForTests(): void {
  lastForcedRefreshByRange.clear();
}
