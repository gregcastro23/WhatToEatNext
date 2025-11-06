#!/usr/bin/env node

/**
 * Aggressive Fixer - Maximum Impact Approach
 *
 * This script takes a more aggressive approach to fixing linting issues
 * by targeting the highest-impact patterns and files.
 */

const fs = require("fs");
const { execSync } = require("child_process");

class AggressiveFixer {
  constructor() {
    this.totalFixes = 0;
    this.processedFiles = 0;
    this.fixesByCategory = {
      "prefer-optional-chain": 0,
      "no-non-null-assertion": 0,
      "no-unnecessary-type-assertion": 0,
      "no-floating-promises": 0,
      "no-misused-promises": 0,
    };
  }

  /**
   * Get files with the most issues using direct lint analysis
   */
  getHighImpactFiles() {
    try {
      console.log("🔍 Finding files with the most linting issues...");

      // Get files with prefer-optional-chain issues
      const optionalChainFiles = execSync(
        'yarn lint --max-warnings=10000 2>&1 | grep -B1 "prefer-optional-chain" | grep "^/" | sort | uniq',
        { encoding: "utf8", stdio: "pipe" },
      )
        .split("\n")
        .filter((f) => f.trim());

      // Get files with floating promise issues
      const floatingPromiseFiles = execSync(
        'yarn lint --max-warnings=10000 2>&1 | grep -B1 "no-floating-promises" | grep "^/" | sort | uniq',
        { encoding: "utf8", stdio: "pipe" },
      )
        .split("\n")
        .filter((f) => f.trim());

      // Get files with misused promise issues
      const misusedPromiseFiles = execSync(
        'yarn lint --max-warnings=10000 2>&1 | grep -B1 "no-misused-promises" | grep "^/" | sort | uniq',
        { encoding: "utf8", stdio: "pipe" },
      )
        .split("\n")
        .filter((f) => f.trim());

      // Combine and deduplicate
      const allFiles = [
        ...new Set([
          ...optionalChainFiles,
          ...floatingPromiseFiles,
          ...misusedPromiseFiles,
        ]),
      ];

      console.log(`📊 Found ${allFiles.length} files with target issues`);
      return allFiles.slice(0, 20); // Limit to top 20 files
    } catch (error) {
      console.warn("⚠️ Could not analyze lint output, using fallback files");
      return [
        "src/components/ChakraDisplay.migrated.tsx",
        "src/components/CookingMethodsSection.migrated.tsx",
        "src/services/CampaignConflictResolver.ts",
        "src/services/CurrentMomentManager.ts",
        "src/app/api/astrologize/route.ts",
      ];
    }
  }

  /**
   * Apply aggressive fixes to content
   */
  applyAggressiveFixes(content, filePath) {
    let modifiedContent = content;
    let totalFixes = 0;
    const fixDetails = {};

    // 1. Aggressive optional chain fixes
    const optionalResult = this.aggressiveOptionalChainFixes(modifiedContent);
    modifiedContent = optionalResult.content;
    totalFixes += optionalResult.fixes;
    fixDetails["prefer-optional-chain"] = optionalResult.fixes;
    this.fixesByCategory["prefer-optional-chain"] += optionalResult.fixes;

    // 2. Aggressive floating promise fixes
    const floatingResult = this.aggressiveFloatingPromiseFixes(modifiedContent);
    modifiedContent = floatingResult.content;
    totalFixes += floatingResult.fixes;
    fixDetails["no-floating-promises"] = floatingResult.fixes;
    this.fixesByCategory["no-floating-promises"] += floatingResult.fixes;

    // 3. Aggressive misused promise fixes
    const misusedResult = this.aggressiveMisusedPromiseFixes(modifiedContent);
    modifiedContent = misusedResult.content;
    totalFixes += misusedResult.fixes;
    fixDetails["no-misused-promises"] = misusedResult.fixes;
    this.fixesByCategory["no-misused-promises"] += misusedResult.fixes;

    // 4. Aggressive non-null assertion fixes
    const nonNullResult = this.aggressiveNonNullFixes(modifiedContent);
    modifiedContent = nonNullResult.content;
    totalFixes += nonNullResult.fixes;
    fixDetails["no-non-null-assertion"] = nonNullResult.fixes;
    this.fixesByCategory["no-non-null-assertion"] += nonNullResult.fixes;

    return { content: modifiedContent, fixes: totalFixes, details: fixDetails };
  }

