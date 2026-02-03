/**
 * Admin Users API Route
 * GET /api/admin/users - List all users
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
 * GET /api/admin/users
 * Returns all users with profile information
 */
export async function GET(request: NextRequest) {
  try {
    // Validate admin access
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status"); // "active", "inactive", or null for all

    // Get all users
    let users = await userDatabase.getAllUsers();

    // Apply filters
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

    // Sort by creation date (newest first)
    users.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // Map to response format
    const mappedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.profile.name,
      roles: u.roles,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      dominantElement: u.profile.natalChart?.dominantElement || null,
      hasCompletedOnboarding: !!(u.profile.birthData && u.profile.natalChart),
    }));

    return NextResponse.json({
      success: true,
      users: mappedUsers,
      total: mappedUsers.length,
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load users" },
      { status: 500 },
    );
  }
}
