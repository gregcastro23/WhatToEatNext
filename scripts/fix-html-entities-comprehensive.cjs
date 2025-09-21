#!/usr/bin/env node

/**
 * Comprehensive HTML Entity Fix Script
 *
 * Fixes HTML entities in JSX that cause parsing errors:
 * - &lt; → <
 * - &gt; → >
 * - &apos; → '
 * - &quot; → "
 * - &amp; → &
 * - &rbrace; → }
 * - &lbrace; → {
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class HTMLEntityFixer {
  constructor() {
    this.fixedFiles = [];
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  findFilesWithEntities() {
    this.log('🔍 Finding files with HTML entities...');

    const extensions = ['.tsx', '.jsx', '.ts', '.js'];
    const directories = ['src', 'pages', 'components'];

    const files = [];

    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        const findCommand = `find ${dir} -type f \\( ${extensions.map(ext => `-name "*${ext}"`).join(' -o ')} \\) -exec grep -l "&[a-zA-Z][a-zA-Z]*;" {} \\;`;

        try {
          const output = execSync(findCommand, { encoding: 'utf8', stdio: 'pipe' });
          const foundFiles = output
            .trim()
            .split('\n')
            .filter(f => f.length > 0);
          files.push(...foundFiles);
        } catch (error) {
          // No files found or grep error, continue
        }
      }
    }

    const uniqueFiles = [...new Set(files)];
    this.log(`Found ${uniqueFiles.length} files with HTML entities`);
    return uniqueFiles;
  }

  fixHTMLEntities(content, filePath) {
    let fixed = false;
    let newContent = content;

    const entityFixes = [
      { from: /&lt;/g, to: '<', name: '&lt;' },
      { from: /&gt;/g, to: '>', name: '&gt;' },
      { from: /&apos;/g, to: "'", name: '&apos;' },
      { from: /&quot;/g, to: '"', name: '&quot;' },
      { from: /&amp;/g, to: '&', name: '&amp;' },
      { from: /&rbrace;/g, to: '}', name: '&rbrace;' },
      { from: /&lbrace;/g, to: '{', name: '&lbrace;' },
      { from: /&#x27;/g, to: "'", name: '&#x27;' },
      { from: /&#39;/g, to: "'", name: '&#39;' },
      { from: /&nbsp;/g, to: ' ', name: '&nbsp;' },
    ];

    const appliedFixes = [];

    entityFixes.forEach(fix => {
      const matches = newContent.match(fix.from);
      if (matches) {
        newContent = newContent.replace(fix.from, fix.to);
        fixed = true;
        appliedFixes.push(`${fix.name} (${matches.length} occurrences)`);
      }
    });

    if (this.verbose && appliedFixes.length > 0) {
      this.log(`  Fixed in ${path.basename(filePath)}: ${appliedFixes.join(', ')}`);
    }

    return { content: newContent, fixed, appliedFixes };
  }

  async fixFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const result = this.fixHTMLEntities(originalContent, filePath);

      if (result.fixed) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, result.content, 'utf8');
        }

        this.fixedFiles.push({
          path: filePath,
          fixes: result.appliedFixes,
        });

        this.log(
          `${this.dryRun ? '[DRY RUN] ' : ''}Fixed HTML entities in ${path.basename(filePath)}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      return false;
    }
  }

  async validateFixes() {
    this.log('🔍 Validating fixes with TypeScript compiler...');

    try {
      const tscOutput = execSync('npx tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const parsingErrors = (tscOutput.match(/error TS(17008|1382|17002|1005|1003)/g) || []).length;
      const entityErrors = (tscOutput.match(/Did you mean.*&[a-z]+;/g) || []).length;

      this.log(
        `Validation: ${parsingErrors} parsing errors, ${entityErrors} entity-related errors`,
      );

      return { parsingErrors, entityErrors };
    } catch (error) {
      this.log(`Validation error: ${error.message}`, 'error');
      return { parsingErrors: -1, entityErrors: -1 };
    }
  }

  async run() {
    this.log('🚀 Starting Comprehensive HTML Entity Fix');
    this.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);

    // Find files with HTML entities
    const filesWithEntities = this.findFilesWithEntities();

    if (filesWithEntities.length === 0) {
      this.log('✅ No files with HTML entities found!');
      return;
    }

    // Fix each file
    this.log(`🔧 Processing ${filesWithEntities.length} files...`);
    let fixedCount = 0;

    for (const filePath of filesWithEntities) {
      const wasFixed = await this.fixFile(filePath);
      if (wasFixed) fixedCount++;
    }

    // Validate fixes
    const validation = await this.validateFixes();

    // Report results
    this.log('\\n📊 Fix Summary:');
    this.log(`   Files processed: ${filesWithEntities.length}`);
    this.log(`   Files fixed: ${fixedCount}`);

    if (validation.parsingErrors >= 0) {
      this.log(`   Remaining parsing errors: ${validation.parsingErrors}`);
      this.log(`   Remaining entity errors: ${validation.entityErrors}`);
    }

    if (this.fixedFiles.length > 0) {
      this.log('\\n✅ Fixed files:');
      this.fixedFiles.forEach(file => {
        this.log(`   ${file.path}`);
        if (this.verbose && file.fixes.length > 0) {
          file.fixes.forEach(fix => this.log(`     - ${fix}`));
        }
      });
    }

    this.log(`\\n${this.dryRun ? '🔍 DRY RUN COMPLETE' : '✅ HTML ENTITY FIX COMPLETE'}`);

    if (!this.dryRun && validation.entityErrors === 0) {
      this.log('🎉 All HTML entity parsing errors have been resolved!');
    }
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new HTMLEntityFixer();
  fixer.run().catch(error => {
    console.error('❌ Critical error:', error);
    process.exit(1);
  });
}

module.exports = HTMLEntityFixer;
