#!/usr/bin/env node

/**
 * TS1003 Processor - Identifier Expected
 * Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 *
 * Fixes TS1003 errors: Identifier expected
 * Pattern: Incomplete property access, empty identifiers
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class TS1003Processor {
  constructor() {
    this.projectRoot = process.cwd();
  }

  async process(dryRun = true) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔧 TS1003 Processor - Identifier Expected`);
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
    console.log("=".repeat(60));

    const errors = await this.getErrors();

    if (errors.length === 0) {
      console.log("✅ No TS1003 errors found!");
      return { filesProcessed: 0, errorsFixed: 0 };
    }

    console.log(`\n📋 Found ${errors.length} TS1003 errors`);

    const errorsByFile = this.groupByFile(errors);
    let filesProcessed = 0;
    let errorsFixed = 0;

    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      try {
        const fixed = await this.fixFileErrors(filePath, fileErrors, dryRun);
        errorsFixed += fixed;
        filesProcessed++;
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
      }
    }

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
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS1003:/);
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

    for (const error of errors.sort((a, b) => b.line - a.line)) {
      const lineIndex = error.line - 1;
      if (lineIndex < 0 || lineIndex >= lines.length) continue;

      const line = lines[lineIndex];
      // Fix incomplete property access (e.g., "obj." or "obj[")
      if (/\.\s*$/.test(line)) {
        lines[lineIndex] = line.replace(/\.\s*$/, "");
        fixedCount++;
      } else if (/\[\s*$/.test(line)) {
        lines[lineIndex] = line.replace(/\[\s*$/, "");
        fixedCount++;
      }
    }

    if (!dryRun && fixedCount > 0) {
      fs.writeFileSync(filePath, lines.join("\n"));
    }

    return fixedCount;
  }

  async getFilesWithErrors() {
    const errors = await this.getErrors();
    return [...new Set(errors.map((e) => e.filePath))];
  }
}

export default TS1003Processor;
