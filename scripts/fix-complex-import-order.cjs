#!/usr/bin/env node

/**
 * Complex Import Order Fix Script
 *
 * Handles the remaining complex import order issues with more sophisticated logic
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ComplexImportOrderFixer {
  constructor() {
    this.backupDir = '.complex-import-backups';
    this.fixedFiles = new Set();
    this.fixes = [];
    this.batchSize = 5; // Process in small batches for safety
  }

  async run() {
    console.log('🔧 Starting Complex Import Order Fix...\n');

    try {
      await this.createBackups();
      await this.getComplexFiles();
      await this.processComplexFiles();
      await this.validateFixes();
      await this.generateReport();

      console.log('✅ Complex Import Order Fix Complete!');

    } catch (error) {
      console.error('❌ Fix failed:', error.message);
      await this.rollback();
      process.exit(1);
    }
  }

  async createBackups() {
    console.log('💾 Creating backups...');

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    try {
      execSync('git add -A && git stash push -m "complex-import-order-fix-backup"', {
        stdio: 'pipe'
      });
      console.log('   Git stash backup created');
    } catch (error) {
      console.log('   Git stash failed, continuing with file backups only');
    }
  }

  async getComplexFiles() {
    console.log('📊 Identifying complex files with import order issues...');

    try {
      // Get current import order violations
      const output = execSync('yarn lint --format=compact 2>&1 | grep "import/order"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const lines = output.split('\n').filter(line => line.trim());
      const fileSet = new Set();

      lines.forEach(line => {
        const match = line.match(/^(.+?):\s*line/);
        if (match) {
          fileSet.add(match[1]);
        }
      });

      this.complexFiles = Array.from(fileSet);
      console.log(`   Found ${this.complexFiles.length} files with import order issues`);

    } catch (error) {
      console.log('   No import order issues found');
      this.complexFiles = [];
    }
  }

  async processComplexFiles() {
    console.log('\n🔧 Processing complex files in batches...');

    if (this.complexFiles.length === 0) {
      console.log('   No files to process');
      return;
    }

    // Process files in batches
    for (let i = 0; i < this.complexFiles.length; i += this.batchSize) {
      const batch = this.complexFiles.slice(i, i + this.batchSize);
      console.log(`\n   Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(this.complexFiles.length / this.batchSize)} (${batch.length} files)...`);

      for (const file of batch) {
        if (fs.existsSync(file)) {
          const success = await this.fixComplexFile(file);
          if (success) {
            console.log(`     ✅ Fixed ${path.basename(file)}`);
          } else {
            console.log(`     ⚠️  Skipped ${path.basename(file)} (too complex)`);
          }
        }
      }

      // Validate after each batch
      if (!await this.validateBatch()) {
        console.log('   ❌ Batch validation failed, stopping');
        break;
      }
    }

    console.log(`\n   Successfully processed ${this.fixedFiles.size} files`);
  }

  async fixComplexFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Use a more sophisticated approach for complex files
      const fixedContent = await this.applyComplexImportFixes(content, filePath);

      if (fixedContent !== content) {
        await this.writeFile(filePath, fixedContent);

        this.fixes.push({
          file: path.basename(filePath),
          type: 'complex_import_fix',
          approach: 'sophisticated_parsing'
        });

        return true;
      }

      return false;

    } catch (error) {
      console.log(`     Error processing ${path.basename(filePath)}: ${error.message}`);
      return false;
    }
  }

  async applyComplexImportFixes(content, filePath) {
    // Strategy 1: Fix empty lines within import groups
    let fixedContent = this.fixEmptyLinesInImportGroups(content);

    // Strategy 2: Fix type import ordering
    fixedContent = this.fixTypeImportOrdering(fixedContent);

    // Strategy 3: Fix simple ordering issues
    fixedContent = this.fixSimpleOrderingIssues(fixedContent);

    return fixedContent;
  }

  fixEmptyLinesInImportGroups(content) {
    const lines = content.split('\n');
    const result = [];
    let inImportSection = false;
    let lastWasImport = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (this.isImportLine(trimmed)) {
        if (!inImportSection) {
          inImportSection = true;
        }
        result.push(line);
        lastWasImport = true;
      } else if (inImportSection && trimmed === '' && lastWasImport) {
        // Check if next line is also an import
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        if (this.isImportLine(nextLine)) {
          // Skip this empty line - it's within an import group
          continue;
        } else {
          // Keep the empty line - it's separating import section from code
          result.push(line);
          inImportSection = false;
        }
        lastWasImport = false;
      } else {
        if (inImportSection && !this.isImportLine(trimmed) && trimmed !== '') {
          inImportSection = false;
        }
        result.push(line);
        lastWasImport = false;
      }
    }

    return result.join('\n');
  }

  fixTypeImportOrdering(content) {
    const lines = content.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (this.isImportLine(line.trim())) {
        // Collect all imports in this section
        const imports = [];
        while (i < lines.length && (this.isImportLine(lines[i].trim()) || lines[i].trim() === '')) {
          if (lines[i].trim() !== '') {
            imports.push({
              line: lines[i],
              index: i,
              isType: lines[i].includes('import type'),
              module: this.extractModuleName(lines[i])
            });
          }
          i++;
        }

        // Sort: regular imports first, then type imports
        imports.sort((a, b) => {
          if (a.isType !== b.isType) {
            return a.isType ? 1 : -1; // Regular imports first
          }
          return a.module && b.module ? a.module.localeCompare(b.module) : 0;
        });

        // Add sorted imports
        imports.forEach(imp => result.push(imp.line));

        // Add empty line after imports if there isn't one
        if (i < lines.length && lines[i].trim() !== '') {
          result.push('');
        }
      } else {
        result.push(line);
        i++;
      }
    }

    return result.join('\n');
  }

  fixSimpleOrderingIssues(content) {
    // Fix obvious ordering issues like external imports after internal ones
    const lines = content.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (this.isImportLine(line.trim())) {
        // Collect imports and sort them
        const imports = [];
        while (i < lines.length && this.isImportLine(lines[i].trim())) {
          const module = this.extractModuleName(lines[i]);
          imports.push({
            line: lines[i],
            module: module,
            category: this.categorizeImport(module)
          });
          i++;
        }

        // Simple sort by category
        const categoryOrder = ['builtin', 'external', 'internal', 'parent', 'sibling'];
        imports.sort((a, b) => {
          const aIndex = categoryOrder.indexOf(a.category);
          const bIndex = categoryOrder.indexOf(b.category);

          if (aIndex !== bIndex) {
            return aIndex - bIndex;
          }

          return a.module && b.module ? a.module.localeCompare(b.module) : 0;
        });

        // Add sorted imports
        imports.forEach(imp => result.push(imp.line));
      } else {
        result.push(line);
        i++;
      }
    }

    return result.join('\n');
  }

  isImportLine(line) {
    return line.startsWith('import ') ||
           line.startsWith('export ') ||
           line.includes('from \'') ||
           line.includes('from "');
  }

  extractModuleName(line) {
    const match = line.match(/from\s+['"]([^'"]+)['"]/);
    return match ? match[1] : null;
  }

  categorizeImport(module) {
    if (!module) return 'external';

    const builtins = ['fs', 'path', 'child_process', 'util', 'crypto', 'os'];
    if (builtins.includes(module)) return 'builtin';

    if (module.startsWith('@/')) return 'internal';
    if (module.startsWith('../')) return 'parent';
    if (module.startsWith('./')) return 'sibling';

    return 'external';
  }

  async writeFile(filePath, content) {
    const backupPath = path.join(this.backupDir, `${path.basename(filePath)}.${Date.now()}.backup`);
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
    }

    fs.writeFileSync(filePath, content);
    this.fixedFiles.add(filePath);
  }

  async validateBatch() {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async validateFixes() {
    console.log('\n🔍 Validating fixes...');

    try {
      // Check TypeScript compilation
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('   ✅ TypeScript compilation successful');

      // Check current import order issue count
      const currentCount = await this.getImportOrderIssueCount();
      console.log(`   Current import order issues: ${currentCount}`);

      this.validationResults = {
        currentCount,
        typescriptSuccess: true,
        filesFixed: this.fixedFiles.size
      };

    } catch (error) {
      console.log('   ❌ Validation failed');
      this.validationResults = {
        currentCount: 999,
        typescriptSuccess: false,
        filesFixed: this.fixedFiles.size,
        error: error.message
      };
      throw error;
    }
  }

  async getImportOrderIssueCount() {
    try {
      const output = execSync('yarn lint 2>&1 | grep -c "import/order" || echo "0"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  async rollback() {
    console.log('🔄 Rolling back changes...');

    try {
      execSync('git stash pop', { stdio: 'pipe' });
      console.log('   Git stash rollback successful');
    } catch (error) {
      console.log('   Git rollback failed');
    }
  }

  async generateReport() {
    console.log('\n📊 Generating complex import fix report...');

    const report = {
      timestamp: new Date().toISOString(),
      approach: 'complex_import_fixes',
      filesProcessed: this.fixedFiles.size,
      fixesApplied: this.fixes.length,
      validationResults: this.validationResults,
      strategies: [
        'Fixed empty lines within import groups',
        'Reordered type imports',
        'Applied simple category-based sorting'
      ]
    };

    fs.writeFileSync('complex-import-order-fix-report.json', JSON.stringify(report, null, 2));

    const markdown = this.generateMarkdownReport(report);
    fs.writeFileSync('COMPLEX_IMPORT_ORDER_FIX_REPORT.md', markdown);

    console.log(`   Files processed: ${report.filesProcessed}`);
    console.log(`   Fixes applied: ${report.fixesApplied}`);
    console.log(`   Current import issues: ${this.validationResults?.currentCount || 'Unknown'}`);

    console.log('\n   Reports saved:');
    console.log('   - complex-import-order-fix-report.json');
    console.log('   - COMPLEX_IMPORT_ORDER_FIX_REPORT.md');
  }

  generateMarkdownReport(report) {
    return `# Complex Import Order Fix Report

## Summary
- **Approach**: ${report.approach}
- **Files Processed**: ${report.filesProcessed}
- **Fixes Applied**: ${report.fixesApplied}
- **TypeScript Compilation**: ${report.validationResults?.typescriptSuccess ? '✅ Success' : '❌ Failed'}
- **Current Import Issues**: ${report.validationResults?.currentCount || 'Unknown'}

## Strategies Applied

${report.strategies.map(strategy => `- ✅ ${strategy}`).join('\n')}

## Fixes Applied

${this.fixes.map(fix => `- **${fix.file}**: ${fix.approach}`).join('\n')}

## Validation Results
- **TypeScript Compilation**: ${report.validationResults?.typescriptSuccess ? '✅ Success' : '❌ Failed'}
- **Files Successfully Fixed**: ${report.validationResults?.filesFixed || 0}

## Next Steps
1. Review any remaining import order issues manually
2. Update ESLint configuration to prevent future violations
3. Consider using automated import sorting tools
4. Monitor import order compliance in development workflow

## Fix Date
${new Date(report.timestamp).toLocaleString()}
`;
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new ComplexImportOrderFixer();
  fixer.run().catch(console.error);
}

module.exports = ComplexImportOrderFixer;
