#!/usr/bin/env node

/**
 * Dependency Validation Script
 *
 * Validates all import paths, detects circular dependencies,
 * and provides fixes for common dependency issues.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import {
  autoFixDependencyIssues,
  generateDependencyReport,
} from "../src/utils/dependencyValidation.js";

async function main() {
  const projectRoot = resolve(__dirname, "..");

  console.log("🔍 Validating project dependencies...\n");

  try {
    const report = await generateDependencyReport(projectRoot);

    console.log("📊 Dependency Validation Report");
    console.log("================================");
    console.log(`Total files processed: ${report.totalFiles}`);
    console.log(`Valid files: ${report.validFiles}`);
    console.log(`Files with issues: ${report.invalidFiles}`);
    console.log(
      `Circular dependencies found: ${report.circularDependencies.length}`,
    );
    console.log(`Total warnings: ${report.warnings.length}\n`);

    if (report.circularDependencies.length > 0) {
      console.log("🔄 Circular Dependencies:");
      report.circularDependencies.forEach((cycle, index) => {
        console.log(`  ${index + 1}. ${cycle.join(" → ")}`);
      });
      console.log();
    }

    if (report.warnings.length > 0) {
      console.log("⚠️  Warnings:");
      report.warnings.slice(0, 10).forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
      if (report.warnings.length > 10) {
        console.log(`  ... and ${report.warnings.length - 10} more warnings`);
      }
      console.log();
    }

    // Auto-fix option
    const shouldFix = process.argv.includes("--fix");
    if (shouldFix) {
      console.log("🔧 Auto-fixing dependency issues...\n");

      const glob = (await import("glob")).default as unknown as {
        sync: (
          pattern: string,
          options: { cwd: string; ignore: string[] },
        ) => string[];
      };
      const tsFiles = glob.sync("src/**/*.{ts,tsx}", {
        cwd: projectRoot,
        ignore: ["node_modules/**", "dist/**", ".next/**"],
      });

      let fixedFiles = 0;
      let totalFixes = 0;

      for (const file of tsFiles) {
        const filePath = join(projectRoot, file);
        try {
          const content = readFileSync(filePath, "utf8");
          const { fixedContent, appliedFixes } = autoFixDependencyIssues(
            content,
            filePath,
          );

          if (appliedFixes.length > 0) {
            writeFileSync(filePath, fixedContent);
            fixedFiles++;
            totalFixes += appliedFixes.length;
            console.log(`✅ Fixed ${appliedFixes.length} issues in ${file}`);
          }
        } catch (error) {
          console.error(`❌ Failed to fix ${file}:`, error);
        }
      }

      console.log(
        `\n🎉 Auto-fix complete: ${totalFixes} fixes applied to ${fixedFiles} files`,
      );
    } else {
      console.log(
        "💡 Run with --fix to automatically fix common dependency issues",
      );
    }

    // Exit with error code if there are issues
    if (report.invalidFiles > 0 || report.circularDependencies.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to validate dependencies:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
