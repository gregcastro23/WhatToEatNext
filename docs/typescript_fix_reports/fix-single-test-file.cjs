#!/usr/bin/env node

/**
 * Fix Single Test File - Targeted Approach
 * Fix specific patterns in astrologize-integration.test.ts
 */

const fs = require('fs');
const { execSync } = require('child_process');

class SingleTestFileFixer {
  constructor() {
    this.filePath = 'src/__tests__/astrologize-integration.test.ts';
  }

  /**
   * Get current TS1005 error count for this file
   */
  getFileErrorCount() {
    try {
      const result = execSync(`yarn tsc --noEmit --skipLibCheck ${this.filePath} 2>&1`, {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      });
      const errorCount = (result.match(/error TS1005/g) || []).length;
      return errorCount;
    } catch (error) {
      if (error.stdout) {
        const errorCount = (error.stdout.match(/error TS1005/g) || []).length;
        return errorCount;
      }
      return -1;
    }
  }

  /**
   * Validate build for this file
   */
  validateFile() {
    try {
      execSync(`yarn tsc --noEmit --skipLibCheck ${this.filePath} 2>/dev/null`, { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fix patterns in the file
   */
  fixPatterns(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: test('description': any, async () => {
    // Fix to: test('description', async () => {
    const testColonAnyPattern = /(\b(?:test|it|describe)\s*\(\s*'[^']+'):\s*any\s*,/g;
    const matches1 = [...fixedContent.matchAll(testColonAnyPattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(testColonAnyPattern, '$1,');
      fixes += matches1.length;
      console.log(`    Fixed ${matches1.length} test function signatures with ': any,'`);
    }

    // Pattern 2: } catch (error): any {
    // Fix to: } catch (error) {
    const catchColonAnyPattern = /(\}\s*catch\s*\([^)]+\)):\s*any\s*\{/g;
    const matches2 = [...fixedContent.matchAll(catchColonAnyPattern)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(catchColonAnyPattern, '$1 {');
      fixes += matches2.length;
      console.log(`    Fixed ${matches2.length} catch blocks with ': any'`);
    }

    // Pattern 3: ([_planet: any, position]: any) => {
    // Fix to: ([_planet, position]: any) => {
    const destructuringColonAnyPattern = /(\[\s*[^,\]]+):\s*any\s*,/g;
    const matches3 = [...fixedContent.matchAll(destructuringColonAnyPattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(destructuringColonAnyPattern, '$1,');
      fixes += matches3.length;
      console.log(`    Fixed ${matches3.length} destructuring parameters with ': any,'`);
    }

    return { content: fixedContent, fixes };
  }

  /**
   * Main repair process
   */
  async repair() {
    console.log('🎯 SINGLE TEST FILE FIXER');
    console.log('=' .repeat(40));
    console.log(`📁 Target file: ${this.filePath}`);

    if (!fs.existsSync(this.filePath)) {
      console.log('❌ File does not exist');
      return;
    }

    const startTime = Date.now();
    const initialErrors = this.getFileErrorCount();
    console.log(`📊 Initial TS1005 errors in file: ${initialErrors}`);

    // Create backup
    const backupPath = `${this.filePath}.backup-${Date.now()}`;
    const originalContent = fs.readFileSync(this.filePath, 'utf8');
    fs.writeFileSync(backupPath, originalContent);
    console.log(`💾 Backup created: ${backupPath}`);

    // Fix patterns
    const { content: fixedContent, fixes } = this.fixPatterns(originalContent);

    if (fixes > 0) {
      fs.writeFileSync(this.filePath, fixedContent, 'utf8');
      console.log(`✅ Applied ${fixes} fixes`);
    } else {
      console.log('ℹ️  No patterns found to fix');
    }

    // Validate
    console.log('🔍 Validating file...');
    const fileValid = this.validateFile();
    const finalErrors = this.getFileErrorCount();

    // Results
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n🏁 SINGLE FILE FIXING COMPLETED');
    console.log('=' .repeat(40));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`🎯 Fixes applied: ${fixes}`);
    console.log(`📊 TS1005 errors: ${initialErrors} → ${finalErrors}`);
    console.log(`🔍 File valid: ${fileValid ? '✅' : '❌'}`);

    if (finalErrors < initialErrors && fileValid) {
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);
      console.log(`✅ SUCCESS: Reduced by ${reduction} errors (${percentage}%) with valid file`);
    } else if (finalErrors < initialErrors) {
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);
      console.log(`⚠️ PARTIAL SUCCESS: Reduced by ${reduction} errors (${percentage}%) but file issues remain`);
    } else if (finalErrors === initialErrors && fileValid) {
      console.log(`ℹ️  No change in error count but file remains valid`);
    } else {
      console.log(`❌ Issues detected - restoring from backup`);
      fs.writeFileSync(this.filePath, originalContent);
    }

    console.log(`💾 Backup available at: ${backupPath}`);

    return {
      initialErrors,
      finalErrors,
      fixesApplied: fixes,
      duration: parseFloat(duration),
      fileValid: fileValid
    };
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new SingleTestFileFixer();
  fixer.repair()
    .then(results => {
      console.log('\n📋 Single test file fixing completed');
      if (results.fileValid && results.finalErrors < results.initialErrors) {
        console.log('✅ Success - ready to apply to more files');
        process.exit(0);
      } else {
        console.log('⚠️ Manual review needed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Single test file fixing failed:', error);
      process.exit(1);
    });
}

module.exports = SingleTestFileFixer;
