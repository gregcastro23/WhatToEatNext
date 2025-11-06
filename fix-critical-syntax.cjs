#!/usr/bin/env node

/**
 * Fix critical syntax errors that block builds
 * Focuses on comma/semicolon issues in statements
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class CriticalSyntaxFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.dryRun = process.argv.includes("--dry-run");
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixes = 0;

      // Pattern 1: Fix commas at end of statements in functions/blocks
      // service = new Service(), -> service = new Service();
      content = content.replace(
        /^(\s*)([^=,\n]+\s*=\s*[^,\n]+),(\s*)$/gm,
        (match, indent, statement, trailing) => {
          fixes++;
          return `${indent}${statement};${trailing}`;
        },
      );

      // Pattern 2: Fix expect statements with commas
      // expect(state).toHaveProperty('prop'), -> expect(state).toHaveProperty('prop');
      content = content.replace(
        /^(\s*)(expect\([^)]+\)[^,\n]*),(\s*)$/gm,
        (match, indent, expectStatement, trailing) => {
          fixes++;
          return `${indent}${expectStatement};${trailing}`;
        },
      );

      // Pattern 3: Fix function calls ending with commas
      // someFunction(params), -> someFunction(params);
      content = content.replace(
        /^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\)),(\s*)$/gm,
        (match, indent, functionCall, trailing) => {
          fixes++;
          return `${indent}${functionCall};${trailing}`;
        },
      );

      // Pattern 4: Fix variable assignments ending with commas
      // variable = value, -> variable = value;
      content = content.replace(
        /^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*[^,\n]+),(\s*)$/gm,
        (match, indent, assignment, trailing) => {
          fixes++;
          return `${indent}${assignment};${trailing}`;
        },
      );

      // Pattern 5: Fix method chains ending with commas
      // obj.method().method(), -> obj.method().method();
      content = content.replace(
        /^(\s*)([^,\n]*\.[^,\n]*),(\s*)$/gm,
        (match, indent, methodChain, trailing) => {
          // Only fix if it's not inside an object literal or array
          if (!methodChain.includes("{") && !methodChain.includes("[")) {
            fixes++;
            return `${indent}${methodChain};${trailing}`;
          }
          return match;
        },
      );

      if (fixes > 0 && content !== originalContent) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, content, "utf8");
        }
        this.fixedFiles.push(filePath);
        this.totalFixes += fixes;
        console.log(
          `  ✅ Fixed ${fixes} critical syntax issues in ${path.basename(filePath)}`,
        );
        return fixes;
      }
      return 0;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  getErrorCount() {
    try {
      const output = execSync("yarn tsc --noEmit --skipLibCheck 2>&1 || true", {
        encoding: "utf8",
        maxBuffer: 50 * 1024 * 1024,
      });
      const matches = output.match(/error TS/g);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }

  async run() {
    console.log("🚨 Fixing Critical Build-Blocking Syntax Errors...\n");
    if (this.dryRun) {
      console.log("📝 DRY RUN MODE - No files will be modified\n");
    }

    const initialErrors = this.getErrorCount();
    console.log(`📊 Initial TypeScript errors: ${initialErrors}`);

    // Find files with "Expression expected" errors
    let errorFiles = [];
    try {
      const tscOutput = execSync(
        "yarn tsc --noEmit --skipLibCheck 2>&1 || true",
        {
          encoding: "utf8",
          maxBuffer: 50 * 1024 * 1024,
        },
      );

      const lines = tscOutput.split("\n");
      const expressionErrorFiles = new Set();

      lines.forEach((line) => {
        if (line.includes("Expression expected") || line.includes("TS1109")) {
          const match = line.match(/^([^(]+)\(/);
          if (match) {
            expressionErrorFiles.add(match[1]);
          }
        }
      });

      errorFiles = Array.from(expressionErrorFiles);
    } catch (error) {
      console.log("Could not get specific error files, processing test files");
      errorFiles = execSync(
        'find src -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null || true',
        {
          encoding: "utf8",
        },
      )
        .trim()
        .split("\n")
        .filter((f) => f);
    }

    console.log(
      `\n🔍 Processing ${errorFiles.length} files with critical syntax errors...`,
    );

    for (const file of errorFiles) {
      if (fs.existsSync(file)) {
        this.fixFile(file);
      }
    }

    const finalErrors = this.getErrorCount();

    console.log("\n" + "=".repeat(60));
    console.log("📈 Final Results:");
    console.log(`   Initial errors: ${initialErrors}`);
    console.log(`   Final errors: ${finalErrors}`);
    console.log(`   Errors fixed: ${initialErrors - finalErrors}`);
    console.log(`   Files processed: ${this.fixedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (this.dryRun) {
      console.log(
        "\n⚠️  DRY RUN COMPLETE - Run without --dry-run to apply fixes",
      );
    }
  }
}

const fixer = new CriticalSyntaxFixer();
fixer.run().catch(console.error);
