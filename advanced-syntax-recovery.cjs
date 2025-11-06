#!/usr/bin/env node

/**
 * Advanced Syntax Recovery - Phase 2
 * Fixes remaining syntax patterns after emergency fixes
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get all TypeScript/TSX files
function getAllFiles() {
  try {
    const result = execSync(`find src/ -name "*.ts" -o -name "*.tsx"`, {
      encoding: "utf8",
      cwd: process.cwd(),
    });
    return result
      .trim()
      .split("\n")
      .filter((f) => f.length > 0);
  } catch (error) {
    return [];
  }
}

// Advanced syntax fixes
function fixAdvancedSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Fix object destructuring with semicolons inside
    content = content.replace(/:\s*{([^}]*);([^}]*)}/, ": {$1$2}");

    // Fix function parameters with trailing semicolons
    content = content.replace(/\(([^)]*);([^)]*)\)/g, "($1$2)");

    // Fix array elements with misplaced semicolons
    content = content.replace(/,\s*;/g, ",");

    // Fix test function declarations with malformed syntax
    content = content.replace(
      /test\s*\(\s*'([^']*)'[^{]*{\s*;/g,
      "test('$1', async () => {",
    );

    // Fix expect statements with malformed property access
    content = content.replace(
      /expect\s*\(\s*([^)]+)\s*\)\s*\.([^.;]+)\s*;([^.]*)\./g,
      "expect($1).$2.$3",
    );

    // Fix malformed property assignments in objects
    content = content.replace(/:\s*([^,}]+)\s*;([^,}]*)/g, ": $1$2");

    // Fix describe blocks with syntax issues
    content = content.replace(
      /describe\s*\(\s*'([^']*)'[^{]*{\s*;/g,
      "describe('$1', () => {",
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log("🔧 Advanced Syntax Recovery - Phase 2...");

const allFiles = getAllFiles();
console.log(`📁 Processing ${allFiles.length} TypeScript files`);

let fixedFiles = 0;
let errors = 0;

// Process files in batches to avoid overwhelming the system
const batchSize = 50;
for (let i = 0; i < allFiles.length; i += batchSize) {
  const batch = allFiles.slice(i, i + batchSize);

  for (const file of batch) {
    try {
      const fixed = fixAdvancedSyntax(file);
      if (fixed) {
        fixedFiles++;
        console.log(`✅ Advanced fixes applied: ${file}`);
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  // Progress indicator
  if (i % (batchSize * 10) === 0) {
    console.log(
      `📊 Progress: ${Math.min(i + batchSize, allFiles.length)}/${allFiles.length} files processed`,
    );
  }
}

console.log(`\n📊 Advanced Recovery Results:`);
console.log(`   Files processed: ${allFiles.length}`);
console.log(`   Files with advanced fixes: ${fixedFiles}`);
console.log(`   Errors encountered: ${errors}`);

console.log("\n🎉 Advanced syntax recovery complete!");
