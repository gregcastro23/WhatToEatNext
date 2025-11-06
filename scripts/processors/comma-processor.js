#!/usr/bin/env node

/**
 * Comma Processor - Phase 3 Wave 1
 * Fixes missing commas and inappropriate trailing commas (TS1005 errors)
 */

import fs from "fs";
import path from "path";

class CommaProcessor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.commasAdded = 0;
    this.commasRemoved = 0;
    this.backupDir = path.join(this.projectRoot, "backups", "phase3", "commas");
  }

  async process() {
    console.log("🔧 Processing comma syntax errors...");

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with comma errors
    const filesWithErrors = await this.getFilesWithCommaErrors();

    console.log(`Found ${filesWithErrors.length} files with comma errors`);

    for (const file of filesWithErrors) {
      await this.processFile(file);
    }

    return {
      filesProcessed: this.filesProcessed,
      commasAdded: this.commasAdded,
      commasRemoved: this.commasRemoved,
      success: true,
    };
  }

  async getFilesWithCommaErrors() {
    // Files with TS1005 ',' expected errors from analysis
    const errorFiles = [
      "src/utils/steeringFileIntelligence.ts",
      "src/utils/testIngredientMapping.ts",
      "src/utils/testRecommendations.ts",
      "src/utils/testUtils.ts",
      "src/utils/theme.ts",
      "src/utils/time.ts",
      "src/utils/timingUtils.ts",
      "src/utils/typeValidation.ts",
      "src/utils/validateIngredients.ts",
      "src/utils/zodiacUtils.ts",
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

    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split("\n");
    let modifiedLines = [];
    let localAdded = 0;
    let localRemoved = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Fix missing commas in object literals
      const commaResult = this.fixObjectLiteralCommas(line, lines[i + 1]);
      line = commaResult.line;
      localAdded += commaResult.added;
      localRemoved += commaResult.removed;

      // Fix function parameter commas
      const paramResult = this.fixFunctionParameterCommas(line);
      line = paramResult.line;
      localAdded += paramResult.added;

      // Fix array literal commas
      const arrayResult = this.fixArrayLiteralCommas(line);
      line = arrayResult.line;
      localAdded += arrayResult.added;

      modifiedLines.push(line);
    }

    if (localAdded > 0 || localRemoved > 0) {
      fs.writeFileSync(fullPath, modifiedLines.join("\n"));
      this.filesProcessed++;
      this.commasAdded += localAdded;
      this.commasRemoved += localRemoved;
      console.log(`  ✓ Added ${localAdded}, removed ${localRemoved} commas`);
    }
  }

  fixObjectLiteralCommas(line, nextLine) {
    let result = { line, added: 0, removed: 0 };

    // Remove inappropriate trailing commas in function calls, etc.
    if (this.hasInappropriateTrailingComma(line)) {
      result.line = line.replace(/,(\s*)$/, "$1");
      result.removed++;
    }

    // Add missing commas in object literals
    if (nextLine && this.needsCommaInObjectLiteral(line, nextLine)) {
      result.line = line + ",";
      result.added++;
    }

    return result;
  }

  fixFunctionParameterCommas(line) {
    let result = { line, added: 0 };

    // Fix function parameters missing commas
    // Pattern: param1 param2) -> param1, param2)
    result.line = line.replace(/(\w+)\s+(\w+)\s*\)/g, "$1, $2)");
    if (result.line !== line) result.added++;

    // Fix function calls missing commas
    // Pattern: func(arg1 arg2) -> func(arg1, arg2)
    result.line = result.line.replace(/(\w+)\s+(\w+)\s*\)/g, "$1, $2)");
    if (result.line !== line) result.added++;

    return result;
  }

  fixArrayLiteralCommas(line) {
    let result = { line, added: 0 };

    // Fix array elements missing commas
    // Pattern: [item1 item2] -> [item1, item2]
    result.line = line.replace(/(\w+)\s+(\w+)\s*\]/g, "$1, $2]");
    if (result.line !== line) result.added++;

    return result;
  }

  hasInappropriateTrailingComma(line) {
    const trimmed = line.trim();

    // Trailing comma in function calls (not allowed)
    if (/,(\s*)\)/.test(trimmed)) {
      return true;
    }

    // Trailing comma in array literals when not multiline
    if (/,(\s*)\]/.test(trimmed) && !this.isMultilineArray(line)) {
      return true;
    }

    return false;
  }

  needsCommaInObjectLiteral(line, nextLine) {
    const trimmed = line.trim();
    const nextTrimmed = nextLine ? nextLine.trim() : "";

    // If line ends with property value and next line starts with property name
    if (/\w+\s*:.*[^,{]$/.test(trimmed) && /^\w+\s*:/.test(nextTrimmed)) {
      return true;
    }

    return false;
  }

  isMultilineArray(line) {
    // Simple check - if line contains only array elements
    return /\[.*\]/.test(line) && line.includes("\n");
  }
}

export default CommaProcessor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new CommaProcessor();
  processor
    .process()
    .then((result) => {
      console.log("\n✅ Comma processing complete:");
      console.log(`Files processed: ${result.filesProcessed}`);
      console.log(`Commas added: ${result.commasAdded}`);
      console.log(`Commas removed: ${result.commasRemoved}`);
    })
    .catch(console.error);
}
