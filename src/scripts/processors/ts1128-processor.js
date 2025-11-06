#!/usr/bin/env node

/**
 * TS1128 Processor - Declaration/Statement Expected (REFINED)
 * Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 *
 * REFINED with conservative pattern matching and validation
 */

import fs from "fs";
import path from "path";
import BaseProcessor from "./base-processor.js";

class TS1128ProcessorRefined extends BaseProcessor {
  constructor() {
    super("TS1128", "Declaration or Statement Expected");
  }

  async process(dryRun = true) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔧 TS1128 Refined Processor - Declaration/Statement Expected`);
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
    console.log("=".repeat(60));

    // Get baseline
    console.log("\n📊 Capturing baseline...");
    const beforeCount = await this.getErrorCount();
    const beforeTotal = await this.getTotalErrorCount();
    console.log(`   Target errors (TS1128): ${beforeCount}`);
    console.log(`   Total errors: ${beforeTotal}`);

    const errors = await this.getErrors();
    if (errors.length === 0) {
      console.log("\n✅ No TS1128 errors found!");
      return { filesProcessed: 0, errorsFixed: 0 };
    }

    console.log(`\n📋 Found ${errors.length} TS1128 errors`);
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

        const fixed = this.fixLine(currentLine, prevLine, nextLine);

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

  fixLine(line, prevLine, nextLine) {
    // Pattern 1: Orphaned closing brace with semicolon in if/else chain
    // "return 'spring' };" should be "return 'spring';"
    // SAFE: Only if previous line is a return/single statement
    if (/}\s*;\s*$/.test(line)) {
      // Check if previous line is a return statement
      if (/^\s*return\s+/.test(prevLine)) {
        // Safe to remove the orphaned }
        line = line.replace(/}\s*;\s*$/, ";");
      }
    }

    // Pattern 2: Double closing punctuation (safe to reduce)
    line = line.replace(/}}\s*;/g, "};");
    line = line.replace(/;\s*;\s*/g, ";");

    // Pattern 3: CONSERVATIVE - Only fix obvious duplicates
    // Do NOT remove entire lines or structural elements

    return line;
  }
}

export default TS1128ProcessorRefined;

if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new TS1128ProcessorRefined();
  await processor.process(!process.argv.includes("--confirm"));
}
