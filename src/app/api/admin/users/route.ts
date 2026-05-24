/**
 * Admin Users API Route
 * GET  /api/admin/users         - List users (paginated) with tier + activity metrics
 * PATCH /api/admin/users/[id]   - Update user role or tier (handled in [id]/route.ts)
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  is_agent: boolean | null;
  created_at: Date;
  last_login_at: Date | null;
  login_count: number | null;
  onboarding_completed: boolean | null;
  dominant_element: string | null;
  bio: string | null;
  monica_constant: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  active_sessions: number | null;
  feed_events_24h: number | null;
  // ESMS token balances joined from token_balances; null when the user
  // has no row yet (i.e. has never received a credit).
  spirit: string | null;
  essence: string | null;
  matter: string | null;
  substance: string | null;
}

/**
 * GET /api/admin/users
 *
 * Returns a paginated user list with subscription tier, login count,
 * active session count, and ESMS token balances joined in a single
 * query (no N+1).
 *
 * Query parameters:
 *   q         — alias for `search`; substring match on email or name
 *   search    — substring match on email or name
 *   status    — "active" | "inactive"
 *   tier      — "free" | "premium"
 *   userType  — "human" | "agent" | "all" (default "all"); agents are
 *               users with `is_agent = true` (typically @agentic.alchm.kitchen)
 *   page      — 1-indexed (default 1)
 *   pageSize  — 1..200 (default 50)
 *
 * When userType="all", humans are sorted before agents so operators see real
 * users first; within each group rows fall back to newest-first.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    // Accept both `?q=` (admin panel shorthand) and `?search=` (existing).
    const search =
      searchParams.get("q")?.toLowerCase()?.trim() ||
      searchParams.get("search")?.toLowerCase()?.trim() ||
      null;
    const status = searchParams.get("status");
    const tierFilter = searchParams.get("tier");
    const userType = (searchParams.get("userType") || "all").toLowerCase();
    const page = Math.max(parseInt(searchParams.get("page") ?? "1", 10) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseInt(searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`, 10) || DEFAULT_PAGE_SIZE, 1),
      MAX_PAGE_SIZE,
    );

    // Build WHERE clauses dynamically so we only filter when params are present.
    const where: string[] = [];
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      const i = params.length;
      where.push(`(lower(u.email) LIKE $${i} OR lower(COALESCE(up.name, u.name, '')) LIKE $${i})`);
    }
    if (status === "active") where.push(`u.is_active = true`);
    else if (status === "inactive") where.push(`u.is_active = false`);

    if (tierFilter === "premium") {
      // Admins are effectively premium even without a row in user_subscriptions.
      where.push(`(s.tier = 'premium' OR u.role = 'ADMIN')`);
    } else if (tierFilter === "free") {
      where.push(`(COALESCE(s.tier, 'free') = 'free' AND u.role <> 'ADMIN')`);
    }

    if (userType === "agent") {
      where.push(`u.is_agent = true`);
    } else if (userType === "human") {
      where.push(`COALESCE(u.is_agent, false) = false`);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    // Pull users + profile + subscription + active session count in ONE query.
    // Previously this was N+1 (one DB call per user for subscriptions).
    const sessionsLateral = `LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS active_sessions
      FROM device_sessions
      WHERE user_id = u.id::text AND revoked_at IS NULL
    ) ds ON true`;

    // Trailing-24h feed-event count per user — surfaces agent activity in the
    // admin list. Joined lateral so the COUNT runs once per row, not N+1.
    const feedActivityLateral = `LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS feed_events_24h
      FROM feed_events
      WHERE actor_id = u.id AND created_at > NOW() - INTERVAL '24 hours'
    ) fa ON true`;

    const countResult = await executeQuery<{ total: number }>(
      `SELECT COUNT(DISTINCT u.id)::int AS total
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_subscriptions s ON s.user_id = u.id
       ${whereSql}`,
      params,
    );
    const total = countResult.rows[0]?.total ?? 0;

    params.push(pageSize);
    const limitIdx = params.length;
    params.push((page - 1) * pageSize);
    const offsetIdx = params.length;

    // Sort: when caller hasn't restricted by userType, surface humans before
    // agents (operators look at real users first); within each group fall back
    // to newest-created.
    const orderSql =
      userType === "all"
        ? `ORDER BY COALESCE(u.is_agent, false) ASC, u.created_at DESC`
        : `ORDER BY u.created_at DESC`;

    const result = await executeQuery<AdminUserRow>(
      `SELECT
         u.id::text AS id,
         u.email,
         COALESCE(up.name, u.name) AS name,
         u.role::text AS role,
         u.is_active,
         u.is_agent,
         u.created_at,
         u.last_login_at,
         u.login_count,
         up.onboarding_completed,
         COALESCE(up.dominant_element, up.natal_chart->>'dominantElement') AS dominant_element,
         up.bio,
         up.monica_constant::text AS monica_constant,
         s.tier::text AS subscription_tier,
         s.status::text AS subscription_status,
         ds.active_sessions,
         fa.feed_events_24h,
         tb.spirit::text     AS spirit,
         tb.essence::text    AS essence,
         tb.matter::text     AS matter,
         tb.substance::text  AS substance
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_subscriptions s ON s.user_id = u.id
       LEFT JOIN token_balances tb ON tb.user_id = u.id
       ${sessionsLateral}
       ${feedActivityLateral}
       ${whereSql}
       ${orderSql}
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    const users = result.rows.map((row) => {
      const isAdmin = (row.role || "").toUpperCase() === "ADMIN";
      const effectiveTier = isAdmin ? "premium" : (row.subscription_tier ?? "free");
      // token_balances columns come back as strings (PG numeric → text via ::text);
      // parseFloat → 0 fallback keeps the admin UI numeric-safe.
      const toNum = (v: string | null) => (v === null ? 0 : Number.parseFloat(v) || 0);
      return {
        id: row.id,
        email: row.email,
        name: row.name ?? null,
        roles: isAdmin ? ["admin", "user"] : ["user"],
        tier: effectiveTier,
        subscriptionStatus: row.subscription_status ?? null,
        isActive: row.is_active,
        isAgent: row.is_agent === true,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
        loginCount: row.login_count ?? 0,
        activeSessions: row.active_sessions ?? 0,
        dominantElement: row.dominant_element ?? null,
        bio: row.bio ?? null,
        monicaConstant: row.monica_constant !== null ? toNum(row.monica_constant) : null,
        feedEvents24h: row.feed_events_24h ?? 0,
        hasCompletedOnboarding: row.onboarding_completed === true,
        balances: {
          spirit: toNum(row.spirit),
          essence: toNum(row.essence),
          matter: toNum(row.matter),
          substance: toNum(row.substance),
        },
      };
    });

    // Counts by user type so the UI can render filter pills with badges
    // without a second round-trip. These reflect the same search/status/tier
    // filters as the page, but ignore userType — the point is to know the
    // full agent + human split inside the rest of the filter set.
    //
    // The userType clause was the only `where` entry that didn't push a
    // param, so filtering it out leaves the remaining positional `$1..$N`
    // references intact against `countParams` (predicate params only — we
    // slice off the trailing limit/offset that the user query appended).
    const nonUserTypeWhere = where.filter(
      (clause) =>
        !clause.includes("u.is_agent = true") &&
        !clause.includes("COALESCE(u.is_agent, false) = false"),
    );
    const countWhereSql =
      nonUserTypeWhere.length > 0 ? `WHERE ${nonUserTypeWhere.join(" AND ")}` : "";
    const countParams = params.slice(0, params.length - 2);

    const countsByType = await executeQuery<{ humans: number; agents: number }>(
      `SELECT
         COUNT(*) FILTER (WHERE COALESCE(u.is_agent, false) = false)::int AS humans,
         COUNT(*) FILTER (WHERE u.is_agent = true)::int AS agents
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_subscriptions s ON s.user_id = u.id
       ${countWhereSql}`,
      countParams,
    );
    const humansCount = countsByType.rows[0]?.humans ?? 0;
    const agentsCount = countsByType.rows[0]?.agents ?? 0;

    return NextResponse.json({
      success: true,
      users,
      total,
      counts: {
        all: humansCount + agentsCount,
        humans: humansCount,
        agents: agentsCount,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages: pageSize > 0 ? Math.ceil(total / pageSize) : 1,
      },
    });
  } catch (error) {
    console.error("[admin/users] List error:", error);
    // Fall back to the in-memory userDatabase enumeration so the admin page
    // still renders something usable when Postgres is temporarily unreachable.
    try {
      const users = await userDatabase.getAllUsers();
      // Honor the userType filter when degraded so the UI tabs still work.
      const { searchParams: degradedSearch } = new URL(request.url);
      const degradedUserType = (
        degradedSearch.get("userType") || "all"
      ).toLowerCase();
      const filtered = users.filter((u) => {
        if (degradedUserType === "agent") return u.isAgent === true;
        if (degradedUserType === "human") return u.isAgent !== true;
        return true;
      });
      // When showing both, surface humans before agents (matches DB path).
      if (degradedUserType === "all") {
        filtered.sort((a, b) => {
          const aAgent = a.isAgent === true ? 1 : 0;
          const bAgent = b.isAgent === true ? 1 : 0;
          if (aAgent !== bAgent) return aAgent - bAgent;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
      const humans = users.filter((u) => u.isAgent !== true).length;
      const agents = users.filter((u) => u.isAgent === true).length;
      return NextResponse.json({
        success: true,
        users: filtered.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.profile.name ?? null,
          roles: u.roles,
          tier: "free",
          subscriptionStatus: null,
          isActive: u.isActive,
          isAgent: u.isAgent === true,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt ?? null,
          loginCount: 0,
          activeSessions: 0,
          dominantElement: u.profile.natalChart?.dominantElement ?? null,
          bio: null,
          monicaConstant: null,
          feedEvents24h: 0,
          hasCompletedOnboarding: !!(u.profile.birthData && u.profile.natalChart),
        })),
        total: filtered.length,
        counts: { all: humans + agents, humans, agents },
        pagination: { page: 1, pageSize: filtered.length, total: filtered.length, totalPages: 1 },
        degraded: true,
      });
    } catch {
      return NextResponse.json(
        { success: false, message: "Failed to load users" },
        { status: 500 },
      );
    }
  }
}
