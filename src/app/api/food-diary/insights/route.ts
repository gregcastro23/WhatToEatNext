/**
 * Food Diary Insights API Route
 * GET /api/food-diary/insights - Get personalized nutrition insights
 *
 * @file src/app/api/food-diary/insights/route.ts
 * @created 2026-02-02
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/food-diary/insights
 * Get AI-generated nutrition insights based on food diary data for the
 * authenticated caller. The userId is resolved from the session — accepting
 * it as a query param previously let any unauthenticated client read any
 * user's diary, which was an authorization bug.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const [insights, stats] = await Promise.all([
      foodDiaryService.generateInsights(userId),
      foodDiaryService.getStats(userId),
    ]);

    // Group insights by priority and type
    const groupedInsights = {
      high: insights.filter((i) => i.priority === "high"),
      medium: insights.filter((i) => i.priority === "medium"),
      low: insights.filter((i) => i.priority === "low"),
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
      { status: 500 },
    );
  }
}
