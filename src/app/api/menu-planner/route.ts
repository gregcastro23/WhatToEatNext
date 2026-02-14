// src/app/api/menu-planner/route.ts
import { NextResponse } from "next/server";
import {
  generateDayRecommendations,
  type AstrologicalState,
  type UserPersonalizationContext,
  type DayRecommendationOptions,
} from "@/utils/menuPlanner/recommendationBridge";
import type { DayOfWeek } from "@/types/menuPlanner";
import type { NatalChart } from "@/types/natalChart";

// Define the structure of the incoming POST request body
interface MenuPlannerRequestBody {
  userPreferences: {
    dietaryRestrictions?: string[];
    preferredCuisines?: string[];
    excludeIngredients?: string[];
  };
  availableIngredients?: string[]; // This will be used in a future phase
  currentChart: AstrologicalState;
  natalChart?: NatalChart; // For personalization
}

export async function POST(request: Request) {
  try {
    const {
      userPreferences,
      availableIngredients,
      currentChart,
      natalChart,
    }: MenuPlannerRequestBody = await request.json();

    if (!userPreferences || !currentChart) {
      return NextResponse.json(
        { error: "Missing required parameters: userPreferences and currentChart are required." },
        { status: 400 },
      );
    }

    const dayOfWeek = new Date().getDay() as DayOfWeek;

    const userContext: UserPersonalizationContext | undefined = natalChart
      ? { natalChart, prioritizeHarmony: true }
      : undefined;

    const options: DayRecommendationOptions = {
      dietaryRestrictions: userPreferences.dietaryRestrictions,
      preferredCuisines: userPreferences.preferredCuisines,
      excludeIngredients: userPreferences.excludeIngredients,
      userContext,
    };

    const recommendations = await generateDayRecommendations(
      dayOfWeek,
      currentChart,
      options,
    );

    if (!recommendations || recommendations.length === 0) {
      return NextResponse.json(
        { message: "No recommendations could be generated for the given criteria." },
        { status: 200 },
      );
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error in menu-planner API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to generate menu recommendations.", details: errorMessage },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
    return NextResponse.json({ message: "This endpoint is for POST requests to generate menu plans." }, { status: 405 });
}
