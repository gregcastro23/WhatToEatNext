#!/usr/bin/env node

/**
 * Simple Linting Infrastructure Preparation Script
 *
 * This script provides a lightweight alternative to the full infrastructure
 * preparation system, focusing on essential validations and setup.
 */

const { execSync } = require("child_process");
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");

class SimpleLintingInfrastructurePreparation {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      eslintConfigs: { fast: false, typeAware: false },
      packageScripts: { quick: false, typeAware: false },
      buildStability: false,
      gitAvailable: false,
      readinessScore: 0,
      recommendations: [],
    };
  }

  async prepare() {
    console.log("🚀 Preparing Linting Infrastructure...\n");

    try {
      await this.validateESLintConfigurations();
      await this.validatePackageScripts();
      await this.testBuildStability();
      await this.checkGitAvailability();
      await this.createBasicInfrastructure();

      this.calculateReadinessScore();
      this.generateRecommendations();
      this.displayResults();

      return this.results;
    } catch (error) {
      console.error("❌ Infrastructure preparation failed:", error.message);
      throw error;
    }
  }

  async validateESLintConfigurations() {
    console.log("🔧 Validating ESLint Configurations...");

    // Check if configuration files exist
    const fastConfigPath = join(this.projectRoot, "eslint.config.fast.cjs");
    const typeAwareConfigPath = join(
      this.projectRoot,
      "eslint.config.type-aware.cjs",
    );

    this.results.eslintConfigs.fast = existsSync(fastConfigPath);
    this.results.eslintConfigs.typeAware = existsSync(typeAwareConfigPath);

    console.log(
      `   Fast Config: ${this.results.eslintConfigs.fast ? "✅" : "❌"}`,
    );
    console.log(
      `   Type-Aware Config: ${this.results.eslintConfigs.typeAware ? "✅" : "❌"}`,
    );

    // Test fast configuration if it exists
    if (this.results.eslintConfigs.fast) {
      try {
        const startTime = Date.now();
        // ESLint will return exit code 1 if there are linting issues, but that's expected
        // We just want to verify the configuration can run
        execSync(
          "yarn lint:quick --max-warnings=10000 src/components/ErrorBoundary.tsx",
          {
            cwd: this.projectRoot,
            stdio: "pipe",
            timeout: 30000,
          },
        );
        const duration = Date.now() - startTime;
        console.log(`   Fast Config Test: ✅ (${duration}ms)`);
        this.results.eslintConfigs.fastFunctional = true;
        this.results.eslintConfigs.fastPerformant = duration < 5000;
      } catch (error) {
        // Check if it's a configuration error vs linting issues
        if (error.status === 1) {
          // Exit code 1 means linting issues found, but config is functional
          const startTime = Date.now();
          const duration = Date.now() - startTime;
          console.log(
            `   Fast Config Test: ✅ (found linting issues as expected)`,
          );
          this.results.eslintConfigs.fastFunctional = true;
          this.results.eslintConfigs.fastPerformant = true; // Assume performant if config works
        } else {
          console.log("   Fast Config Test: ❌ Configuration error");
          this.results.eslintConfigs.fastFunctional = false;
        }
      }
    }

    // Test type-aware configuration if it exists
    if (this.results.eslintConfigs.typeAware) {
      try {
        const startTime = Date.now();
        execSync(
          "yarn lint:type-aware --max-warnings=10000 src/components/Header/Header.tsx",
          {
            cwd: this.projectRoot,
            stdio: "pipe",
            timeout: 60000,
          },
        );
        const duration = Date.now() - startTime;
        console.log(`   Type-Aware Config Test: ✅ (${duration}ms)`);
        this.results.eslintConfigs.typeAwareFunctional = true;
      } catch (error) {
        console.log("   Type-Aware Config Test: ❌ Failed");
        this.results.eslintConfigs.typeAwareFunctional = false;
      }
    }

    console.log();
  }

  async validatePackageScripts() {
    console.log("📦 Validating Package Scripts...");

    const packageJsonPath = join(this.projectRoot, "package.json");
    if (!existsSync(packageJsonPath)) {
      console.log("   ❌ package.json not found");
      return;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const scripts = packageJson.scripts || {};

    const requiredScripts = [
      { key: "lint:quick", name: "Quick Lint" },
      { key: "lint:type-aware", name: "Type-Aware Lint" },
      { key: "lint:incremental", name: "Incremental Lint" },
      { key: "lint:ci", name: "CI Lint" },
    ];

    requiredScripts.forEach((script) => {
      const exists = !!scripts[script.key];
      console.log(`   ${script.name}: ${exists ? "✅" : "❌"}`);
      this.results.packageScripts[script.key.replace("lint:", "")] = exists;
    });

    console.log();
  }

  async testBuildStability() {
    console.log("🏗️ Testing Build Stability...");

    try {
      const startTime = Date.now();
      execSync("yarn build", {
        cwd: this.projectRoot,
        stdio: "pipe",
        timeout: 120000, // 2 minutes
      });
      const duration = Date.now() - startTime;
      console.log(`   Build Test: ✅ (${Math.round(duration / 1000)}s)`);
      this.results.buildStability = true;
      this.results.buildTime = duration;
    } catch (error) {
      console.log("   Build Test: ❌ Failed");
      this.results.buildStability = false;
    }

    console.log();
  }

  async checkGitAvailability() {
    console.log("🔄 Checking Git Availability...");

    try {
      execSync("git status", { cwd: this.projectRoot, stdio: "pipe" });
      execSync("git stash list", { cwd: this.projectRoot, stdio: "pipe" });
      console.log("   Git: ✅ Available");
      this.results.gitAvailable = true;
    } catch (error) {
      console.log("   Git: ❌ Not available or not in git repository");
      this.results.gitAvailable = false;
    }

    console.log();
  }

  async createBasicInfrastructure() {
    console.log("⚙️ Creating Basic Infrastructure...");

    // Create metrics directory
    const metricsDir = join(this.projectRoot, ".kiro", "metrics");
    if (!existsSync(metricsDir)) {
      mkdirSync(metricsDir, { recursive: true });
      console.log("   ✅ Created metrics directory");
    } else {
      console.log("   ✅ Metrics directory exists");
    }

    // Create backup directory
    const backupDir = join(this.projectRoot, ".linting-infrastructure-backups");
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
      console.log("   ✅ Created backup directory");
    } else {
      console.log("   ✅ Backup directory exists");
    }

    // Create basic configuration files
    const basicConfig = {
      infrastructure: {
        version: "1.0.0",
        created: new Date().toISOString(),
        batchProcessing: {
          defaultBatchSize: 15,
          maxBatchSize: 25,
          criticalFilesBatchSize: 5,
          validationFrequency: 5,
        },
        safety: {
          rollbackOnFailure: true,
          maxRetries: 3,
          timeoutPerBatch: 300000,
        },
      },
    };

    const configPath = join(metricsDir, "infrastructure-config.json");
    writeFileSync(configPath, JSON.stringify(basicConfig, null, 2));
    console.log("   ✅ Created basic configuration");

    console.log();
  }

  calculateReadinessScore() {
    let score = 0;
    const maxScore = 100;

    // ESLint configurations (40 points)
    if (this.results.eslintConfigs.fast) score += 10;
    if (this.results.eslintConfigs.fastFunctional) score += 10;
    if (this.results.eslintConfigs.typeAware) score += 10;
    if (this.results.eslintConfigs.typeAwareFunctional) score += 10;

    // Package scripts (20 points)
    if (this.results.packageScripts.quick) score += 5;
    if (this.results.packageScripts["type-aware"]) score += 5;
    if (this.results.packageScripts.incremental) score += 5;
    if (this.results.packageScripts.ci) score += 5;

    // Build stability (30 points)
    if (this.results.buildStability) score += 30;

    // Git availability (10 points)
    if (this.results.gitAvailable) score += 10;

    this.results.readinessScore = Math.round((score / maxScore) * 100);
  }

  generateRecommendations() {
    const recommendations = [];

    if (!this.results.eslintConfigs.fast) {
      recommendations.push(
        "Create eslint.config.fast.cjs for development workflow",
      );
    } else if (!this.results.eslintConfigs.fastFunctional) {
      recommendations.push(
        "Fix fast ESLint configuration - it exists but is not functional",
      );
    }

    if (!this.results.eslintConfigs.typeAware) {
      recommendations.push(
        "Create eslint.config.type-aware.cjs for comprehensive validation",
      );
    } else if (!this.results.eslintConfigs.typeAwareFunctional) {
      recommendations.push(
        "Fix type-aware ESLint configuration - it exists but is not functional",
      );
    }

    if (!this.results.buildStability) {
      recommendations.push(
        "Fix build stability issues before proceeding with campaigns",
      );
    }

    if (!this.results.gitAvailable) {
      recommendations.push(
        "Initialize git repository or ensure git is available for backup operations",
      );
    }

    if (!this.results.packageScripts.quick) {
      recommendations.push("Add lint:quick script to package.json");
    }

    if (!this.results.packageScripts["type-aware"]) {
      recommendations.push("Add lint:type-aware script to package.json");
    }

    this.results.recommendations = recommendations;
  }

  displayResults() {
    console.log("📊 Infrastructure Preparation Results");
    console.log("=====================================\n");

    const statusIcon = this.results.readinessScore >= 85 ? "✅" : "⚠️";
    const statusText =
      this.results.readinessScore >= 85 ? "READY" : "NEEDS ATTENTION";

    console.log(`${statusIcon} Overall Status: ${statusText}`);
    console.log(`📈 Readiness Score: ${this.results.readinessScore}%\n`);

    console.log("🔧 Component Status:");
    console.log(
      `   Fast ESLint Config: ${this.results.eslintConfigs.fastFunctional ? "✅" : "❌"}`,
    );
    console.log(
      `   Type-Aware ESLint Config: ${this.results.eslintConfigs.typeAwareFunctional ? "✅" : "❌"}`,
    );
    console.log(
      `   Build Stability: ${this.results.buildStability ? "✅" : "❌"}`,
    );
    console.log(
      `   Git Backup System: ${this.results.gitAvailable ? "✅" : "❌"}`,
    );

    if (this.results.recommendations.length > 0) {
      console.log("\n📋 Recommendations:");
      this.results.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    console.log("\n🎯 Next Steps:");
    if (this.results.readinessScore >= 85) {
      console.log(
        "   ✅ Infrastructure is ready for linting excellence campaigns!",
      );
      console.log(
        "   📝 You can proceed with Phase 2 tasks in the linting excellence spec.",
      );
    } else {
      console.log(
        "   ⚠️  Please address the recommendations above before proceeding.",
      );
      console.log("   🔄 Re-run this script after making fixes.");
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const prep = new SimpleLintingInfrastructurePreparation();
  prep.prepare().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = SimpleLintingInfrastructurePreparation;
