/**
 * Live Activity Service
 *
 * Merges recent events from every meaningful source into one chronological
 * feed so the operator can see exactly what's happening on the site right
 * now. At the 10-user stage, this is the highest-signal panel on the
 * dashboard — it surfaces real human activity instead of stats.
 *
 * Sources merged:
 *   - users (new signups, last hour)
 *   - auth_events (sign-ins, sign-outs, failures)
 *   - user_profiles (onboarding completions)
 *   - feed_events (agent activity, quest events)
 *   - token_transactions (mints, burns, daily claims)
 *   - user_interactions (recipe views, cooks, food diary entries)
 *
 * Every source query is bounded to a recent window and capped (per-source
 * LIMIT) so the merge stays cheap. Each event is normalized to the same
 * shape and sorted by timestamp DESC.
 *
 * @file src/services/liveActivityService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

export type ActivityCategory =
  | "signup"
  | "auth"
  | "onboarding"
  | "recipe"
  | "economy"
  | "agent"
  | "diary";

export type ActivityStatus = "success" | "failure" | "info";

export interface ActivityActor {
  userId: string;
  email: string;
  name: string | null;
  isAgent: boolean;
}

export interface ActivityEvent {
  /** Unique compound id (`<source>:<id>`) so React keys stay stable. */
  id: string;
  /** ISO timestamp the event occurred. */
  at: string;
  category: ActivityCategory;
  /** Specific event type within the category (e.g. "signin_complete", "recipe_view"). */
  type: string;
  /** Plain-English summary for the UI row. */
  description: string;
  status: ActivityStatus;
  actor: ActivityActor | null;
  /** Optional context blob — UI may render selected fields. */
  context?: Record<string, unknown>;
}

const PER_SOURCE_LIMIT = 25;
const WINDOW_HOURS = 6;
const MAX_RETURNED = 50;

// ─── Source readers ──────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  is_agent: boolean;
  created_at: Date;
}

async function readSignups(): Promise<ActivityEvent[]> {
  try {
    const result = await executeQuery<UserRow>(
      `SELECT
         u.id::text AS id,
         u.email,
         COALESCE(up.name, u.name) AS name,
         COALESCE(u.is_agent, false) AS is_agent,
         u.created_at
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.created_at > NOW() - INTERVAL '${WINDOW_HOURS} hours'
       ORDER BY u.created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
    );
    return result.rows.map((row) => ({
      id: `signup:${row.id}`,
      at: new Date(row.created_at).toISOString(),
      category: "signup",
      type: row.is_agent ? "agent_provisioned" : "signup",
      description: row.is_agent
        ? `Provisioned agent ${row.email}`
        : `Signed up ${row.email}`,
      status: "success",
      actor: {
        userId: row.id,
        email: row.email,
        name: row.name,
        isAgent: row.is_agent,
      },
    }));
  } catch (err) {
    _logger.warn("[liveActivity] signups query failed:", err);
    return [];
  }
}

interface AuthEventRow {
  id: string;
  user_id: string | null;
  email: string | null;
  event_type: string;
  status: string;
  provider: string | null;
  error_message: string | null;
  created_at: Date;
  // Joined from users table when user_id resolves.
  user_name: string | null;
  user_is_agent: boolean | null;
}

async function readAuthEvents(): Promise<ActivityEvent[]> {
  try {
    const result = await executeQuery<AuthEventRow>(
      `SELECT
         a.id::text AS id,
         a.user_id,
         a.email,
         a.event_type,
         a.status,
         a.provider,
         a.error_message,
         a.created_at,
         COALESCE(up.name, u.name) AS user_name,
         u.is_agent AS user_is_agent
       FROM auth_events a
       LEFT JOIN users u ON u.id::text = a.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE a.created_at > NOW() - INTERVAL '${WINDOW_HOURS} hours'
       ORDER BY a.created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
    );
    return result.rows.map((row) => {
      const status: ActivityStatus =
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
        actor: row.user_id
          ? {
              userId: row.user_id,
              email: row.email ?? "",
              name: row.user_name,
              isAgent: row.user_is_agent === true,
            }
          : row.email
            ? {
                userId: "",
                email: row.email,
                name: null,
                isAgent: false,
              }
            : null,
      };
    });
  } catch (err) {
    _logger.warn("[liveActivity] auth events query failed:", err);
    return [];
  }
}

