#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const REPAIR_PATTERNS = [
  {
    name: "return_statement_trailing_comma",
    pattern: /^(\s*)return\s+([^,\n{][^,\n]*),\s*$/gm,
    fix: (match, indent, value) => `${indent}return ${value.trim()};`,
    description:
      "Fix return statements with trailing commas (return value, → return value;)",
  },
  {
    name: "closing_brace_before_same_level_property",
    pattern: /^(\s*)\}\s*\n(\1)([a-zA-Z_][a-zA-Z0-9_]*\s*:)/gm,
    fix: (match, indent, sameIndent, property) =>
      `${indent}},\n${sameIndent}${property}`,
    description: "Add comma after } when followed by same-indentation property",
  },
  {
    name: "closing_brace_blank_line_property",
    pattern: /^(\s*)\}\s*\n\s*\n(\1[a-zA-Z_][a-zA-Z0-9_]*\s*:)/gm,
    fix: (match, indent, nextLine) => `${indent}},\n\n${nextLine}`,
    description: "Add comma after } followed by blank line and property",
  },
  {
    name: "closing_brace_comment_property",
    pattern:
      /^(\s*)\}\s*\n(\s*\/\/[^\n]*\n)(\s*)([a-zA-Z_][a-zA-Z0-9_]*\s*:)/gm,
    fix: (match, indent, comment, propIndent, property) =>
      `${indent}},\n${comment}${propIndent}${property}`,
    description: "Add comma after } followed by comment and property",
  },
  {
    name: "return_no_value_with_comma",
    pattern: /^(\s*)return\s*,\s*$/gm,
    fix: (match, indent) => `${indent}return;`,
    description: "Fix return statement with only comma (return, → return;)",
  },
  {
    name: "if_return_trailing_comma",
    pattern: /^(\s*if\s*\([^)]+\))\s+return\s+([^,\n]+),\s*$/gm,
    fix: (match, ifPart, value) => `${ifPart} return ${value.trim()};`,
    description: "Fix if-return one-liners with trailing commas",
  },
  {
    name: "closing_brace_before_property_with_spaces",
    pattern: /^(\s*)\}\s*\n([ \t]+)([a-zA-Z_][a-zA-Z0-9_]*\s*:)/gm,
    fix: (match, indent, spaces, property) => {
      // Only add comma if the property indentation suggests it's at the same level
      // Check if spaces length is similar to indent length (within 2 chars)
      if (Math.abs(spaces.length - indent.length) <= 2) {
        return `${indent}},\n${spaces}${property}`;
      }
      return match; // Don't modify if indentation doesn't match
    },
    description:
      "Add comma after } when followed by similarly-indented property",
  },
];

class SyntaxRepairToolV4 {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.stats = {
      filesProcessed: 0,
      filesModified: 0,
      totalFixes: 0,
      fixesByPattern: {},
      errors: [],
    };
  }

  repairFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let repairedContent = content;
      let fileFixes = 0;
      const fixDetails = [];

      for (const pattern of REPAIR_PATTERNS) {
        const beforeContent = repairedContent;
        const matches = repairedContent.match(pattern.pattern);

        if (matches) {
          const fixCount = matches.length;

          if (this.verbose) {
            fixDetails.push(`${pattern.name}: ${fixCount}`);
          }

          repairedContent = repairedContent.replace(
            pattern.pattern,
            pattern.fix,
          );

          // Verify the replacement actually changed something
          if (repairedContent !== beforeContent) {
            fileFixes += fixCount;
            this.stats.fixesByPattern[pattern.name] =
              (this.stats.fixesByPattern[pattern.name] || 0) + fixCount;
          }
        }
      }

      if (fileFixes > 0) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, repairedContent, "utf8");
        }

        this.stats.filesModified++;
        this.stats.totalFixes += fileFixes;

        const prefix = this.dryRun ? "[DRY RUN]" : "✓";
        console.log(
          `  ${prefix} ${path.basename(filePath)}: ${fileFixes} fixes`,
        );

        if (this.verbose && fixDetails.length > 0) {
          fixDetails.forEach((detail) => console.log(`      - ${detail}`));
        }
      }

      this.stats.filesProcessed++;
      return fileFixes;
    } catch (error) {
      this.stats.errors.push({ file: filePath, error: error.message });
      console.error(`  ✗ Error processing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          this.processDirectory(fullPath);
        }
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
      ) {
        this.repairFile(fullPath);
      }
    }
  }

  printReport() {
    console.log("\n📊 Syntax Repair V4 Report");
    console.log("===========================");
    console.log(
      `Mode: ${this.dryRun ? "DRY RUN (no changes made)" : "LIVE (changes applied)"}`,
    );
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files modified: ${this.stats.filesModified}`);
    console.log(
      `Total fixes ${this.dryRun ? "identified" : "applied"}: ${this.stats.totalFixes}`,
    );
    console.log(`Errors: ${this.stats.errors.length}`);

    if (Object.keys(this.stats.fixesByPattern).length > 0) {
      console.log("\nFixes by pattern:");
      Object.entries(this.stats.fixesByPattern)
        .sort(([, a], [, b]) => b - a)
        .forEach(([pattern, count]) => {
          const desc =
            REPAIR_PATTERNS.find((p) => p.name === pattern)?.description ||
            pattern;
          console.log(`  ${pattern}: ${count}`);
          console.log(`    └─ ${desc}`);
        });
    }

    if (this.stats.errors.length > 0) {
      console.log("\nErrors encountered:");
      this.stats.errors.forEach(({ file, error }) => {
        console.log(`  ${file}: ${error}`);
      });
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const targetPath = args.find((arg) => !arg.startsWith("--")) || "./src";
const dryRun = args.includes("--dry-run");
const verbose = args.includes("--verbose");

console.log(`🔧 TypeScript Syntax Repair Tool V4`);
console.log(`Target: ${targetPath}`);
console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`);

const repairer = new SyntaxRepairToolV4({ dryRun, verbose });

// Check if target is a file or directory
const stats = fs.statSync(targetPath);
if (stats.isFile()) {
  repairer.repairFile(targetPath);
} else {
  repairer.processDirectory(targetPath);
}

repairer.printReport();

console.log(`\n✨ ${dryRun ? "Analysis" : "Repair"} complete!`);
