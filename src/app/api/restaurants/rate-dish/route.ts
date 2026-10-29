/**
 * Restaurant Dish Rating & Comment API Route
 *
 * POST /api/restaurants/rate-dish
 *   Submits a dish rating, review comment, mood tags, and optional Food Diary
 *   logging for a restaurant dish.
 *
 * GET /api/restaurants/rate-dish?restaurantId=...
 *   Retrieves recent community dish ratings and comments for a given restaurant.
 *
 * @file src/app/api/restaurants/rate-dish/route.ts
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { RestaurantDishRatingSchema } from "@/lib/validation/apiSchemas";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { FoodRating, MoodTag } from "@/types/foodDiary";
import type { MealType } from "@/types/menuPlanner";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_FOOD_RATINGS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;
function isFoodRating(val: number): val is FoodRating {
  return VALID_FOOD_RATINGS.some((r) => r === val);
}

const VALID_MOOD_TAGS = [
  "energized",
  "satisfied",
  "neutral",
  "heavy",
  "light",
  "sluggish",
  "bloated",
  "sharp",
  "foggy",
  "content",
  "craving",
  "wired",
] as const;
function isMoodTag(tag: string): tag is MoodTag {
  return VALID_MOOD_TAGS.some((m) => m === tag);
}

interface DishReviewRow {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  dish_name: string;
  user_id: string | null;
  user_name: string | null;
  rating: number;
  comment: string | null;
  mood_tags: string[];
  would_eat_again: boolean | null;
  order_id: string | null;
  liked_ingredients?: string[];
  dish_features?: string[];
  elemental_resonance?: string | null;
  created_at: string;
}

function deriveMealType(now: Date = new Date()): MealType {
  const hour = now.getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 22) return "dinner";
  return "snack";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId")?.trim();

  if (!restaurantId) {
    return NextResponse.json(
      { success: false, error: "restaurantId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const result = await executeQuery<DishReviewRow>(
      `SELECT id, restaurant_id, restaurant_name, dish_name, user_name,
              rating, comment, mood_tags, would_eat_again, liked_ingredients,
              dish_features, elemental_resonance, created_at
       FROM restaurant_dish_reviews
       WHERE restaurant_id = $1
       ORDER BY created_at DESC
       LIMIT 25`,
      [restaurantId],
    );

    return NextResponse.json(
      { success: true, reviews: result.rows },
      { status: 200 },
    );
  } catch (err) {
    _logger.error("[api/restaurants/rate-dish] GET failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve dish reviews" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const parsed = RestaurantDishRatingSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation error",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const {
    restaurantId,
    restaurantName,
    dishName,
    rating,
    comment,
    moodTags,
    wouldEatAgain,
    addToDiary = true,
    orderId,
    likedIngredients,
    dishFeatures,
    elementalResonance,
  } = parsed.data;

  const userId = await getUserIdFromRequest(request);

  let userName = "Alchemist";
  if (userId) {
    try {
      const userRes = await executeQuery<{ name: string | null }>(
        `SELECT name FROM users WHERE id = $1 LIMIT 1`,
        [userId],
      );
      if (userRes.rows[0]?.name) {
        userName = userRes.rows[0].name;
      }
    } catch {
      // ignore
    }
  }

  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    const reviewResult = await executeQuery<DishReviewRow>(
      `INSERT INTO restaurant_dish_reviews (
         id, restaurant_id, restaurant_name, dish_name, user_id, user_name,
         rating, comment, mood_tags, would_eat_again, order_id, liked_ingredients,
         dish_features, elemental_resonance, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
       RETURNING *`,
      [
        reviewId,
        restaurantId,
        restaurantName,
        dishName,
        userId ?? null,
        userName,
        rating,
        comment?.trim() || null,
        moodTags ?? [],
        typeof wouldEatAgain === "boolean" ? wouldEatAgain : null,
        orderId ?? null,
        likedIngredients ?? [],
        dishFeatures ?? [],
        elementalResonance?.trim() || null,
      ],
    );

    const [savedReview] = reviewResult.rows;

    // Optionally save to Food Diary when logged in
    let diaryEntryId: string | undefined;
    if (addToDiary && userId) {
      try {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const mealType = deriveMealType(now);

        const diaryEntry = await foodDiaryService.createEntry(userId, {
          foodName: dishName,
          foodSource: "restaurant",
          sourceId: restaurantId,
          brandName: restaurantName,
          store: restaurantName,
          date: now,
          mealType,
          time,
          serving: {
            amount: 1,
            unit: "serving",
            grams: 250,
            description: "1 restaurant serving",
          },
          quantity: 1,
          nutrition: {},
          nutritionConfidence: "low",
          notes: comment?.trim() || `Ordered from ${restaurantName}`,
        });

        if (rating || moodTags || typeof wouldEatAgain === "boolean") {
          const validRating = isFoodRating(rating) ? rating : undefined;
          const validMoods = (moodTags ?? []).filter(isMoodTag);
          await foodDiaryService.updateEntry(userId, {
            id: diaryEntry.id,
            ...(validRating !== undefined ? { rating: validRating } : {}),
            ...(validMoods.length > 0 ? { moodTags: validMoods } : {}),
            ...(typeof wouldEatAgain === "boolean" ? { wouldEatAgain } : {}),
            isFavorite: rating >= 4.5,
          });
        }

        diaryEntryId = diaryEntry.id;
      } catch (diaryErr) {
        _logger.warn("[api/restaurants/rate-dish] Food diary logging skipped:", diaryErr);
      }
    }

    // Record interaction for personalized recommendations
    if (userId) {
      try {
        const { recordInteraction } = await import(
          "@/services/userInteractionsService"
        );
        void recordInteraction({
          userId,
          type: "food_rating",
          payload: {
            restaurantId,
            restaurantName,
            dishName,
            rating,
            comment,
            moodTags,
            wouldEatAgain,
          },
        });
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully rated ${dishName} at ${restaurantName}!`,
        review: savedReview,
        diaryEntryId,
      },
      { status: 201 },
    );
  } catch (err) {
    _logger.error("[api/restaurants/rate-dish] POST failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save dish review" },
      { status: 500 },
    );
  }
}
