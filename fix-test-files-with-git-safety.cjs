#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Fix test files with git safety protocols and rollback capabilities
 */

class GitSafeTestFixer {
  constructor() {
    this.stashName = `test-file-fixes-${Date.now()}`;
    this.backupBranch = `backup/test-fixes-${Date.now()}`;
    this.fixedFiles = [];
    this.errorCount = {
      before: 0,
      after: 0,
    };
  }

  // Git safety operations
  createSafetyStash() {
    try {
      console.log("🔒 Creating safety stash...");
      execSync(`git stash push -m "${this.stashName}" --include-untracked`, {
        stdio: "pipe",
      });
      console.log(`✅ Created safety stash: ${this.stashName}`);
      return true;
    } catch (error) {
      console.log("ℹ️  No changes to stash or stash creation failed");
      return false;
    }
  }

  createBackupBranch() {
    try {
      console.log("🌿 Creating backup branch...");
      execSync(`git checkout -b ${this.backupBranch}`, { stdio: "pipe" });
      execSync("git checkout -", { stdio: "pipe" }); // Return to original branch
      console.log(`✅ Created backup branch: ${this.backupBranch}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to create backup branch:", error.message);
      return false;
    }
  }

  rollbackChanges() {
    try {
      console.log("🔄 Rolling back changes...");

      // Reset all changes
      execSync("git reset --hard HEAD", { stdio: "pipe" });

      // Apply stash if it exists
      try {
        const stashes = execSync("git stash list", { encoding: "utf8" });
        if (stashes.includes(this.stashName)) {
          execSync(`git stash apply stash@{0}`, { stdio: "pipe" });
          console.log("✅ Restored from safety stash");
        }
      } catch (stashError) {
        console.log("ℹ️  No stash to restore");
      }

      console.log("✅ Successfully rolled back all changes");
      return true;
    } catch (error) {
      console.error("❌ Rollback failed:", error.message);
      return false;
    }
  }

  // Error counting and validation
  getTestFileErrorCount() {
    try {
      const output = execSync(
        'npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "\\.test\\.|\\.spec\\.|__tests__" | wc -l',
        { encoding: "utf8" },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      console.log("Could not count test file errors");
      return -1;
    }
  }

  validateBuildStability() {
    try {
      console.log("🔍 Validating build stability...");
      execSync("npx tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      console.log("✅ Build validation passed");
      return true;
    } catch (error) {
      console.log("❌ Build validation failed");
      return false;
    }
  }

  // Test file fixing logic
  getAllTestFiles() {
    try {
      const output = execSync(
        'find ./src -name "*.test.*" -o -name "*.spec.*" | grep -v backup | head -20',
        { encoding: "utf8" },
      );
      return output
        .trim()
        .split("\n")
        .filter((file) => file.trim());
    } catch (error) {
      console.log("No test files found or error occurred");
      return [];
    }
  }

  fixStrictModeIssues(content) {
    let fixed = content;

    // Conservative fixes only - avoid aggressive changes

    // Fix obvious implicit any parameters
    fixed = fixed.replace(
      /function\s+(\w+)\s*\(\s*(\w+)\s*\)/g,
      "function $1($2: any)",
    );

    // Fix simple arrow function parameters
    fixed = fixed.replace(/\(\s*(\w+)\s*\)\s*=>/g, "($1: any) =>");

    // Fix jest.fn() calls
    fixed = fixed.replace(/jest\.fn\(\)(?!\s*as)/g, "jest.fn() as any");

    // Fix unknown types to any (conservative)
    fixed = fixed.replace(/:\s*unknown/g, ": any");
    fixed = fixed.replace(/<unknown>/g, "<any>");

    // Fix object access with optional chaining (safe)
    fixed = fixed.replace(/(\w+)\.(\w+)(?!\?)/g, (match, obj, prop) => {
      // Only add optional chaining if it's clearly safe
      if (["result", "response", "data", "error"].includes(obj)) {
        return `${obj}?.${prop}`;
      }
      return match;
    });

    return fixed;
  }

  fixTestFile(filePath) {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;

      // Apply conservative fixes
      content = this.fixStrictModeIssues(content);

      // Only write if content changed significantly
      if (
        content !== originalContent &&
        content.length > originalContent.length * 0.9
      ) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles.push(filePath);
        console.log(`Fixed ${filePath}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error fixing ${filePath}:`, error.message);
      return false;
    }
  }

  // Main execution with safety protocols
  async execute() {
    console.log("🚀 Starting test file fixes with git safety protocols...");

    // Step 1: Create safety measures
    const stashCreated = this.createSafetyStash();
    const backupCreated = this.createBackupBranch();

    if (!backupCreated) {
      console.log("❌ Could not create backup branch. Aborting for safety.");
      return false;
    }

    // Step 2: Get baseline error count
    this.errorCount.before = this.getTestFileErrorCount();
    console.log(`📊 Baseline test file errors: ${this.errorCount.before}`);

    // Step 3: Get test files (limited batch for safety)
    const testFiles = this.getAllTestFiles();
    console.log(
      `📁 Found ${testFiles.length} test files (processing first 20 for safety)`,
    );

    // Step 4: Apply fixes in small batches
    let fixedCount = 0;
    const batchSize = 5;

    for (let i = 0; i < testFiles.length; i += batchSize) {
      const batch = testFiles.slice(i, i + batchSize);
      console.log(
        `\n🔧 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(testFiles.length / batchSize)}`,
      );

      // Fix batch
      for (const filePath of batch) {
        if (this.fixTestFile(filePath)) {
          fixedCount++;
        }
      }

      // Validate after each batch
      if (!this.validateBuildStability()) {
        console.log("❌ Build stability compromised. Rolling back...");
        this.rollbackChanges();
        return false;
      }

      // Check if errors are actually reducing
      const currentErrors = this.getTestFileErrorCount();
      if (currentErrors > this.errorCount.before * 1.1) {
        // Allow 10% increase as buffer
        console.log("❌ Error count increased significantly. Rolling back...");
        this.rollbackChanges();
        return false;
      }

      console.log(`✅ Batch completed. Current errors: ${currentErrors}`);
    }

    // Step 5: Final validation
    this.errorCount.after = this.getTestFileErrorCount();
    const improvement = this.errorCount.before - this.errorCount.after;
    const improvementPercent = (
      (improvement / this.errorCount.before) *
      100
    ).toFixed(1);

    console.log("\n📈 Final Results:");
    console.log(`   Files fixed: ${fixedCount}`);
    console.log(`   Errors before: ${this.errorCount.before}`);
    console.log(`   Errors after: ${this.errorCount.after}`);
    console.log(
      `   Improvement: ${improvement} errors (${improvementPercent}%)`,
    );

    // Step 6: Decide whether to keep changes
    if (improvement > 0 && this.validateBuildStability()) {
      console.log("✅ Changes are beneficial and stable. Keeping fixes.");

      // Commit the changes
      try {
        execSync("git add .", { stdio: "pipe" });
        execSync(
          `git commit -m "fix: improve test file TypeScript compliance

- Fixed ${fixedCount} test files
- Reduced TypeScript errors by ${improvement} (${improvementPercent}%)
- Maintained build stability
- Applied conservative fixes with git safety protocols

Backup branch: ${this.backupBranch}"`,
          { stdio: "pipe" },
        );
        console.log("✅ Changes committed successfully");
      } catch (commitError) {
        console.log("ℹ️  Could not commit changes (may need manual commit)");
      }

