#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const REPAIR_PATTERNS = [
  {
    name: "missing_comma_after_closing_brace_in_record",
    pattern: /(\}\s*)(\n\s+['"][^'"]+['"]:)/g,
    fix: (match, closingBrace, nextLine) =>
      `${closingBrace.trimEnd()},${nextLine}`,
    description:
      "Fix missing commas after } in Record values (e.g., \"key: { ... }\\n  'nextKey': ...\")",
  },
  {
    name: "missing_comma_after_closing_brace_in_array",
    pattern: /(\{ [^}]+ \}\s*)(\n\s+\{)/g,
    fix: (match, closingBrace, nextLine) =>
      `${closingBrace.trimEnd()},${nextLine}`,
    description:
      'Fix missing commas after } in array items (e.g., "{ ... }\\n      { ...")',
  },
  {
    name: "concatenated_numeric_properties",
    pattern: /:\s*(\d+\.?\d*)\s*([A-Z][A-Za-z0-9_]+)\s*:/g,
    fix: (match, num, prop) => `: ${num},\n    ${prop}:`,
    description:
      'Fix concatenated numeric properties (e.g., "niacin: 0.5B6: 0.38")',
  },
  {
    name: "missing_comma_rda_comment",
    pattern: /:\s*(\d+\.?\d*),?\s*\/\/\s*([^,\n]+),?\s*\n\s*([A-Z][a-z_]+):/g,
    fix: (match, num, comment, nextProp) =>
      `: ${num}, // ${comment}\n    ${nextProp}:`,
    description: "Fix missing commas after RDA comments",
  },
  {
    name: "missing_comma_before_brace",
    pattern: /:\s*([0-9.]+|"[^"]*"|'[^']*'|true|false)\s*\n(\s+)\}/g,
    fix: (match, value, indent) => `: ${value},\n${indent}}`,
    description: "Fix missing commas before closing brace",
  },
  {
    name: "object_semicolon_instead_of_comma",
    pattern: /:\s*([^,;\n]+);(\s*\n\s+[a-zA-Z_])/g,
    fix: (match, value, rest) => `: ${value.trim()},${rest}`,
    description: "Replace semicolons with commas in objects",
  },
  {
    name: "array_semicolon_instead_of_comma",
    pattern: /([}\]]);(\s*\n\s+[{\[])/g,
    fix: (match, bracket, rest) => `${bracket},${rest}`,
    description: "Replace semicolons with commas in arrays",
  },
  {
    name: "function_param_semicolon",
    pattern: /\(([^)]+);([^)]*)\)/g,
    fix: (match, param1, param2) => `(${param1.trim()},${param2})`,
    description: "Replace semicolons with commas in function parameters",
  },
  {
    name: "missing_comma_after_array_item",
    pattern: /(\])\s*\n(\s+)\[/g,
    fix: (match, bracket, indent) => `${bracket},\n${indent}[`,
    description: "Fix missing commas between array items",
  },
  {
    name: "missing_comma_in_object_after_value",
    pattern:
      /:\s*([0-9.]+|"[^"]*"|'[^']*'|true|false)\s+\n\s+([a-zA-Z_][a-zA-Z0-9_]*):/g,
    fix: (match, value, nextKey) => `: ${value},\n    ${nextKey}:`,
    description: "Fix missing comma after object property value",
  },
  {
    name: "missing_comma_after_string_in_array",
    pattern: /(['"])([^'"]+)\1(\s*)(\n\s+['"])/g,
    fix: (match, quote1, content, space, nextLine) =>
      `${quote1}${content}${quote1},${nextLine}`,
    description: "Add comma after string literals in arrays",
  },
];

class SyntaxRepairToolV2 {
  constructor() {
    this.stats = {
      filesProcessed: 0,
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

      for (const pattern of REPAIR_PATTERNS) {
        const matches = repairedContent.match(pattern.pattern);
        if (matches) {
          const fixCount = matches.length;
          repairedContent = repairedContent.replace(
            pattern.pattern,
            pattern.fix,
          );
          fileFixes += fixCount;
          this.stats.fixesByPattern[pattern.name] =
            (this.stats.fixesByPattern[pattern.name] || 0) + fixCount;
        }
      }

      if (fileFixes > 0) {
        fs.writeFileSync(filePath, repairedContent, "utf8");
        this.stats.totalFixes += fileFixes;
        console.log(`  ✓ ${path.basename(filePath)}: ${fileFixes} fixes`);
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
    console.log("\n📊 Syntax Repair V2 Report");
    console.log("===========================");
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Total fixes applied: ${this.stats.totalFixes}`);
    console.log(`Errors: ${this.stats.errors.length}`);

    if (Object.keys(this.stats.fixesByPattern).length > 0) {
      console.log("\nFixes by pattern:");
      Object.entries(this.stats.fixesByPattern)
        .sort(([, a], [, b]) => b - a)
        .forEach(([pattern, count]) => {
          console.log(`  ${pattern}: ${count}`);
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

const targetPath = process.argv[2] || "./src";
console.log(`🔧 Starting Syntax Repair V2 on: ${targetPath}\n`);

const repairer = new SyntaxRepairToolV2();

// Check if target is a file or directory
const stats = fs.statSync(targetPath);
if (stats.isFile()) {
  repairer.repairFile(targetPath);
} else {
  repairer.processDirectory(targetPath);
}

repairer.printReport();

console.log("\n✨ Repair complete!");
