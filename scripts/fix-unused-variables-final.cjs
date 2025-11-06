#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  sourceDir: "./src",
  extensions: [".ts", ".tsx", ".js", ".jsx"],
  excludePatterns: ["node_modules", ".next", "dist", "build"],
  preservePatterns: {
    // Astrological and astronomical patterns
    astrological: [
      /^(planet|degree|sign|longitude|position|transit|elemental)/i,
      /^(zodiac|lunar|solar|celestial|astronomical|aspect)/i,
      /^(retrograde|direct|stationary|conjunction|opposition)/i,
      /^(ascendant|descendant|midheaven|nadir|house|cusp)/i,
      /^(decan|triplicity|quadruplicity|modality|polarity)/i,
    ],
    // Campaign and enterprise intelligence patterns
    campaign: [
      /^(campaign|progress|metrics|safety|intelligence|enterprise)/i,
      /^(ml|predictive|analytics|monitoring|tracking|reporting)/i,
      /^(service|integration|pattern|protocol|validation)/i,
      /^(score|status|data|analysis|engine|model)/i,
    ],
    // Test patterns
    test: [
      /^(mock|stub|test|expect|jest|describe|it|before|after)/i,
      /^(spy|fixture|snapshot|setup|teardown|helper)/i,
      /^(dummy|fake|sample|example|demo)/i,
    ],
    // React and hooks patterns
    react: [
      /^(use[A-Z])/, // React hooks
      /^(Component|Provider|Context|Ref|Props|State)/i,
      /^(handle|on[A-Z])/, // Event handlers
      /^(render|mount|wrapper|container)/i,
    ],
    // API and external patterns
    external: [
      /^(api|fetch|request|response|endpoint|client)/i,
      /^(auth|token|session|user|permission|role)/i,
      /^(config|env|setting|option|preference)/i,
      /^(error|exception|warning|info|debug|trace)/i,
    ],
  },
  importPatterns: {
    // Import statement patterns
    namedImport: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g,
    defaultImport: /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g,
    namespaceImport: /import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g,
    sideEffectImport: /import\s+['"]([^'"]+)['"]/g,
    typeImport: /import\s+type\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g,
    defaultTypeImport: /import\s+type\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g,
  },
  maxFilesPerRun: 40,
  dryRun: false,
};

// Track metrics
const metrics = {
  filesScanned: 0,
  filesModified: 0,
  importsRemoved: 0,
  variablesFixed: 0,
  variablesPreserved: 0,
  errors: [],
  patterns: {
    unusedImports: 0,
    unusedVariables: 0,
    unusedParameters: 0,
    unusedDestructuring: 0,
    prefixedVariables: 0,
  },
};

/**
 * Check if a variable should be preserved
 */
function shouldPreserveVariable(name) {
  // Check all preservation patterns
  for (const [domain, patterns] of Object.entries(CONFIG.preservePatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(name)) {
        return domain;
      }
    }
  }
  return null;
}

/**
 * Extract all variable usages from content
 */
function extractVariableUsages(content) {
  const usages = new Set();

  // Match variable usage patterns (excluding declarations)
  const usagePatterns = [
    /(?<!(?:let|const|var|function|class|interface|type|import)\s+)(?<!\.)\b(\w+)\b(?!\s*[:=])/g,
    /\b(\w+)\s*\(/g, // Function calls
    /\.\s*(\w+)/g, // Property access
    /\[\s*(\w+)\s*\]/g, // Array access
    /<\s*(\w+)\s*>/g, // JSX components
    /\b(\w+)\s*\?/g, // Optional chaining
  ];

  usagePatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      usages.add(match[1]);
    }
  });

  return usages;
}

/**
 * Process imports in a file
 */
function processImports(content, filePath) {
  let modifiedContent = content;
  const removedImports = [];
  const usedVariables = extractVariableUsages(content);

  // Process each import type
  Object.entries(CONFIG.importPatterns).forEach(([type, pattern]) => {
    if (type === "sideEffectImport") return; // Don't remove side-effect imports

    const regex = new RegExp(pattern.source, "gm");
    let match;

    while ((match = regex.exec(content)) !== null) {
      const fullImport = match[0];

      if (type === "namedImport" || type === "typeImport") {
        // Handle named imports
        const imports = match[1].split(",").map((i) => i.trim());
        const usedImports = [];
        const unusedImports = [];

        imports.forEach((imp) => {
          const importName = imp.includes(" as ")
            ? imp.split(" as ")[1].trim()
            : imp.trim();

          if (
            usedVariables.has(importName) ||
            shouldPreserveVariable(importName)
          ) {
            usedImports.push(imp);
          } else {
            unusedImports.push(imp);
            metrics.importsRemoved++;
          }
        });

        if (unusedImports.length > 0) {
          if (usedImports.length === 0) {
            // Remove entire import statement
            modifiedContent = modifiedContent.replace(fullImport + ";", "");
            modifiedContent = modifiedContent.replace(fullImport, "");
            removedImports.push(`Removed: ${fullImport}`);
          } else {
            // Remove only unused imports
            const newImport = fullImport.replace(
              match[1],
              usedImports.join(", "),
            );
            modifiedContent = modifiedContent.replace(fullImport, newImport);
            removedImports.push(`Modified: ${fullImport} → ${newImport}`);
          }
          metrics.patterns.unusedImports++;
        }
      } else if (
        type === "defaultImport" ||
        type === "defaultTypeImport" ||
        type === "namespaceImport"
      ) {
        // Handle default and namespace imports
        const importName = match[1];
        if (
          !usedVariables.has(importName) &&
          !shouldPreserveVariable(importName)
        ) {
          modifiedContent = modifiedContent.replace(fullImport + ";", "");
          modifiedContent = modifiedContent.replace(fullImport, "");
          removedImports.push(`Removed: ${fullImport}`);
          metrics.importsRemoved++;
          metrics.patterns.unusedImports++;
        }
      }
    }
  });

  if (removedImports.length > 0 && !CONFIG.dryRun) {
    console.log(`  Removed ${removedImports.length} unused imports`);
    removedImports.forEach((imp) => console.log(`    ${imp}`));
  }

  return modifiedContent;
}

