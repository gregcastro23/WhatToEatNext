/**
 * Admin Users API Route
 * GET  /api/admin/users         - List all users with tier info
 * PATCH /api/admin/users/[id]   - Update user role or tier (handled in [id]/route.ts)
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import { subscriptionService } from "@/services/subscriptionService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/users
 * Returns all users with profile and subscription tier information.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status"); // "active" | "inactive" | null
    const tierFilter = searchParams.get("tier"); // "free" | "premium" | null

    let users = await userDatabase.getAllUsers();

    if (search) {
      users = users.filter(
        (u) =>
          u.email.toLowerCase().includes(search) ||
          u.profile.name?.toLowerCase().includes(search),
      );
    }

    if (status === "active") {
      users = users.filter((u) => u.isActive);
    } else if (status === "inactive") {
      users = users.filter((u) => !u.isActive);
    }

    // Sort newest first
    users.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Fetch subscription tiers in parallel — errors are non-fatal
    const subscriptions = await Promise.allSettled(
      users.map((u) => subscriptionService.getUserSubscription(u.id)),
    );

    const mappedUsers = users.map((u, i) => {
      const subResult = subscriptions[i];
      const sub =
        subResult.status === "fulfilled" ? subResult.value : null;

      // Admins always get premium regardless of DB subscription state
      const isAdmin = u.roles.some(
        (r) => String(r).toLowerCase() === "admin",
      );
      const tier = isAdmin ? "premium" : (sub?.tier ?? "free");

      return {
        id: u.id,
        email: u.email,
        name: u.profile.name ?? null,
        roles: u.roles,
        tier,
        subscriptionStatus: sub?.status ?? null,
        isActive: u.isActive,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt ?? null,
        dominantElement: u.profile.natalChart?.dominantElement ?? null,
        hasCompletedOnboarding: !!(
          u.profile.birthData && u.profile.natalChart
        ),
      };
    });

    // Apply tier filter after computing effective tier
    const filtered =
      tierFilter
        ? mappedUsers.filter((u) => u.tier === tierFilter)
        : mappedUsers;

    return NextResponse.json({
      success: true,
      users: filtered,
      total: filtered.length,
    });
  } catch (error) {
    console.error("[admin/users] List error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load users" },
      { status: 500 },
    );
  }
}
