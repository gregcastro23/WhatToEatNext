/**
 * Admin headline stats — SQL aggregates with an honest live flag.
 *
 * Replaces the dashboard route's former `getAllUsers()` full-table read, which
 * loaded every user row per poll and produced a vacuous `activeUsers` (the
 * source pre-filtered `is_active = true`, so active ≡ total by construction).
 * These aggregates run in SQL, count deactivated rows correctly, and split
 * humans from agent identities so the user-admin panels can talk about people.
 *
 * Honesty contract: on any query failure the payload returns zeros with
 * `live: false` — the dashboard renders the absence, never a fabricated count.
 *
 * @file src/services/adminStatsService.ts
 */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";

interface AdminStatsRow {
  total_users: unknown;
  active_users: unknown;
  new_users_today: unknown;
  completed_onboarding: unknown;
  agent_users: unknown;
  human_users: unknown;
}

interface RecentUserRow {
  id: unknown;
  email: unknown;
  name: unknown;
  created_at: unknown;
  dominant_element: unknown;
  is_active: unknown;
}

export interface AdminUserStats {
  /** Every row in `users`, active or not, human or agent. */
  totalUsers: number;
  /** Rows with `is_active = true` — can now genuinely differ from total. */
  activeUsers: number;
  /** Humans + agents created in the last 24h. */
  newUsersToday: number;
  /** Rows whose profile JSONB carries both birthData and natalChart. */
  completedOnboarding: number;
  /** Rows with `is_agent = true` (the WTEN half of the PA roster diff). */
  agentUsers: number;
  /** Rows that are not agent identities. */
  humanUsers: number;
  /** false when the stats query failed — render zeros as absence, not fact. */
  live: boolean;
}

export interface AdminRecentUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  dominantElement: string | null;
  isActive: boolean;
}

export interface AdminRecentUsersData {
  users: AdminRecentUser[];
  live: boolean;
}

const STATS_SQL = `
  SELECT
    COUNT(*)::int AS total_users,
    COUNT(*) FILTER (WHERE is_active)::int AS active_users,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS new_users_today,
    COUNT(*) FILTER (
      WHERE jsonb_typeof(profile -> 'birthData') NOT IN ('null')
        AND jsonb_typeof(profile -> 'natalChart') NOT IN ('null')
    )::int AS completed_onboarding,
    COUNT(*) FILTER (WHERE is_agent IS TRUE)::int AS agent_users,
    COUNT(*) FILTER (WHERE is_agent IS NOT TRUE)::int AS human_users
  FROM users
`;

/** Recent *human* signups — agent identities are excluded so the panel shows
 *  people entering onboarding, not roster backfills. */
const RECENT_USERS_SQL = `
  SELECT
    id,
    email,
    profile ->> 'name' AS name,
    created_at,
    profile -> 'natalChart' ->> 'dominantElement' AS dominant_element,
    is_active
  FROM users
  WHERE is_agent IS NOT TRUE
  ORDER BY created_at DESC
  LIMIT 5
`;

function readCount(value: unknown): number {
  const count =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function normalizeRecentUser(row: RecentUserRow): AdminRecentUser | null {
  if (typeof row.id !== "string" || typeof row.email !== "string") {
    return null;
  }
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at
      : typeof row.created_at === "string" || typeof row.created_at === "number"
        ? new Date(row.created_at)
        : null;
  if (!createdAt || !Number.isFinite(createdAt.getTime())) return null;

  return {
    id: row.id,
    email: row.email,
    name: readNullableString(row.name),
    createdAt: createdAt.toISOString(),
    dominantElement: readNullableString(row.dominant_element),
    isActive: row.is_active === true,
  };
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  try {
    const result = await executeQuery<AdminStatsRow>(STATS_SQL);
    const row = result.rows.at(0);
    return {
      totalUsers: readCount(row?.total_users),
      activeUsers: readCount(row?.active_users),
      newUsersToday: readCount(row?.new_users_today),
      completedOnboarding: readCount(row?.completed_onboarding),
      agentUsers: readCount(row?.agent_users),
      humanUsers: readCount(row?.human_users),
      live: true,
    };
  } catch (error) {
    _logger.error("[adminStatsService] stats query failed:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      completedOnboarding: 0,
      agentUsers: 0,
      humanUsers: 0,
      live: false,
    };
  }
}

export async function getRecentHumanSignups(): Promise<AdminRecentUsersData> {
  try {
    const result = await executeQuery<RecentUserRow>(RECENT_USERS_SQL);
    return {
      users: result.rows.flatMap((row) => {
        const user = normalizeRecentUser(row);
        return user ? [user] : [];
      }),
      live: true,
    };
  } catch (error) {
    _logger.error("[adminStatsService] recent-signups query failed:", error);
    return { users: [], live: false };
  }
}
