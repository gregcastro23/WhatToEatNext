/**
 * POST /api/premium-table
 * Calculate the Alchemical Midpoint (Composite Chart) between two constitutions
 * and recommend a meal that harmonizes both.
 */
import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import { subscriptionService } from "@/services/subscriptionService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PREMIUM_TABLE_LIMIT = { window: 60_000, max: 10, bucket: "premium-table" };

export async function POST(request: NextRequest) {
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

    const subscription = await subscriptionService.getUserSubscription(user.id);
    if (!subscription || subscription.tier !== "premium") {
      return NextResponse.json(
        {
          success: false,
          error: "Premium subscription required.",
          upgradeUrl: "/upgrade",
        },
        { status: 402 },
      );
    }

    console.log(`[premium-table] Premium user ${user.id} requested composite chart.`);

    const body = await request.json().catch(() => ({}));
    const { hostData, friendData } = body;

    if (!hostData || !friendData) {
      return NextResponse.json({ success: false, error: "Missing birth data for Host or Friend." }, { status: 400 });
    }

    const groupMembers = [
      { id: "host", name: "Host", natalChart: hostData },
      { id: "friend", name: "Friend", natalChart: friendData }
    ];

    const compositeChart = calculateCompositeNatalChart(groupMembers as any, "premium-table-session");

    // Fetch all recipes to score against the composite chart
    const { LocalRecipeService } = await import("@/services/LocalRecipeService");
    const allRecipes = await LocalRecipeService.getAllRecipes();
    const recipes = allRecipes.slice(0, 100);

    // Score recipes against the composite chart
    const scoredRecipes = recipes.map((r) => {
        // Simple composite harmony score
        const rProp: any = r.alchemical_properties || { Spirit: 25, Essence: 25, Matter: 25, Substance: 25 };
        const cProp = compositeChart.alchemicalProperties;
        
        const harmony = 100 - (
            Math.abs((rProp.Spirit || 0) - cProp.Spirit) +
            Math.abs((rProp.Essence || 0) - cProp.Essence) +
            Math.abs((rProp.Matter || 0) - cProp.Matter) +
            Math.abs((rProp.Substance || 0) - cProp.Substance)
        );
        
        return {
            ...r,
            score: harmony,
            planetaryReason: `Harmonizes perfectly with the Alchemical Midpoint (${compositeChart.dominantElement} dominant).`
        };
    });

    scoredRecipes.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    return NextResponse.json({
      success: true,
      compositeChart,
      recipes: scoredRecipes.slice(0, 3) // Top 3 recommendations for the table
    });
  } catch (error) {
    console.error("[premium-table] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to calculate Alchemical Midpoint." }, { status: 500 });
  }
}
