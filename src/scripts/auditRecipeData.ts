/**
 * Recipe Data Audit Script
 * Generates a comprehensive report of recipe data quality
 *
 * Usage: npx ts-node src/scripts/auditRecipeData.ts
 *
 * @file src/scripts/auditRecipeData.ts
 * @created 2026-01-28
 */

import { allRecipes } from "@/data/recipes/index";
import {
  validateAllRecipes,
  detectDuplicates,
  type ValidationReport,
  type DuplicateReport,
  type RecipeValidationResult,
} from "@/utils/recipe/recipeSchemaValidator";

// ============ REPORT FORMATTING ============

function formatSectionHeader(title: string): string {
  const line = "=".repeat(60);
  return `\n${line}\n${title}\n${line}\n`;
}

function formatSubsectionHeader(title: string): string {
  return `\n--- ${title} ---\n`;
}

function formatPercentBar(percent: number, width = 30): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  return `[${bar}] ${percent.toFixed(1)}%`;
}

function formatValidationReport(report: ValidationReport): string {
  let output = "";

  // Overview
  output += formatSectionHeader("RECIPE DATA AUDIT REPORT");
  output += `Generated: ${new Date().toISOString()}\n`;
  output += `Total Recipes: ${report.totalRecipes}\n\n`;

  // Validity Summary
  output += formatSubsectionHeader("Validity Summary");
  const validPercent = (report.validRecipes / report.totalRecipes) * 100 || 0;
  output += `Valid Recipes:   ${report.validRecipes} ${formatPercentBar(validPercent)}\n`;
  output += `Invalid Recipes: ${report.invalidRecipes} ${formatPercentBar(100 - validPercent)}\n`;

  // Quality Metrics
  output += formatSubsectionHeader("Quality Metrics");
  output += `Average Field Coverage: ${formatPercentBar(report.averageFieldCoverage)}\n`;
  output += `Average Quality Score:  ${formatPercentBar(report.averageQualityScore)}\n`;

  // Issues by Severity
  output += formatSubsectionHeader("Issues by Severity");
  output += `Errors:   ${report.issuesBySeverity.error.toString().padStart(5)} (critical - must fix)\n`;
  output += `Warnings: ${report.issuesBySeverity.warning.toString().padStart(5)} (recommended fixes)\n`;
  output += `Info:     ${report.issuesBySeverity.info.toString().padStart(5)} (suggestions)\n`;
  output += `\nAuto-fixable Issues: ${report.autoFixableIssues}\n`;

  // Top Issues by Field
  output += formatSubsectionHeader("Top 15 Issues by Field");
  const sortedIssues = Object.entries(report.issuesByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  for (const [field, count] of sortedIssues) {
    output += `  ${field.padEnd(30)} ${count.toString().padStart(5)} occurrences\n`;
  }

  // Recipes with Most Issues
  output += formatSubsectionHeader("Top 10 Recipes with Most Issues");
  const sortedRecipes = [...report.recipeResults]
    .sort((a, b) => b.issues.length - a.issues.length)
    .slice(0, 10);

  for (const recipe of sortedRecipes) {
    const errorCount = recipe.issues.filter(
      (i) => i.severity === "error",
    ).length;
    const warningCount = recipe.issues.filter(
      (i) => i.severity === "warning",
    ).length;
    output += `  ${recipe.recipeName.slice(0, 35).padEnd(36)} `;
    output += `E:${errorCount.toString().padStart(2)} W:${warningCount.toString().padStart(2)} `;
    output += `Q:${recipe.qualityScore.toFixed(0).padStart(3)}%\n`;
  }

  // Best Quality Recipes
  output += formatSubsectionHeader("Top 10 Highest Quality Recipes");
  const bestRecipes = [...report.recipeResults]
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10);

  for (const recipe of bestRecipes) {
    output += `  ${recipe.recipeName.slice(0, 35).padEnd(36)} `;
    output += `Quality: ${recipe.qualityScore.toFixed(1).padStart(5)}% `;
    output += `Coverage: ${recipe.fieldCoverage.toFixed(1)}%\n`;
  }

  // Recipes Missing Critical Fields
  output += formatSubsectionHeader("Recipes Missing ID");
  const missingId = report.recipeResults.filter((r) =>
    r.issues.some((i) => i.field === "id" && i.severity === "warning"),
  );
  output += `Count: ${missingId.length}\n`;
  if (missingId.length > 0 && missingId.length <= 10) {
    for (const recipe of missingId) {
      output += `  - ${recipe.recipeName}\n`;
    }
  } else if (missingId.length > 10) {
    output += `  First 10:\n`;
    for (const recipe of missingId.slice(0, 10)) {
      output += `  - ${recipe.recipeName}\n`;
    }
    output += `  ... and ${missingId.length - 10} more\n`;
  }

  // Recipes Missing Elemental Properties
  output += formatSubsectionHeader("Recipes Missing Elemental Properties");
  const missingElemental = report.recipeResults.filter((r) =>
    r.issues.some((i) => i.field === "elementalProperties"),
  );
  output += `Count: ${missingElemental.length}\n`;

  // Cuisine Distribution
  output += formatSubsectionHeader("Quality by Cuisine");
  const cuisineStats: Record<string, { count: number; totalQuality: number }> =
    {};

  for (const result of report.recipeResults) {
    // Find cuisine from the original recipe
    const cuisineIssue = result.issues.find((i) => i.field === "cuisine");
    const cuisine = (cuisineIssue?.currentValue as string) || "unknown";

    if (!cuisineStats[cuisine]) {
      cuisineStats[cuisine] = { count: 0, totalQuality: 0 };
    }
    cuisineStats[cuisine].count++;
    cuisineStats[cuisine].totalQuality += result.qualityScore;
  }

  const sortedCuisines = Object.entries(cuisineStats)
    .map(([cuisine, stats]) => ({
      cuisine,
      count: stats.count,
      avgQuality: stats.totalQuality / stats.count,
    }))
    .sort((a, b) => b.count - a.count);

  for (const { cuisine, count, avgQuality } of sortedCuisines) {
    if (cuisine !== "unknown") {
      output += `  ${cuisine.padEnd(20)} ${count.toString().padStart(4)} recipes, avg quality: ${avgQuality.toFixed(1)}%\n`;
    }
  }

  return output;
}

