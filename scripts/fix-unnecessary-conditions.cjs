#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  sourceDir: "./src",
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  excludePatterns: [
    "node_modules",
    ".next",
    "dist",
    "build",
    "__tests__",
    "*.test.ts",
    "*.test.tsx",
  ],
  preservePatterns: {
    // Astrological and astronomical patterns to preserve
    astrological: [
      /planetPosition\s*&&\s*planetPosition\.degree\s*!==\s*undefined/,
      /transitDate\s*&&\s*isValidTransitDate\(/,
      /elementalProperties\s*&&\s*elementalProperties\.(fire|water|earth|air)/,
      /zodiac(Sign|Data|Position|Info)/i,
      /lunar(Phase|Position|Data)/i,
      /solar(Position|Return|Data)/i,
      /astronomical(Data|Calculation|Position)/i,
      /celestial(Body|Bodies|Position)/i,
      /planet(ary)?(Position|Data|Info|Aspect)/i,
      /aspect(Angle|Type|Data)/i,
      /retrograde|direct|stationary/i,
    ],
    // Campaign and enterprise intelligence patterns
    campaign: [
      /campaign(Progress|Metrics|Safety|Status|Data)/i,
      /progress(Tracking|Data|Metrics|Status)/i,
      /metrics(Collection|Data|Analysis|Report)/i,
      /safety(Protocol|Check|Validation|Score)/i,
      /intelligence(Service|Data|Analysis|Pattern)/i,
      /enterprise(Data|Service|Integration|Pattern)/i,
      /ml(Model|Prediction|Analysis|Service)/i,
      /predictive(Analysis|Model|Service|Data)/i,
      /analytics(Service|Data|Engine|Report)/i,
    ],
    // API and external data patterns
    external: [
      /apiResponse\s*&&\s*apiResponse\.(data|status|error)/,
      /externalData\s*&&\s*externalData\./,
      /fetchResult\s*&&\s*fetchResult\./,
      /response\s*&&\s*response\.(ok|status|data)/,
      /error\s*&&\s*error\.(message|code|status)/,
      /result\s*&&\s*result\.(success|error|data)/,
    ],
  },
  maxFilesPerRun: 50,
  dryRun: false,
};

// Track metrics
const metrics = {
  filesScanned: 0,
  filesModified: 0,
  conditionsFixed: 0,
  conditionsPreserved: 0,
  errors: [],
  patterns: {
    doubleCheck: 0,
    arrayLength: 0,
    propertyChain: 0,
    nullishCoalescing: 0,
    typeNarrowing: 0,
  },
};

// Unnecessary condition patterns to fix
const CONDITION_PATTERNS = [
  // Pattern 1: Double checking same value (value && value) - CONSERVATIVE
  {
    name: "doubleCheck",
    pattern: /\b(\w+)\s*&&\s*\1\b/g,
    replacement: (match, variable) => {
      // Only fix simple variable names, avoid complex expressions
      if (
        variable.length > 20 ||
        variable.includes("[") ||
        variable.includes("(")
      ) {
        return match; // Don't fix complex expressions
      }
      return variable;
    },
    description: "Remove redundant double checks (conservative)",
  },

  // Pattern 2: Array length check that can use optional chaining
  {
    name: "arrayLength",
    pattern: /\b(\w+(?:\.\w+)*)\s*&&\s*\1\.length\s*>\s*0/g,
    replacement: (match, variable) => `${variable}?.length`,
    description: "Convert array length checks to optional chaining",
  },

  // Pattern 3: Property chain checks (obj && obj.prop && obj.prop.subprop)
  {
    name: "propertyChain",
    pattern: /\b(\w+)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g,
    replacement: (match, obj, prop1, prop2) => `${obj}?.${prop1}?.${prop2}`,
    description: "Convert property chains to optional chaining",
  },

  // Pattern 4: Simple property checks (obj && obj.prop)
  {
    name: "simpleProperty",
    pattern: /\b(\w+)\s*&&\s*\1\.(\w+)(?!\s*&&|\s*\()/g,
    replacement: (match, obj, prop) => `${obj}?.${prop}`,
    description: "Convert simple property checks to optional chaining",
  },

  // Pattern 5: Nullish coalescing opportunities (value || defaultValue where value is always defined)
  {
    name: "nullishCoalescing",
    pattern: /\b(true|false|0|1|"[^"]+"|'[^']+')\s*\|\|\s*\w+/g,
    replacement: (match, value) => value,
    description: "Remove unnecessary fallback for always-defined values",
  },
];

// Additional TypeScript-specific patterns
const TS_CONDITION_PATTERNS = [
  // Pattern 6: Type narrowing that's redundant after TypeScript checks - DISABLED
  // DISABLED: This can be unsafe as it removes type guards
  // {
  //   name: 'typeNarrowing',
  //   pattern: /typeof\s+(\w+)\s*===\s*["'](\w+)["']\s*&&\s*\1/g,
  //   replacement: (match, variable) => variable,
  //   description: 'Remove redundant type narrowing'
  // },
  // Pattern 7: Non-null assertion opportunities - DISABLED
  // DISABLED: This can be unsafe as it removes null checks
  // {
  //   name: 'nonNullCheck',
  //   pattern: /\b(\w+)\s*!=\s*null\s*&&\s*\1/g,
  //   replacement: (match, variable) => variable,
  //   description: 'Remove redundant non-null checks'
  // }
];

/**
 * Check if a condition should be preserved based on domain patterns
 */
function shouldPreserveCondition(line, condition) {
  // Check all preservation patterns
  for (const [domain, patterns] of Object.entries(CONFIG.preservePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(line) || pattern.test(condition)) {
        metrics.conditionsPreserved++;
        return true;
      }
    }
  }
  return false;
}

