/**
 * User Profile API Route
 * GET /api/user/profile - Get current user's profile
 * PUT /api/user/profile - Update current user's profile
 *
 * @requires Authentication - JWT token in cookie or Authorization header
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import type { UserProfile } from "@/contexts/UserContext";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { withTimeout } from "@/lib/performance/withTimeout";
import { NatalChartPatchSchema, UserProfileUpdateSchema } from "@/lib/validation/apiSchemas";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { userDatabase } from "@/services/userDatabaseService";
import type { NatalChart, PlanetInfo } from "@/types/natalChart";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const { HONO_API_URL } = process.env;
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

interface ProfileApiResponse {
  success: boolean;
  profile?: UserProfile;
  message?: string;
  details?: Record<string, string[] | undefined>;
}

const honoProfileResponseSchema = z.object({
  success: z.boolean().optional(),
  profile: z.custom<UserProfile>((val) => val === undefined || (typeof val === "object" && val !== null)).optional(),
}).passthrough();

/**
 * Migrates a natal chart with sub-arcminute planet positions if positions are missing
 */
async function maybeMigrateNatalChart(
  userId: string,
  userEmail: string | undefined,
  natalChart: NatalChart,
): Promise<NatalChart> {
  if (natalChart.planets.length === 0 || !natalChart.birthData.dateTime) {
    return natalChart;
  }

  const needsMigration = natalChart.planets.some(
    (p) => p.name !== "Ascendant" && (!p.position || p.position === 0),
  );

  if (!needsMigration) {
    return natalChart;
  }

  _logger.info("[api/user/profile] Migrating natal chart with sub-arcminute positions");
  try {
    const birthDate = new Date(natalChart.birthData.dateTime);
    const rawPositions = await withTimeout(
      getPlanetaryPositionsForDateTime(birthDate, {
        latitude: natalChart.birthData.latitude,
        longitude: natalChart.birthData.longitude,
      }),
      8000,
      null,
      "profile lazy migration",
    );

    if (rawPositions) {
      const updatedPlanets: PlanetInfo[] = natalChart.planets.map((p) => {
        const pos = rawPositions[p.name];
        return pos ? { ...p, position: pos.exactLongitude ?? p.position } : p;
      });
      const migratedChart: NatalChart = { ...natalChart, planets: updatedPlanets };

      // Persist the migrated chart asynchronously
      userDatabase.updateUserProfile(userId, { natalChart: migratedChart }, userEmail).catch((err: unknown) => {
        _logger.error("[api/user/profile] Failed to persist migrated chart", err);
      });

      return migratedChart;
    }
  } catch (err) {
    _logger.error("[api/user/profile] Lazy migration failed", err);
  }

  return natalChart;
}

function getHonoHeaders(userId: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-user-id": userId,
    ...(INTERNAL_SECRET ? { "x-internal-secret": INTERNAL_SECRET } : {}),
  };
}

async function proxyHonoProfile(
  honoResponse: Response,
  userId?: string,
  userEmail?: string,
): Promise<NextResponse<ProfileApiResponse> | null> {
  if (!honoResponse.ok) return null;
  const parsed = honoProfileResponseSchema.safeParse(await honoResponse.json());
  if (!parsed.success) return null;

  const { profile } = parsed.data;
  if (profile?.natalChart && userId) {
    profile.natalChart = await maybeMigrateNatalChart(userId, userEmail, profile.natalChart);
  }
  return NextResponse.json({
    success: true,
    ...(profile !== undefined ? { profile } : {}),
  });
}

/**
 * GET /api/user/profile
 * Get current user's profile (authenticated)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ProfileApiResponse>> {
  try {
    const user = await getDatabaseUserFromRequest(request);

    if (!user) {
      _logger.warn("[GET /api/user/profile] User not found or not authenticated");
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const honoResponse = await fetch(`${HONO_API_URL}/api/user/profile`, {
          method: "GET",
          headers: getHonoHeaders(user.id),
        });
        const proxied = await proxyHonoProfile(honoResponse, user.id, user.email);
        if (proxied) return proxied;
      } catch (err) {
        _logger.error("Hono Gateway proxy failed for user profile:", err);
      }
    }

    // Lazy migration for local database user
    const { profile } = user;
    if (profile.natalChart) {
      const chart = profile.natalChart;
      profile.natalChart = await maybeMigrateNatalChart(user.id, user.email, chart);
    }

    return NextResponse.json({
      success: true,
      profile: user.profile,
    });
  } catch (error) {
    _logger.error("[GET /api/user/profile] Failed to get profile", error);
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
export async function PUT(request: NextRequest): Promise<NextResponse<ProfileApiResponse>> {
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

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON" },
        { status: 400 },
      );
    }

    const parsedBody = UserProfileUpdateSchema.safeParse(rawBody);
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          details: parsedBody.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { userId: _bodyUserId, natalChart: rawNatalChart, ...restProfile } = parsedBody.data;

    let validatedNatalChart: NatalChart | undefined;
    if (rawNatalChart !== undefined) {
      const parsedChart = NatalChartPatchSchema.safeParse(rawNatalChart);
      if (!parsedChart.success) {
        return NextResponse.json({
          success: false,
          message: "Validation error: invalid natal chart format",
          details: parsedChart.error.flatten().fieldErrors,
        }, { status: 400 });
      }
      validatedNatalChart = parsedChart.data as NatalChart;
    }

    const profileData: Partial<UserProfile> = {};
    if (restProfile.name !== undefined) profileData.name = restProfile.name;
    if (restProfile.birthData !== undefined) {
      profileData.birthData = {
        dateTime: restProfile.birthData.dateTime,
        latitude: restProfile.birthData.latitude,
        longitude: restProfile.birthData.longitude,
        ...(restProfile.birthData.timezone ? { timezone: restProfile.birthData.timezone } : {}),
        ...(restProfile.birthData.location ? { location: restProfile.birthData.location } : {}),
      };
    }
    if (restProfile.preferences !== undefined) profileData.preferences = restProfile.preferences;
    if (validatedNatalChart !== undefined) {
      profileData.natalChart = validatedNatalChart;
    }

    // Use authenticated user's ID
    const userId = user.id;

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const honoResponse = await fetch(`${HONO_API_URL}/api/user/profile`, {
          method: "PUT",
          headers: getHonoHeaders(user.id),
          body: JSON.stringify(profileData),
        });

        const proxied = await proxyHonoProfile(honoResponse);
        if (proxied) return proxied;
      } catch (err) {
        _logger.error("Hono Gateway proxy failed for user profile update:", err);
      }
    }

    const updatedUser = await userDatabase.updateUserProfile(
      userId,
      profileData,
      user.email,
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
    _logger.error("[PUT /api/user/profile] Update profile error", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
