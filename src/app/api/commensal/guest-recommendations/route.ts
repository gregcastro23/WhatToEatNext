import { NextResponse } from "next/server";
import { z } from "zod";
import { EnhancedRecommendationService } from "@/services/EnhancedRecommendationService";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import { calculateNatalChart } from "@/services/natalChartService";
import type { ElementalProperties as AlchemyElementalProperties } from "@/types/alchemy";
import type { GroupMember, NatalChart, BirthData } from "@/types/natalChart";
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
      const first = parsed.error.issues[0];
      const path = first?.path.join(".") || "request";
      const message = first ? `${path}: ${first.message}` : "Invalid request payload";
      return NextResponse.json(
        {
          success: false,
          message,
          issues: parsed.error.issues.slice(0, 5).map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }
    const { guests } = parsed.data;

    // If the request is authenticated and the user has a saved natal chart,
    // include them as the first member so the composite is computed across
    // (you + your commensals). Auth failures are non-blocking — the guest
    // flow keeps working for anonymous users. Run the self lookup alongside
    // the guest chart computations so we don't pay for them in serial.
    const [selfMember, natalCharts] = await Promise.all([
      loadAuthenticatedSelfMember(),
      Promise.all(guests.map((g) => calculateNatalChart(g.birthData))),
    ]);

    const commensalMembers: GroupMember[] = guests.map((guest, i) => ({
      id: `commensal_${i}`,
      name: guest.name,
      relationship: "friend",
      birthData: guest.birthData,
      natalChart: natalCharts[i],
      createdAt: new Date().toISOString(),
    }));

    const groupMembers: GroupMember[] = selfMember
      ? [selfMember, ...commensalMembers]
      : commensalMembers;

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

function isCompleteBirthData(value: unknown): value is BirthData {
  if (!value || typeof value !== "object") return false;
  const b = value as Partial<BirthData>;
  return (
    typeof b.dateTime === "string" &&
    b.dateTime.length > 0 &&
    typeof b.latitude === "number" &&
    Number.isFinite(b.latitude) &&
    typeof b.longitude === "number" &&
    Number.isFinite(b.longitude)
  );
}

function isUsableNatalChart(value: unknown): value is NatalChart {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<NatalChart>;
  return (
    !!c.planetaryPositions &&
    !!c.elementalBalance &&
    !!c.alchemicalProperties
  );
}

async function loadAuthenticatedSelfMember(): Promise<GroupMember | null> {
  try {
    const { auth } = await import("@/lib/auth/auth");
    const session = await auth();
    if (!session?.user?.id) return null;

    const { userDatabase } = await import("@/services/userDatabaseService");
    const user = await userDatabase.getUserById(session.user.id);
    const birthData = user?.profile?.birthData;
    const natalChart = user?.profile?.natalChart;
    if (!isCompleteBirthData(birthData) || !isUsableNatalChart(natalChart)) {
      return null;
    }

    return {
      id: `self_${user!.id}`,
      name: user?.profile?.name?.trim() || session.user.name?.trim() || "You",
      relationship: "self",
      birthData,
      natalChart,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(
      "guest-recommendations: skipped auth user lookup —",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
