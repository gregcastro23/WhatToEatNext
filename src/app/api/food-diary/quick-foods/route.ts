/**
 * Quick Foods API Route
 * GET /api/food-diary/quick-foods - Get quick food presets
 *
 * @file src/app/api/food-diary/quick-foods/route.ts
 * @created 2026-02-02
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type { QuickFoodCategory } from "@/types/foodDiary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/food-diary/quick-foods
 * Get available quick food presets
 *
 * Query params:
 * - category: string (optional, filter by category)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as QuickFoodCategory | null;

    const presets = foodDiaryService.getQuickFoodPresets(category || undefined);

    // Group by category for easier consumption
    const grouped = presets.reduce((acc, preset) => {
      if (!acc[preset.category]) {
        acc[preset.category] = [];
      }
      acc[preset.category].push(preset);
      return acc;
    }, {} as Record<string, typeof presets>);

    return NextResponse.json({
      success: true,
      presets,
      grouped,
      categories: Object.keys(grouped),
      count: presets.length,
    });
  } catch (error) {
    console.error("Get quick foods error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get quick foods" },
      { status: 500 }
    );
  }
}
