/**
 * Admin User Status API Route
 * PATCH /api/admin/users/[userId]/status - Update user active status
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ userId: string }>;
}

/**
 * PATCH /api/admin/users/[userId]/status
 * Updates user active status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate admin access
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { userId } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive boolean is required" },
        { status: 400 },
      );
    }

    const user = await userDatabase.getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Prevent deactivating admin users
    if (!isActive && user.roles.includes("admin" as any)) {
      return NextResponse.json(
        { success: false, message: "Cannot deactivate admin users" },
        { status: 403 },
      );
    }

    // Update status
    if (isActive) {
      // Reactivate user - need to update the user object directly
      user.isActive = true;
      await userDatabase.updateUserProfile(userId, {}); // Trigger save
    } else {
      await userDatabase.deactivateUser(userId);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isActive,
      },
    });
  } catch (error) {
    console.error("Admin update user status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user status" },
      { status: 500 },
    );
  }
}
