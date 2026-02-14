import { NextResponse } from "next/server";
import {
  generateDayRecommendations,
  type AstrologicalState,
  type UserPersonalizationContext,
  type DayRecommendationOptions,
} from "@/utils/menuPlanner/recommendationBridge";
import type { DayOfWeek, MealType } from "@/types/menuPlanner";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const currentWeekStart = searchParams.get("currentWeekStart");

  // For now, just return a placeholder for the current menu
  // In later phases, this would fetch the actual menu from a database
  return NextResponse.json({
    message: "GET request to menu-planner API (placeholder)",
    currentWeekStart: currentWeekStart || new Date().toISOString(),
    menu: [], // Placeholder for an empty menu
  });
}

export async function POST(request: Request) {
  const {
    action,
    dayOfWeek,
    mealTypes,
    dietaryRestrictions,
    astrologicalState,
    userPersonalizationContext,
  } = await request.json();

  if (action === "generateMealsForDay") {
    if (!dayOfWeek || !astrologicalState) {
      return NextResponse.json(
        { error: "Missing required parameters for meal generation" },
        { status: 400 },
      );
    }

    try {
      const options: DayRecommendationOptions = {
        mealTypes,
        dietaryRestrictions,
        userContext: userPersonalizationContext,
      };

      const recommendations = await generateDayRecommendations(
        dayOfWeek as DayOfWeek,
        astrologicalState as AstrologicalState,
        options,
      );

      return NextResponse.json(recommendations);
    } catch (error) {
      console.error("Error generating meals:", error);
      return NextResponse.json(
        { error: "Failed to generate meals" },
        { status: 500 },
      );
    }
  }

  // Default POST action (placeholder for saving/updating menu)
  return NextResponse.json({
    message: "POST request to menu-planner API (placeholder)",
    received: { action, dayOfWeek, mealTypes, dietaryRestrictions },
  });
}