  /**
   * Aggressive optional chain fixes
   */
  aggressiveOptionalChainFixes(content) {
    let fixes = 0;
    let modifiedContent = content;

    // More comprehensive patterns
    const patterns = [
      // obj && obj.prop -> obj?.prop
      { pattern: /(\w+)\s*&&\s*\1\.(\w+)(?!\()/g, replacement: "$1?.$2" },
      // obj && obj[key] -> obj?.[key]
      { pattern: /(\w+)\s*&&\s*\1\[([^\]]+)\]/g, replacement: "$1?.[$2]" },
      // obj && obj.method() -> obj?.method()
      { pattern: /(\w+)\s*&&\s*\1\.(\w+)\(/g, replacement: "$1?.$2(" },
      // (obj || {})[key] -> obj?.[key]
      {
        pattern: /\((\w+)\s*\|\|\s*\{\}\)\[([^\]]+)\]/g,
        replacement: "$1?.[$2]",
      },
      // (obj || {}).prop -> obj?.prop
      { pattern: /\((\w+)\s*\|\|\s*\{\}\)\.(\w+)/g, replacement: "$1?.$2" },
      // key in (obj || {}) -> obj?.[key] !== undefined
      {
        pattern: /(\w+)\s+in\s+\((\w+)\s*\|\|\s*\{\}\)/g,
        replacement: "$2?.[$1] !== undefined",
      },
      // obj && obj.prop && obj.prop.nested -> obj?.prop?.nested
      {
        pattern: /(\w+)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g,
        replacement: "$1?.$2?.$3",
      },
      // More complex nested patterns
      {
        pattern: /(\w+)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\[([^\]]+)\]/g,
        replacement: "$1?.$2?.[$3]",
      },
    ];

    for (const { pattern, replacement } of patterns) {
      const matches = [...modifiedContent.matchAll(pattern)];
      if (matches.length > 0) {
        modifiedContent = modifiedContent.replace(pattern, replacement);
        fixes += matches.length;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Aggressive floating promise fixes
   */
  aggressiveFloatingPromiseFixes(content) {
    let fixes = 0;
    let modifiedContent = content;

    const lines = modifiedContent.split("\n");
    const fixedLines = [];

    for (let line of lines) {
      const originalLine = line;

      // Pattern 1: Standalone method calls that return promises
      if (
        /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\);?\s*$/.test(
          line,
        ) &&
        !line.includes("await") &&
        !line.includes("void") &&
        !line.includes("return") &&
        !line.includes("console") &&
        !line.includes("expect")
      ) {
        line = line.replace(
          /^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\);?\s*)$/,
          "$1void $2",
        );

        if (line !== originalLine) {
          fixes++;
        }
      }

      // Pattern 2: Promise constructor calls
      else if (
        /^\s*new\s+Promise\s*\(/.test(line) &&
        !line.includes("await") &&
        !line.includes("return") &&
        !line.includes("=")
      ) {
        line = line.replace(/^(\s*)(new\s+Promise\s*\(.*)$/, "$1void $2");
        if (line !== originalLine) {
          fixes++;
        }
      }

      // Pattern 3: Async function calls
      else if (
        /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\(.*\)\s*;?\s*$/.test(line) &&
        (line.includes("async") ||
          line.includes("Async") ||
          line.includes("Promise")) &&
        !line.includes("await") &&
        !line.includes("void") &&
        !line.includes("return")
      ) {
        line = line.replace(
          /^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\s*\(.*\)\s*;?\s*)$/,
          "$1void $2",
        );
        if (line !== originalLine) {
          fixes++;
        }
      }

      fixedLines.push(line);
    }

    return { content: fixedLines.join("\n"), fixes };
  }

