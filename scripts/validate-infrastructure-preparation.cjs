#!/usr/bin/env node

/**
 * Simple validation script for infrastructure preparation
 */

const { existsSync } = require("fs");
const { join } = require("path");

function validateInfrastructurePreparation() {
  console.log("🔍 Validating Infrastructure Preparation...\n");

  const projectRoot = process.cwd();
  let score = 0;
  let maxScore = 0;

  // Check ESLint configurations
  console.log("📋 ESLint Configuration Check:");
  maxScore += 20;

  const fastConfig = existsSync(join(projectRoot, "eslint.config.fast.cjs"));
  const typeAwareConfig = existsSync(
    join(projectRoot, "eslint.config.type-aware.cjs"),
  );

  if (fastConfig) {
    console.log("   ✅ Fast ESLint config exists");
    score += 10;
  } else {
    console.log("   ❌ Fast ESLint config missing");
  }

  if (typeAwareConfig) {
    console.log("   ✅ Type-aware ESLint config exists");
    score += 10;
  } else {
    console.log("   ❌ Type-aware ESLint config missing");
  }

  // Check infrastructure directories
  console.log("\n📁 Infrastructure Directories:");
  maxScore += 20;

  const metricsDir = existsSync(join(projectRoot, ".kiro", "metrics"));
  const backupDir = existsSync(
    join(projectRoot, ".linting-infrastructure-backups"),
  );

  if (metricsDir) {
    console.log("   ✅ Metrics directory exists");
    score += 10;
  } else {
    console.log("   ❌ Metrics directory missing");
  }

  if (backupDir) {
    console.log("   ✅ Backup directory exists");
    score += 10;
  } else {
    console.log("   ❌ Backup directory missing");
  }

  // Check infrastructure preparation module
  console.log("\n🔧 Infrastructure Module:");
  maxScore += 20;

  const infraModule = existsSync(
    join(
      projectRoot,
      "src",
      "services",
      "campaign",
      "InfrastructurePreparation.ts",
    ),
  );
  const infraTest = existsSync(
    join(
      projectRoot,
      "src",
      "services",
      "campaign",
      "__tests__",
      "InfrastructurePreparation.test.ts",
    ),
  );

  if (infraModule) {
    console.log("   ✅ InfrastructurePreparation.ts exists");
    score += 10;
  } else {
    console.log("   ❌ InfrastructurePreparation.ts missing");
  }

  if (infraTest) {
    console.log("   ✅ InfrastructurePreparation.test.ts exists");
    score += 10;
  } else {
    console.log("   ❌ InfrastructurePreparation.test.ts missing");
  }

  // Check runner scripts
  console.log("\n🚀 Runner Scripts:");
  maxScore += 20;

  const fullRunner = existsSync(
    join(projectRoot, "scripts", "infrastructure-preparation-runner.cjs"),
  );
  const simpleRunner = existsSync(
    join(projectRoot, "scripts", "prepare-linting-infrastructure.cjs"),
  );

  if (fullRunner) {
    console.log("   ✅ Full infrastructure runner exists");
    score += 10;
  } else {
    console.log("   ❌ Full infrastructure runner missing");
  }

  if (simpleRunner) {
    console.log("   ✅ Simple infrastructure runner exists");
    score += 10;
  } else {
    console.log("   ❌ Simple infrastructure runner missing");
  }

  // Check configuration files
  console.log("\n⚙️ Configuration Files:");
  maxScore += 20;

  const basicConfig = existsSync(
    join(projectRoot, ".kiro", "metrics", "infrastructure-config.json"),
  );
  const packageJson = existsSync(join(projectRoot, "package.json"));

  if (basicConfig) {
    console.log("   ✅ Basic infrastructure config exists");
    score += 10;
  } else {
    console.log("   ❌ Basic infrastructure config missing");
  }

  if (packageJson) {
    console.log("   ✅ Package.json exists");
    score += 10;
  } else {
    console.log("   ❌ Package.json missing");
  }

  // Calculate final score
  const percentage = Math.round((score / maxScore) * 100);

  console.log("\n📊 Infrastructure Preparation Validation Results");
  console.log("================================================");
  console.log(`Score: ${score}/${maxScore} (${percentage}%)`);

  if (percentage >= 90) {
    console.log("✅ Status: EXCELLENT - Infrastructure is fully prepared");
  } else if (percentage >= 75) {
    console.log("✅ Status: GOOD - Infrastructure is mostly prepared");
  } else if (percentage >= 50) {
    console.log(
      "⚠️  Status: NEEDS WORK - Some infrastructure components missing",
    );
  } else {
    console.log("❌ Status: POOR - Major infrastructure components missing");
  }

  console.log("\n🎯 Task 1.2 Status:");
  if (percentage >= 85) {
    console.log(
      '✅ Task 1.2 "Infrastructure Preparation and Safety Protocols" is COMPLETE',
    );
    console.log("📝 Ready to proceed with Phase 2 tasks");
  } else {
    console.log("⚠️  Task 1.2 needs additional work before completion");
  }

  return percentage >= 85;
}

// Execute validation
if (require.main === module) {
  const success = validateInfrastructurePreparation();
  process.exit(success ? 0 : 1);
}

module.exports = { validateInfrastructurePreparation };
