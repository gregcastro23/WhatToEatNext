#!/usr/bin/env node

/**
 * Fix malformed destructuring patterns with : any
 * Targets patterns like:
 * - forEach(([key: any, value]: any) =>
 * - forEach(([_planet: any, position]: any) =>
 * Converts to proper syntax:
 * - forEach(([key, value]) =>
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class MalformedDestructuringFixer {
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

      // Pattern 1: Fix malformed array destructuring with : any in forEach/map/filter
      // ([key: any, value]: any) => should become ([key, value]) =>
      content = content.replace(
        /\(\[([^:\]]+):\s*any(?:,\s*([^:\]]+))?\]:\s*any\)/g,
        (match, p1, p2) => {
          fixes++;
          if (p2) {
            return `([${p1.trim()}, ${p2.trim()}])`;
          } else {
            return `([${p1.trim()}])`;
          }
        },
      );

      // Pattern 2: Fix malformed object destructuring
      // ({prop: any}) => should become ({prop}) =>
      content = content.replace(/\(\{([^:}]+):\s*any\}\)/g, (match, p1) => {
        fixes++;
        return `({${p1.trim()}})`;
      });

      // Pattern 3: Fix forEach with explicit typing after destructuring
      // .forEach(([key: any, value]: any) => should become .forEach(([key, value]) =>
      content = content.replace(
        /\.forEach\s*\(\s*\(\s*\[([^:\]]+):\s*any(?:,\s*([^:\]]+))?(?::\s*any)?\]\s*:\s*any\s*\)/g,
        (match, p1, p2) => {
          fixes++;
          if (p2) {
            return `.forEach(([${p1.trim()}, ${p2.trim()}])`;
          } else {
            return `.forEach(([${p1.trim()}])`;
          }
        },
      );

      // Pattern 4: Fix entries/map/filter with malformed destructuring
      content = content.replace(
        /\.(entries|map|filter|reduce|some|every|find)\s*\(\s*\(\s*\[([^:\]]+):\s*any(?:,\s*([^:\]]+))?(?::\s*any)?\]\s*:\s*any\s*\)/g,
        (match, method, p1, p2) => {
          fixes++;
          if (p2) {
            return `.${method}(([${p1.trim()}, ${p2.trim()}])`;
          } else {
            return `.${method}(([${p1.trim()}])`;
          }
        },
      );

      if (fixes > 0 && content !== originalContent) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, content, "utf8");
        }
        this.fixedFiles.push(filePath);
        this.totalFixes += fixes;
        console.log(
          `  ✅ Fixed ${fixes} patterns in ${path.basename(filePath)}`,
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
    console.log("🔧 Fixing Malformed Destructuring Patterns...\n");
    if (this.dryRun) {
      console.log("📝 DRY RUN MODE - No files will be modified\n");
    }

    const initialErrors = this.getErrorCount();
    console.log(`📊 Initial TypeScript errors: ${initialErrors}`);

    // Find all TypeScript files
    const testFiles = execSync(
      'find src -name "*.ts" -o -name "*.tsx" 2>/dev/null || true',
      {
        encoding: "utf8",
      },
    )
      .trim()
      .split("\n")
      .filter((f) => f);

    console.log(
      `\n🔍 Checking ${testFiles.length} files for malformed patterns...`,
    );

    // Process files in batches
    const batchSize = 10;
    for (let i = 0; i < testFiles.length; i += batchSize) {
      const batch = testFiles.slice(i, i + batchSize);
      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(testFiles.length / batchSize)}`,
      );

      for (const file of batch) {
        this.fixFile(file);
      }

      // Validate after each batch
      if (!this.dryRun && this.totalFixes > 0 && (i + batchSize) % 50 === 0) {
        const currentErrors = this.getErrorCount();
        console.log(`  📊 Current error count: ${currentErrors}`);
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

const fixer = new MalformedDestructuringFixer();
fixer.run().catch(console.error);
