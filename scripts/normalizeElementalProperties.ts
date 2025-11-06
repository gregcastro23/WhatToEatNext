#!/usr/bin/env ts-node
/**
 * Elemental Properties Normalization Script
 *
 * This script:
 * 1. Scans all ingredient files for elemental properties
 * 2. Identifies properties that don't sum to 1.0
 * 3. Normalizes them and updates files
 * 4. Generates a detailed report
 *
 * Run with: npx ts-node scripts/normalizeElementalProperties.ts
 */

import * as fs from "fs";
import * as path from "path";

interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

interface NormalizationResult {
  file: string;
  ingredient: string;
  original: ElementalProperties;
  normalized: ElementalProperties;
  originalSum: number;
  wasNormalized: boolean;
}

const TOLERANCE = 0.01; // Allow ±0.01 deviation from 1.0
const INGREDIENTS_DIR = path.join(__dirname, "../src/data/ingredients");

/**
 * Normalize elemental properties to sum to 1.0
 */
function normalizeElementals(props: ElementalProperties): ElementalProperties {
  const sum = props.Fire + props.Water + props.Earth + props.Air;

  if (Math.abs(sum - 1.0) < TOLERANCE) {
    return props; // Already normalized
  }

  return {
    Fire: Number((props.Fire / sum).toFixed(2)),
    Water: Number((props.Water / sum).toFixed(2)),
    Earth: Number((props.Earth / sum).toFixed(2)),
    Air: Number((props.Air / sum).toFixed(2)),
  };
}

/**
 * Ensure normalized values still sum to 1.0 after rounding
 */
function adjustForRounding(props: ElementalProperties): ElementalProperties {
  const sum = props.Fire + props.Water + props.Earth + props.Air;
  const diff = 1.0 - sum;

  if (Math.abs(diff) < 0.01) {
    // Find the largest value and adjust it
    const elements = Object.entries(props) as [
      keyof ElementalProperties,
      number,
    ][];
    elements.sort((a, b) => b[1] - a[1]);
    const [largestKey] = elements[0];

    return {
      ...props,
      [largestKey]: Number((props[largestKey] + diff).toFixed(2)),
    };
  }

  return props;
}

/**
 * Extract elemental properties from a file content
 */
function extractElementalProperties(
  content: string,
  filePath: string,
): NormalizationResult[] {
  const results: NormalizationResult[] = [];

  // Match pattern: elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 }
  const regex = /(\w+):\s*\{[^}]*elementalProperties:\s*\{([^}]+)\}/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const ingredientName = match[1];
    const propsStr = match[2];

    // Extract individual values
    const fireMatch = propsStr.match(/Fire:\s*([\d.]+)/);
    const waterMatch = propsStr.match(/Water:\s*([\d.]+)/);
    const earthMatch = propsStr.match(/Earth:\s*([\d.]+)/);
    const airMatch = propsStr.match(/Air:\s*([\d.]+)/);

    if (fireMatch && waterMatch && earthMatch && airMatch) {
      const original: ElementalProperties = {
        Fire: parseFloat(fireMatch[1]),
        Water: parseFloat(waterMatch[1]),
        Earth: parseFloat(earthMatch[1]),
        Air: parseFloat(airMatch[1]),
      };

      const originalSum =
        original.Fire + original.Water + original.Earth + original.Air;
      const normalized = adjustForRounding(normalizeElementals(original));
      const wasNormalized = Math.abs(originalSum - 1.0) >= TOLERANCE;

      results.push({
        file: path.relative(INGREDIENTS_DIR, filePath),
        ingredient: ingredientName,
        original,
        normalized,
        originalSum,
        wasNormalized,
      });
    }
  }

  return results;
}

/**
 * Update file with normalized properties
 */
