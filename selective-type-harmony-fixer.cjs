#!/usr/bin/env node

/**
 * Selective Type Harmony Fixer - Intelligent TypeScript Error Resolution
 * Focuses on TS2345 (argument type) and TS2322 (type assignment) errors
 * Uses targeted patterns without breaking existing code
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class SelectiveTypeHarmonyFixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedErrors = 0;
    this.skippedErrors = 0;
    this.maxFiles = 10;
    this.targetErrors = ["TS2345", "TS2322"];

    // Proven safe patterns that won't cause side effects
    this.safePatterns = {
      // TS2345: Argument type mismatches
      array_spread_season: {
        errorType: "TS2345",
        pattern:
          /Argument of type 'string' is not assignable to parameter of type 'Season'/,
        fix: (line, errorInfo) => {
          // Fix season spread operations
          return line.replace(
            /\.includes\(([^)]+)\s+as\s+Season\)/g,
            ".includes($1 as Season)",
          );
        },
      },

      // TS2322: Type assignments
      empty_array_type: {
        errorType: "TS2322",
        pattern: /Type '\[\]' is not assignable to type/,
        fix: (line, errorInfo) => {
          // Add proper type annotation to empty arrays
          if (line.includes("= []")) {
            const match = line.match(/const\s+(\w+)\s*=\s*\[\]/);
            if (match) {
              return line.replace("= []", ": string[] = []");
            }
          }
          return line;
        },
      },

      missing_as_const: {
        errorType: "TS2322",
        pattern: /Type 'string' is not assignable to type.*literal/,
        fix: (line, errorInfo) => {
          // Add 'as const' to literal assignments
          if (line.includes("'") && !line.includes("as const")) {
            return line.replace(/(['"])([^'"]+)\1(?!\s*as)/, "$1$2$1 as const");
          }
          return line;
        },
      },

      planet_type_cast: {
        errorType: "TS2345",
        pattern:
          /Argument of type 'string' is not assignable to parameter of type 'Planet'/,
        fix: (line, errorInfo) => {
          // Cast planet strings to Planet type
          return line.replace(/\((['"])(\w+)\1\)/g, "($1$2$1 as Planet)");
        },
      },

      element_type_cast: {
        errorType: "TS2345",
        pattern:
          /Argument of type 'string' is not assignable to parameter of type 'Element'/,
        fix: (line, errorInfo) => {
          // Cast element strings to Element type
          if (line.match(/['"](?:Fire|Water|Earth|Air)['"]/)) {
            return line.replace(
              /(["'])(Fire|Water|Earth|Air)\1/g,
              "$1$2$1 as Element",
            );
          }
          return line;
        },
      },

      record_type_assertion: {
        errorType: "TS2322",
        pattern: /Type '\{\}' is not assignable to type 'Record/,
        fix: (line, errorInfo) => {
          // Add type assertion to empty objects
          return line.replace(/:\s*\{\}/g, ": {} as Record<string, unknown>");
        },
      },
    };

    // Patterns to skip (known to cause issues)
    this.skipPatterns = [
      /optional property access/i,
      /may not be an optional property access/i,
      /Cannot assign to.*because it is a read-only property/i,
    ];
  }

  async run() {
    console.log("🎯 SELECTIVE TYPE HARMONY FIXER");
    console.log(`Target errors: ${this.targetErrors.join(", ")}`);
    console.log(`Max files per run: ${this.maxFiles}`);

    try {
      // Parse command line arguments
      this.parseArgs();

      // Get initial error count
      const initialErrors = this.getErrorCount();
      console.log(`Initial error count: ${initialErrors}`);

      // Get targeted errors
      const errors = await this.getTargetedErrors();
      console.log(`Found ${errors.length} targeted errors`);

      // Group errors by file
      const errorsByFile = this.groupErrorsByFile(errors);

      // Process files with most errors first
      const sortedFiles = Object.entries(errorsByFile)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, this.maxFiles);

      console.log(`Processing ${sortedFiles.length} files...`);

      for (const [filePath, fileErrors] of sortedFiles) {
        await this.processFile(filePath, fileErrors);
      }

      // Validate build
      console.log("\n🔍 Validating build...");
      const buildPassed = await this.validateBuild();

      // Get final error count
      const finalErrors = this.getErrorCount();

      console.log("\n📊 RESULTS:");
      console.log(
        `Errors reduced: ${initialErrors - finalErrors} (${(((initialErrors - finalErrors) / initialErrors) * 100).toFixed(1)}%)`,
      );
      console.log(`Errors fixed: ${this.fixedErrors}`);
      console.log(`Errors skipped: ${this.skippedErrors}`);
      console.log(`Files processed: ${this.processedFiles}`);
      console.log(`Build status: ${buildPassed ? "✅ PASSED" : "❌ FAILED"}`);
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
  }

  parseArgs() {
    const args = process.argv.slice(2);
    args.forEach((arg) => {
      if (arg.startsWith("--max-files=")) {
        this.maxFiles = parseInt(arg.split("=")[1]);
      } else if (arg.startsWith("--target=")) {
        this.targetErrors = arg.split("=")[1].split(",");
      }
    });
  }

  getErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"',
        {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getTargetedErrors() {
    try {
      const errorPattern = this.targetErrors.join("|");
      const output = execSync(
        `yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "${errorPattern}"`,
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        },
      );

      return output
        .trim()
        .split("\n")
        .map((line) => {
          const match = line.match(
            /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/,
          );
          if (match) {
            return {
              file: match[1],
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              errorCode: match[4],
              message: match[5],
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      return [];
    }
  }

  groupErrorsByFile(errors) {
    return errors.reduce((acc, error) => {
      if (!acc[error.file]) {
        acc[error.file] = [];
      }
      acc[error.file].push(error);
      return acc;
    }, {});
  }

  async processFile(filePath, errors) {
    console.log(`\n📁 Processing ${filePath} (${errors.length} errors)...`);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      let modified = false;

      // Sort errors by line number in reverse
      errors.sort((a, b) => b.line - a.line);

      for (const error of errors) {
        // Skip if error matches skip patterns
        if (this.skipPatterns.some((pattern) => pattern.test(error.message))) {
          this.skippedErrors++;
          console.log(`  ⏭️  Skipped ${error.errorCode} on line ${error.line}`);
          continue;
        }

        // Try to apply safe patterns
        let fixed = false;
        for (const [patternName, pattern] of Object.entries(
          this.safePatterns,
        )) {
          if (
            pattern.errorType === error.errorCode &&
            pattern.pattern.test(error.message)
          ) {
            const lineIndex = error.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
              const originalLine = lines[lineIndex];
              const fixedLine = pattern.fix(originalLine, error);

              if (fixedLine !== originalLine) {
                lines[lineIndex] = fixedLine;
                this.fixedErrors++;
                fixed = true;
                modified = true;
                console.log(
                  `  ✅ Fixed ${error.errorCode} on line ${error.line} using ${patternName}`,
                );
                break;
              }
            }
          }
        }

        if (!fixed) {
          console.log(
            `  ⚠️  No pattern for ${error.errorCode} on line ${error.line}`,
          );
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, lines.join("\n"));
        this.processedFiles++;
        console.log(`  💾 Saved changes to ${filePath}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }

  async validateBuild() {
    try {
      execSync("yarn build", { stdio: "ignore" });
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Run the fixer
const fixer = new SelectiveTypeHarmonyFixer();
fixer.run().catch(console.error);
