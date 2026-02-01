#!/usr/bin/env ts-node
/**
 * Generate a coverage report for recipe enrichment
 */

import * as fs from "fs";
import * as path from "path";

interface CuisineStats {
  cuisine: string;
  totalDishes: number;
  enrichedDishes: number;
  defaultDishes: number;
  noDishes: number;
  coveragePercent: number;
}

function analyzeFile(filePath: string): CuisineStats {
  const content = fs.readFileSync(filePath, "utf-8");
  const cuisineName = path.basename(filePath, ".ts");

  // Count dishes with elementalProperties blocks
  const dishPattern = /name:\s*["']([^"']+)["']/g;
  const elementalPattern = /elementalProperties:\s*{[^}]*Fire:\s*([\d.]+)[^}]*Water:\s*([\d.]+)[^}]*Earth:\s*([\d.]+)[^}]*Air:\s*([\d.]+)/g;

  // Find all potential dish names (filter out ingredient names)
  const allNames: string[] = [];
  let match;
  while ((match = dishPattern.exec(content)) !== null) {
    const name = match[1];
    // Simple heuristic: dish names are usually longer and have capitalized words
    if (name.length > 3 && /^[A-Z]/.test(name)) {
      allNames.push(name);
    }
  }

  // Count elemental property blocks
  const elementalMatches: { values: number[] }[] = [];
  while ((match = elementalPattern.exec(content)) !== null) {
    elementalMatches.push({
      values: [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]), parseFloat(match[4])],
    });
  }

  // Categorize
  let enriched = 0;
  let defaulted = 0;

  for (const elem of elementalMatches) {
    const [fire, water, earth, air] = elem.values;
    if (fire === 0.25 && water === 0.25 && earth === 0.25 && air === 0.25) {
      defaulted++;
    } else {
      enriched++;
    }
  }

  const totalDishes = elementalMatches.length;
  const coverage = totalDishes > 0 ? (enriched / totalDishes) * 100 : 0;

  return {
    cuisine: cuisineName,
    totalDishes,
    enrichedDishes: enriched,
    defaultDishes: defaulted,
    noDishes: 0,
    coveragePercent: coverage,
  };
}

function main(): void {
  const cuisinesDir = path.join(process.cwd(), "src", "data", "cuisines");
  const cuisineFiles = fs.readdirSync(cuisinesDir).filter(
    (f) => f.endsWith(".ts") && f !== "index.ts" && f !== "template.ts" && f !== "culinaryTraditions.ts"
  );

  console.log("=".repeat(80));
  console.log("RECIPE ENRICHMENT COVERAGE REPORT");
  console.log("=".repeat(80));
  console.log("");

  const stats: CuisineStats[] = [];
  let totalEnriched = 0;
  let totalDefault = 0;
  let totalDishes = 0;

  for (const file of cuisineFiles) {
    const filePath = path.join(cuisinesDir, file);
    const result = analyzeFile(filePath);
    stats.push(result);
    totalEnriched += result.enrichedDishes;
    totalDefault += result.defaultDishes;
    totalDishes += result.totalDishes;
  }

  console.log("Cuisine Coverage Breakdown:");
  console.log("-".repeat(80));
  console.log(
    "Cuisine".padEnd(20) +
      "Total".padStart(8) +
      "Enriched".padStart(10) +
      "Default".padStart(10) +
      "Coverage".padStart(12)
  );
  console.log("-".repeat(80));

  for (const stat of stats.sort((a, b) => b.coveragePercent - a.coveragePercent)) {
    console.log(
      stat.cuisine.padEnd(20) +
        stat.totalDishes.toString().padStart(8) +
        stat.enrichedDishes.toString().padStart(10) +
        stat.defaultDishes.toString().padStart(10) +
        (stat.coveragePercent.toFixed(1) + "%").padStart(12)
    );
  }

  console.log("-".repeat(80));
  const totalCoverage = totalDishes > 0 ? (totalEnriched / totalDishes) * 100 : 0;
  console.log(
    "TOTAL".padEnd(20) +
      totalDishes.toString().padStart(8) +
      totalEnriched.toString().padStart(10) +
      totalDefault.toString().padStart(10) +
      (totalCoverage.toFixed(1) + "%").padStart(12)
  );

  console.log("");
  console.log("=".repeat(80));
  console.log("SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total Recipes with Elemental Properties: ${totalDishes}`);
  console.log(`Successfully Enriched (non-default values): ${totalEnriched}`);
  console.log(`Still Using Default Values: ${totalDefault}`);
  console.log(`Overall Coverage: ${totalCoverage.toFixed(1)}%`);
  console.log("");
}

main();
