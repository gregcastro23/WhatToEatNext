#!/usr/bin/env node

/**
 * TS1109 Processor - Expression Expected
 * Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class TS1109Processor {
  constructor() {
    this.projectRoot = process.cwd();
  }

  async process(dryRun = true) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔧 TS1109 Processor - Expression Expected`);
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
    console.log("=".repeat(60));

    const errors = await this.getErrors();
    if (errors.length === 0) {
      console.log("✅ No TS1109 errors found!");
      return { filesProcessed: 0, errorsFixed: 0 };
    }

    console.log(`\n📋 Found ${errors.length} TS1109 errors`);
    const errorsByFile = this.groupByFile(errors);
    console.log(`📁 Files affected: ${Object.keys(errorsByFile).length}`);

    let filesProcessed = 0;
    let errorsFixed = 0;

    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      console.log(
        `\n📄 Processing: ${path.relative(this.projectRoot, filePath)}`,
      );
      console.log(`   Errors: ${fileErrors.length}`);

      try {
        const fixed = await this.fixFileErrors(filePath, fileErrors, dryRun);
        errorsFixed += fixed;
        filesProcessed++;
        console.log(`   ✅ Fixed ${fixed} errors`);
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 Summary:`);
    console.log(`   Files processed: ${filesProcessed}`);
    console.log(`   Errors fixed: ${errorsFixed}`);
    console.log("=".repeat(60));

    return { filesProcessed, errorsFixed };
  }

  async getErrors() {
    const tscOutput = execSync(
      "yarn tsc --noEmit --skipLibCheck 2>&1 || true",
      {
        cwd: this.projectRoot,
        encoding: "utf8",
        maxBuffer: 50 * 1024 * 1024,
      },
    );

    const errors = [];
    for (const line of tscOutput.split("\n")) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS1109:/);
      if (match) {
        errors.push({
          filePath: path.resolve(this.projectRoot, match[1]),
          line: parseInt(match[2]),
          column: parseInt(match[3]),
        });
      }
    }
    return errors;
  }

  groupByFile(errors) {
    const grouped = {};
    for (const error of errors) {
      if (!grouped[error.filePath]) grouped[error.filePath] = [];
      grouped[error.filePath].push(error);
    }
    return grouped;
  }

  async fixFileErrors(filePath, errors, dryRun) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let fixedCount = 0;

    // Sort descending to preserve line numbers
    errors.sort((a, b) => b.line - a.line || b.column - a.column);

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

    if (!dryRun && fixedCount > 0) {
      fs.writeFileSync(filePath, lines.join("\n"));
    }

    return fixedCount;
  }

  fixLine(line, prevLine, nextLine, error) {
    // Pattern 1: Statement ending with comma instead of semicolon
    // "let x = 5,"  or  "totalScore += 20,"
    if (/,\s*$/.test(line)) {
      // Check if this looks like a statement (not object/array property)
      // Statements typically have: let/const/var, assignment, return, etc.
      if (/^\s*(let|const|var|return|throw|break|continue)\s+/.test(line)) {
        return line.replace(/,\s*$/, ";");
      }

      // Assignment statements
      if (/^\s+\w+\s*[+\-*/]?=\s+.+,\s*$/.test(line)) {
        return line.replace(/,\s*$/, ";");
      }

      // Property assignment that should end with semicolon
      if (/^\s+\w+\.\w+\s*=\s*[^,{}]+,\s*$/.test(line)) {
        return line.replace(/,\s*$/, ";");
      }
    }

    // Pattern 2: If/else statement ending with comma instead of semicolon
    // "if (x >= 80) rating = 'Excellent',"
    if (/^\s*(if|else\s+if|else)\s+\(.+\)\s+\w+\s*=\s*.+,\s*$/.test(line)) {
      return line.replace(/,\s*$/, ";");
    }

    // Pattern 3: Statement with stray comma before proper terminator
    // "if (x) {"  (should be just "{")
    if (/{\s*;\s*$/.test(line)) {
      return line.replace(/{\s*;\s*$/, "{");
    }

    // Pattern 4: Empty expression (orphaned closing brace/paren)
    // Usually from deleted code - remove the line if it's just whitespace + punctuation
    if (/^\s*[,;)}\]]\s*$/.test(line)) {
      return ""; // Remove the line
    }

    // Pattern 5: Double punctuation ",,"  ";;", etc.
    line = line.replace(/,,+/g, ",");
    line = line.replace(/;;+/g, ";");

    return line;
  }

  async getFilesWithErrors() {
    const errors = await this.getErrors();
    return [...new Set(errors.map((e) => e.filePath))];
  }
}

export default TS1109Processor;

if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new TS1109Processor();
  await processor.process(!process.argv.includes("--confirm"));
}
