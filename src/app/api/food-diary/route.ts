/**
 * Food Diary Main API Route
 * GET  /api/food-diary - List entries for a user (with optional date filter)
 * POST /api/food-diary - Create a new food diary entry
 *
 * @file src/app/api/food-diary/route.ts
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { CreateFoodDiaryEntrySchema } from "@/lib/validation/apiSchemas";
import { foodDiaryService } from "@/services/FoodDiaryService";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
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
      (sum, e) => sum + ((e.nutrition)?.calories ?? 0),
      0,
    );
    const totalProtein = entries.reduce(
      (sum, e) => sum + ((e.nutrition)?.protein ?? 0),
      0,
    );
    const totalCarbs = entries.reduce(
      (sum, e) => sum + ((e.nutrition)?.carbs ?? 0),
      0,
    );
    const totalFat = entries.reduce(
      (sum, e) => sum + ((e.nutrition)?.fat ?? 0),
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

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const parsedBody = CreateFoodDiaryEntrySchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, message: "Validation error", details: parsedBody.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    
    const inputData = parsedBody.data;

    if (!userId) {
      userId = inputData.userId ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    // We can confidently assert the type now because Zod validated the exact shape
    const { userId: _uid, ...inputForService } = inputData;
    const input = inputForService as CreateFoodDiaryEntryInput;

    const entry = await foodDiaryService.createEntry(userId, input);
    await reportQuestEventBestEffort(userId, "log_meal");
    // Meal-type-specific events allow quests like "log breakfast 3 days in a row"
    await reportQuestEventBestEffort(userId, `log_${entry.mealType}`);

    // Streak-aware events: fire log_streak_3_days / log_streak_7_days when
    // today's entry pushes the user across a threshold.
    try {
      const stats = await foodDiaryService.getStats(userId);
      const streak = stats.trackingStreak;
      if (streak === 3) {
        await reportQuestEventBestEffort(userId, "log_streak_3_days");
      } else if (streak === 7) {
        await reportQuestEventBestEffort(userId, "log_streak_7_days");
      } else if (streak === 30) {
        await reportQuestEventBestEffort(userId, "log_streak_30_days");
      }
    } catch {
      // Stats/streak failures should not break entry creation.
    }

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Food diary POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create food diary entry" },
      { status: 500 },
    );
  }
}
