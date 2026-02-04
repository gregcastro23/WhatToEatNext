/**
 * Food Diary Rating API Route
 * POST /api/food-diary/[entryId]/rate - Rate a food entry
 *
 * @file src/app/api/food-diary/[entryId]/rate/route.ts
 * @created 2026-02-02
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { FoodRating, MoodTag } from "@/types/foodDiary";

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
    const body = await request.json();
    const { userId, rating, moodTags, wouldEatAgain } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 },
      );
    }

    if (rating === undefined || rating < 0 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "rating must be between 0 and 5" },
        { status: 400 },
      );
    }

    // Validate rating is in 0.5 increments
    if ((rating * 2) % 1 !== 0) {
      return NextResponse.json(
        { success: false, message: "rating must be in 0.5 increments" },
        { status: 400 },
      );
    }

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

    // Update wouldEatAgain if provided
    if (wouldEatAgain !== undefined) {
      await foodDiaryService.updateEntry(userId, {
        id: entryId,
        wouldEatAgain,
      });
    }

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("Rate food diary entry error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to rate entry" },
      { status: 500 },
    );
  }
}
