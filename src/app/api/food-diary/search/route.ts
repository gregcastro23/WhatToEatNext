/**
 * Food Search API Route
 * GET /api/food-diary/search - Search for foods
 *
 * @file src/app/api/food-diary/search/route.ts
 * @created 2026-02-02
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { QuickFoodCategory } from "@/types/foodDiary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/food-diary/search
 * Search for foods in presets and user favorites
 *
 * Query params:
 * - q: string (required, search query)
 * - userId: string (optional, for personalized results)
 * - limit: number (optional, default 20)
 * - category: string (optional, filter by category)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const userId = searchParams.get("userId") || "guest";
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category") as QuickFoodCategory | null;

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Search query must be at least 2 characters",
        },
        { status: 400 },
      );
    }

    const results = await foodDiaryService.searchFoods(userId, query, limit);

    // Filter by category if specified
    const filteredResults = category
      ? results.filter((r) => r.category === category)
      : results;

    return NextResponse.json({
      success: true,
      results: filteredResults,
      count: filteredResults.length,
    });
  } catch (error) {
    console.error("Food search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 },
    );
  }
}
