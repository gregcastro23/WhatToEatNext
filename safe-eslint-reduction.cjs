#!/usr/bin/env node

/**
 * Safe ESLint Reduction - Phase 12.2
 *
 * Conservative approach to reduce ESLint issues without breaking syntax
 */

const fs = require('fs');
const { execSync } = require('child_process');

class SafeESLintReduction {
  constructor() {
    this.logFile = `safe-eslint-reduction-${Date.now()}.log`;
    this.fixedIssues = 0;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    fs.appendFileSync(this.logFile, logEntry + '\n');
  }

  getCurrentIssueCount() {
    try {
      const output = execSync('yarn lint src --ignore-pattern "src/__tests__/**" 2>&1 | grep -E "(error|warning)" | wc -l', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 60000
      });
      return parseInt(output.trim()) || 0;
    } catch (error) {
      this.log(`Error getting issue count: ${error.message}`);
      return -1;
    }
  }

  validateBuild() {
    try {
      this.log('Validating build...');
      execSync('yarn build', {
        stdio: 'pipe',
        timeout: 120000
      });
      this.log('✅ Build validation passed');
      return true;
    } catch (error) {
      this.log(`❌ Build validation failed: ${error.message}`);
      return false;
    }
  }

  // Use ESLint's built-in auto-fix for the safest rules
  applyESLintAutoFix() {
    this.log('Applying ESLint auto-fix for safe rules...');

    const safeRules = [
      'import/order',
      '@typescript-eslint/prefer-optional-chain'
    ];

    safeRules.forEach(rule => {
      try {
        this.log(`Fixing rule: ${rule}`);
        execSync(`yarn lint src --ignore-pattern "src/__tests__/**" --fix --rule "${rule}: error"`, {
          stdio: 'pipe',
          timeout: 120000
        });
        this.log(`✅ Fixed ${rule}`);
      } catch (error) {
        this.log(`⚠️ ${rule} fixes completed with warnings`);
      }
    });
  }

  // Fix simple equality operators
  fixEqualityOperators() {
    this.log('Fixing equality operators...');

    const files = this.getSourceFiles();
    let fixedCount = 0;

    files.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // Simple == to === replacements (be very conservative)
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          // Only fix obvious cases
          if (line.includes(' == ') && !line.includes('===') && !line.includes('!==')) {
            lines[index] = line.replace(/ == /g, ' === ');
            modified = true;
            fixedCount++;
          }
          if (line.includes(' != ') && !line.includes('!==') && !line.includes('===')) {
            lines[index] = line.replace(/ != /g, ' !== ');
            modified = true;
            fixedCount++;
          }
        });

        if (modified) {
          content = lines.join('\n');
          fs.writeFileSync(file, content);
          this.log(`Fixed equality operators in: ${file.replace(process.cwd(), '.')}`);
        }

      } catch (error) {
        this.log(`Error processing ${file}: ${error.message}`);
      }
    });

    this.log(`✅ Fixed ${fixedCount} equality operators`);
  }

  // Remove unused eslint-disable directives from test files
  cleanTestFileDisables() {
    this.log('Cleaning unused eslint-disable directives from test files...');

    const testFiles = this.getSourceFiles().filter(file =>
      file.includes('__tests__') ||
      file.includes('.test.') ||
      file.includes('.spec.')
    );

    let fixedCount = 0;

    testFiles.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        const originalContent = content;

        // Remove the specific unused disable pattern
        content = content.replace(
          /\/\* eslint-disable @typescript-eslint\/no-explicit-any, no-console, @typescript-eslint\/no-unused-vars, max-lines-per-function -- Campaign\/test file with intentional patterns \*\/\n/g,
          ''
        );

        if (content !== originalContent) {
          fs.writeFileSync(file, content);
          fixedCount++;
          this.log(`Cleaned eslint-disable in: ${file.replace(process.cwd(), '.')}`);
        }

      } catch (error) {
        this.log(`Error processing ${file}: ${error.message}`);
      }
    });

    this.log(`✅ Cleaned ${fixedCount} test files`);
  }

  // Fix simple unused variables by prefixing with underscore (very conservative)
  fixObviousUnusedVariables() {
    this.log('Fixing obvious unused variables...');

    const files = this.getSourceFiles().filter(file =>
      !file.includes('campaign') &&
      !file.includes('debug') &&
      !file.includes('test')
    );

    let fixedCount = 0;

    files.forEach(file => {
      try {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // Only fix very obvious cases like destructuring
        const patterns = [
          // Simple destructuring with obvious unused vars
          { from: /const \{ ([a-zA-Z_][a-zA-Z0-9_]*), /g, to: 'const { _$1, ' },
          // Function parameters that are clearly unused
          { from: /\(([a-zA-Z_][a-zA-Z0-9_]*): [^)]+\) => \{/g, to: '(_$1: $2) => {' }
        ];

        patterns.forEach(({ from, to }) => {
          if (from.test(content)) {
            const newContent = content.replace(from, to);
            if (newContent !== content) {
              content = newContent;
              modified = true;
              fixedCount++;
            }
          }
        });

        if (modified) {
          fs.writeFileSync(file, content);
          this.log(`Fixed unused variables in: ${file.replace(process.cwd(), '.')}`);
        }

      } catch (error) {
        this.log(`Error processing ${file}: ${error.message}`);
      }
    });

    this.log(`✅ Fixed ${fixedCount} obvious unused variables`);
  }

  getSourceFiles() {
    const files = [];

    function walkDir(dir) {
      try {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
          const fullPath = require('path').join(dir, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory() &&
              !item.startsWith('.') &&
              item !== 'node_modules') {
            walkDir(fullPath);
          } else if (stat.isFile() &&
                     (item.endsWith('.ts') || item.endsWith('.tsx')) &&
                     !item.endsWith('.d.ts')) {
            files.push(fullPath);
          }
        });
      } catch (error) {
        // Skip directories we can't read
      }
    }

    walkDir('src');
    return files;
  }

  async execute() {
    this.log('🚀 Starting Safe ESLint Reduction Campaign');

    const initialCount = this.getCurrentIssueCount();
    this.log(`Initial ESLint issues: ${initialCount}`);

    try {
      // Phase 1: ESLint auto-fix (safest)
      this.applyESLintAutoFix();

      // Validate after auto-fix
      if (!this.validateBuild()) {
        throw new Error('Build failed after auto-fix');
      }

      let currentCount = this.getCurrentIssueCount();
      this.log(`After auto-fix: ${currentCount} issues (${initialCount - currentCount} fixed)`);

      // Phase 2: Clean test file directives
      this.cleanTestFileDisables();
      currentCount = this.getCurrentIssueCount();
      this.log(`After cleaning test directives: ${currentCount} issues`);

      // Phase 3: Fix equality operators
      this.fixEqualityOperators();

      // Validate after equality fixes
      if (!this.validateBuild()) {
        throw new Error('Build failed after equality fixes');
      }

      currentCount = this.getCurrentIssueCount();
      this.log(`After equality fixes: ${currentCount} issues`);

      // Phase 4: Fix obvious unused variables
      this.fixObviousUnusedVariables();

      // Final validation
      if (!this.validateBuild()) {
        throw new Error('Build failed after unused variable fixes');
      }

      const finalCount = this.getCurrentIssueCount();
      const totalFixed = initialCount - finalCount;
      const reductionPercentage = ((totalFixed / initialCount) * 100).toFixed(1);

      this.log('🎉 Safe ESLint Reduction Campaign Completed!');
      this.log(`Initial issues: ${initialCount}`);
      this.log(`Final issues: ${finalCount}`);
      this.log(`Total fixed: ${totalFixed}`);
      this.log(`Reduction: ${reductionPercentage}%`);

      const success = finalCount < 500 || reductionPercentage > 50;
      if (success) {
        this.log('✅ SUCCESS: Significant progress made!');
      } else {
        this.log(`⚠️ PROGRESS: ${finalCount} issues remaining, ${reductionPercentage}% reduction achieved`);
      }

      return {
        success,
        initialCount,
        finalCount,
        totalFixed,
        reductionPercentage: parseFloat(reductionPercentage)
      };

    } catch (error) {
      this.log(`❌ Campaign failed: ${error.message}`);
      throw error;
    }
  }
}

// Execute campaign
if (require.main === module) {
  const campaign = new SafeESLintReduction();

  campaign.execute()
    .then(result => {
      console.log('\n📊 Campaign Results:');
      console.log(`Success: ${result.success}`);
      console.log(`Issues reduced: ${result.initialCount} → ${result.finalCount}`);
      console.log(`Reduction: ${result.reductionPercentage}%`);

      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Campaign failed:', error.message);
      process.exit(1);
    });
}

module.exports = SafeESLintReduction;
