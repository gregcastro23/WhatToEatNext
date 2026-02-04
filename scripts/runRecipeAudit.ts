/**
 * Recipe Data Audit Script
 * Run with: npx tsx scripts/runRecipeAudit.ts
 *
 * This script audits all recipes for data completeness
 */

import { LocalRecipeService } from "../src/services/LocalRecipeService";
import {
  auditRecipeCompleteness,
  formatAuditSummary,
} from "../src/utils/recipeSearchEngine";

async function main() {
  console.log("Starting Recipe Data Audit...\n");

  try {
    // Get all recipes
    const recipes = await LocalRecipeService.getAllRecipes();
    console.log(`Loaded ${recipes.length} recipes from LocalRecipeService\n`);

    // Run the audit
    const auditResult = auditRecipeCompleteness(recipes);

    // Print formatted summary
    console.log(formatAuditSummary(auditResult));

    // Print detailed breakdown by cuisine if there are incomplete recipes
    if (auditResult.incompleteRecipes.length > 0) {
      console.log("\n\n--- Breakdown by Cuisine ---");

      // Group by cuisine
      const byCuisine = new Map<string, typeof auditResult.incompleteRecipes>();
      for (const recipe of auditResult.incompleteRecipes) {
        const cuisine = recipe.cuisine || "Unknown";
        if (!byCuisine.has(cuisine)) {
          byCuisine.set(cuisine, []);
        }
        byCuisine.get(cuisine)!.push(recipe);
      }

      // Sort by count
      const sortedCuisines = [...byCuisine.entries()].sort(
        (a, b) => b[1].length - a[1].length
      );

      for (const [cuisine, recipes] of sortedCuisines) {
        console.log(`\n${cuisine}: ${recipes.length} incomplete recipes`);

        // Count issue types
        const issueCounts = new Map<string, number>();
        for (const r of recipes) {
          for (const issue of r.issues) {
            issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
          }
        }

        // Print issue breakdown
        for (const [issue, count] of issueCounts.entries()) {
          console.log(`  - ${issue}: ${count}`);
        }
      }
    }

    // Return exit code based on completeness
    const completionRate = auditResult.completeRecipes / auditResult.totalRecipes;
    if (completionRate < 0.5) {
      console.log("\n⚠️ WARNING: Less than 50% of recipes are complete!");
      process.exit(1);
    } else if (completionRate < 0.8) {
      console.log("\n⚠️ NOTE: Less than 80% of recipes are complete.");
      process.exit(0);
    } else {
      console.log("\n✅ Good: Over 80% of recipes are complete!");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error running audit:", error);
    process.exit(1);
  }
}

main();
