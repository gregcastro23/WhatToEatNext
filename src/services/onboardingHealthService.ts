/**
 * Onboarding Health Service
 *
 * Operator-grade visibility into the new-user onboarding flow. This is the
 * critical "is sign-up actually working RIGHT NOW" panel for the admin
 * dashboard — designed so we can scale to a million users and still notice
 * if the funnel starts leaking.
 *
 * Funnel stages observed:
 *   - Signups (last 24h) — human users created
 *   - Birth data submitted — users with non-empty birth_data JSON
 *   - Natal chart computed — users with non-empty natal_chart JSON
 *   - Onboarding complete — onboarding_completed=true
 *   - Skipped onboarding — onboarding_completed=true AND birth_data empty
 *
 * Plus:
 *   - Stuck users (signed up > 1h ago, not completed)
 *   - Recent /api/onboarding traffic (success rate, p95, recent errors)
 *   - Most-recent completed onboardings (visibility of the happy path)
 *
 * All queries are bounded to recent windows; nothing iterates the whole
 * `users` table — safe at scale.
 *
 * @file src/services/onboardingHealthService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  summarizePath,
  type RequestLogEntry,
} from "@/lib/observability/requestLog";
import { getRecentRequests } from "@/lib/observability/requestLog";

export interface OnboardingFunnelStage {
  /** Stable id used for UI keying. */
  id: string;
  label: string;
  count: number;
  /** Drop-off from previous stage (0-1). 0 for the first stage. */
  dropOff: number;
}

export interface OnboardingStuckUser {
  userId: string;
  email: string;
  name: string | null;
  createdAt: string;
  /** How long since signup, rounded. */
  ageHours: number;
  /** What's missing: "no-birth-data", "no-natal-chart", "incomplete-flag". */
  missing: string;
}

export interface OnboardingRecentSuccess {
  userId: string;
  email: string;
  name: string | null;
  completedAt: string;
  /** True when the user provided birth data (full onboarding). */
  fullOnboarding: boolean;
  dominantElement: string | null;
}

export interface OnboardingApiHealth {
  observed: boolean;
  count: number;
  successRate: number;
  errors4xx: number;
  errors5xx: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  recentErrors: Array<{
    at: string;
    method: string;
    path: string;
    status: number;
    latencyMs: number;
  }>;
}

