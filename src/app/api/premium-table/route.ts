/**
 * POST /api/premium-table
 * Calculate the Alchemical Midpoint (Composite Chart) between two constitutions
 * and recommend a meal that harmonizes both.
 */
import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import type { Recipe } from "@/types/recipe";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    
    // We just check if user exists for logging/analytics conceptually, but allow unauthenticated friends
    if (user) {
      console.log(`[premium-table] User ${user.id} requested composite chart.`);
    }

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
    const query = "SELECT * FROM recipes LIMIT 100";
    const dbResult = await executeQuery(query, []);
    const recipes = dbResult.rows as Recipe[];

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
        } as Recipe;
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
