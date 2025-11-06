#!/usr/bin/env node

/**
 * TS1434 Processor - Phase 4 Enterprise Error Elimination
 * Fixes TS1434: Unexpected keyword or identifier errors
 *
 * Handles 39 errors related to incorrect keyword usage and unexpected identifiers
 *
 * Pattern Categories:
 * 1. Wrong keyword in class/interface declarations
 * 2. Incorrect keyword in function declarations
 * 3. Unexpected identifiers in reserved contexts
 * 4. Keyword confusion (const vs class, function vs const, etc.)
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class TS1434Processor {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../..",
    );
    this.filesProcessed = 0;
    this.errorsFixed = 0;
    this.backupDir = path.join(this.projectRoot, "backups", "phase4", "ts1434");
    this.patterns = [
      {
        name: "Class with function keyword",
        // Matches: function class ClassName
        regex: /^(\s*)function\s+class\s+(\w+)/gm,
        fix: (match, indent, className) => `${indent}class ${className}`,
      },
      {
        name: "Interface with class keyword",
        // Matches: class interface InterfaceName
        regex: /^(\s*)class\s+interface\s+(\w+)/gm,
        fix: (match, indent, interfaceName) =>
          `${indent}interface ${interfaceName}`,
      },
      {
        name: "Const used as function declaration",
        // Matches: const function functionName
        regex: /^(\s*)const\s+function\s+(\w+)/gm,
        fix: (match, indent, functionName) =>
          `${indent}function ${functionName}`,
      },
      {
        name: "Let used as function declaration",
        // Matches: let function functionName
        regex: /^(\s*)let\s+function\s+(\w+)/gm,
        fix: (match, indent, functionName) =>
          `${indent}function ${functionName}`,
      },
      {
        name: "Var used as function declaration",
        // Matches: var function functionName
        regex: /^(\s*)var\s+function\s+(\w+)/gm,
        fix: (match, indent, functionName) =>
          `${indent}function ${functionName}`,
      },
      {
        name: "Function used as variable declaration",
        // Matches: function const variableName
        regex: /^(\s*)function\s+const\s+(\w+)/gm,
        fix: (match, indent, variableName) => `${indent}const ${variableName}`,
      },
      {
        name: "Class used as variable declaration",
        // Matches: class const variableName
        regex: /^(\s*)class\s+const\s+(\w+)/gm,
        fix: (match, indent, variableName) => `${indent}const ${variableName}`,
      },
      {
        name: "Interface used as variable declaration",
        // Matches: interface const variableName
        regex: /^(\s*)interface\s+const\s+(\w+)/gm,
        fix: (match, indent, variableName) => `${indent}const ${variableName}`,
      },
      {
        name: "Type used as variable declaration",
        // Matches: type const variableName
        regex: /^(\s*)type\s+const\s+(\w+)/gm,
        fix: (match, indent, variableName) => `${indent}const ${variableName}`,
      },
      {
        name: "Enum used as variable declaration",
        // Matches: enum const variableName
        regex: /^(\s*)enum\s+const\s+(\w+)/gm,
        fix: (match, indent, variableName) => `${indent}const ${variableName}`,
      },
      {
        name: "Duplicate keywords in class declaration",
        // Matches: class class ClassName
        regex: /^(\s*)class\s+class\s+(\w+)/gm,
        fix: (match, indent, className) => `${indent}class ${className}`,
      },
      {
        name: "Duplicate keywords in interface declaration",
        // Matches: interface interface InterfaceName
        regex: /^(\s*)interface\s+interface\s+(\w+)/gm,
        fix: (match, indent, interfaceName) =>
          `${indent}interface ${interfaceName}`,
      },
      {
        name: "Duplicate keywords in function declaration",
        // Matches: function function functionName
        regex: /^(\s*)function\s+function\s+(\w+)/gm,
        fix: (match, indent, functionName) =>
          `${indent}function ${functionName}`,
      },
      {
        name: "Wrong keyword in export declaration",
        // Matches: export const interface InterfaceName
        regex: /^(\s*)export\s+const\s+interface\s+(\w+)/gm,
        fix: (match, indent, interfaceName) =>
          `${indent}export interface ${interfaceName}`,
      },
      {
        name: "Wrong keyword in export class declaration",
        // Matches: export function class ClassName
        regex: /^(\s*)export\s+function\s+class\s+(\w+)/gm,
        fix: (match, indent, className) => `${indent}export class ${className}`,
      },
      {
        name: "Wrong keyword in export interface declaration",
        // Matches: export class interface InterfaceName
        regex: /^(\s*)export\s+class\s+interface\s+(\w+)/gm,
        fix: (match, indent, interfaceName) =>
          `${indent}export interface ${interfaceName}`,
      },
      {
        name: "Wrong keyword in type declaration",
        // Matches: const type TypeName
        regex: /^(\s*)const\s+type\s+(\w+)/gm,
        fix: (match, indent, typeName) => `${indent}type ${typeName}`,
      },
      {
        name: "Wrong keyword in enum declaration",
        // Matches: const enum EnumName
        regex: /^(\s*)const\s+enum\s+(\w+)/gm,
        fix: (match, indent, enumName) => `${indent}enum ${enumName}`,
      },
    ];
  }

  async process(dryRun = false) {
    console.log(
      "🔧 TS1434 Processor - Fixing unexpected keyword/identifier errors...",
    );
    console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`);

    // Create backup directory
    if (!dryRun && !fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Get files with TS1434 errors
    const filesWithErrors = await this.getFilesWithTS1434Errors();

    console.log(`Found ${filesWithErrors.length} files with TS1434 errors\n`);

    for (const filePath of filesWithErrors) {
      await this.processFile(filePath, dryRun);
    }

    return {
      filesProcessed: this.filesProcessed,
      errorsFixed: this.errorsFixed,
      success: true,
    };
  }

  async getFilesWithTS1434Errors() {
    try {
      const output = execSync("yarn tsc --noEmit 2>&1", {
        cwd: this.projectRoot,
        encoding: "utf8",
        maxBuffer: 50 * 1024 * 1024,
      });

      const lines = output.split("\n");
      const filesSet = new Set();

      for (const line of lines) {
        if (line.includes("error TS1434")) {
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
    } catch (error) {
      // TypeScript errors expected - parse from error output
      const output = error.stdout || error.stderr || "";
      const lines = output.split("\n");
      const filesSet = new Set();

      for (const line of lines) {
        if (line.includes("error TS1434")) {
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
  }

  async processFile(filePath, dryRun) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let modified = content;
      let fixCount = 0;

      // Apply each pattern
      for (const pattern of this.patterns) {
        const before = modified;
        modified = modified.replace(pattern.regex, (...args) => {
          fixCount++;
          return pattern.fix(...args);
        });

        if (modified !== before) {
          console.log(`  ✓ Applied: ${pattern.name}`);
        }
      }

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
    console.log("📊 TS1434 Error Analysis\n");

    const filesWithErrors = await this.getFilesWithTS1434Errors();

    console.log(`Total files with TS1434 errors: ${filesWithErrors.length}`);
    console.log("\nPattern capabilities:");

    for (const pattern of this.patterns) {
      console.log(`  • ${pattern.name}`);
    }

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

  const processor = new TS1434Processor();

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
TS1434 Processor - Phase 4 Enterprise Error Elimination

Usage: node scripts/processors/ts1434-processor.js <command>

Commands:
  analyze   - Analyze TS1434 errors without making changes
  dry-run   - Show what would be fixed (no file changes)
  process   - Fix all TS1434 errors (creates backups)

Examples:
  node scripts/processors/ts1434-processor.js analyze
  node scripts/processors/ts1434-processor.js dry-run
  node scripts/processors/ts1434-processor.js process
      `);
  }
}

export default TS1434Processor;
