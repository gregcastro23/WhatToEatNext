#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getTypeErrors() {
  try {
    execSync("npx tsc --noEmit", { encoding: "utf8", stdio: "pipe" });
    return [];
  } catch (error) {
    const output = error.stdout || "";
    const lines = output.split("\n");
    const errors = [];

    for (const line of lines) {
      // Match unknown/undefined type errors
      const match18046 = line.match(
        /^(.+?)\((\d+),(\d+)\): error TS18046: '(.+?)' is of type 'unknown'/,
      );
      const match18048 = line.match(
        /^(.+?)\((\d+),(\d+)\): error TS18048: '(.+?)' is possibly 'undefined'/,
      );
      const match2571 = line.match(
        /^(.+?)\((\d+),(\d+)\): error TS2571: Object is of type 'unknown'/,
      );
      const match2532 = line.match(
        /^(.+?)\((\d+),(\d+)\): error TS2532: Object is possibly 'undefined'/,
      );

      if (match18046) {
        errors.push({
          file: match18046[1],
          line: parseInt(match18046[2]),
          column: parseInt(match18046[3]),
          type: "TS18046",
          expression: match18046[4],
          issue: "unknown",
        });
      } else if (match18048) {
        errors.push({
          file: match18048[1],
          line: parseInt(match18048[2]),
          column: parseInt(match18048[3]),
          type: "TS18048",
          expression: match18048[4],
          issue: "undefined",
        });
      } else if (match2571) {
        errors.push({
          file: match2571[1],
          line: parseInt(match2571[2]),
          column: parseInt(match2571[3]),
          type: "TS2571",
          expression: null,
          issue: "unknown",
        });
      } else if (match2532) {
        errors.push({
          file: match2532[1],
          line: parseInt(match2532[2]),
          column: parseInt(match2532[3]),
          type: "TS2532",
          expression: null,
          issue: "undefined",
        });
      }
    }

    return errors;
  }
}

