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

export async function getAdminUserStats(): Promise<AdminUserStats> {
  try {
    const result = await executeQuery(STATS_SQL);
    const row = result.rows[0] ?? {};
    return {
      totalUsers: Number(row.total_users ?? 0),
      activeUsers: Number(row.active_users ?? 0),
      newUsersToday: Number(row.new_users_today ?? 0),
      completedOnboarding: Number(row.completed_onboarding ?? 0),
      agentUsers: Number(row.agent_users ?? 0),
      humanUsers: Number(row.human_users ?? 0),
      live: true,
    };
  } catch (error) {
    console.error("[adminStatsService] stats query failed:", error);
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
    const result = await executeQuery(RECENT_USERS_SQL);
    return {
      users: result.rows.map((row) => ({
        id: String(row.id),
        email: String(row.email),
        name: row.name != null ? String(row.name) : null,
        createdAt: new Date(row.created_at as string).toISOString(),
        dominantElement:
          row.dominant_element != null ? String(row.dominant_element) : null,
        isActive: Boolean(row.is_active),
      })),
      live: true,
    };
  } catch (error) {
    console.error("[adminStatsService] recent-signups query failed:", error);
    return { users: [], live: false };
  }
}
