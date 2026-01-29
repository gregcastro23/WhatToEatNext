/**
 * Recipe Data Fix Script
 * Applies auto-fixes to all recipe data
 *
 * Usage: npx ts-node src/scripts/fixRecipeData.ts
 *
 * @file src/scripts/fixRecipeData.ts
 * @created 2026-01-28
 */

import { allRecipes } from "@/data/recipes/index";
import {
  fixAllRecipes,
  type BatchFixResult,
  type FixOptions,
} from "@/utils/recipe/recipeAutoFixer";
import {
  validateAllRecipes,
  type ValidationReport,
} from "@/utils/recipe/recipeSchemaValidator";

// ============ FORMATTING ============

function formatSectionHeader(title: string): string {
  const line = "=".repeat(60);
  return `\n${line}\n${title}\n${line}\n`;
}

function formatSubsectionHeader(title: string): string {
  return `\n--- ${title} ---\n`;
}

function formatBatchResult(result: BatchFixResult): string {
  let output = "";

  output += formatSectionHeader("RECIPE FIX REPORT");
  output += `Generated: ${new Date().toISOString()}\n\n`;

  // Summary
  output += formatSubsectionHeader("Summary");
  output += `Total Recipes:    ${result.totalRecipes}\n`;
  output += `Recipes Fixed:    ${result.recipesFixed}\n`;
  output += `Recipes Unchanged: ${result.recipesUnchanged}\n`;
  output += `Total Fixes Applied: ${result.totalFixes}\n`;

  // Fixes by Type
  output += formatSubsectionHeader("Fixes by Field");
  const sortedFixes = Object.entries(result.fixesByType)
    .sort((a, b) => b[1] - a[1]);

  for (const [field, count] of sortedFixes) {
    output += `  ${field.padEnd(25)} ${count.toString().padStart(5)} fixes\n`;
  }

  // Sample of Fixed Recipes
  output += formatSubsectionHeader("Sample Fixed Recipes (first 10)");
  const samples = result.fixedRecipes.slice(0, 10);

  for (const recipeResult of samples) {
    output += `\n  ${recipeResult.recipeName}:\n`;
    for (const fix of recipeResult.fixes) {
      output += `    - ${fix.field}: ${fix.description}\n`;
    }
  }

  // Remaining Issues
  if (result.unfixedRecipes.length > 0) {
    output += formatSubsectionHeader("Recipes with Remaining Issues");
    output += `Count: ${result.unfixedRecipes.length}\n\n`;

    const samples = result.unfixedRecipes.slice(0, 10);
    for (const recipe of samples) {
      output += `  ${recipe.name}:\n`;
      for (const issue of recipe.issues.slice(0, 3)) {
        output += `    - [${issue.severity.toUpperCase()}] ${issue.field}: ${issue.message}\n`;
      }
      if (recipe.issues.length > 3) {
        output += `    ... and ${recipe.issues.length - 3} more issues\n`;
      }
    }

    if (result.unfixedRecipes.length > 10) {
      output += `\n  ... and ${result.unfixedRecipes.length - 10} more recipes with issues\n`;
    }
  }

  return output;
}

