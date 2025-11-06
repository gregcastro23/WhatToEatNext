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
      // Match Promise property access errors
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

function fixPromiseAwaitErrors(dryRun = false) {
  log("\n🔍 Scanning for Promise property access errors...", "cyan");

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

        // Find the variable/expression that needs await
        // Look for patterns like: variable.property or functionCall().property
        let fixed = false;

        // Pattern 1: Direct variable access (e.g., positions.Sun)
        const varPattern = new RegExp(`(\\b\\w+)\\.${error.property}\\b`);
        const varMatch = line.match(varPattern);

        if (varMatch) {
          const varName = varMatch[1];

          // Check if it's in a conditional or assignment
          if (
            line.includes(`if (`) ||
            line.includes(`if(`) ||
            line.includes(`expect(`) ||
            line.includes(`= `)
          ) {
            // Need to add await to the variable
            const awaitPattern = new RegExp(`\\b${varName}\\b(?!\\.)`);
            if (!line.includes(`await ${varName}`)) {
              // Add await before the variable
              lines[lineIndex] = line.replace(
                awaitPattern,
                `(await ${varName})`,
              );
              fixed = true;
            }
          }
        }

        // Pattern 2: Function call result (e.g., getPositions().Sun)
        const funcPattern = new RegExp(
          `(\\w+\\([^)]*\\))\\.${error.property}\\b`,
        );
        const funcMatch = line.match(funcPattern);

        if (funcMatch && !fixed) {
          const funcCall = funcMatch[1];
          if (!line.includes(`await ${funcCall}`)) {
            lines[lineIndex] = line.replace(funcCall, `(await ${funcCall})`);
            fixed = true;
          }
        }

        // Pattern 3: Import statement (e.g., import(...).CampaignTestController)
        const importPattern = new RegExp(
          `(import\\([^)]+\\))\\.${error.property}\\b`,
        );
        const importMatch = line.match(importPattern);

        if (importMatch && !fixed) {
          const importCall = importMatch[1];
          if (!line.includes(`await ${importCall}`)) {
            lines[lineIndex] = line.replace(
              importCall,
              `(await ${importCall})`,
            );
            fixed = true;
          }
        }

        if (fixed) {
          fixedInFile++;
          log(
            `  ✓ Line ${error.line}: Added await for ${error.property} access`,
            "green",
          );
        } else {
          log(
            `  ⚠️  Line ${error.line}: Could not auto-fix - manual review needed`,
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

  return { fixed: totalFixed, total: promiseErrors.length };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  log("🚀 Promise Await Error Fixer", "bright");
  log("=".repeat(50), "cyan");

  if (dryRun) {
    log("🔍 Running in DRY RUN mode - no files will be modified", "yellow");
  }

  try {
    // Create backup with git stash
    if (!dryRun) {
      log("\n📦 Creating git stash backup...", "cyan");
      try {
        execSync('git stash push -m "fix-promise-await-backup"', {
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

    const result = fixPromiseAwaitErrors(dryRun);

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
          "⚠️  Build still has errors - some may require manual fixes",
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

module.exports = { fixPromiseAwaitErrors };
