/**
 * System Status Service
 *
 * Computes operational health for each critical user-facing flow from
 * existing signals (auth_events, feed_events, request log, slow query
 * ring, DB pool, feedEmitTracker). NO new instrumentation is required —
 * this surfaces what's already being captured.
 *
 * Each flow returns:
 *   - status:  OK | DEGRADED | INCIDENT | UNKNOWN
 *   - summary: short human-readable sentence
 *   - metrics: structured numbers
 *   - issues:  recent failures or warnings (most-recent first)
 *
 * Statuses degrade independently so a failing payments flow can't take
 * down the auth panel.
 *
 * @file src/services/systemStatusService.ts
 */

import { checkDatabaseHealth, executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  summarizePath,
  summarizePathDurable,
  type PathHealth,
} from "@/lib/observability/requestLog";
import { summarizeSlowQueries } from "@/lib/observability/slowQueryLog";
import { redisGet, redisSet } from "@/lib/redis";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import {
  classifyCreditPath,
  fetchCreditPathSignals,
} from "@/services/agentCreditPathHealth";
import {
  classifyDebitPath,
  fetchDebitPathSignals,
} from "@/services/agentDebitPathHealth";
import { getEventCounts } from "@/services/authEventsService";
import { getCronHeartbeats } from "@/services/cronHeartbeatService";
import {
  classifyCronLedgerPath,
  fetchCronLedgerSignals,
} from "@/services/cronLedgerHealth";
import { feedEmitTracker } from "@/services/feedEmitTracker";
import { getMcpNetworkSummary } from "@/services/mcpNetworkService";
import {
  classifyPoolerSaturation,
  fetchPoolerSaturationSignals,
} from "@/services/poolerSaturationHealth";
import type { StripeWebhookCoverage } from "@/services/stripeWebhookCoverageService";
import { getSubscriptionRevenueBreakdown } from "@/services/subscriptionRevenueService";
// Type-only: erased at compile, so the Stripe SDK still loads only via the
// dynamic import inside probePayments.
import {
  getLatestProbeResults,
  type LatestProbeRow,
} from "@/services/syntheticProbeService";

export type FlowStatus = "OK" | "DEGRADED" | "INCIDENT" | "UNKNOWN";

export interface FlowIssue {
  at: string;
  message: string;
  severity: "warn" | "error";
}

export interface FlowMetric {
  label: string;
  value: string;
  /** Optional numeric for sparkline/comparison; not required. */
  raw?: number;
}

export interface FlowHealth {
  /** Stable id used by the UI for routing/keying. */
  id: string;
  /** Display label. */
  label: string;
  /** What this flow does (one short sentence). */
  description: string;
  status: FlowStatus;
  /** Short human summary of current state. */
  summary: string;
  /** Key metrics (3-5 chips). */
  metrics: FlowMetric[];
  /** Recent issues (most-recent first, capped). */
  issues: FlowIssue[];
  /** When this flow was last computed. */
  checkedAt: string;
  /**
   * True when status reflects a live source. False when the source itself
   * was unavailable and we degraded to UNKNOWN.
   */
  live: boolean;
}

export interface DependencyHealth {
  id: string;
  label: string;
  status: FlowStatus;
  summary: string;
  /** Round-trip latency to the dependency in ms (null when unknown). */
  latencyMs: number | null;
  checkedAt: string;
}

export interface SystemStatusPayload {
  generatedAt: string;
  /** Worst status across all flows + dependencies, surfaces on the banner. */
  overall: FlowStatus;
  flows: FlowHealth[];
  dependencies: DependencyHealth[];
}

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Pick the worst status across an array. Order of severity:
 * INCIDENT > DEGRADED > UNKNOWN > OK. An empty array is treated as OK
 * (vacuously healthy) so callers don't need to guard.
 *
 * Exported for unit tests; production callers go through `getSystemStatus`.
 */
export function worst(statuses: FlowStatus[]): FlowStatus {
  if (statuses.includes("INCIDENT")) return "INCIDENT";
  if (statuses.includes("DEGRADED")) return "DEGRADED";
  if (statuses.every((s) => s === "OK")) return "OK";
  return statuses.includes("UNKNOWN") ? "DEGRADED" : "OK";
}

/**
 * Roll per-flow and per-dependency statuses up into the single banner status.
 *
 * Flows contribute directly: an unmeasurable flow (UNKNOWN) is a genuine blind
 * spot worth surfacing as amber, so `worst()` maps it to DEGRADED.
 *
 * Dependencies are different — they're only PASSIVELY observed. Stripe and
 * Google OAuth get no synthetic ping, so on a low-traffic day they sit at
 * UNKNOWN as their NORMAL idle state. Letting that idle-UNKNOWN map to DEGRADED
 * pinned the banner permanently amber even when every flow was green. So a
 * dependency only escalates the banner when it reports a CONCRETE
 * DEGRADED/INCIDENT (real webhook/callback 5xx); idle-UNKNOWN is treated as OK.
 *
 * Exported for unit tests.
 */
export function rollUpOverall(
  flowStatuses: FlowStatus[],
  dependencyStatuses: FlowStatus[],
): FlowStatus {
  return worst([
    ...flowStatuses,
    ...dependencyStatuses.map((s) => (s === "UNKNOWN" ? "OK" : s)),
  ]);
}

/**
 * Derive a single FlowStatus from a PathHealth observation. Exported for
 * unit tests.
 *
 * ── Why this reads `serverErrorRate` and not `errorRate` ────────────────────
 *
 * A 5xx means the server failed. A 4xx means the server understood the request
 * and correctly refused it — that is the endpoint WORKING, and it must not page
 * anyone.
 *
 * `[MEASURED 2026-08-14]` this distinction was not being made, and it cost 26
 * false INCIDENT alerts in 7 days on the `economy` flow, each one emailing every
 * admin. Over that window the whole request log held **9,819 requests and ZERO
 * 5xx**; 6,427 of the 6,488 responses >= 400 were `402 insufficient_funds` on
 * `/api/economy/sync-debit`, which is a documented outcome of that route (an
 * agent tried to spend ESMS it does not have). The alarm was measuring how many
 * agents are broke and reporting it as "/api/economy failing (100.0%)".
 *
 * The smallest sample behind one of those alerts was TWO requests, both 402.
 *
 * This is not a new policy — `probeRecommendations` already summed `errors5xx`
 * rather than `errorRate` for exactly this reason. The other four call sites
 * were simply never updated, so the rule now lives in the shared helper where
 * it cannot drift again.
 *
 * ── What this deliberately does NOT do ──────────────────────────────────────
 *
 * No minimum sample size. It is tempting — the two-request alert above is
 * embarrassing — but there is no evidence a 5xx is ever noise here (there were
 * none at all to look at), and a minimum would silence a genuine lone 500 on a
 * low-traffic route like `/api/stripe/webhook`. Narrowing on measured evidence
 * is a fix; narrowing on a hunch is just a quieter alarm.
 *
 * `/api/economy/sync-debit` returned 500 on 100% of calls for twelve weeks
 * without anything noticing (see `agentDebitPathHealth.ts`). A 100%-5xx path
 * still reports INCIDENT here — that case gets stronger, not weaker, once the
 * 402 noise stops burying it.
 */
export function statusFromPathHealth(
  health: PathHealth,
  thresholds: { warnErrorRate: number; warnP95Ms: number; failErrorRate: number },
): FlowStatus {
  if (!health.observed) return "UNKNOWN";
  if (health.serverErrorRate >= thresholds.failErrorRate) return "INCIDENT";
  if (
    health.serverErrorRate >= thresholds.warnErrorRate ||
    health.p95LatencyMs >= thresholds.warnP95Ms
  ) {
    return "DEGRADED";
  }
  return "OK";
}

