#!/usr/bin/env node

/**
 * Object Literal Processor - Phase 3 Wave 1
 * Fixes object literal property syntax errors (TS1136, TS1109 errors)
 */

import fs from "fs";
import path from "path";

class ObjectLiteralProcessor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.propertiesFixed = 0;
    this.bracesFixed = 0;
    this.backupDir = path.join(
      this.projectRoot,
      "backups",
      "phase3",
      "objects",
    );
  }

  async process() {
    console.log("🔧 Processing object literal syntax errors...");

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with object literal errors
    const filesWithErrors = await this.getFilesWithObjectErrors();

    console.log(
      `Found ${filesWithErrors.length} files with object literal errors`,
    );

    for (const file of filesWithErrors) {
      await this.processFile(file);
    }

    return {
      filesProcessed: this.filesProcessed,
      propertiesFixed: this.propertiesFixed,
      bracesFixed: this.bracesFixed,
      success: true,
    };
  }

  async getFilesWithObjectErrors() {
    // Files with TS1136 Property assignment expected and related errors
    const errorFiles = [
      "src/utils/testUtils.ts",
      "src/utils/timingUtils.ts",
      "src/utils/withRenderTracking.tsx",
      "src/utils/typeValidation.ts",
      "src/utils/validatePlanetaryPositions.ts",
      "src/utils/zodiacUtils.ts",
      "src/utils/strictNullChecksHelper.ts",
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
    let braceFixes = 0;

    // Fix missing colons in property assignments
    const colonResult = this.fixMissingColons(content);
    content = colonResult.content;
    localFixes += colonResult.fixes;

    // Fix malformed property assignments
    const propertyResult = this.fixPropertyAssignments(content);
    content = propertyResult.content;
    localFixes += propertyResult.fixes;

    // Fix brace balance issues
    const braceResult = this.fixBraceBalance(content);
    content = braceResult.content;
    braceFixes += braceResult.fixes;

    if (localFixes > 0 || braceFixes > 0) {
      fs.writeFileSync(fullPath, content);
      this.filesProcessed++;
      this.propertiesFixed += localFixes;
      this.bracesFixed += braceFixes;
      console.log(`  ✓ Fixed ${localFixes} properties, ${braceFixes} braces`);
    }
  }

  fixMissingColons(content) {
    let fixes = 0;

    // Pattern: prop value, -> prop: value,
    content = content.replace(
      /(\w+)\s+([^,\n}]+)([,}])/g,
      (match, prop, value, separator) => {
        // Only fix if it looks like a property assignment
        if (!this.isFunctionCall(value) && !this.isOperatorExpression(value)) {
          fixes++;
          return `${prop}: ${value}${separator}`;
        }
        return match;
      },
    );

    return { content, fixes };
  }

  fixPropertyAssignments(content) {
    let fixes = 0;

    // Fix object literals in function parameters (common pattern)
    // Pattern: func({prop value}) -> func({prop: value})
    content = content.replace(/\{([^}]*)\}/g, (match, inside) => {
      const fixed = inside.replace(
        /(\w+)\s+([^,\n}]+)([,}])/g,
        (m, prop, value, sep) => {
          if (
            !this.isFunctionCall(value) &&
            !this.isOperatorExpression(value)
          ) {
            fixes++;
            return `${prop}: ${value}${sep}`;
          }
          return m;
        },
      );
      return `{${fixed}}`;
    });

    return { content, fixes };
  }

  fixBraceBalance(content) {
    let fixes = 0;
    const lines = content.split("\n");
    let openBraces = 0;
    let closeBraces = 0;

    // Count braces
    for (const line of lines) {
      openBraces += (line.match(/\{/g) || []).length;
      closeBraces += (line.match(/\}/g) || []).length;
    }

    // If braces are unbalanced, try to fix common issues
    if (openBraces !== closeBraces) {
      // Look for orphaned opening braces that need closing
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (line.trim() === "{" && i < lines.length - 1) {
          const nextLine = lines[i + 1];
          if (nextLine && !nextLine.includes("}")) {
            // Insert closing brace after next significant line
            let insertIndex = i + 1;
            while (insertIndex < lines.length && !lines[insertIndex].trim()) {
              insertIndex++;
            }
            if (insertIndex < lines.length) {
              lines.splice(insertIndex + 1, 0, "  }");
              fixes++;
              break;
            }
          }
        }
      }
    }

    return { content: lines.join("\n"), fixes };
  }

  isFunctionCall(value) {
    // Check if value looks like a function call
    return /\w+\([^)]*\)/.test(value.trim());
  }

  isOperatorExpression(value) {
    // Check if value contains operators
    return /[+\-*/=<>!]/.test(value.trim());
  }
}

export default ObjectLiteralProcessor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new ObjectLiteralProcessor();
  processor
    .process()
    .then((result) => {
      console.log("\n✅ Object literal processing complete:");
      console.log(`Files processed: ${result.filesProcessed}`);
      console.log(`Properties fixed: ${result.propertiesFixed}`);
      console.log(`Braces fixed: ${result.bracesFixed}`);
    })
    .catch(console.error);
}
