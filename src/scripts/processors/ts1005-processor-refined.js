#!/usr/bin/env node

/**
 * TS1005 Processor - Semicolon/Comma Expected (REFINED)
 * Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 *
 * REFINED with validation and conservative fixing
 */

import fs from "fs";
import path from "path";
import BaseProcessor from "./base-processor.js";

class TS1005ProcessorRefined extends BaseProcessor {
  constructor() {
    super("TS1005", "Semicolon/Comma Expected");
  }

  async process(dryRun = true) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔧 TS1005 Refined Processor - Semicolon/Comma Expected`);
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
    console.log("=".repeat(60));

    console.log("\n📊 Capturing baseline...");
    const beforeCount = await this.getErrorCount();
    const beforeTotal = await this.getTotalErrorCount();
    console.log(`   Target errors (TS1005): ${beforeCount}`);
    console.log(`   Total errors: ${beforeTotal}`);

    const errors = await this.getErrors();
    if (errors.length === 0) {
      console.log("\n✅ No TS1005 errors found!");
      return { filesProcessed: 0, errorsFixed: 0 };
    }

    console.log(`\n📋 Found ${errors.length} TS1005 errors`);
    const errorsByFile = this.groupByFile(errors);
    console.log(`📁 Files affected: ${Object.keys(errorsByFile).length}`);

    let filesProcessed = 0;
    let errorsFixed = 0;
    let filesSkipped = 0;

    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      console.log(
        `\n📄 Processing: ${path.relative(this.projectRoot, filePath)}`,
      );
      console.log(`   Errors: ${fileErrors.length}`);

      try {
        const result = await this.fixFileErrors(filePath, fileErrors, dryRun);

        if (result.success) {
          errorsFixed += result.fixedCount;
          filesProcessed++;
          console.log(`   ✅ Fixed ${result.fixedCount} errors`);
        } else {
          filesSkipped++;
          console.log(`   ⚠️  Skipped: ${result.error}`);
        }
      } catch (error) {
        filesSkipped++;
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 Summary:`);
    console.log(`   Files processed: ${filesProcessed}`);
    console.log(`   Files skipped: ${filesSkipped}`);
    console.log(`   Errors fixed: ${errorsFixed}`);

    if (!dryRun) {
      console.log(`\n🔍 Validating changes...`);
      const validation = await this.validateChanges(beforeCount, beforeTotal);

      console.log(
        `   Target errors: ${validation.beforeCount} → ${validation.afterCount} (${validation.targetReduction} reduced)`,
      );
      console.log(
        `   Total errors: ${validation.beforeTotal} → ${validation.afterTotal} (${validation.totalChange >= 0 ? "+" : ""}${validation.totalChange})`,
      );
      console.log(`   Net improvement: ${validation.netImprovement} errors`);

      if (!validation.success) {
        console.log(`\n⚠️  VALIDATION FAILED:`);
        validation.errors.forEach((err) => console.log(`   - ${err}`));
      }
    }

    console.log("=".repeat(60));

    return { filesProcessed, errorsFixed, filesSkipped };
  }

  async fixFileErrors(filePath, errors, dryRun) {
    return this.safeFileModify(filePath, (originalContent) => {
      const lines = originalContent.split("\n");
      let fixedCount = 0;

      errors.sort((a, b) => b.line - a.line);

      for (const error of errors) {
        const lineIdx = error.line - 1;
        if (lineIdx < 0 || lineIdx >= lines.length) continue;

        const currentLine = lines[lineIdx];
        const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : "";
        const nextLine = lineIdx < lines.length - 1 ? lines[lineIdx + 1] : "";

        const fixed = this.fixLine(currentLine, prevLine, nextLine, error);

        if (fixed !== currentLine) {
          lines[lineIdx] = fixed;
          fixedCount++;
        }
      }

      const modifiedContent = lines.join("\n");

      if (!dryRun && fixedCount > 0) {
        fs.writeFileSync(filePath, modifiedContent);
      }

      return { content: modifiedContent, fixedCount };
    });
  }

  fixLine(line, prevLine, nextLine, error) {
    const msg = error.message.toLowerCase();

    // Pattern 1: Missing comma in object literal
    // SAFE: Only if next line clearly starts a new property
    if (msg.includes("',' expected")) {
      // Object property without comma: "propName: value"
      // Next line starts with property name
      if (/^\s+\w+:\s+.+[^,{}\[\]]$/.test(line) && /^\s+\w+:/.test(nextLine)) {
        return line + ",";
      }

      // Array element without comma
      if (/^\s+['"`].*['"`]\s*$/.test(line) && /^\s+['"`]/.test(nextLine)) {
        return line + ",";
      }

      // Simple value in array/object
      if (
        /^\s+\w+\s*$/.test(line) &&
        /^\s+\w+/.test(nextLine) &&
        prevLine.includes("[")
      ) {
        return line + ",";
      }
    }

    // Pattern 2: Missing semicolon - CONSERVATIVE
    // Only add if it's clearly a statement that should end
    if (msg.includes("';' expected")) {
      // Variable declarations
      if (
        /^\s*(const|let|var)\s+\w+\s*=\s*[^{[\n]+$/.test(line) &&
        !line.trim().endsWith(",")
      ) {
        // Check next line doesn't continue the expression
        if (
          !nextLine.trim().startsWith(".") &&
          !nextLine.trim().startsWith("[")
        ) {
          return line + ";";
        }
      }

      // Return statements
      if (/^\s*return\s+[^;{}\n]+$/.test(line)) {
        return line + ";";
      }

      // Function calls
      if (/^\s+\w+\.\w+\([^)]*\)\s*$/.test(line)) {
        return line + ";";
      }
    }

    // Pattern 3: Missing colon - VERY CONSERVATIVE
    if (msg.includes("':' expected")) {
      // Type annotation in function signature
      const funcMatch = line.match(/^(\s*function\s+\w+\([^)]*\))\s+(\w+)/);
      if (funcMatch) {
        return `${funcMatch[1]}: ${funcMatch[2]}`;
      }
    }

    // Pattern 4: Missing closing paren/brace - ONLY if clearly missing
    if (msg.includes("')' expected")) {
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens === closeParens + 1) {
        return line + ")";
      }
    }

    if (msg.includes("'}' expected")) {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      if (openBraces === closeBraces + 1) {
        return line + "}";
      }
    }

    return line;
  }
}

export default TS1005ProcessorRefined;

if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new TS1005ProcessorRefined();
  await processor.process(!process.argv.includes("--confirm"));
}
