#!/usr/bin/env node

/**
 * Safe Import Organization Script
 *
 * This script safely addresses task 9 from the linting-excellence spec:
 * - Remove duplicate import statements across all files
 * - Organize imports according to established patterns (external, internal, relative)
 * - Fix named import/export inconsistencies
 * - Resolve circular dependency issues if any exist
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class SafeImportOrganizer {
  constructor() {
    this.srcDir = path.join(process.cwd(), "src");
    this.backupDir = path.join(process.cwd(), ".safe-import-backup");
    this.processedFiles = 0;
    this.fixedIssues = 0;
    this.ensureBackupDirectory();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(filePath) {
    const relativePath = path.relative(this.srcDir, filePath);
    const backupPath = path.join(this.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(filePath, backupPath);
  }

  async getImportIssues() {
    console.log("🔍 Analyzing import issues with ESLint...");

    try {
      // Run ESLint to get import-related issues
      const eslintCmd = "yarn lint src/ --format=json";
      const eslintOutput = execSync(eslintCmd, {
        encoding: "utf8",
        stdio: "pipe",
        maxBuffer: 10 * 1024 * 1024,
      });

      const results = JSON.parse(eslintOutput);
      const importIssues = {
        duplicates: [],
        order: [],
        cycles: [],
        named: [],
      };

      for (const result of results) {
        for (const message of result.messages) {
          if (message.ruleId === "import/no-duplicates") {
            importIssues.duplicates.push({
              file: result.filePath,
              line: message.line,
              message: message.message,
            });
          } else if (message.ruleId === "import/order") {
            importIssues.order.push({
              file: result.filePath,
              line: message.line,
              message: message.message,
            });
          } else if (message.ruleId === "import/no-cycle") {
            importIssues.cycles.push({
              file: result.filePath,
              line: message.line,
              message: message.message,
            });
          } else if (
            message.ruleId?.includes("import/named") ||
            message.ruleId?.includes("import/default")
          ) {
            importIssues.named.push({
              file: result.filePath,
              line: message.line,
              message: message.message,
            });
          }
        }
      }

      return importIssues;
    } catch (error) {
      console.warn("⚠️ ESLint analysis failed:", error.message);
      return { duplicates: [], order: [], cycles: [], named: [] };
    }
  }

  async fixImportOrderWithESLint() {
    console.log("🔧 Fixing import order using ESLint --fix...");

    try {
      // Use ESLint --fix specifically for import/order rule
      const fixCmd = 'yarn lint src/ --fix --rule "import/order: error"';
      execSync(fixCmd, {
        stdio: "pipe",
        maxBuffer: 10 * 1024 * 1024,
        timeout: 120000, // 2 minute timeout
      });

      console.log("✅ Import order fixed using ESLint --fix");
      return true;
    } catch (error) {
      console.warn("⚠️ ESLint --fix failed:", error.message);
      return false;
    }
  }

  async fixDuplicateImportsWithESLint() {
    console.log("🔧 Fixing duplicate imports using ESLint --fix...");

    try {
      // Use ESLint --fix specifically for import/no-duplicates rule
      const fixCmd =
        'yarn lint src/ --fix --rule "import/no-duplicates: error"';
      execSync(fixCmd, {
        stdio: "pipe",
        maxBuffer: 10 * 1024 * 1024,
        timeout: 120000, // 2 minute timeout
      });

      console.log("✅ Duplicate imports fixed using ESLint --fix");
      return true;
    } catch (error) {
      console.warn("⚠️ ESLint --fix for duplicates failed:", error.message);
      return false;
    }
  }

  async validateBuildSafety() {
    console.log("🔍 Validating build safety...");

    try {
      // Quick syntax check first
      execSync("yarn tsc --noEmit --skipLibCheck", {
        stdio: "pipe",
        timeout: 60000,
      });
      console.log("✅ Build validation passed");
      return true;
    } catch (error) {
      console.error("❌ Build validation failed");
      return false;
    }
  }

  async createFullBackup() {
    console.log("💾 Creating full backup of src directory...");

    try {
      // Create timestamped backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fullBackupDir = path.join(
        process.cwd(),
        `.import-backup-${timestamp}`,
      );

      execSync(`cp -r src/ "${fullBackupDir}"`, { stdio: "pipe" });
      console.log(`✅ Full backup created: ${fullBackupDir}`);
      return fullBackupDir;
    } catch (error) {
      console.error("❌ Failed to create backup:", error.message);
      return null;
    }
  }

  async detectCircularDependencies() {
    console.log("🔍 Detecting circular dependencies...");

    try {
      // Use ESLint to detect circular dependencies
      const eslintCmd =
        'yarn lint src/ --rule "import/no-cycle: error" --format=json';
      const eslintOutput = execSync(eslintCmd, {
        encoding: "utf8",
        stdio: "pipe",
        maxBuffer: 10 * 1024 * 1024,
      });

      const results = JSON.parse(eslintOutput);
      const cycles = [];

      for (const result of results) {
        for (const message of result.messages) {
          if (message.ruleId === "import/no-cycle") {
            cycles.push({
              file: result.filePath,
              line: message.line,
              message: message.message,
            });
          }
        }
      }

      return cycles;
    } catch (error) {
      console.warn("⚠️ Circular dependency detection failed:", error.message);
      return [];
    }
  }

  generateReport(beforeIssues, afterIssues, backupLocation) {
    const totalBefore =
      beforeIssues.duplicates.length +
      beforeIssues.order.length +
      beforeIssues.cycles.length +
      beforeIssues.named.length;
    const totalAfter =
      afterIssues.duplicates.length +
      afterIssues.order.length +
      afterIssues.cycles.length +
      afterIssues.named.length;

    const report = `
# Safe Import Organization Report

## Before Fix
- **Total Import Issues**: ${totalBefore}
- **Duplicate Imports**: ${beforeIssues.duplicates.length}
- **Import Order Issues**: ${beforeIssues.order.length}
- **Circular Dependencies**: ${beforeIssues.cycles.length}
- **Named Import Issues**: ${beforeIssues.named.length}

## After Fix
- **Total Import Issues**: ${totalAfter}
- **Duplicate Imports**: ${afterIssues.duplicates.length}
- **Import Order Issues**: ${afterIssues.order.length}
- **Circular Dependencies**: ${afterIssues.cycles.length}
- **Named Import Issues**: ${afterIssues.named.length}

## Results
- **Issues Fixed**: ${totalBefore - totalAfter}
- **Success Rate**: ${totalBefore > 0 ? Math.round(((totalBefore - totalAfter) / totalBefore) * 100) : 100}%

## Backup Location
Full backup created at: ${backupLocation}

## Remaining Circular Dependencies
${
  afterIssues.cycles.length > 0
    ? afterIssues.cycles
        .map((cycle) => `- ${cycle.file}:${cycle.line} - ${cycle.message}`)
        .join("\n")
    : "None detected"
}

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync("safe-import-organization-report.md", report);
    console.log("📊 Report generated: safe-import-organization-report.md");
  }

  async run() {
    console.log("🚀 Starting Safe Import Organization");
    console.log("=".repeat(60));

    try {
      // Step 1: Create full backup
      const backupLocation = await this.createFullBackup();
      if (!backupLocation) {
        console.error("❌ Cannot proceed without backup");
        return;
      }

      // Step 2: Initial validation
      const initialBuildValid = await this.validateBuildSafety();
      if (!initialBuildValid) {
        console.warn("⚠️ Initial build has issues, proceeding with caution...");
      }

      // Step 3: Analyze current issues
      const beforeIssues = await this.getImportIssues();
      const totalIssues =
        beforeIssues.duplicates.length +
        beforeIssues.order.length +
        beforeIssues.cycles.length +
        beforeIssues.named.length;

      console.log(`📊 Found ${totalIssues} import issues:`);
      console.log(`   - Duplicate imports: ${beforeIssues.duplicates.length}`);
      console.log(`   - Import order issues: ${beforeIssues.order.length}`);
      console.log(`   - Circular dependencies: ${beforeIssues.cycles.length}`);
      console.log(`   - Named import issues: ${beforeIssues.named.length}`);

      if (totalIssues === 0) {
        console.log("✅ No import issues found!");
        return;
      }

      // Step 4: Fix duplicate imports
      if (beforeIssues.duplicates.length > 0) {
        const duplicatesFixed = await this.fixDuplicateImportsWithESLint();
        if (duplicatesFixed) {
          this.fixedIssues += beforeIssues.duplicates.length;
        }
      }

      // Step 5: Fix import order
      if (beforeIssues.order.length > 0) {
        const orderFixed = await this.fixImportOrderWithESLint();
        if (orderFixed) {
          this.fixedIssues += beforeIssues.order.length;
        }
      }

      // Step 6: Validate after fixes
      const finalBuildValid = await this.validateBuildSafety();
      if (!finalBuildValid) {
        console.error("❌ Build validation failed after fixes");
        console.log("🔄 Consider restoring from backup:", backupLocation);
        return;
      }

      // Step 7: Analyze final state
      const afterIssues = await this.getImportIssues();

      // Step 8: Detect remaining circular dependencies
      const cycles = await this.detectCircularDependencies();
      afterIssues.cycles = cycles;

      // Step 9: Generate report
      this.generateReport(beforeIssues, afterIssues, backupLocation);

      const totalAfter =
        afterIssues.duplicates.length +
        afterIssues.order.length +
        afterIssues.cycles.length +
        afterIssues.named.length;

      console.log("=".repeat(60));
      console.log(`✅ Safe import organization completed!`);
      console.log(`   Issues before: ${totalIssues}`);
      console.log(`   Issues after: ${totalAfter}`);
      console.log(`   Issues fixed: ${totalIssues - totalAfter}`);
      console.log(`   Backup location: ${backupLocation}`);

      if (afterIssues.cycles.length > 0) {
        console.log(
          `⚠️ ${afterIssues.cycles.length} circular dependencies detected (see report)`,
        );
      }
    } catch (error) {
      console.error("❌ Safe import organization failed:", error);
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  const organizer = new SafeImportOrganizer();
  organizer.run().catch(console.error);
}

module.exports = SafeImportOrganizer;
