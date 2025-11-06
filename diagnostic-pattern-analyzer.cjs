#!/usr/bin/env node

/**
 * Diagnostic Pattern Analyzer
 * Analyzes what happens when we apply proven patterns to understand validation failures
 * Focus: Understand why files fail validation even when TS1005 errors are eliminated
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class DiagnosticPatternAnalyzer {
  constructor() {
    this.backupDir = `.diagnostic-backup-${Date.now()}`;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get detailed error analysis for a file
   */
  getDetailedFileErrors(filePath) {
    try {
      const result = execSync(
        `yarn tsc --noEmit --skipLibCheck ${filePath} 2>&1`,
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      const errors = [];
      const lines = result
        .split("\n")
        .filter((line) => line.includes("error TS"));

      lines.forEach((line) => {
        const match = line.match(/error (TS\d+):\s*(.+)/);
        if (match) {
          errors.push({
            code: match[1],
            message: match[2],
          });
        }
      });

      return errors;
    } catch (error) {
      if (error.stdout) {
        const errors = [];
        const lines = error.stdout
          .split("\n")
          .filter((line) => line.includes("error TS"));

        lines.forEach((line) => {
          const match = line.match(/error (TS\d+):\s*(.+)/);
          if (match) {
            errors.push({
              code: match[1],
              message: match[2],
            });
          }
        });

        return errors;
      }
      return [];
    }
  }

  /**
   * Create backup of file
   */
  createBackup(filePath) {
    const backupPath = path.join(
      this.backupDir,
      filePath.replace(/[\/\\]/g, "_"),
    );
    const content = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(backupPath, content, "utf8");
  }

  /**
   * Apply proven patterns (same as before)
   */
  applyProvenPatterns(content) {
    let fixedContent = content;
    let fixes = 0;

    // PROVEN PATTERN 1: test('description': any, async () => {
    const testColonAnyPattern =
      /(\b(?:test|it|describe|beforeEach|afterEach|beforeAll|afterAll)\s*\(\s*'[^']+'):\s*any\s*,/g;
    const matches1 = [...fixedContent.matchAll(testColonAnyPattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(testColonAnyPattern, "$1,");
      fixes += matches1.length;
    }

    // PROVEN PATTERN 2: } catch (error): any {
    const catchColonAnyPattern = /(\}\s*catch\s*\([^)]+\)):\s*any\s*\{/g;
    const matches2 = [...fixedContent.matchAll(catchColonAnyPattern)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(catchColonAnyPattern, "$1 {");
      fixes += matches2.length;
    }

    // PROVEN PATTERN 3: ([_planet: any, position]: any) => {
    const destructuringColonAnyPattern = /(\[\s*[^,\]]+):\s*any\s*,/g;
    const matches3 = [...fixedContent.matchAll(destructuringColonAnyPattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(destructuringColonAnyPattern, "$1,");
      fixes += matches3.length;
    }

    return { content: fixedContent, fixes };
  }

  /**
   * Analyze a single file in detail
   */
  async analyzeFile(filePath) {
    console.log(`\n🔍 ANALYZING: ${path.basename(filePath)}`);
    console.log("=".repeat(60));

    // Get initial errors
    const initialErrors = this.getDetailedFileErrors(filePath);
    console.log(`📊 Initial errors (${initialErrors.length}):`);

    const errorCounts = {};
    initialErrors.forEach((error) => {
      errorCounts[error.code] = (errorCounts[error.code] || 0) + 1;
    });

    Object.entries(errorCounts).forEach(([code, count]) => {
      console.log(`   ${code}: ${count} errors`);
    });

    // Show first few TS1005 errors for context
    const ts1005Errors = initialErrors.filter((e) => e.code === "TS1005");
    if (ts1005Errors.length > 0) {
      console.log(`\n📝 Sample TS1005 errors:`);
      ts1005Errors.slice(0, 3).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error.message}`);
      });
    }

    // Create backup and apply patterns
    this.createBackup(filePath);
    const originalContent = fs.readFileSync(filePath, "utf8");
    const { content: fixedContent, fixes } =
      this.applyProvenPatterns(originalContent);

    if (fixes > 0) {
      fs.writeFileSync(filePath, fixedContent, "utf8");
      console.log(`\n🔧 Applied ${fixes} proven pattern fixes`);

      // Get errors after fixes
      const afterErrors = this.getDetailedFileErrors(filePath);
      console.log(`📊 Errors after fixes (${afterErrors.length}):`);

      const afterErrorCounts = {};
      afterErrors.forEach((error) => {
        afterErrorCounts[error.code] = (afterErrorCounts[error.code] || 0) + 1;
      });

      Object.entries(afterErrorCounts).forEach(([code, count]) => {
        console.log(`   ${code}: ${count} errors`);
      });

      // Show what new errors appeared
      const newErrorTypes = Object.keys(afterErrorCounts).filter(
        (code) => !errorCounts[code],
      );
      if (newErrorTypes.length > 0) {
        console.log(
          `\n⚠️  NEW error types introduced: ${newErrorTypes.join(", ")}`,
        );

        newErrorTypes.forEach((code) => {
          const newErrors = afterErrors.filter((e) => e.code === code);
          console.log(`\n${code} errors:`);
          newErrors.slice(0, 2).forEach((error, i) => {
            console.log(`   ${i + 1}. ${error.message}`);
          });
        });
      }

      // Show what errors were eliminated
      const eliminatedTypes = Object.keys(errorCounts).filter(
        (code) => !afterErrorCounts[code],
      );
      if (eliminatedTypes.length > 0) {
        console.log(
          `\n✅ ELIMINATED error types: ${eliminatedTypes.join(", ")}`,
        );
      }

      // Show what errors were reduced
      Object.keys(errorCounts).forEach((code) => {
        const before = errorCounts[code] || 0;
        const after = afterErrorCounts[code] || 0;
        if (before > after) {
          console.log(
            `\n📉 REDUCED ${code}: ${before} → ${after} (${before - after} eliminated)`,
          );
        }
      });

      // Restore file
      fs.writeFileSync(filePath, originalContent);
      console.log(`\n🔄 File restored to original state`);
    } else {
      console.log(`\n❌ No proven patterns found to apply`);
    }

    return {
      initialErrorCount: initialErrors.length,
      initialErrorTypes: errorCounts,
      fixesApplied: fixes,
    };
  }

  /**
   * Main analysis process
   */
  async analyze() {
    console.log("🎯 DIAGNOSTIC PATTERN ANALYZER");
    console.log("=".repeat(60));
    console.log(
      "Goal: Understand why files fail validation after TS1005 fixes",
    );

    // Get a few representative files that failed in previous runs
    const testFiles = [
      "src/__tests__/campaign/CampaignSystemTestIntegration.test.ts",
      "src/__tests__/e2e/MainPageWorkflows.test.tsx",
      "src/__tests__/linting/ComprehensiveLintingTestSuite.test.ts",
    ].filter((file) => fs.existsSync(file));

    if (testFiles.length === 0) {
      console.log("❌ No target test files found");
      return;
    }

    console.log(`\n📁 Analyzing ${testFiles.length} representative files...`);

    const results = [];
    for (const filePath of testFiles) {
      const result = await this.analyzeFile(filePath);
      results.push({ file: filePath, ...result });
    }

    // Summary analysis
    console.log("\n" + "=".repeat(60));
    console.log("📈 DIAGNOSTIC SUMMARY");
    console.log("=".repeat(60));

    results.forEach((result) => {
      console.log(`\n📁 ${path.basename(result.file)}:`);
      console.log(`   Initial errors: ${result.initialErrorCount}`);
      console.log(`   Fixes applied: ${result.fixesApplied}`);
      console.log(
        `   Error types: ${Object.keys(result.initialErrorTypes).join(", ")}`,
      );
    });

    // Find common patterns
    const allErrorTypes = new Set();
    results.forEach((result) => {
      Object.keys(result.initialErrorTypes).forEach((type) =>
        allErrorTypes.add(type),
      );
    });

    console.log(
      `\n🔍 All error types found: ${Array.from(allErrorTypes).join(", ")}`,
    );

    console.log(`\n💾 Backups saved in: ${this.backupDir}`);
    console.log(`\n📋 Analysis complete - check output above for patterns`);
  }
}

// Execute if run directly
if (require.main === module) {
  const analyzer = new DiagnosticPatternAnalyzer();
  analyzer
    .analyze()
    .then(() => {
      console.log("\n✅ Diagnostic analysis completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Diagnostic analysis failed:", error);
      process.exit(1);
    });
}

module.exports = DiagnosticPatternAnalyzer;
