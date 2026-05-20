/**
 * Admin Users API Route
 * GET  /api/admin/users         - List users (paginated) with tier + activity metrics
 * PATCH /api/admin/users/[id]   - Update user role or tier (handled in [id]/route.ts)
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
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
  subscription_tier: string | null;
  subscription_status: string | null;
  active_sessions: number | null;
}

/**
 * GET /api/admin/users
 *
 * Returns a paginated user list with subscription tier, login count,
 * and active session count joined in a single query (no N+1).
 *
 * Query parameters:
 *   search    — substring match on email or name
 *   status    — "active" | "inactive"
 *   tier      — "free" | "premium"
 *   page      — 1-indexed (default 1)
 *   pageSize  — 1..200 (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase()?.trim() || null;
    const status = searchParams.get("status");
    const tierFilter = searchParams.get("tier");
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

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    // Pull users + profile + subscription + active session count in ONE query.
    // Previously this was N+1 (one DB call per user for subscriptions).
    const sessionsLateral = `LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS active_sessions
      FROM device_sessions
      WHERE user_id = u.id::text AND revoked_at IS NULL
    ) ds ON true`;

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
         up.natal_chart->>'dominantElement' AS dominant_element,
         s.tier::text AS subscription_tier,
         s.status::text AS subscription_status,
         ds.active_sessions
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_subscriptions s ON s.user_id = u.id
       ${sessionsLateral}
       ${whereSql}
       ORDER BY u.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params,
    );

    const users = result.rows.map((row) => {
      const isAdmin = (row.role || "").toUpperCase() === "ADMIN";
      const effectiveTier = isAdmin ? "premium" : (row.subscription_tier ?? "free");
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
        hasCompletedOnboarding: row.onboarding_completed === true,
      };
    });

    return NextResponse.json({
      success: true,
      users,
      total,
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
      return NextResponse.json({
        success: true,
        users: users.map((u) => ({
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
          hasCompletedOnboarding: !!(u.profile.birthData && u.profile.natalChart),
        })),
        total: users.length,
        pagination: { page: 1, pageSize: users.length, total: users.length, totalPages: 1 },
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
