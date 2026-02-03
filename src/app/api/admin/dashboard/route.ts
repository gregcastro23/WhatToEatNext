/**
 * Admin Dashboard API Route
 * GET /api/admin/dashboard - Get dashboard statistics
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/dashboard
 * Returns dashboard statistics and recent users
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    // Get all users
    const allUsers = await userDatabase.getAllUsers();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Calculate statistics
    const stats = {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter((u) => u.isActive).length,
      newUsersToday: allUsers.filter((u) => new Date(u.createdAt) > oneDayAgo)
        .length,
      completedOnboarding: allUsers.filter(
        (u) => u.profile.birthData && u.profile.natalChart,
      ).length,
    };

    // Get recent users (last 5)
    const recentUsers = [...allUsers]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        email: u.email,
        name: u.profile.name,
        createdAt: u.createdAt,
        dominantElement: u.profile.natalChart?.dominantElement || null,
        isActive: u.isActive,
      }));

    return NextResponse.json({
      success: true,
      stats,
      recentUsers,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard" },
      { status: 500 },
    );
  }
}
