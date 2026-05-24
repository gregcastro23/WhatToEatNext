/**
 * Today's Highlights Service
 *
 * Headline counts for the admin dashboard — "what happened today and how
 * does it compare to yesterday?" Designed for the early-stage view where
 * every number is small and changes matter. Each metric pairs the raw
 * 24h count with a delta vs the prior 24h block.
 *
 * Metrics covered:
 *   - signups
 *   - active users (distinct users with auth_events or interactions)
 *   - onboarding completions
 *   - recipe interactions (views + cooks)
 *   - food diary entries
 *   - token transactions
 *   - agent events
 *   - sign-in failures
 *
 * All queries are bounded to recent windows and run in parallel; each
 * failure degrades to `null` for that metric and the overall payload
 * still renders.
 *
 * @file src/services/todaysHighlightsService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

export interface HighlightMetric {
  id: string;
  label: string;
  /** Count over the trailing 24h. */
  today: number;
  /** Count over the 24h before that. Null when source unavailable. */
  yesterday: number | null;
  /** Delta = today - yesterday. Null when yesterday is null. */
  delta: number | null;
  /** Short hint shown beneath the number when relevant. */
  hint?: string;
  /** True when this metric resolved from a live source. */
  live: boolean;
  /**
   * Visual tone hint. Some metrics are "more is better" (signups), others
   * are "less is better" (sign-in failures). Drives delta color in the UI.
   */
  goodWhenIncreasing: boolean;
}

export interface TodaysHighlightsPayload {
  generatedAt: string;
  metrics: HighlightMetric[];
  /** True when every metric resolved live. */
  live: boolean;
}

interface PairCounts {
  today: number;
  yesterday: number;
}

/**
 * Run a count query that returns two integers in one row: `today` and
 * `yesterday`. We use a single query per metric (filtered count over both
 * windows) so adding more metrics doesn't multiply round-trips.
 */
async function runPair(label: string, sql: string): Promise<PairCounts | null> {
  try {
    const result = await executeQuery<PairCounts>(sql);
    const row = result.rows[0];
    return {
      today: Number(row?.today ?? 0),
      yesterday: Number(row?.yesterday ?? 0),
    };
  } catch (err) {
    _logger.warn(`[todaysHighlights] ${label} query failed:`, err);
    return null;
  }
}

function metricFrom(
  id: string,
  label: string,
  counts: PairCounts | null,
  options: { hint?: string; goodWhenIncreasing?: boolean } = {},
): HighlightMetric {
  const live = counts !== null;
  const today = counts?.today ?? 0;
  const yesterday = counts?.yesterday ?? null;
  const delta = yesterday !== null ? today - yesterday : null;
  return {
    id,
    label,
    today,
    yesterday,
    delta,
    hint: options.hint,
    live,
    goodWhenIncreasing: options.goodWhenIncreasing ?? true,
  };
}

export async function getTodaysHighlights(): Promise<TodaysHighlightsPayload> {
  const [
    signups,
    activeUsers,
    onboardings,
    recipeInteractions,
    diaryEntries,
    tokenTxns,
    agentEvents,
    signInFailures,
  ] = await Promise.all([
    runPair(
      "signups",
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS today,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '48 hours' AND created_at <= NOW() - INTERVAL '24 hours')::int AS yesterday
       FROM users
       WHERE COALESCE(is_agent, false) = false`,
    ),
    runPair(
      "active users",
      `WITH activity AS (
         SELECT a.user_id::uuid AS user_id, a.created_at
         FROM auth_events a
         WHERE a.created_at > NOW() - INTERVAL '48 hours'
           AND a.user_id IS NOT NULL
           AND a.status = 'success'
         UNION ALL
         SELECT ui.user_id, ui.created_at
         FROM user_interactions ui
         WHERE ui.created_at > NOW() - INTERVAL '48 hours'
       )
       SELECT
         COUNT(DISTINCT user_id) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS today,
         COUNT(DISTINCT user_id) FILTER (WHERE created_at > NOW() - INTERVAL '48 hours' AND created_at <= NOW() - INTERVAL '24 hours')::int AS yesterday
       FROM activity`,
    ),
    runPair(
      "onboardings",
      `SELECT
         COUNT(*) FILTER (WHERE onboarding_completed_at > NOW() - INTERVAL '24 hours')::int AS today,
         COUNT(*) FILTER (WHERE onboarding_completed_at > NOW() - INTERVAL '48 hours' AND onboarding_completed_at <= NOW() - INTERVAL '24 hours')::int AS yesterday
       FROM user_profiles
       WHERE onboarding_completed = true`,
    ),
    runPair(
      "recipe interactions",
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours' AND interaction_type IN ('recipe_view', 'recipe_cook', 'recipe_save'))::int AS today,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '48 hours' AND created_at <= NOW() - INTERVAL '24 hours' AND interaction_type IN ('recipe_view', 'recipe_cook', 'recipe_save'))::int AS yesterday
       FROM user_interactions`,
    ),
    runPair(
      "diary entries",
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours' AND interaction_type = 'food_diary_entry')::int AS today,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '48 hours' AND created_at <= NOW() - INTERVAL '24 hours' AND interaction_type = 'food_diary_entry')::int AS yesterday
       FROM user_interactions`,
    ),
    runPair(
      "token transactions",
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS today,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '48 hours' AND created_at <= NOW() - INTERVAL '24 hours')::int AS yesterday
       FROM token_transactions`,
    ),
    runPair(
      "agent events",
      `SELECT
         COUNT(*) FILTER (WHERE f.created_at > NOW() - INTERVAL '24 hours')::int AS today,
         COUNT(*) FILTER (WHERE f.created_at > NOW() - INTERVAL '48 hours' AND f.created_at <= NOW() - INTERVAL '24 hours')::int AS yesterday
       FROM feed_events f
       JOIN users u ON u.id = f.actor_id
       WHERE u.is_agent = true`,
    ),
    runPair(
      "sign-in failures",
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS today,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '48 hours' AND created_at <= NOW() - INTERVAL '24 hours')::int AS yesterday
       FROM auth_events
       WHERE status = 'failure'`,
    ),
  ]);

  const metrics: HighlightMetric[] = [
    metricFrom("signups", "New signups", signups, {
      hint: "Non-agent users created",
    }),
    metricFrom("active-users", "Active users", activeUsers, {
      hint: "Distinct users with auth or interaction",
    }),
    metricFrom("onboardings", "Onboardings", onboardings, {
      hint: "onboarding_completed = true",
    }),
    metricFrom("recipe-interactions", "Recipe activity", recipeInteractions, {
      hint: "views + saves + cooks",
    }),
    metricFrom("diary-entries", "Diary entries", diaryEntries, {
      hint: "food_diary_entry interactions",
    }),
    metricFrom("token-txns", "Token transactions", tokenTxns, {
      hint: "ESMS ledger writes",
    }),
    metricFrom("agent-events", "Agent events", agentEvents, {
      hint: "feed_events from agentic users",
    }),
    metricFrom("signin-failures", "Sign-in failures", signInFailures, {
      hint: "auth_events status=failure",
      goodWhenIncreasing: false,
    }),
  ];

  return {
    generatedAt: new Date().toISOString(),
    metrics,
    live: metrics.every((m) => m.live),
  };
}