function updateFileWithNormalized(
  filePath: string,
  results: NormalizationResult[],
): void {
  let content = fs.readFileSync(filePath, "utf-8");

  for (const result of results) {
    if (!result.wasNormalized) continue;

    const { original, normalized } = result;

    // Create the old pattern
    const oldPattern = new RegExp(
      `elementalProperties:\\s*\\{\\s*` +
        `(?:Fire:\\s*${original.Fire}|Water:\\s*${original.Water}|Earth:\\s*${original.Earth}|Air:\\s*${original.Air})[,\\s]*` +
        `(?:Fire:\\s*${original.Fire}|Water:\\s*${original.Water}|Earth:\\s*${original.Earth}|Air:\\s*${original.Air})[,\\s]*` +
        `(?:Fire:\\s*${original.Fire}|Water:\\s*${original.Water}|Earth:\\s*${original.Earth}|Air:\\s*${original.Air})[,\\s]*` +
        `(?:Fire:\\s*${original.Fire}|Water:\\s*${original.Water}|Earth:\\s*${original.Earth}|Air:\\s*${original.Air})\\s*\\}`,
      "g",
    );

    // Create the new pattern (preserve the original order as much as possible)
    const newPattern = `elementalProperties: { Fire: ${normalized.Fire}, Water: ${normalized.Water}, Earth: ${normalized.Earth}, Air: ${normalized.Air} }`;

    // Simple replacement: find the original and replace with normalized
    const originalStr = `elementalProperties: { Fire: ${original.Fire}, Water: ${original.Water}, Earth: ${original.Earth}, Air: ${original.Air} }`;
    const alternateStr1 = `elementalProperties: { Fire: ${original.Fire}, Air: ${original.Air}, Earth: ${original.Earth}, Water: ${original.Water} }`;
    const alternateStr2 = `elementalProperties: { Earth: ${original.Earth}, Fire: ${original.Fire}, Air: ${original.Air}, Water: ${original.Water} }`;
    const alternateStr3 = `elementalProperties: { Water: ${original.Water}, Earth: ${original.Earth}, Air: ${original.Air}, Fire: ${original.Fire} }`;
    const alternateStr4 = `elementalProperties: { Air: ${original.Air}, Water: ${original.Water}, Fire: ${original.Fire}, Earth: ${original.Earth} }`;
    const alternateStr5 = `elementalProperties: { Air: ${original.Air}, Water: ${original.Water}, Earth: ${original.Earth}, Fire: ${original.Fire} }`;
    const alternateStr6 = `elementalProperties: { Air: ${original.Air}, Fire: ${original.Fire}, Earth: ${original.Earth}, Water: ${original.Water} }`;

    if (content.includes(originalStr)) {
      content = content.replace(originalStr, newPattern);
    } else if (content.includes(alternateStr1)) {
      content = content.replace(alternateStr1, newPattern);
    } else if (content.includes(alternateStr2)) {
      content = content.replace(alternateStr2, newPattern);
    } else if (content.includes(alternateStr3)) {
      content = content.replace(alternateStr3, newPattern);
    } else if (content.includes(alternateStr4)) {
      content = content.replace(alternateStr4, newPattern);
    } else if (content.includes(alternateStr5)) {
      content = content.replace(alternateStr5, newPattern);
    } else if (content.includes(alternateStr6)) {
      content = content.replace(alternateStr6, newPattern);
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
}

/**
 * Recursively process all TypeScript files in directory
 */
function processDirectory(dir: string): NormalizationResult[] {
  const allResults: NormalizationResult[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      allResults.push(...processDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const results = extractElementalProperties(content, fullPath);

      if (results.some((r) => r.wasNormalized)) {
        updateFileWithNormalized(fullPath, results);
        console.log(`✓ Normalized ${fullPath}`);
      }

      allResults.push(...results);
    }
  }

  return allResults;
}

/**
 * Generate report
 */
function generateReport(results: NormalizationResult[]): void {
  const normalized = results.filter((r) => r.wasNormalized);
  const alreadyNormalized = results.filter((r) => !r.wasNormalized);

  console.log("\n" + "=".repeat(80));
  console.log("ELEMENTAL PROPERTIES NORMALIZATION REPORT");
  console.log("=".repeat(80) + "\n");

  console.log(`Total ingredients analyzed: ${results.length}`);
  console.log(
    `Already normalized: ${alreadyNormalized.length} (${((alreadyNormalized.length / results.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Normalized: ${normalized.length} (${((normalized.length / results.length) * 100).toFixed(1)}%)\n`,
  );

  if (normalized.length > 0) {
    console.log("NORMALIZED INGREDIENTS:\n");

    for (const result of normalized) {
      console.log(`File: ${result.file}`);
      console.log(`Ingredient: ${result.ingredient}`);
      console.log(`Original sum: ${result.originalSum.toFixed(3)}`);
      console.log(
        `Original: Fire=${result.original.Fire}, Water=${result.original.Water}, Earth=${result.original.Earth}, Air=${result.original.Air}`,
      );
      console.log(
        `Normalized: Fire=${result.normalized.Fire}, Water=${result.normalized.Water}, Earth=${result.normalized.Earth}, Air=${result.normalized.Air}`,
      );
      console.log(
        `New sum: ${(result.normalized.Fire + result.normalized.Water + result.normalized.Earth + result.normalized.Air).toFixed(3)}\n`,
      );
    }
  }

  // Statistics by deviation
  const deviations = normalized.map((r) => Math.abs(r.originalSum - 1.0));
  if (deviations.length > 0) {
    console.log("DEVIATION STATISTICS:");
    console.log(`Min deviation: ${Math.min(...deviations).toFixed(3)}`);
    console.log(`Max deviation: ${Math.max(...deviations).toFixed(3)}`);
    console.log(
      `Avg deviation: ${(deviations.reduce((a, b) => a + b, 0) / deviations.length).toFixed(3)}\n`,
    );
  }

  console.log("=".repeat(80));
  console.log("✅ Normalization complete!");
  console.log("=".repeat(80) + "\n");
}

/**
 * Main execution
 */
function main() {
  console.log("Starting elemental properties normalization...\n");

  if (!fs.existsSync(INGREDIENTS_DIR)) {
    console.error(`Error: Ingredients directory not found: ${INGREDIENTS_DIR}`);
    process.exit(1);
  }

  const results = processDirectory(INGREDIENTS_DIR);
  generateReport(results);
}

main();
