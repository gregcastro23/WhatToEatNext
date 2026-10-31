/**
 * POST /api/adept-table
 * Calculate the Alchemical Midpoint (Composite Chart) between two constitutions
 * and recommend a meal that harmonizes both.
 */
import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { collectOrRefuse, quoteFeature } from "@/lib/economy/featureCharge";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { chartQuantities, rankByAffinity, recipeQuantities } from "@/lib/recipes/alchemicalMatch";
import { loadCanonicalCatalog, loadStaticTwinBridge, withAuthoredFactsAll } from "@/lib/recipes/recipeRefResolver";
import { AdeptTableRequestSchema } from "@/lib/validation/apiSchemas";
import { calculateCompositeNatalChart } from "@/services/groupNatalChartService";
import type { GroupMember } from "@/types/natalChart";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PREMIUM_TABLE_LIMIT = { window: 60_000, max: 10, bucket: "premium-table" };

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

    // The Alchemical Midpoint was a premium feature. The tier is retired, so it
    // now costs ESMS per calculation, priced on the caller's chart and the
    // current sky and collected once the midpoint is computed (featureCharge).

    _logger.info(`[adept-table] User ${user.id} requested composite chart.`);

    const rawBody: unknown = await request.json().catch(() => null);
    if (rawBody === null || typeof rawBody !== "object") {
      return NextResponse.json({ success: false, error: "Missing birth data for Host or Friend." }, { status: 400 });
    }

    const parsed = AdeptTableRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Missing birth data for Host or Friend." }, { status: 400 });
    }

    const { hostData, friendData } = parsed.data;

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

    const target = chartQuantities(compositeChart.alchemicalProperties);
    if (!target) {
      return NextResponse.json(
        { success: false, error: "The composite chart has no alchemical quantities to match." },
        { status: 422 },
      );
    }

    // Rank the whole catalog by how closely each recipe's alchemical profile
    // matches the midpoint. The static catalog carries every recipe's ESMS
    // (the live rows may not), so a recipe without its own borrows its static
    // twin's; one with neither is not ranked.
    const [catalog, bridge] = await Promise.all([loadCanonicalCatalog(), loadStaticTwinBridge()]);
    const ranked = rankByAffinity(
      catalog,
      target,
      (recipe) => recipeQuantities(recipe) ?? recipeQuantities(bridge.staticRecipeFor(String(recipe.id))),
    );
    const scoredRecipes = ranked.map(({ recipe, score }) => ({
      ...recipe,
      score,
      planetaryReason: `Harmonizes perfectly with the Alchemical Midpoint (${compositeChart.dominantElement} dominant).`,
    }));
    // Top 3 for the table, with their authored times and meal (not the live placeholders)
    const tableRecipes = await withAuthoredFactsAll(scoredRecipes.slice(0, 3));

    const unpaid = await collectOrRefuse(user.id, await quoteFeature(user, "alchemicalMidpoint"));
    if (unpaid) return unpaid;

    return NextResponse.json({ success: true, compositeChart, recipes: tableRecipes });
  } catch (error) {
    _logger.error("[premium-table] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to calculate Alchemical Midpoint." }, { status: 500 });
  }
}
