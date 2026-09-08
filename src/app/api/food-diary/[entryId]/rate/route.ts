/**
 * Food Diary Rating API Route
 * POST /api/food-diary/[entryId]/rate - Rate a food entry
 *
 * @file src/app/api/food-diary/[entryId]/rate/route.ts
 * @created 2026-02-02
 */

import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { FoodDiaryRatingSchema } from "@/lib/validation/apiSchemas";
import { foodDiaryService } from "@/services/FoodDiaryService";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import type { FoodRating, MoodTag } from "@/types/foodDiary";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ entryId: string }>;
}

/**
 * POST /api/food-diary/[entryId]/rate
 * Rate a food diary entry and add mood tags
 *
 * Body:
 * - userId: string (required)
 * - rating: number (required, 0-5 in 0.5 increments)
 * - moodTags: string[] (optional)
 * - wouldEatAgain: boolean (optional)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { entryId } = await params;
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const parsed = FoodDiaryRatingSchema.safeParse(rawBody);
    if (!parsed.success) {
      const isMissingUserId = parsed.error.issues.some((i) => i.path[0] === "userId");
      if (isMissingUserId) {
        return NextResponse.json(
          { success: false, message: "userId is required" },
          { status: 400 },
        );
      }
      const ratingIssue = parsed.error.issues.find((i) => i.path[0] === "rating");
      if (ratingIssue) {
        return NextResponse.json(
          { success: false, message: ratingIssue.message },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { userId, rating, moodTags, wouldEatAgain } = parsed.data;

    const entry = await foodDiaryService.rateEntry(
      userId,
      entryId,
      rating as FoodRating,
      moodTags as MoodTag[],
    );

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Entry not found or not authorized" },
        { status: 404 },
      );
    }

    // Track interaction for personalization (Data Hose injection)
    try {
      const { recordInteraction } = await import("@/services/userInteractionsService");
      void recordInteraction({
        userId,
        type: "food_rating",
        payload: {
          entryId,
          foodName: entry.foodName,
          rating,
          moodTags,
        },
      }).catch((err) => _logger.error("Failed to record food_rating interaction:", err));
    } catch (err) {
      console.warn("Food rating interaction tracking skipped:", err);
    }

    // Update wouldEatAgain if provided
    if (wouldEatAgain !== undefined) {
      await foodDiaryService.updateEntry(userId, {
        id: entryId,
        wouldEatAgain,
      });
    }

    await reportQuestEventBestEffort(userId, "rate_food");
    if (moodTags && Array.isArray(moodTags) && moodTags.length > 0) {
      await reportQuestEventBestEffort(userId, "log_mood_tag");
    }

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    _logger.error("Rate food diary entry error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to rate entry" },
      { status: 500 },
    );
  }
}
