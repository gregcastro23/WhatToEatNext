import { NextResponse } from "next/server";
import { z } from "zod";
import { EnhancedRecommendationService } from "@/services/EnhancedRecommendationService";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import { calculateNatalChart } from "@/services/natalChartService";
import type { ElementalProperties as AlchemyElementalProperties } from "@/types/alchemy";
import type { GroupMember } from "@/types/natalChart";
import { getCuisineRecommendations } from "@/utils/cuisineRecommender";
import { getRecommendedCookingMethods } from "@/utils/recommendation/methodRecommendation";

interface CookingMethodSummary {
  method: string;
  score: number;
  reasons: string[];
}

const birthDataSchema = z
  .object({
    dateTime: z.string().min(1),
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
  })
  .passthrough();

const guestSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  birthData: birthDataSchema,
});

const bodySchema = z.object({
  guests: z.array(guestSchema).min(1, "At least one guest is required").max(12),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid request payload",
          issues: parsed.error.issues.slice(0, 5).map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }
    const { guests } = parsed.data;

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
