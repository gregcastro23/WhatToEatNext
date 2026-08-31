/**
 * Witness Sensitivity Prover
 *
 * Verifies that scripts/snapshot-witness.ts is genuinely sensitive to both
 * load-time failures and semantic / output perturbations across the 12
 * recommender and domain modules.
 *
 * Usage:
 *   bun scripts/checkWitnessSensitivity.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const LOAD_MODULES = [
  "src/data/cuisines/index.ts",
  "src/data/ingredients/spices/index.ts",
  "src/data/unified/cuisineIntegrations.ts",
  "src/data/unified/cuisines.ts",
  "src/data/unified/recipeBuilding.ts",
  "src/data/unified/seasonal.ts",
  "src/services/IngredientFilterService.ts",
  "src/services/RecommendationAdapter.ts",
  "src/utils/cookingMethodRecommender.ts",
  "src/utils/ingredientRecommender.ts",
  "src/utils/recommendation/ingredientRecommendation.ts",
  "src/utils/recommendation/methodRecommendation.ts",
];

interface SemanticProbe {
  name: string;
  filePath: string;
  target: string;
  replacement: string;
}

const SEMANTIC_PROBES: SemanticProbe[] = [
  {
    name: "Seasonal Score Scaling Perturbation (seasonal.ts)",
    filePath: "src/data/unified/seasonal.ts",
    target: "unifiedSeasonalSystem.getSeasonalScore(ingredientName, season);",
    replacement: "unifiedSeasonalSystem.getSeasonalScore(ingredientName, season) * 0.5;",
  },
  {
    name: "Method Recommendation Score Perturbation (methodRecommendation.ts)",
    filePath: "src/utils/recommendation/methodRecommendation.ts",
    target: "score: Math.min(1, score),",
    replacement: "score: Math.min(1, score) * 0.5,",
  },
  {
    name: "Flavor Compatibility Conversion Perturbation (flavorCompatibilityLayer.ts)",
    filePath: "src/data/unified/flavorCompatibilityLayer.ts",
    target: "compatibility: unifiedResult.overall,",
    replacement: "compatibility: unifiedResult.overall * 0.5,",
  },
];

console.log("=== Behavioral Snapshot Witness Sensitivity Test ===\n");

let allPassed = true;

// 1. Load Sensitivity (12 modules)
console.log("1. Testing Load Sensitivity (12 modules)...");
for (const mod of LOAD_MODULES) {
  const original = readFileSync(mod, "utf8");
  try {
    writeFileSync(mod, `throw new Error("PROBE_LOAD_ERROR_${mod}");\n` + original, "utf8");
    const res = spawnSync("bun", ["scripts/snapshot-witness.ts"], { encoding: "utf8" });
    if (res.status !== 0) {
      console.log(`  ✅ LOAD SENSITIVE: ${mod}`);
    } else {
      console.log(`  ❌ LOAD BLIND: ${mod}`);
      allPassed = false;
    }
  } finally {
    writeFileSync(mod, original, "utf8");
  }
}

// 2. Semantic / Output Sensitivity
console.log("\n2. Testing Semantic / Output Perturbation Sensitivity...");
for (const probe of SEMANTIC_PROBES) {
  const original = readFileSync(probe.filePath, "utf8");
  if (!original.includes(probe.target)) {
    console.log(`  ⚠️ TARGET NOT FOUND in ${probe.filePath}: "${probe.target}"`);
    allPassed = false;
    continue;
  }
  try {
    const perturbed = original.replace(probe.target, probe.replacement);
    writeFileSync(probe.filePath, perturbed, "utf8");
    const res = spawnSync("bun", ["scripts/snapshot-witness.ts"], { encoding: "utf8" });
    if (res.status !== 0) {
      console.log(`  ✅ OUTPUT SENSITIVE: ${probe.name}`);
    } else {
      console.log(`  ❌ OUTPUT BLIND: ${probe.name}`);
      allPassed = false;
    }
  } finally {
    writeFileSync(probe.filePath, original, "utf8");
  }
}

if (allPassed) {
  console.log("\n🎉 ALL 12 LOAD GATES AND 3 OUTPUT PERTURBATION GATES PASSED (100% SENSITIVE)!");
  process.exit(0);
} else {
  console.log("\n⚠️ SENSITIVITY DEFECTS DETECTED.");
  process.exit(1);
}
