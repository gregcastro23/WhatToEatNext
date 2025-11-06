#!/usr/bin/env node

/**
 * Fix Misused Promises Script
 *
 * This script addresses @typescript-eslint/no-misused-promises violations
 * by fixing Promise-returning functions in boolean contexts and event handlers.
 *
 * Current Issues: 63 no-misused-promises violations
 * Target: Fix Promise usage in conditionals and event handlers
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  maxFiles: 20,
  dryRun: false,
  preservePatterns: [
    // Preserve astronomical calculations
    /planetary|astronomical|astrological|ephemeris/i,
    // Preserve campaign system patterns
    /campaign|metrics|progress|safety/i,
  ],
};

class MisusedPromisesFixer {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.errors = [];
  }

  /**
   * Get files with misused promises issues
   */
  getFilesWithMisusedPromises() {
    const files = [];
    const directories = ["src", "__tests__"];

    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, files);
      }
    }

    return files.slice(0, CONFIG.maxFiles);
  }

  /**
   * Recursively scan directory for TypeScript files
   */
  scanDirectory(dir, files) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        this.scanDirectory(fullPath, files);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  /**
   * Check if file should be preserved from modifications
   */
  shouldPreserveFile(filePath, content) {
    for (const pattern of CONFIG.preservePatterns) {
      if (pattern.test(filePath) || pattern.test(content)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Fix misused promises in content
   */
  fixMisusedPromises(content, filePath) {
    let fixes = 0;
    let modifiedContent = content;
    const lines = modifiedContent.split("\n");
    const fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;

      // Fix 1: Promise-returning function in onClick/onSubmit handlers
      // Pattern: onClick={asyncFunction} -> onClick={() => void asyncFunction()}
      const eventHandlerPattern = /(on\w+)=\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;
      line = line.replace(
        eventHandlerPattern,
        (match, eventName, functionName) => {
          // Only fix if it looks like an async function
          if (
            functionName.includes("async") ||
            functionName.includes("handle") ||
            functionName.includes("submit")
          ) {
            fixes++;
            return `${eventName}={() => void ${functionName}()}`;
          }
          return match;
        },
      );

      // Fix 2: Promise in boolean conditional
      // Pattern: if (promiseFunction()) -> if (await promiseFunction())
      const conditionalPattern =
        /if\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))\s*\)/g;
      line = line.replace(conditionalPattern, (match, functionCall) => {
        // Only fix if it looks like it returns a Promise
        if (
          functionCall.includes("async") ||
          functionCall.includes("fetch") ||
          functionCall.includes("Promise")
        ) {
          fixes++;
          return `if (await ${functionCall})`;
        }
        return match;
      });

      // Fix 3: Promise in ternary conditional
      // Pattern: condition ? promiseFunction() : value -> condition ? await promiseFunction() : value
      const ternaryPattern =
        /(\w+)\s*\?\s*([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))\s*:/g;
      line = line.replace(ternaryPattern, (match, condition, functionCall) => {
        // Only fix if it looks like it returns a Promise
        if (
          functionCall.includes("async") ||
          functionCall.includes("fetch") ||
          functionCall.includes("Promise")
        ) {
          fixes++;
          return `${condition} ? await ${functionCall} :`;
        }
        return match;
      });

      // Fix 4: Promise in logical AND/OR
      // Pattern: value && promiseFunction() -> value && await promiseFunction()
      const logicalPattern =
        /(\w+)\s*(&&|\|\|)\s*([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))/g;
      line = line.replace(
        logicalPattern,
        (match, leftSide, operator, functionCall) => {
          // Only fix if it looks like it returns a Promise
          if (
            functionCall.includes("async") ||
            functionCall.includes("fetch") ||
            functionCall.includes("Promise")
          ) {
            fixes++;
            return `${leftSide} ${operator} await ${functionCall}`;
          }
          return match;
        },
      );

      if (line !== originalLine) {
        console.log(
          `    Fixed line ${i + 1}: ${originalLine.trim()} -> ${line.trim()}`,
        );
      }

      fixedLines.push(line);
    }

    return { content: fixedLines.join("\n"), fixes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      console.log(`\n📁 Processing: ${filePath}`);

      const content = fs.readFileSync(filePath, "utf8");

      // Check if file should be preserved
      if (this.shouldPreserveFile(filePath, content)) {
        console.log(`  ⚠️ Preserving file due to domain-specific patterns`);
        return;
      }

      // Apply fixes
      const { content: modifiedContent, fixes } = this.fixMisusedPromises(
        content,
        filePath,
      );

      if (fixes > 0) {
        if (!CONFIG.dryRun) {
          fs.writeFileSync(filePath, modifiedContent, "utf8");
        }

        console.log(`  ✅ Applied ${fixes} misused promise fixes`);
        this.totalFixes += fixes;
      } else {
        console.log(`  ℹ️ No misused promise issues found to fix`);
      }

      this.processedFiles++;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  /**
   * Run the misused promises fixing process
   */
  async run() {
    console.log("🚀 Starting Misused Promises Fixing Process");
    console.log(
      `📊 Configuration: maxFiles=${CONFIG.maxFiles}, dryRun=${CONFIG.dryRun}`,
    );

    const files = this.getFilesWithMisusedPromises();

    if (files.length === 0) {
      console.log("✅ No files found to process");
      return;
    }

    console.log(`\n📋 Processing ${files.length} files...`);

    for (const file of files) {
      this.processFile(file);
    }

    // Summary
    console.log("\n📊 Misused Promises Fixing Summary:");
    console.log(`   Files processed: ${this.processedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);
    console.log(`   Errors encountered: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }

    if (this.totalFixes > 0) {
      console.log("\n✅ Misused promise fixes completed successfully!");
      console.log("💡 Run yarn lint to verify the improvements");
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new MisusedPromisesFixer();
  fixer.run().catch(console.error);
}

module.exports = MisusedPromisesFixer;
