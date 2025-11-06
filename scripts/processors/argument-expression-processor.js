#!/usr/bin/env node

/**
 * Argument Expression Processor - Phase 3.5 Pattern Expansion
 * Fixes TS1135: Argument expression expected errors
 */

import fs from "fs";
import path from "path";

class ArgumentExpressionProcessor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.argumentsFixed = 0;
    this.backupDir = path.join(
      this.projectRoot,
      "backups",
      "phase3",
      "arguments",
    );
  }

  async process() {
    console.log("🔧 Processing TS1135: Argument expression expected errors...");

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with argument expression errors
    const filesWithErrors = await this.getFilesWithArgumentErrors();

    console.log(
      `Found ${filesWithErrors.length} files with argument expression errors`,
    );

    for (const file of filesWithErrors) {
      await this.processFile(file);
    }

    return {
      filesProcessed: this.filesProcessed,
      argumentsFixed: this.argumentsFixed,
      success: true,
    };
  }

  async getFilesWithArgumentErrors() {
    // Files with TS1135 Argument expression expected errors
    const errorFiles = [
      "src/utils/typeGuards/astrologicalGuards.ts",
      "src/utils/testIngredientMapping.ts",
      "src/utils/timingUtils.ts",
      // Add more from error analysis
    ];

    return errorFiles.filter((file) => {
      const fullPath = path.join(this.projectRoot, file);
      return fs.existsSync(fullPath);
    });
  }

  async processFile(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    console.log(`Processing ${filePath}...`);

    // Backup original
    const backupPath = path.join(
      this.backupDir,
      path.basename(filePath) + ".backup",
    );
    fs.copyFileSync(fullPath, backupPath);

    let content = fs.readFileSync(fullPath, "utf8");
    let localFixes = 0;

    // Fix common argument expression error patterns
    const fixes = [
      // Fix function calls with missing arguments
      {
        pattern: /(\w+)\([^)]*\),\s*\)/g,
        replacement: (match, funcName) => {
          localFixes++;
          return `${funcName}()`;
        },
      },

      // Fix malformed function parameters
      {
        pattern: /(\w+)\(\s*([^,]+),\s*\)/g,
        replacement: (match, funcName, arg) => {
          if (arg.trim() === "") {
            localFixes++;
            return `${funcName}()`;
          }
          return match;
        },
      },

      // Fix incomplete destructuring in function parameters
      {
        pattern:
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\(\s*\[\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\]\s*,\s*\)/g,
        replacement: (match, funcName, param) => {
          localFixes++;
          return `${funcName}([${param}])`;
        },
      },
    ];

    for (const fix of fixes) {
      content = content.replace(fix.pattern, fix.replacement);
    }

    if (localFixes > 0) {
      fs.writeFileSync(fullPath, content);
      this.filesProcessed++;
      this.argumentsFixed += localFixes;
      console.log(`  ✓ Fixed ${localFixes} argument expressions`);
    }
  }
}

export default ArgumentExpressionProcessor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new ArgumentExpressionProcessor();
  processor
    .process()
    .then((result) => {
      console.log("\n✅ Argument expression processing complete:");
      console.log(`Files processed: ${result.filesProcessed}`);
      console.log(`Arguments fixed: ${result.argumentsFixed}`);
    })
    .catch(console.error);
}
