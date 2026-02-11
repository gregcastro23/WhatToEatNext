/**
 * Personalized Recommendations API Route
 * POST /api/personalized-recommendations
 *
 * Generates personalized cuisine/recipe recommendations based on:
 * - User's natal chart (from birth data)
 * - Current moment's chart (planetary positions)
 * - Chart comparison and harmony analysis
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { userDatabase } from "@/services/userDatabaseService";
import {
  compareCharts,
  calculateMomentChart,
} from "@/services/ChartComparisonService";
import type { ChartComparison } from "@/services/ChartComparisonService";
import type { NatalChart } from "@/types/natalChart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface PersonalizedRecommendationRequest {
  userId?: string;
  email?: string;
  includeChartAnalysis?: boolean;
  datetime?: string; // Optional: get recommendations for a specific time
}

interface PersonalizedRecommendationResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: string;
    userName: string;
    chartComparison: ChartComparison;
    recommendations: {
      favorableElements: string[];
      challengingElements: string[];
      harmonicPlanets: string[];
      insights: string[];
      suggestedCuisines: string[];
      suggestedCookingMethods: string[];
    };
  };
}

/**
 * Map elements to favorable cuisines
 */
function getElementCuisines(elements: string[]): string[] {
  const cuisineMap: Record<string, string[]> = {
    Fire: ["Mexican", "Indian", "Thai", "Spicy", "BBQ", "Grilled"],
    Water: ["Japanese", "Seafood", "Soups", "Stews", "Oceanic"],
    Earth: ["Italian", "Mediterranean", "Hearty", "Root Vegetables", "Rustic"],
    Air: ["French", "Light", "Fusion", "Salads", "Delicate"],
  };

  const cuisines: string[] = [];
  elements.forEach((element) => {
    const elementCuisines = cuisineMap[element];
    if (elementCuisines) {
      cuisines.push(...elementCuisines);
    }
  });

  // Return unique cuisines
  return Array.from(new Set(cuisines));
}

/**
 * Map planets to cooking methods
 */
function getPlanetCookingMethods(planets: string[]): string[] {
  const methodMap: Record<string, string[]> = {
    Sun: ["Grilling", "Roasting", "Baking"],
    Moon: ["Steaming", "Poaching", "Simmering"],
    Mercury: ["Quick-frying", "Stir-frying", "Flash cooking"],
    Venus: ["Sautéing", "Glazing", "Caramelizing"],
    Mars: ["High-heat searing", "Charring", "Broiling"],
    Jupiter: ["Slow-roasting", "Braising", "Abundance cooking"],
    Saturn: ["Fermentation", "Preservation", "Traditional methods"],
    Uranus: ["Molecular gastronomy", "Innovative techniques", "Experimental"],
    Neptune: ["Infusion", "Sous vide", "Delicate steaming"],
    Pluto: ["Transformation techniques", "Deep frying", "Reduction"],
  };

  const methods: string[] = [];
  planets.forEach((planet) => {
    const planetMethods = methodMap[planet];
    if (planetMethods) {
      methods.push(...planetMethods);
    }
  });

  return Array.from(new Set(methods));
}

export async function POST(request: NextRequest) {
  try {
    const body: PersonalizedRecommendationRequest = await request.json();
    const { userId, email, includeChartAnalysis = true, datetime } = body;

    // Validate required fields
    if (!userId && !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Either userId or email is required",
        } as PersonalizedRecommendationResponse,
        { status: 400 },
      );
    }

    // Get user from database
    let user;
    if (userId) {
      user = await userDatabase.getUserById(userId);
    } else if (email) {
      user = await userDatabase.getUserByEmail(email);
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        } as PersonalizedRecommendationResponse,
        { status: 404 },
      );
    }

    // Check if user has completed onboarding (has natal chart)
    if (!user.profile.natalChart) {
      return NextResponse.json(
        {
          success: false,
          message:
            "User has not completed onboarding. Please complete onboarding to get personalized recommendations.",
        } as PersonalizedRecommendationResponse,
        { status: 400 },
      );
    }

    const natalChart: NatalChart = user.profile.natalChart;

    // Calculate moment chart (for specified time or current moment)
    const targetDateTime = datetime ? new Date(datetime) : undefined;
    const momentChart = await calculateMomentChart(targetDateTime);

    // Compare charts
    const chartComparison = await compareCharts(natalChart, momentChart);

    // Generate recommendations based on chart comparison
    const favorableElements = chartComparison.insights.favorableElements.map(
      (e) => e.toString(),
    );
    const challengingElements =
      chartComparison.insights.challengingElements.map((e) => e.toString());
    const harmonicPlanets = chartComparison.insights.harmonicPlanets.map((p) =>
      p.toString(),
    );

    const suggestedCuisines = getElementCuisines(favorableElements);
    const suggestedCookingMethods = getPlanetCookingMethods(harmonicPlanets);

    const response: PersonalizedRecommendationResponse = {
      success: true,
      data: {
        userId: user.id,
        userName: user.profile.name || "User",
        chartComparison: includeChartAnalysis ? chartComparison : ({} as any),
        recommendations: {
          favorableElements,
          challengingElements,
          harmonicPlanets,
          insights: chartComparison.insights.recommendations,
          suggestedCuisines: suggestedCuisines.slice(0, 8), // Top 8
          suggestedCookingMethods: suggestedCookingMethods.slice(0, 6), // Top 6
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Personalized recommendations error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate personalized recommendations",
      } as PersonalizedRecommendationResponse,
      { status: 500 },
    );
  }
}
