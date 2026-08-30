import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import type { AlchemicalProperties } from "@/types/celestial";
import type { GroupMember, NatalChart } from "@/types/natalChart";
import { isObject } from "@/utils/typeGuards";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PREMIUM_TABLE_LIMIT = { window: 60_000, max: 10, bucket: "premium-table" };

interface PremiumTableRequestBody {
  hostData?: NatalChart;
  friendData?: NatalChart;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rl = await rateLimit(request, PREMIUM_TABLE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const user = await getDatabaseUserFromRequest(request).catch(() => null);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to compute composite charts." },
        { status: 401 },
      );
    }

    _logger.info(`[premium-table] User ${user.id} requested composite chart.`);

    const rawBody: unknown = await request.json().catch(() => ({}));
    const body = (isObject(rawBody) ? rawBody : {}) as PremiumTableRequestBody;
    const { hostData, friendData } = body;

    if (!hostData || !friendData) {
      return NextResponse.json({ success: false, error: "Missing birth data for Host or Friend." }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const groupMembers: GroupMember[] = [
      {
        id: "host",
        name: "Host",
        birthData: hostData.birthData,
        natalChart: hostData,
        createdAt: nowIso,
      },
      {
        id: "friend",
        name: "Friend",
        birthData: friendData.birthData,
        natalChart: friendData,
        createdAt: nowIso,
      },
    ];

    const compositeChart = calculateCompositeNatalChart(groupMembers, "premium-table-session");

    // Fetch all recipes to score against the composite chart
    const { LocalRecipeService } = await import("@/services/LocalRecipeService");
    const allRecipes = await LocalRecipeService.getAllRecipes();
    const recipes = allRecipes.slice(0, 100);

    // Score recipes against the composite chart
    const scoredRecipes = recipes.map((r) => {
      // Simple composite harmony score
      const rProp = (r.alchemical_properties as Partial<AlchemicalProperties> | undefined) ?? {
        Spirit: 25,
        Essence: 25,
        Matter: 25,
        Substance: 25,
      };
      const cProp = compositeChart.alchemicalProperties;

      const harmony = 100 - (
        Math.abs((rProp.Spirit ?? 0) - cProp.Spirit) +
        Math.abs((rProp.Essence ?? 0) - cProp.Essence) +
        Math.abs((rProp.Matter ?? 0) - cProp.Matter) +
        Math.abs((rProp.Substance ?? 0) - cProp.Substance)
      );

      return {
        ...r,
        score: harmony,
        planetaryReason: `Harmonizes perfectly with the Alchemical Midpoint (${compositeChart.dominantElement} dominant).`,
      };
    });

    scoredRecipes.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      compositeChart,
      recipes: scoredRecipes.slice(0, 3), // Top 3 recommendations for the table
    });
  } catch (error) {
    _logger.error("[premium-table] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to calculate Alchemical Midpoint." }, { status: 500 });
  }
}
