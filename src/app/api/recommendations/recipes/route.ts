import { NextResponse } from "next/server";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import { getCachedHistoricalStats } from "@/services/HistoricalStatsService";
import { projectZScoreTarget } from "@/utils/enhancedCompatibilityScoring";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const methodId = searchParams.get('method');
        const heatStr = searchParams.get('heat');
        const entropyStr = searchParams.get('entropy');
        const reactivityStr = searchParams.get('reactivity');

        if (!methodId) {
            return NextResponse.json({ success: false, error: 'method is required' }, { status: 400 });
        }

        const heat = heatStr ? parseFloat(heatStr) : 0.5;
        const entropy = entropyStr ? parseFloat(entropyStr) : 0.5;
        const reactivity = reactivityStr ? parseFloat(reactivityStr) : 0.5;

        // Fetch all recipes using the established pattern
        const recipes = await LocalRecipeService.getAllRecipes();

        // Filter recipes by cooking method
        const matchingRecipes = recipes.filter(r => {
            const rAsAny = r as any;
            const methods: string[] = [];

            if (Array.isArray(rAsAny.classifications?.cookingMethods)) {
                methods.push(...rAsAny.classifications.cookingMethods.map((m: any) => String(m).toLowerCase()));
            }
            if (Array.isArray(rAsAny.cookingMethods)) {
                methods.push(...rAsAny.cookingMethods.map((m: any) => String(m).toLowerCase()));
            }
            if (rAsAny.cookingMethod) {
                methods.push(String(rAsAny.cookingMethod).toLowerCase());
            }

            const normalizedMethodId = methodId.toLowerCase().replace(/_/g, '-');
            // Look for fuzzy match within the array of methods assigned to recipe
            return methods.some(m => {
                const nMethod = m.replace(/_/g, '-');
                return nMethod === normalizedMethodId || nMethod.includes(normalizedMethodId) || normalizedMethodId.includes(nMethod);
            });
        });

        // Score recipes based on thermodynamic alignment to the live moment
        const historicalStats = await getCachedHistoricalStats();
        const metrics = historicalStats?.metrics;

        const projectedHeatTarget = projectZScoreTarget(heat, metrics?.heat);
        const projectedEntropyTarget = projectZScoreTarget(entropy, metrics?.entropy);
        const projectedReactivityTarget = projectZScoreTarget(reactivity, metrics?.reactivity);

        const scoredRecipes = matchingRecipes.map(recipe => {
            const rAsAny = recipe as any;
            const rHeat = rAsAny.thermodynamicProperties?.heat ?? 0.5;
            const rEntropy = rAsAny.thermodynamicProperties?.entropy ?? 0.5;
            const rReactivity = rAsAny.thermodynamicProperties?.reactivity ?? 0.5;

            const dist = Math.abs(rHeat - projectedHeatTarget) + Math.abs(rEntropy - projectedEntropyTarget) + Math.abs(rReactivity - projectedReactivityTarget);
            const matchScore = Math.max(0, 100 - (dist / 3) * 100);

            // We'll also return elemental properties for display
            return {
                id: recipe.id,
                name: recipe.name,
                cuisine: rAsAny.cuisine || rAsAny.details?.cuisine,
                matchScore,
                elementalProperties: recipe.elementalProperties,
                alchemicalProperties: rAsAny.alchemicalProperties,
                thermodynamicProperties: {
                    heat: rHeat,
                    entropy: rEntropy,
                    reactivity: rReactivity,
                }
            };
        });

        // Sort descending by match score
        scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);

        // Return top 5
        return NextResponse.json({ success: true, recipes: scoredRecipes.slice(0, 5) });
    } catch (error) {
        console.error("[recommendations/recipes] Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch aligned recipes' }, { status: 500 });
    }
}
