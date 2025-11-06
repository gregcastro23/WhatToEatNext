#!/usr/bin/env node

/**
 * TS1005 Processor - Enhanced Context-Aware Version
 * Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class TS1005ProcessorEnhanced {
  constructor() {
    this.projectRoot = process.cwd();
  }

  async process(dryRun = true) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔧 TS1005 Enhanced Processor - Context-Aware Fixing`);
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
    console.log("=".repeat(60));

    const errors = await this.getTS1005Errors();
    if (errors.length === 0) {
      console.log("✅ No TS1005 errors found!");
      return { filesProcessed: 0, errorsFixed: 0 };
    }

    console.log(`\n📋 Found ${errors.length} TS1005 errors`);
    const errorsByFile = this.groupErrorsByFile(errors);
    console.log(`📁 Files affected: ${Object.keys(errorsByFile).length}`);

    let filesProcessed = 0;
    let errorsFixed = 0;

    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      console.log(
        `\n📄 Processing: ${path.relative(this.projectRoot, filePath)}`,
      );
      console.log(`   Errors: ${fileErrors.length}`);

      try {
        const fixed = await this.fixFileErrorsContextAware(
          filePath,
          fileErrors,
          dryRun,
        );
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

  async getTS1005Errors() {
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
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS1005: (.+)$/);
      if (match) {
        errors.push({
          filePath: path.resolve(this.projectRoot, match[1]),
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          message: match[4],
        });
      }
    }
    return errors;
  }

  groupErrorsByFile(errors) {
    const grouped = {};
    for (const error of errors) {
      if (!grouped[error.filePath]) grouped[error.filePath] = [];
      grouped[error.filePath].push(error);
    }
    return grouped;
  }

  async fixFileErrorsContextAware(filePath, errors, dryRun) {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let fixedCount = 0;

    // Sort by line number descending to preserve line numbers
    errors.sort((a, b) => b.line - a.line || b.column - a.column);

    for (const error of errors) {
      const lineIdx = error.line - 1;
      if (lineIdx < 0 || lineIdx >= lines.length) continue;

      const currentLine = lines[lineIdx];
      const prevLine = lineIdx > 0 ? lines[lineIdx - 1] : "";
      const nextLine = lineIdx < lines.length - 1 ? lines[lineIdx + 1] : "";

      const fixed = this.fixLineWithContext(
        currentLine,
        prevLine,
        nextLine,
        error,
      );

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

  fixLineWithContext(line, prevLine, nextLine, error) {
    const msg = error.message.toLowerCase();
    const col = error.column;

    // Pattern 1: Missing comma in object literal
    if (msg.includes("',' expected")) {
      // Object property without comma: "propName: value"
      if (/^\s+\w+:\s+.+[^,{}\[\]]$/.test(line) && /^\s+\w+:/.test(nextLine)) {
        return line + ",";
      }

      // Array element without comma
      if (/^\s+['"].*['"][^,]$/.test(line) && /^\s+['"]/.test(nextLine)) {
        return line + ",";
      }

      // Variable without comma in destructuring or array
      if (/^\s+\w+\s*$/.test(line) && /^\s+\w+/.test(nextLine)) {
        return line + ",";
      }
    }

    // Pattern 2: Missing semicolon
    if (msg.includes("';' expected")) {
      // Statement that should end with semicolon
      if (
        /^\s*(const|let|var|return|break|continue|throw)\s+/.test(line) &&
        !line.trim().endsWith(";")
      ) {
        return line + ";";
      }

      // Expression statement
      if (/^\s+\w+\.\w+\(.*\)\s*$/.test(line)) {
        return line + ";";
      }
    }

    // Pattern 3: Missing colon in object/type
    if (msg.includes("':' expected")) {
      // Object property missing colon
      const match = line.match(/^(\s+)(\w+)\s+(.+)$/);
      if (match && !line.includes(":")) {
        return `${match[1]}${match[2]}: ${match[3]}`;
      }

      // Type annotation missing colon
      const funcMatch = line.match(/^(\s*function\s+\w+\s*\([^)]*\))\s+(\w+)/);
      if (funcMatch) {
        return `${funcMatch[1]}: ${funcMatch[2]}`;
      }
    }

    // Pattern 4: Missing opening/closing brace
    if (msg.includes("'{' expected")) {
      if (/^\s*\w+\s+\w+\s*$/.test(line)) {
        return line + " {";
      }
    }

    // Pattern 5: Missing closing paren/brace
    if (msg.includes("')' expected")) {
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        return line + ")";
      }
    }

    if (msg.includes("'}' expected")) {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        return line + "}";
      }
    }

    // Pattern 6: Corrupted inline code (multiple statements on one line)
    // e.g., "const x = 1 const y = 2" or "if (x) { for (y) {"
    if (
      line.includes(": for (") ||
      line.includes("} if (") ||
      line.includes(") ) {")
    ) {
      // Too complex for automated fix - skip
      return line;
    }

    return line;
  }

  async getFilesWithErrors() {
    const errors = await this.getTS1005Errors();
    return [...new Set(errors.map((e) => e.filePath))];
  }
}

// Replace the default export
export default TS1005ProcessorEnhanced;

if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new TS1005ProcessorEnhanced();
  await processor.process(!process.argv.includes("--confirm"));
}
