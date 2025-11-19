/**
 * User Profile API Route
 * GET /api/user/profile - Get current user's profile
 * PUT /api/user/profile - Update current user's profile
 */

import { NextResponse } from "next/server";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";
import type { UserProfile } from "@/contexts/UserContext";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/user/profile?email=user@example.com
 * Get user profile by email (temporary auth until full JWT integration)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!email && !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Email or userId parameter required",
        },
        { status: 400 },
      );
    }

    const user = email
      ? await userDatabase.getUserByEmail(email)
      : await userDatabase.getUserById(userId!);

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
 * Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "userId is required",
        },
        { status: 400 },
      );
    }

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