interface OnboardingRow {
  id: string;
  email: string;
  name: string | null;
  completed_at: Date;
  has_birth_data: boolean;
  dominant_element: string | null;
  is_agent: boolean;
}

async function readOnboardingCompletions(): Promise<ActivityEvent[]> {
  try {
    const result = await executeQuery<OnboardingRow>(
      `SELECT
         u.id::text AS id,
         u.email,
         COALESCE(up.name, u.name) AS name,
         up.onboarding_completed_at AS completed_at,
         (up.birth_data IS NOT NULL AND up.birth_data <> '{}'::jsonb) AS has_birth_data,
         COALESCE(up.dominant_element, up.natal_chart->>'dominantElement') AS dominant_element,
         COALESCE(u.is_agent, false) AS is_agent
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       WHERE up.onboarding_completed = true
         AND up.onboarding_completed_at > NOW() - INTERVAL '${WINDOW_HOURS} hours'
       ORDER BY up.onboarding_completed_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
    );
    return result.rows.map((row) => {
      const tag = row.has_birth_data ? "completed onboarding" : "skipped natal";
      const desc = row.dominant_element
        ? `${tag} · ${row.dominant_element} dominant`
        : tag;
      return {
        id: `onboarding:${row.id}`,
        at: new Date(row.completed_at).toISOString(),
        category: "onboarding",
        type: row.has_birth_data ? "onboarding_complete" : "onboarding_skipped",
        description: desc,
        status: "success",
        actor: {
          userId: row.id,
          email: row.email,
          name: row.name,
          isAgent: row.is_agent,
        },
      };
    });
  } catch (err) {
    _logger.warn("[liveActivity] onboarding completions query failed:", err);
    return [];
  }
}

interface FeedEventRow {
  id: string;
  actor_id: string;
  event_type: string;
  created_at: Date;
  email: string;
  name: string | null;
  is_agent: boolean;
}

async function readFeedEvents(): Promise<ActivityEvent[]> {
  try {
    const result = await executeQuery<FeedEventRow>(
      `SELECT
         f.id::text AS id,
         f.actor_id::text AS actor_id,
         f.event_type,
         f.created_at,
         u.email,
         COALESCE(up.name, u.name) AS name,
         COALESCE(u.is_agent, false) AS is_agent
       FROM feed_events f
       JOIN users u ON u.id = f.actor_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE f.created_at > NOW() - INTERVAL '${WINDOW_HOURS} hours'
       ORDER BY f.created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
    );
    return result.rows.map((row) => ({
      id: `feed:${row.id}`,
      at: new Date(row.created_at).toISOString(),
      category: row.is_agent ? "agent" : "recipe",
      type: row.event_type,
      description: `${row.event_type.replace(/_/g, " ")}`,
      status: "success",
      actor: {
        userId: row.actor_id,
        email: row.email,
        name: row.name,
        isAgent: row.is_agent,
      },
    }));
  } catch (err) {
    _logger.warn("[liveActivity] feed events query failed:", err);
    return [];
  }
}

interface TokenTxnRow {
  id: string;
  user_id: string;
  token_type: string;
  amount: string;
  source_type: string;
  description: string | null;
  created_at: Date;
  email: string;
  name: string | null;
  is_agent: boolean;
}