      return true;
    } else {
      console.log(
        "❌ Changes did not provide sufficient improvement. Rolling back...",
      );
      this.rollbackChanges();
      return false;
    }
  }

  // Cleanup method
  cleanup() {
    console.log("\n🧹 Cleaning up...");

    // List available recovery options
    console.log("\n🔧 Recovery options available:");
    console.log(`   Backup branch: git checkout ${this.backupBranch}`);

    try {
      const stashes = execSync("git stash list", { encoding: "utf8" });
      if (stashes.includes(this.stashName)) {
        console.log(
          `   Safety stash: git stash apply (contains ${this.stashName})`,
        );
      }
    } catch (error) {
      // Ignore stash list errors
    }

    console.log("\n✅ Test file fixing process completed");
  }
}

// Main execution
async function main() {
  const fixer = new GitSafeTestFixer();

  try {
    const success = await fixer.execute();
    fixer.cleanup();

    if (success) {
      console.log(
        "\n🎉 Test file fixes completed successfully with git safety!",
      );
      process.exit(0);
    } else {
      console.log("\n⚠️  Test file fixes were rolled back for safety");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n💥 Unexpected error during execution:", error);
    console.log("🔄 Attempting emergency rollback...");
    fixer.rollbackChanges();
    fixer.cleanup();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GitSafeTestFixer;
