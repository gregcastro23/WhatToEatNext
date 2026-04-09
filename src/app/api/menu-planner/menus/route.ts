import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { menuPersistenceService } from "@/services/menuPersistenceService";
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
    return NextResponse.json({ success: true, menu });
  } catch (error) {
    console.error("Menu persistence GET error:", error);
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

    const body = await request.json();
    const weekStartDate = new Date(body?.weekStartDate);
    if (!body || Number.isNaN(weekStartDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 },
      );
    }

    const persisted = await menuPersistenceService.upsertMenu(userId, {
      weekStartDate,
      meals: Array.isArray(body.meals) ? body.meals : [],
      nutritionalTotals: body.nutritionalTotals || {},
      groceryList: Array.isArray(body.groceryList) ? body.groceryList : [],
      inventory: Array.isArray(body.inventory) ? body.inventory : [],
      weeklyBudget:
        typeof body.weeklyBudget === "number" || body.weeklyBudget === null
          ? body.weeklyBudget
          : null,
    });

    return NextResponse.json({ success: true, menu: persisted });
  } catch (error) {
    console.error("Menu persistence PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save weekly menu" },
      { status: 500 },
    );
  }
}