function formatLatency(ms: number): string {
  if (ms <= 0) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatPct(value: number, fractionDigits = 1): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

function issueFromFailure(
  health: PathHealth,
  label: string,
): FlowIssue | null {
  if (!health.lastFailure) return null;
  return {
    at: health.lastFailure.at,
    message: `${health.lastFailure.method} ${health.lastFailure.path} → ${health.lastFailure.status} (${health.lastFailure.latencyMs}ms) · ${label}`,
    severity: health.lastFailure.status >= 500 ? "error" : "warn",
  };
}

/**
 * Normalize the latest result for a given probe_name into a small
 * struct the flow-probe functions can fold into their status verdict.
 *
 * Each consumer probe knows its cron cadence, so it passes the
 * stale-after threshold (slightly longer than the cron interval, e.g.
 * 15-min probe gets 90-min stale window — three missed runs).
 *
 * Absence ⇒ no influence (probe not configured / first deploy).
 */
export interface SyntheticProbeInfluence {
  metricValue: string;
  metricRaw: number;
  /** Most-recent failure inside the stale window. */
  freshFailure: boolean;
  /** Probe ran but the most recent result is older than staleAfterMs. */
  stale: boolean;
  /** Probe has never reported (or the table is empty). */
  missing: boolean;
  lastStatus: string | null;
  lastAt: string | null;
  errorMessage: string | null;
  issue: FlowIssue | null;
}

export function evaluateSyntheticProbe(
  probeName: string,
  latest: LatestProbeRow[],
  staleAfterMs: number,
): SyntheticProbeInfluence {
  const row = latest.find((r) => r.probeName === probeName);
  if (!row) {
    return {
      metricValue: "—",
      metricRaw: 0,
      freshFailure: false,
      stale: false,
      missing: true,
      lastStatus: null,
      lastAt: null,
      errorMessage: null,
      issue: null,
    };
  }
  const ageMs = Date.now() - new Date(row.startedAt).getTime();
  const stale = ageMs > staleAfterMs;
  const freshFailure = !stale && row.status !== "success";
  const issue: FlowIssue | null = freshFailure
    ? {
        at: row.startedAt,
        message: `Synthetic ${probeName} ${row.status}${row.errorMessage ? `: ${row.errorMessage}` : ""}`,
        severity: "error",
      }
    : stale
      ? {
          at: row.startedAt,
          message: `Synthetic ${probeName} last ran ${Math.round(ageMs / 60_000)}min ago — cron may have stopped`,
          severity: "warn",
        }
      : null;
  return {
    metricValue: row.status,
    metricRaw: freshFailure ? 0 : 1,
    freshFailure,
    stale,
    missing: false,
    lastStatus: row.status,
    lastAt: row.startedAt,
    errorMessage: row.errorMessage,
    issue,
  };
}

// ─── Flow probes ──────────────────────────────────────────────────────

const FIVE_MIN = 5 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

const STALE_15MIN = 90 * 60 * 1000; // 15-min cron → 3 missed runs.
const STALE_30MIN = 3 * 60 * 60 * 1000; // 30-min cron → 6 missed runs.
const STALE_HOURLY = 4 * 60 * 60 * 1000; // hourly cron → 4 missed runs.

async function probeAuth(latest: LatestProbeRow[]): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  // /api/auth covers the next-auth catch-all only — csrf, signin, callback,
  // signout. It does NOT cover session pings: /api/auth/session and
  // /api/auth/sessions/* are concrete route files that shadow the catch-all
  // and carry no observability wrapper, so they are invisible here. Much of
  // what this does see is the 15-minute auth-signin synthetic probe rather
  // than organic traffic.
  const session = summarizePath("/api/auth", FIVE_MIN);
  let authEventsLive = true;
  let signins24h = 0;
  let failures24h = 0;
  try {
    const counts = await getEventCounts(ONE_DAY);
    signins24h = counts.byType
      .filter((r) => r.type.includes("signin") && r.status === "success")
      .reduce((sum, r) => sum + r.count, 0);
    failures24h = counts.byType
      .filter((r) => r.type.includes("signin") && r.status === "failure")
      .reduce((sum, r) => sum + r.count, 0);
  } catch (err) {
    _logger.warn("[systemStatus] auth event counts failed:", err);
    authEventsLive = false;
  }

  // 24h sign-in failure rate as the "really broken?" signal — request-log
  // 5xx alone is noisy (auth pings include lots of expected 401s).
  const failureRate24h =
    signins24h + failures24h > 0
      ? failures24h / (signins24h + failures24h)
      : 0;

  const handshake = evaluateSyntheticProbe(
    "auth-handshake",
    latest,
    STALE_15MIN,
  );
  // Real OAuth entry path + client-secret validity. This is what catches a
  // genuinely broken sign-in: organic sign-in counts can read 0 simply
  // because everyone's on long-lived JWT cookies, so without this probe the
  // auth panel is vacuously "OK" and can't tell idle from broken.
  const signin = evaluateSyntheticProbe("auth-signin", latest, STALE_15MIN);

  let status: FlowStatus;
  if (!session.observed && !authEventsLive) status = "UNKNOWN";
  else if (failureRate24h >= 0.5) status = "INCIDENT";
  else if (handshake.freshFailure || signin.freshFailure) status = "INCIDENT";
  else if (
    failureRate24h >= 0.2 ||
    statusFromPathHealth(session, {
      warnErrorRate: 0.1,
      warnP95Ms: 1500,
      failErrorRate: 0.5,
    }) === "INCIDENT"
  ) {
    status = "DEGRADED";
  } else if (handshake.stale || signin.stale) {
    status = "DEGRADED";
  } else {
    status = "OK";
  }

  const issues: FlowIssue[] = [];
  // Sign-in breakage is the most actionable auth issue — surface it first.
  if (signin.issue) issues.push(signin.issue);
  if (handshake.issue) issues.push(handshake.issue);
  const sessionIssue = issueFromFailure(session, "auth");
  if (sessionIssue) issues.push(sessionIssue);

  return {
    id: "auth",
    label: "Authentication",
    description:
      "Google OAuth sign-in, NextAuth session creation, device sessions.",
    status,
    summary:
      status === "OK"
        ? `${signins24h} sign-ins in 24h · sign-in path verified`
        : status === "DEGRADED"
          ? signin.stale
            ? "Synthetic auth-signin probe stale"
            : handshake.stale
              ? "Synthetic auth-handshake probe stale"
              : `${failures24h} sign-in failures in 24h (${formatPct(failureRate24h)})`
          : status === "INCIDENT"
            ? signin.freshFailure
              ? "Synthetic auth-signin probe failing — sign-in likely broken"
              : handshake.freshFailure
                ? "Synthetic auth-handshake probe failing"
                : `Sign-ins failing — ${formatPct(failureRate24h)} failure rate 24h`
            : "No auth signal in window",
    metrics: [
      { label: "Sign-ins · 24h", value: `${signins24h}`, raw: signins24h },
      {
        label: "Failures · 24h",
        value: `${failures24h}`,
        raw: failures24h,
      },
      {
        label: "p95 · /api/auth",
        value: formatLatency(session.p95LatencyMs),
        raw: session.p95LatencyMs,
      },
      {
        label: "Sign-in probe",
        value: signin.metricValue,
        raw: signin.metricRaw,
      },
    ],
    issues,
    checkedAt,
    live: authEventsLive,
  };
}

