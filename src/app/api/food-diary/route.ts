/**
 * Food Diary API Route
 * GET /api/food-diary - Get food diary entries
 * POST /api/food-diary - Create a new entry
 *
 * @file src/app/api/food-diary/route.ts
 * @created 2026-02-02
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { CreateFoodDiaryEntryInput, FoodDiaryFilters } from "@/types/foodDiary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/food-diary
 * Get food diary entries with optional filters
 *
 * Query params:
 * - userId: string (required)
 * - date: string (optional, ISO date for specific day)
 * - startDate: string (optional, ISO date)
 * - endDate: string (optional, ISO date)
 * - mealType: string (optional, comma-separated)
 * - minRating: number (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    // Build filters from query params
    const filters: FoodDiaryFilters = {};

    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const mealTypes = searchParams.get("mealTypes");
    const minRating = searchParams.get("minRating");
    const searchQuery = searchParams.get("search");

    if (date) {
      // Single day query
      const dateObj = new Date(date);
      const entries = await foodDiaryService.getDayEntries(userId, dateObj);
      const summary = await foodDiaryService.getDailySummary(userId, dateObj);

      return NextResponse.json({
        success: true,
        entries,
        summary,
      });
    }

    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (mealTypes) filters.mealTypes = mealTypes.split(",") as any;
    if (minRating) filters.minRating = parseFloat(minRating) as any;
    if (searchQuery) filters.searchQuery = searchQuery;

    const entries = await foodDiaryService.getEntries(userId, Object.keys(filters).length > 0 ? filters : undefined);
    const stats = await foodDiaryService.getStats(userId);

    return NextResponse.json({
      success: true,
      entries,
      stats,
      count: entries.length,
    });
  } catch (error) {
    console.error("Get food diary error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get food diary entries" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/food-diary
 * Create a new food diary entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...entryData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "userId is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!entryData.foodName || !entryData.mealType || !entryData.date) {
      return NextResponse.json(
        { success: false, message: "foodName, mealType, and date are required" },
        { status: 400 }
      );
    }

    // Parse date if string
    const input: CreateFoodDiaryEntryInput = {
      ...entryData,
      date: new Date(entryData.date),
    };

    const entry = await foodDiaryService.createEntry(userId, input);

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error("Create food diary entry error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create food diary entry" },
      { status: 500 }
    );
  }
}
