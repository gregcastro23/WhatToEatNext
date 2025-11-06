#!/usr/bin/env node

/**
 * Semicolon Processor - Phase 3 Wave 1
 * Fixes missing semicolons (TS1005 errors)
 */

import fs from "fs";
import path from "path";

class SemicolonProcessor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.semicolonsAdded = 0;
    this.backupDir = path.join(
      this.projectRoot,
      "backups",
      "phase3",
      "semicolons",
    );
  }

  async process() {
    console.log("🔧 Processing missing semicolons (TS1005)...");

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with semicolon errors from error analysis
    const filesWithErrors = await this.getFilesWithSemicolonErrors();

    console.log(`Found ${filesWithErrors.length} files with semicolon errors`);

    for (const file of filesWithErrors) {
      await this.processFile(file);
    }

    return {
      filesProcessed: this.filesProcessed,
      semicolonsAdded: this.semicolonsAdded,
      success: true,
    };
  }

  async getFilesWithSemicolonErrors() {
    // From the error analysis, files with TS1005 '; expected' errors
    const errorFiles = [
      "src/utils/timingUtils.ts",
      "src/utils/testIngredientMapping.ts",
      "src/utils/strictNullChecksHelper.ts",
      "src/utils/testRecommendations.ts",
      "src/utils/time.ts",
      "src/utils/timeFactors.ts",
      "src/utils/theme.ts",
      "src/utils/typeValidation.ts",
      "src/utils/validateIngredients.ts",
      "src/utils/withRenderTracking.tsx",
      // Add more as needed from error analysis
    ];

    // Verify files exist and filter
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
    let localFixes = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Skip comments and empty lines
      if (this.isCommentOrEmpty(line)) {
        modifiedLines.push(line);
        continue;
      }

      // Check if line needs semicolon
      if (this.needsSemicolon(line, lines[i + 1])) {
        line = line + ";";
        localFixes++;
        this.semicolonsAdded++;
      }

      modifiedLines.push(line);
    }

    if (localFixes > 0) {
      fs.writeFileSync(fullPath, modifiedLines.join("\n"));
      this.filesProcessed++;
      console.log(`  ✓ Added ${localFixes} semicolons`);
    }
  }

  isCommentOrEmpty(line) {
    const trimmed = line.trim();
    return (
      !trimmed ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("*") ||
      trimmed.endsWith("*/")
    );
  }

  needsSemicolon(line, nextLine) {
    const trimmed = line.trim();

    // Don't add semicolon to lines that already have one
    if (trimmed.endsWith(";")) {
      return false;
    }

    // Don't add to lines that end with comma (object/array literals)
    if (trimmed.endsWith(",")) {
      return false;
    }

    // Don't add to opening braces/brackets
    if (trimmed.endsWith("{") || trimmed.endsWith("[")) {
      return false;
    }

    // Don't add to control flow keywords
    if (/\b(if|else|for|while|do|try|catch|finally)\b.*\{$/.test(trimmed)) {
      return false;
    }

    // Add semicolon to function calls
    if (/\bconsole\.log\([^)]+\)$/.test(trimmed)) {
      return true;
    }

    // Add semicolon to return statements
    if (/\breturn\s+/.test(trimmed)) {
      return true;
    }

    // Add semicolon to variable declarations/assignments
    if (
      /\b(const|let|var)\s+\w+\s*=/.test(trimmed) &&
      !trimmed.includes("{") &&
      !trimmed.includes("[")
    ) {
      return true;
    }

    // Add semicolon to assignments
    if (
      /\w+\s*=/.test(trimmed) &&
      !trimmed.includes("{") &&
      !trimmed.includes("[")
    ) {
      return true;
    }

    // Add semicolon to function calls with parentheses
    if (
      /\w+\([^)]*\)$/.test(trimmed) &&
      !trimmed.includes("if") &&
      !trimmed.includes("for") &&
      !trimmed.includes("while")
    ) {
      return true;
    }

    // Add semicolon to export statements
    if (trimmed.startsWith("export ")) {
      return true;
    }

    return false;
  }
}

// Export for use in main script
export default SemicolonProcessor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new SemicolonProcessor();
  processor
    .process()
    .then((result) => {
      console.log("\n✅ Semicolon processing complete:");
      console.log(`Files processed: ${result.filesProcessed}`);
      console.log(`Semicolons added: ${result.semicolonsAdded}`);
    })
    .catch(console.error);
}
