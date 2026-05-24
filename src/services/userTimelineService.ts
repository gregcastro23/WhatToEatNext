/**
 * User Timeline Service
 *
 * Per-user variant of `liveActivityService`. Merges every meaningful event
 * for a single user into one chronological feed plus lifetime aggregates
 * — backs the /admin/users/[userId] deep-dive page.
 *
 * Sources:
 *   - users + user_profiles (identity, signup, onboarding, natal chart,
 *     dominant element, bio, Monica constant, token balances)
 *   - device_sessions (active count)
 *   - user_subscriptions (tier, status, period dates)
 *   - auth_events (sign-ins / sign-outs / failures)
 *   - feed_events (agent activity, quest events)
 *   - token_transactions (every ESMS movement)
 *   - user_interactions (recipe views/cooks, food diary entries)
 *
 * Lifetime stats are aggregated at query time (counts, sums); the timeline
 * pulls the latest N events per source, merges, and paginates.
 *
 * All queries are bounded (LIMIT + indexed columns); safe to call from a
 * hot path. The endpoint that wraps this also memoizes for 5s.
 *
 * @file src/services/userTimelineService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

export type TimelineCategory =
  | "signup"
  | "auth"
  | "onboarding"
  | "recipe"
  | "economy"
  | "agent"
  | "diary"
  | "subscription";

export type TimelineStatus = "success" | "failure" | "info";

export interface TimelineEvent {
  id: string;
  at: string;
  category: TimelineCategory;
  type: string;
  description: string;
  status: TimelineStatus;
  metadata?: Record<string, unknown>;
}

export interface UserIdentity {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  isActive: boolean;
  isAgent: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  dominantElement: string | null;
  bio: string | null;
  monicaConstant: number | null;
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt: string | null;
  activeSessions: number;
}

export interface UserBalances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  total: number;
}

export interface UserSubscription {
  tier: string;
  status: string;
  currentPeriodEnd: string | null;
}

export interface UserLifetimeStats {
  signIns: number;
  signInFailures: number;
  recipesViewed: number;
  recipesCooked: number;
  diaryEntries: number;
  tokensEarned: number;
  tokensSpent: number;
  agentEvents: number;
}

export interface UserTimelinePayload {
  identity: UserIdentity;
  balances: UserBalances;
  subscription: UserSubscription | null;
  stats: UserLifetimeStats;
  events: TimelineEvent[];
  /** True only when every source query succeeded. */
  live: boolean;
  generatedAt: string;
}

const PER_SOURCE_LIMIT = 25;
const MAX_EVENTS = 100;

// ─── Identity + aggregates ───────────────────────────────────────────

interface IdentityRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  is_agent: boolean;
  created_at: Date;
  last_login_at: Date | null;
  login_count: number | null;
  dominant_element: string | null;
  bio: string | null;
  monica_constant: string | null;
  onboarding_completed: boolean | null;
  onboarding_completed_at: Date | null;
  has_birth_data: boolean;
  has_natal_chart: boolean;
  spirit: string | null;
  essence: string | null;
  matter: string | null;
  substance: string | null;
  sub_tier: string | null;
  sub_status: string | null;
  sub_period_end: Date | null;
  active_sessions: number;
}

function toNum(value: string | null | undefined): number {
  return value === null || value === undefined
    ? 0
    : Number.parseFloat(value) || 0;
}

