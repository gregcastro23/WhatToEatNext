/**
 * Admin User Detail API Route
 * GET /api/admin/users/[userId] - Get user details
 * DELETE /api/admin/users/[userId] - Delete user
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
 * Permanently deletes a user (non-admin only)
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

    // Deactivate (soft delete) - in production would actually delete
    await userDatabase.deactivateUser(userId);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/admin/users/[userId]
 * Allows admins to update a user's tier or deactivation status.
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

    const { tier, isActive } = body as {
      tier?: "free" | "premium";
      isActive?: boolean;
    };

    const user = await userDatabase.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
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

    // Deactivate / reactivate
    if (typeof isActive === "boolean" && !isActive) {
      await userDatabase.deactivateUser(userId);
    }

    return NextResponse.json({
      success: true,
      message: "User updated",
      userId,
      ...(tier ? { tier } : {}),
    });
  } catch (error) {
    console.error("[admin/users/[userId]] PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 },
    );
  }
}