async function probeOnboarding(latest: LatestProbeRow[]): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  const onboardingHealth = summarizePath("/api/onboarding", ONE_HOUR);

  let funnelLive = true;
  let signupsLast24h = 0;
  let onboardedLast24h = 0;
  let stuckUsers = 0;
  try {
    const result = await executeQuery<{
      signups: number;
      onboarded: number;
      stuck: number;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE u.created_at > NOW() - INTERVAL '24 hours' AND COALESCE(u.is_agent, false) = false)::int AS signups,
         COUNT(*) FILTER (WHERE up.onboarding_completed = true AND COALESCE(up.onboarding_completed_at, u.created_at) > NOW() - INTERVAL '24 hours' AND COALESCE(u.is_agent, false) = false)::int AS onboarded,
         COUNT(*) FILTER (
           WHERE u.created_at > NOW() - INTERVAL '24 hours'
             AND u.created_at < NOW() - INTERVAL '1 hour'
             AND COALESCE(u.is_agent, false) = false
             AND COALESCE(up.onboarding_completed, false) = false
         )::int AS stuck
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       -- Bounds the scan; previously every users×user_profiles row was read
       -- with the 24h windows only inside FILTER(). The OR is required because
       -- the onboarded stage is scoped by COALESCE(onboarding_completed_at,
       -- created_at) — a user created long ago can complete today.
       WHERE u.created_at > NOW() - INTERVAL '24 hours'
          OR up.onboarding_completed_at > NOW() - INTERVAL '24 hours'`,
    );
    signupsLast24h = result.rows[0]?.signups ?? 0;
    onboardedLast24h = result.rows[0]?.onboarded ?? 0;
    stuckUsers = result.rows[0]?.stuck ?? 0;
  } catch (err) {
    _logger.warn("[systemStatus] onboarding funnel query failed:", err);
    funnelLive = false;
  }

  const synthetic = evaluateSyntheticProbe(
    "onboarding-skip",
    latest,
    STALE_15MIN,
  );
  const syntheticFreshFailure = synthetic.freshFailure;
  const syntheticStale = synthetic.stale;
  const syntheticLastStatus = synthetic.lastStatus;

  // Status logic:
  // - INCIDENT when /api/onboarding is observed AND >50% are erroring.
  // - INCIDENT when the most recent synthetic probe (run within 90 min) failed
  //   — the flow is broken even if no organic users have noticed yet.
  // - DEGRADED when many stuck users, error rate climbing, signups without
  //   completions, or the synthetic probe is stale (cron may be broken).
  const pathStatus = statusFromPathHealth(onboardingHealth, {
    warnErrorRate: 0.1,
    warnP95Ms: 5000,
    failErrorRate: 0.5,
  });

  let status: FlowStatus;
  if (!funnelLive && pathStatus === "UNKNOWN") status = "UNKNOWN";
  else if (pathStatus === "INCIDENT") status = "INCIDENT";
  else if (syntheticFreshFailure) status = "INCIDENT";
  else if (pathStatus === "DEGRADED") status = "DEGRADED";
  else if (syntheticStale) status = "DEGRADED";
  else if (stuckUsers >= 5) status = "DEGRADED";
  else if (signupsLast24h > 0 && onboardedLast24h === 0 && signupsLast24h >= 3)
    // Signups arriving but nobody finishing — strong "broken" signal.
    status = "DEGRADED";
  else status = "OK";

  const completionRate =
    signupsLast24h > 0 ? onboardedLast24h / signupsLast24h : 1;

  const issues: FlowIssue[] = [];
  if (synthetic.issue) issues.push(synthetic.issue);
  if (stuckUsers >= 5) {
    issues.push({
      at: checkedAt,
      message: `${stuckUsers} users signed up >1h ago but haven't completed onboarding`,
      severity: "warn",
    });
  }
  if (signupsLast24h >= 3 && onboardedLast24h === 0) {
    issues.push({
      at: checkedAt,
      message: `${signupsLast24h} signups in 24h but 0 onboardings completed — flow may be broken`,
      severity: "error",
    });
  }
  const onbFailure = issueFromFailure(onboardingHealth, "onboarding");
  if (onbFailure) issues.push(onbFailure);

  return {
    id: "onboarding",
    label: "New-User Onboarding",
    description:
      "Birth-data submission, natal-chart computation, profile completion.",
    status,
    summary:
      status === "OK"
        ? `${onboardedLast24h}/${signupsLast24h} signups onboarded in 24h (${formatPct(completionRate, 0)})`
        : status === "DEGRADED"
          ? syntheticStale
            ? "Synthetic probe stale — cron may have stopped"
            : stuckUsers >= 5
              ? `${stuckUsers} users stuck mid-onboarding`
              : `Completion rate ${formatPct(completionRate, 0)} — investigate`
          : status === "INCIDENT"
            ? syntheticFreshFailure
              ? "Synthetic onboarding probe failing — flow is broken"
              : // serverErrorRate, to match the rate the verdict was made on.
                `/api/onboarding server errors: ${formatPct(onboardingHealth.serverErrorRate)} of ${onboardingHealth.count} req`
            : "Awaiting signals",
    metrics: [
      { label: "Signups · 24h", value: `${signupsLast24h}`, raw: signupsLast24h },
      {
        label: "Onboarded · 24h",
        value: `${onboardedLast24h}`,
        raw: onboardedLast24h,
      },
      {
        label: "Stuck > 1h",
        value: `${stuckUsers}`,
        raw: stuckUsers,
      },
      {
        label: "Synthetic",
        value: syntheticLastStatus ?? "—",
        raw: syntheticFreshFailure ? 0 : 1,
      },
    ],
    issues,
    checkedAt,
    live: funnelLive,
  };
}

async function probeRecommendations(
  latest: LatestProbeRow[],
): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  const personalized = summarizePath(
    "/api/personalized-recommendations",
    FIVE_MIN,
  );
  const transmutation = summarizePath(
    "/api/transmutation_recommendations",
    FIVE_MIN,
  );
  const cuisines = summarizePath("/api/cuisines/recommend", FIVE_MIN);

  const combined = [personalized, transmutation, cuisines];
  const observed = combined.filter((h) => h.observed);
  const totalErrors = combined.reduce((sum, h) => sum + h.errors5xx, 0);
  const totalRequests = combined.reduce((sum, h) => sum + h.count, 0);
  const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;
  const worstP95 = combined.reduce((m, h) => Math.max(m, h.p95LatencyMs), 0);

  const synthetic = evaluateSyntheticProbe(
    "recommendations",
    latest,
    STALE_15MIN,
  );

  let status: FlowStatus;
  if (observed.length === 0 && synthetic.missing) status = "UNKNOWN";
  else if (errorRate >= 0.5 || synthetic.freshFailure) status = "INCIDENT";
  else if (errorRate >= 0.1 || worstP95 >= 3000 || synthetic.stale)
    status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  if (synthetic.issue) issues.push(synthetic.issue);
  for (const probe of [personalized, transmutation, cuisines]) {
    const issue = issueFromFailure(probe, "recommendation");
    if (issue) issues.push(issue);
  }

  return {
    id: "recommendations",
    label: "Recipe Recommendations",
    description:
      "Personalized + transmutation + cuisine recommendation endpoints.",
    status,
    summary:
      status === "OK"
        ? `${totalRequests} requests · ${formatLatency(worstP95)} p95`
        : status === "DEGRADED"
          ? synthetic.stale
            ? "Synthetic recommendations probe stale"
            : `Latency or errors elevated · p95 ${formatLatency(worstP95)}`
          : status === "INCIDENT"
            ? synthetic.freshFailure
              ? "Synthetic recommendations probe failing"
              : `Recommendation endpoints failing (${formatPct(errorRate)})`
            : "No recommendation traffic in window",
    metrics: [
      { label: "Requests · 5m", value: `${totalRequests}`, raw: totalRequests },
      {
        label: "5xx · 5m",
        value: `${totalErrors}`,
        raw: totalErrors,
      },
      {
        label: "p95 worst",
        value: formatLatency(worstP95),
        raw: worstP95,
      },
      {
        label: "Synthetic",
        value: synthetic.metricValue,
        raw: synthetic.metricRaw,
      },
    ],
    issues: issues.slice(0, 3),
    checkedAt,
    live: true,
  };
}

