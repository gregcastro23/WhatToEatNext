#!/usr/bin/env node

/**
 * Fix TS1003 Identifier Resolution Errors - Phase 6 (Comprehensive)
 *
 * Targets TS1003 "Identifier expected" errors by fixing:
 * - Incorrect array access syntax (.[0] -> [0])
 * - Malformed function signatures
 * - Template literal issues
 *
 * Safety: MAXIMUM - Processes files in small batches with validation
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  maxFiles: 50,
  batchSize: 3, // Smaller batches for safety
  validateAfterEach: true,
  backupEnabled: true,
  dryRun: false,
};

// Statistics tracking
const stats = {
  filesProcessed: 0,
  errorsFixed: 0,
  patternsFixed: {
    incorrectArrayAccess: 0,
    malformedFunctionSignatures: 0,
    templateLiteralIssues: 0,
  },
  filesWithChanges: [],
};

/**
 * Get current TS1003 error count
 */
function getTS1003ErrorCount() {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1003"',
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );
    return parseInt(output.trim()) || 0;
  } catch (error) {
    return error.status === 1 ? 0 : -1;
  }
}

/**
 * Get files with TS1003 errors
 */
function getFilesWithTS1003Errors() {
  try {
    const output = execSync(
      "yarn tsc --noEmit --skipLibCheck 2>&1 | grep \"error TS1003\" | cut -d'(' -f1 | sort | uniq",
      { encoding: "utf8", stdio: "pipe" },
    );

    return output
      .trim()
      .split("\n")
      .filter((file) => file.trim());
  } catch (error) {
    console.warn("Could not get files with TS1003 errors:", error.message);
    return [];
  }
}

/**
 * Fix incorrect array/property access patterns
 */
function fixIncorrectAccess(content) {
  let fixed = content;
  let changeCount = 0;

  // Pattern: Fix .[number] -> [number] (but preserve ?.[number])
  // Use a more precise regex that doesn't interfere with optional chaining
  const lines = fixed.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for patterns like: variable.[0] or variable.[property]
    const incorrectAccessRegex = /(\w+)\.\[([^\]]+)\]/g;
    let match;
    let newLine = line;

    while ((match = incorrectAccessRegex.exec(line)) !== null) {
      const fullMatch = match[0];
      const objectName = match[1];
      const accessor = match[2];

      // Check if this is preceded by a '?' (optional chaining)
      const beforeMatch = line.substring(0, match.index);
      if (!beforeMatch.endsWith("?")) {
        const replacement = `${objectName}[${accessor}]`;
        newLine = newLine.replace(fullMatch, replacement);
        changeCount++;
        stats.patternsFixed.incorrectArrayAccess++;
      }
    }

    lines[i] = newLine;
  }

  fixed = lines.join("\n");
  return { content: fixed, changeCount };
}

/**
 * Fix malformed function signatures
 */
function fixMalformedFunctionSignatures(content) {
  let fixed = content;
  let changeCount = 0;

  // Pattern: Fix function signatures like: test('name': any, async () => {
  // Should be: test('name', async () => {
  const malformedSignatureRegex =
    /(\w+\s*\([^)]*)':\s*any,\s*(async\s*\(\s*\)\s*=>\s*\{)/g;
  const matches = [...content.matchAll(malformedSignatureRegex)];

  for (const match of matches) {
    const fullMatch = match[0];
    const beforeColon = match[1];
    const afterAny = match[2];

    const replacement = `${beforeColon}', ${afterAny}`;
    fixed = fixed.replace(fullMatch, replacement);
    changeCount++;
    stats.patternsFixed.malformedFunctionSignatures++;
  }

  return { content: fixed, changeCount };
}

/**
 * Fix template literal issues
 */
