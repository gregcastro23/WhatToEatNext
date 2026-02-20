#!/usr/bin/env node

/**
 * Fix Incomplete Objects
 * Specifically targets incomplete object declarations in test files
 */

const fs = require('fs');
const { execSync } = require('child_process');

class IncompleteObjectFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.dryRun = process.argv.includes('--dry-run') || !process.argv.includes('--live');
    this.verbose = process.argv.includes('--verbose');
    this.maxFiles = this.getMaxFiles();
  }

  getMaxFiles() {
    const maxIndex = process.argv.indexOf('--max-files');
    if (maxIndex !== -1 && process.argv[maxIndex + 1]) {
      return parseInt(process.argv[maxIndex + 1]) || 5;
    }
    return 5;
  }

  async run() {
    console.log(`🎯 Incomplete Object Fixer ${this.dryRun ? '(DRY RUN)' : '(LIVE)'}`);
    console.log(`📊 Processing up to ${this.maxFiles} files`);
    console.log('='.repeat(60));

    try {
      // Get initial error count
      const initialErrors = await this.getTS1128ErrorCount();
      console.log(`📊 Initial TS1128 errors: ${initialErrors}`);

      // Get problematic files
      const allFiles = await this.getProblematicFiles();
      const files = allFiles.slice(0, this.maxFiles);
      console.log(`🔍 Found ${allFiles.length} files with issues, processing ${files.length}`);

      if (files.length === 0) {
        console.log('⚠️  No files found to process');
        return;
      }

      // Process each file
      for (const filePath of files) {
        await this.processFile(filePath);
      }

      // Final results
      let finalErrors = initialErrors;
      if (!this.dryRun) {
        finalErrors = await this.getTS1128ErrorCount();
      }

      const reduction = initialErrors - finalErrors;

      console.log('\n' + '='.repeat(60));
      console.log('📈 Results:');
      console.log(`   Initial TS1128 errors: ${initialErrors}`);
      console.log(`   Final TS1128 errors: ${finalErrors}`);
      console.log(`   Errors reduced: ${reduction}`);
      console.log(`   Files processed: ${this.processedFiles.length}`);
      console.log(`   Total fixes applied: ${this.totalFixes}`);

      if (this.dryRun) {
        console.log('\n🔍 This was a dry run. Use --live to apply changes.');
        console.log('💡 Tip: Use --verbose for detailed output');
      } else {
        console.log('\n✅ Changes applied successfully!');
      }

    } catch (error) {
      console.error('❌ Fix failed:', error.message);
      process.exit(1);
    }
  }

  async getTS1128ErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1128"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return error.status === 1 ? 0 : -1;
    }
  }

  async getProblematicFiles() {
    try {
      // Get files with TS1128 errors
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1128" | cut -d"(" -f1 | sort -u | head -10', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return output.trim().split('\n').filter(line => line.trim() && line.includes('.ts'));
    } catch (error) {
      console.error('❌ Error finding problematic files:', error.message);
      return [];
    }
  }

  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        if (this.verbose) {
          console.log(`⚠️  File not found: ${filePath}`);
        }
        return 0;
      }

      console.log(`🔧 Processing ${filePath}`);

      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: Incomplete object declarations with missing closing braces
      // Pattern: { name: 'value',\n  property: {\n    nested: value,\n  },\n};\n
      const incompleteObjectPattern = /(\{\s*[^}]*,\s*\n\s*[^}]*:\s*\{\s*\n\s*[^}]*,\s*\n\s*\},?\s*\n)(\s*const\s+\w+)/g;
      let matches = content.match(incompleteObjectPattern);
      if (matches) {
        content = content.replace(incompleteObjectPattern, '$1};\n$2');
        fixesApplied += matches.length;
        if (this.verbose) {
          console.log(`   ✓ Fixed incomplete object declarations: ${matches.length}`);
        }
      }

      // Fix 2: Objects missing closing brace before next declaration
      const missingBracePattern = /(\{\s*[^}]*,\s*\n\s*[^}]*:\s*[^,}\n]+,?\s*\n)(\s*\w+\s*:\s*[^,}\n]+,?\s*\n)(\s*\};?\s*\n\s*(?:const|function|test|describe))/g;
      matches = content.match(missingBracePattern);
      if (matches) {
        content = content.replace(missingBracePattern, '$1$2};\n\n$3');
        fixesApplied += matches.length;
        if (this.verbose) {
          console.log(`   ✓ Fixed missing closing braces: ${matches.length}`);
        }
      }

      // Fix 3: Simple incomplete objects at end of declarations
      const simpleIncompletePattern = /(\{\s*[^}]*,\s*\n\s*[^}]*:\s*[^,}\n]+,?\s*\n)(\s*\};?\s*\n)/g;
      matches = content.match(simpleIncompletePattern);
      if (matches) {
        content = content.replace(simpleIncompletePattern, '$1};\n');
        fixesApplied += matches.length;
        if (this.verbose) {
          console.log(`   ✓ Fixed simple incomplete objects: ${matches.length}`);
        }
      }

      if (fixesApplied > 0) {
        if (this.dryRun) {
          console.log(`   📝 Would apply ${fixesApplied} fixes (DRY RUN)`);
        } else {
          // Create backup
          const backupPath = `${filePath}.backup`;
          fs.writeFileSync(backupPath, originalContent, 'utf8');

          // Write modified content
          fs.writeFileSync(filePath, content);
          console.log(`   ✅ Applied ${fixesApplied} fixes`);

          if (this.verbose) {
            console.log(`   💾 Backup created: ${backupPath}`);
          }
        }

        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
      } else {
        console.log(`   - No fixes needed`);
      }

      return fixesApplied;

    } catch (error) {
      console.log(`   ❌ Error processing file: ${error.message}`);
      return 0;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new IncompleteObjectFixer();
  fixer.run().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = IncompleteObjectFixer;