async function probeAIGeneration(
  latest: LatestProbeRow[],
): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  const cosmic = summarizePath("/api/generate-cosmic-recipe", FIVE_MIN);
  // /api/recipes/generate does not exist under src/app/api — summarizing it
  // reported a permanent calm zero (the same trap as the deleted Stripe routes
  // in probePayments). /api/recommendations/generate is the real token-charged
  // generation endpoint.
  const aiGenerate = summarizePath("/api/recommendations/generate", FIVE_MIN);
  const combined = [cosmic, aiGenerate];

  const observed = combined.filter((h) => h.observed);
  const totalErrors = combined.reduce((sum, h) => sum + h.errors5xx, 0);
  const totalRequests = combined.reduce((sum, h) => sum + h.count, 0);
  const worstP95 = combined.reduce((m, h) => Math.max(m, h.p95LatencyMs), 0);
  const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

  // Cosmic-recipe probe runs hourly (expensive). Allow 4× stale window
  // before degrading the flow.
  const synthetic = evaluateSyntheticProbe(
    "cosmic-recipe",
    latest,
    STALE_HOURLY,
  );

  let status: FlowStatus;
  if (observed.length === 0 && synthetic.missing) status = "UNKNOWN";
  else if (errorRate >= 0.4 || synthetic.freshFailure) status = "INCIDENT";
  // AI generation is naturally slow — be lenient on latency, strict on errors.
  else if (errorRate >= 0.1 || worstP95 >= 30_000 || synthetic.stale)
    status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  if (synthetic.issue) issues.push(synthetic.issue);
  for (const probe of combined) {
    const issue = issueFromFailure(probe, "ai-generation");
    if (issue) issues.push(issue);
  }

  return {
    id: "ai-generation",
    label: "AI Recipe Generation",
    description:
      "Cosmic-recipe and recommendation generation endpoints, token-gated.",
    status,
    summary:
      status === "OK"
        ? `${totalRequests} generations · ${formatLatency(worstP95)} p95`
        : status === "DEGRADED"
          ? synthetic.stale
            ? "Synthetic cosmic-recipe probe stale"
            : `Generation slow or partially failing`
          : status === "INCIDENT"
            ? synthetic.freshFailure
              ? "Synthetic cosmic-recipe probe failing"
              : `AI generation failing (${formatPct(errorRate)})`
            : "No AI-generation traffic in window",
    metrics: [
      { label: "Requests · 5m", value: `${totalRequests}`, raw: totalRequests },
      { label: "5xx · 5m", value: `${totalErrors}`, raw: totalErrors },
      { label: "p95", value: formatLatency(worstP95), raw: worstP95 },
      {
        label: "Synthetic",
        value: synthetic.metricValue,
        raw: synthetic.metricRaw,
      },
    ],
    issues: issues.slice(0, 3),
    checkedAt,
    live: true,
  };
}

