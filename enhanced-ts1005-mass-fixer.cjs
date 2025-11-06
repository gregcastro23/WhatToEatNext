#!/usr/bin/env node

/**
 * Enhanced TS1005 Mass Fixer - Phase 4
 * Target the 51,199 TS1005 errors systematically
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class EnhancedTS1005MassFixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedErrors = 0;
    this.batchSize = 10;
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  getTS1005Count() {
    try {
      const output = execSync(
        'yarn tsc --noEmit 2>&1 | grep -c "error TS1005"',
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

  getTS1005Files() {
    try {
      const output = execSync('yarn tsc --noEmit 2>&1 | grep "error TS1005"', {
        encoding: "utf8",
        stdio: "pipe",
      });

      const files = new Set();
      const lines = output.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        // Format: src/file.ts(line,col): error TS1005: message
        const match = line.match(/^([^(]+)\(/);
        if (match) {
          const filePath = match[1].trim();
          if (fs.existsSync(filePath)) {
            files.add(filePath);
          }
        }
      }

      return Array.from(files);
    } catch (error) {
      this.log(`Error getting TS1005 files: ${error.message}`);
      return [];
    }
  }

  fixTS1005File(filePath) {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixCount = 0;

      // Fix 1: Object literal extra semicolons
      // { prop: value; } -> { prop: value }
      const objectSemicolonMatches = content.match(
        /([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;{}]+)\s*;\s*([,}])/g,
      );
      if (objectSemicolonMatches) {
        content = content.replace(
          /([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;{}]+)\s*;\s*([,}])/g,
          "$1$2",
        );
        fixCount += objectSemicolonMatches.length;
      }

      // Fix 2: Function parameter type annotations with semicolons
      // (param: type;) -> (param: type)
      const paramSemicolonMatches = content.match(
        /([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;)]+)\s*;\s*([,)])/g,
      );
      if (paramSemicolonMatches) {
        content = content.replace(
          /([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;)]+)\s*;\s*([,)])/g,
          "$1$2",
        );
        fixCount += paramSemicolonMatches.length;
      }

      // Fix 3: Interface/type property semicolons to commas
      // interface { prop: type; } -> interface { prop: type, }
      const interfaceSemicolonMatches = content.match(
        /([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;{}]+)\s*;\s*([a-zA-Z_$])/g,
      );
      if (interfaceSemicolonMatches) {
        content = content.replace(
          /([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;{}]+)\s*;\s*([a-zA-Z_$])/g,
          "$1,\n  $2",
        );
        fixCount += interfaceSemicolonMatches.length;
      }

      // Fix 4: Arrow function return type annotations
      // (): ReturnType; => -> (): ReturnType =>
      const arrowReturnMatches = content.match(/\)\s*:\s*[^;=>\s]+\s*;\s*=>/g);
      if (arrowReturnMatches) {
        content = content.replace(/(\)\s*:\s*[^;=>\s]+)\s*;\s*=>/g, "$1 =>");
        fixCount += arrowReturnMatches.length;
      }

      // Fix 5: JSX attribute semicolons
      // <Component prop={value;} /> -> <Component prop={value} />
      const jsxSemicolonMatches = content.match(/=\{[^}]*;\}/g);
      if (jsxSemicolonMatches) {
        content = content.replace(/=\{([^}]*);(\})/g, "={$1$2");
        fixCount += jsxSemicolonMatches.length;
      }

      // Fix 6: Array/object destructuring semicolons
      // const { prop; } = obj -> const { prop } = obj
      const destructuringSemicolonMatches = content.match(
        /const\s*{\s*[^}]*;\s*}/g,
      );
      if (destructuringSemicolonMatches) {
        content = content.replace(/(const\s*{\s*[^}]*);(\s*})/g, "$1$2");
        fixCount += destructuringSemicolonMatches.length;
      }

      // Fix 7: Trailing commas that should be semicolons
      // statement, -> statement;
      const trailingCommaMatches = content.match(/^[^/\n]*[^,\s],\s*$/gm);
      if (trailingCommaMatches) {
        content = content.replace(/^([^/\n]*[^,\s]),\s*$/gm, "$1;");
        fixCount += trailingCommaMatches.length;
      }

      // Fix 8: Incomplete JSX closing tags
      // <div> content </div -> <div> content </div>
      const incompleteJSXMatches = content.match(
        /<\/[a-zA-Z][a-zA-Z0-9]*(?![>])/g,
      );
      if (incompleteJSXMatches) {
        content = content.replace(/<\/([a-zA-Z][a-zA-Z0-9]*)(?![>])/g, "</$1>");
        fixCount += incompleteJSXMatches.length;
      }

      if (fixCount > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles++;
        this.fixedErrors += fixCount;
        this.log(
          `Fixed ${fixCount} TS1005 errors in ${path.basename(filePath)}`,
        );
        return fixCount;
      }

      return 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  async execute() {
    this.log("Starting Enhanced TS1005 Mass Fixing - Phase 4");

    const initialErrors = this.getTS1005Count();
    this.log(`Initial TS1005 errors: ${initialErrors}`);

    if (initialErrors === 0) {
      this.log("No TS1005 errors found!");
      return;
    }

    const files = this.getTS1005Files();
    this.log(`Found ${files.length} files with TS1005 errors`);

    // Process files in batches
    for (let i = 0; i < files.length; i += this.batchSize) {
      const batch = files.slice(i, i + this.batchSize);
      this.log(
        `Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(files.length / this.batchSize)}`,
      );

      let batchFixes = 0;
      for (const file of batch) {
        batchFixes += this.fixTS1005File(file);
      }

      this.log(`Batch completed: ${batchFixes} fixes applied`);

      // Check progress
      const currentErrors = this.getTS1005Count();
      this.log(`Current TS1005 errors: ${currentErrors}`);

      // Safety check - stop if errors increase significantly
      if (currentErrors > initialErrors + 100) {
        this.log("Error count increased significantly, stopping");
        break;
      }
    }

    const finalErrors = this.getTS1005Count();
    const reduction = initialErrors - finalErrors;
    const reductionPercent =
      initialErrors > 0 ? ((reduction / initialErrors) * 100).toFixed(1) : 0;

    this.log("\n=== Phase 4 TS1005 Mass Fixing Results ===");
    this.log(`Initial errors: ${initialErrors}`);
    this.log(`Final errors: ${finalErrors}`);
    this.log(`Errors reduced: ${reduction}`);
    this.log(`Reduction percentage: ${reductionPercent}%`);
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Total fixes applied: ${this.fixedErrors}`);

    return {
      initialErrors,
      finalErrors,
      reduction,
      reductionPercent: parseFloat(reductionPercent),
      filesProcessed: this.processedFiles,
    };
  }
}

if (require.main === module) {
  const fixer = new EnhancedTS1005MassFixer();
  fixer
    .execute()
    .then((results) => {
      if (results.reduction > 0) {
        console.log(
          `\n🎉 Success! Reduced ${results.reduction} TS1005 errors (${results.reductionPercent}%)`,
        );
      } else {
        console.log("\n📊 Analysis complete - Consider alternative strategies");
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ TS1005 fixing failed:", error.message);
      process.exit(1);
    });
}
