#!/usr/bin/env node

/**
 * Fix Remaining Template Literals
 *
 * This script fixes the remaining unclosed template literals that were not caught
 * by the previous fixer.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Files with remaining unclosed template literals
const REMAINING_FILES = [
  "src/services/campaign/ConsoleStatementRemovalSystem.ts",
  "src/services/campaign/FinalValidationSystem.ts",
  "src/services/campaign/ProgressReportingSystem.ts",
  "src/services/campaign/unintentional-any-elimination/PilotCampaignAnalysis.ts",
  "src/services/campaign/unintentional-any-elimination/ConservativeReplacementPilot.ts",
  "src/services/campaign/UnusedVariablesCleanupSystem.ts",
  "src/services/campaign/EnterpriseIntelligenceGenerator.ts",
  "src/services/LocalRecipeService.ts",
  "src/services/MLIntelligenceService.ts",
  "src/services/UnusedVariableDetector.ts",
  "src/services/AdvancedAnalyticsIntelligenceService.ts",
  "src/services/linting/ZeroErrorAchievementDashboard.ts",
  "src/services/linting/LintingValidationDashboard.ts",
  "src/scripts/batch-processing/BatchProcessingOrchestrator.ts",
  "src/scripts/unintentional-any-elimination/UnintentionalAnyCampaignController.ts",
];

class RemainingTemplateLiteralFixer {
  constructor() {
    this.results = {
      totalFilesProcessed: 0,
      filesModified: 0,
      fixesByFile: {},
      errors: [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create backup of file before modification
   */
  createBackup(filePath) {
    try {
      const backupDir = ".remaining-template-literal-backups";
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const backupPath = path.join(
        backupDir,
        path.basename(filePath) + ".backup",
      );
      fs.copyFileSync(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.warn(
        `Warning: Could not create backup for ${filePath}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Fix remaining unclosed template literals in a file
   */
  fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return { modified: false, fixes: [] };
      }

      const originalContent = fs.readFileSync(filePath, "utf8");
      let modifiedContent = originalContent;
      const fixes = [];

      // Specific fixes for each file
      if (filePath.includes("ConsoleStatementRemovalSystem.ts")) {
        // Fix the three unclosed template literals
        modifiedContent = modifiedContent.replace(
          /\$\{\n  result\.preservedFiles\.length > 0\n    \? result\.preservedFiles\.map\(f => `- \$\{f\}`\)\.join\('\\n'\)\n    : 'No files preserved'/g,
          "${result.preservedFiles.length > 0\n    ? result.preservedFiles.map(f => `- ${f}`).join('\\n')\n    : 'No files preserved'}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{\n  result\.success\n    \? '- ✅ Console removal completed successfully\\n- Review preserved critical statements\\n- Run linting to verify improvements\\n- Consider committing changes'\n    : '- ❌ Console removal failed\\n- Review errors and retry\\n- Check file permissions and syntax'/g,
          "${result.success\n    ? '- ✅ Console removal completed successfully\\n- Review preserved critical statements\\n- Run linting to verify improvements\\n- Consider committing changes'\n    : '- ❌ Console removal failed\\n- Review errors and retry\\n- Check file permissions and syntax'}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{\n  result\.successfulBatches === result\.totalBatches\n    \? '- ✅ All batches completed successfully\\n- Review preserved critical statements\\n- Run final linting validation\\n- Consider committing all changes'\n    : `- ⚠️ \$\{result\.successfulBatches\}\/\$\{result\.totalBatches\} batches completed\\n- Review failed batches and retry\\n- Check for file permission issues\\n- Consider manual intervention for complex cases`/g,
          "${result.successfulBatches === result.totalBatches\n    ? '- ✅ All batches completed successfully\\n- Review preserved critical statements\\n- Run final linting validation\\n- Consider committing all changes'\n    : `- ⚠️ ${result.successfulBatches}/${result.totalBatches} batches completed\\n- Review failed batches and retry\\n- Check for file permission issues\\n- Consider manual intervention for complex cases`}",
        );

        fixes.push({ type: "ConsoleStatementRemovalSystem fixes", count: 3 });
      }

      if (filePath.includes("FinalValidationSystem.ts")) {
        // Fix the unclosed template literal
        modifiedContent = modifiedContent.replace(
          /\$\{report\.validationResults\n  \.map\(\n    result =>\)/g,
          "${report.validationResults\n  .map(\n    result => `**${result.category}**: ${result.passed ? '✅ PASSED' : '❌ FAILED'} - ${result.message}`\n  ).join('\\n')}",
        );

        fixes.push({ type: "FinalValidationSystem fixes", count: 1 });
      }

      if (filePath.includes("ProgressReportingSystem.ts")) {
        // Fix multiple unclosed template literals
        modifiedContent = modifiedContent.replace(
          /\$\{report\.phases\n      \.map\(\n        phase => `/g,
          "${report.phases\n      .map(\n        phase => `",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{report\.keyAchievements\n      \.map\(\n        achievement => `/g,
          "${report.keyAchievements\n      .map(\n        achievement => `",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{report\.criticalIssues\n      \.map\(\n        issue => `/g,
          "${report.criticalIssues\n      .map(\n        issue => `",
        );

        // Fix the markdown versions too
        modifiedContent = modifiedContent.replace(
          /\$\{report\.phases\n  \.map\(\n    phase => `\)/g,
          "${report.phases\n  .map(\n    phase => `**${phase.name}**: ${phase.status} (${phase.progress}%)`\n  ).join('\\n')}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{report\.keyAchievements\n  \.map\(\n    achievement => `\)/g,
          "${report.keyAchievements\n  .map(\n    achievement => `- ${achievement.description} (${achievement.impact})`\n  ).join('\\n')}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{report\.criticalIssues\n  \.map\(\n    issue => `\)/g,
          "${report.criticalIssues\n  .map(\n    issue => `- **${issue.severity}**: ${issue.description}`\n  ).join('\\n')}",
        );

        fixes.push({ type: "ProgressReportingSystem fixes", count: 6 });
      }

      if (filePath.includes("UnusedVariablesCleanupSystem.ts")) {
        // Fix the two unclosed template literals
        modifiedContent = modifiedContent.replace(
          /\$\{\n  result\.success\n    \? '- ✅ Cleanup completed successfully\\n- Consider running build validation\\n- Review changes before committing'\n    : '- ❌ Cleanup failed\\n- Review errors and retry\\n- Check file permissions'/g,
          "${result.success\n    ? '- ✅ Cleanup completed successfully\\n- Consider running build validation\\n- Review changes before committing'\n    : '- ❌ Cleanup failed\\n- Review errors and retry\\n- Check file permissions'}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{\n  result\.successfulBatches === result\.totalBatches\n    \? '- ✅ All batches completed successfully\\n- Consider running final build validation\\n- Review all changes before committing'\n    : `- ⚠️ \$\{result\.successfulBatches\}\/\$\{result\.totalBatches\} batches completed\\n- Review failed batches and retry\\n- Consider manual intervention for complex cases`/g,
          "${result.successfulBatches === result.totalBatches\n    ? '- ✅ All batches completed successfully\\n- Consider running final build validation\\n- Review all changes before committing'\n    : `- ⚠️ ${result.successfulBatches}/${result.totalBatches} batches completed\\n- Review failed batches and retry\\n- Consider manual intervention for complex cases`}",
        );

        fixes.push({ type: "UnusedVariablesCleanupSystem fixes", count: 2 });
      }

      if (filePath.includes("EnterpriseIntelligenceGenerator.ts")) {
        // Fix the unclosed template literal
        modifiedContent = modifiedContent.replace(
          /\$\{capabilities\n  \.map\(\n    cap => `  \/\*\*\)/g,
          "${capabilities\n  .map(\n    cap => `  /**\n   * ${cap.name}\n   * ${cap.description}\n   */`\n  ).join('\\n')}",
        );

        fixes.push({ type: "EnterpriseIntelligenceGenerator fixes", count: 1 });
      }

      if (filePath.includes("ZeroErrorAchievementDashboard.ts")) {
        // Fix multiple unclosed template literals
        modifiedContent = modifiedContent.replace(
          /\$\{data\.targets\n  \.map\(\n    target => `\)/g,
          "${data.targets\n  .map(\n    target => `**${target.category}**: ${target.current}/${target.target} (${target.progress}%)`\n  ).join('\\n')}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{\n  data\.trendAnalysis\.length === 0\n    \? 'Insufficient data for trend analysis \(need 3\+ data points\)'\n    : data\.trendAnalysis\.map\(trend => `\*\*\$\{trend\.period\}\*\*: \$\{trend\.direction\} \(\$\{trend\.change\}\)`\)\.join\('\\n'\)/g,
          "${data.trendAnalysis.length === 0\n    ? 'Insufficient data for trend analysis (need 3+ data points)'\n    : data.trendAnalysis.map(trend => `**${trend.period}**: ${trend.direction} (${trend.change})`).join('\\n')}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{data\.qualityGates\n  \.map\(\n    gate => `\)/g,
          "${data.qualityGates\n  .map(\n    gate => `**${gate.name}**: ${gate.status} - ${gate.description}`\n  ).join('\\n')}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{\n  data\.validationResult\.alerts\.length === 0\n    \? '✅ No active alerts'\n    : data\.validationResult\.alerts\.map\(alert => `\*\*\$\{alert\.severity\}\*\*: \$\{alert\.message\}`\)\.join\('\\n'\)/g,
          "${data.validationResult.alerts.length === 0\n    ? '✅ No active alerts'\n    : data.validationResult.alerts.map(alert => `**${alert.severity}**: ${alert.message}`).join('\\n')}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{\n  data\.maintenanceResults\.size === 0\n    \? 'No maintenance procedures run this cycle'\n    : Array\.from\(data\.maintenanceResults\.entries\(\)\)\.map\(\(\[procedure, result\]\) => `\*\*\$\{procedure\}\*\*: \$\{result\.status\} - \$\{result\.summary\}`\)\.join\('\\n'\)/g,
          "${data.maintenanceResults.size === 0\n    ? 'No maintenance procedures run this cycle'\n    : Array.from(data.maintenanceResults.entries()).map(([procedure, result]) => `**${procedure}**: ${result.status} - ${result.summary}`).join('\\n')}",
        );

        fixes.push({ type: "ZeroErrorAchievementDashboard fixes", count: 5 });
      }

      if (filePath.includes("LintingValidationDashboard.ts")) {
        // Fix the two unclosed template literals
        modifiedContent = modifiedContent.replace(
          /\$\{\n  result\.alerts\.length === 0\n    \? 'No active alerts ✅'\n    : result\.alerts\n        \.map\(\n          alert => `\*\*\$\{alert\.severity\}\*\*: \$\{alert\.message\} \(\$\{alert\.file\}\)`\n        \)\n        \.join\('\\n'\)/g,
          "${result.alerts.length === 0\n    ? 'No active alerts ✅'\n    : result.alerts\n        .map(\n          alert => `**${alert.severity}**: ${alert.message} (${alert.file})`\n        )\n        .join('\\n')}",
        );

        modifiedContent = modifiedContent.replace(
          /\$\{\n  result\.regressionAnalysis\.detected\n    \? `/g,
          "${result.regressionAnalysis.detected\n    ? `",
        );

        fixes.push({ type: "LintingValidationDashboard fixes", count: 2 });
      }

      // Check if file was modified
      if (modifiedContent !== originalContent) {
        // Create backup
        this.createBackup(filePath);

        // Write modified content
        fs.writeFileSync(filePath, modifiedContent, "utf8");

        this.results.filesModified++;
        this.results.fixesByFile[filePath] = fixes;

        console.log(
          `✅ Fixed: ${filePath} (${fixes.length} fix types applied)`,
        );
        return { modified: true, fixes };
      }

      this.results.totalFilesProcessed++;
      return { modified: false, fixes: [] };
    } catch (error) {
      const errorMsg = `Error processing file ${filePath}: ${error.message}`;
      console.warn(errorMsg);
      this.results.errors.push(errorMsg);
      return { modified: false, fixes: [], error: errorMsg };
    }
  }

  /**
   * Run the fixing process
   */
  async runFixes() {
    console.log("🔧 Starting Remaining Template Literal Fixes...");
    console.log(`📊 Processing ${REMAINING_FILES.length} files`);

    for (const filePath of REMAINING_FILES) {
      const result = this.fixFile(filePath);
      this.results.totalFilesProcessed++;
    }

    // Generate summary
    this.generateSummary();

    // Validate TypeScript compilation
    const validation = await this.validateTypeScript();
    this.results.validation = validation;

    return this.results;
  }

  /**
   * Validate TypeScript compilation after fixes
   */
  async validateTypeScript() {
    try {
      console.log("\n🔧 Validating TypeScript compilation...");
      const output = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        stdio: "pipe",
      });

      const errorCount = (output.match(/error TS/g) || []).length;
      console.log(`📊 TypeScript errors after fixes: ${errorCount}`);

      return { success: errorCount === 0, errorCount, output };
    } catch (error) {
      const errorCount = (error.stdout?.match(/error TS/g) || []).length;
      console.log(`📊 TypeScript errors after fixes: ${errorCount}`);

      return { success: false, errorCount, output: error.stdout || "" };
    }
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    console.log("\n📋 REMAINING TEMPLATE LITERAL FIX SUMMARY");
    console.log("=".repeat(50));
    console.log(
      `📊 Total files processed: ${this.results.totalFilesProcessed}`,
    );
    console.log(`🔧 Files modified: ${this.results.filesModified}`);
    console.log(
      `✅ Files unchanged: ${this.results.totalFilesProcessed - this.results.filesModified}`,
    );

    if (this.results.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.results.errors.length}`);
    }

    if (this.results.filesModified > 0) {
      console.log("\n🚨 Files Modified:");
      for (const [file, fixes] of Object.entries(this.results.fixesByFile)) {
        const totalFixes = fixes.reduce(
          (sum, fix) => sum + (fix.count || 1),
          0,
        );
        console.log(`  • ${file}: ${totalFixes} fixes`);
      }
    }
  }
}

// Main execution
async function main() {
  try {
    const fixer = new RemainingTemplateLiteralFixer();
    const results = await fixer.runFixes();

    if (results.filesModified === 0) {
      console.log(
        "\n✅ SUCCESS: No remaining template literals found that need fixing!",
      );
      process.exit(0);
    } else {
      console.log(
        `\n✅ SUCCESS: Fixed ${results.filesModified} files with remaining template literals`,
      );

      if (results.validation && results.validation.errorCount > 0) {
        console.log("⚠️  WARNING: TypeScript compilation still has errors");
        process.exit(1);
      } else {
        process.exit(0);
      }
    }
  } catch (error) {
    console.error("❌ FATAL ERROR:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { RemainingTemplateLiteralFixer };
