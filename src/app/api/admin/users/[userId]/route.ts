/**
 * Admin User Detail API Route
 * GET /api/admin/users/[userId] - Get user details
 * DELETE /api/admin/users/[userId] - Soft-delete (deactivate) user
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { subscriptionService } from "@/services/subscriptionService";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * GET /api/admin/users/[userId]
 * Returns detailed user information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate admin access
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { userId } = await params;
    const user = await userDatabase.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile.name,
        roles: user.roles,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        profile: {
          birthData: user.profile.birthData,
          natalChart: user.profile.natalChart,
          preferences: user.profile.preferences,
        },
        hasCompletedOnboarding: !!(
          user.profile.birthData && user.profile.natalChart
        ),
      },
    });
  } catch (error) {
    console.error("Admin get user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get user" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/users/[userId]
 * Soft-deletes (deactivates) a user (non-admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate admin access
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { userId } = await params;
    const user = await userDatabase.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Prevent deleting admin users
    if (user.roles.includes("admin" as any)) {
      return NextResponse.json(
        { success: false, message: "Cannot delete admin users" },
        { status: 403 },
      );
    }

    // Soft delete: the row keeps existing with is_active = false, and the
    // account can be reactivated. The response says so — "deleted" here
    // previously implied an irreversible removal that never happened.
    await userDatabase.deactivateUser(userId);

    return NextResponse.json({
      success: true,
      message: "User deactivated (soft delete — reactivation possible)",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 },
    );
  }
}

// The users.role column enum (database/init/06 + 07): legacy ALCHEMIST /
// GRAND_MASTER labels plus the USER / ADMIN pair the app actually gates on.
const ALLOWED_ROLES = new Set(["USER", "ADMIN", "ALCHEMIST", "GRAND_MASTER"]);

/**
 * PATCH /api/admin/users/[userId]
 * Allows admins to update a user's tier, role, or deactivation status.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { userId } = await params;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { tier, isActive, role } = body as {
      tier?: "free" | "premium";
      isActive?: boolean;
      role?: string;
    };

    const user = await userDatabase.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const targetIsAdmin = user.roles.includes("admin" as any);
    // Session ids can be an OAuth sub rather than the DB uuid, so the
    // self-check matches on email as well as id.
    const isSelf =
      userId === authResult.user.userId ||
      user.email.toLowerCase() === authResult.user.email.toLowerCase();

    let normalizedRole: string | undefined;
    if (role !== undefined) {
      if (typeof role !== "string" || !ALLOWED_ROLES.has(role.toUpperCase())) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid role. Allowed: ${Array.from(ALLOWED_ROLES).join(", ")}`,
          },
          { status: 400 },
        );
      }
      normalizedRole = role.toUpperCase();
      // Lockout guard: an admin must never change their own role — a
      // self-demotion would strip the very access used to undo it.
      if (isSelf) {
        return NextResponse.json(
          { success: false, message: "Cannot change your own role" },
          { status: 403 },
        );
      }
      // Same protect-admin-target convention as /status and DELETE.
      if (targetIsAdmin && normalizedRole !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Cannot demote admin users" },
          { status: 403 },
        );
      }
    }

    // Deactivation guard runs before any write so a mixed payload can't
    // half-apply. Same protect-admin convention as /status and DELETE.
    const wantsDeactivation = typeof isActive === "boolean" && !isActive;
    if (wantsDeactivation && targetIsAdmin) {
      return NextResponse.json(
        { success: false, message: "Cannot deactivate admin users" },
        { status: 403 },
      );
    }

    // Update subscription tier
    if (tier === "free" || tier === "premium") {
      const now = new Date();
      const periodEnd = new Date(now);
      if (tier === "premium") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 10);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      await subscriptionService.getOrCreateSubscription(userId);
      await subscriptionService.updateSubscription(userId, {
        tier,
        status: "active",
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
      });
    }

    // Update role (guards above already ran)
    if (normalizedRole) {
      const applied = await userDatabase.updateUserRole(
        userId,
        // updateUserRole uppercases before casting to the user_role enum, so
        // the DB label round-trips even for the legacy ALCHEMIST/GRAND_MASTER values.
        normalizedRole.toLowerCase() as Parameters<
          typeof userDatabase.updateUserRole
        >[1],
      );
      if (!applied) {
        return NextResponse.json(
          { success: false, message: "Failed to persist role change" },
          { status: 500 },
        );
      }
    }

    // Deactivate (guard already ran above)
    if (wantsDeactivation) {
      await userDatabase.deactivateUser(userId);
    }

    return NextResponse.json({
      success: true,
      message: "User updated",
      userId,
      ...(tier ? { tier } : {}),
      ...(normalizedRole ? { role: normalizedRole } : {}),
    });
  } catch (error) {
    console.error("[admin/users/[userId]] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}