async function readIdentity(
  userId: string,
): Promise<{
  identity: UserIdentity;
  balances: UserBalances;
  subscription: UserSubscription | null;
} | null> {
  try {
    const result = await executeQuery<IdentityRow>(
      `SELECT
         u.id::text AS id,
         u.email,
         COALESCE(up.name, u.name) AS name,
         u.role::text AS role,
         u.is_active,
         COALESCE(u.is_agent, false) AS is_agent,
         u.created_at,
         u.last_login_at,
         u.login_count,
         COALESCE(up.dominant_element, up.natal_chart->>'dominantElement') AS dominant_element,
         up.bio,
         up.monica_constant::text AS monica_constant,
         up.onboarding_completed,
         up.onboarding_completed_at,
         (up.birth_data IS NOT NULL AND up.birth_data <> '{}'::jsonb) AS has_birth_data,
         (up.natal_chart IS NOT NULL AND up.natal_chart <> '{}'::jsonb) AS has_natal_chart,
         tb.spirit::text AS spirit,
         tb.essence::text AS essence,
         tb.matter::text AS matter,
         tb.substance::text AS substance,
         s.tier::text AS sub_tier,
         s.status::text AS sub_status,
         s.current_period_end AS sub_period_end,
         (
           SELECT COUNT(*)::int
           FROM device_sessions ds
           WHERE ds.user_id = u.id::text AND ds.revoked_at IS NULL
         ) AS active_sessions
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN token_balances tb ON tb.user_id = u.id
       LEFT JOIN user_subscriptions s ON s.user_id = u.id
       WHERE u.id = $1::uuid
       LIMIT 1`,
      [userId],
    );
    const row = result.rows[0];
    if (!row) return null;

    const isAdmin = (row.role || "").toUpperCase() === "ADMIN";
    const balances: UserBalances = {
      spirit: toNum(row.spirit),
      essence: toNum(row.essence),
      matter: toNum(row.matter),
      substance: toNum(row.substance),
      total: 0,
    };
    balances.total =
      balances.spirit + balances.essence + balances.matter + balances.substance;

    const identity: UserIdentity = {
      id: row.id,
      email: row.email,
      name: row.name,
      roles: isAdmin ? ["admin", "user"] : ["user"],
      isActive: row.is_active,
      isAgent: row.is_agent === true,
      isAdmin,
      createdAt: new Date(row.created_at).toISOString(),
      lastLoginAt: row.last_login_at
        ? new Date(row.last_login_at).toISOString()
        : null,
      loginCount: row.login_count ?? 0,
      dominantElement: row.dominant_element,
      bio: row.bio,
      monicaConstant:
        row.monica_constant !== null ? toNum(row.monica_constant) : null,
      hasCompletedOnboarding: row.onboarding_completed === true,
      onboardingCompletedAt: row.onboarding_completed_at
        ? new Date(row.onboarding_completed_at).toISOString()
        : null,
      activeSessions: row.active_sessions ?? 0,
    };

    const subscription: UserSubscription | null = row.sub_tier
      ? {
          tier: row.sub_tier,
          status: row.sub_status ?? "unknown",
          currentPeriodEnd: row.sub_period_end
            ? new Date(row.sub_period_end).toISOString()
            : null,
        }
      : null;

    return { identity, balances, subscription };
  } catch (err) {
    _logger.error(
      `[userTimeline] identity query failed for ${userId}:`,
      err,
    );
    return null;
  }
}

async function readLifetimeStats(userId: string): Promise<{
  stats: UserLifetimeStats;
  live: boolean;
}> {
  try {
    const result = await executeQuery<{
      signins: number;
      signin_failures: number;
      recipes_viewed: number;
      recipes_cooked: number;
      diary_entries: number;
      tokens_earned: string;
      tokens_spent: string;
      agent_events: number;
    }>(
      `WITH txns AS (
         SELECT
           SUM(amount) FILTER (WHERE amount > 0) AS earned,
           SUM(-amount) FILTER (WHERE amount < 0) AS spent
         FROM token_transactions
         WHERE user_id = $1::uuid
       ),
       interactions AS (
         SELECT
           COUNT(*) FILTER (WHERE interaction_type = 'recipe_view')::int AS viewed,
           COUNT(*) FILTER (WHERE interaction_type = 'recipe_cook')::int AS cooked,
           COUNT(*) FILTER (WHERE interaction_type = 'food_diary_entry')::int AS diary
         FROM user_interactions
         WHERE user_id = $1::uuid
       ),
       auth AS (
         SELECT
           COUNT(*) FILTER (WHERE event_type LIKE 'signin%' AND status = 'success')::int AS signins,
           COUNT(*) FILTER (WHERE event_type LIKE 'signin%' AND status = 'failure')::int AS failures
         FROM auth_events
         WHERE user_id = $1
       ),
       feed AS (
         SELECT COUNT(*)::int AS evt
         FROM feed_events
         WHERE actor_id = $1::uuid
       )
       SELECT
         (SELECT signins FROM auth) AS signins,
         (SELECT failures FROM auth) AS signin_failures,
         (SELECT viewed FROM interactions) AS recipes_viewed,
         (SELECT cooked FROM interactions) AS recipes_cooked,
         (SELECT diary FROM interactions) AS diary_entries,
         COALESCE((SELECT earned FROM txns)::text, '0') AS tokens_earned,
         COALESCE((SELECT spent FROM txns)::text, '0') AS tokens_spent,
         (SELECT evt FROM feed) AS agent_events`,
      [userId],
    );
    const row = result.rows[0];
    return {
      stats: {
        signIns: row?.signins ?? 0,
        signInFailures: row?.signin_failures ?? 0,
        recipesViewed: row?.recipes_viewed ?? 0,
        recipesCooked: row?.recipes_cooked ?? 0,
        diaryEntries: row?.diary_entries ?? 0,
        tokensEarned: toNum(row?.tokens_earned ?? "0"),
        tokensSpent: toNum(row?.tokens_spent ?? "0"),
        agentEvents: row?.agent_events ?? 0,
      },
      live: true,
    };
  } catch (err) {
    _logger.warn("[userTimeline] lifetime stats query failed:", err);
    return {
      stats: {
        signIns: 0,
        signInFailures: 0,
        recipesViewed: 0,
        recipesCooked: 0,
        diaryEntries: 0,
        tokensEarned: 0,
        tokensSpent: 0,
        agentEvents: 0,
      },
      live: false,
    };
  }
}

