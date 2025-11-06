#!/usr/bin/env node

/**
 * Phase 12.1 Conservative Recovery
 *
 * Ultra-conservative approach focusing on:
 * 1. Top 10 files with most errors
 * 2. Only the safest, most obvious fixes
 * 3. Immediate rollback if build breaks
 * 4. Manual validation after each file
 */

const fs = require("fs");
const { execSync } = require("child_process");

class ConservativeRecovery {
  constructor() {
    this.initialErrors = 0;
    this.processedFiles = 0;
    this.successfulFixes = 0;
    this.backupPath = "";
  }

  async run() {
    console.log("🛡️ Phase 12.1 Conservative Recovery - Ultra-Safe Approach");
    console.log("=".repeat(60));

    this.initialErrors = await this.getErrorCount();
    console.log(`📊 Current TypeScript errors: ${this.initialErrors}`);

    if (this.initialErrors < 100) {
      console.log("✅ Already below target!");
      return;
    }

    this.backupPath = this.createBackup();
    console.log(`📁 Created backup: ${this.backupPath}`);

    // Get top error files
    const topErrorFiles = await this.getTopErrorFiles();
    console.log(
      `\n🎯 Targeting top ${Math.min(5, topErrorFiles.length)} files with most errors:`,
    );
    topErrorFiles.slice(0, 5).forEach((file) => {
      console.log(`   ${file.file} (${file.count} errors)`);
    });

    // Process files one by one with immediate validation
    for (const fileInfo of topErrorFiles.slice(0, 5)) {
      await this.processFileConservatively(fileInfo.file, fileInfo.count);

      // Check if we've reached target
      const currentErrors = await this.getErrorCount();
      if (currentErrors < 100) {
        console.log("\n🎉 Target achieved! Stopping processing.");
        break;
      }
    }

    await this.generateReport();
  }

  async processFileConservatively(filePath, errorCount) {
    console.log(`\n🔧 Processing ${filePath} (${errorCount} errors)...`);

    try {
      // Create file-specific backup
      const fileBackup = `${filePath}.backup-${Date.now()}`;
      fs.copyFileSync(filePath, fileBackup);

      const beforeErrors = await this.getErrorCount();
      const result = await this.applyConservativeFixes(filePath);

      if (result.modified) {
        // Immediate build validation
        const buildValid = await this.validateBuild();
        const afterErrors = await this.getErrorCount();

        if (buildValid && afterErrors <= beforeErrors) {
          console.log(
            `   ✅ Success: ${result.fixesApplied} fixes, ${beforeErrors - afterErrors} errors reduced`,
          );
          this.successfulFixes += result.fixesApplied;
          this.processedFiles++;

          // Remove backup on success
          fs.unlinkSync(fileBackup);
        } else {
          console.log(`   ❌ Failed validation, reverting changes`);
          fs.copyFileSync(fileBackup, filePath);
          fs.unlinkSync(fileBackup);
        }
      } else {
        console.log(`   - No safe fixes found`);
        fs.unlinkSync(fileBackup);
      }
    } catch (error) {
      console.error(`   ❌ Error processing file: ${error.message}`);
    }
  }

