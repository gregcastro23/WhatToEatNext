import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import {
  menuPutBodySchema,
  savedMenuApiDataSchema,
} from "@/lib/menu-planner/schemas";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import type { DailyNutritionTotals, DayOfWeek } from "@/types";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const weekStartDateParam = searchParams.get("weekStartDate");
    if (!weekStartDateParam) {
      return NextResponse.json(
        { success: false, message: "weekStartDate is required" },
        { status: 400 },
      );
    }

    const weekStartDate = new Date(weekStartDateParam);
    if (Number.isNaN(weekStartDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid weekStartDate" },
        { status: 400 },
      );
    }

    const menu = await menuPersistenceService.getMenu(userId, weekStartDate);
    const payload = savedMenuApiDataSchema.parse({ success: true, menu });
    return NextResponse.json(payload);
  } catch (error) {
    _logger.error("Menu persistence GET error", error);
    return NextResponse.json(
      { success: false, message: "Failed to load weekly menu" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const parsedBody = menuPutBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 },
      );
    }
    const {
      weekStartDate,
      meals,
      nutritionalTotals,
      groceryList,
      inventory,
      weeklyBudget,
    } = parsedBody.data;

    const persisted = await menuPersistenceService.upsertMenu(userId, {
      weekStartDate,
      meals,
      // UpsertMenuInput/PersistedWeeklyMenu/WeeklyMenu all declare a *total*
      // Record; widening is load-bearing until those three become Partial.
      nutritionalTotals: nutritionalTotals as unknown as Record<DayOfWeek, DailyNutritionTotals>,
      groceryList,
      inventory,
      weeklyBudget,
    });

    return NextResponse.json({ success: true, menu: persisted });
  } catch (error) {
    _logger.error("Menu persistence PUT error", error);
    return NextResponse.json(
      { success: false, message: "Failed to save weekly menu" },
      { status: 500 },
    );
  }
}
