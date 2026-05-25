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
import { withTimeout } from "@/lib/performance/withTimeout";
import { UserProfileUpdateSchema } from "@/lib/validation/apiSchemas";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HONO_API_URL = process.env.HONO_API_URL;
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

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
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        };
        if (INTERNAL_SECRET) {
          headers["x-internal-secret"] = INTERNAL_SECRET;
        }

        const honoResponse = await fetch(`${HONO_API_URL}/api/user/profile`, {
          method: "GET",
          headers,
        });

        if (honoResponse.ok) {
          const data = await honoResponse.json();
          // Still do lazy migration locally if it's not handled in Hono yet to preserve exact feature parity
          const profile = data.profile;
          const natalChart = profile?.natalChart;
          if (natalChart?.planets?.length > 0 && natalChart?.birthData?.dateTime) {
            const needsMigration = natalChart.planets.some(
              (p: any) => p.name !== 'Ascendant' && (!p.position || p.position === 0),
            );
            if (needsMigration) {
              _logger.info("[GET /api/user/profile] Migrating natal chart with sub-arcminute positions");
              try {
                const birthDate = new Date(natalChart.birthData.dateTime);
                // 8s ceiling: the fallback ephemeris computation in
                // getPlanetaryPositionsForDateTime is unbounded server-side
                // math (no AbortController). Migration is best-effort — if
                // we time out, return the un-migrated chart; the next call
                // tries again.
                const rawPositions = await withTimeout(
                  getPlanetaryPositionsForDateTime(birthDate, {
                    latitude: natalChart.birthData.latitude,
                    longitude: natalChart.birthData.longitude,
                  }),
                  8000,
                  null,
                  "profile-hono lazy migration",
                );
                if (rawPositions) {
                  const updatedPlanets = natalChart.planets.map((p: any) => {
                    const pos = rawPositions[p.name];
                    return pos ? { ...p, position: pos.exactLongitude ?? p.position } : p;
                  });
                  natalChart.planets = updatedPlanets;
                  void userDatabase.updateUserProfile(user.id, { natalChart } as any, user.email).catch((err: any) =>
                    _logger.error("[GET /api/user/profile] Failed to persist migrated chart", err),
                  );
                }
              } catch (err) {
                _logger.error("[GET /api/user/profile] Lazy migration failed", err);
              }
            }
          }
          return NextResponse.json(data);
        }
      } catch (err) {
        _logger.error("Hono Gateway proxy failed for user profile:", err);
      }
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
          // 8s ceiling: see comment in the Hono proxy branch above.
          const rawPositions = await withTimeout(
            getPlanetaryPositionsForDateTime(birthDate, {
              latitude: natalChart.birthData.latitude,
              longitude: natalChart.birthData.longitude,
            }),
            8000,
            null,
            "profile-fallback lazy migration",
          );
          if (rawPositions) {
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
          }
        } catch (err) {
          _logger.error("[GET /api/user/profile] Lazy migration failed", err);
        }
      }
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

    let rawBody;
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
        { success: false, message: "Validation error", details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { userId: _bodyUserId, ...profileData } = parsedBody.data;

    // Use authenticated user's ID
    const userId = user.id;

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        };
        if (INTERNAL_SECRET) {
          headers["x-internal-secret"] = INTERNAL_SECRET;
        }

        const honoResponse = await fetch(`${HONO_API_URL}/api/user/profile`, {
          method: "PUT",
          headers,
          body: JSON.stringify(profileData),
        });

        if (honoResponse.ok) {
          const data = await honoResponse.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        _logger.error("Hono Gateway proxy failed for user profile update:", err);
      }
    }

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

