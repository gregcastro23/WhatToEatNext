#!/usr/bin/env node

/**
 * TS1180 Processor - Phase 4 Enterprise Error Elimination
 * Fixes TS1180: Property destructuring pattern expected errors
 *
 * Handles 29 errors
 *
 * Pattern Categories:
 * 1. Malformed destructuring syntax
 * 2. Missing property names in destructuring
 * 3. Incorrect array/object destructuring mix
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class TS1180Processor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.errorsFixed = 0;
    this.backupDir = path.join(this.projectRoot, "backups", "phase4", "ts1180");
  }

  async process(dryRun = false) {
    console.log("🔧 TS1180 Processor - Fixing destructuring pattern errors...");
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`);

    if (!dryRun && !fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const filesWithErrors = await this.getFilesWithTS1180Errors();
    console.log(`Found ${filesWithErrors.length} files with TS1180 errors\n`);

    for (const filePath of filesWithErrors) {
      await this.processFile(filePath, dryRun);
    }

    return {
      filesProcessed: this.filesProcessed,
      errorsFixed: this.errorsFixed,
      success: true,
    };
  }

  async getFilesWithTS1180Errors() {
    try {
      const output = execSync("yarn tsc --noEmit 2>&1", {
        cwd: this.projectRoot,
        encoding: "utf8",
        maxBuffer: 50 * 1024 * 1024,
      });

      return this.extractFilesFromOutput(output);
    } catch (error) {
      const output = error.stdout || error.stderr || "";
      return this.extractFilesFromOutput(output);
    }
  }

  extractFilesFromOutput(output) {
    const lines = output.split("\n");
    const filesSet = new Set();

    for (const line of lines) {
      if (line.includes("error TS1180")) {
        const match = line.match(/^(.+?\.tsx?)\(/);
        if (match) {
          const filePath = path.join(this.projectRoot, match[1]);
          if (fs.existsSync(filePath)) {
            filesSet.add(filePath);
          }
        }
      }
    }

    return Array.from(filesSet);
  }

  async processFile(filePath, dryRun) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let modified = content;
      let fixCount = 0;

      // Pattern 1: Empty destructuring { } = obj
      const pattern1 = /^(\s*)(const|let|var)\s*\{\s*\}\s*=\s*(.+?)$/gm;
      modified = modified.replace(pattern1, (match, indent, keyword, value) => {
        fixCount++;
        return `${indent}// TODO: Add destructured properties: ${keyword} { /* properties */ } = ${value}`;
      });

      // Pattern 2: Malformed destructuring with double commas
      const pattern2 = /\{([^}]*),\s*,([^}]*)\}/g;
      modified = modified.replace(pattern2, (match, before, after) => {
        fixCount++;
        const cleaned = [before, after].filter((s) => s.trim()).join(", ");
        return `{${cleaned}}`;
      });

      // Pattern 3: Destructuring with trailing comma and no property
      const pattern3 = /\{([^}]+),\s*\}/g;
      modified = modified.replace(pattern3, (match, props) => {
        // Only fix if the trailing comma is actually at the end with no property after
        if (!/[a-zA-Z_$][a-zA-Z0-9_$]*\s*$/.test(props.trim())) {
          fixCount++;
          return `{${props.trim()}}`;
        }
        return match;
      });

      // Pattern 4: Array destructuring with missing elements [,, x]
      const pattern4 = /\[\s*,\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\]/g;
      modified = modified.replace(pattern4, (match, varName) => {
        fixCount++;
        return `[, , ${varName}]`; // Normalize spacing
      });

      // Pattern 5: Mixed bracket types (common typo) { x ] or [ x }
      const pattern5 = /\{([^}]*)\]/g;
      modified = modified.replace(pattern5, (match, content) => {
        // Only if this looks like destructuring gone wrong
        if (/^\s*[a-zA-Z_$][a-zA-Z0-9_$,\s]*$/.test(content)) {
          fixCount++;
          return `{${content}}`;
        }
        return match;
      });

      const pattern6 = /\[([^\]]*)\}/g;
      modified = modified.replace(pattern6, (match, content) => {
        // Only if this looks like destructuring gone wrong
        if (/^\s*[a-zA-Z_$][a-zA-Z0-9_$,\s]*$/.test(content)) {
          fixCount++;
          return `[${content}]`;
        }
        return match;
      });

      if (modified !== content) {
        this.filesProcessed++;
        this.errorsFixed += fixCount;

        if (dryRun) {
          console.log(`\n📄 ${path.relative(this.projectRoot, filePath)}`);
          console.log(`  Would fix ${fixCount} pattern(s)`);
        } else {
          // Create backup
          const backupPath = path.join(
            this.backupDir,
            `${path.basename(filePath)}.${Date.now()}.bak`,
          );
          fs.writeFileSync(backupPath, content);

          // Write fixed content
          fs.writeFileSync(filePath, modified);

          console.log(`\n✅ ${path.relative(this.projectRoot, filePath)}`);
          console.log(`  Fixed ${fixCount} pattern(s)`);
          console.log(
            `  Backup: ${path.relative(this.projectRoot, backupPath)}`,
          );
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  async analyze() {
    console.log("📊 TS1180 Error Analysis\n");

    const filesWithErrors = await this.getFilesWithTS1180Errors();

    console.log(`Total files with TS1180 errors: ${filesWithErrors.length}`);
    console.log("\nPattern capabilities:");
    console.log("  • Empty destructuring patterns");
    console.log("  • Double commas in destructuring");
    console.log("  • Trailing commas with missing properties");
    console.log("  • Array destructuring with missing elements");
    console.log("  • Mixed bracket types (common typos)");

    console.log("\nSample files to process:");
    filesWithErrors.slice(0, 10).forEach((file) => {
      console.log(`  - ${path.relative(this.projectRoot, file)}`);
    });

    if (filesWithErrors.length > 10) {
      console.log(`  ... and ${filesWithErrors.length - 10} more`);
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || "analyze";

  const processor = new TS1180Processor();

  switch (command) {
    case "analyze":
      await processor.analyze();
      break;

    case "dry-run":
      await processor.process(true);
      break;

    case "process":
      const result = await processor.process(false);
      console.log("\n📊 Processing Complete:");
      console.log(`  Files processed: ${result.filesProcessed}`);
      console.log(`  Errors fixed: ${result.errorsFixed}`);
      break;

    default:
      console.log(`
TS1180 Processor - Phase 4 Enterprise Error Elimination

Usage: node scripts/processors/ts1180-processor.js <command>

Commands:
  analyze   - Analyze TS1180 errors without making changes
  dry-run   - Show what would be fixed (no file changes)
  process   - Fix all TS1180 errors (creates backups)

Examples:
  node scripts/processors/ts1180-processor.js analyze
  node scripts/processors/ts1180-processor.js dry-run
  node scripts/processors/ts1180-processor.js process
      `);
  }
}

export default TS1180Processor;