async function probeTokenEconomy(): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  const economy = summarizePath("/api/economy", FIVE_MIN);

  let live = true;
  let txns24h = 0;
  let inCirculation = 0;
  try {
    const [txnRes, circRes] = await Promise.all([
      executeQuery<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM token_transactions WHERE created_at > NOW() - INTERVAL '24 hours'`,
      ),
      executeQuery<{ total: number }>(
        `SELECT COALESCE(SUM(spirit + essence + matter + substance), 0)::float8 AS total FROM token_balances`,
      ),
    ]);
    txns24h = txnRes.rows[0]?.count ?? 0;
    inCirculation = Number(circRes.rows[0]?.total ?? 0);
  } catch (err) {
    _logger.warn("[systemStatus] token economy query failed:", err);
    live = false;
  }

  // Daily yield cron liveness. `txns24h` above cannot see this: agents_yield
  // has a second, ad-hoc writer that lands 8-20 times a day, so the ledger
  // never looks stale even when the cron is completely dead. Only the BATCH
  // shape distinguishes them — see cronLedgerHealth.
  const yieldSignals = await fetchCronLedgerSignals();
  const yieldHealth = classifyCronLedgerPath(yieldSignals);

  const pathStatus = statusFromPathHealth(economy, {
    warnErrorRate: 0.1,
    warnP95Ms: 1000,
    failErrorRate: 0.5,
  });

  let status: FlowStatus;
  if (!live && pathStatus === "UNKNOWN") status = "UNKNOWN";
  else if (pathStatus === "INCIDENT" || yieldHealth.verdict === "INCIDENT") status = "INCIDENT";
  else if (pathStatus === "DEGRADED") status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  const econIssue = issueFromFailure(economy, "economy");
  if (econIssue) issues.push(econIssue);
  if (yieldHealth.verdict === "INCIDENT") {
    issues.push({ at: checkedAt, message: yieldHealth.summary, severity: "error" });
  }

  return {
    id: "economy",
    label: "Token Economy",
    description:
      "Spirit/Essence/Matter/Substance ledger — mints, burns, daily claims.",
    status,
    summary:
      status === "OK"
        ? `${txns24h} transactions · ${inCirculation.toLocaleString(undefined, { maximumFractionDigits: 0 })} in circulation`
        : status === "DEGRADED"
          ? `Economy endpoints slow or partially failing`
          : status === "INCIDENT"
            ? // Name the yield cron when it is the cause. Reporting an
              // /api/economy error rate during a dead-cron incident points the
              // reader at a healthy endpoint.
              yieldHealth.verdict === "INCIDENT" && pathStatus !== "INCIDENT"
              ? yieldHealth.summary
              : // Report the rate the VERDICT was made on, and the sample it
                // came from. The old message printed `errorRate` (4xx + 5xx)
                // beside a verdict, which is how "/api/economy failing
                // (100.0%)" got sent for two requests that both returned a
                // correct 402.
                `/api/economy server errors: ${formatPct(economy.serverErrorRate)} of ${economy.count} req`
            : "Awaiting signals",
    metrics: [
      { label: "Txns · 24h", value: `${txns24h}`, raw: txns24h },
      {
        label: "Yield batch · 24h",
        // An em dash rather than a fabricated 0 when there is no source.
        value: yieldSignals.live ? `${yieldSignals.biggestBatch24h}` : "—",
        raw: yieldSignals.live ? yieldSignals.biggestBatch24h : 0,
      },
      {
        label: "In circulation",
        value: inCirculation.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        raw: inCirculation,
      },
      { label: "p95", value: formatLatency(economy.p95LatencyMs), raw: economy.p95LatencyMs },
      {
        label: "Server errors",
        value: economy.observed ? formatPct(economy.serverErrorRate) : "—",
        raw: economy.serverErrorRate,
      },
      {
        // `[MEASURED 2026-08-14]` this sits near 70% in steady state and that is
        // healthy: it is `402 insufficient_funds` on sync-debit, i.e. how often
        // an agent tried to spend ESMS it does not hold. Shown separately from
        // "Server errors" so a reader is never asked to infer which kind of
        // non-2xx they are looking at — the previous single "Success rate: 30%"
        // read as an outage.
        label: "Refused · 4xx",
        value: economy.observed
          ? formatPct(economy.count > 0 ? economy.errors4xx / economy.count : 0)
          : "—",
        raw: economy.count > 0 ? economy.errors4xx / economy.count : 0,
      },
    ],
    issues,
    checkedAt,
    live,
  };
}

async function probePayments(latest: LatestProbeRow[]): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  // /api/stripe/checkout and /api/stripe/portal were deleted with the premium
  // tier. A summary over a route that no longer exists reports a permanent
  // zero, which reads as "no errors" rather than "no route" — so they are not
  // monitored here. The webhook is the surviving Stripe surface.
  const webhook = summarizePath("/api/stripe/webhook", ONE_HOUR);
  const combined = [webhook];

  let mrr = 0;
  let paidSubs = 0;
  let provisionedSubs = 0;
  let live = true;
  try {
    // Only Stripe-backed subs are revenue; provisioned/agent accounts are not.
    ({ paidSubs, provisionedSubs, mrr } =
      await getSubscriptionRevenueBreakdown());
  } catch (err) {
    _logger.warn("[systemStatus] subscriptions query failed:", err);
    live = false;
  }

  const errors5xx = combined.reduce((sum, h) => sum + h.errors5xx, 0);
  const totalRequests = combined.reduce((sum, h) => sum + h.count, 0);
  const errorRate = totalRequests > 0 ? errors5xx / totalRequests : 0;
  const observed = combined.some((h) => h.observed);

  const synthetic = evaluateSyntheticProbe(
    "stripe-webhook",
    latest,
    STALE_15MIN,
  );

  // Is Stripe actually SENDING the events we handle? Every other signal here
  // measures requests that arrived. An event the Dashboard is not subscribed to
  // produces no request, no error and no log line — the handler simply never
  // runs, which is indistinguishable from "nothing happened". That is precisely
  // how paid crypto restaurant orders sat in `payment_pending`.
  //
  // Endpoint config changes rarely, so the DERIVED coverage summary (never a
  // secret) is cached ~15 min instead of hitting stripe.webhookEndpoints.list
  // on every dashboard poll. A live:false result is deliberately NOT cached —
  // pinning "Stripe unreachable" for the full TTL would outlive the outage.
  const coverageCacheKey = "system:stripe-webhook-coverage";
  let coverage = await redisGet<StripeWebhookCoverage>(coverageCacheKey);
  if (!coverage) {
    const { fetchStripeWebhookCoverage } = await import(
      "@/services/stripeWebhookCoverageService"
    );
    coverage = await fetchStripeWebhookCoverage();
    if (coverage.live) await redisSet(coverageCacheKey, coverage, 900);
  }

  let status: FlowStatus;
  if (!live && !observed && synthetic.missing) status = "UNKNOWN";
  else if (
    errorRate >= 0.3 ||
    synthetic.freshFailure ||
    coverage.status === "incident"
  )
    status = "INCIDENT";
  else if (errorRate >= 0.05) status = "DEGRADED";
  else if (
    webhook.errors5xx > 0 ||
    synthetic.stale ||
    coverage.status === "degraded"
  )
    status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  if (synthetic.issue) issues.push(synthetic.issue);
  if (coverage.status === "incident" || coverage.status === "degraded") {
    issues.push({
      at: checkedAt,
      // Names the Dashboard as the thing to change — a missing subscription is
      // not fixed by touching this codebase.
      message: `${coverage.summary}. Enable it on the Stripe Dashboard webhook endpoint.`,
      severity: coverage.status === "incident" ? "error" : "warn",
    });
  }
  if (webhook.errors5xx > 0 && webhook.lastFailure) {
    issues.push({
      at: webhook.lastFailure.at,
      message: `Stripe webhook returned ${webhook.lastFailure.status} — subscription sync may have drifted`,
      severity: "error",
    });
  }
  for (const probe of combined) {
    const issue = issueFromFailure(probe, "stripe");
    if (issue && !issues.some((i) => i.at === issue.at)) issues.push(issue);
  }

  return {
    id: "payments",
    label: "Payments · Stripe",
    description: "Webhook ingestion and event coverage.",
    status,
    summary:
      status === "OK"
        ? `${paidSubs} paid · MRR $${mrr.toLocaleString()}${provisionedSubs > 0 ? ` · ${provisionedSubs} provisioned` : ""}`
        : status === "DEGRADED"
          ? synthetic.stale
            ? "Synthetic stripe-webhook probe stale"
            : `Webhook errors detected`
          : status === "INCIDENT"
            ? coverage.status === "incident"
              ? coverage.summary
              : synthetic.freshFailure
                ? "Synthetic stripe-webhook probe failing"
                : `Stripe endpoints failing (${formatPct(errorRate)})`
            : "No payment traffic in window",
    metrics: [
      { label: "Paid subs", value: `${paidSubs}`, raw: paidSubs },
      { label: "MRR", value: `$${mrr.toLocaleString()}`, raw: mrr },
      {
        label: "Provisioned",
        value: `${provisionedSubs}`,
        raw: provisionedSubs,
      },
      {
        label: "Webhook 5xx · 1h",
        value: `${webhook.errors5xx}`,
        raw: webhook.errors5xx,
      },
      {
        label: "Synthetic",
        value: synthetic.metricValue,
        raw: synthetic.metricRaw,
      },
      {
        label: "Webhook events",
        value: coverage.live
          ? coverage.missingEvents.length === 0
            ? "all covered"
            : `${coverage.missingEvents.length} missing`
          : "no source",
        raw: coverage.missingEvents.length,
      },
    ],
    issues: issues.slice(0, 3),
    checkedAt,
    // An unreachable Stripe must not read as "verified"; fold it into liveness
    // rather than letting a silent failure look like a clean board.
    live: live && coverage.live,
  };
}

async function probeAgents(): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  const feedPath = summarizePath("/api/feed", FIVE_MIN);

  let live = true;
  let agentCount = 0;
  let agentEvents24h = 0;
  let dbLastEmitAgeMs: number | null = null;
  try {
    const result = await executeQuery<{
      agents: number;
      events_24h: number;
      last_agent_event_age_ms: number | null;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE u.is_agent = true)::int AS agents,
         (
           SELECT COUNT(*)::int
           FROM feed_events f
           JOIN users u2 ON f.actor_id = u2.id
           WHERE u2.is_agent = true
             AND f.created_at > NOW() - INTERVAL '24 hours'
         ) AS events_24h,
         (
           -- ORDER BY + LIMIT 1 walks idx_feed_events_created newest-first and
           -- stops at the first agent row; MAX() over the join could not use
           -- the index through the is_agent predicate.
           SELECT (EXTRACT(EPOCH FROM (NOW() - f.created_at)) * 1000)::float8
           FROM feed_events f
           JOIN users u2 ON f.actor_id = u2.id
           WHERE u2.is_agent = true
           ORDER BY f.created_at DESC
           LIMIT 1
         ) AS last_agent_event_age_ms
       FROM users u`,
    );
    agentCount = result.rows[0]?.agents ?? 0;
    agentEvents24h = result.rows[0]?.events_24h ?? 0;
    const rawAge = result.rows[0]?.last_agent_event_age_ms;
    dbLastEmitAgeMs = rawAge === null || rawAge === undefined ? null : Number(rawAge);
  } catch (err) {
    _logger.warn("[systemStatus] agent network query failed:", err);
    live = false;
  }

  // Is the debit path actually landing writes? Feed ingest can look perfectly
  // healthy while sync-debit 500s on every call — that is exactly how the
  // agents_operation ledger stayed empty for twelve weeks. See
  // agentDebitPathHealth for why traffic-AND-no-writes is the only signal that
  // separates "broken" from "nobody called". agentCreditPathHealth is the same
  // conjunction pointed at the PA→WTEN sync-credit bridge.
  const [debitSignals, creditSignals] = await Promise.all([
    fetchDebitPathSignals(),
    fetchCreditPathSignals(),
  ]);
  const debitHealth = classifyDebitPath(debitSignals);
  const creditHealth = classifyCreditPath(creditSignals);

  // Last-emit is derived from feed_events (durable) rather than the per-process
  // feedEmitTracker, which resets on every serverless cold start and made this
  // signal read "never" on fresh instances. The in-memory value may only
  // SUPPLEMENT the DB one — fresher within the same instance (write-behind lag),
  // never a substitute for it.
  const memoryLastEmit = feedEmitTracker.getLastEmit();
  const memoryLastEmitAgeMs = memoryLastEmit
    ? Date.now() - new Date(memoryLastEmit.timestamp).getTime()
    : null;
  const lastEmitAgeMs =
    dbLastEmitAgeMs !== null && memoryLastEmitAgeMs !== null
      ? Math.min(dbLastEmitAgeMs, memoryLastEmitAgeMs)
      : (dbLastEmitAgeMs ?? memoryLastEmitAgeMs);
  const stale = lastEmitAgeMs !== null && lastEmitAgeMs > 6 * ONE_HOUR;
  const feedPathStatus = statusFromPathHealth(feedPath, {
    warnErrorRate: 0.1,
    warnP95Ms: 2000,
    failErrorRate: 0.5,
  });

  let status: FlowStatus;
  if (!live && feedPathStatus === "UNKNOWN") status = "UNKNOWN";
  // A dead debit or credit path is a revenue outage, not a warning — rank it
  // with the other INCIDENT conditions rather than letting a green feed mask it.
  else if (
    feedPathStatus === "INCIDENT" ||
    debitHealth.verdict === "INCIDENT" ||
    creditHealth.verdict === "INCIDENT"
  )
    status = "INCIDENT";
  else if (
    feedPathStatus === "DEGRADED" ||
    stale ||
    creditHealth.verdict === "STALLED"
  )
    status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  if (debitHealth.verdict === "INCIDENT") {
    issues.push({
      at: new Date().toISOString(),
      message: debitHealth.summary,
      severity: "error",
    });
  }
  if (creditHealth.verdict === "INCIDENT" || creditHealth.verdict === "STALLED") {
    issues.push({
      at: new Date().toISOString(),
      message: creditHealth.summary,
      severity: creditHealth.verdict === "INCIDENT" ? "error" : "warn",
    });
  }
  if (stale && lastEmitAgeMs !== null) {
    issues.push({
      at: new Date(Date.now() - lastEmitAgeMs).toISOString(),
      message: `No PA feed emit in ${Math.round(lastEmitAgeMs / ONE_HOUR)}h — webhook silent`,
      severity: "warn",
    });
  }
  const feedIssue = issueFromFailure(feedPath, "feed-ingest");
  if (feedIssue) issues.push(feedIssue);

  return {
    id: "agents",
    label: "Planetary Agents",
    description:
      "Agent feed ingestion (POST /api/feed), agent sync, network telemetry.",
    status,
    summary:
      status === "OK"
        ? `${agentCount} agents · ${agentEvents24h} events 24h`
        : status === "DEGRADED"
          ? stale
            ? "Webhook silent — PA may have stopped emitting"
            : creditHealth.verdict === "STALLED"
              ? creditHealth.summary
              : "Feed-ingest errors detected"
          : status === "INCIDENT"
            ? debitHealth.verdict === "INCIDENT"
              ? debitHealth.summary
              : creditHealth.verdict === "INCIDENT"
                ? creditHealth.summary
                : // serverErrorRate, to match the rate the verdict was made on.
                  `Feed ingest server errors: ${formatPct(feedPath.serverErrorRate)} of ${feedPath.count} req`
            : "Awaiting signals",
    metrics: [
      { label: "Agents", value: `${agentCount}`, raw: agentCount },
      { label: "Events · 24h", value: `${agentEvents24h}`, raw: agentEvents24h },
      {
        label: "Last emit",
        value: lastEmitAgeMs !== null ? `${formatLatency(lastEmitAgeMs)} ago` : "never",
        raw: lastEmitAgeMs ?? 0,
      },
      {
        label: "Feed p95",
        value: formatLatency(feedPath.p95LatencyMs),
        raw: feedPath.p95LatencyMs,
      },
      {
        label: "Debits · 24h",
        value: debitSignals.live ? `${debitSignals.debits24h}` : "no source",
        raw: debitSignals.debits24h,
      },
      {
        label: "Credits · 24h",
        value: creditSignals.live ? `${creditSignals.credits24h}` : "no source",
        raw: creditSignals.credits24h,
      },
    ],
    issues: issues.slice(0, 3),
    checkedAt,
    live,
  };
}