function formatDuplicateReport(report: DuplicateReport): string {
  let output = "";

  output += formatSectionHeader("DUPLICATE DETECTION REPORT");
  output += `Duplicate Groups Found: ${report.totalDuplicateGroups}\n`;
  output += `Total Duplicate Recipes: ${report.totalDuplicateRecipes}\n`;

  if (report.duplicateGroups.length === 0) {
    output += "\nNo duplicates detected with 80% similarity threshold.\n";
    return output;
  }

  output += formatSubsectionHeader("Duplicate Groups");

  for (let i = 0; i < report.duplicateGroups.length; i++) {
    const group = report.duplicateGroups[i];
    output += `\nGroup ${i + 1}:\n`;
    output += `  Suggested Keep: ${group.suggestedKeep}\n`;
    output += `  Reason: ${group.reason}\n`;
    output += `  Members:\n`;

    for (const recipe of group.recipes) {
      const keepMark =
        recipe.id === group.suggestedKeep ? " [KEEP]" : " [REMOVE]";
      output += `    - ${recipe.name} (${recipe.cuisine || "unknown"}) `;
      output += `Similarity: ${(recipe.similarity * 100).toFixed(0)}%${keepMark}\n`;
    }
  }

  return output;
}

// ============ DETAILED ERROR REPORT ============

function formatDetailedErrorReport(report: ValidationReport): string {
  let output = "";

  output += formatSectionHeader("DETAILED ERROR REPORT");

  // Group by error type
  const errorsByType: Record<string, RecipeValidationResult[]> = {};

  for (const result of report.recipeResults) {
    const errors = result.issues.filter((i) => i.severity === "error");
    for (const error of errors) {
      if (!errorsByType[error.field]) {
        errorsByType[error.field] = [];
      }
      errorsByType[error.field].push(result);
    }
  }

  for (const [field, recipes] of Object.entries(errorsByType)) {
    output += formatSubsectionHeader(`Error: ${field}`);
    output += `Affected recipes: ${recipes.length}\n`;

    // Show first 5 examples
    const examples = recipes.slice(0, 5);
    for (const recipe of examples) {
      const issue = recipe.issues.find(
        (i) => i.field === field && i.severity === "error",
      );
      output += `  - ${recipe.recipeName}\n`;
      output += `    Current: ${JSON.stringify(issue?.currentValue)}\n`;
    }

    if (recipes.length > 5) {
      output += `  ... and ${recipes.length - 5} more\n`;
    }
  }

  return output;
}

// ============ MAIN ============

async function main() {
  console.log("Starting Recipe Data Audit...\n");
  console.log(`Loading recipes from data layer...`);

  // Get all recipes
  const recipes = allRecipes as unknown[];
  console.log(`Found ${recipes.length} recipes to audit.\n`);

  // Run validation
  console.log("Running validation...");
  const validationReport = validateAllRecipes(recipes);

  // Run duplicate detection
  console.log("Detecting duplicates...");
  const duplicateReport = detectDuplicates(recipes, 0.8);

  // Generate reports
  console.log("\n" + "=".repeat(60));
  console.log(formatValidationReport(validationReport));
  console.log(formatDuplicateReport(duplicateReport));
  console.log(formatDetailedErrorReport(validationReport));

  // Summary
  console.log(formatSectionHeader("RECOMMENDATIONS"));
  console.log(
    `1. Fix ${validationReport.issuesBySeverity.error} critical errors first`,
  );
  console.log(
    `2. Apply auto-fixes for ${validationReport.autoFixableIssues} auto-fixable issues`,
  );
  console.log(
    `3. Review and consolidate ${duplicateReport.totalDuplicateRecipes} duplicate recipes`,
  );
  console.log(`4. Add missing IDs to recipes for better tracking`);
  console.log(`5. Add elemental properties for astrological features\n`);

  // Return codes for CI
  if (validationReport.issuesBySeverity.error > 0) {
    console.log("AUDIT RESULT: FAILED (critical errors found)");
    process.exit(1);
  } else if (validationReport.issuesBySeverity.warning > 50) {
    console.log("AUDIT RESULT: WARNING (many warnings found)");
    process.exit(0);
  } else {
    console.log("AUDIT RESULT: PASSED");
    process.exit(0);
  }
}

// Run if executed directly
main().catch(console.error);

export { main as runAudit };
