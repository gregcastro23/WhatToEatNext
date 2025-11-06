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

function getTypeScriptErrors() {
  try {
    execSync("npx tsc --noEmit", { encoding: "utf8", stdio: "pipe" });
    return [];
  } catch (error) {
    const output = error.stdout || "";
    const lines = output.split("\n");
    const errors = [];

    for (const line of lines) {
      // Match Promise property access errors (more comprehensive)
      const match = line.match(
        /^(.+?)\((\d+),(\d+)\): error TS\d+: Property '(.+?)' does not exist on type 'Promise<(.+?)>'/,
      );
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          property: match[4],
          promiseType: match[5],
          fullLine: line,
        });
      }
    }

    return errors;
  }
}

function fixAdvancedPromiseErrors(dryRun = false) {
  log("\n🔍 Scanning for advanced Promise property access errors...", "cyan");

  const errors = getTypeScriptErrors();
  const promiseErrors = errors.filter((e) => e.promiseType);

  if (promiseErrors.length === 0) {
    log("✅ No Promise property access errors found!", "green");
    return { fixed: 0, total: 0 };
  }

  log(`Found ${promiseErrors.length} Promise property access errors`, "yellow");

  // Group errors by file
  const errorsByFile = {};
  for (const error of promiseErrors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }

  let totalFixed = 0;
  const complexPatterns = [];

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

    // Sort errors by line number in reverse to avoid offset issues
    fileErrors.sort((a, b) => b.line - a.line);

    for (const error of fileErrors) {
      const lineIndex = error.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        let fixed = false;

        // Pattern 1: Complex chained property access (e.g., result.data.property)
        const chainPattern = new RegExp(`([\\w.]+)\\.${error.property}\\b`);
        const chainMatch = line.match(chainPattern);

        if (chainMatch) {
          const expression = chainMatch[1];

          // Check if we're in a destructuring or complex assignment
          if (line.includes("const {") || line.includes("const [")) {
            // Wrap the entire expression with await and parentheses
            const destructurePattern = new RegExp(
              `(const\\s+(?:{[^}]+}|\\[[^\\]]+\\])\\s*=\\s*)${expression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
            );
            if (line.match(destructurePattern)) {
              lines[lineIndex] = line.replace(
                destructurePattern,
                `$1(await ${expression})`,
              );
              fixed = true;
            }
          }

          // Check if it's a comparison or conditional
          else if (
            line.includes("===") ||
            line.includes("!==") ||
            line.includes(">") ||
            line.includes("<")
          ) {
            // Add await with parentheses for comparisons
            const comparisonPattern = new RegExp(
              `\\b${expression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
            );
            if (!line.includes(`await ${expression}`)) {
              lines[lineIndex] = line.replace(
                comparisonPattern,
                `(await ${expression})`,
              );
              fixed = true;
            }
          }

          // Check if it's in an array or object literal
          else if (line.includes("[") || line.includes("{")) {
            const literalPattern = new RegExp(
              `([\\[{,]\\s*)${expression.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.${error.property}`,
            );
            const literalMatch = line.match(literalPattern);
            if (literalMatch) {
              lines[lineIndex] = line.replace(
                literalMatch[0],
                `${literalMatch[1]}(await ${expression}).${error.property}`,
              );
              fixed = true;
            }
          }
        }

        // Pattern 2: Method chaining with Promise result
        if (!fixed) {
          const methodChainPattern = new RegExp(
            `(\\w+\\([^)]*\\))(?:\\.\\w+\\([^)]*\\))*\\.${error.property}\\b`,
          );
          const methodMatch = line.match(methodChainPattern);

          if (methodMatch) {
            const methodChain = methodMatch[1];
            if (!line.includes(`await ${methodChain}`)) {
              // Find the start of the chain and add await
              const fullChain = methodMatch[0];
              const awaitedChain = fullChain.replace(
                methodChain,
                `(await ${methodChain})`,
              );
              lines[lineIndex] = line.replace(fullChain, awaitedChain);
              fixed = true;
            }
          }
        }

        // Pattern 3: Promise in template literals
        if (!fixed && line.includes("`")) {
          const templatePattern = new RegExp(
            `\\$\\{([^}]*\\.${error.property}[^}]*)\\}`,
          );
          const templateMatch = line.match(templatePattern);

          if (templateMatch) {
            const expression = templateMatch[1];
            // Extract the base expression that needs await
            const basePattern = new RegExp(
              `(\\w+(?:\\([^)]*\\))?)\\.${error.property}`,
            );
            const baseMatch = expression.match(basePattern);

            if (baseMatch) {
              const base = baseMatch[1];
              const awaited = expression.replace(base, `(await ${base})`);
              lines[lineIndex] = line.replace(
                `\${${expression}}`,
                `\${${awaited}}`,
              );
              fixed = true;
            }
          }
        }

        // Pattern 4: Dynamic import() expressions
        if (!fixed && error.property === "CampaignTestController") {
          const importPattern = /import\(['"]([^'"]+)['"]\)/;
          const importMatch = line.match(importPattern);

          if (importMatch) {
            const importExpr = importMatch[0];
            if (!line.includes(`await ${importExpr}`)) {
              lines[lineIndex] = line.replace(
                importExpr,
                `(await ${importExpr})`,
              );
              fixed = true;
            }
          }
        }

        if (fixed) {
          fixedInFile++;
          log(
            `  ✓ Line ${error.line}: Fixed advanced Promise access for ${error.property}`,
            "green",
          );
        } else {
          // Track complex patterns we couldn't fix
          complexPatterns.push({
            file: path.basename(filePath),
            line: error.line,
            property: error.property,
          });
          log(
            `  ⚠️  Line ${error.line}: Complex pattern - needs manual review`,
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

  if (complexPatterns.length > 0) {
    log("\n📋 Complex patterns requiring manual review:", "yellow");
    complexPatterns.forEach((p) => {
      log(`  • ${p.file}:${p.line} - ${p.property}`, "cyan");
    });
  }

  return { fixed: totalFixed, total: promiseErrors.length };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  log("🚀 Advanced Promise Error Fixer", "bright");
  log("=".repeat(50), "cyan");

  if (dryRun) {
    log("🔍 Running in DRY RUN mode - no files will be modified", "yellow");
  }

  log("\n📋 Advanced patterns to fix:", "cyan");
  log("  • Complex property chains with Promises", "blue");
  log("  • Destructuring assignments from Promises", "blue");
  log("  • Template literal expressions with Promises", "blue");
  log("  • Dynamic import() expressions", "blue");
  log("  • Method chaining with Promise results", "blue");

  try {
    // Create backup with git stash
    if (!dryRun) {
      log("\n📦 Creating git stash backup...", "cyan");
      try {
        execSync('git stash push -m "fix-promise-advanced-backup"', {
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

    const result = fixAdvancedPromiseErrors(dryRun);

    log("\n" + "=".repeat(50), "cyan");
    log("📊 Summary:", "bright");
    log(`  Total Promise errors found: ${result.total}`, "blue");
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
        log(
          "⚠️  Build still has errors - continuing with other fixes",
          "yellow",
        );
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

module.exports = { fixAdvancedPromiseErrors };
