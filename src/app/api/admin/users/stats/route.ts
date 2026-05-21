/**
 * Admin Auth & User Metrics
 * GET /api/admin/users/stats
 *
 * Aggregates from `users`, `auth_events`, and `device_sessions` to answer:
 *   - How many users do we have? (active, onboarded, premium)
 *   - How many sign-in attempts in the last 24h / 7d?
 *   - How many of those failed? Which event types?
 *   - How many sessions are live right now?
 *   - Who logged in most recently?
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { getEventCounts } from "@/services/authEventsService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface UserRollupRow {
  total: number;
  active: number;
  onboarded: number;
  premium: number;
  agents: number;
  signups_24h: number;
  signups_7d: number;
  active_sessions: number;
  logged_in_24h: number;
  logged_in_7d: number;
  logged_in_30d: number;
}

interface RecentLoginRow {
  id: string;
  email: string;
  last_login_at: Date | null;
  login_count: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const rollupResult = await executeQuery<UserRollupRow>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE u.is_active = true)::int AS active,
         COUNT(*) FILTER (WHERE up.onboarding_completed = true)::int AS onboarded,
         COUNT(*) FILTER (WHERE COALESCE(s.tier, 'free') = 'premium' OR u.role = 'ADMIN')::int AS premium,
         COUNT(*) FILTER (WHERE u.is_agent = true)::int AS agents,
         COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '24 hours')::int AS signups_24h,
         COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days')::int  AS signups_7d,
         COUNT(*) FILTER (WHERE u.last_login_at >= NOW() - INTERVAL '24 hours')::int AS logged_in_24h,
         COUNT(*) FILTER (WHERE u.last_login_at >= NOW() - INTERVAL '7 days')::int  AS logged_in_7d,
         COUNT(*) FILTER (WHERE u.last_login_at >= NOW() - INTERVAL '30 days')::int AS logged_in_30d,
         (
           SELECT COUNT(*)::int FROM device_sessions WHERE revoked_at IS NULL
         ) AS active_sessions
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_subscriptions s ON s.user_id = u.id`,
    );

    const rollup = rollupResult.rows[0] ?? {
      total: 0,
      active: 0,
      onboarded: 0,
      premium: 0,
      agents: 0,
      signups_24h: 0,
      signups_7d: 0,
      logged_in_24h: 0,
      logged_in_7d: 0,
      logged_in_30d: 0,
      active_sessions: 0,
    };

    const [eventsLast24h, eventsLast7d, recentLogins] = await Promise.all([
      getEventCounts(24 * 60 * 60 * 1000),
      getEventCounts(7 * 24 * 60 * 60 * 1000),
      executeQuery<RecentLoginRow>(
        `SELECT id::text AS id, email, last_login_at, login_count
         FROM users
         WHERE last_login_at IS NOT NULL
         ORDER BY last_login_at DESC
         LIMIT 10`,
      ),
    ]);

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      users: {
        total: rollup.total,
        active: rollup.active,
        onboarded: rollup.onboarded,
        premium: rollup.premium,
        agents: rollup.agents,
        signups: {
          last24h: rollup.signups_24h,
          last7d: rollup.signups_7d,
        },
        activity: {
          loggedIn24h: rollup.logged_in_24h,
          loggedIn7d: rollup.logged_in_7d,
          loggedIn30d: rollup.logged_in_30d,
        },
      },
      sessions: {
        active: rollup.active_sessions,
      },
      authEvents: {
        last24h: eventsLast24h,
        last7d: eventsLast7d,
      },
      recentLogins: recentLogins.rows.map((r) => ({
        userId: r.id,
        email: r.email,
        lastLoginAt: r.last_login_at,
        loginCount: r.login_count ?? 0,
      })),
    });
  } catch (error) {
    console.error("[admin/users/stats] Failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load metrics" },
      { status: 500 },
    );
  }
}
