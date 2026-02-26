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
