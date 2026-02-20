#!/usr/bin/env node

/**
 * Fix stray semicolons in object/array literals
 * Targets patterns like:
 * - const obj: any = {; -> const obj: any = {
 * - const arr: any = [; -> const arr: any = [
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class StraySemicolonFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.dryRun = process.argv.includes('--dry-run');
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixes = 0;

      // Pattern 1: Fix stray semicolons after opening curly braces
      // const obj: any = {; -> const obj: any = {
      content = content.replace(
        /(\{\s*);/g,
        (match, p1) => {
          fixes++;
          return p1;
        }
      );

      // Pattern 2: Fix stray semicolons after opening square brackets
      // const arr: any = [; -> const arr: any = [
      content = content.replace(
        /(\[\s*);/g,
        (match, p1) => {
          fixes++;
          return p1;
        }
      );

      // Pattern 3: Fix malformed forEach with stray semicolons
      // (planetOrder || []).forEach(planet => {; -> (planetOrder || []).forEach(planet => {
      content = content.replace(
        /(\.forEach\s*\([^)]+\)\s*=>\s*\{\s*);/g,
        (match, p1) => {
          fixes++;
          return p1;
        }
      );

      // Pattern 4: Fix stray semicolons in function parameters
      // function(param;) -> function(param)
      content = content.replace(
        /(\([^)]*);(\s*\))/g,
        (match, p1, p2) => {
          fixes++;
          return p1 + p2;
        }
      );

      // Pattern 5: Fix malformed date constructor
      // new Date('2024-06-21T12: 0, 0:00Z') -> new Date('2024-06-21T12:00:00Z')
      content = content.replace(
        /new Date\('([^']*T\d{2}): (\d), (\d):(\d{2}Z)'\)/g,
        (match, p1, p2, p3, p4) => {
          fixes++;
          return `new Date('${p1}:${p2}${p3}:${p4}')`;
        }
      );

      if (fixes > 0 && content !== originalContent) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
        this.fixedFiles.push(filePath);
        this.totalFixes += fixes;
        console.log(`  ✅ Fixed ${fixes} stray semicolons in ${path.basename(filePath)}`);
        return fixes;
      }
      return 0;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  getErrorCount() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });
      const matches = output.match(/error TS/g);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }

  async run() {
    console.log('🔧 Fixing Stray Semicolons...\n');
    if (this.dryRun) {
      console.log('📝 DRY RUN MODE - No files will be modified\n');
    }

    const initialErrors = this.getErrorCount();
    console.log(`📊 Initial TypeScript errors: ${initialErrors}`);

    // Find files with TS1005 errors
    let errorFiles = [];
    try {
      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8',
        maxBuffer: 50 * 1024 * 1024
      });

      const lines = tscOutput.split('\n');
      const ts1005Files = new Set();

      lines.forEach(line => {
        if (line.includes('TS1005')) {
          const match = line.match(/^([^(]+)\(/);
          if (match) {
            ts1005Files.add(match[1]);
          }
        }
      });

      errorFiles = Array.from(ts1005Files);
    } catch (error) {
      console.log('Could not get error files, processing all test files');
      errorFiles = execSync('find src -name "*.ts" -o -name "*.tsx" 2>/dev/null || true', {
        encoding: 'utf8'
      }).trim().split('\n').filter(f => f);
    }

    console.log(`\n🔍 Processing ${errorFiles.length} files with potential syntax errors...`);

    for (const file of errorFiles) {
      if (fs.existsSync(file)) {
        this.fixFile(file);
      }
    }

    const finalErrors = this.getErrorCount();

    console.log('\n' + '='.repeat(60));
    console.log('📈 Final Results:');
    console.log(`   Initial errors: ${initialErrors}`);
    console.log(`   Final errors: ${finalErrors}`);
    console.log(`   Errors fixed: ${initialErrors - finalErrors}`);
    console.log(`   Files processed: ${this.fixedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (this.dryRun) {
      console.log('\n⚠️  DRY RUN COMPLETE - Run without --dry-run to apply fixes');
    }
  }
}

const fixer = new StraySemicolonFixer();
fixer.run().catch(console.error);