/**
 * User Profile API Route
 * GET /api/user/profile - Get current user's profile
 * PUT /api/user/profile - Update current user's profile
 *
 * @requires Authentication - JWT token in cookie or Authorization header
 */

import { NextResponse } from "next/server";
import type { UserProfile } from "@/contexts/UserContext";
import {
  validateRequest,
  getUserIdFromRequest,
} from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/user/profile
 * Get current user's profile (authenticated)
 * Falls back to query params for development/testing
 */
export async function GET(request: NextRequest) {
  try {
    // Try to get userId from authenticated token
    const userId = await getUserIdFromRequest(request);

    // Also allow email query param as fallback
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required or provide email parameter",
        },
        { status: 401 },
      );
    }

    const user = userId
      ? await userDatabase.getUserById(userId)
      : await userDatabase.getUserByEmail(email!);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get profile",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/user/profile
 * Update user profile (authenticated)
 */
export async function PUT(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { userId: bodyUserId, ...profileData } = body;

    // Use authenticated user's ID, or allow body userId for admin
    const userId =
      authResult.user.roles.includes("admin") && bodyUserId
        ? bodyUserId
        : authResult.user.userId;

    const updatedUser = await userDatabase.updateUserProfile(
      userId,
      profileData as Partial<UserProfile>,
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedUser.profile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
