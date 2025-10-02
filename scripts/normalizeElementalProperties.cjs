#!/usr/bin/env node
/**
 * Elemental Properties Normalization Script
 *
 * Run with: node scripts/normalizeElementalProperties.cjs
 */

const fs = require('fs');
const path = require('path');

const TOLERANCE = 0.01;
const INGREDIENTS_DIR = path.join(__dirname, '../src/data/ingredients');

function normalizeElementals(props) {
  const sum = props.Fire + props.Water + props.Earth + props.Air;

  if (Math.abs(sum - 1.0) < TOLERANCE) {
    return props;
  }

  return {
    Fire: Number((props.Fire / sum).toFixed(2)),
    Water: Number((props.Water / sum).toFixed(2)),
    Earth: Number((props.Earth / sum).toFixed(2)),
    Air: Number((props.Air / sum).toFixed(2))
  };
}

function adjustForRounding(props) {
  let sum = props.Fire + props.Water + props.Earth + props.Air;
  let diff = 1.0 - sum;

  // If already at 1.0, return
  if (Math.abs(diff) < 0.001) {
    return props;
  }

  // Find the largest value and adjust it
  const elements = Object.entries(props).sort((a, b) => b[1] - a[1]);
  const [largestKey, largestVal] = elements[0];

  const adjusted = {
    ...props,
    [largestKey]: Number((largestVal + diff).toFixed(2))
  };

  // Verify the sum is now 1.0
  const newSum = adjusted.Fire + adjusted.Water + adjusted.Earth + adjusted.Air;

  if (Math.abs(newSum - 1.0) > 0.001) {
    // If still not 1.0, distribute the remainder
    const finalDiff = 1.0 - newSum;
    adjusted[largestKey] = Number((adjusted[largestKey] + finalDiff).toFixed(2));
  }

  return adjusted;
}

function extractAndNormalize(content, filePath) {
  const results = [];
  const regex = /elementalProperties:\s*\{\s*([^}]+)\}/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const propsStr = match[1];

    const fireMatch = propsStr.match(/Fire:\s*([\d.]+)/);
    const waterMatch = propsStr.match(/Water:\s*([\d.]+)/);
    const earthMatch = propsStr.match(/Earth:\s*([\d.]+)/);
    const airMatch = propsStr.match(/Air:\s*([\d.]+)/);

    if (fireMatch && waterMatch && earthMatch && airMatch) {
      const original = {
        Fire: parseFloat(fireMatch[1]),
        Water: parseFloat(waterMatch[1]),
        Earth: parseFloat(earthMatch[1]),
        Air: parseFloat(airMatch[1])
      };

      const originalSum = original.Fire + original.Water + original.Earth + original.Air;
      const normalized = adjustForRounding(normalizeElementals(original));
      const wasNormalized = Math.abs(originalSum - 1.0) >= TOLERANCE;

      if (wasNormalized) {
        results.push({
          file: path.relative(INGREDIENTS_DIR, filePath),
          original,
          normalized,
          originalSum,
          originalMatch: match[0]
        });
      }
    }
  }

  return results;
}

function updateFile(filePath, results) {
  if (results.length === 0) return;

  let content = fs.readFileSync(filePath, 'utf-8');

  for (const result of results) {
    const newPattern = `elementalProperties: { Fire: ${result.normalized.Fire}, Water: ${result.normalized.Water}, Earth: ${result.normalized.Earth}, Air: ${result.normalized.Air} }`;
    content = content.replace(result.originalMatch, newPattern);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
}

function processDirectory(dir) {
  const allResults = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      allResults.push(...processDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const results = extractAndNormalize(content, fullPath);

      if (results.length > 0) {
        updateFile(fullPath, results);
        console.log(`✓ Normalized ${path.relative(INGREDIENTS_DIR, fullPath)}`);
      }

      allResults.push(...results);
    }
  }

  return allResults;
}

function generateReport(results) {
  console.log('\n' + '='.repeat(80));
  console.log('ELEMENTAL PROPERTIES NORMALIZATION REPORT');
  console.log('='.repeat(80) + '\n');

  console.log(`Total ingredients normalized: ${results.length}\n`);

  if (results.length > 0) {
    console.log('NORMALIZED INGREDIENTS:\n');

    for (const result of results) {
      console.log(`File: ${result.file}`);
      console.log(`Original sum: ${result.originalSum.toFixed(3)}`);
      console.log(`Original: Fire=${result.original.Fire}, Water=${result.original.Water}, Earth=${result.original.Earth}, Air=${result.original.Air}`);
      console.log(`Normalized: Fire=${result.normalized.Fire}, Water=${result.normalized.Water}, Earth=${result.normalized.Earth}, Air=${result.normalized.Air}`);
      const newSum = result.normalized.Fire + result.normalized.Water + result.normalized.Earth + result.normalized.Air;
      console.log(`New sum: ${newSum.toFixed(3)}\n`);
    }

    const deviations = results.map(r => Math.abs(r.originalSum - 1.0));
    console.log('DEVIATION STATISTICS:');
    console.log(`Min deviation: ${Math.min(...deviations).toFixed(3)}`);
    console.log(`Max deviation: ${Math.max(...deviations).toFixed(3)}`);
    console.log(`Avg deviation: ${(deviations.reduce((a, b) => a + b, 0) / deviations.length).toFixed(3)}\n`);
  }

  console.log('='.repeat(80));
  console.log('✅ Normalization complete!');
  console.log('='.repeat(80) + '\n');
}

function main() {
  console.log('Starting elemental properties normalization...\n');

  if (!fs.existsSync(INGREDIENTS_DIR)) {
    console.error(`Error: Ingredients directory not found: ${INGREDIENTS_DIR}`);
    process.exit(1);
  }

  const results = processDirectory(INGREDIENTS_DIR);
  generateReport(results);
}

main();
