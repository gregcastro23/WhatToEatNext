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
  type RecipeCoreTimeAdjustment,
} from "@/services/kitchenSettingsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Client-supplied body. Every field is `unknown`, because it is: this is parsed
 * JSON off the wire, and typing it as the happy-path shape would let
 * `no-unsafe-*` violations stand in for the validation that actually has to
 * happen below.
 *
 * Elevation bounds mirror the SpacetimeDB reducer's (−500..9000 m) so a value
 * that is acceptable live is acceptable durably.
 */
interface KitchenSettingsBody {
  kitchenElevationM?: unknown;
  kitchenElevationBasis?: unknown;
  kitchenSettings?: unknown;
  recipeAdjustments?: unknown;
}

const ELEVATION_MIN_M = -500;
const ELEVATION_MAX_M = 9000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getDatabaseUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = ((await request.json()) ?? {}) as KitchenSettingsBody;
    const { kitchenElevationM, kitchenElevationBasis, kitchenSettings, recipeAdjustments } = body;

    const elevationProvided = kitchenElevationM !== undefined && kitchenElevationM !== null;
    const elevationValue = elevationProvided ? Number(kitchenElevationM) : undefined;

    if (
      elevationValue !== undefined &&
      (!Number.isFinite(elevationValue) ||
        elevationValue < ELEVATION_MIN_M ||
        elevationValue > ELEVATION_MAX_M)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `kitchenElevationM must be a number within ${ELEVATION_MIN_M}..${ELEVATION_MAX_M} metres`,
        },
        { status: 400 },
      );
    }

    const result = await persistKitchenSettings({
      userId: user.id,
      kitchenElevationM: elevationValue,
      // Normalised inside the service, which accepts either vocabulary and
      // returns null for anything it does not recognise.
      kitchenElevationBasis: typeof kitchenElevationBasis === "string" ? kitchenElevationBasis : null,
      kitchenSettings:
        typeof kitchenSettings === "object" && kitchenSettings !== null && !Array.isArray(kitchenSettings)
          ? (kitchenSettings as Record<string, unknown>)
          : undefined,
      recipeAdjustments: Array.isArray(recipeAdjustments)
        ? (recipeAdjustments as RecipeCoreTimeAdjustment[])
        : undefined,
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
