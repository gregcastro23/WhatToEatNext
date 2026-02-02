/**
 * Food Diary Insights API Route
 * GET /api/food-diary/insights - Get personalized nutrition insights
 *
 * @file src/app/api/food-diary/insights/route.ts
 * @created 2026-02-02
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { foodDiaryService } from "@/services/FoodDiaryService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/food-diary/insights
 * Get AI-generated nutrition insights based on food diary data
 *
 * Query params:
 * - userId: string (required)
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

    const [insights, stats] = await Promise.all([
      foodDiaryService.generateInsights(userId),
      foodDiaryService.getStats(userId),
    ]);

    // Group insights by priority and type
    const groupedInsights = {
      high: insights.filter(i => i.priority === "high"),
      medium: insights.filter(i => i.priority === "medium"),
      low: insights.filter(i => i.priority === "low"),
    };

    return NextResponse.json({
      success: true,
      insights,
      groupedInsights,
      stats,
      count: insights.length,
    });
  } catch (error) {
    console.error("Get insights error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