function compareReports(before: ValidationReport, after: ValidationReport): string {
  let output = "";

  output += formatSectionHeader("BEFORE/AFTER COMPARISON");

  output += formatSubsectionHeader("Validity");
  const validBefore = (before.validRecipes / before.totalRecipes) * 100;
  const validAfter = (after.validRecipes / after.totalRecipes) * 100;
  output += `Valid Recipes: ${before.validRecipes} -> ${after.validRecipes} `;
  output += `(${validBefore.toFixed(1)}% -> ${validAfter.toFixed(1)}%)\n`;

  output += formatSubsectionHeader("Issues by Severity");
  output += `Errors:   ${before.issuesBySeverity.error.toString().padStart(5)} -> ${after.issuesBySeverity.error.toString().padStart(5)}\n`;
  output += `Warnings: ${before.issuesBySeverity.warning.toString().padStart(5)} -> ${after.issuesBySeverity.warning.toString().padStart(5)}\n`;
  output += `Info:     ${before.issuesBySeverity.info.toString().padStart(5)} -> ${after.issuesBySeverity.info.toString().padStart(5)}\n`;

  output += formatSubsectionHeader("Quality Metrics");
  output += `Avg Field Coverage: ${before.averageFieldCoverage.toFixed(1)}% -> ${after.averageFieldCoverage.toFixed(1)}%\n`;
  output += `Avg Quality Score:  ${before.averageQualityScore.toFixed(1)}% -> ${after.averageQualityScore.toFixed(1)}%\n`;

  // Calculate improvements
  const qualityImprovement = after.averageQualityScore - before.averageQualityScore;
  const coverageImprovement = after.averageFieldCoverage - before.averageFieldCoverage;
  const errorReduction = before.issuesBySeverity.error - after.issuesBySeverity.error;
  const warningReduction = before.issuesBySeverity.warning - after.issuesBySeverity.warning;

  output += formatSubsectionHeader("Improvements");
  output += `Quality Score:  +${qualityImprovement.toFixed(1)} points\n`;
  output += `Field Coverage: +${coverageImprovement.toFixed(1)} points\n`;
  output += `Errors Fixed:   ${errorReduction}\n`;
  output += `Warnings Fixed: ${warningReduction}\n`;

  return output;
}

// ============ MAIN ============

async function main() {
  console.log("Starting Recipe Data Fix Process...\n");

  // Get all recipes
  const recipes = allRecipes as unknown[];
  console.log(`Found ${recipes.length} recipes to process.\n`);

  // Validate BEFORE fixes
  console.log("Running validation BEFORE fixes...");
  const beforeReport = validateAllRecipes(recipes);

  // Apply fixes
  console.log("Applying auto-fixes...");
  const fixOptions: FixOptions = {
    generateIds: true,
    normalizeTimeFOrmat: true,
    addDefaultElemental: true,
    addDefaultServingSize: true,
    normalizeArrayFields: true,
    normalizeSeasons: true,
    normalizeMealTypes: true,
    normalizeSpiceLevel: true,
    normalizeIngredients: true,
    copyInstructionsFromSteps: true,
  };

  const fixResult = fixAllRecipes(recipes, fixOptions);

  // Validate AFTER fixes
  console.log("Running validation AFTER fixes...");
  const fixedRecipes = fixResult.fixedRecipes.map(r => r.fixedRecipe);
  const unchangedRecipes = recipes.filter((_, idx) =>
    !fixResult.fixedRecipes.some(fr => fr.recipeId === String((recipes[idx] as any)?.id || `recipe-${idx}`))
  );
  const allFixedRecipes = [...fixedRecipes, ...unchangedRecipes];
  const afterReport = validateAllRecipes(allFixedRecipes);

  // Output results
  console.log(formatBatchResult(fixResult));
  console.log(compareReports(beforeReport, afterReport));

  // Summary
  console.log(formatSectionHeader("SUMMARY"));
  console.log(`Successfully applied ${fixResult.totalFixes} fixes to ${fixResult.recipesFixed} recipes.`);
  console.log(`Quality Score improved from ${beforeReport.averageQualityScore.toFixed(1)}% to ${afterReport.averageQualityScore.toFixed(1)}%`);

  if (fixResult.unfixedRecipes.length > 0) {
    console.log(`\nNote: ${fixResult.unfixedRecipes.length} recipes still have issues that require manual attention.`);
  }

  // Return fixed recipes for use by other scripts
  return {
    fixResult,
    beforeReport,
    afterReport,
    fixedRecipes: allFixedRecipes,
  };
}

// Run if executed directly
main().catch(console.error);

export { main as runFix };
