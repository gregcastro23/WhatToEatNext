#!/usr/bin/env node
/**
 * Cooking Methods Fixer - Precise fix for suitable_for property pattern
 */

const fs = require("fs");
const glob = require("glob");

const files = [
  "src/data/cooking/methods/dry/broiling.ts",
  "src/data/cooking/methods/dry/frying.ts",
  "src/data/cooking/methods/dry/roasting.ts",
  "src/data/cooking/methods/dry/stir-frying.ts",
  "src/data/cooking/methods/molecular/cryo-cooking.ts",
  "src/data/cooking/methods/molecular/emulsification.ts",
  "src/data/cooking/methods/molecular/gelification.ts",
  "src/data/cooking/methods/molecular/spherification.ts",
  "src/data/cooking/methods/raw/raw.ts",
  "src/data/cooking/methods/template.ts",
  "src/data/cooking/methods/traditional/fermentation.ts",
  "src/data/cooking/methods/traditional/pickling.ts",
  "src/data/cooking/methods/transformation/curing.ts",
  "src/data/cooking/methods/transformation/dehydrating.ts",
  "src/data/cooking/methods/transformation/distilling.ts",
  "src/data/cooking/methods/transformation/infusing.ts",
  "src/data/cooking/methods/transformation/marinating.ts",
  "src/data/cooking/methods/transformation/smoking.ts",
  "src/data/cooking/methods/wet/boiling.ts",
  "src/data/cooking/methods/wet/braising.ts",
  "src/data/cooking/methods/wet/poaching.ts",
  "src/data/cooking/methods/wet/pressure-cooking.ts",
  "src/data/cooking/methods/wet/simmering.ts",
  "src/data/cooking/methods/wet/sous-vide.ts",
  "src/data/cooking/methods/wet/steaming.ts",
  "src/data/cooking/methods/wet/stewing.ts",
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    const original = content;

    // Fix 1: suitable_for [...] -> suitable_for: [...]
    content = content.replace(/(\s+)(suitable_for)\s+(\[)/g, "$1$2: $3");

    // Fix 2: Remove trailing commas in comments within objects
    content = content.replace(/,(\s*\/\/[^\n]*),/g, ",$1");

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf-8");
      return { fixed: true };
    }
    return { fixed: false };
  } catch (error) {
    return { fixed: false, error: error.message };
  }
}

function main() {
  console.log("🍳 Cooking Methods Fixer\n");

  let fixedCount = 0;

  files.forEach((file) => {
    const fullPath = `${process.cwd()}/${file}`;
    process.stdout.write(`Fixing ${file}... `);

    const result = fixFile(fullPath);

    if (result.error) {
      console.log(`❌ ${result.error}`);
    } else if (result.fixed) {
      fixedCount++;
      console.log(`✅`);
    } else {
      console.log(`⚠️ (no changes needed)`);
    }
  });

  console.log(`\n📊 Fixed: ${fixedCount}/${files.length} files\n`);
}

main();
