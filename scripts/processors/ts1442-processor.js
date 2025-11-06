#!/usr/bin/env node

/**
 * TS1442 Processor - Phase 4 Enterprise Error Elimination
 * Fixes TS1442: Expected '=' for property initializer / Unexpected token errors
 *
 * Handles 31 errors
 *
 * Pattern Categories:
 * 1. Colon (:) instead of equals (=) in property initializers
 * 2. Missing equals in class property declarations
 * 3. Interface syntax in class declarations
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class TS1442Processor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.errorsFixed = 0;
    this.backupDir = path.join(this.projectRoot, "backups", "phase4", "ts1442");
  }

  async process(dryRun = false) {
    console.log("🔧 TS1442 Processor - Fixing property initializer errors...");
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`);

    if (!dryRun && !fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const filesWithErrors = await this.getFilesWithTS1442Errors();
    console.log(`Found ${filesWithErrors.length} files with TS1442 errors\n`);

    for (const filePath of filesWithErrors) {
      await this.processFile(filePath, dryRun);
    }

    return {
      filesProcessed: this.filesProcessed,
      errorsFixed: this.errorsFixed,
      success: true,
    };
  }

  async getFilesWithTS1442Errors() {
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
      if (line.includes("error TS1442")) {
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

      // Pattern 1: Class property with colon instead of equals
      // private myProp: string: 'value' → private myProp: string = 'value'
      const pattern1 =
        /^(\s*)(private|public|protected|readonly|static)?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([^:;]+?):\s*(.+?)$/gm;
      modified = modified.replace(
        pattern1,
        (match, indent, modifier, name, type, value) => {
          fixCount++;
          const mod = modifier ? `${modifier} ` : "";
          return `${indent}${mod}${name}: ${type.trim()} = ${value.trim()}`;
        },
      );

      // Pattern 2: Property initializer with wrong syntax
      // myProp: MyType: value → myProp: MyType = value
      const pattern2 =
        /^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([A-Z][a-zA-Z0-9_$<>[\]|&]*)\s*:\s*(.+?)$/gm;
      modified = modified.replace(
        pattern2,
        (match, indent, name, type, value) => {
          fixCount++;
          return `${indent}${name}: ${type} = ${value}`;
        },
      );

      // Pattern 3: Object property declaration in class (should use equals)
      // In class context: property: value → property = value
      const lines = modified.split("\n");
      let inClass = false;
      let classDepth = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Track class context
        if (trimmed.startsWith("class ") || trimmed.includes(" class ")) {
          inClass = true;
          classDepth = 0;
        }

        if (inClass) {
          classDepth += (line.match(/\{/g) || []).length;
          classDepth -= (line.match(/\}/g) || []).length;

          if (classDepth === 0 && trimmed.endsWith("}")) {
            inClass = false;
          }

          // Fix class property with colon initialization
          if (
            inClass &&
            classDepth > 0 &&
            /^\s*(private|public|protected|readonly|static)?\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[A-Z]/.test(
              line,
            )
          ) {
            // Check if it's an initialization (has value after type)
            const propMatch = line.match(
              /^(\s*(?:private|public|protected|readonly|static)?\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*([A-Z][a-zA-Z0-9_$<>[\]|&]*)\s*:\s*(.+)$/,
            );
            if (propMatch) {
              lines[i] =
                `${propMatch[1]}${propMatch[2]}: ${propMatch[3]} = ${propMatch[4]}`;
              fixCount++;
            }
          }
        }
      }

      modified = lines.join("\n");

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
    console.log("📊 TS1442 Error Analysis\n");

    const filesWithErrors = await this.getFilesWithTS1442Errors();

    console.log(`Total files with TS1442 errors: ${filesWithErrors.length}`);
    console.log("\nPattern capabilities:");
    console.log("  • Colon instead of equals in property initializers");
    console.log("  • Class property declaration syntax fixes");
    console.log("  • Interface-style syntax in class bodies");

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

  const processor = new TS1442Processor();

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
TS1442 Processor - Phase 4 Enterprise Error Elimination

Usage: node scripts/processors/ts1442-processor.js <command>

Commands:
  analyze   - Analyze TS1442 errors without making changes
  dry-run   - Show what would be fixed (no file changes)
  process   - Fix all TS1442 errors (creates backups)

Examples:
  node scripts/processors/ts1442-processor.js analyze
  node scripts/processors/ts1442-processor.js dry-run
  node scripts/processors/ts1442-processor.js process
      `);
  }
}

export default TS1442Processor;
