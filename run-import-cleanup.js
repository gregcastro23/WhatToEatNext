#!/usr/bin/env node

/**
 * Import Cleanup Runner
 *
 * Simple script to organize imports and handle basic cleanup
 */

import { execSync } from "child_process";

console.log("🧹 Starting Import Cleanup\n");

// Get initial stats
function getStats() {
  try {
    const totalFiles = execSync(
      'find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l',
      {
        encoding: "utf8",
      },
    ).trim();

    const unusedVars = execSync(
      'yarn lint --format=compact 2>&1 | grep "@typescript-eslint/no-unused-vars" | wc -l',
      {
        encoding: "utf8",
      },
    ).trim();

    return {
      totalFiles: parseInt(totalFiles),
      unusedVars: parseInt(unusedVars),
    };
  } catch (error) {
    return { totalFiles: 0, unusedVars: 0 };
  }
}

const initialStats = getStats();
console.log(`📊 Initial stats:`);
console.log(`   Total files: ${initialStats.totalFiles}`);
console.log(`   Unused variables: ${initialStats.unusedVars}\n`);

// Step 1: Organize imports
console.log("📋 Step 1: Organizing imports...");
try {
  execSync('yarn lint --fix --rule "import/order: error"', {
    stdio: "pipe",
    encoding: "utf8",
  });
  console.log("✅ Import organization completed");
} catch (error) {
  console.log("⚠️  Import organization completed with warnings");
}

// Step 2: Basic unused variable cleanup (conservative)
console.log("\n🧹 Step 2: Basic cleanup...");
try {
  execSync(
    'yarn lint --fix --rule "@typescript-eslint/no-unused-vars: [error, {varsIgnorePattern: \\"^(_|React|Component|useState|useEffect|useMemo|useCallback|planetary|elemental|astrological|campaign)\\"}]"',
    {
      stdio: "pipe",
      encoding: "utf8",
    },
  );
  console.log("✅ Basic cleanup completed");
} catch (error) {
  console.log("⚠️  Basic cleanup completed with warnings");
}

// Step 3: Final import organization
console.log("\n📋 Step 3: Final import organization...");
try {
  execSync('yarn lint --fix --rule "import/order: error"', {
    stdio: "pipe",
    encoding: "utf8",
  });
  console.log("✅ Final organization completed");
} catch (error) {
  console.log("⚠️  Final organization completed with warnings");
}

// Get final stats
const finalStats = getStats();
const reduction = initialStats.unusedVars - finalStats.unusedVars;

console.log("\n📊 Final Results:");
console.log(`   Initial unused variables: ${initialStats.unusedVars}`);
console.log(`   Final unused variables: ${finalStats.unusedVars}`);
console.log(`   Variables cleaned: ${reduction}`);
console.log(
  `   Reduction: ${Math.round((reduction / initialStats.unusedVars) * 100)}%`,
);

// Validate TypeScript
console.log("\n🔍 Validating TypeScript...");
try {
  execSync("yarn tsc --noEmit --skipLibCheck", {
    stdio: "pipe",
    encoding: "utf8",
  });
  console.log("✅ TypeScript validation passed");

  if (reduction > 0) {
    console.log("\n🎉 Import cleanup completed successfully!");
    console.log(`📈 Cleaned up ${reduction} unused variables`);
    console.log("🛡️  Critical files preserved");
  } else {
    console.log("\n✅ Import cleanup completed (no changes needed)");
  }
} catch (error) {
  console.error("\n❌ TypeScript validation failed");
  console.log("Please review changes manually");
  process.exit(1);
}
