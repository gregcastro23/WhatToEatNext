/**
 * Kitchen Settings & Physical Parameters API Route.
 *
 * POST /api/user/kitchen-settings — durable flush of physical kitchen parameters
 * GET  /api/user/kitchen-settings — retrieve saved kitchen configuration
 *
 * Writes durably to PostgreSQL (table `user_profiles`) via the `pg` driver.
 *
 * @file src/app/api/user/kitchen-settings/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { UserKitchenSettingsRequestSchema } from "@/lib/validation/apiSchemas";
import {
  getKitchenSettings,
  persistKitchenSettings,
  type RecipeCoreTimeAdjustment,
} from "@/services/kitchenSettingsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ELEVATION_MIN_M = -500;
const ELEVATION_MAX_M = 9000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = UserKitchenSettingsRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: `kitchenElevationM must be a number within ${ELEVATION_MIN_M}..${ELEVATION_MAX_M} metres`,
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { kitchenElevationM, kitchenElevationBasis, kitchenSettings, recipeAdjustments } = parsed.data;

    const result = await persistKitchenSettings({
      userId: user.id,
      kitchenElevationM: kitchenElevationM ?? null,
      // Normalised inside the service, which accepts either vocabulary and
      // returns null for anything it does not recognise.
      kitchenElevationBasis: typeof kitchenElevationBasis === "string" ? kitchenElevationBasis : null,
      ...(kitchenSettings !== undefined ? { kitchenSettings } : {}),
      ...(Array.isArray(recipeAdjustments)
        ? { recipeAdjustments: recipeAdjustments as RecipeCoreTimeAdjustment[] }
        : {}),
    });

    return NextResponse.json({
      success: true,
      settings: result,
    });
  } catch (error) {
    _logger.error("Failed to persist kitchen settings", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to persist kitchen settings",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const settings = await getKitchenSettings(user.id);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    _logger.error("Failed to retrieve kitchen settings", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve kitchen settings",
      },
      { status: 500 },
    );
  }
}