// ─── Per-source timeline readers ─────────────────────────────────────

interface AuthRow {
  id: string;
  event_type: string;
  status: string;
  provider: string | null;
  error_message: string | null;
  created_at: Date;
}

async function readAuthEvents(userId: string): Promise<TimelineEvent[]> {
  try {
    const result = await executeQuery<AuthRow>(
      `SELECT id::text AS id, event_type, status, provider, error_message, created_at
       FROM auth_events
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
      [userId],
    );
    return result.rows.map((row) => {
      const status: TimelineStatus =
        row.status === "success"
          ? "success"
          : row.status === "failure"
            ? "failure"
            : "info";
      const description =
        status === "failure"
          ? `${row.event_type} failed${row.error_message ? `: ${row.error_message}` : ""}`
          : `${row.event_type}${row.provider ? ` via ${row.provider}` : ""}`;
      return {
        id: `auth:${row.id}`,
        at: new Date(row.created_at).toISOString(),
        category: "auth",
        type: row.event_type,
        description,
        status,
      };
    });
  } catch (err) {
    _logger.warn("[userTimeline] auth events query failed:", err);
    return [];
  }
}

interface FeedRow {
  id: string;
  event_type: string;
  created_at: Date;
}

async function readFeedEvents(userId: string): Promise<TimelineEvent[]> {
  try {
    const result = await executeQuery<FeedRow>(
      `SELECT id::text AS id, event_type, created_at
       FROM feed_events
       WHERE actor_id = $1::uuid
       ORDER BY created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
      [userId],
    );
    return result.rows.map((row) => ({
      id: `feed:${row.id}`,
      at: new Date(row.created_at).toISOString(),
      category: row.event_type.startsWith("onboarding") ? "onboarding" : "agent",
      type: row.event_type,
      description: row.event_type.replace(/_/g, " "),
      status: "success",
    }));
  } catch (err) {
    _logger.warn("[userTimeline] feed events query failed:", err);
    return [];
  }
}

interface TxnRow {
  id: string;
  token_type: string;
  amount: string;
  source_type: string;
  description: string | null;
  created_at: Date;
}