async function readTokenTransactions(): Promise<ActivityEvent[]> {
  try {
    const result = await executeQuery<TokenTxnRow>(
      `SELECT
         t.id::text AS id,
         t.user_id::text AS user_id,
         t.token_type,
         t.amount::text AS amount,
         t.source_type,
         t.description,
         t.created_at,
         u.email,
         COALESCE(up.name, u.name) AS name,
         COALESCE(u.is_agent, false) AS is_agent
       FROM token_transactions t
       JOIN users u ON u.id = t.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE t.created_at > NOW() - INTERVAL '${WINDOW_HOURS} hours'
       ORDER BY t.created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
    );
    return result.rows.map((row) => {
      const amount = Number.parseFloat(row.amount) || 0;
      const sign = amount >= 0 ? "+" : "";
      const desc =
        row.description ||
        `${sign}${amount.toFixed(2)} ${row.token_type} · ${row.source_type}`;
      return {
        id: `token:${row.id}`,
        at: new Date(row.created_at).toISOString(),
        category: "economy",
        type: row.source_type,
        description: desc,
        status: "success",
        actor: {
          userId: row.user_id,
          email: row.email,
          name: row.name,
          isAgent: row.is_agent,
        },
        context: {
          amount,
          tokenType: row.token_type,
          sourceType: row.source_type,
        },
      };
    });
  } catch (err) {
    _logger.warn("[liveActivity] token transactions query failed:", err);
    return [];
  }
}

interface InteractionRow {
  id: string;
  user_id: string;
  interaction_type: string;
  payload: unknown;
  created_at: Date;
  email: string;
  name: string | null;
  is_agent: boolean;
}

async function readUserInteractions(): Promise<ActivityEvent[]> {
  try {
    const result = await executeQuery<InteractionRow>(
      `SELECT
         ui.id::text AS id,
         ui.user_id::text AS user_id,
         ui.interaction_type,
         ui.payload,
         ui.created_at,
         u.email,
         COALESCE(up.name, u.name) AS name,
         COALESCE(u.is_agent, false) AS is_agent
       FROM user_interactions ui
       JOIN users u ON u.id = ui.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE ui.created_at > NOW() - INTERVAL '${WINDOW_HOURS} hours'
       ORDER BY ui.created_at DESC
       LIMIT ${PER_SOURCE_LIMIT}`,
    );
    return result.rows.map((row) => {
      const category: ActivityCategory =
        row.interaction_type === "food_diary_entry"
          ? "diary"
          : row.interaction_type.startsWith("recipe_")
            ? "recipe"
            : "recipe";
      const desc = describeInteraction(row.interaction_type, row.payload);
      return {
        id: `interaction:${row.id}`,
        at: new Date(row.created_at).toISOString(),
        category,
        type: row.interaction_type,
        description: desc,
        status: "success",
        actor: {
          userId: row.user_id,
          email: row.email,
          name: row.name,
          isAgent: row.is_agent,
        },
        context: { payload: row.payload },
      };
    });
  } catch (err) {
    _logger.warn("[liveActivity] user interactions query failed:", err);
    return [];
  }
}

function describeInteraction(type: string, payload: unknown): string {
  const recipeName =
    payload &&
    typeof payload === "object" &&
    payload !== null &&
    "recipeName" in payload &&
    typeof (payload as Record<string, unknown>).recipeName === "string"
      ? (payload as Record<string, string>).recipeName
      : null;
  const verbMap: Record<string, string> = {
    recipe_view: "viewed",
    recipe_save: "saved",
    recipe_cook: "cooked",
    food_diary_entry: "logged a meal",
    food_rating: "rated a meal",
    ingredient_select: "picked an ingredient",
    cooking_method: "tried a method",
    planetary_query: "queried planetary state",
  };
  const verb = verbMap[type] || type.replace(/_/g, " ");
  return recipeName ? `${verb} ${recipeName}` : verb;
}

// ─── Public entry ────────────────────────────────────────────────────

export interface LiveActivityPayload {
  generatedAt: string;
  windowHours: number;
  events: ActivityEvent[];
  /** Counts per category in the window — drives the filter chips. */
  countsByCategory: Record<ActivityCategory, number>;
  /** True only when every source query succeeded. */
  live: boolean;
}

/**
 * Resolve the live activity feed for the admin dashboard.
 *
 * Each source query runs in parallel and degrades independently to an
 * empty array on failure. We still flag `live: false` so the UI can show
 * a degraded indicator when at least one source dropped.
 */
export async function getLiveActivity(): Promise<LiveActivityPayload> {
  const sources = await Promise.allSettled([
    readSignups(),
    readAuthEvents(),
    readOnboardingCompletions(),
    readFeedEvents(),
    readTokenTransactions(),
    readUserInteractions(),
  ]);

  const live = sources.every((s) => s.status === "fulfilled");
  const events: ActivityEvent[] = [];
  for (const result of sources) {
    if (result.status === "fulfilled") {
      events.push(...result.value);
    }
  }

  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const limited = events.slice(0, MAX_RETURNED);

  const counts: Record<ActivityCategory, number> = {
    signup: 0,
    auth: 0,
    onboarding: 0,
    recipe: 0,
    economy: 0,
    agent: 0,
    diary: 0,
  };
  for (const event of limited) {
    counts[event.category] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    windowHours: WINDOW_HOURS,
    events: limited,
    countsByCategory: counts,
    live,
  };
}