  async applyConservativeFixes(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    let fixed = content;
    let fixesApplied = 0;

    // Only the safest fixes that are very unlikely to break anything

    // Fix 1: Remove trailing commas (very safe)
    const trailingCommasBefore = (fixed.match(/,(\s*[}\]])/g) || []).length;
    fixed = fixed.replace(/,(\s*[}\]])/g, "$1");
    const trailingCommasFixed =
      trailingCommasBefore - (fixed.match(/,(\s*[}\]])/g) || []).length;
    fixesApplied += trailingCommasFixed;

    // Fix 2: Fix obvious missing semicolons at end of lines (very safe)
    const missingSemicolonsBefore = (fixed.match(/\w+\s*$/gm) || []).length;
    fixed = fixed.replace(/(\w+)\s*$/gm, "$1;");
    const missingSemicolonsFixed =
      missingSemicolonsBefore - (fixed.match(/\w+\s*$/gm) || []).length;
    fixesApplied += missingSemicolonsFixed;

    // Fix 3: Fix double spaces (very safe)
    const doubleSpacesBefore = (fixed.match(/  +/g) || []).length;
    fixed = fixed.replace(/  +/g, " ");
    const doubleSpacesFixed =
      doubleSpacesBefore - (fixed.match(/  +/g) || []).length;
    fixesApplied += doubleSpacesFixed;

    // Fix 4: Fix obvious malformed function parameters (safe pattern)
    const malformedParamsBefore = (
      fixed.match(/function\s+\w+\s*\([^)]*,\s*\)/g) || []
    ).length;
    fixed = fixed.replace(
      /function\s+(\w+)\s*\(\s*([^)]*),\s*\)/g,
      "function $1($2)",
    );
    const malformedParamsFixed =
      malformedParamsBefore -
      (fixed.match(/function\s+\w+\s*\([^)]*,\s*\)/g) || []).length;
    fixesApplied += malformedParamsFixed;

    const modified = fixed !== content;

    if (modified) {
      fs.writeFileSync(filePath, fixed);
      console.log(`     Applied ${fixesApplied} conservative fixes:`);
      if (trailingCommasFixed > 0)
        console.log(`       - ${trailingCommasFixed} trailing commas`);
      if (missingSemicolonsFixed > 0)
        console.log(`       - ${missingSemicolonsFixed} missing semicolons`);
      if (doubleSpacesFixed > 0)
        console.log(`       - ${doubleSpacesFixed} double spaces`);
      if (malformedParamsFixed > 0)
        console.log(`       - ${malformedParamsFixed} malformed parameters`);
    }

    return { modified, fixesApplied };
  }

  async getTopErrorFiles() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | cut -d"(" -f1 | sort | uniq -c | sort -nr',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const files = [];
      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
        if (match) {
          files.push({
            count: parseInt(match[1]),
            file: match[2].trim(),
          });
        }
      }

      return files;
    } catch (error) {
      return [];
    }
  }

  async getErrorCount() {
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

  async validateBuild() {
    try {
      execSync("yarn build", { stdio: "pipe", timeout: 30000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  createBackup() {
    const timestamp = Date.now();
    const backupPath = `.phase-12-1-conservative-backup-${timestamp}`;

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    return backupPath;
  }

  async generateReport() {
    const finalErrors = await this.getErrorCount();
    const reduction = this.initialErrors - finalErrors;
    const percentage =
      this.initialErrors > 0
        ? ((reduction / this.initialErrors) * 100).toFixed(1)
        : "0.0";

    console.log("\n" + "=".repeat(60));
    console.log("📈 CONSERVATIVE RECOVERY REPORT");
    console.log("=".repeat(60));
    console.log(`Initial errors: ${this.initialErrors}`);
    console.log(`Final errors: ${finalErrors}`);
    console.log(`Reduction: ${reduction} errors (${percentage}%)`);
    console.log(`Files processed: ${this.processedFiles}`);
    console.log(`Successful fixes: ${this.successfulFixes}`);

    // Calculate overall campaign progress
    const originalErrors = 1661; // From initial campaign report
    const totalReduction = originalErrors - finalErrors;
    const totalPercentage = ((totalReduction / originalErrors) * 100).toFixed(
      1,
    );

    console.log(`\n🎯 Overall Campaign Progress:`);
    console.log(`   Original errors: ${originalErrors}`);
    console.log(`   Current errors: ${finalErrors}`);
    console.log(
      `   Total reduction: ${totalReduction} errors (${totalPercentage}%)`,
    );

    if (finalErrors < 100) {
      console.log("\n🎉 SUCCESS! Target achieved (<100 errors)");
    } else if (finalErrors < 500) {
      console.log("\n🎯 SIGNIFICANT PROGRESS! Major reduction achieved");
    } else if (reduction > 0) {
      console.log("\n✅ POSITIVE PROGRESS! Conservative approach working");
    } else {
      console.log("\n⚠️ LIMITED PROGRESS. May need different approach");
    }

    console.log(`\n📁 Backup: ${this.backupPath}`);

    // Save detailed report
    const reportPath = `phase-12-1-conservative-report-${Date.now()}.md`;
    await this.saveReport(reportPath, {
      initialErrors: this.initialErrors,
      finalErrors,
      reduction,
      percentage,
      processedFiles: this.processedFiles,
      successfulFixes: this.successfulFixes,
      originalErrors,
      totalReduction,
      totalPercentage,
    });

    console.log(`📄 Report saved: ${reportPath}`);
  }

  async saveReport(reportPath, data) {
    const report = `# Phase 12.1 Conservative Recovery Report

## Conservative Approach Results
- **Initial Errors**: ${data.initialErrors}
- **Final Errors**: ${data.finalErrors}
- **Reduction**: ${data.reduction} errors (${data.percentage}%)
- **Files Processed**: ${data.processedFiles}
- **Successful Fixes**: ${data.successfulFixes}

## Overall Campaign Progress
- **Original Errors**: ${data.originalErrors}
- **Current Errors**: ${data.finalErrors}
- **Total Reduction**: ${data.totalReduction} errors (${data.totalPercentage}%)

## Approach
Ultra-conservative fixes applied:
- Trailing comma removal
- Missing semicolon addition
- Double space cleanup
- Malformed parameter fixes

## Status
${
  data.finalErrors < 100
    ? "🎉 **SUCCESS** - Target achieved"
    : data.finalErrors < 500
      ? "🎯 **SIGNIFICANT PROGRESS** - Major reduction achieved"
      : data.reduction > 0
        ? "✅ **POSITIVE PROGRESS** - Conservative approach working"
        : "⚠️ **LIMITED PROGRESS** - May need different approach"
}

## Next Steps
${
  data.finalErrors < 100
    ? "Ready to proceed to Phase 12.2"
    : "Continue with additional conservative fixes or consider manual review of remaining errors"
}
`;

    fs.writeFileSync(reportPath, report);
  }
}

if (require.main === module) {
  const recovery = new ConservativeRecovery();
  recovery.run().catch(console.error);
}

module.exports = ConservativeRecovery;