/**
 * Process a single file to fix unnecessary conditions
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let modified = false;
    let modifiedContent = content;

    // Apply each pattern
    [...CONDITION_PATTERNS, ...TS_CONDITION_PATTERNS].forEach(
      (patternConfig) => {
        const pattern = new RegExp(patternConfig.pattern.source, "gm");
        let match;

        while ((match = pattern.exec(content)) !== null) {
          const matchedText = match[0];
          const lineIndex =
            content.substring(0, match.index).split("\n").length - 1;
          const line = lines[lineIndex];

          // Check if this condition should be preserved
          if (shouldPreserveCondition(line, matchedText)) {
            continue;
          }

          // Apply the replacement
          const replacement = patternConfig.replacement(...match);
          modifiedContent = modifiedContent.replace(matchedText, replacement);
          metrics.patterns[patternConfig.name]++;
          metrics.conditionsFixed++;
          modified = true;

          if (!CONFIG.dryRun) {
            console.log(
              `  Fixed ${patternConfig.name}: ${matchedText} → ${replacement}`,
            );
          }
        }
      },
    );

    // Write the modified content if changes were made
    if (modified && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      metrics.filesModified++;
      console.log(
        `✅ Fixed ${metrics.conditionsFixed} conditions in ${filePath}`,
      );
    } else if (modified && CONFIG.dryRun) {
      console.log(`Would fix conditions in ${filePath}`);
    }
  } catch (error) {
    metrics.errors.push({ file: filePath, error: error.message });
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Validate TypeScript compilation after fixes
 */
function validateBuildAfterFix() {
  console.log("\n📋 Validating TypeScript compilation...");
  try {
    execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
    console.log("✅ TypeScript compilation successful");
    return true;
  } catch (error) {
    console.error("❌ Build failed after fixes - consider rolling back");
    console.error(error.toString());
    return false;
  }
}

/**
 * Create git stash for safety
 */
function createSafetyStash() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    execSync(`git stash push -m "unnecessary-conditions-fix-${timestamp}"`, {
      stdio: "pipe",
    });
    console.log("✅ Created safety stash");
    return timestamp;
  } catch (error) {
    console.error("⚠️  Could not create git stash:", error.message);
    return null;
  }
}

/**
 * Get all TypeScript/JavaScript files to process
 */
function getFilesToProcess() {
  const files = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (
          !CONFIG.excludePatterns.some((pattern) => fullPath.includes(pattern))
        ) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        if (
          CONFIG.extensions.some((ext) => fullPath.endsWith(ext)) &&
          !CONFIG.excludePatterns.some((pattern) => fullPath.includes(pattern))
        ) {
          files.push(fullPath);
        }
      }
    }
  }

  scanDirectory(CONFIG.sourceDir);
  return files;
}

/**
 * Main execution
 */
function main() {
  console.log("🚀 WhatToEatNext - Unnecessary Conditions Fixer");
  console.log("================================================");

  // Parse command line arguments
  const args = process.argv.slice(2);
  if (args.includes("--dry-run")) {
    CONFIG.dryRun = true;
    console.log("🔍 Running in DRY RUN mode - no files will be modified");
  }

  if (args.includes("--max-files")) {
    const maxIndex = args.indexOf("--max-files");
    CONFIG.maxFilesPerRun =
      parseInt(args[maxIndex + 1]) || CONFIG.maxFilesPerRun;
  }

  // Create safety stash if not in dry run
  let stashTimestamp = null;
  if (!CONFIG.dryRun) {
    stashTimestamp = createSafetyStash();
  }

  // Get files to process
  const files = getFilesToProcess();
  console.log(`\n📁 Found ${files.length} files to analyze`);

  // Process files with limit
  const filesToProcess = files.slice(0, CONFIG.maxFilesPerRun);
  console.log(`\n🔧 Processing ${filesToProcess.length} files...\n`);

  filesToProcess.forEach((file) => {
    metrics.filesScanned++;
    processFile(file);
  });

  // Report results
  console.log("\n📊 Fix Summary:");
  console.log("================");
  console.log(`Files scanned: ${metrics.filesScanned}`);
  console.log(`Files modified: ${metrics.filesModified}`);
  console.log(`Conditions fixed: ${metrics.conditionsFixed}`);
  console.log(`Conditions preserved: ${metrics.conditionsPreserved}`);
  console.log("\nPattern breakdown:");
  Object.entries(metrics.patterns).forEach(([pattern, count]) => {
    if (count > 0) {
      console.log(`  ${pattern}: ${count}`);
    }
  });

  if (metrics.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${metrics.errors.length}`);
    metrics.errors.forEach((err) => {
      console.log(`  - ${err.file}: ${err.error}`);
    });
  }

  // Validate build if changes were made
  if (metrics.filesModified > 0 && !CONFIG.dryRun) {
    const buildValid = validateBuildAfterFix();
    if (!buildValid && stashTimestamp) {
      console.log("\n⚠️  Build failed - you can restore with:");
      console.log(
        `git stash apply stash^{/unnecessary-conditions-fix-${stashTimestamp}}`,
      );
    }
  }

  // Suggest next steps
  console.log("\n📌 Next Steps:");
  if (CONFIG.dryRun) {
    console.log("1. Review the changes that would be made");
    console.log("2. Run without --dry-run to apply fixes");
  } else if (metrics.filesModified > 0) {
    console.log("1. Run yarn lint to see updated issue count");
    console.log("2. Review changes with git diff");
    console.log("3. Run tests to ensure functionality preserved");
    console.log("4. Commit changes if all tests pass");
  }

  if (files.length > filesToProcess.length) {
    console.log(
      `\n📝 Note: ${files.length - filesToProcess.length} files remaining. Run again to process more.`,
    );
  }
}

// Execute
main();
