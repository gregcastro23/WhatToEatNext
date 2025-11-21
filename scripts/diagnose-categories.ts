#!/usr/bin/env tsx
/**
 * Diagnostic script to count ingredients per category
 * This helps identify which categories are empty or have insufficient data
 */

import { unifiedIngredients } from "../src/data/unified/ingredients";

// Expected categories from the UI
const EXPECTED_CATEGORIES = [
  "spices",
  "herbs",
  "vegetables",
  "proteins",
  "grains",
  "dairy",
  "fruits",
  "oils",
  "vinegars",
  "seasonings",
];

// Count ingredients per category
const categoryCounts: Record<string, number> = {};
const categoryIngredients: Record<string, string[]> = {};

Object.entries(unifiedIngredients).forEach(([key, ingredient]) => {
  const category = ingredient.category || "uncategorized";

  if (!categoryCounts[category]) {
    categoryCounts[category] = 0;
    categoryIngredients[category] = [];
  }

  categoryCounts[category]++;
  categoryIngredients[category].push(ingredient.name || key);
});

// Print results
console.log("\n=== INGREDIENT CATEGORY DIAGNOSTIC REPORT ===\n");
console.log("Expected Categories from UI:", EXPECTED_CATEGORIES.join(", "));
console.log("\n--- Category Counts ---\n");

// Sort categories by count
const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

sortedCategories.forEach(([category, count]) => {
  const status = EXPECTED_CATEGORIES.includes(category) ? "✓" : "⚠";
  const level = count === 0 ? "EMPTY" : count < 5 ? "LOW" : count < 50 ? "MEDIUM" : "HIGH";
  console.log(`${status} ${category.padEnd(20)} ${count.toString().padStart(4)} ingredients [${level}]`);
});

console.log("\n--- Missing Expected Categories ---\n");

EXPECTED_CATEGORIES.forEach((expected) => {
  if (!categoryCounts[expected]) {
    console.log(`✗ ${expected} - NOT FOUND (0 ingredients)`);
  }
});

console.log("\n--- Unexpected Categories ---\n");

Object.keys(categoryCounts).forEach((category) => {
  if (!EXPECTED_CATEGORIES.includes(category)) {
    console.log(`⚠ ${category} - ${categoryCounts[category]} ingredients (not in UI list)`);
  }
});

console.log("\n--- Sample Ingredients by Category ---\n");

EXPECTED_CATEGORIES.forEach((category) => {
  const ingredients = categoryIngredients[category] || [];
  console.log(`${category}:`);
  if (ingredients.length === 0) {
    console.log("  (no ingredients)");
  } else {
    console.log(`  ${ingredients.slice(0, 5).join(", ")}${ingredients.length > 5 ? "..." : ""}`);
  }
  console.log();
});

console.log("\n=== END REPORT ===\n");

// Export for programmatic use
export { categoryCounts, categoryIngredients };
