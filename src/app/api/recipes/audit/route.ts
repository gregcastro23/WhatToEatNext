/**
 * Recipe Audit API Endpoint
 * GET /api/recipes/audit
 *
 * Returns audit results for all recipes in the system
 */

import { NextResponse } from "next/server";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import {
  auditRecipeCompleteness,
  formatAuditSummary,
} from "@/utils/recipeSearchEngine";
import { createLogger } from "@/utils/logger";

const logger = createLogger("RecipeAuditAPI");

export async function GET() {
  try {
    logger.info("Running recipe audit...");

    // Get all recipes
    const recipes = await LocalRecipeService.getAllRecipes();
    logger.info(`Loaded ${recipes.length} recipes`);

    // Run the audit
    const auditResult = auditRecipeCompleteness(recipes);

    // Calculate completion rate
    const completionRate =
      auditResult.totalRecipes > 0
        ? (auditResult.completeRecipes / auditResult.totalRecipes) * 100
        : 0;

    // Group incomplete recipes by cuisine
    const byCuisine: Record<
      string,
      { count: number; issues: Record<string, number> }
    > = {};
    for (const recipe of auditResult.incompleteRecipes) {
      const cuisine = recipe.cuisine || "Unknown";
      if (!byCuisine[cuisine]) {
        byCuisine[cuisine] = { count: 0, issues: {} };
      }
      byCuisine[cuisine].count++;

      for (const issue of recipe.issues) {
        byCuisine[cuisine].issues[issue] =
          (byCuisine[cuisine].issues[issue] || 0) + 1;
      }
    }

    // Sort cuisines by incomplete count
    const cuisineBreakdown = Object.entries(byCuisine)
      .map(([cuisine, data]) => ({
        cuisine,
        incompleteCount: data.count,
        issues: data.issues,
      }))
      .sort((a, b) => b.incompleteCount - a.incompleteCount);

    return NextResponse.json({
      success: true,
      summary: {
        totalRecipes: auditResult.totalRecipes,
        completeRecipes: auditResult.completeRecipes,
        incompleteRecipes: auditResult.incompleteRecipes.length,
        completionRate: `${completionRate.toFixed(1)}%`,
      },
      stats: auditResult.stats,
      cuisineBreakdown,
      formattedSummary: formatAuditSummary(auditResult),
      // Limit incomplete recipes list for response size
      sampleIncompleteRecipes: auditResult.incompleteRecipes.slice(0, 50),
    });
  } catch (error) {
    logger.error("Recipe audit failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
