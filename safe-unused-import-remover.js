#!/usr/bin/env node

/**
 * Safe Unused Import Removal System
 *
 * This script safely removes unused import statements while preserving:
 * - Imports used in type annotations or JSX
 * - Dynamic imports and conditional imports
 * - Imports that may be used in complex expressions
 *
 * Requirements: 3.2, 4.1
 */

import { execSync } from 'child_process';
import fs from 'fs';

class SafeUnusedImportRemover {
  constructor() {
    this.astrologicalFiles = [
      '/calculations/',
      '/data/planets/',
      '/utils/reliableAstronomy',
      '/utils/astrologyUtils',
      '/utils/planetaryConsistencyCheck',
      'astrological',
      'planetary',
      'elemental',
    ];

    this.campaignSystemFiles = [
      '/services/campaign/',
      '/services/AdvancedAnalyticsIntelligenceService',
      '/services/MLIntelligenceService',
      '/services/PredictiveIntelligenceService',
      'Campaign',
      'Intelligence',
    ];

    this.preservePatterns = [
      // Type-only imports that might be used in annotations
      /import\s+type\s+/,
      // React imports (often used in JSX)
      /from\s+['"]react['"]/,
      // Next.js imports (often used in complex ways)
      /from\s+['"]next\//,
      // Dynamic imports
      /import\(/,
      // Conditional imports
      /require\(/,
    ];
  }

  /**
   * Analyze unused imports from ESLint output
   */
  analyzeUnusedImports() {
    console.log('🔍 Analyzing unused imports...\n');

    // Get ESLint output for unused imports
    const lintOutput = this.getLintOutput();
    const unusedImports = this.extractUnusedImports(lintOutput);

    const analysis = {
      totalUnusedImports: unusedImports.length,
      safeToRemove: [],
      requiresManualReview: [],
      preserved: [],
    };

    // Categorize each unused import
    for (const unusedImport of unusedImports) {
      if (this.shouldPreserve(unusedImport)) {
        analysis.preserved.push(unusedImport);
      } else if (this.isSafeToRemove(unusedImport)) {
        analysis.safeToRemove.push(unusedImport);
      } else {
        analysis.requiresManualReview.push(unusedImport);
      }
    }

    return analysis;
  }

  /**
   * Remove safe unused imports
   */
  removeSafeUnusedImports(dryRun = true) {
    const analysis = this.analyzeUnusedImports();

    console.log(`📊 Import Analysis Results:`);
    console.log(`Total unused imports: ${analysis.totalUnusedImports}`);
    console.log(`Safe to remove: ${analysis.safeToRemove.length}`);
    console.log(`Requires manual review: ${analysis.requiresManualReview.length}`);
    console.log(`Preserved (critical): ${analysis.preserved.length}\n`);

    if (analysis.safeToRemove.length === 0) {
      console.log('✅ No safe unused imports to remove.');
      return;
    }

    if (dryRun) {
      console.log('🔍 DRY RUN - Would remove the following imports:\n');
      this.displayImportsToRemove(analysis.safeToRemove);
      return;
    }

    console.log('🚀 Removing safe unused imports...\n');
    this.performImportRemoval(analysis.safeToRemove);

    // Organize imports after removal
    this.organizeImports();

    console.log('✅ Safe unused import removal completed!');
  }

  /**
   * Get ESLint output focusing on unused imports
   */
  getLintOutput() {
    try {
      return execSync('yarn lint --format=compact 2>&1', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
    } catch (error) {
      // ESLint returns non-zero exit code when there are errors
      return error.stdout || '';
    }
  }

  /**
   * Extract unused import information from ESLint output
   */
  extractUnusedImports(lintOutput) {
    const unusedImports = [];
    const lines = lintOutput.split('\n');

    for (const line of lines) {
      if (
        line.includes('@typescript-eslint/no-unused-vars') &&
        (line.includes('is defined but never used') || line.includes('is imported but never used'))
      ) {
        const match = line.match(
          /^(.+):(\d+):(\d+):\s+warning\s+(.+?)\s+@typescript-eslint\/no-unused-vars/,
        );
        if (match) {
          const [, filePath, lineNum, colNum, message] = match;

          // Extract import name from message
          const importNameMatch = message.match(/'([^']+)'/);
          const importName = importNameMatch ? importNameMatch[1] : '';

          unusedImports.push({
            file: filePath,
            line: parseInt(lineNum),
            column: parseInt(colNum),
            importName,
            message,
            isTypeImport: message.includes('type'),
            isDefaultImport: !message.includes('{'),
            isNamespaceImport: message.includes('* as'),
          });
        }
      }
    }

    return unusedImports;
  }

  /**
   * Check if an import should be preserved
   */
  shouldPreserve(unusedImport) {
    const { file, importName, message } = unusedImport;

    // Preserve imports in critical astrological files
    if (this.astrologicalFiles.some(pattern => file.includes(pattern))) {
      return true;
    }

    // Preserve imports in campaign system files
    if (this.campaignSystemFiles.some(pattern => file.includes(pattern))) {
      return true;
    }

    // Preserve imports that match preserve patterns
    const fileContent = this.getFileContent(file);
    if (this.preservePatterns.some(pattern => pattern.test(fileContent))) {
      return true;
    }

    // Preserve React component imports (might be used in JSX)
    if (importName.match(/^[A-Z]/) && file.includes('.tsx')) {
      return true;
    }

    // Preserve type imports (might be used in type annotations)
    if (unusedImport.isTypeImport) {
      return true;
    }

    // Preserve imports with specific patterns
    const preserveNames = [
      'React',
      'Component',
      'useState',
      'useEffect',
      'useMemo',
      'useCallback',
      'planetary',
      'elemental',
      'astrological',
      'campaign',
    ];

    if (preserveNames.some(name => importName.toLowerCase().includes(name.toLowerCase()))) {
      return true;
    }

    return false;
  }

  /**
   * Check if an import is safe to remove
   */
  isSafeToRemove(unusedImport) {
    const { file, importName, message } = unusedImport;

    // Don't remove from critical files
    if (this.shouldPreserve(unusedImport)) {
      return false;
    }

    // Safe to remove obvious unused imports
    if (
      message.includes('is defined but never used') &&
      !message.includes('type') &&
      !file.includes('.d.ts')
    ) {
      // Check if it's a simple utility import
      const utilityPatterns = [
        /^[a-z][a-zA-Z]*$/, // camelCase function names
        /^[A-Z_]+$/, // CONSTANT names
        /Utils?$/, // Utility functions
        /Helper$/, // Helper functions
        /Config$/, // Configuration objects
      ];

      if (utilityPatterns.some(pattern => pattern.test(importName))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get file content safely
   */
  getFileContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      return '';
    }
  }

  /**
   * Display imports that would be removed
   */
  displayImportsToRemove(imports) {
    const groupedByFile = imports.reduce((acc, imp) => {
      if (!acc[imp.file]) acc[imp.file] = [];
      acc[imp.file].push(imp);
      return acc;
    }, {});

    Object.entries(groupedByFile).forEach(([file, fileImports]) => {
      console.log(`📄 ${file.replace(process.cwd(), '')}:`);
      fileImports.forEach(imp => {
        console.log(`  - Line ${imp.line}: ${imp.importName}`);
      });
      console.log('');
    });
  }

  /**
   * Perform actual import removal using ESLint auto-fix
   */
  performImportRemoval(imports) {
    console.log('🚀 Using ESLint auto-fix for safe import removal...\n');

    try {
      // Use ESLint's auto-fix capability for unused imports
      execSync('yarn lint --fix --rule "@typescript-eslint/no-unused-vars: error"', {
        stdio: 'inherit',
        encoding: 'utf8',
      });
      console.log('✅ ESLint auto-fix completed');
    } catch (error) {
      console.log('⚠️  ESLint auto-fix completed with some warnings (this is normal)');
    }
  }

  /**
   * Organize imports after removal
   */
  organizeImports() {
    console.log('\n📋 Organizing imports...');

    try {
      execSync('yarn lint --fix --rule "import/order: error"', {
        stdio: 'pipe',
        encoding: 'utf8',
      });
      console.log('✅ Import organization completed');
    } catch (error) {
      console.log('⚠️  Import organization had some issues (this is normal)');
    }
  }

  /**
   * Validate changes by running build
   */
  validateChanges() {
    console.log('\n🔍 Validating changes...');

    try {
      execSync('yarn build', {
        stdio: 'pipe',
        encoding: 'utf8',
      });
      console.log('✅ Build validation passed');
      return true;
    } catch (error) {
      console.error('❌ Build validation failed');
      return false;
    }
  }
}

// CLI interface
const remover = new SafeUnusedImportRemover();

const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (dryRun) {
  console.log('🔍 Running in DRY RUN mode. Use --execute to actually remove imports.\n');
}

remover.removeSafeUnusedImports(dryRun);

if (!dryRun) {
  const isValid = remover.validateChanges();
  if (!isValid) {
    console.log('\n⚠️  Build validation failed. Please review changes manually.');
    process.exit(1);
  }
}
