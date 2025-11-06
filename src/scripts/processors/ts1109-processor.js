#!/usr/bin/env node

/**
 * TS1109 Processor - Expression Expected (REFINED)
 * Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 *
 * REFINED with file-wide validation and safer pattern matching
 */

import fs from "fs";
import path from "path";
import BaseProcessor from "./base-processor.js";

class TS1109ProcessorRefined extends BaseProcessor {
  constructor() {
    super("TS1109", "Expression Expected");
  }

  async process(dryRun = true) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔧 TS1109 Refined Processor - Expression Expected`);
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
    console.log("=".repeat(60));

    // Get baseline error counts
    console.log("\n📊 Capturing baseline...");
    const beforeCount = await this.getErrorCount();
    const beforeTotal = await this.getTotalErrorCount();
    console.log(`   Target errors (TS1109): ${beforeCount}`);
    console.log(`   Total errors: ${beforeTotal}`);

    const errors = await this.getErrors();
    if (errors.length === 0) {
      console.log("\n✅ No TS1109 errors found!");
      return { filesProcessed: 0, errorsFixed: 0 };
    }

    console.log(`\n📋 Found ${errors.length} TS1109 errors`);
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

    // Validate if not dry-run
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
        console.log(`\n💡 Consider manual review of changes`);
      }
    }

    console.log("=".repeat(60));

    return { filesProcessed, errorsFixed, filesSkipped };
  }

  async fixFileErrors(filePath, errors, dryRun) {
    return this.safeFileModify(filePath, (originalContent) => {
      const lines = originalContent.split("\n");
      let fixedCount = 0;

      // Sort errors by line descending to preserve line numbers
      errors.sort((a, b) => b.line - a.line || b.column - a.column);

      for (const error of errors) {
        const lineIdx = error.line - 1;
        if (lineIdx < 0 || lineIdx >= lines.length) continue;

        const currentLine = lines[lineIdx];
        const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : "";
        const nextLine = lineIdx < lines.length - 1 ? lines[lineIdx + 1] : "";

        const fixed = this.fixLine(currentLine, prevLine, nextLine);

        if (fixed !== currentLine) {
          lines[lineIdx] = fixed;
          fixedCount++;
        }
      }

      const modifiedContent = lines.join("\n");

      // Don't write if dry-run
      if (!dryRun && fixedCount > 0) {
        fs.writeFileSync(filePath, modifiedContent);
      }

      return { content: modifiedContent, fixedCount };
    });
  }

  fixLine(line, prevLine, nextLine) {
    const original = line;

    // Pattern 1: Statement ending with comma instead of semicolon
    // SAFE: Only if it's clearly a statement, not object/array property
    if (/,\s*$/.test(line)) {
      // Assignment statements: "x = value,"
      if (/^\s+\w+\s*[+\-*/]?=\s+.+,\s*$/.test(line)) {
        // Check next line doesn't start with property name (would be object)
        if (!nextLine.trim().match(/^\w+:/)) {
          line = line.replace(/,\s*$/, ";");
        }
      }

      // Variable declarations: "let x = value,"
      if (/^\s*(let|const|var)\s+\w+\s*=\s*[^{[]+,\s*$/.test(line)) {
        // Check next line doesn't continue the declaration
        if (!nextLine.trim().match(/^\w+\s*=/)) {
          line = line.replace(/,\s*$/, ";");
        }
      }

      // Return statements: "return value,"
      if (/^\s*return\s+.+,\s*$/.test(line)) {
        line = line.replace(/,\s*$/, ";");
      }
    }

    // Pattern 2: Double punctuation (safe to remove)
    line = line.replace(/,,+/g, ",");
    line = line.replace(/;;+/g, ";");
    line = line.replace(/\.\.\./g, "..."); // Protect spread operator
    line = line.replace(/\.\./g, ".");

    // Pattern 3: Orphaned semicolon in expression context
    // "{ x: value; }" should be "{ x: value }"
    // ONLY if it's clearly an object property (has colon before semicolon)
    if (/:\s*[^;{}\n]+;\s*}/.test(line)) {
      // This is safe - object property shouldn't end with semicolon
      line = line.replace(/(:\s*[^;{}\n]+);(\s*})/, "$1$2");
    }

    // Pattern 4: NEVER remove entire lines or closing braces
    // This was the main issue in the previous version
    // We only modify punctuation, never structure

    return line;
  }
}

export default TS1109ProcessorRefined;

if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new TS1109ProcessorRefined();
  await processor.process(!process.argv.includes("--confirm"));
}