async function probeMcp(latest: LatestProbeRow[]): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  const synthetic = evaluateSyntheticProbe("mcp", latest, STALE_30MIN);

  // Pull a small 1h activity snapshot from mcp_invocations. Degrades
  // independently to `live: false` so the panel never hard-fails when
  // the table is missing.
  let live = true;
  let calls1h = 0;
  let failures1h = 0;
  let p95Ms = 0;
  let _distinctCallers = 0;
  try {
    const result = await executeQuery<{
      calls: number;
      failures: number;
      p95: number;
      callers: number;
    }>(
      `SELECT
         COUNT(*)::int AS calls,
         COUNT(*) FILTER (WHERE success = false)::int AS failures,
         COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::float8 AS p95,
         COUNT(DISTINCT caller)::int AS callers
       FROM mcp_invocations
       WHERE called_at > NOW() - INTERVAL '1 hour'`,
    );
    calls1h = result.rows[0]?.calls ?? 0;
    failures1h = result.rows[0]?.failures ?? 0;
    p95Ms = Number(result.rows[0]?.p95 ?? 0);
    _distinctCallers = result.rows[0]?.callers ?? 0;
  } catch (err) {
    _logger.warn("[systemStatus] mcp invocations query failed:", err);
    live = false;
  }

  const errorRate = calls1h > 0 ? failures1h / calls1h : 0;

  let wtenStatus: FlowStatus;
  if (!live && synthetic.missing) wtenStatus = "UNKNOWN";
  else if (synthetic.freshFailure || errorRate >= 0.5) wtenStatus = "INCIDENT";
  else if (synthetic.stale || errorRate >= 0.1 || p95Ms >= 5000)
    wtenStatus = "DEGRADED";
  else wtenStatus = "OK";

  // Probe Planetary Agents (PA) MCP status
  const paStatus = await getMcpNetworkSummary().catch(() => null);
  const paVerdict = paStatus?.live ? paStatus.verdict : "UNKNOWN";

  // Combine verdicts to represent the worst of both servers. PA telemetry
  // being UNKNOWN (network summary unavailable) is an observability gap, not a
  // tool-surface degradation — and worst() maps any UNKNOWN to DEGRADED, which
  // was flapping this flow into a false DEGRADED (mislabelled "WTEN latency
  // elevated") whenever PA telemetry was down. Only fold PA into the verdict
  // when we actually have a live status for it.
  const combinedVerdict =
    paVerdict === "UNKNOWN" ? wtenStatus : worst([wtenStatus, paVerdict]);

  const issues: FlowIssue[] = [];
  if (synthetic.issue) issues.push(synthetic.issue);
  if (errorRate >= 0.1 && calls1h >= 5) {
    issues.push({
      at: checkedAt,
      message: `${failures1h}/${calls1h} WTEN MCP tool calls failed in 1h (${formatPct(errorRate)})`,
      severity: errorRate >= 0.5 ? "error" : "warn",
    });
  }

  if (paVerdict === "DEGRADED" || paVerdict === "INCIDENT") {
    issues.push({
      at: checkedAt,
      message: `Planetary Agents MCP status is ${paVerdict}${
        paStatus?.syntheticProbe.consecutiveFailures
          ? ` (${paStatus.syntheticProbe.consecutiveFailures} consecutive probe failures)`
          : ""
      }`,
      severity: paVerdict === "INCIDENT" ? "error" : "warn",
    });
  }

  return {
    id: "mcp",
    label: "MCP Tool Surface",
    description:
      "WTEN and Planetary Agents MCP server tool layers exposed to LLM clients.",
    status: combinedVerdict,
    summary:
      combinedVerdict === "OK"
        ? paVerdict === "UNKNOWN"
          ? calls1h > 0
            ? `${calls1h} WTEN tool calls · WTEN healthy · PA telemetry unavailable`
            : "Idle — WTEN MCP healthy · PA telemetry unavailable"
          : calls1h > 0
            ? `${calls1h} WTEN tool calls · WTEN & PA healthy`
            : "Idle — WTEN & PA MCP healthy"
        : combinedVerdict === "DEGRADED"
          ? paVerdict === "DEGRADED"
            ? `PA MCP degraded · p95 ${formatLatency(paStatus?.totals.p95LatencyMs ?? 0)}`
            : synthetic.stale
              ? "Synthetic WTEN MCP probe stale — cron may have stopped"
              : errorRate >= 0.1
                ? `${formatPct(errorRate)} of WTEN MCP calls failing in 1h`
                : `WTEN MCP tool latency elevated (p95 ${formatLatency(p95Ms)})`
          : combinedVerdict === "INCIDENT"
            ? paVerdict === "INCIDENT"
              ? "PA MCP has an active INCIDENT"
              : synthetic.freshFailure
                ? "Synthetic WTEN MCP probe failing — tool layer broken"
                : `WTEN MCP tool failure rate ${formatPct(errorRate)} in 1h`
            : "No MCP signals or PA telemetry unreachable",
    metrics: [
      { label: "WTEN Calls · 1h", value: `${calls1h}`, raw: calls1h },
      { label: "WTEN p95", value: formatLatency(p95Ms), raw: p95Ms },
      { label: "PA MCP", value: paVerdict },
      {
        label: "PA Calls · 1h",
        value: paStatus?.totals.calls !== undefined ? `${paStatus.totals.calls}` : "—",
        raw: paStatus?.totals.calls ?? 0,
      },
    ],
    issues: issues.slice(0, 3),
    checkedAt,
    // The verdict tracks WTEN's live signal; PA telemetry being unavailable is
    // surfaced in the summary/metric, not by marking the whole flow non-live
    // (which previously paired an OK verdict with a misleading "stale" hint).
    live,
  };
}

