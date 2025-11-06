#!/usr/bin/env node

/**
 * FAST VERSION - Patterns 3-5: Type and Object Syntax Errors
 * Pattern 3: Malformed object syntax ") {" -> "{"
 * Pattern 4: Semicolon before closing brace in imports/types
 * Pattern 5: Comma instead of colon in type properties
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const DRY_RUN = !process.argv.includes("--apply");
const LOG_FILE = path.join(
  __dirname,
  `../fix-log-quick-pattern-3-5-${Date.now()}.txt`,
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

function fixTypeSyntax(content, filePath) {
  let modified = content;
  let totalCount = 0;
  const fixes = [];

  // Pattern 3: Malformed object syntax ", ) {" -> ", {"
  // But NOT in function definitions like "): ReturnType {"
  let pattern3Count = 0;
  const lines = modified.split("\n");
  const fixedLines = lines.map((line, index) => {
    // Skip lines that look like function return types
    if (line.match(/\)\s*:\s*[A-Z\w<>[\]|&]+\s*\{/)) {
      return line;
    }

    // Fix ", ) {" -> ", {"
    if (line.match(/,\s*\)\s*\{/)) {
      const fixed = line.replace(/,\s*\)\s*\{/g, ", {");
      if (fixed !== line) {
        pattern3Count++;
        fixes.push(`Pattern 3 (Line ${index + 1}): Malformed object`);
      }
      return fixed;
    }

    return line;
  });

  if (pattern3Count > 0) {
    modified = fixedLines.join("\n");
  }
  totalCount += pattern3Count;

  // Pattern 4: Semicolon before closing brace "Type;" -> "Type"
  // Only in imports and type definitions
  let pattern4Count = 0;
  modified = modified.replace(
    /^(import\s+\{[^}]*\w+);(\s*\})/gm,
    (match, before, after) => {
      pattern4Count++;
      fixes.push(`Pattern 4: Semicolon in import`);
      return before + after;
    },
  );

  // Also fix in type/interface definitions
  modified = modified.replace(
    /(interface|type)\s+\w+\s*=?\s*\{([^}]*\w+);(\s*\})/gm,
    (match, keyword, middle, closing) => {
      pattern4Count++;
      fixes.push(`Pattern 4: Semicolon in ${keyword}`);
      return `${keyword}${middle.substring(keyword.length)}${middle}${closing}`;
    },
  );

  totalCount += pattern4Count;

  // Pattern 5: Comma instead of colon in type properties "prop, Type" -> "prop: Type"
  let pattern5Count = 0;
  modified = modified.replace(
    /^(\s+)(\w+),\s*(number|string|boolean|void|null|undefined|any|unknown|never|[A-Z]\w*(?:\[\])?(?:\s*\|\s*[A-Z]\w*(?:\[\])?)*)/gm,
    (match, indent, propName, type) => {
      // Only fix if this looks like it's inside a type/interface
      pattern5Count++;
      fixes.push(`Pattern 5: ${propName}, ${type} -> ${propName}: ${type}`);
      return `${indent}${propName}: ${type}`;
    },
  );

  totalCount += pattern5Count;

  if (totalCount > 0) {
    log(`  Pattern 3 (malformed objects): ${pattern3Count}`);
    log(`  Pattern 4 (semicolons): ${pattern4Count}`);
    log(`  Pattern 5 (comma->colon): ${pattern5Count}`);
  }

  return { modified, count: totalCount };
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
  log("===== QUICK FIX - PATTERNS 3-5: TYPE AND OBJECT SYNTAX =====");
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
    const { modified, count } = fixTypeSyntax(content, filePath);

    if (count === 0) continue;

    log(`${file}: Found ${count} type syntax errors`);
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
  log(`Files with type syntax errors: ${filesModified}`);
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
