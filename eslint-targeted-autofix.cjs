#!/usr/bin/env node

/**
 * ESLint Targeted Auto-Fix
 *
 * Focuses on specific auto-fixable rules with high success rates
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class TargetedAutoFix {
  constructor() {
    this.fixedFiles = 0;
    this.processedFiles = 0;
    this.logFile = "eslint-targeted-autofix.log";

    // Target specific auto-fixable rules
    this.targetRules = [
      "@typescript-eslint/no-unnecessary-type-assertion",
      "import/order",
      "import/no-duplicates",
    ];

    this.log("ESLint Targeted Auto-Fix Started");
    this.log(`Targeting rules: ${this.targetRules.join(", ")}`);
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + "\n");
  }

  async getFilesWithTargetedIssues() {
    try {
      this.log("Finding files with targeted auto-fixable issues...");

      const ruleFilter = this.targetRules
        .map((rule) => `select(.ruleId == "${rule}")`)
        .join(" or ");

      const command = `yarn lint --format=json 2>/dev/null | jq -r '.[] | select(.messages | length > 0) | select(.messages[] | ${ruleFilter}) | .filePath'`;

      const output = execSync(command, {
        encoding: "utf8",
        maxBuffer: 5 * 1024 * 1024,
      });

      const files = [
        ...new Set(
          output
            .trim()
            .split("\n")
            .filter((f) => f.length > 0),
        ),
      ];
      this.log(`Found ${files.length} files with targeted issues`);

      return files;
    } catch (error) {
      this.log(`Error finding files: ${error.message}`);
      return [];
    }
  }

  async fixFile(filePath) {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      this.log(`Processing: ${relativePath}`);

      // Create backup
      const backupPath = filePath + ".autofix-backup";
      fs.copyFileSync(filePath, backupPath);

      // Apply fixes for targeted rules only
      const ruleArgs = this.targetRules
        .map((rule) => `--rule "${rule}: error"`)
        .join(" ");

      execSync(`yarn lint --fix ${ruleArgs} "${filePath}"`, {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 30000,
      });

      // Quick syntax check
      try {
        execSync(`node -c "${filePath}"`, {
          encoding: "utf8",
          stdio: "pipe",
          timeout: 5000,
        });

        // Success - remove backup
        fs.unlinkSync(backupPath);
        this.fixedFiles++;
        this.log(`✅ Fixed: ${relativePath}`);
        return true;
      } catch (syntaxError) {
        // Syntax error - restore backup
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
        this.log(`❌ Syntax error after fix, restored: ${relativePath}`);
        return false;
      }
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`);

      // Restore backup if exists
      const backupPath = filePath + ".autofix-backup";
      if (fs.existsSync(backupPath)) {
        try {
          fs.copyFileSync(backupPath, filePath);
          fs.unlinkSync(backupPath);
        } catch (restoreError) {
          this.log(`Error restoring backup: ${restoreError.message}`);
        }
      }

      return false;
    }
  }

  async processFiles() {
    const files = await this.getFilesWithTargetedIssues();

    if (files.length === 0) {
      this.log("No files found with targeted auto-fixable issues");
      return;
    }

    this.log(`Processing ${files.length} files...`);

    for (let i = 0; i < files.length; i++) {
      const filePath = files[i];
      this.processedFiles++;

      await this.fixFile(filePath);

      // Progress update
      if (i % 10 === 0 || i === files.length - 1) {
        const progress = (((i + 1) / files.length) * 100).toFixed(1);
        this.log(`Progress: ${progress}% (${i + 1}/${files.length} files)`);
      }
    }
  }

  async getIssueStats() {
    try {
      const ruleFilter = this.targetRules
        .map((rule) => `select(.ruleId == "${rule}")`)
        .join(" or ");

      const command = `yarn lint --format=json 2>/dev/null | jq '[.[] | .messages[] | ${ruleFilter}] | length'`;

      const output = execSync(command, {
        encoding: "utf8",
        timeout: 30000,
      });

      return parseInt(output.trim()) || 0;
    } catch (error) {
      this.log(`Error getting issue stats: ${error.message}`);
      return -1;
    }
  }

  async validateBuild() {
    try {
      this.log("Validating TypeScript compilation...");

      execSync("yarn tsc --noEmit --skipLibCheck", {
        encoding: "utf8",
        stdio: "pipe",
        timeout: 120000, // 2 minutes
      });

      this.log("✅ TypeScript compilation successful");
      return true;
    } catch (error) {
      this.log(`❌ TypeScript compilation failed: ${error.message}`);
      return false;
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      targetRules: this.targetRules,
      processedFiles: this.processedFiles,
      fixedFiles: this.fixedFiles,
      success: this.fixedFiles > 0,
    };

    fs.writeFileSync(
      "eslint-targeted-autofix-report.json",
      JSON.stringify(report, null, 2),
    );

    this.log("=".repeat(60));
    this.log("ESLint Targeted Auto-Fix Completed");
    this.log(`Target rules: ${this.targetRules.join(", ")}`);
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Files fixed: ${this.fixedFiles}`);
    this.log("=".repeat(60));

    return report;
  }
}

// Main execution
async function main() {
  const fixer = new TargetedAutoFix();

  try {
    // Get initial issue count
    const initialIssues = await fixer.getIssueStats();
    fixer.log(`Initial targeted issues: ${initialIssues}`);

    // Process files
    await fixer.processFiles();

    // Validate build
    const buildValid = await fixer.validateBuild();

    // Get final issue count
    const finalIssues = await fixer.getIssueStats();
    fixer.log(`Final targeted issues: ${finalIssues}`);

    if (initialIssues >= 0 && finalIssues >= 0) {
      const reduction = initialIssues - finalIssues;
      fixer.log(`Issues fixed: ${reduction}`);
    }

    if (!buildValid) {
      fixer.log(
        "⚠️  Build validation failed - some fixes may need manual review",
      );
    }
  } catch (error) {
    fixer.log(`Fatal error: ${error.message}`);
  } finally {
    fixer.generateReport();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TargetedAutoFix };