/**
 * Process unused variables in a file
 */
function processUnusedVariables(content, filePath) {
  let modifiedContent = content;
  const fixedVariables = [];

  // ESLint unused variable patterns
  const unusedPatterns = [
    // Unused variables
    {
      pattern: /^(\s*)(const|let|var)\s+(\w+)\s*=/gm,
      type: "variable",
      getVarName: (match) => match[3],
    },
    // Unused function parameters
    {
      pattern: /function\s*\w*\s*\(([^)]+)\)/g,
      type: "parameter",
      getVarName: (match) => {
        const params = match[1].split(",").map((p) => p.trim());
        return params.map((p) => p.split(/[:\s=]/)[0].trim());
      },
    },
    // Arrow function parameters
    {
      pattern: /\(([^)]+)\)\s*(?::|=>)/g,
      type: "parameter",
      getVarName: (match) => {
        const params = match[1].split(",").map((p) => p.trim());
        return params.map((p) => p.split(/[:\s=]/)[0].trim());
      },
    },
    // Destructuring assignments
    {
      pattern: /(?:const|let|var)\s*{\s*([^}]+)\s*}\s*=/g,
      type: "destructuring",
      getVarName: (match) => {
        const vars = match[1].split(",").map((v) => v.trim());
        return vars.map((v) => v.split(/[:\s=]/)[0].trim());
      },
    },
  ];

  const usedVariables = extractVariableUsages(content);

  unusedPatterns.forEach(({ pattern, type, getVarName }) => {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(content)) !== null) {
      const varNames = Array.isArray(getVarName(match))
        ? getVarName(match)
        : [getVarName(match)];

      varNames.forEach((varName) => {
        if (!varName) return;

        const preserveDomain = shouldPreserveVariable(varName);

        if (!usedVariables.has(varName) && !preserveDomain) {
          // For parameters, prefix with underscore
          if (type === "parameter" && !varName.startsWith("_")) {
            const oldParam = varName;
            const newParam = "_" + varName;

            // Replace in function signature - escape special regex characters
            const escapedParam = oldParam.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&",
            );
            const paramRegex = new RegExp(
              `\\b${escapedParam}\\b(?=\\s*[,:)])`,
              "g",
            );
            modifiedContent = modifiedContent.replace(paramRegex, newParam);

            fixedVariables.push(
              `Prefixed parameter: ${oldParam} → ${newParam}`,
            );
            metrics.patterns.unusedParameters++;
            metrics.patterns.prefixedVariables++;
            metrics.variablesFixed++;
          }
        } else if (!usedVariables.has(varName) && preserveDomain) {
          // For preserved unused variables, prefix with UNUSED_ or _
          if (!varName.startsWith("_") && !varName.startsWith("UNUSED_")) {
            const oldVar = varName;
            const newVar =
              preserveDomain === "test" ? "_" + varName : "UNUSED_" + varName;

            // Replace variable declaration and usages - escape special regex characters
            const escapedVar = oldVar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const varRegex = new RegExp(`\\b${escapedVar}\\b`, "g");
            modifiedContent = modifiedContent.replace(varRegex, newVar);

            fixedVariables.push(
              `Preserved ${preserveDomain} variable: ${oldVar} → ${newVar}`,
            );
            metrics.patterns.prefixedVariables++;
            metrics.variablesPreserved++;
          }
        }
      });
    }
  });

  if (fixedVariables.length > 0 && !CONFIG.dryRun) {
    console.log(`  Fixed ${fixedVariables.length} unused variables`);
    fixedVariables.forEach((fix) => console.log(`    ${fix}`));
  }

  return modifiedContent;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modifiedContent = content;

    // Process imports first
    modifiedContent = processImports(modifiedContent, filePath);

    // Then process unused variables
    modifiedContent = processUnusedVariables(modifiedContent, filePath);

    // Write the file if modified
    if (modifiedContent !== content && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      metrics.filesModified++;
      console.log(`✅ Fixed unused variables in ${filePath}`);
    } else if (modifiedContent !== content && CONFIG.dryRun) {
      console.log(`Would fix unused variables in ${filePath}`);
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
    execSync(`git stash push -m "unused-variables-fix-${timestamp}"`, {
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
 * Get all files to process
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
  console.log("🚀 WhatToEatNext - Unused Variables Final Cleanup");
  console.log("=================================================");

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
  console.log(`Imports removed: ${metrics.importsRemoved}`);
  console.log(`Variables fixed: ${metrics.variablesFixed}`);
  console.log(`Variables preserved: ${metrics.variablesPreserved}`);
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
        `git stash apply stash^{/unused-variables-fix-${stashTimestamp}}`,
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
