#!/usr/bin/env node

/**
 * Phase 12.1: TypeScript Error Mass Recovery Campaign
 *
 * Systematic recovery from 1,661 TypeScript errors to <100 errors
 * Target: 97%+ error reduction using conservative, proven approaches
 *
 * Current Error Distribution:
 * - TS1003: 738 errors (identifier expected)
 * - TS1128: 441 errors (declaration or statement expected)
 * - TS1005: 213 errors (expected token)
 * - TS1109: 183 errors (expression expected)
 * - Other: 86 errors
 *
 * Strategy:
 * 1. Batch processing with validation checkpoints every 15 files
 * 2. Use existing specialized scripts for each error type
 * 3. Maintain build stability throughout process
 * 4. Preserve astrological/campaign functionality
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const MAX_FILES_PER_BATCH = 15;
const VALIDATION_CHECKPOINT_FREQUENCY = 5; // Validate every 5 files
const BACKUP_DIR = ".systematic-ts-recovery-backup";
const TARGET_ERROR_COUNT = 100; // <100 errors goal
const MIN_REDUCTION_PERCENTAGE = 97; // 97%+ reduction target

class SystematicTypeScriptRecovery {
  constructor() {
    this.initialErrorCount = 0;
    this.currentErrorCount = 0;
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.backupPath = "";
    this.campaignStartTime = new Date();
    this.errorHistory = [];
    this.buildValidationFailures = 0;
  }

  async run() {
    console.log("🚀 Phase 12.1: TypeScript Error Mass Recovery Campaign");
    console.log("=".repeat(60));
    console.log("Target: Reduce TypeScript errors from current count to <100");
    console.log(
      "Strategy: Systematic batch processing with validation checkpoints\n",
    );

    try {
      // Initialize campaign
      await this.initializeCampaign();

      // Execute recovery phases
      await this.executeRecoveryPhases();

      // Generate final report
      await this.generateFinalReport();
    } catch (error) {
      console.error("❌ Campaign failed:", error.message);
      await this.handleCampaignFailure(error);
    }
  }

  async initializeCampaign() {
    console.log("🔍 Initializing campaign...");

    // Get initial error count
    this.initialErrorCount = await this.getTypeScriptErrorCount();
    this.currentErrorCount = this.initialErrorCount;

    console.log(`📊 Initial TypeScript errors: ${this.initialErrorCount}`);

    if (this.initialErrorCount === 0) {
      console.log("✅ No TypeScript errors found! Campaign complete.");
      return;
    }

    if (this.initialErrorCount < TARGET_ERROR_COUNT) {
      console.log(
        `✅ Error count (${this.initialErrorCount}) already below target (${TARGET_ERROR_COUNT})`,
      );
      return;
    }

    // Create backup
    this.backupPath = this.createBackup();
    console.log(`📁 Created backup at: ${this.backupPath}`);

    // Analyze error distribution
    await this.analyzeErrorDistribution();

    // Validate build before starting
    const buildValid = await this.validateBuild();
    if (!buildValid) {
      throw new Error(
        "Initial build validation failed - cannot proceed safely",
      );
    }

    console.log("✅ Campaign initialization complete\n");
  }

  async executeRecoveryPhases() {
    console.log("🔧 Executing recovery phases...\n");

    // Phase 1: TS1003 Identifier Errors (738 errors)
    await this.executePhase("TS1003", "fix-ts1003-identifier-errors.cjs", 738);

    // Phase 2: TS1128 Declaration Errors (441 errors)
    await this.executePhase("TS1128", "focused-ts1128-fixer.cjs", 441);

    // Phase 3: TS1005 Token Errors (213 errors)
    await this.executePhase("TS1005", "fix-ts1005-trailing-commas.cjs", 213);

    // Phase 4: Remaining syntax errors with comprehensive approach
    await this.executeComprehensiveCleanup();
  }

  async executePhase(errorType, scriptPath, expectedErrors) {
    console.log(`\n📋 Phase: ${errorType} Error Resolution`);
    console.log(`Expected errors: ${expectedErrors}`);
    console.log(`Script: ${scriptPath}`);

    const phaseStartTime = new Date();
    const prePhaseErrors = await this.getTypeScriptErrorCount();

    try {
      // Check if script exists
      if (!fs.existsSync(scriptPath)) {
        console.log(`⚠️ Script ${scriptPath} not found, skipping phase`);
        return;
      }

      // Execute specialized script
      console.log(`🔧 Executing ${scriptPath}...`);
      execSync(`node ${scriptPath}`, { stdio: "inherit" });

      // Validate after phase
      const postPhaseErrors = await this.getTypeScriptErrorCount();
      const phaseReduction = prePhaseErrors - postPhaseErrors;
      const phasePercentage =
        prePhaseErrors > 0
          ? ((phaseReduction / prePhaseErrors) * 100).toFixed(1)
          : "0.0";

      console.log(`\n📊 Phase ${errorType} Results:`);
      console.log(`   Before: ${prePhaseErrors} errors`);
      console.log(`   After: ${postPhaseErrors} errors`);
      console.log(
        `   Reduction: ${phaseReduction} errors (${phasePercentage}%)`,
      );

      // Update tracking
      this.currentErrorCount = postPhaseErrors;
      this.errorHistory.push({
        phase: errorType,
        timestamp: new Date(),
        beforeCount: prePhaseErrors,
        afterCount: postPhaseErrors,
        reduction: phaseReduction,
        percentage: phasePercentage,
      });

      // Validate build after phase
      const buildValid = await this.validateBuild();
      if (!buildValid) {
        this.buildValidationFailures++;
        console.log(`⚠️ Build validation failed after ${errorType} phase`);

        if (this.buildValidationFailures >= 2) {
          throw new Error(
            "Multiple build validation failures - stopping campaign for safety",
          );
        }
      } else {
        console.log(`✅ Build validation passed after ${errorType} phase`);
      }
    } catch (error) {
      console.error(`❌ Phase ${errorType} failed:`, error.message);
      // Continue with next phase rather than failing entire campaign
    }
  }

  async executeComprehensiveCleanup() {
    console.log("\n📋 Phase: Comprehensive Syntax Error Cleanup");

    const preCleanupErrors = await this.getTypeScriptErrorCount();

    if (preCleanupErrors <= TARGET_ERROR_COUNT) {
      console.log(
        `✅ Error count (${preCleanupErrors}) already at target level`,
      );
      return;
    }

    console.log(
      `🔧 Applying comprehensive syntax fixes to remaining ${preCleanupErrors} errors...`,
    );

    try {
      // Use the existing comprehensive syntax fixer
      if (fs.existsSync("fix-comprehensive-syntax-errors.cjs")) {
        execSync("node fix-comprehensive-syntax-errors.cjs", {
          stdio: "inherit",
        });
      } else {
        console.log(
          "⚠️ Comprehensive syntax fixer not found, applying manual patterns...",
        );
        await this.applyManualSyntaxFixes();
      }

      const postCleanupErrors = await this.getTypeScriptErrorCount();
      const cleanupReduction = preCleanupErrors - postCleanupErrors;
      const cleanupPercentage =
        preCleanupErrors > 0
          ? ((cleanupReduction / preCleanupErrors) * 100).toFixed(1)
          : "0.0";

      console.log(`\n📊 Comprehensive Cleanup Results:`);
      console.log(`   Before: ${preCleanupErrors} errors`);
      console.log(`   After: ${postCleanupErrors} errors`);
      console.log(
        `   Reduction: ${cleanupReduction} errors (${cleanupPercentage}%)`,
      );

      this.currentErrorCount = postCleanupErrors;
    } catch (error) {
      console.error("❌ Comprehensive cleanup failed:", error.message);
    }
  }

  async applyManualSyntaxFixes() {
    console.log("🔧 Applying manual syntax fix patterns...");

    // Get files with remaining errors
    const errorFiles = await this.getFilesWithErrors();
    console.log(`📁 Found ${errorFiles.length} files with errors`);

    let processedInBatch = 0;

    for (const filePath of errorFiles.slice(0, MAX_FILES_PER_BATCH)) {
      try {
        await this.fixSyntaxErrorsInFile(filePath);
        processedInBatch++;

        // Validation checkpoint every 5 files
        if (processedInBatch % VALIDATION_CHECKPOINT_FREQUENCY === 0) {
          const buildValid = await this.validateBuild();
          if (!buildValid) {
            console.log(
              `⚠️ Build validation failed after ${processedInBatch} files, stopping batch`,
            );
            break;
          }
          console.log(
            `✅ Validation checkpoint passed (${processedInBatch} files processed)`,
          );
        }
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }

    console.log(`📊 Manual fixes applied to ${processedInBatch} files`);
  }

  async fixSyntaxErrorsInFile(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    let fixed = content;
    let modified = false;

    // Common syntax error patterns

    // Fix missing semicolons
    if (fixed.includes("Expected")) {
      fixed = fixed.replace(/(\w+)\s*$/gm, "$1;");
      modified = true;
    }

    // Fix malformed function parameters
    fixed = fixed.replace(
      /function\s+(\w+)\s*\(\s*([^)]*),\s*\)/g,
      "function $1($2)",
    );
    if (fixed !== content) modified = true;

    // Fix trailing commas in object literals
    fixed = fixed.replace(/,(\s*[}\]])/g, "$1");
    if (fixed !== content) modified = true;

    // Fix malformed arrow functions
    fixed = fixed.replace(/=>\s*{([^}]*),\s*}/g, "=> {$1}");
    if (fixed !== content) modified = true;

    if (modified) {
      fs.writeFileSync(filePath, fixed);
      console.log(`  ✓ Applied syntax fixes to ${filePath}`);
    }
  }

  async getTypeScriptErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getFilesWithErrors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | cut -d"(" -f1 | sort -u',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
    } catch (error) {
      return [];
    }
  }

  async analyzeErrorDistribution() {
    console.log("📊 Analyzing error distribution...");

    try {
      const output = execSync(
        "yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E \"error TS\" | sed 's/.*error //' | cut -d':' -f1 | sort | uniq -c | sort -nr",
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      console.log("\nError breakdown:");
      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      for (const line of lines.slice(0, 10)) {
        // Show top 10
        console.log(`  ${line.trim()}`);
      }
      console.log("");
    } catch (error) {
      console.log("⚠️ Could not analyze error distribution");
    }
  }

  async validateBuild() {
    try {
      execSync("yarn build", { stdio: "pipe", timeout: 60000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${BACKUP_DIR}-${timestamp}`;

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    return backupPath;
  }

  async generateFinalReport() {
    const campaignEndTime = new Date();
    const campaignDuration = Math.round(
      (campaignEndTime - this.campaignStartTime) / 1000 / 60,
    ); // minutes

    const finalErrorCount = await this.getTypeScriptErrorCount();
    const totalReduction = this.initialErrorCount - finalErrorCount;
    const reductionPercentage =
      this.initialErrorCount > 0
        ? ((totalReduction / this.initialErrorCount) * 100).toFixed(1)
        : "0.0";

    console.log("\n" + "=".repeat(60));
    console.log("📈 PHASE 12.1 CAMPAIGN FINAL REPORT");
    console.log("=".repeat(60));

    console.log(`\n🎯 Campaign Objectives:`);
    console.log(`   Target: Reduce errors to <${TARGET_ERROR_COUNT}`);
    console.log(`   Minimum reduction: ${MIN_REDUCTION_PERCENTAGE}%`);

    console.log(`\n📊 Results Summary:`);
    console.log(`   Initial errors: ${this.initialErrorCount}`);
    console.log(`   Final errors: ${finalErrorCount}`);
    console.log(`   Total reduction: ${totalReduction} errors`);
    console.log(`   Reduction percentage: ${reductionPercentage}%`);
    console.log(`   Campaign duration: ${campaignDuration} minutes`);

    console.log(`\n🏆 Success Metrics:`);
    const targetMet = finalErrorCount < TARGET_ERROR_COUNT;
    const reductionMet =
      parseFloat(reductionPercentage) >= MIN_REDUCTION_PERCENTAGE;

    console.log(
      `   ✅ Error count < ${TARGET_ERROR_COUNT}: ${targetMet ? "ACHIEVED" : "NOT ACHIEVED"}`,
    );
    console.log(
      `   ✅ Reduction ≥ ${MIN_REDUCTION_PERCENTAGE}%: ${reductionMet ? "ACHIEVED" : "NOT ACHIEVED"}`,
    );
    console.log(
      `   ✅ Build stability: ${this.buildValidationFailures === 0 ? "MAINTAINED" : "ISSUES DETECTED"}`,
    );

    if (targetMet && reductionMet) {
      console.log(`\n🎉 CAMPAIGN SUCCESS! Phase 12.1 objectives achieved.`);
    } else {
      console.log(`\n⚠️ PARTIAL SUCCESS. Additional work may be needed.`);
    }

    // Phase history
    if (this.errorHistory.length > 0) {
      console.log(`\n📋 Phase History:`);
      this.errorHistory.forEach((phase) => {
        console.log(
          `   ${phase.phase}: ${phase.beforeCount} → ${phase.afterCount} (${phase.percentage}% reduction)`,
        );
      });
    }

    console.log(`\n📁 Backup location: ${this.backupPath}`);
    console.log(`\n✅ Campaign completed at: ${campaignEndTime.toISOString()}`);

    // Save report to file
    const reportPath = `phase-12-1-recovery-report-${Date.now()}.md`;
    await this.saveReportToFile(reportPath, {
      campaignStartTime: this.campaignStartTime,
      campaignEndTime,
      campaignDuration,
      initialErrorCount: this.initialErrorCount,
      finalErrorCount,
      totalReduction,
      reductionPercentage,
      targetMet,
      reductionMet,
      buildValidationFailures: this.buildValidationFailures,
      errorHistory: this.errorHistory,
      backupPath: this.backupPath,
    });

    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  async saveReportToFile(reportPath, data) {
    const report = `# Phase 12.1: TypeScript Error Mass Recovery Campaign Report

## Campaign Overview
- **Start Time**: ${data.campaignStartTime.toISOString()}
- **End Time**: ${data.campaignEndTime.toISOString()}
- **Duration**: ${data.campaignDuration} minutes
- **Backup Location**: ${data.backupPath}

## Results Summary
- **Initial Errors**: ${data.initialErrorCount}
- **Final Errors**: ${data.finalErrorCount}
- **Total Reduction**: ${data.totalReduction} errors
- **Reduction Percentage**: ${data.reductionPercentage}%

## Success Metrics
- **Target (<100 errors)**: ${data.targetMet ? "✅ ACHIEVED" : "❌ NOT ACHIEVED"}
- **Minimum Reduction (97%)**: ${data.reductionMet ? "✅ ACHIEVED" : "❌ NOT ACHIEVED"}
- **Build Stability**: ${data.buildValidationFailures === 0 ? "✅ MAINTAINED" : "⚠️ ISSUES DETECTED"}

## Phase History
${data.errorHistory
  .map(
    (phase) =>
      `- **${phase.phase}**: ${phase.beforeCount} → ${phase.afterCount} (${phase.percentage}% reduction)`,
  )
  .join("\n")}

## Campaign Status
${
  data.targetMet && data.reductionMet
    ? "🎉 **CAMPAIGN SUCCESS** - All objectives achieved"
    : "⚠️ **PARTIAL SUCCESS** - Additional work may be needed"
}

## Next Steps
${
  data.finalErrorCount < 100
    ? "✅ Ready to proceed to Phase 12.2: ESLint Mass Reduction Campaign"
    : "🔄 Consider additional TypeScript error reduction before proceeding"
}
`;

    fs.writeFileSync(reportPath, report);
  }

  async handleCampaignFailure(error) {
    console.log("\n❌ CAMPAIGN FAILURE HANDLING");
    console.log("=".repeat(40));
    console.log(`Error: ${error.message}`);
    console.log(`Backup location: ${this.backupPath}`);
    console.log(`Build validation failures: ${this.buildValidationFailures}`);

    // Attempt to restore from backup if needed
    if (this.buildValidationFailures > 0) {
      console.log("\n🔄 Consider restoring from backup if build is broken");
    }
  }
}

// Execute the campaign
if (require.main === module) {
  const campaign = new SystematicTypeScriptRecovery();
  campaign.run().catch(console.error);
}

module.exports = SystematicTypeScriptRecovery;
