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
import {
  getKitchenSettings,
  persistKitchenSettings,
} from "@/services/kitchenSettingsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      kitchenElevationM,
      kitchenElevationBasis,
      kitchenSettings,
      recipeAdjustments,
    } = body ?? {};

    if (
      kitchenElevationM !== undefined &&
      kitchenElevationM !== null &&
      (!Number.isFinite(Number(kitchenElevationM)) ||
        Number(kitchenElevationM) < -500 ||
        Number(kitchenElevationM) > 9000)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "kitchenElevationM must be a number within -500..9000 metres",
        },
        { status: 400 },
      );
    }

    const result = await persistKitchenSettings({
      userId: user.id,
      kitchenElevationM:
        kitchenElevationM !== undefined && kitchenElevationM !== null
          ? Number(kitchenElevationM)
          : undefined,
      kitchenElevationBasis,
      kitchenSettings: typeof kitchenSettings === "object" ? kitchenSettings : undefined,
      recipeAdjustments: Array.isArray(recipeAdjustments) ? recipeAdjustments : undefined,
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

export async function GET(request: NextRequest) {
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
