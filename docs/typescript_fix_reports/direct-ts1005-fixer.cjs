#!/usr/bin/env node

/**
 * Direct TS1005 Fixer - Phase 4
 * Target specific high-error files directly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DirectTS1005Fixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedErrors = 0;
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  getTS1005Count() {
    try {
      const result = execSync('yarn tsc --noEmit 2>&1 | grep -c "TS1005" || echo "0"', {
        encoding: 'utf8'
      });
      return parseInt(result.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) return 0;

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixCount = 0;

      // Fix 1: Object type definitions with semicolons after opening brace
      // ServiceResponseType<{; -> ServiceResponseType<{
      const afterBraceMatches = content.match(/<\{\s*;/g);
      if (afterBraceMatches) {
        content = content.replace(/<\{\s*;/g, '<{');
        fixCount += afterBraceMatches.length;
      }

      // Fix 2: Comment lines ending with semicolons
      // // comment; -> // comment
      const commentSemicolonMatches = content.match(/\/\/[^;]*;$/gm);
      if (commentSemicolonMatches) {
        content = content.replace(/(\/\/[^;]*);$/gm, '$1');
        fixCount += commentSemicolonMatches.length;
      }

      // Fix 3: Object property semicolons to commas
      // property: type; -> property: type,
      const propertySemicolonMatches = content.match(/:\s*[^;,{}]+;(?=\s*[a-zA-Z_$}])/g);
      if (propertySemicolonMatches) {
        content = content.replace(/(:\s*[^;,{}]+);(?=\s*[a-zA-Z_$}])/g, '$1,');
        fixCount += propertySemicolonMatches.length;
      }

      // Fix 4: Interface/type property endings
      // prop: Type; } -> prop: Type }
      const beforeCloseBraceMatches = content.match(/:\s*[^;,{}]+;\s*}/g);
      if (beforeCloseBraceMatches) {
        content = content.replace(/(:\s*[^;,{}]+);\s*}/g, '$1\n}');
        fixCount += beforeCloseBraceMatches.length;
      }

      // Fix 5: Array type semicolons
      // Type[]; -> Type[]
      const arrayTypeSemicolonMatches = content.match(/\[\]\s*;(?=\s*[,})])/g);
      if (arrayTypeSemicolonMatches) {
        content = content.replace(/(\[\])\s*;(?=\s*[,})])/g, '$1');
        fixCount += arrayTypeSemicolonMatches.length;
      }

      // Fix 6: JSX attribute semicolons
      // prop={value;} -> prop={value}
      const jsxSemicolonMatches = content.match(/=\{[^}]*;\}/g);
      if (jsxSemicolonMatches) {
        content = content.replace(/=\{([^}]*);(\})/g, '={$1$2');
        fixCount += jsxSemicolonMatches.length;
      }

      // Fix 7: Function parameter trailing semicolons
      // (param: type;) -> (param: type)
      const paramSemicolonMatches = content.match(/:\s*[^;,()]+;\s*\)/g);
      if (paramSemicolonMatches) {
        content = content.replace(/(:\s*[^;,()]+);\s*\)/g, '$1)');
        fixCount += paramSemicolonMatches.length;
      }

      // Fix 8: Export type semicolons
      // export type Name = Type;; -> export type Name = Type;
      const doubleSeimcolonMatches = content.match(/;;\s*$/gm);
      if (doubleSeimcolonMatches) {
        content = content.replace(/;;\s*$/gm, ';');
        fixCount += doubleSeimcolonMatches.length;
      }

      if (fixCount > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles++;
        this.fixedErrors += fixCount;
        this.log(`Fixed ${fixCount} TS1005 errors in ${path.basename(filePath)}`);
        return fixCount;
      }

      return 0;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  async execute() {
    this.log('Starting Direct TS1005 Fixing - Phase 4');

    const initialErrors = this.getTS1005Count();
    this.log(`Initial TS1005 errors: ${initialErrors}`);

    // Target high-error files first
    const highErrorFiles = [
      'src/types/apiResponses.ts',
      'src/types/ingredients.ts',
      'src/types/advancedIntelligence.ts',
      'src/types/items.ts',
      'src/types/recipe.ts',
      'src/types/enterpriseIntelligence.ts',
      'src/types/mlIntelligence.ts',
      'src/types/zodiacAffinity.ts'
    ];

    this.log(`Targeting ${highErrorFiles.length} high-error files`);

    for (const file of highErrorFiles) {
      if (fs.existsSync(file)) {
        this.fixFile(file);
      }
    }

    // Check for additional type files
    const additionalTypeFiles = execSync('find src/types -name "*.ts" | head -20', {
      encoding: 'utf8'
    }).split('\n').filter(f => f.trim());

    for (const file of additionalTypeFiles) {
      if (file.trim() && !highErrorFiles.includes(file.trim())) {
        this.fixFile(file.trim());
      }
    }

    const finalErrors = this.getTS1005Count();
    const reduction = initialErrors - finalErrors;
    const reductionPercent = initialErrors > 0 ? ((reduction / initialErrors) * 100).toFixed(1) : 0;

    this.log('\n=== Phase 4 Direct TS1005 Fixing Results ===');
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
      filesProcessed: this.processedFiles
    };
  }
}

if (require.main === module) {
  const fixer = new DirectTS1005Fixer();
  fixer.execute()
    .then(results => {
      if (results.reduction > 0) {
        console.log(`\n🎉 Success! Reduced ${results.reduction} TS1005 errors (${results.reductionPercent}%)`);
      } else {
        console.log('\n📊 Analysis complete');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ TS1005 fixing failed:', error.message);
      process.exit(1);
    });
}