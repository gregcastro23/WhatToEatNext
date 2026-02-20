#!/usr/bin/env node

/**
 * Type Warning Fixer
 *
 * Systematically fixes type-related warnings with domain awareness
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Domain-specific patterns that should preserve any types
const PRESERVE_ANY_PATTERNS = [
  // Astrological calculation contexts
  'planetInfo', 'signInfo', 'planetaryPositions', 'astrologicalState',
  'transitDates', 'ephemerisData', 'astronomicalCalculation',

  // Campaign system contexts
  'campaignMetrics', 'intelligenceSystem', 'progressTracker',
  'safetyProtocol', 'validationFramework',

  // External API contexts
  'apiResponse', 'externalData', 'thirdPartyApi', 'fetchResult',

  // Test contexts
  'mockData', 'testFixture', 'stubResponse', 'testHelper'
];

// Safe type replacements
const SAFE_TYPE_REPLACEMENTS = {
  'any[]': 'unknown[]',
  'Array<any>': 'Array<unknown>',
  'Record<string, any>': 'Record<string, unknown>',
  'Record<any, any>': 'Record<string, unknown>',
  ': any =': ': unknown =',
  ': any;': ': unknown;',
  ': any,': ': unknown,',
  ': any)': ': unknown)',
  '(any)': '(unknown)',
  '<any>': '<unknown>',
  'Promise<any>': 'Promise<unknown>',
  'Partial<any>': 'Partial<Record<string, unknown>>',
  'keyof any': 'string'
};

// Files that should be handled with extra care
const SENSITIVE_FILES = [
  'alchemicalEngine',
  'calculations/',
  'services/campaign/',
  'astrology',
  'planetary',
  'Intelligence'
];

class TypeWarningFixer {
  constructor() {
    this.processedFiles = new Set();
    this.preservedAnyTypes = [];
    this.replacedTypes = [];
    this.skippedFiles = [];
    this.errors = [];
  }

  async fixTypeWarnings() {
    console.log('🔧 Fixing type-related warnings with domain awareness...\n');

    try {
      // Get files with explicit any warnings
      const filesWithAnyTypes = this.getFilesWithAnyTypes();
      console.log(`📁 Found ${filesWithAnyTypes.length} files with explicit any types\n`);

      // Process files in batches
      const batchSize = 10;
      for (let i = 0; i < filesWithAnyTypes.length; i += batchSize) {
        const batch = filesWithAnyTypes.slice(i, i + batchSize);
        console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(filesWithAnyTypes.length/batchSize)}`);

        await this.processBatch(batch);

        // Validate after each batch
        if (!this.validateBuild()) {
          console.log('❌ Build validation failed, stopping...');
          break;
        }

        console.log(`✅ Batch completed successfully\n`);
      }

      this.generateReport();

    } catch (error) {
      console.error('Error fixing type warnings:', error.message);
      this.errors.push(error.message);
    }
  }

  getFilesWithAnyTypes() {
    try {
      const output = execSync(`
        yarn lint:quick 2>&1 |
        grep "@typescript-eslint/no-explicit-any" |
        cut -d: -f1 |
        sort | uniq
      `, { encoding: 'utf8' });

      return output.trim().split('\n').filter(line => line.trim());
    } catch (error) {
      console.log('Could not get files with any types');
      return [];
    }
  }

  async processBatch(files) {
    for (const filePath of files) {
      if (!filePath || this.processedFiles.has(filePath)) continue;

      try {
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`  📝 Processing: ${relativePath}`);

        // Check if file needs sensitive handling
        const isSensitive = this.isSensitiveFile(relativePath);
        if (isSensitive) {
          console.log(`    ⚠️  Sensitive file detected, using conservative approach`);
        }

        const result = await this.processFile(filePath, isSensitive);

        if (result.modified) {
          console.log(`    ✅ Modified: ${result.replacements} replacements`);
          this.replacedTypes.push(...result.details);
        } else if (result.preserved) {
          console.log(`    🛡️  Preserved: ${result.preserved} any types (domain-specific)`);
          this.preservedAnyTypes.push(...result.preservedDetails);
        } else {
          console.log(`    ⏭️  Skipped: ${result.reason}`);
          this.skippedFiles.push({ file: relativePath, reason: result.reason });
        }

        this.processedFiles.add(filePath);

      } catch (error) {
        console.log(`    ❌ Error processing ${filePath}: ${error.message}`);
        this.errors.push(`${filePath}: ${error.message}`);
      }
    }
  }

  isSensitiveFile(filePath) {
    return SENSITIVE_FILES.some(pattern =>
      filePath.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  async processFile(filePath, isSensitive) {
    if (!fs.existsSync(filePath)) {
      return { modified: false, reason: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Check for domain-specific patterns that should preserve any
    const shouldPreserveAny = this.shouldPreserveAnyTypes(content, filePath);

    if (shouldPreserveAny.preserve && isSensitive) {
      return {
        modified: false,
        preserved: shouldPreserveAny.count,
        preservedDetails: shouldPreserveAny.patterns,
        reason: 'Domain-specific any types preserved'
      };
    }

    // Apply safe type replacements
    let modifiedContent = content;
    const replacements = [];

    for (const [pattern, replacement] of Object.entries(SAFE_TYPE_REPLACEMENTS)) {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = modifiedContent.match(regex);

      if (matches) {
        // For sensitive files, be more conservative
        if (isSensitive && matches.length > 5) {
          console.log(`    ⚠️  Too many replacements (${matches.length}) in sensitive file, skipping pattern: ${pattern}`);
          continue;
        }

        modifiedContent = modifiedContent.replace(regex, replacement);
        replacements.push({
          pattern,
          replacement,
          count: matches.length,
          file: filePath
        });
      }
    }

    // Only write if we made changes
    if (modifiedContent !== originalContent) {
      // Create backup
      fs.writeFileSync(`${filePath}.backup`, originalContent);

      // Write modified content
      fs.writeFileSync(filePath, modifiedContent);

      return {
        modified: true,
        replacements: replacements.length,
        details: replacements
      };
    }

    return { modified: false, reason: 'No safe replacements found' };
  }

  shouldPreserveAnyTypes(content, filePath) {
    const preservePatterns = [];
    let preserveCount = 0;

    // Check for domain-specific patterns
    for (const pattern of PRESERVE_ANY_PATTERNS) {
      if (content.toLowerCase().includes(pattern.toLowerCase())) {
        preservePatterns.push(pattern);
      }
    }

    // Count any types in the file
    const anyMatches = content.match(/:\s*any\b/g);
    if (anyMatches) {
      preserveCount = anyMatches.length;
    }

    // Preserve if we found domain patterns and it's a sensitive file
    const shouldPreserve = preservePatterns.length > 0 && this.isSensitiveFile(filePath);

    return {
      preserve: shouldPreserve,
      count: preserveCount,
      patterns: preservePatterns
    };
  }

  validateBuild() {
    try {
      console.log('    🔍 Validating build...');
      execSync('yarn build 2>/dev/null', { stdio: 'pipe' });
      return true;
    } catch (error) {
      console.log('    ❌ Build failed, rolling back batch...');
      this.rollbackBatch();
      return false;
    }
  }

  rollbackBatch() {
    // Restore from backups
    for (const filePath of this.processedFiles) {
      const backupPath = `${filePath}.backup`;
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, filePath);
        fs.unlinkSync(backupPath);
      }
    }
  }

  generateReport() {
    console.log('\n📊 TYPE WARNING FIXING REPORT');
    console.log('=' .repeat(50));

    console.log(`📁 Files Processed: ${this.processedFiles.size}`);
    console.log(`🔄 Type Replacements: ${this.replacedTypes.length}`);
    console.log(`🛡️  Preserved Any Types: ${this.preservedAnyTypes.length}`);
    console.log(`⏭️  Skipped Files: ${this.skippedFiles.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    console.log();

    if (this.replacedTypes.length > 0) {
      console.log('🔄 Most Common Replacements:');
      const replacementCounts = {};
      for (const replacement of this.replacedTypes) {
        const key = `${replacement.pattern} → ${replacement.replacement}`;
        replacementCounts[key] = (replacementCounts[key] || 0) + replacement.count;
      }

      Object.entries(replacementCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([replacement, count]) => {
          console.log(`  ${replacement}: ${count} times`);
        });
      console.log();
    }

    if (this.preservedAnyTypes.length > 0) {
      console.log('🛡️  Preserved Domain Patterns:');
      const patternCounts = {};
      for (const preserved of this.preservedAnyTypes) {
        for (const pattern of preserved.patterns) {
          patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
        }
      }

      Object.entries(patternCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([pattern, count]) => {
          console.log(`  ${pattern}: ${count} files`);
        });
      console.log();
    }

    if (this.errors.length > 0) {
      console.log('❌ Errors Encountered:');
      this.errors.slice(0, 5).forEach(error => {
        console.log(`  ${error}`);
      });
      console.log();
    }

    // Clean up backup files
    this.cleanupBackups();

    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        filesProcessed: this.processedFiles.size,
        replacements: this.replacedTypes.length,
        preserved: this.preservedAnyTypes.length,
        skipped: this.skippedFiles.length,
        errors: this.errors.length
      },
      details: {
        replacedTypes: this.replacedTypes,
        preservedAnyTypes: this.preservedAnyTypes,
        skippedFiles: this.skippedFiles,
        errors: this.errors
      }
    };

    fs.writeFileSync('type-warning-fixing-report.json', JSON.stringify(reportData, null, 2));
    console.log('📄 Detailed report saved to: type-warning-fixing-report.json');

    // Get updated warning count
    this.checkProgress();
  }

  cleanupBackups() {
    try {
      execSync('find . -name "*.backup" -delete 2>/dev/null');
      console.log('🧹 Cleaned up backup files');
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  checkProgress() {
    try {
      const newCount = execSync(`
        yarn lint:quick 2>&1 |
        grep "@typescript-eslint/no-explicit-any" |
        wc -l
      `, { encoding: 'utf8' }).trim();

      console.log(`\n📈 Progress Update:`);
      console.log(`   Remaining explicit any warnings: ${newCount}`);
      console.log(`   Estimated reduction: ${2676 - parseInt(newCount)} warnings fixed`);
    } catch (error) {
      console.log('Could not check progress');
    }
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new TypeWarningFixer();
  fixer.fixTypeWarnings().catch(console.error);
}

module.exports = TypeWarningFixer;
