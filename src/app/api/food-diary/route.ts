/**
 * Food Diary Main API Route
 * GET  /api/food-diary - List entries for a user (with optional date filter)
 * POST /api/food-diary - Create a new food diary entry
 *
 * @file src/app/api/food-diary/route.ts
 */

import { NextResponse } from "next/server";
import { foodDiaryService } from "@/services/FoodDiaryService";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import type { CreateFoodDiaryEntryInput } from "@/types/foodDiary";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/food-diary
 * Returns food diary entries for the authenticated user.
 *
 * Query params:
 * - date: ISO date string (YYYY-MM-DD) — if provided, returns only that day's entries
 * - startDate: ISO date string — range start (inclusive)
 * - endDate:   ISO date string — range end (inclusive)
 * - userId:    override (falls back to auth session)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Prefer session auth, fall back to explicit userId param for backwards compat
    let userId = await getUserIdFromRequest(request);
    if (!userId) {
      userId = searchParams.get("userId");
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const dateParam = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let entries;
    if (dateParam) {
      // Single-day query
      entries = await foodDiaryService.getDayEntries(userId, new Date(dateParam));
    } else {
      entries = await foodDiaryService.getEntries(userId, {
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      });
    }

    // Compute basic daily summary from the returned entries
    const totalCalories = entries.reduce(
      (sum, e) => sum + ((e.nutrition as any)?.calories ?? 0),
      0,
    );
    const totalProtein = entries.reduce(
      (sum, e) => sum + ((e.nutrition as any)?.protein ?? 0),
      0,
    );
    const totalCarbs = entries.reduce(
      (sum, e) => sum + ((e.nutrition as any)?.carbs ?? 0),
      0,
    );
    const totalFat = entries.reduce(
      (sum, e) => sum + ((e.nutrition as any)?.fat ?? 0),
      0,
    );

    return NextResponse.json({
      success: true,
      entries,
      count: entries.length,
      summary: { totalCalories, totalProtein, totalCarbs, totalFat },
    });
  } catch (error) {
    console.error("Food diary GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load food diary entries" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/food-diary
 * Create a new food diary entry for the authenticated user.
 *
 * Body: CreateFoodDiaryEntryInput (with optional userId override)
 */
export async function POST(request: NextRequest) {
  try {
    // Prefer session auth, fall back to body userId for backwards compat
    let userId = await getUserIdFromRequest(request);

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    if (!userId) {
      userId = body.userId as string | null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const { userId: _uid, ...inputData } = body;
    const input = inputData as unknown as CreateFoodDiaryEntryInput;

    if (!input.foodName || !input.date || !input.mealType) {
      return NextResponse.json(
        { success: false, message: "foodName, date, and mealType are required" },
        { status: 400 },
      );
    }

    const entry = await foodDiaryService.createEntry(userId, input);

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Food diary POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create food diary entry" },
      { status: 500 },
    );
  }
}
