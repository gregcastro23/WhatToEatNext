/**
 * Food Diary API Route
 * GET /api/food-diary - Get food diary entries
 * POST /api/food-diary - Create a new entry
 *
 * @file src/app/api/food-diary/route.ts
 * @created 2026-02-02
 * @requires Authentication - JWT token in cookie or Authorization header
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type {
  CreateFoodDiaryEntryInput,
  FoodDiaryFilters,
} from "@/types/foodDiary";
import {
  validateRequest,
  getUserIdFromRequest,
} from "@/lib/auth/validateRequest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/food-diary
 * Get food diary entries with optional filters (authenticated)
 *
 * Query params:
 * - date: string (optional, ISO date for specific day)
 * - startDate: string (optional, ISO date)
 * - endDate: string (optional, ISO date)
 * - mealType: string (optional, comma-separated)
 * - minRating: number (optional)
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from auth token or query param (fallback for dev)
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

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

    const entries = await foodDiaryService.getEntries(
      userId,
      Object.keys(filters).length > 0 ? filters : undefined,
    );
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
      { status: 500 },
    );
  }
}

/**
 * POST /api/food-diary
 * Create a new food diary entry (authenticated)
 */
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateRequest(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();
    const { userId: bodyUserId, ...entryData } = body;

    // Use authenticated user's ID (or body userId for admin)
    const userId =
      authResult.user.roles.includes("admin") && bodyUserId
        ? bodyUserId
        : authResult.user.userId;

    // Validate required fields
    if (!entryData.foodName || !entryData.mealType || !entryData.date) {
      return NextResponse.json(
        {
          success: false,
          message: "foodName, mealType, and date are required",
        },
        { status: 400 },
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
      { status: 500 },
    );
  }
}