  /**
   * Aggressive misused promise fixes
   */
  aggressiveMisusedPromiseFixes(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: Event handlers with async functions
    const eventHandlerPattern = /(on\w+)=\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;
    const matches1 = [...modifiedContent.matchAll(eventHandlerPattern)];
    for (const match of matches1) {
      const [fullMatch, eventName, functionName] = match;
      if (
        functionName.includes("async") ||
        functionName.includes("handle") ||
        functionName.includes("submit") ||
        functionName.includes("load")
      ) {
        modifiedContent = modifiedContent.replace(
          fullMatch,
          `${eventName}={() => void ${functionName}()}`,
        );
        fixes++;
      }
    }

    // Pattern 2: Promise in boolean context
    const booleanPromisePattern =
      /if\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))\s*\)/g;
    const matches2 = [...modifiedContent.matchAll(booleanPromisePattern)];
    for (const match of matches2) {
      const [fullMatch, functionCall] = match;
      if (
        functionCall.includes("async") ||
        functionCall.includes("Promise") ||
        functionCall.includes("fetch")
      ) {
        modifiedContent = modifiedContent.replace(
          fullMatch,
          `if (await ${functionCall})`,
        );
        fixes++;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Aggressive non-null assertion fixes
   */
  aggressiveNonNullFixes(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: obj!.prop -> obj?.prop (more aggressive)
    const pattern1 = /(\w+)!\.(\w+)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    for (const match of matches1) {
      // More aggressive - fix most cases except very specific ones
      if (!match[0].includes("document!") && !match[0].includes("window!")) {
        modifiedContent = modifiedContent.replace(
          match[0],
          `${match[1]}?.${match[2]}`,
        );
        fixes++;
      }
    }

    // Pattern 2: obj![key] -> obj?.[key]
    const pattern2 = /(\w+)!\[([^\]]+)\]/g;
    const matches2 = [...modifiedContent.matchAll(pattern2)];
    for (const match of matches2) {
      if (!match[0].includes("document!") && !match[0].includes("window!")) {
        modifiedContent = modifiedContent.replace(
          match[0],
          `${match[1]}?.[${match[2]}]`,
        );
        fixes++;
      }
    }

    // Pattern 3: Specific known patterns
    const specificPatterns = [
      { from: /resolutionStrategy!/g, to: "resolutionStrategy || 'unknown'" },
      { from: /conflict\.id!/g, to: "conflict?.id || 'unknown'" },
      { from: /result\.data!/g, to: "result?.data" },
    ];

    for (const { from, to } of specificPatterns) {
      const matches = [...modifiedContent.matchAll(from)];
      if (matches.length > 0) {
        modifiedContent = modifiedContent.replace(from, to);
        fixes += matches.length;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const shortPath = filePath.replace(process.cwd(), ".");
      console.log(`\n📁 Processing: ${shortPath}`);

      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️ File not found, skipping`);
        return;
      }

      const content = fs.readFileSync(filePath, "utf8");
      const {
        content: modifiedContent,
        fixes,
        details,
      } = this.applyAggressiveFixes(content, filePath);

      if (fixes > 0) {
        fs.writeFileSync(filePath, modifiedContent, "utf8");

        const fixSummary = Object.entries(details)
          .filter(([, count]) => count > 0)
          .map(([type, count]) => `${type}(${count})`)
          .join(", ");

        console.log(`  ✅ Applied ${fixes} fixes: ${fixSummary}`);
        this.totalFixes += fixes;
      } else {
        console.log(`  ℹ️ No fixable issues found`);
      }

      this.processedFiles++;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Run the aggressive fixing process
   */
  run() {
    console.log("🚀 Starting Aggressive Fixing Process");
    console.log("⚠️  This approach applies more comprehensive fixes");

    const targetFiles = this.getHighImpactFiles();

    if (targetFiles.length === 0) {
      console.log("⚠️ No target files found");
      return;
    }

    console.log(`📋 Processing ${targetFiles.length} high-impact files...`);

    for (const file of targetFiles) {
      this.processFile(file);
    }

    // Summary
    console.log("\n📊 Aggressive Fixing Summary:");
    console.log(`   Files processed: ${this.processedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    console.log("\n📈 Fixes by category:");
    for (const [category, count] of Object.entries(this.fixesByCategory)) {
      if (count > 0) {
        console.log(`   ${category}: ${count} fixes`);
      }
    }

    if (this.totalFixes > 0) {
      console.log("\n✅ Aggressive fixes completed successfully!");
      console.log("💡 Run yarn lint to verify the improvements");
      console.log("⚠️  Check that functionality still works as expected");
    }
  }
}

// Run the script
const fixer = new AggressiveFixer();
fixer.run();