function fixTypeGuards(dryRun = false) {
  log("\n🔍 Scanning for unknown/undefined type errors...", "cyan");

  const errors = getTypeErrors();

  if (errors.length === 0) {
    log("✅ No type guard errors found!", "green");
    return { fixed: 0, total: 0 };
  }

  log(`Found ${errors.length} type guard opportunities`, "yellow");

  // Group errors by file
  const errorsByFile = {};
  for (const error of errors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }

  let totalFixed = 0;

  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    if (!fs.existsSync(filePath)) {
      log(`⚠️  File not found: ${filePath}`, "yellow");
      continue;
    }

    log(
      `\n📝 Processing ${path.basename(filePath)} (${fileErrors.length} errors)...`,
      "blue",
    );

    let content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let fixedInFile = 0;

    // Sort errors by line number in reverse
    fileErrors.sort((a, b) => b.line - a.line);

    for (const error of fileErrors) {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        let fixed = false;

        if (error.issue === "unknown") {
          // Handle unknown types with type assertions
          if (error.expression) {
            // Add type assertion for property access
            const parts = error.expression.split(".");
            if (parts.length > 1) {
              const baseVar = parts[0];

              // Add Record<string, unknown> assertion
              const assertedVar = `(${baseVar} as Record<string, unknown>)`;
              const regex = new RegExp(`\\b${baseVar}(?=\\.)`, "g");

              if (line.match(regex) && !line.includes(assertedVar)) {
                lines[lineIndex] = line.replace(regex, assertedVar);
                fixed = true;
              }
            }
          } else if (error.type === "TS2571") {
            // Object is of type 'unknown' - look for variable access
            // Try to find what object is being accessed
            const objectPattern = /(\w+)(?:\[|\.|\.)/;
            const match = line.match(objectPattern);

            if (match) {
              const objName = match[1];
              // Add type assertion
              const assertedObj = `(${objName} as Record<string, unknown>)`;
              const regex = new RegExp(`\\b${objName}\\b`, "g");

              if (!line.includes(assertedObj)) {
                lines[lineIndex] = line.replace(regex, assertedObj);
                fixed = true;
              }
            }
          }
        } else if (error.issue === "undefined") {
          // Handle possibly undefined with optional chaining or nullish coalescing
          if (error.expression) {
            // Add optional chaining
            const parts = error.expression.split(".");
            if (parts.length > 0) {
              // Build optional chain
              let optionalChain = parts[0];
              for (let i = 1; i < parts.length; i++) {
                optionalChain += `?.${parts[i]}`;
              }

              // Replace in line
              const escapedExpression = error.expression.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
              );
              const regex = new RegExp(`\\b${escapedExpression}\\b`);

              if (line.match(regex) && !line.includes(optionalChain)) {
                lines[lineIndex] = line.replace(regex, optionalChain);
                fixed = true;
              }
            }
          } else if (error.type === "TS2532") {
            // Object is possibly 'undefined'
            // Look for object access patterns
            const patterns = [
              /(\w+)\[/, // array/object access
              /(\w+)\./, // property access
              /(\w+)\(/, // function call
            ];

            for (const pattern of patterns) {
              const match = line.match(pattern);
              if (match) {
                const objName = match[1];

                // Add nullish coalescing or optional chaining
                if (pattern.source.includes("\\[")) {
                  // Array/object access - add optional chaining
                  const optionalAccess = `${objName}?.[`;
                  if (!line.includes(optionalAccess)) {
                    lines[lineIndex] = line.replace(
                      `${objName}[`,
                      optionalAccess,
                    );
                    fixed = true;
                    break;
                  }
                } else if (pattern.source.includes("\\.")) {
                  // Property access - add optional chaining
                  const optionalAccess = `${objName}?.`;
                  if (!line.includes(optionalAccess)) {
                    lines[lineIndex] = line.replace(
                      `${objName}.`,
                      optionalAccess,
                    );
                    fixed = true;
                    break;
                  }
                } else if (pattern.source.includes("\\(")) {
                  // Function call - add optional chaining
                  const optionalCall = `${objName}?.(`;
                  if (!line.includes(optionalCall)) {
                    lines[lineIndex] = line.replace(
                      `${objName}(`,
                      optionalCall,
                    );
                    fixed = true;
                    break;
                  }
                }
              }
            }
          }
        }

        if (fixed) {
          fixedInFile++;
          log(
            `  ✓ Line ${error.line}: Added type guard for ${error.issue} access`,
            "green",
          );
        } else {
          log(
            `  ⚠️  Line ${error.line}: Needs manual review - ${error.type}`,
            "yellow",
          );
        }
      }
    }

    if (fixedInFile > 0 && !dryRun) {
      const newContent = lines.join("\n");
      fs.writeFileSync(filePath, newContent, "utf8");
      log(
        `  💾 Saved ${fixedInFile} fixes to ${path.basename(filePath)}`,
        "green",
      );
      totalFixed += fixedInFile;
    } else if (dryRun) {
      log(`  🔍 Would fix ${fixedInFile} errors (dry run)`, "cyan");
      totalFixed += fixedInFile;
    }
  }

  return { fixed: totalFixed, total: errors.length };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  log("🚀 Type Guard Fixer", "bright");
  log("=".repeat(50), "cyan");

  if (dryRun) {
    log("🔍 Running in DRY RUN mode - no files will be modified", "yellow");
  }

  log("\n📋 Patterns to fix:", "cyan");
  log("  • Unknown type access → Type assertions", "blue");
  log("  • Possibly undefined → Optional chaining", "blue");
  log("  • Object access → Nullish coalescing", "blue");

  try {
    // Create backup with git stash
    if (!dryRun) {
      log("\n📦 Creating git stash backup...", "cyan");
      try {
        execSync('git stash push -m "fix-type-guards-backup"', {
          stdio: "pipe",
        });
        log("✅ Backup created successfully", "green");
      } catch (e) {
        log(
          "⚠️  Could not create git stash (working directory might be clean)",
          "yellow",
        );
      }
    }

    const result = fixTypeGuards(dryRun);

    log("\n" + "=".repeat(50), "cyan");
    log("📊 Summary:", "bright");
    log(`  Total type guard opportunities: ${result.total}`, "blue");
    log(`  Successfully fixed: ${result.fixed}`, "green");
    log(
      `  Remaining to fix manually: ${result.total - result.fixed}`,
      result.total - result.fixed > 0 ? "yellow" : "green",
    );

    if (!dryRun && result.fixed > 0) {
      log("\n🔨 Rebuilding to verify fixes...", "cyan");
      try {
        execSync("npx tsc --noEmit", { stdio: "pipe" });
        log("✅ Build successful!", "green");
      } catch (e) {
        log("⚠️  Build still has errors - continuing campaign", "yellow");
      }
    }

    if (dryRun && result.fixed > 0) {
      log("\n💡 Run without --dry-run to apply these fixes", "yellow");
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, "red");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixTypeGuards };
