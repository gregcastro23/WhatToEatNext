#!/usr/bin/env node

/**
 * Fix Unclosed Template Literals
 *
 * This script specifically fixes unclosed template literals that cause syntax errors.
 * It identifies template expressions that are missing closing braces.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files with known unclosed template literals
const PROBLEMATIC_FILES = [
  'src/services/LocalRecipeService.ts',
  'src/services/PredictiveIntelligenceService.ts',
  'src/services/MLIntelligenceService.ts',
  'src/services/AdvancedAnalyticsIntelligenceService.ts',
  'src/calculations/enhancedAlchemicalMatching.ts',
  'src/hooks/useCurrentChart.ts',
  'src/services/UnusedVariableDetector.ts',
  'src/scripts/unintentional-any-elimination/UnintentionalAnyCampaignController.ts',
  'src/services/campaign/EnterpriseIntelligenceGenerator.ts',
  'src/services/campaign/ProgressReportingSystem.ts',
  'src/services/campaign/unintentional-any-elimination/ConservativeReplacementPilot.ts',
  'src/services/campaign/unintentional-any-elimination/PilotCampaignAnalysis.ts',
  'src/services/campaign/UnusedVariablesCleanupSystem.ts',
  'src/services/campaign/ConsoleStatementRemovalSystem.ts',
  'src/services/campaign/FinalValidationSystem.ts',
  'src/services/linting/ZeroErrorAchievementDashboard.ts',
  'src/services/linting/LintingValidationDashboard.ts'
];

class UnclosedTemplateLiteralFixer {
  constructor() {
    this.results = {
      totalFilesProcessed: 0,
      filesModified: 0,
      fixesByFile: {},
      errors: [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create backup of file before modification
   */
  createBackup(filePath) {
    try {
      const backupDir = '.unclosed-template-literal-backups';
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const backupPath = path.join(backupDir, path.basename(filePath) + '.backup');
      fs.copyFileSync(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.warn(`Warning: Could not create backup for ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Fix unclosed template literals in a file
   */
  fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return { modified: false, fixes: [] };
      }

      const originalContent = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = originalContent;
      const fixes = [];

      // Look for specific patterns of unclosed template literals
      const patterns = [
        {
          name: 'JSON.stringify in template literal',
          pattern: /(\$\{[^}]*JSON\.stringify\([^}]*)\n/g,
          fix: (match, p1) => {
            // Count open and close braces/parens
            const openBraces = (p1.match(/\{/g) || []).length;
            const closeBraces = (p1.match(/\}/g) || []).length;
            const openParens = (p1.match(/\(/g) || []).length;
            const closeParens = (p1.match(/\)/g) || []).length;

            let result = p1;

            // Add missing closing parentheses
            for (let i = 0; i < openParens - closeParens; i++) {
              result += ')';
            }

            // Add missing closing braces (but not the template literal brace)
            const missingBraces = openBraces - closeBraces - 1; // -1 for the template literal brace
            for (let i = 0; i < missingBraces; i++) {
              result += '}';
            }

            // Add the template literal closing brace
            result += '}\n';

            return result;
          }
        },
        {
          name: 'Multi-line template expression',
          pattern: /(\$\{[^}]*)\n([^}]*(?:\n[^}]*)*?)(?=\n\s*[^}])/g,
          fix: (match, p1, p2) => {
            // Check if this looks like an unclosed template expression
            if (p1.includes('JSON.stringify') || p1.includes('.map(') || p1.includes('?')) {
              // Count braces and parens to determine what's missing
              const fullMatch = p1 + '\n' + p2;
              const openBraces = (fullMatch.match(/\{/g) || []).length;
              const closeBraces = (fullMatch.match(/\}/g) || []).length;
              const openParens = (fullMatch.match(/\(/g) || []).length;
              const closeParens = (fullMatch.match(/\)/g) || []).length;

              let result = fullMatch;

              // Add missing closing parentheses
              for (let i = 0; i < openParens - closeParens; i++) {
                result += ')';
              }

              // Add missing closing braces (but not the template literal brace)
              const missingBraces = openBraces - closeBraces - 1; // -1 for the template literal brace
              for (let i = 0; i < missingBraces; i++) {
                result += '}';
              }

              // Add the template literal closing brace
              result += '}';

              return result;
            }
            return match;
          }
        }
      ];

      // Apply each pattern
      for (const pattern of patterns) {
        const matches = [...modifiedContent.matchAll(pattern.pattern)];
        if (matches.length > 0) {
          for (const match of matches) {
            const fixed = pattern.fix(match[0], ...match.slice(1));
            if (fixed !== match[0]) {
              modifiedContent = modifiedContent.replace(match[0], fixed);
              fixes.push({
                pattern: pattern.name,
                original: match[0].substring(0, 100) + '...',
                fixed: fixed.substring(0, 100) + '...'
              });
            }
          }
        }
      }

      // Manual fixes for specific known issues
      if (filePath.includes('LocalRecipeService.ts')) {
        modifiedContent = modifiedContent.replace(
          /\$\{JSON\.stringify\(\{\n\s+id: directCuisine\.id,\n\s+name: directCuisine\.name,/g,
          '${JSON.stringify({\n              id: directCuisine.id,\n              name: directCuisine.name,\n            })}'
        );
      }

      if (filePath.includes('PredictiveIntelligenceService.ts')) {
        modifiedContent = modifiedContent.replace(
          /\$\{JSON\.stringify\(\{\n\s+recipeId: \(recipeData as \{ id\?: string \}\)\?\.id,\n\s+ingredientCount: \(ingredientData as any\[\]\)\?\.length,/g,
          '${JSON.stringify({\n      recipeId: (recipeData as { id?: string })?.id,\n      ingredientCount: (ingredientData as any[])?.length,\n    })}'
        );
      }

      if (filePath.includes('MLIntelligenceService.ts')) {
        modifiedContent = modifiedContent.replace(
          /\$\{JSON\.stringify\(\{\n\s+recipeId: recipeData\.id,\n\s+ingredientCount: ingredientData\.length,/g,
          '${JSON.stringify({\n      recipeId: recipeData.id,\n      ingredientCount: ingredientData.length,\n    })}'
        );
      }

      if (filePath.includes('AdvancedAnalyticsIntelligenceService.ts')) {
        modifiedContent = modifiedContent.replace(
          /\$\{JSON\.stringify\(\{\n\s+recipeId: recipeData\.id,\n\s+ingredientCount: ingredientData\.length,/g,
          '${JSON.stringify({\n      recipeId: recipeData.id,\n      ingredientCount: ingredientData.length,\n    })}'
        );
      }

      // Check if file was modified
      if (modifiedContent !== originalContent) {
        // Create backup
        this.createBackup(filePath);

        // Write modified content
        fs.writeFileSync(filePath, modifiedContent, 'utf8');

        this.results.filesModified++;
        this.results.fixesByFile[filePath] = fixes;

        console.log(`✅ Fixed: ${filePath} (${fixes.length} fixes applied)`);
        return { modified: true, fixes };
      }

      this.results.totalFilesProcessed++;
      return { modified: false, fixes: [] };

    } catch (error) {
      const errorMsg = `Error processing file ${filePath}: ${error.message}`;
      console.warn(errorMsg);
      this.results.errors.push(errorMsg);
      return { modified: false, fixes: [], error: errorMsg };
    }
  }

  /**
   * Run the fixing process
   */
  async runFixes() {
    console.log('🔧 Starting Unclosed Template Literal Fixes...');
    console.log(`📊 Processing ${PROBLEMATIC_FILES.length} files`);

    for (const filePath of PROBLEMATIC_FILES) {
      const result = this.fixFile(filePath);
      this.results.totalFilesProcessed++;
    }

    // Generate summary
    this.generateSummary();

    // Validate TypeScript compilation
    const validation = await this.validateTypeScript();
    this.results.validation = validation;

    return this.results;
  }

  /**
   * Validate TypeScript compilation after fixes
   */
  async validateTypeScript() {
    try {
      console.log('\n🔧 Validating TypeScript compilation...');
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorCount = (output.match(/error TS/g) || []).length;
      console.log(`📊 TypeScript errors after fixes: ${errorCount}`);

      return { success: errorCount === 0, errorCount, output };
    } catch (error) {
      const errorCount = (error.stdout?.match(/error TS/g) || []).length;
      console.log(`📊 TypeScript errors after fixes: ${errorCount}`);

      return { success: false, errorCount, output: error.stdout || '' };
    }
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    console.log('\n📋 UNCLOSED TEMPLATE LITERAL FIX SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📊 Total files processed: ${this.results.totalFilesProcessed}`);
    console.log(`🔧 Files modified: ${this.results.filesModified}`);
    console.log(`✅ Files unchanged: ${this.results.totalFilesProcessed - this.results.filesModified}`);

    if (this.results.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.results.errors.length}`);
    }

    if (this.results.filesModified > 0) {
      console.log('\n🚨 Files Modified:');
      for (const [file, fixes] of Object.entries(this.results.fixesByFile)) {
        console.log(`  • ${file}: ${fixes.length} fixes`);
      }
    }
  }
}

// Main execution
async function main() {
  try {
    const fixer = new UnclosedTemplateLiteralFixer();
    const results = await fixer.runFixes();

    if (results.filesModified === 0) {
      console.log('\n✅ SUCCESS: No unclosed template literals found that need fixing!');
      process.exit(0);
    } else {
      console.log(`\n✅ SUCCESS: Fixed ${results.filesModified} files with unclosed template literals`);

      if (results.validation && results.validation.errorCount > 0) {
        console.log('⚠️  WARNING: TypeScript compilation still has errors');
        process.exit(1);
      } else {
        process.exit(0);
      }
    }

  } catch (error) {
    console.error('❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { UnclosedTemplateLiteralFixer };
