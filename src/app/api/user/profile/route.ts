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
  getDatabaseUserFromRequest,
} from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/user/profile
 * Get current user's profile (authenticated)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);

    if (!user) {
      _logger.warn("[GET /api/user/profile] User not found or not authenticated");
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Lazy migration: if natal chart has position:0 for planets, recalculate with sub-arcminute precision
    const profile = user.profile as any;
    const natalChart = profile?.natalChart;
    if (natalChart?.planets?.length > 0 && natalChart?.birthData?.dateTime) {
      const needsMigration = natalChart.planets.some(
        (p: any) => p.name !== 'Ascendant' && (!p.position || p.position === 0),
      );
      if (needsMigration) {
        _logger.info("[GET /api/user/profile] Migrating natal chart with sub-arcminute positions");
        try {
          const birthDate = new Date(natalChart.birthData.dateTime);
          const rawPositions = await getPlanetaryPositionsForDateTime(birthDate, {
            latitude: natalChart.birthData.latitude,
            longitude: natalChart.birthData.longitude,
          });
          // Update planet positions with exact longitudes
          const updatedPlanets = natalChart.planets.map((p: any) => {
            const pos = rawPositions[p.name];
            return pos ? { ...p, position: pos.exactLongitude ?? p.position } : p;
          });
          natalChart.planets = updatedPlanets;
          // Persist the migrated chart asynchronously (don't block response)
          void userDatabase.updateUserProfile(user.id, { natalChart } as any, user.email).catch((err: any) =>
            _logger.error("[GET /api/user/profile] Failed to persist migrated chart", err),
          );
        } catch (err) {
          _logger.error("[GET /api/user/profile] Lazy migration failed", err as any);
        }
      }
    }

    return NextResponse.json({
      success: true,
      profile: user.profile,
    });
  } catch (error) {
    _logger.error("[GET /api/user/profile] Failed to get profile", error as any);
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
    const user = await getDatabaseUserFromRequest(request);

    if (!user) {
      _logger.warn("[PUT /api/user/profile] User not found or not authenticated");
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    const body = await request.json();
    const { userId: _bodyUserId, ...profileData } = body;

    // Use authenticated user's ID
    const userId = user.id;

    const updatedUser = await userDatabase.updateUserProfile(
      userId,
      profileData as Partial<UserProfile>,
      user.email
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found during update",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedUser.profile,
    });
  } catch (error) {
    _logger.error("[PUT /api/user/profile] Update profile error", error as any);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
