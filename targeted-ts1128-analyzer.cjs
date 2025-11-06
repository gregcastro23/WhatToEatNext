#!/usr/bin/env node

/**
 * Targeted TS1128 Error Pattern Analyzer
 * Linting Excellence Campaign - Task 1.1 Analysis
 *
 * Analyzes specific TS1128 patterns and creates targeted fixes
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TS1128PatternAnalyzer {
  constructor() {
    this.patterns = new Map();
    this.errorLocations = [];
  }

  async analyze() {
    console.log("🔍 TS1128 Error Pattern Analysis\n");

    // Get all TS1128 errors
    const errors = await this.getTS1128Errors();
    console.log(`📊 Found ${errors.length} TS1128 errors`);

    // Analyze each error location
    for (const error of errors) {
      await this.analyzeError(error);
    }

    // Report patterns
    this.reportPatterns();

    // Generate targeted fix recommendations
    this.generateFixRecommendations();
  }

  async getTS1128Errors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1128"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const errors = [];
      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        const match = line.match(
          /^(.+?)\((\d+),(\d+)\):\s*error TS1128:\s*(.+)$/,
        );
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            message: match[4],
          });
        }
      }

      return errors;
    } catch (error) {
      return [];
    }
  }

  async analyzeError(error) {
    try {
      if (!fs.existsSync(error.file)) {
        return;
      }

      const content = fs.readFileSync(error.file, "utf8");
      const lines = content.split("\n");
      const errorLine = lines[error.line - 1];
      const contextBefore = lines[error.line - 2] || "";
      const contextAfter = lines[error.line] || "";

      if (errorLine) {
        const pattern = this.identifyPattern(
          errorLine,
          contextBefore,
          contextAfter,
        );
        const count = this.patterns.get(pattern) || 0;
        this.patterns.set(pattern, count + 1);

        this.errorLocations.push({
          ...error,
          errorLine,
          contextBefore,
          contextAfter,
          pattern,
        });
      }
    } catch (err) {
      // Skip files that can't be read
    }
  }

  identifyPattern(errorLine, contextBefore, contextAfter) {
    // Check for specific patterns
    if (errorLine.includes("(: any : any {") && errorLine.includes("}")) {
      return "MALFORMED_FUNCTION_PARAMS";
    }

    if (errorLine.includes("{,") && errorLine.includes(":")) {
      return "MALFORMED_OBJECT_LITERAL";
    }

    if (errorLine.includes("export: {,")) {
      return "MALFORMED_EXPORT_OBJECT";
    }

    if (errorLine.includes("};") && contextAfter.includes("});")) {
      return "DOUBLE_CLOSING_BRACES";
    }

    if (
      errorLine.includes("function") &&
      errorLine.includes(": any") &&
      errorLine.includes(": any")
    ) {
      return "DOUBLE_ANY_FUNCTION";
    }

    if (errorLine.trim() === "});" && contextBefore.includes("};")) {
      return "EXTRA_CLOSING_STATEMENT";
    }

    if (
      errorLine.includes("</div>") ||
      errorLine.includes("};") ||
      errorLine.includes("});")
    ) {
      return "JSX_CLOSING_CONTEXT";
    }

    return "OTHER_PATTERN";
  }

  reportPatterns() {
    console.log("\n📈 Pattern Analysis Results:");
    console.log("=".repeat(50));

    const sortedPatterns = Array.from(this.patterns.entries()).sort(
      ([, a], [, b]) => b - a,
    );

    for (const [pattern, count] of sortedPatterns) {
      console.log(
        `${pattern.padEnd(30)} ${count.toString().padStart(4)} occurrences`,
      );
    }

    console.log("\n🔍 Sample Error Locations:");
    console.log("=".repeat(50));

    // Show examples of each pattern
    const patternExamples = new Map();
    for (const location of this.errorLocations) {
      if (!patternExamples.has(location.pattern)) {
        patternExamples.set(location.pattern, []);
      }
      if (patternExamples.get(location.pattern).length < 2) {
        patternExamples.get(location.pattern).push(location);
      }
    }

    for (const [pattern, examples] of patternExamples) {
      console.log(`\n${pattern}:`);
      for (const example of examples) {
        console.log(`  📁 ${path.basename(example.file)}:${example.line}`);
        console.log(`     Before: ${example.contextBefore.trim()}`);
        console.log(`  ❌ Error:  ${example.errorLine.trim()}`);
        console.log(`     After:  ${example.contextAfter.trim()}`);
      }
    }
  }

  generateFixRecommendations() {
    console.log("\n🛠️  Targeted Fix Recommendations:");
    console.log("=".repeat(50));

    const fixes = {
      MALFORMED_FUNCTION_PARAMS: {
        description: "Fix malformed function parameters",
        pattern: "(: any : any { prop = value }: Type)",
        replacement: "({ prop = value }: Type)",
        regex:
          "/\\(\\s*:\\s*any\\s*:\\s*any\\s*(\\{[^}]+\\})\\s*:\\s*(\\{[^}]+\\})\\s*\\)/g",
        safetyLevel: "HIGH",
      },
      MALFORMED_OBJECT_LITERAL: {
        description: "Fix malformed object literals",
        pattern: "{, property: value}",
        replacement: "{ property: value }",
        regex: "/\\{\\s*,\\s*([^}]+)\\}/g",
        safetyLevel: "HIGH",
      },
      MALFORMED_EXPORT_OBJECT: {
        description: "Fix malformed export objects",
        pattern: "export: {,",
        replacement: "export: {",
        regex: "/export:\\s*\\{\\s*,\\s*/g",
        safetyLevel: "HIGH",
      },
      DOUBLE_CLOSING_BRACES: {
        description: "Fix double closing braces",
        pattern: "}; });",
        replacement: "});",
        regex: "/\\}\\s*;\\s*\\}\\s*\\)\\s*;/g",
        safetyLevel: "MEDIUM",
      },
      JSX_CLOSING_CONTEXT: {
        description: "JSX context issues - manual review needed",
        pattern: "Various JSX closing patterns",
        replacement: "Manual review required",
        regex: "N/A",
        safetyLevel: "LOW",
      },
    };

    for (const [pattern, count] of Array.from(this.patterns.entries()).sort(
      ([, a], [, b]) => b - a,
    )) {
      const fix = fixes[pattern];
      if (fix) {
        console.log(`\n${pattern} (${count} occurrences):`);
        console.log(`  Description: ${fix.description}`);
        console.log(`  Pattern:     ${fix.pattern}`);
        console.log(`  Fix:         ${fix.replacement}`);
        console.log(`  Regex:       ${fix.regex}`);
        console.log(`  Safety:      ${fix.safetyLevel}`);
      }
    }

    console.log("\n📋 Implementation Strategy:");
    console.log("=".repeat(50));
    console.log(
      "1. Start with HIGH safety patterns (MALFORMED_FUNCTION_PARAMS, MALFORMED_OBJECT_LITERAL)",
    );
    console.log("2. Test on 5 files first as per requirements");
    console.log("3. Validate build after each batch");
    console.log("4. Process in batches of 10 files");
    console.log("5. Preserve astrological calculation accuracy");
    console.log("6. Create backups before any changes");
  }
}

// Execute the analyzer
if (require.main === module) {
  const analyzer = new TS1128PatternAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = TS1128PatternAnalyzer;
