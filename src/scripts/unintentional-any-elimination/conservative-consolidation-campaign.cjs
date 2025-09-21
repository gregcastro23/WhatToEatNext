#!/usr/bin/env node

/**
 * Conservative Consolidation Campaign
 *
 * Focuses on very safe, high-confidence patterns with minimal risk
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConservativeConsolidationCampaign {
  constructor() {
    this.results = {
      startTime: new Date(),
      processedFiles: 0,
      successfulFixes: 0,
      rollbacks: 0,
      modifiedFiles: []
    };
  }

  async execute() {
    console.log('🎯 Starting Conservative Consolidation Campaign...');

    try {
      // Create backup
      await this.createBackup();

      // Get current explicit-any warnings with file verification
      const warnings = await this.getVerifiedWarnings();
      console.log(`📊 Found ${warnings.length} verified warnings to process`);

      // Process only the safest patterns
      await this.processSafePatterns(warnings);

      // Final validation
      await this.validateResults();

      console.log('✅ Conservative consolidation completed!');

    } catch (error) {
      console.error('❌ Campaign failed:', error.message);
      await this.rollbackChanges();
      throw error;
    }
  }

  async createBackup() {
    console.log('💾 Creating backup...');
    try {
      execSync('git add -A && git stash push -m "Pre-conservative-consolidation backup"', {
        stdio: 'pipe'
      });
      console.log('✅ Backup created');
    } catch (error) {
      console.warn('⚠️ Could not create git backup');
    }
  }

  async getVerifiedWarnings() {
    const warnings = [];

    try {
      const output = execSync(
        'yarn eslint src --format compact 2>/dev/null | grep "no-explicit-any" || echo ""',
        { encoding: 'utf8', stdio: 'pipe' }
      );

      const lines = output.trim().split('\n').filter(line => line.trim());

      for (const line of lines) {
        const match = line.match(/^([^:]+):\s*line\s+(\d+),\s*col\s+(\d+),\s*[^-]+-\s*(.+?)\s*\(@typescript-eslint\/no-explicit-any\)/);
        if (match) {
          const [, filePath, lineNum, colNum, message] = match;

          // Verify file exists
          if (fs.existsSync(filePath)) {
            try {
              const fileContent = fs.readFileSync(filePath, 'utf8');
              const lines = fileContent.split('\n');
              const sourceLine = lines[parseInt(lineNum) - 1] || '';

              warnings.push({
                filePath: filePath,
                line: parseInt(lineNum),
                column: parseInt(colNum),
                message: message,
                source: sourceLine.trim()
              });
            } catch (e) {
              // Skip files we can't read
            }
          }
        }
      }

    } catch (error) {
      console.warn('Warning: Could not get ESLint output');
    }

    return warnings;
  }

  async processSafePatterns(warnings) {
    console.log('🔧 Processing safe patterns...');

    // Group warnings by file
    const fileWarnings = new Map();
    for (const warning of warnings) {
      if (!fileWarnings.has(warning.filePath)) {
        fileWarnings.set(warning.filePath, []);
      }
      fileWarnings.get(warning.filePath).push(warning);
    }

    // Process files with safe patterns only
    let processedCount = 0;

    for (const [filePath, warningsForFile] of fileWarnings) {
      if (processedCount >= 10) { // Limit to 10 files for safety
        console.log('🛑 Reached file processing limit for safety');
        break;
      }

      const success = await this.processSingleFile(filePath, warningsForFile);
      if (success) {
        processedCount++;
      }

      // Validate build every 3 files
      if (processedCount % 3 === 0) {
        const buildValid = await this.validateBuild();
        if (!buildValid) {
          console.log('❌ Build validation failed, stopping campaign');
          break;
        }
      }
    }
  }

  async processSingleFile(filePath, warnings) {
    console.log(`  📝 Processing ${path.relative(process.cwd(), filePath)}...`);

    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = originalContent;
      let changeCount = 0;

      // Only process very safe patterns
      const safeReplacements = [
        {
          pattern: /:\s*any\[\]/g,
          replacement: ': unknown[]',
          description: 'array types'
        },
        {
          pattern: /Record<([^,>]+),\s*any>/g,
          replacement: 'Record<$1, unknown>',
          description: 'Record types'
        }
      ];

      for (const replacement of safeReplacements) {
        const beforeCount = (modifiedContent.match(replacement.pattern) || []).length;
        modifiedContent = modifiedContent.replace(replacement.pattern, replacement.replacement);
        const afterCount = (modifiedContent.match(replacement.pattern) || []).length;
        const changes = beforeCount - afterCount;

        if (changes > 0) {
          changeCount += changes;
          console.log(`    ✓ Replaced ${changes} ${replacement.description}`);
        }
      }

      if (changeCount === 0) {
        console.log(`    ⏭️ No safe patterns found`);
        return false;
      }

      // Write changes
      fs.writeFileSync(filePath, modifiedContent, 'utf8');

      // Validate TypeScript compilation for this file
      const compilationValid = await this.validateFileCompilation(filePath);

      if (!compilationValid) {
        console.log(`    ❌ Compilation failed, rolling back`);
        fs.writeFileSync(filePath, originalContent, 'utf8');
        this.results.rollbacks++;
        return false;
      }

      console.log(`    ✅ Successfully processed ${changeCount} changes`);
      this.results.successfulFixes += changeCount;
      this.results.modifiedFiles.push({
        path: filePath,
        changes: changeCount
      });

      return true;

    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
      return false;
    }
  }

  async validateFileCompilation(filePath) {
    try {
      execSync(`yarn tsc --noEmit --skipLibCheck "${filePath}" 2>/dev/null`, {
        stdio: 'pipe',
        timeout: 10000
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async validateBuild() {
    console.log('🔍 Validating build...');

    try {
      execSync('yarn tsc --noEmit --skipLibCheck 2>/dev/null', {
        stdio: 'pipe',
        timeout: 30000
      });
      console.log('✅ Build validation passed');
      return true;
    } catch (error) {
      console.log('❌ Build validation failed');
      return false;
    }
  }

  async validateResults() {
    console.log('🏁 Final validation...');

    // Final build check
    const buildValid = await this.validateBuild();
    if (!buildValid) {
      throw new Error('Final build validation failed');
    }

    // Get final warning count
    const finalWarnings = await this.getVerifiedWarnings();

    // Generate report
    await this.generateReport(finalWarnings.length);

    console.log(`\n📊 Results Summary:`);
    console.log(`   ✅ Files processed: ${this.results.processedFiles}`);
    console.log(`   🔧 Successful fixes: ${this.results.successfulFixes}`);
    console.log(`   🔄 Rollbacks: ${this.results.rollbacks}`);
    console.log(`   📁 Modified files: ${this.results.modifiedFiles.length}`);
    console.log(`   📉 Final warnings: ${finalWarnings.length}`);
  }

  async rollbackChanges() {
    console.log('🚨 Rolling back changes...');

    try {
      execSync('git stash pop', { stdio: 'pipe' });
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
    }
  }

  async generateReport(finalWarningCount) {
    const reportPath = '.kiro/specs/unintentional-any-elimination/conservative-consolidation-report.md';

    const report = `# Conservative Consolidation Campaign Report

## Campaign Summary

- **Start Time**: ${this.results.startTime.toISOString()}
- **End Time**: ${new Date().toISOString()}
- **Strategy**: Conservative approach focusing on safest patterns only

## Results

- **Successful Fixes**: ${this.results.successfulFixes}
- **Files Modified**: ${this.results.modifiedFiles.length}
- **Rollbacks**: ${this.results.rollbacks}
- **Final Warning Count**: ${finalWarningCount}

## Modified Files

${this.results.modifiedFiles.length > 0
  ? this.results.modifiedFiles.map(file => `- ${path.relative(process.cwd(), file.path)} (${file.changes} changes)`).join('\n')
  : 'No files were modified'}

## Patterns Processed

- **Array Types**: \`any[]\` → \`unknown[]\`
- **Record Types**: \`Record<K, any>\` → \`Record<K, unknown>\`

## Safety Measures

- ✅ Git backup created before processing
- ✅ Individual file TypeScript validation
- ✅ Build validation every 3 files
- ✅ Automatic rollback on compilation failures
- ✅ Limited to 10 files maximum for safety

## Recommendations

### Next Steps
1. **Manual Review**: Review remaining warnings for manual processing
2. **Test Validation**: Run full test suite to ensure functionality
3. **Documentation**: Update any type documentation as needed

### Future Campaigns
1. **Expand Patterns**: Consider additional safe patterns
2. **Domain Analysis**: Apply domain-specific improvements
3. **Prevention**: Implement pre-commit hooks

Generated on: ${new Date().toISOString()}
`;

    await fs.promises.writeFile(reportPath, report, 'utf8');
    console.log(`📄 Report saved to: ${reportPath}`);
  }
}

// CLI execution
if (require.main === module) {
  const campaign = new ConservativeConsolidationCampaign();

  campaign.execute()
    .then(() => {
      console.log('✅ Conservative consolidation campaign completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Campaign failed:', error);
      process.exit(1);
    });
}

module.exports = { ConservativeConsolidationCampaign };
