#!/usr/bin/env node

/**
 * FAST VERSION - Pattern 2: Template Literal Fixer
 * This version skips per-file verification for speed
 * Only runs full lint at the end for verification
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DRY_RUN = !process.argv.includes("--apply");
const LOG_FILE = path.join(
  __dirname,
  `../fix-log-quick-pattern-2-${Date.now()}.txt`,
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

function fixTemplateLiterals(content) {
  // Fix: $) { -> ${
  const pattern = /\$\)\s*\{/g;
  const matches = content.match(pattern);

  if (!matches) {
    return { modified: content, count: 0 };
  }

  const modified = content.replace(pattern, "${");
  return { modified, count: matches.length };
}

function getAllTsFiles() {
  try {
    const output = execSync(
      'find src -type f \\( -name "*.ts" -o -name "*.tsx" \\)',
      {
        encoding: "utf8",
        cwd: process.cwd(),
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
  log("===== QUICK FIX - PATTERN 2: TEMPLATE LITERALS =====");
  log(`Mode: ${DRY_RUN ? "DRY RUN" : "APPLY CHANGES"}`);

  // Get error count before
  log("Getting initial error count...");
  const errorsBefore = parseInt(
    execSync('yarn lint 2>&1 | grep "Parsing error" | wc -l', {
      encoding: "utf8",
      cwd: process.cwd(),
    }).trim(),
  );
  log(`Parsing errors before: ${errorsBefore}`);

  // Get all TypeScript files
  const files = getAllTsFiles();
  log(`Scanning ${files.length} TypeScript files...`);

  let totalFixed = 0;
  let filesModified = 0;
  const modifiedFiles = [];

  for (const file of files) {
    const filePath = path.join(process.cwd(), file);

    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf8");
    const { modified, count } = fixTemplateLiterals(content);

    if (count === 0) continue;

    log(`${file}: Found ${count} template literal errors`);
    totalFixed += count;
    filesModified++;
    modifiedFiles.push(file);

    if (!DRY_RUN) {
      const backup = createBackup(filePath);
      fs.writeFileSync(filePath, modified, "utf8");
      log(`  ✓ Fixed and backed up to ${backup}`);
    } else {
      log(`  [DRY RUN] Would fix ${count} instances`);
    }
  }

  log("\n===== SUMMARY =====");
  log(`Files with template literal errors: ${filesModified}`);
  log(`Total instances found: ${totalFixed}`);

  if (!DRY_RUN && filesModified > 0) {
    log("\nVerifying changes...");
    const errorsAfter = parseInt(
      execSync('yarn lint 2>&1 | grep "Parsing error" | wc -l', {
        encoding: "utf8",
        cwd: process.cwd(),
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
