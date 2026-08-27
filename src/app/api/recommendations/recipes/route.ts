import { NextResponse } from "next/server";
import { getCachedHistoricalStats } from "@/services/HistoricalStatsService";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import type { ElementalProperties } from "@/types/recipe";
import { projectZScoreTarget } from "@/utils/enhancedCompatibilityScoring";
import { createLogger } from "@/utils/logger";

const logger = createLogger("api:recommendations:recipes");

export const dynamic = "force-dynamic";

interface ExtendedRecipeModel {
  id?: string;
  name?: string;
  cuisine?: string | null;
  details?: {
    cuisine?: string;
  };
  classifications?: {
    cookingMethods?: string[];
  };
  cookingMethods?: string[];
  cookingMethod?: string | string[];
  elementalProperties?: ElementalProperties;
  alchemicalProperties?: unknown;
  thermodynamicProperties?: {
    heat?: number;
    entropy?: number;
    reactivity?: number;
  };
  [key: string]: unknown;
}

interface ScoredRecipeResponse {
  id?: string;
  name?: string;
  cuisine?: string | null;
  matchScore: number;
  elementalProperties?: ElementalProperties;
  alchemicalProperties?: unknown;
  thermodynamicProperties: {
    heat: number;
    entropy: number;
    reactivity: number;
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const methodId = searchParams.get("method");
    const heatStr = searchParams.get("heat");
    const entropyStr = searchParams.get("entropy");
    const reactivityStr = searchParams.get("reactivity");

    if (!methodId) {
      return NextResponse.json({ success: false, error: "method is required" }, { status: 400 });
    }

    const heat = heatStr ? parseFloat(heatStr) : 0.5;
    const entropy = entropyStr ? parseFloat(entropyStr) : 0.5;
    const reactivity = reactivityStr ? parseFloat(reactivityStr) : 0.5;

    // Fetch all recipes using the established pattern
    const recipes = (await LocalRecipeService.getAllRecipes()) as ExtendedRecipeModel[];

    // Filter recipes by cooking method
    const matchingRecipes = recipes.filter((r) => {
      const methods: string[] = [];

      if (Array.isArray(r.classifications?.cookingMethods)) {
        for (const m of r.classifications.cookingMethods) {
          if (typeof m === "string") {
            methods.push(m.toLowerCase());
          }
        }
      }
      if (Array.isArray(r.cookingMethods)) {
        for (const m of r.cookingMethods) {
          if (typeof m === "string") {
            methods.push(m.toLowerCase());
          }
        }
      }
      if (typeof r.cookingMethod === "string") {
        methods.push(r.cookingMethod.toLowerCase());
      } else if (Array.isArray(r.cookingMethod)) {
        for (const m of r.cookingMethod) {
          if (typeof m === "string") {
            methods.push(m.toLowerCase());
          }
        }
      }

      const normalizedMethodId = methodId.toLowerCase().replace(/_/g, "-");
      // Look for fuzzy match within the array of methods assigned to recipe
      return methods.some((m) => {
        const nMethod = m.replace(/_/g, "-");
        return (
          nMethod === normalizedMethodId ||
          nMethod.includes(normalizedMethodId) ||
          normalizedMethodId.includes(nMethod)
        );
      });
    });

    // Score recipes based on thermodynamic alignment to the live moment
    const historicalStats = await getCachedHistoricalStats();
    const metrics = historicalStats?.metrics;

    const projectedHeatTarget = projectZScoreTarget(heat, metrics?.heat, "heat");
    const projectedEntropyTarget = projectZScoreTarget(entropy, metrics?.entropy, "entropy");
    const projectedReactivityTarget = projectZScoreTarget(reactivity, metrics?.reactivity, "reactivity");

    const scoredRecipes: ScoredRecipeResponse[] = matchingRecipes.map((recipe) => {
      const rHeat = recipe.thermodynamicProperties?.heat ?? 0.5;
      const rEntropy = recipe.thermodynamicProperties?.entropy ?? 0.5;
      const rReactivity = recipe.thermodynamicProperties?.reactivity ?? 0.5;

      const dist =
        Math.abs(rHeat - projectedHeatTarget) +
        Math.abs(rEntropy - projectedEntropyTarget) +
        Math.abs(rReactivity - projectedReactivityTarget);
      const matchScore = Math.max(0, 100 - (dist / 3) * 100);

      // We'll also return elemental properties for display
      return {
        id: recipe.id,
        name: recipe.name,
        cuisine: recipe.cuisine ?? recipe.details?.cuisine ?? null,
        matchScore,
        elementalProperties: recipe.elementalProperties,
        alchemicalProperties: recipe.alchemicalProperties,
        thermodynamicProperties: {
          heat: rHeat,
          entropy: rEntropy,
          reactivity: rReactivity,
        },
      };
    });

    // Sort descending by match score
    scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 5
    return NextResponse.json({ success: true, recipes: scoredRecipes.slice(0, 5) });
  } catch (error) {
    logger.error("[recommendations/recipes] Error fetching aligned recipes", { error });
    return NextResponse.json({ success: false, error: "Failed to fetch aligned recipes" }, { status: 500 });
  }
}

