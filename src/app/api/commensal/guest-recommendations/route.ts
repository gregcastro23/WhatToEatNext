import { NextResponse } from "next/server";
import { calculateNatalChart } from "@/services/natalChartService";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import { EnhancedRecommendationService } from "@/services/EnhancedRecommendationService";
import { getCuisineRecommendations } from "@/utils/cuisineRecommender";
import { getRecommendedCookingMethods } from "@/utils/recommendation/methodRecommendation";
import type { ElementalProperties as AlchemyElementalProperties } from "@/types/alchemy";
import type { BirthData, GroupMember } from "@/types/natalChart";

interface GuestInput {
  name: string;
  birthData: BirthData;
}

interface CookingMethodSummary {
  method: string;
  score: number;
  reasons: string[];
}

function isValidBirthData(b: unknown): b is BirthData {
  if (!b || typeof b !== "object") return false;
  const data = b as Record<string, unknown>;
  return (
    typeof data.dateTime === "string" &&
    data.dateTime.length > 0 &&
    typeof data.latitude === "number" &&
    Number.isFinite(data.latitude) &&
    typeof data.longitude === "number" &&
    Number.isFinite(data.longitude)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guests } = body as { guests?: GuestInput[] };

    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one guest is required" },
        { status: 400 },
      );
    }

    for (const [i, guest] of guests.entries()) {
      if (!guest?.name || typeof guest.name !== "string") {
        return NextResponse.json(
          { success: false, message: `Guest ${i + 1}: name is required` },
          { status: 400 },
        );
      }
      if (!isValidBirthData(guest.birthData)) {
        return NextResponse.json(
          {
            success: false,
            message: `Guest ${i + 1} (${guest.name}): birthData must include dateTime (ISO string), latitude, and longitude`,
          },
          { status: 400 },
        );
      }
    }

    // Calculate natal charts for all guests in parallel.
    const natalCharts = await Promise.all(
      guests.map((g) => calculateNatalChart(g.birthData)),
    );

    const groupMembers: GroupMember[] = guests.map((guest, i) => ({
      id: `guest_${i}`,
      name: guest.name,
      relationship: "friend",
      birthData: guest.birthData,
      natalChart: natalCharts[i],
      createdAt: new Date().toISOString(),
    }));

    // Composite chart for the whole group.
    const compositeChart = calculateCompositeNatalChart(
      groupMembers,
      "guest-session",
    );

    // Reconstruct the elemental balance into the alchemy.ts shape so it
    // satisfies `getCuisineRecommendations` without an `as any` cast. The
    // celestial.ts and alchemy.ts variants are structurally identical for
    // the four base elements; rebuilding the literal pins the types.
    const elementalForCuisines: AlchemyElementalProperties = {
      Fire: compositeChart.elementalBalance.Fire,
      Water: compositeChart.elementalBalance.Water,
      Earth: compositeChart.elementalBalance.Earth,
      Air: compositeChart.elementalBalance.Air,
    };
    const cuisineRecs = getCuisineRecommendations(elementalForCuisines);

    // Score every cooking method against the composite elemental signature.
    // The recommender returns its results pre-sorted by score (desc).
    const rawMethods = getRecommendedCookingMethods(elementalForCuisines);
    const cookingMethods: CookingMethodSummary[] = rawMethods
      .slice(0, 5)
      .map((m) => ({
        method: m.name,
        score: Math.max(0, Math.min(1, m.score)),
        reasons: m.reasons,
      }));

    // Score the entire recipe catalog against the composite chart.
    const recipeResult =
      await EnhancedRecommendationService.getRecommendationsForComposite(
        compositeChart,
        5,
      );

    return NextResponse.json({
      success: true,
      compositeChart,
      cuisineRecs,
      cookingMethods,
      recipes: recipeResult.recommendations,
      groupMembers,
    });
  } catch (error) {
    console.error("Guest recommendations error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate recommendations" },
      { status: 500 },
    );
  }
}
