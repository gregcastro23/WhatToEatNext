#!/usr/bin/env node

/**
 * Non-Test Explicit Any Fixer
 * Focuses only on production code files, excluding test files
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function getExplicitAnyFiles() {
  try {
    const lintOutput = execSync("yarn lint 2>&1", { encoding: "utf8" });
    const lines = lintOutput.split("\n");

    const filesWithAny = new Set();
    let currentFile = null;

    for (const line of lines) {
      // Check if this is a file path line
      if (line.match(/^\/.*\.(ts|tsx)$/)) {
        currentFile = line.trim();
        // Skip test files
        if (
          currentFile.includes("__tests__") ||
          currentFile.includes(".test.") ||
          currentFile.includes(".spec.")
        ) {
          currentFile = null;
        }
      } else if (
        currentFile &&
        line.includes("@typescript-eslint/no-explicit-any")
      ) {
        filesWithAny.add(currentFile);
      }
    }

    return Array.from(filesWithAny);
  } catch (error) {
    log(`Error getting lint output: ${error.message}`);
    return [];
  }
}

function fixArrayTypes(content) {
  let fixes = 0;

  // Replace any[] with unknown[]
  const arrayTypeRegex = /\bany\[\]/g;
  const newContent = content.replace(arrayTypeRegex, (match) => {
    fixes++;
    return "unknown[]";
  });

  return { content: newContent, fixes };
}

function fixRecordTypes(content) {
  let fixes = 0;

  // Replace Record<string, any> with Record<string, unknown>
  const recordTypeRegex = /Record<([^,]+),\s*any>/g;
  const newContent = content.replace(recordTypeRegex, (match, keyType) => {
    fixes++;
    return `Record<${keyType}, unknown>`;
  });

  return { content: newContent, fixes };
}

function fixSimpleVariableTypes(content) {
  let fixes = 0;

  // Replace simple variable declarations: const x: any =
  const varTypeRegex = /(\b(?:const|let|var)\s+\w+\s*:\s*)any(\s*=)/g;
  const newContent = content.replace(varTypeRegex, (match, prefix, suffix) => {
    fixes++;
    return `${prefix}unknown${suffix}`;
  });

  return { content: newContent, fixes };
}

function validateTypeScript() {
  try {
    execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
}

function processFile(filePath) {
  log(`Processing ${path.basename(filePath)}`);

  try {
    const originalContent = fs.readFileSync(filePath, "utf8");
    let content = originalContent;
    let totalFixes = 0;

    // Apply different fix strategies
    const arrayResult = fixArrayTypes(content);
    content = arrayResult.content;
    totalFixes += arrayResult.fixes;

    const recordResult = fixRecordTypes(content);
    content = recordResult.content;
    totalFixes += recordResult.fixes;

    const varResult = fixSimpleVariableTypes(content);
    content = varResult.content;
    totalFixes += varResult.fixes;

    if (totalFixes > 0) {
      // Create backup
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, originalContent);

      // Apply changes
      fs.writeFileSync(filePath, content);

      // Validate TypeScript compilation
      if (validateTypeScript()) {
        log(`✅ Applied ${totalFixes} fixes to ${path.basename(filePath)}`);
        // Remove backup on success
        fs.unlinkSync(backupPath);
        return totalFixes;
      } else {
        log(
          `❌ TypeScript compilation failed - restoring ${path.basename(filePath)}`,
        );
        // Restore from backup
        fs.writeFileSync(filePath, originalContent);
        fs.unlinkSync(backupPath);
        return 0;
      }
    } else {
      log(`ℹ️ No fixable patterns found in ${path.basename(filePath)}`);
      return 0;
    }
  } catch (error) {
    log(`❌ Error processing ${filePath}: ${error.message}`);
    return 0;
  }
}

function main() {
  log("🚀 Starting Non-Test Explicit Any Elimination");

  const filesWithAny = getExplicitAnyFiles();
  log(`📊 Found ${filesWithAny.length} non-test files with explicit any`);

  if (filesWithAny.length === 0) {
    log("✅ No non-test files with explicit any found!");
    return;
  }

  let totalFixes = 0;
  let successfulFiles = 0;

  // Process files one by one for safety
  for (const filePath of filesWithAny.slice(0, 10)) {
    // Limit to 10 files for safety
    const fixes = processFile(filePath);
    if (fixes > 0) {
      totalFixes += fixes;
      successfulFiles++;
    }
  }

  log(`\n📊 Campaign Summary:`);
  log(`   Total files processed: ${Math.min(filesWithAny.length, 10)}`);
  log(`   Successful files: ${successfulFiles}`);
  log(`   Total fixes applied: ${totalFixes}`);

  // Check final status
  const remainingFiles = getExplicitAnyFiles();
  log(
    `📊 Remaining non-test files with explicit any: ${remainingFiles.length}`,
  );

  if (totalFixes > 0) {
    log("🎉 Successfully applied fixes to non-test files!");
  }
}

if (require.main === module) {
  main();
}
