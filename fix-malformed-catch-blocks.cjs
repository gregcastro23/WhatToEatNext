#!/usr/bin/env node

/**
 * Fix malformed catch blocks with incorrect type annotations
 * Pattern: } catch (error): any { -> } catch (error) {
 * Pattern: } catch (error: any): any { -> } catch (error: any) {
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class MalformedCatchBlockFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
  }

  async run() {
    console.log("🔧 Fixing malformed catch blocks...");

    // Get all TypeScript files with TS1005 errors
    const errorFiles = await this.getFilesWithTS1005Errors();
    console.log(`📁 Found ${errorFiles.length} files with TS1005 errors`);

    for (const filePath of errorFiles) {
      try {
        const fixed = await this.fixCatchBlocksInFile(filePath);
        if (fixed > 0) {
          this.fixedFiles++;
          this.totalFixes += fixed;
          console.log(`  ✓ Fixed ${fixed} catch block(s) in ${filePath}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Files processed: ${this.fixedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    // Check final error count
    const finalErrors = await this.getTS1005ErrorCount();
    console.log(`   Remaining TS1005 errors: ${finalErrors}`);
  }

  async fixCatchBlocksInFile(filePath) {
    if (!fs.existsSync(filePath)) return 0;

    const content = fs.readFileSync(filePath, "utf8");
    let fixed = content;
    let fixCount = 0;

    // Pattern 1: } catch (error): any {
    const pattern1 = /} catch \(([^)]+)\): any \{/g;
    const matches1 = fixed.match(pattern1);
    if (matches1) {
      fixed = fixed.replace(pattern1, "} catch ($1) {");
      fixCount += matches1.length;
    }

    // Pattern 2: } catch (error: any): any {
    const pattern2 = /} catch \(([^)]+): any\): any \{/g;
    const matches2 = fixed.match(pattern2);
    if (matches2) {
      fixed = fixed.replace(pattern2, "} catch ($1: any) {");
      fixCount += matches2.length;
    }

    // Pattern 3: catch (error): any {
    const pattern3 = /catch \(([^)]+)\): any \{/g;
    const matches3 = fixed.match(pattern3);
    if (matches3) {
      fixed = fixed.replace(pattern3, "catch ($1) {");
      fixCount += matches3.length;
    }

    // Pattern 4: catch (error: any): any {
    const pattern4 = /catch \(([^)]+): any\): any \{/g;
    const matches4 = fixed.match(pattern4);
    if (matches4) {
      fixed = fixed.replace(pattern4, "catch ($1: any) {");
      fixCount += matches4.length;
    }

    if (fixCount > 0) {
      fs.writeFileSync(filePath, fixed);
    }

    return fixCount;
  }

  async getFilesWithTS1005Errors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | cut -d"(" -f1 | sort -u',
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

  async getTS1005ErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1005" || echo "0"',
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
}

// Execute the fixer
if (require.main === module) {
  const fixer = new MalformedCatchBlockFixer();
  fixer.run().catch(console.error);
}

module.exports = MalformedCatchBlockFixer;
