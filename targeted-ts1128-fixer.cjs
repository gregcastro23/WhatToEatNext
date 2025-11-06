#!/usr/bin/env node

/**
 * Targeted TS1128 Fixer - Phase 4
 * Focus on specific high-error files with TS1128 declaration errors
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TargetedTS1128Fixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedErrors = 0;
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  getTS1128Count() {
    try {
      const result = execSync(
        'yarn tsc --noEmit 2>&1 | grep -c "TS1128" || echo "0"',
        {
          encoding: "utf8",
        },
      );
      return parseInt(result.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  fixTS1128File(filePath) {
    try {
      if (!fs.existsSync(filePath)) return 0;

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixCount = 0;

      // Fix 1: Array literal with semicolon after opening bracket
      // = [; -> = [
      const arrayLiteralMatches = content.match(/=\s*\[\s*;/g);
      if (arrayLiteralMatches) {
        content = content.replace(/=\s*\[\s*;/g, "= [");
        fixCount += arrayLiteralMatches.length;
      }

      // Fix 2: Object literal with semicolon after opening brace
      // = {; -> = {
      const objectLiteralMatches = content.match(/=\s*\{\s*;/g);
      if (objectLiteralMatches) {
        content = content.replace(/=\s*\{\s*;/g, "= {");
        fixCount += objectLiteralMatches.length;
      }

      // Fix 3: Function call with semicolon after opening parenthesis
      // func(; -> func(
      const funcCallMatches = content.match(/\w+\(\s*;/g);
      if (funcCallMatches) {
        content = content.replace(/(\w+\()\s*;/g, "$1");
        fixCount += funcCallMatches.length;
      }

      // Fix 4: Declaration statement ending with extra semicolon
      // statement;; -> statement;
      const doubleColonMatches = content.match(/[^;];\s*;/g);
      if (doubleColonMatches) {
        content = content.replace(/([^;]);\s*;/g, "$1;");
        fixCount += doubleColonMatches.length;
      }

      // Fix 5: Template literal with semicolon
      // `template;` -> `template`
      const templateSemicolonMatches = content.match(/`[^`]*;`/g);
      if (templateSemicolonMatches) {
        content = content.replace(/(`[^`]*);(`)/g, "$1$2");
        fixCount += templateSemicolonMatches.length;
      }

      // Fix 6: Type annotation with semicolon
      // : Type; -> : Type
      const typeAnnotationMatches = content.match(
        /:\s*[A-Z][a-zA-Z0-9]*\s*;(?=\s*[,})\]])/g,
      );
      if (typeAnnotationMatches) {
        content = content.replace(
          /(:\s*[A-Z][a-zA-Z0-9]*)\s*;(?=\s*[,})\]])/g,
          "$1",
        );
        fixCount += typeAnnotationMatches.length;
      }

      // Fix 7: Import/export statement with semicolon in wrong place
      // import {; name } -> import { name }
      const importSemicolonMatches = content.match(/import\s*\{\s*;/g);
      if (importSemicolonMatches) {
        content = content.replace(/import\s*\{\s*;/g, "import {");
        fixCount += importSemicolonMatches.length;
      }

      // Fix 8: Generic type with semicolon
      // <Type;> -> <Type>
      const genericSemicolonMatches = content.match(/<[A-Z][a-zA-Z0-9]*\s*;>/g);
      if (genericSemicolonMatches) {
        content = content.replace(/(<[A-Z][a-zA-Z0-9]*)\s*;>/g, "$1>");
        fixCount += genericSemicolonMatches.length;
      }

      if (fixCount > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles++;
        this.fixedErrors += fixCount;
        this.log(
          `Fixed ${fixCount} TS1128 errors in ${path.basename(filePath)}`,
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
    this.log("Starting Targeted TS1128 Fixing - Phase 4");

    const initialErrors = this.getTS1128Count();
    this.log(`Initial TS1128 errors: ${initialErrors}`);

    // Target high-error files
    const highErrorFiles = [
      "src/types/advancedIntelligence.ts",
      "src/types/ingredients.ts",
      "src/types/alchemy.ts",
      "src/constants/planets.ts",
      "src/middleware.ts",
    ];

    this.log(`Targeting ${highErrorFiles.length} high-error files`);

    for (const file of highErrorFiles) {
      if (fs.existsSync(file)) {
        this.fixTS1128File(file);
      }
    }

    // Process additional TypeScript files
    const additionalFiles = execSync(
      'find src -name "*.ts" -o -name "*.tsx" | head -30',
      {
        encoding: "utf8",
      },
    )
      .split("\n")
      .filter((f) => f.trim());

    for (const file of additionalFiles) {
      if (file.trim() && !highErrorFiles.includes(file.trim())) {
        this.fixTS1128File(file.trim());
      }
    }

    const finalErrors = this.getTS1128Count();
    const reduction = initialErrors - finalErrors;
    const reductionPercent =
      initialErrors > 0 ? ((reduction / initialErrors) * 100).toFixed(1) : 0;

    this.log("\n=== Phase 4 Targeted TS1128 Fixing Results ===");
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
  const fixer = new TargetedTS1128Fixer();
  fixer
    .execute()
    .then((results) => {
      if (results.reduction > 0) {
        console.log(
          `\n🎉 Success! Reduced ${results.reduction} TS1128 errors (${results.reductionPercent}%)`,
        );
      } else {
        console.log("\n📊 Analysis complete");
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ TS1128 fixing failed:", error.message);
      process.exit(1);
    });
}
