#!/usr/bin/env node

/**
 * FAST VERSION - Pattern 1: Missing Opening Parenthesis in Functions
 * Fixes: function name() followed by params on next line
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DRY_RUN = !process.argv.includes("--apply");
const LOG_FILE = path.join(
  __dirname,
  `../fix-log-quick-pattern-1-${Date.now()}.txt`,
);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + "\n");
}

function createBackup(filePath) {
  const timestamp = Date.now();
  const backupPath = `${filePath}.backup-${timestamp}`;
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

function fixFunctionParens(content, filePath) {
  const lines = content.split("\n");
  const fixedLines = [];
  let fixCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : "";

    // Pattern: export function name() or export const name = ()
    // followed by next line with parameter (indented word with colon)
    const functionMatch = line.match(
      /^(\s*)(export\s+)?(function|const)\s+(\w+)\s*=?\s*\(\)\s*$/,
    );
    const nextLineMatch = nextLine.match(/^\s+\w+\s*:/);

    if (functionMatch && nextLineMatch) {
      const fixed = line.replace(/\(\)\s*$/, "(");
      fixedLines.push(fixed);
      fixCount++;
      log(`  Line ${i + 1}: ${functionMatch[4]} - removed closing paren`);
    } else {
      fixedLines.push(line);
    }
  }

  return {
    modified: fixCount > 0 ? fixedLines.join("\n") : content,
    count: fixCount,
  };
}

function getAllTsFiles() {
  try {
    const output = execSync(
      'find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)',
      {
        encoding: "utf8",
        cwd: "/Users/GregCastro/Desktop/WhatToEatNext",
      },
    );
    return output
      .trim()
      .split("\n")
      .filter((f) => f);
  } catch (e) {
    return [];
  }
}

function main() {
  log("===== QUICK FIX - PATTERN 1: MISSING OPENING PAREN IN FUNCTIONS =====");
  log(`Mode: ${DRY_RUN ? "DRY RUN" : "APPLY CHANGES"}`);

  const errorsBefore = parseInt(
    execSync('yarn lint 2>&1 | grep "Parsing error" | wc -l', {
      encoding: "utf8",
      cwd: "/Users/GregCastro/Desktop/WhatToEatNext",
    }).trim(),
  );
  log(`Parsing errors before: ${errorsBefore}`);

  const files = getAllTsFiles();
  log(`Scanning ${files.length} TypeScript files...`);

  let totalFixed = 0;
  let filesModified = 0;

  for (const file of files) {
    const filePath = path.join("/Users/GregCastro/Desktop/WhatToEatNext", file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf8");
    const { modified, count } = fixFunctionParens(content, filePath);

    if (count === 0) continue;

    log(`${file}: Found ${count} missing opening parens`);
    totalFixed += count;
    filesModified++;

    if (!DRY_RUN) {
      const backup = createBackup(filePath);
      fs.writeFileSync(filePath, modified, "utf8");
      log(`  ✓ Fixed and backed up to ${backup}`);
    } else {
      log(`  [DRY RUN] Would fix ${count} instances`);
    }
  }

  log("\n===== SUMMARY =====");
  log(`Files with missing opening parens: ${filesModified}`);
  log(`Total instances found: ${totalFixed}`);

  if (!DRY_RUN && filesModified > 0) {
    log("\nVerifying changes...");
    const errorsAfter = parseInt(
      execSync('yarn lint 2>&1 | grep "Parsing error" | wc -l', {
        encoding: "utf8",
        cwd: "/Users/GregCastro/Desktop/WhatToEatNext",
      }).trim(),
    );
    log(`Parsing errors after: ${errorsAfter}`);
    log(
      `Error reduction: ${errorsBefore} → ${errorsAfter} (${errorsBefore - errorsAfter} fixed)`,
    );

    if (errorsAfter > errorsBefore) {
      log("⚠️  WARNING: Errors increased! Review the changes carefully.");
    } else {
      log("✅ Success! Errors decreased or stayed the same.");
    }
  }

  log(`\nMode: ${DRY_RUN ? "DRY RUN (no changes made)" : "CHANGES APPLIED"}`);
  log(`Log file: ${LOG_FILE}`);

  if (DRY_RUN) {
    log("\n💡 To apply changes, run with --apply flag");
  }
}

main();