async function probeDatabase(): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  let healthy = false;
  let latency: number | null = null;
  let dbError: string | null = null;
  try {
    const health = await checkDatabaseHealth();
    ({ healthy } = health);
    latency = health.latency ?? null;
    dbError = health.error ?? null;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "unknown";
  }

  const slowQueries = summarizeSlowQueries(FIVE_MIN);

  // Connection-pool saturation. Since the PgBouncer flip the old ceiling
  // (max_connections = 100) is permanently healthy — backends are capped at 20
  // by default_pool_size — while the real wall is the pooler's max_client_conn.
  // See poolerSaturationHealth for why only the admin console can see it.
  const poolerSignals = await fetchPoolerSaturationSignals();
  const pooler = classifyPoolerSaturation(poolerSignals);

  let status: FlowStatus;
  if (!healthy) status = "INCIDENT";
  else if (pooler.verdict === "INCIDENT") status = "INCIDENT";
  else if ((latency ?? 0) > 200 || slowQueries.count >= 20) status = "DEGRADED";
  else if (slowQueries.count >= 5) status = "DEGRADED";
  else if (pooler.verdict === "DEGRADED") status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  if (!healthy && dbError) {
    issues.push({
      at: checkedAt,
      message: `Database unreachable: ${dbError}`,
      severity: "error",
    });
  }
  if (pooler.verdict === "INCIDENT" || pooler.verdict === "DEGRADED") {
    issues.push({
      at: checkedAt,
      message: `Connection pool: ${pooler.summary}`,
      severity: pooler.verdict === "INCIDENT" ? "error" : "warn",
    });
  }
  if (slowQueries.count >= 5) {
    issues.push({
      at: checkedAt,
      message: `${slowQueries.count} slow queries (>${slowQueries.thresholdMs}ms) in last 5m · slowest ${slowQueries.slowestMs}ms`,
      severity: slowQueries.count >= 20 ? "error" : "warn",
    });
  }

  return {
    id: "database",
    label: "Database",
    description:
      "Postgres pool health, query latency, slow query ring (>200ms).",
    status,
    summary:
      status === "OK"
        ? `Healthy · ${formatLatency(latency ?? 0)} ping · ${slowQueries.count} slow queries 5m`
        : // Name the pooler when it is the cause. Reporting "N slow queries"
          // during a connection-pool incident points the reader at the wrong
          // layer — queries are not slow, they are waiting to start.
          status === "INCIDENT" && healthy && pooler.verdict === "INCIDENT"
          ? pooler.summary
          : status === "DEGRADED"
            ? pooler.verdict === "DEGRADED" && slowQueries.count < 5
              ? pooler.summary
              : `${slowQueries.count} slow queries in 5m`
            : "Database unreachable",
    metrics: [
      {
        label: "Health ping",
        value: formatLatency(latency ?? 0),
        raw: latency ?? 0,
      },
      {
        label: "Pooler clients",
        // An honest dash beats a fabricated 0/0 when the admin console is
        // unreachable — the panel must never imply it measured something.
        value: poolerSignals.live
          ? `${poolerSignals.clientsActive + poolerSignals.clientsWaiting}/${poolerSignals.maxClientConn}`
          : "—",
        raw: poolerSignals.live ? poolerSignals.clientsActive + poolerSignals.clientsWaiting : 0,
      },
      {
        label: "Pooler servers",
        value: poolerSignals.live
          ? `${poolerSignals.serversActive}/${poolerSignals.poolSize}`
          : "—",
        raw: poolerSignals.live ? poolerSignals.serversActive : 0,
      },
      {
        label: "Slow queries · 5m",
        value: `${slowQueries.count}`,
        raw: slowQueries.count,
      },
      {
        label: "Slowest · 5m",
        value: formatLatency(slowQueries.slowestMs),
        raw: slowQueries.slowestMs,
      },
      {
        label: "Threshold",
        value: `${slowQueries.thresholdMs}ms`,
        raw: slowQueries.thresholdMs,
      },
    ],
    issues,
    checkedAt,
    live: true,
  };
}

// ─── External dependency probes ──────────────────────────────────────

// Safe (non-throwing) resolver: this is a monitoring probe and must degrade
// independently — a missing env should not crash the status panel.
const PA_BASE_URL = getServiceUrlSafe("planetaryAgentsApi");

async function probePADependency(): Promise<DependencyHealth> {
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (process.env.INTERNAL_API_SECRET) {
      headers.Authorization = `Bearer ${process.env.INTERNAL_API_SECRET}`;
    }
    const res = await fetch(`${PA_BASE_URL}/health`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);
    const latencyMs = Date.now() - startedAt;
    if (res.ok) {
      return {
        id: "planetary-agents",
        label: "Planetary Agents",
        status: latencyMs > 1500 ? "DEGRADED" : "OK",
        summary: `Healthy · ${formatLatency(latencyMs)}`,
        latencyMs,
        checkedAt,
      };
    }
    return {
      id: "planetary-agents",
      label: "Planetary Agents",
      status: "DEGRADED",
      summary: `HTTP ${res.status} from /health`,
      latencyMs,
      checkedAt,
    };
  } catch (err) {
    return {
      id: "planetary-agents",
      label: "Planetary Agents",
      status: "INCIDENT",
      summary: err instanceof Error ? err.message : "unreachable",
      latencyMs: null,
      checkedAt,
    };
  }
}

async function probeStripeDependency(): Promise<DependencyHealth> {
  // Stripe doesn't get a synthetic ping (rate-limited, costs API budget).
  // Use webhook freshness as a proxy: when did Stripe last reach us?
  //
  // Read the DURABLE table, not the ring: the ring holds 500 entries spanning
  // ~3h in production and is private to one serverless isolate, so a 24h
  // question asked of it is unanswerable by construction.
  const webhookHealth = await summarizePathDurable("/api/stripe/webhook", ONE_DAY);
  const checkedAt = new Date().toISOString();
  if (!webhookHealth.observed) {
    return {
      id: "stripe",
      label: "Stripe",
      status: "UNKNOWN",
      summary: "No webhook traffic in 24h",
      latencyMs: null,
      checkedAt,
    };
  }
  const errors = webhookHealth.errors5xx;
  return {
    id: "stripe",
    label: "Stripe",
    status: errors === 0 ? "OK" : errors >= 3 ? "INCIDENT" : "DEGRADED",
    summary:
      errors === 0
        ? `${webhookHealth.count} webhook events · 0 errors`
        : `${errors} webhook 5xx in 24h`,
    latencyMs: webhookHealth.p95LatencyMs,
    checkedAt,
  };
}

