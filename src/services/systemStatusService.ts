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
  type PathHealth,
} from "@/lib/observability/requestLog";
import { summarizeSlowQueries } from "@/lib/observability/slowQueryLog";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import { getEventCounts } from "@/services/authEventsService";
import { feedEmitTracker } from "@/services/feedEmitTracker";
import { getMcpNetworkSummary } from "@/services/mcpNetworkService";
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
 */
export function statusFromPathHealth(
  health: PathHealth,
  thresholds: { warnErrorRate: number; warnP95Ms: number; failErrorRate: number },
): FlowStatus {
  if (!health.observed) return "UNKNOWN";
  if (health.errorRate >= thresholds.failErrorRate) return "INCIDENT";
  if (
    health.errorRate >= thresholds.warnErrorRate ||
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
  // /api/auth covers next-auth handler + session pings; very high traffic.
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
       LEFT JOIN user_profiles up ON up.user_id = u.id`,
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
              : `/api/onboarding is failing (${formatPct(onboardingHealth.errorRate)} error rate)`
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
  const aiGenerate = summarizePath("/api/recipes/generate", FIVE_MIN);
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
      "Cosmic-recipe generation via Planetary Agents backend, token-gated.",
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

  const pathStatus = statusFromPathHealth(economy, {
    warnErrorRate: 0.1,
    warnP95Ms: 1000,
    failErrorRate: 0.5,
  });

  let status: FlowStatus;
  if (!live && pathStatus === "UNKNOWN") status = "UNKNOWN";
  else if (pathStatus === "INCIDENT") status = "INCIDENT";
  else if (pathStatus === "DEGRADED") status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  const econIssue = issueFromFailure(economy, "economy");
  if (econIssue) issues.push(econIssue);

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
            ? `/api/economy failing (${formatPct(economy.errorRate)})`
            : "Awaiting signals",
    metrics: [
      { label: "Txns · 24h", value: `${txns24h}`, raw: txns24h },
      {
        label: "In circulation",
        value: inCirculation.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        raw: inCirculation,
      },
      { label: "p95", value: formatLatency(economy.p95LatencyMs), raw: economy.p95LatencyMs },
      {
        label: "Success rate",
        value: economy.observed ? formatPct(economy.successRate) : "—",
        raw: economy.successRate,
      },
    ],
    issues,
    checkedAt,
    live,
  };
}

async function probePayments(latest: LatestProbeRow[]): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  const checkout = summarizePath("/api/stripe/checkout", ONE_HOUR);
  const webhook = summarizePath("/api/stripe/webhook", ONE_HOUR);
  const portal = summarizePath("/api/stripe/portal", ONE_HOUR);
  const combined = [checkout, webhook, portal];

  let mrr = 0;
  let activeSubs = 0;
  let live = true;
  try {
    const result = await executeQuery<{ active: number }>(
      `SELECT COUNT(*)::int AS active FROM user_subscriptions WHERE status = 'active' AND tier = 'premium'`,
    );
    activeSubs = result.rows[0]?.active ?? 0;
    mrr = activeSubs * 24;
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

  let status: FlowStatus;
  if (!live && !observed && synthetic.missing) status = "UNKNOWN";
  else if (errorRate >= 0.3 || synthetic.freshFailure) status = "INCIDENT";
  else if (errorRate >= 0.05) status = "DEGRADED";
  else if (webhook.errors5xx > 0 || synthetic.stale) status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  if (synthetic.issue) issues.push(synthetic.issue);
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
    description: "Checkout, billing portal, webhook ingestion.",
    status,
    summary:
      status === "OK"
        ? `${activeSubs} active subs · MRR $${mrr.toLocaleString()}`
        : status === "DEGRADED"
          ? synthetic.stale
            ? "Synthetic stripe-webhook probe stale"
            : `Webhook or checkout errors detected`
          : status === "INCIDENT"
            ? synthetic.freshFailure
              ? "Synthetic stripe-webhook probe failing"
              : `Stripe endpoints failing (${formatPct(errorRate)})`
            : "No payment traffic in window",
    metrics: [
      { label: "Active subs", value: `${activeSubs}`, raw: activeSubs },
      { label: "MRR", value: `$${mrr.toLocaleString()}`, raw: mrr },
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
    ],
    issues: issues.slice(0, 3),
    checkedAt,
    live,
  };
}

async function probeAgents(): Promise<FlowHealth> {
  const checkedAt = new Date().toISOString();
  const feedPath = summarizePath("/api/feed", FIVE_MIN);
  const lastEmit = feedEmitTracker.getLastEmit();

  let live = true;
  let agentCount = 0;
  let agentEvents24h = 0;
  try {
    const result = await executeQuery<{
      agents: number;
      events_24h: number;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE u.is_agent = true)::int AS agents,
         (
           SELECT COUNT(*)::int
           FROM feed_events f
           JOIN users u2 ON f.actor_id = u2.id
           WHERE u2.is_agent = true
             AND f.created_at > NOW() - INTERVAL '24 hours'
         ) AS events_24h
       FROM users u`,
    );
    agentCount = result.rows[0]?.agents ?? 0;
    agentEvents24h = result.rows[0]?.events_24h ?? 0;
  } catch (err) {
    _logger.warn("[systemStatus] agent network query failed:", err);
    live = false;
  }

  const lastEmitAgeMs = lastEmit
    ? Date.now() - new Date(lastEmit.timestamp).getTime()
    : null;
  const stale = lastEmitAgeMs !== null && lastEmitAgeMs > 6 * ONE_HOUR;
  const feedPathStatus = statusFromPathHealth(feedPath, {
    warnErrorRate: 0.1,
    warnP95Ms: 2000,
    failErrorRate: 0.5,
  });

  let status: FlowStatus;
  if (!live && feedPathStatus === "UNKNOWN") status = "UNKNOWN";
  else if (feedPathStatus === "INCIDENT") status = "INCIDENT";
  else if (feedPathStatus === "DEGRADED" || stale) status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  if (stale && lastEmit) {
    issues.push({
      at: lastEmit.timestamp,
      message: `No PA feed emit in ${Math.round((lastEmitAgeMs ?? 0) / ONE_HOUR)}h — webhook silent`,
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
            : "Feed-ingest errors detected"
          : status === "INCIDENT"
            ? `Feed ingest failing (${formatPct(feedPath.errorRate)})`
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
    healthy = health.healthy;
    latency = health.latency ?? null;
    dbError = health.error ?? null;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "unknown";
  }

  const slowQueries = summarizeSlowQueries(FIVE_MIN);

  let status: FlowStatus;
  if (!healthy) status = "INCIDENT";
  else if ((latency ?? 0) > 200 || slowQueries.count >= 20) status = "DEGRADED";
  else if (slowQueries.count >= 5) status = "DEGRADED";
  else status = "OK";

  const issues: FlowIssue[] = [];
  if (!healthy && dbError) {
    issues.push({
      at: checkedAt,
      message: `Database unreachable: ${dbError}`,
      severity: "error",
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
        : status === "DEGRADED"
          ? `${slowQueries.count} slow queries in 5m`
          : "Database unreachable",
    metrics: [
      {
        label: "Health ping",
        value: formatLatency(latency ?? 0),
        raw: latency ?? 0,
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

function probeStripeDependency(): DependencyHealth {
  // Stripe doesn't get a synthetic ping (rate-limited, costs API budget).
  // Use webhook freshness as a proxy: when did Stripe last reach us?
  const webhookHealth = summarizePath("/api/stripe/webhook", ONE_DAY);
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

function probeGoogleOAuthDependency(): DependencyHealth {
  // OAuth liveness inferred from /api/auth traffic + auth_events signin_complete.
  // No synthetic probe — Google's OAuth pages aren't pingable from server.
  const checkedAt = new Date().toISOString();
  const authPath = summarizePath("/api/auth/callback/google", ONE_DAY);
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
    probeStripeDependency(),
    probeGoogleOAuthDependency(),
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
