#!/usr/bin/env node

/**
 * Fix Test Colon Any Pattern
 * Specifically targets: test('description': any, async () => {
 * Should be: test('description', async () => {
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestColonAnyFixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedPatterns = 0;
    this.backupDir = `.test-colon-any-backup-${Date.now()}`;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get files with the specific pattern
   */
  getFilesWithColonAnyPattern() {
    try {
      // Search for files containing the specific pattern
      const output = execSync('grep -r -l "\': any," src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const files = output.trim().split('\n').filter(line => line.trim() && fs.existsSync(line));
      return files;
    } catch (error) {
      return [];
    }
  }

  /**
   * Create backup of file
   */
  createBackup(filePath) {
    const backupPath = path.join(this.backupDir, filePath.replace(/[\/\\]/g, '_'));
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, content, 'utf8');
  }

  /**
   * Fix the colon any pattern
   */
  fixColonAnyPattern(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern: test('description': any, async () => {
    // Fix to: test('description', async () => {
    const testColonAnyPattern = /(\b(?:test|it|describe|beforeEach|afterEach|beforeAll|afterAll)\s*\(\s*'[^']+'):\s*any\s*,/g;
    const matches = [...fixedContent.matchAll(testColonAnyPattern)];

    if (matches.length > 0) {
      fixedContent = fixedContent.replace(testColonAnyPattern, '$1,');
      fixes += matches.length;
      console.log(`    Fixed ${matches.length} test function signatures with ': any,'`);
    }

    return { content: fixedContent, fixes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');

      console.log(`  Processing: ${filePath}`);

      // Create backup
      this.createBackup(filePath);

      // Fix patterns
      const { content: fixedContent, fixes } = this.fixColonAnyPattern(originalContent);

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`    ✅ Applied ${fixes} fixes`);
        this.fixedPatterns += fixes;
        this.processedFiles++;
        return true;
      } else {
        console.log(`    ℹ️  No colon any patterns found`);
        return false;
      }

    } catch (error) {
      console.error(`    ❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Get current TS1005 error count
   */
  getTS1005ErrorCount() {
    try {
      const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
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
   * Validate build
   */
  validateBuild() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck 2>/dev/null', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Main repair process
   */
  async repair() {
    console.log('🎯 TEST COLON ANY PATTERN FIXER');
    console.log('=' .repeat(40));

    const startTime = Date.now();
    const initialErrors = this.getTS1005ErrorCount();
    console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

    // Get files with the colon any pattern
    const files = this.getFilesWithColonAnyPattern();
    console.log(`📁 Found ${files.length} files with ': any,' pattern`);

    if (files.length === 0) {
      console.log('✅ No files with colon any pattern found!');
      return;
    }

    let modifiedFiles = 0;

    // Process files one by one with validation
    console.log(`\n🔄 Processing ${files.length} files...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (this.processFile(file)) {
        modifiedFiles++;
      }

      // Validate build after each file
      console.log(`  🔍 Build validation after file ${i + 1}/${files.length}`);
      const buildValid = this.validateBuild();
      if (!buildValid) {
        console.log('⚠️ Build validation failed, stopping for safety');
        break;
      }
    }

    // Final validation
    console.log('\n🔍 Final build validation...');
    const finalBuildValid = this.validateBuild();

    // Final results
    const endTime = Date.now();
    const finalErrors = this.getTS1005ErrorCount();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n🏁 COLON ANY PATTERN FIXING COMPLETED');
    console.log('=' .repeat(40));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📝 Files processed: ${modifiedFiles}`);
    console.log(`🎯 Total fixes applied: ${this.fixedPatterns}`);
    console.log(`📊 TS1005 errors: ${initialErrors} → ${finalErrors}`);
    console.log(`🔍 Final build valid: ${finalBuildValid ? '✅' : '❌'}`);

    if (finalErrors < initialErrors && finalBuildValid) {
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);
      console.log(`✅ SUCCESS: Reduced by ${reduction} errors (${percentage}%) with valid build`);
    } else if (finalErrors < initialErrors) {
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);
      console.log(`⚠️ PARTIAL SUCCESS: Reduced by ${reduction} errors (${percentage}%) but build issues remain`);
    } else if (finalErrors === initialErrors && finalBuildValid) {
      console.log(`ℹ️  No change in error count but build remains valid`);
    } else {
      console.log(`❌ Issues detected - may need to rollback changes`);
    }

    console.log(`💾 Backups saved in: ${this.backupDir}`);

    return {
      initialErrors,
      finalErrors,
      filesModified: modifiedFiles,
      fixesApplied: this.fixedPatterns,
      duration: parseFloat(duration),
      buildValid: finalBuildValid
    };
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new TestColonAnyFixer();
  fixer.repair()
    .then(results => {
      console.log('\n📋 Test colon any pattern fixing completed');
      if (results.buildValid && results.finalErrors < results.initialErrors) {
        console.log('✅ Ready to proceed with next phase');
        process.exit(0);
      } else {
        console.log('⚠️ Manual review may be needed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Test colon any pattern fixing failed:', error);
      process.exit(1);
    });
}

module.exports = TestColonAnyFixer;