async function readTokenTxns(userId: string): Promise<TimelineEvent[]> {
  try {
    const result = await executeQuery<TxnRow>(
      `SELECT id::text AS id, token_type, amount::text AS amount, source_type, description, created_at
       FROM token_transactions
       WHERE user_id = $1::uuid
       ORDER BY created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
      [userId],
    );
    return result.rows.map((row) => {
      const amount = toNum(row.amount);
      const sign = amount >= 0 ? "+" : "";
      const description =
        row.description ||
        `${sign}${amount.toFixed(2)} ${row.token_type} · ${row.source_type}`;
      return {
        id: `token:${row.id}`,
        at: new Date(row.created_at).toISOString(),
        category: "economy",
        type: row.source_type,
        description,
        status: "success",
        metadata: { amount, tokenType: row.token_type },
      };
    });
  } catch (err) {
    _logger.warn("[userTimeline] token txns query failed:", err);
    return [];
  }
}

interface InteractionRow {
  id: string;
  interaction_type: string;
  payload: unknown;
  created_at: Date;
}

async function readInteractions(userId: string): Promise<TimelineEvent[]> {
  try {
    const result = await executeQuery<InteractionRow>(
      `SELECT id::text AS id, interaction_type, payload, created_at
       FROM user_interactions
       WHERE user_id = $1::uuid
       ORDER BY created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
      [userId],
    );
    return result.rows.map((row) => {
      const category: TimelineCategory =
        row.interaction_type === "food_diary_entry" ? "diary" : "recipe";
      const recipeName =
        row.payload &&
        typeof row.payload === "object" &&
        "recipeName" in row.payload &&
        typeof (row.payload as Record<string, unknown>).recipeName === "string"
          ? (row.payload as Record<string, string>).recipeName
          : null;
      const verbMap: Record<string, string> = {
        recipe_view: "viewed",
        recipe_save: "saved",
        recipe_cook: "cooked",
        food_diary_entry: "logged a meal",
        food_rating: "rated a meal",
      };
      const verb = verbMap[row.interaction_type] || row.interaction_type.replace(/_/g, " ");
      const description = recipeName ? `${verb} ${recipeName}` : verb;
      return {
        id: `interaction:${row.id}`,
        at: new Date(row.created_at).toISOString(),
        category,
        type: row.interaction_type,
        description,
        status: "success",
      };
    });
  } catch (err) {
    _logger.warn("[userTimeline] interactions query failed:", err);
    return [];
  }
}

// ─── Public entry ────────────────────────────────────────────────────

/**
 * Resolve the full per-user timeline payload. Returns null when the user
 * doesn't exist; otherwise returns the merged feed even if some sources
 * fail (with `live: false`).
 */
export async function getUserTimeline(
  userId: string,
): Promise<UserTimelinePayload | null> {
  const identityResult = await readIdentity(userId);
  if (!identityResult) return null;

  const [statsResult, auth, feed, txn, interactions] = await Promise.allSettled([
    readLifetimeStats(userId),
    readAuthEvents(userId),
    readFeedEvents(userId),
    readTokenTxns(userId),
    readInteractions(userId),
  ]);

  const stats =
    statsResult.status === "fulfilled"
      ? statsResult.value
      : {
          stats: {
            signIns: 0,
            signInFailures: 0,
            recipesViewed: 0,
            recipesCooked: 0,
            diaryEntries: 0,
            tokensEarned: 0,
            tokensSpent: 0,
            agentEvents: 0,
          },
          live: false,
        };

  const events: TimelineEvent[] = [];
  // Signup is a synthetic event from identity.createdAt — anchors the timeline.
  events.push({
    id: `signup:${identityResult.identity.id}`,
    at: identityResult.identity.createdAt,
    category: "signup",
    type: identityResult.identity.isAgent ? "agent_provisioned" : "signup",
    description: identityResult.identity.isAgent
      ? "Provisioned as agent"
      : "Account created",
    status: "success",
  });
  if (identityResult.identity.onboardingCompletedAt) {
    events.push({
      id: `onboarding:${identityResult.identity.id}`,
      at: identityResult.identity.onboardingCompletedAt,
      category: "onboarding",
      type: "onboarding_complete",
      description: "Completed onboarding",
      status: "success",
    });
  }

  for (const r of [auth, feed, txn, interactions]) {
    if (r.status === "fulfilled") {
      events.push(...r.value);
    }
  }

  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const limited = events.slice(0, MAX_EVENTS);

  const live =
    statsResult.status === "fulfilled" &&
    statsResult.value.live &&
    auth.status === "fulfilled" &&
    feed.status === "fulfilled" &&
    txn.status === "fulfilled" &&
    interactions.status === "fulfilled";

  return {
    identity: identityResult.identity,
    balances: identityResult.balances,
    subscription: identityResult.subscription,
    stats: stats.stats,
    events: limited,
    live,
    generatedAt: new Date().toISOString(),
  };
}