/**
 * The dead-man's-switch for every scheduled job.
 *
 * `getCronHeartbeats()` has always computed staleness, but nothing read it
 * except the admin dashboard — so a dead cron was visible only to whoever
 * happened to open a panel. `daily-digest` missed five days in fifteen and no
 * one found out (docs/runbooks/daily-digest-cron.md).
 *
 * Surfacing it as a dependency is what arms it: this payload is diffed hourly
 * by `/api/cron/system-health-snapshot`, and `dispatchTransitions` pushes any
 * status change to Slack and email. Detection therefore lives on a DIFFERENT
 * schedule from the job it watches — which is what makes it a watchdog and not
 * just another thing that can fail quietly with it.
 *
 * Severity is deliberately capped at DEGRADED. A late cron is a real problem
 * but it is not a user-facing outage, and this feeds the same banner that
 * reports payments being down; INCIDENT here would cry wolf.
 *
 * `never` maps to UNKNOWN rather than DEGRADED: a job with no rows may simply
 * predate heartbeats or have just been registered. `worst()` still rolls
 * UNKNOWN up to DEGRADED, so a job that never once fires does surface — it
 * just does not claim to be a known failure.
 *
 * Exported for unit tests; production callers go through `getSystemStatus`.
 */
export async function probeScheduledJobsDependency(): Promise<DependencyHealth> {
  const checkedAt = new Date().toISOString();
  const { entries, live } = await getCronHeartbeats();

  if (!live) {
    return {
      id: "scheduled-jobs",
      label: "Scheduled jobs",
      status: "UNKNOWN",
      summary: "heartbeat table unreadable",
      latencyMs: null,
      checkedAt,
    };
  }

  const failing = entries.filter((e) => e.state === "failing");
  const late = entries.filter((e) => e.state === "late");
  const never = entries.filter((e) => e.state === "never");

  const name = (list: typeof entries) => list.map((e) => e.name).join(", ");

  if (failing.length > 0 || late.length > 0) {
    const parts: string[] = [];
    if (late.length > 0) parts.push(`late: ${name(late)}`);
    if (failing.length > 0) parts.push(`failing: ${name(failing)}`);
    return {
      id: "scheduled-jobs",
      label: "Scheduled jobs",
      status: "DEGRADED",
      summary: parts.join(" · "),
      latencyMs: null,
      checkedAt,
    };
  }

  if (never.length > 0) {
    return {
      id: "scheduled-jobs",
      label: "Scheduled jobs",
      status: "UNKNOWN",
      summary: `no run ever recorded: ${name(never)}`,
      latencyMs: null,
      checkedAt,
    };
  }

  return {
    id: "scheduled-jobs",
    label: "Scheduled jobs",
    status: "OK",
    summary: `${entries.length} jobs on schedule`,
    latencyMs: null,
    checkedAt,
  };
}

async function probeGoogleOAuthDependency(): Promise<DependencyHealth> {
  // OAuth liveness inferred from /api/auth traffic + auth_events signin_complete.
  // No synthetic probe — Google's OAuth pages aren't pingable from server.
  //
  // Two things had to be true for this to ever report anything. The catch-all
  // now records the URL it served rather than the filesystem route name (see
  // `authRouteName.ts`), and the 24h lookup goes to the durable table — the
  // in-memory ring spans ~3h and belongs to a different isolate than the one
  // that serves the callback.
  const checkedAt = new Date().toISOString();
  const authPath = await summarizePathDurable("/api/auth/callback/google", ONE_DAY);
  if (!authPath.observed) {
    return {
      id: "google-oauth",
      label: "Google OAuth",
      status: "UNKNOWN",
      summary: "No OAuth callback traffic in 24h",
      latencyMs: null,
      checkedAt,
    };
  }
  return {
    id: "google-oauth",
    label: "Google OAuth",
    status: authPath.errors5xx > 0 ? "DEGRADED" : "OK",
    summary: `${authPath.count} callbacks · ${authPath.errors5xx} 5xx`,
    latencyMs: authPath.p95LatencyMs,
    checkedAt,
  };
}

// ─── Public entry point ──────────────────────────────────────────────

/**
 * Resolve the full system status payload for the admin operator dashboard.
 * Never rejects — each flow degrades independently to UNKNOWN.
 */
export async function getSystemStatus(): Promise<SystemStatusPayload> {
  // Pull latest synthetic-probe results ONCE — each flow probe that
  // consumes synthetic data reads from this snapshot to avoid 5+
  // redundant DB queries per dashboard refresh.
  const latestProbes = await getLatestProbeResults().catch(() => []);

  const [
    auth,
    onboarding,
    recommendations,
    aiGeneration,
    economy,
    payments,
    agents,
    mcp,
    database,
    paDep,
  ] = await Promise.all([
    probeAuth(latestProbes).catch(unknownFlow("auth", "Authentication")),
    probeOnboarding(latestProbes).catch(
      unknownFlow("onboarding", "New-User Onboarding"),
    ),
    probeRecommendations(latestProbes).catch(
      unknownFlow("recommendations", "Recipe Recommendations"),
    ),
    probeAIGeneration(latestProbes).catch(
      unknownFlow("ai-generation", "AI Recipe Generation"),
    ),
    probeTokenEconomy().catch(unknownFlow("economy", "Token Economy")),
    probePayments(latestProbes).catch(
      unknownFlow("payments", "Payments · Stripe"),
    ),
    probeAgents().catch(unknownFlow("agents", "Planetary Agents")),
    probeMcp(latestProbes).catch(unknownFlow("mcp", "MCP Tool Surface")),
    probeDatabase().catch(unknownFlow("database", "Database")),
    probePADependency().catch(
      (): DependencyHealth => ({
        id: "planetary-agents",
        label: "Planetary Agents",
        status: "UNKNOWN",
        summary: "probe failed",
        latencyMs: null,
        checkedAt: new Date().toISOString(),
      }),
    ),
  ]);

  const flows: FlowHealth[] = [
    auth,
    onboarding,
    recommendations,
    aiGeneration,
    economy,
    payments,
    agents,
    mcp,
    database,
  ];

  const dependencies: DependencyHealth[] = [
    paDep,
    // Both read the durable request log, so both are async and both must be
    // awaited HERE — an un-awaited Promise in this array makes `d.status`
    // undefined below, and `rollUpOverall` reads undefined as OK.
    await probeStripeDependency().catch((err): DependencyHealth => {
      _logger.error("[systemStatus] stripe dependency probe threw:", err);
      return {
        id: "stripe",
        label: "Stripe",
        status: "UNKNOWN",
        summary: "request log unavailable",
        latencyMs: null,
        checkedAt: new Date().toISOString(),
      };
    }),
    await probeGoogleOAuthDependency().catch((err): DependencyHealth => {
      _logger.error("[systemStatus] google-oauth dependency probe threw:", err);
      return {
        id: "google-oauth",
        label: "Google OAuth",
        status: "UNKNOWN",
        summary: "request log unavailable",
        latencyMs: null,
        checkedAt: new Date().toISOString(),
      };
    }),
    // Never let a heartbeat read break the whole status payload: the watchdog
    // going quiet must not take the thing it watches down with it.
    await probeScheduledJobsDependency().catch((err): DependencyHealth => {
      _logger.error("[systemStatus] scheduled-jobs probe threw:", err);
      return {
        id: "scheduled-jobs",
        label: "Scheduled jobs",
        status: "UNKNOWN",
        summary: "probe failed",
        latencyMs: null,
        checkedAt: new Date().toISOString(),
      };
    }),
  ];

  const overall = rollUpOverall(
    flows.map((f) => f.status),
    dependencies.map((d) => d.status),
  );

  return {
    generatedAt: new Date().toISOString(),
    overall,
    flows,
    dependencies,
  };
}

/** Build an UNKNOWN-fallback flow result when a probe throws. */
function unknownFlow(id: string, label: string) {
  return (err: unknown): FlowHealth => {
    _logger.error(`[systemStatus] probe ${id} threw:`, err);
    return {
      id,
      label,
      description: "Probe unavailable.",
      status: "UNKNOWN",
      summary: "probe failed",
      metrics: [],
      issues: [
        {
          at: new Date().toISOString(),
          message: err instanceof Error ? err.message : String(err),
          severity: "error",
        },
      ],
      checkedAt: new Date().toISOString(),
      live: false,
    };
  };
}