function fixTemplateLiteralIssues(content) {
  let fixed = content;
  let changeCount = 0;

  // Pattern: Fix template literals with incorrect property access
  const templateLiteralRegex =
    /`([^`]*\$\{[^}]*)\.\[([^\]]+)\]([^}]*\}[^`]*)`/g;
  const matches = [...content.matchAll(templateLiteralRegex)];

  for (const match of matches) {
    const fullMatch = match[0];
    const beforeAccess = match[1];
    const accessor = match[2];
    const afterAccess = match[3];

    const replacement = `\`${beforeAccess}[${accessor}]${afterAccess}\``;
    fixed = fixed.replace(fullMatch, replacement);
    changeCount++;
    stats.patternsFixed.templateLiteralIssues++;
  }

  return { content: fixed, changeCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let processedContent = content;
    let totalChanges = 0;

    // Apply all fixes
    const accessResult = fixIncorrectAccess(processedContent);
    processedContent = accessResult.content;
    totalChanges += accessResult.changeCount;

    const signatureResult = fixMalformedFunctionSignatures(processedContent);
    processedContent = signatureResult.content;
    totalChanges += signatureResult.changeCount;

    const templateResult = fixTemplateLiteralIssues(processedContent);
    processedContent = templateResult.content;
    totalChanges += templateResult.changeCount;

    // Write changes if any were made
    if (totalChanges > 0 && !CONFIG.dryRun) {
      fs.writeFileSync(filePath, processedContent);
      stats.filesWithChanges.push(filePath);
      console.log(`✅ Fixed ${totalChanges} patterns in ${filePath}`);
    } else if (totalChanges > 0) {
      console.log(
        `🔍 [DRY RUN] Would fix ${totalChanges} patterns in ${filePath}`,
      );
    }

    stats.errorsFixed += totalChanges;
    return totalChanges > 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Validate TypeScript compilation
 */
function validateTypeScript() {
  try {
    execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Create backup using git stash
 */
function createBackup() {
  try {
    execSync(
      'git add -A && git stash push -m "Pre-identifier-resolution-comprehensive-backup"',
      { stdio: "pipe" },
    );
    console.log("✅ Created git stash backup");
    return true;
  } catch (error) {
    console.warn("⚠️ Could not create git stash backup:", error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log(
    "🚀 Starting TS1003 Identifier Resolution Fixes - Phase 6 (Comprehensive)",
  );
  console.log(
    `📊 Configuration: maxFiles=${CONFIG.maxFiles}, batchSize=${CONFIG.batchSize}`,
  );

  // Get initial error count
  const initialErrorCount = getTS1003ErrorCount();
  console.log(`📈 Initial TS1003 error count: ${initialErrorCount}`);

  if (initialErrorCount === 0) {
    console.log("🎉 No TS1003 errors found!");
    return;
  }

  // Create backup
  if (CONFIG.backupEnabled) {
    createBackup();
  }

  // Get files with TS1003 errors
  const filesWithErrors = getFilesWithTS1003Errors();
  console.log(`📁 Found ${filesWithErrors.length} files with TS1003 errors`);

  // Process files in batches
  const filesToProcess = filesWithErrors.slice(0, CONFIG.maxFiles);

  for (let i = 0; i < filesToProcess.length; i += CONFIG.batchSize) {
    const batch = filesToProcess.slice(i, i + CONFIG.batchSize);
    console.log(
      `\n🔄 Processing batch ${Math.floor(i / CONFIG.batchSize) + 1} (${batch.length} files)`,
    );

    // Process each file in the batch
    for (const filePath of batch) {
      if (fs.existsSync(filePath)) {
        processFile(filePath);
        stats.filesProcessed++;
      }
    }

    // Validate after each batch
    if (CONFIG.validateAfterEach && !CONFIG.dryRun) {
      console.log("🔍 Validating TypeScript compilation...");
      const isValid = validateTypeScript();

      if (!isValid) {
        console.error("❌ TypeScript validation failed! Rolling back...");
        try {
          execSync("git checkout -- .", { stdio: "pipe" });
          console.log("✅ Rolled back changes");
        } catch (rollbackError) {
          console.error("❌ Rollback failed:", rollbackError.message);
        }
        process.exit(1);
      } else {
        console.log("✅ TypeScript validation passed");
      }
    }

    // Brief pause between batches
    if (i + CONFIG.batchSize < filesToProcess.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Final statistics
  const finalErrorCount = getTS1003ErrorCount();
  const errorsReduced = initialErrorCount - finalErrorCount;

  console.log("\n📊 Final Statistics:");
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files with changes: ${stats.filesWithChanges.length}`);
  console.log(`Total patterns fixed: ${stats.errorsFixed}`);
  console.log(
    `  - Incorrect array access: ${stats.patternsFixed.incorrectArrayAccess}`,
  );
  console.log(
    `  - Malformed function signatures: ${stats.patternsFixed.malformedFunctionSignatures}`,
  );
  console.log(
    `  - Template literal issues: ${stats.patternsFixed.templateLiteralIssues}`,
  );
  console.log(`\n📈 Error Reduction:`);
  console.log(`Initial TS1003 errors: ${initialErrorCount}`);
  console.log(`Final TS1003 errors: ${finalErrorCount}`);
  console.log(
    `Errors reduced: ${errorsReduced} (${((errorsReduced / initialErrorCount) * 100).toFixed(1)}%)`,
  );

  if (errorsReduced > 0) {
    console.log("🎉 Successfully reduced TS1003 errors!");

    // Target achievement check
    const targetReduction = Math.floor(initialErrorCount * 0.43); // 43% reduction target
    if (errorsReduced >= targetReduction) {
      console.log(
        `🎯 Target achieved! Reduced ${errorsReduced} errors (target was ${targetReduction})`,
      );
    } else {
      console.log(
        `📊 Progress: ${errorsReduced}/${targetReduction} errors reduced toward 43% target`,
      );
    }
  } else {
    console.log("⚠️ No errors were reduced. Manual review may be needed.");
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
}

module.exports = { processFile, getTS1003ErrorCount };