export interface OnboardingHealthPayload {
  generatedAt: string;
  /** Worst signal across funnel + api health. */
  overall: "OK" | "DEGRADED" | "INCIDENT" | "UNKNOWN";
  /** Human-readable headline for the panel. */
  headline: string;
  /** 24h funnel — counts at each stage. */
  funnel: OnboardingFunnelStage[];
  /** Users stuck mid-flow (sign-up > 1h, not completed). */
  stuckUsers: OnboardingStuckUser[];
  /** Most-recent completed onboardings. */
  recentSuccesses: OnboardingRecentSuccess[];
  /** Live API health for /api/onboarding endpoint family. */
  apiHealth: OnboardingApiHealth;
  /**
   * Skip rate over the 24h window: users who completed onboarding via
   * `skipNatal: true` vs full birth-data submission.
   */
  skipRate: number;
  /** True only when DB-backed queries succeeded. */
  live: boolean;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export interface FunnelRow {
  signups: number;
  birthDataSubmitted: number;
  natalChartComputed: number;
  onboarded: number;
  skipped: number;
}

async function readFunnel(): Promise<{ row: FunnelRow; live: boolean }> {
  try {
    const result = await executeQuery<{
      signups: number;
      birth_data_submitted: number;
      natal_chart_computed: number;
      onboarded: number;
      skipped: number;
    }>(
      `SELECT
         COUNT(*) FILTER (WHERE u.created_at > NOW() - INTERVAL '24 hours' AND COALESCE(u.is_agent, false) = false)::int AS signups,
         COUNT(*) FILTER (
           WHERE u.created_at > NOW() - INTERVAL '24 hours'
             AND COALESCE(u.is_agent, false) = false
             AND up.birth_data IS NOT NULL
             AND up.birth_data <> '{}'::jsonb
         )::int AS birth_data_submitted,
         COUNT(*) FILTER (
           WHERE u.created_at > NOW() - INTERVAL '24 hours'
             AND COALESCE(u.is_agent, false) = false
             AND up.natal_chart IS NOT NULL
             AND up.natal_chart <> '{}'::jsonb
         )::int AS natal_chart_computed,
         COUNT(*) FILTER (
           WHERE u.created_at > NOW() - INTERVAL '24 hours'
             AND COALESCE(u.is_agent, false) = false
             AND up.onboarding_completed = true
         )::int AS onboarded,
         COUNT(*) FILTER (
           WHERE u.created_at > NOW() - INTERVAL '24 hours'
             AND COALESCE(u.is_agent, false) = false
             AND up.onboarding_completed = true
             AND (up.birth_data IS NULL OR up.birth_data = '{}'::jsonb)
         )::int AS skipped
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id`,
    );
    const r = result.rows[0];
    return {
      row: {
        signups: r?.signups ?? 0,
        birthDataSubmitted: r?.birth_data_submitted ?? 0,
        natalChartComputed: r?.natal_chart_computed ?? 0,
        onboarded: r?.onboarded ?? 0,
        skipped: r?.skipped ?? 0,
      },
      live: true,
    };
  } catch (err) {
    _logger.error("[onboardingHealth] funnel query failed:", err);
    return {
      row: {
        signups: 0,
        birthDataSubmitted: 0,
        natalChartComputed: 0,
        onboarded: 0,
        skipped: 0,
      },
      live: false,
    };
  }
}

async function readStuckUsers(): Promise<OnboardingStuckUser[]> {
  try {
    const result = await executeQuery<{
      id: string;
      email: string;
      name: string | null;
      created_at: Date;
      has_birth_data: boolean;
      has_natal_chart: boolean;
      completed: boolean;
    }>(
      `SELECT
         u.id::text AS id,
         u.email,
         COALESCE(up.name, u.name) AS name,
         u.created_at,
         (up.birth_data IS NOT NULL AND up.birth_data <> '{}'::jsonb) AS has_birth_data,
         (up.natal_chart IS NOT NULL AND up.natal_chart <> '{}'::jsonb) AS has_natal_chart,
         COALESCE(up.onboarding_completed, false) AS completed
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.created_at > NOW() - INTERVAL '24 hours'
         AND u.created_at < NOW() - INTERVAL '1 hour'
         AND COALESCE(u.is_agent, false) = false
         AND COALESCE(up.onboarding_completed, false) = false
       ORDER BY u.created_at DESC
       LIMIT 20`,
    );
    return result.rows.map((row) => {
      const missing = !row.has_birth_data
        ? "no-birth-data"
        : !row.has_natal_chart
          ? "no-natal-chart"
          : "incomplete-flag";
      return {
        userId: row.id,
        email: row.email,
        name: row.name,
        createdAt: new Date(row.created_at).toISOString(),
        ageHours: Math.round(
          (Date.now() - new Date(row.created_at).getTime()) / ONE_HOUR_MS,
        ),
        missing,
      };
    });
  } catch (err) {
    _logger.warn("[onboardingHealth] stuck users query failed:", err);
    return [];
  }
}

async function readRecentSuccesses(): Promise<OnboardingRecentSuccess[]> {
  try {
    const result = await executeQuery<{
      id: string;
      email: string;
      name: string | null;
      completed_at: Date | null;
      created_at: Date;
      has_birth_data: boolean;
      dominant_element: string | null;
    }>(
      `SELECT
         u.id::text AS id,
         u.email,
         COALESCE(up.name, u.name) AS name,
         up.onboarding_completed_at AS completed_at,
         u.created_at,
         (up.birth_data IS NOT NULL AND up.birth_data <> '{}'::jsonb) AS has_birth_data,
         COALESCE(up.dominant_element, up.natal_chart->>'dominantElement') AS dominant_element
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       WHERE up.onboarding_completed = true
         AND COALESCE(u.is_agent, false) = false
       ORDER BY COALESCE(up.onboarding_completed_at, u.created_at) DESC
       LIMIT 10`,
    );
    return result.rows.map((row) => ({
      userId: row.id,
      email: row.email,
      name: row.name,
      completedAt: new Date(row.completed_at ?? row.created_at).toISOString(),
      fullOnboarding: row.has_birth_data,
      dominantElement: row.dominant_element,
    }));
  } catch (err) {
    _logger.warn("[onboardingHealth] recent successes query failed:", err);
    return [];
  }
}

function readApiHealth(): OnboardingApiHealth {
  const health = summarizePath("/api/onboarding", ONE_HOUR_MS);
  // Recent errors with structured fields for the UI's recent-errors list.
  const recent = getRecentRequests({
    pathContains: "/api/onboarding",
    statusGte: 400,
    limit: 5,
  });
  return {
    observed: health.observed,
    count: health.count,
    successRate: health.successRate,
    errors4xx: health.errors4xx,
    errors5xx: health.errors5xx,
    p50LatencyMs: health.p50LatencyMs,
    p95LatencyMs: health.p95LatencyMs,
    recentErrors: recent.map((entry: RequestLogEntry) => ({
      at: entry.at,
      method: entry.method,
      path: entry.path,
      status: entry.status,
      latencyMs: entry.latencyMs,
    })),
  };
}

export interface DiagnoseInput {
  funnel: FunnelRow;
  stuckCount: number;
  apiHealth: OnboardingApiHealth;
  live: boolean;
}

/**
 * Compute the headline + overall status for the panel. Aggregates funnel +
 * API health + stuck-user count into a single OK/DEGRADED/INCIDENT/UNKNOWN
 * verdict and a one-line summary.
 *
 * Exported for unit tests; production callers go through `getOnboardingHealth`.
 */
export function diagnose({
  funnel,
  stuckCount,
  apiHealth,
  live,
}: DiagnoseInput): { overall: OnboardingHealthPayload["overall"]; headline: string } {
  if (!live && !apiHealth.observed) {
    return { overall: "UNKNOWN", headline: "Onboarding signals unavailable" };
  }

  // Hard failure: /api/onboarding 5xx dominates traffic.
  if (
    apiHealth.observed &&
    apiHealth.errors5xx > 0 &&
    1 - apiHealth.successRate >= 0.5
  ) {
    return {
      overall: "INCIDENT",
      headline: `${Math.round((1 - apiHealth.successRate) * 100)}% of /api/onboarding calls failing — flow is broken`,
    };
  }

  // Degraded: signups exist but completions are 0.
  if (
    funnel.signups >= 3 &&
    funnel.onboarded === 0 &&
    funnel.birthDataSubmitted === 0
  ) {
    return {
      overall: "DEGRADED",
      headline: `${funnel.signups} signups in 24h but 0 onboardings — investigate`,
    };
  }

  // Degraded: too many stuck users.
  if (stuckCount >= 5) {
    return {
      overall: "DEGRADED",
      headline: `${stuckCount} users stuck mid-onboarding (>1h since signup)`,
    };
  }

  // Degraded: API errors elevated.
  if (apiHealth.observed && apiHealth.successRate < 0.9) {
    return {
      overall: "DEGRADED",
      headline: `Onboarding API success rate ${(apiHealth.successRate * 100).toFixed(0)}%`,
    };
  }

  // Healthy.
  if (funnel.signups === 0) {
    return {
      overall: "OK",
      headline: "Quiet — no new signups in 24h, no errors detected",
    };
  }
  const completionRate = funnel.onboarded / Math.max(funnel.signups, 1);
  return {
    overall: "OK",
    headline: `${funnel.onboarded}/${funnel.signups} new users onboarded (${(completionRate * 100).toFixed(0)}%)`,
  };
}

export async function getOnboardingHealth(): Promise<OnboardingHealthPayload> {
  const [funnelData, stuckUsers, recentSuccesses] = await Promise.all([
    readFunnel(),
    readStuckUsers(),
    readRecentSuccesses(),
  ]);

  const apiHealth = readApiHealth();
  const funnel = funnelData.row;
  const live = funnelData.live;

  // Compute drop-offs as percent reduction from previous stage.
  // Signup → Birth-data → Natal chart → Onboarded.
  const dropOff = (curr: number, prev: number) =>
    prev > 0 ? Math.max(0, 1 - curr / prev) : 0;

  const funnelStages: OnboardingFunnelStage[] = [
    { id: "signup", label: "Signed up", count: funnel.signups, dropOff: 0 },
    {
      id: "birth-data",
      label: "Submitted birth data",
      count: funnel.birthDataSubmitted,
      dropOff: dropOff(funnel.birthDataSubmitted, funnel.signups),
    },
    {
      id: "natal-chart",
      label: "Natal chart computed",
      count: funnel.natalChartComputed,
      dropOff: dropOff(funnel.natalChartComputed, funnel.birthDataSubmitted),
    },
    {
      id: "onboarded",
      label: "Onboarding complete",
      count: funnel.onboarded,
      dropOff: dropOff(funnel.onboarded, funnel.natalChartComputed),
    },
  ];

  const skipRate =
    funnel.onboarded > 0 ? funnel.skipped / funnel.onboarded : 0;

  const { overall, headline } = diagnose({
    funnel,
    stuckCount: stuckUsers.length,
    apiHealth,
    live,
  });

  return {
    generatedAt: new Date().toISOString(),
    overall,
    headline,
    funnel: funnelStages,
    stuckUsers,
    recentSuccesses,
    apiHealth,
    skipRate,
    live,
  };
}
