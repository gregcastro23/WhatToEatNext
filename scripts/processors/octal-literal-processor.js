#!/usr/bin/env node

/**
 * Octal Literal Processor - Phase 3.5 Pattern Expansion
 * Fixes TS1121: Octal literals are not allowed errors
 */

import fs from "fs";
import path from "path";

class OctalLiteralProcessor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.octalsFixed = 0;
    this.backupDir = path.join(this.projectRoot, "backups", "phase3", "octals");
  }

  async process() {
    console.log("🔧 Processing TS1121: Octal literals not allowed errors...");

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with octal literal errors
    const filesWithErrors = await this.getFilesWithOctalErrors();

    console.log(
      `Found ${filesWithErrors.length} files with octal literal errors`,
    );

    for (const file of filesWithErrors) {
      await this.processFile(file);
    }

    return {
      filesProcessed: this.filesProcessed,
      octalsFixed: this.octalsFixed,
      success: true,
    };
  }

  async getFilesWithOctalErrors() {
    // Files with TS1121 Octal literals not allowed errors
    const errorFiles = [
      "src/utils/withRenderTracking.tsx",
      "src/utils/testIngredientMapping.ts",
      "src/calculations/culinary/seasonalAdjustments.ts",
      "src/calculations/culinaryAstrology.ts",
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

    // Fix octal literal patterns
    const fixes = [
      // Fix octal literals in slice operations
      {
        pattern: /\.slice\(0(\d+)\)/g,
        replacement: (match, num) => {
          localFixes++;
          return `.slice(${num})`;
        },
      },

      // Fix octal literals in substring operations
      {
        pattern: /\.substring\(0(\d+)\)/g,
        replacement: (match, num) => {
          localFixes++;
          return `.substring(${num})`;
        },
      },

      // Fix general octal literal usage
      {
        pattern: /\b0(\d+)\b/g,
        replacement: (match, num) => {
          // Only fix if it's actually an octal literal (not in strings, etc.)
          if (!this.isInStringOrComment(content, match)) {
            localFixes++;
            return num;
          }
          return match;
        },
      },
    ];

    for (const fix of fixes) {
      content = content.replace(fix.pattern, fix.replacement);
    }

    if (localFixes > 0) {
      fs.writeFileSync(fullPath, content);
      this.filesProcessed++;
      this.octalsFixed += localFixes;
      console.log(`  ✓ Fixed ${localFixes} octal literals`);
    }
  }

  isInStringOrComment(content, match) {
    // Simple check - if the match is inside quotes or comments
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.includes(match)) {
        // Check if it's in a string
        if (line.includes(`"${match}"`) || line.includes(`'${match}'`)) {
          return true;
        }
        // Check if it's in a comment
        if (line.includes(`//`) && line.indexOf(match) > line.indexOf(`//`)) {
          return true;
        }
      }
    }
    return false;
  }
}

export default OctalLiteralProcessor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new OctalLiteralProcessor();
  processor
    .process()
    .then((result) => {
      console.log("\n✅ Octal literal processing complete:");
      console.log(`Files processed: ${result.filesProcessed}`);
      console.log(`Octal literals fixed: ${result.octalsFixed}`);
    })
    .catch(console.error);
}
