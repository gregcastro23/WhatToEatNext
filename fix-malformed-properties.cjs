#!/usr/bin/env node

/**
 * Fix Malformed Properties
 * Fixes malformed property names in TypeScript files
 */

const fs = require("fs");
const { execSync } = require("child_process");

class MalformedPropertiesFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
  }

  async run() {
    console.log("🎯 Fixing malformed properties...\n");

    try {
      // Get initial error count
      const initialErrors = await this.getTS1128ErrorCount();
      console.log(`📊 Initial TS1128 errors: ${initialErrors}`);

      // Get all TypeScript test files
      const files = await this.getTestFiles();
      console.log(`🔍 Found ${files.length} test files to process`);

      // Process each file
      for (const filePath of files) {
        await this.processFile(filePath);
      }

      // Final results
      const finalErrors = await this.getTS1128ErrorCount();
      const reduction = initialErrors - finalErrors;

      console.log("\n📈 Results:");
      console.log(`   Initial TS1128 errors: ${initialErrors}`);
      console.log(`   Final TS1128 errors: ${finalErrors}`);
      console.log(`   Errors reduced: ${reduction}`);
      console.log(`   Files processed: ${this.processedFiles.length}`);
      console.log(`   Total fixes applied: ${this.totalFixes}`);
    } catch (error) {
      console.error("❌ Fix failed:", error.message);
    }
  }

  async getTS1128ErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1128"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async getTestFiles() {
    try {
      const output = execSync(
        'find src/ -name "*.test.ts" -o -name "*.test.tsx"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
    } catch (error) {
      return [];
    }
  }

  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      console.log(`   🔧 Processing ${filePath}`);

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: Malformed property names: severit, y: -> severity:
      const severityPattern = /severit,\s*y:/g;
      const severityMatches = content.match(severityPattern) || [];
      content = content.replace(severityPattern, "severity:");
      fixesApplied += severityMatches.length;

      // Fix 2: Malformed property names: ke, y: -> key:
      const keyPattern = /\[ke,\s*y:\s*string\]/g;
      const keyMatches = content.match(keyPattern) || [];
      content = content.replace(keyPattern, "[key: string]");
      fixesApplied += keyMatches.length;

      // Fix 3: Malformed property names: degre, e: -> degree:
      const degreePattern = /degre,\s*e:/g;
      const degreeMatches = content.match(degreePattern) || [];
      content = content.replace(degreePattern, "degree:");
      fixesApplied += degreeMatches.length;

      // Fix 4: Missing semicolons after object declarations
      const missingSemicolonPattern = /(\}\s*)\n(\s*const\s+\w+)/g;
      const semicolonMatches = content.match(missingSemicolonPattern) || [];
      content = content.replace(missingSemicolonPattern, "$1;\n$2");
      fixesApplied += semicolonMatches.length;

      // Fix 5: Incomplete object declarations
      const incompleteObjectPattern = /(\{\s*[^}]+)\n(\s*const\s+\w+)/g;
      const incompleteMatches = content.match(incompleteObjectPattern) || [];
      content = content.replace(incompleteObjectPattern, "$1\n        };\n$2");
      fixesApplied += incompleteMatches.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} fixes`);
      } else {
        console.log(`     - No fixes needed`);
      }

      return fixesApplied;
    } catch (error) {
      console.log(`     ❌ Error processing file: ${error.message}`);
      return 0;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new MalformedPropertiesFixer();
  fixer.run().catch(console.error);
}

module.exports = MalformedPropertiesFixer;
