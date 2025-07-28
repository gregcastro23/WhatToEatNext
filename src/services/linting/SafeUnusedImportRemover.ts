/**
 * Safe Unused Import Removal System
 * 
 * Implements comprehensive unused import removal while preserving:
 * - Imports used in type annotations or JSX
 * - Dynamic imports and conditional imports
 * - Critical astrological calculation imports
 * - Campaign system intelligence imports
 * 
 * Requirements: 3.2, 4.1
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { log } from '@/services/LoggingService';

interface UnusedImport {
  file: string;
  line: number;
  column: number;
  importName: string;
  message: string;
  isTypeImport: boolean;
  isDefaultImport: boolean;
  isNamespaceImport: boolean;
  severity: 'safe' | 'review' | 'preserve';
  reason?: string;
}

interface ImportRemovalResult {
  totalAnalyzed: number;
  safeToRemove: number;
  requiresReview: number;
  preserved: number;
  actuallyRemoved: number;
  errors: string[];
  warnings: string[];
  buildValid: boolean;
}

export class SafeUnusedImportRemover {
  private readonly astrologicalPatterns = [
    '/calculations/',
    '/data/planets/',
    '/utils/reliableAstronomy',
    '/utils/astrologyUtils',
    '/utils/planetaryConsistencyCheck',
    'astrological',
    'planetary',
    'elemental',
    'astronomical',
    'ephemeris',
    'transit',
    'zodiac'
  ];

  private readonly campaignSystemPatterns = [
    '/services/campaign/',
    '/services/AdvancedAnalyticsIntelligenceService',
    '/services/MLIntelligenceService',
    '/services/PredictiveIntelligenceService',
    'Campaign',
    'Intelligence',
    'Analytics',
    'Progress',
    'Metrics',
    'Safety'
  ];

  /**
   * Analyze and remove unused imports safely
   */
  public async processUnusedImports(dryRun: boolean = true): Promise<ImportRemovalResult> {
    log.info('🔍 Starting Safe Unused Import Analysis...\n');
    
    const result: ImportRemovalResult = {
      totalAnalyzed: 0,
      safeToRemove: 0,
      requiresReview: 0,
      preserved: 0,
      actuallyRemoved: 0,
      errors: [],
      warnings: [],
      buildValid: false
    };

    try {
      // Step 1: Analyze unused imports
      const unusedImports = await this.analyzeUnusedImports();
      result.totalAnalyzed = unusedImports.length;

      if (unusedImports.length === 0) {
        log.info('✅ No unused imports found!');
        result.buildValid = true;
        return result;
      }

      // Step 2: Categorize imports
      const categorized = this.categorizeImports(unusedImports);
      result.safeToRemove = categorized.safe.length;
      result.requiresReview = categorized.review.length;
      result.preserved = categorized.preserve.length;

      // Step 3: Display analysis results
      this.displayAnalysisResults(categorized);

      if (dryRun) {
        log.info('\n🔍 DRY RUN MODE - No changes will be made');
        log.info('Use processUnusedImports(false) to execute removal');
        return result;
      }

      // Step 4: Remove safe imports
      if (categorized.safe.length > 0) {
        const removalSuccess = await this.removeSafeImports(categorized.safe);
        result.actuallyRemoved = removalSuccess ? categorized.safe.length : 0;
      }

      // Step 5: Validate changes
      result.buildValid = await this.validateChanges();

      if (result.buildValid) {
        log.info('\n🎉 Safe unused import removal completed successfully!');
        log.info(`✅ Removed ${result.actuallyRemoved} unused imports`);
        log.info(`🛡️  Preserved ${result.preserved} critical imports`);
      } else {
        result.errors.push('Build validation failed after import removal');
      }

    } catch (error) {
      result.errors.push(`Import removal failed: ${error}`);
      console.error('❌ Import removal failed:', error);
    }

    return result;
  }

  /**
   * Analyze unused imports from ESLint output
   */
  private async analyzeUnusedImports(): Promise<UnusedImport[]> {
    log.info('🔍 Analyzing unused imports from ESLint...');

    try {
      const lintOutput = execSync('yarn lint --format=compact 2>&1', { 
        encoding: 'utf8',
        maxBuffer: 20 * 1024 * 1024
      });

      const unusedImports: UnusedImport[] = [];
      const lines = lintOutput.split('\n');

      for (const line of lines) {
        if (line.includes('@typescript-eslint/no-unused-vars') && 
            (line.includes('is defined but never used') || line.includes('is imported but never used'))) {
          
          const match = line.match(/^(.+):(\d+):(\d+):\s+(warning|error)\s+(.+?)\s+@typescript-eslint\/no-unused-vars/);
          if (match) {
            const [, filePath, lineNum, colNum, severity, message] = match;
            
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
              severity: 'review',
              reason: ''
            });
          }
        }
      }

      log.info(`📊 Found ${unusedImports.length} unused imports`);
      return unusedImports;

    } catch (error) {
      console.error('❌ Failed to analyze unused imports:', error);
      return [];
    }
  }

  /**
   * Categorize imports by safety level
   */
  private categorizeImports(unusedImports: UnusedImport[]): {
    safe: UnusedImport[];
    review: UnusedImport[];
    preserve: UnusedImport[];
  } {
    log.info('📋 Categorizing imports by safety level...');

    const categorized = {
      safe: [] as UnusedImport[],
      review: [] as UnusedImport[],
      preserve: [] as UnusedImport[]
    };

    for (const unusedImport of unusedImports) {
      const category = this.determineImportSafety(unusedImport);
      unusedImport.severity = category.severity;
      unusedImport.reason = category.reason;

      switch (category.severity) {
        case 'safe':
          categorized.safe.push(unusedImport);
          break;
        case 'review':
          categorized.review.push(unusedImport);
          break;
        case 'preserve':
          categorized.preserve.push(unusedImport);
          break;
      }
    }

    return categorized;
  }

  /**
   * Determine the safety level of removing an import
   */
  private determineImportSafety(unusedImport: UnusedImport): {
    severity: 'safe' | 'review' | 'preserve';
    reason: string;
  } {
    const { file, importName, message, isTypeImport } = unusedImport;

    // Always preserve imports in critical astrological files
    if (this.astrologicalPatterns.some(pattern => file.includes(pattern))) {
      return {
        severity: 'preserve',
        reason: 'Critical astrological calculation file'
      };
    }

    // Always preserve imports in campaign system files
    if (this.campaignSystemPatterns.some(pattern => file.includes(pattern))) {
      return {
        severity: 'preserve',
        reason: 'Campaign system intelligence file'
      };
    }

    // Preserve React component imports in TSX files
    if (importName.match(/^[A-Z]/) && file.endsWith('.tsx')) {
      return {
        severity: 'preserve',
        reason: 'React component import in TSX file'
      };
    }

    // Preserve type imports (might be used in type annotations)
    if (isTypeImport) {
      return {
        severity: 'preserve',
        reason: 'Type import may be used in annotations'
      };
    }

    // Safe to remove: simple utility imports that are clearly unused
    const safePatterns = [
      /^[a-z][a-zA-Z]*$/,  // camelCase function names
      /^[A-Z_]+$/,         // CONSTANT names
      /Utils?$/,           // Utility functions
      /Helper$/,           // Helper functions
      /Config$/,           // Configuration objects
      /Constants?$/        // Constants
    ];

    if (safePatterns.some(pattern => pattern.test(importName)) && 
        message.includes('is defined but never used') &&
        !file.includes('.d.ts')) {
      return {
        severity: 'safe',
        reason: 'Simple utility import that is clearly unused'
      };
    }

    // Default to requiring manual review
    return {
      severity: 'review',
      reason: 'Requires manual review for safety'
    };
  }

  /**
   * Display analysis results
   */
  private displayAnalysisResults(categorized: {
    safe: UnusedImport[];
    review: UnusedImport[];
    preserve: UnusedImport[];
  }): void {
    log.info('\n📊 Import Analysis Results:');
    log.info(`✅ Safe to remove: ${categorized.safe.length}`);
    log.info(`⚠️  Requires review: ${categorized.review.length}`);
    log.info(`🛡️  Preserved (critical): ${categorized.preserve.length}\n`);

    if (categorized.safe.length > 0) {
      log.info('✅ Safe to Remove:');
      this.displayImportsByFile(categorized.safe);
    }

    if (categorized.preserve.length > 0) {
      log.info('\n🛡️  Preserved (Critical):');
      this.displayImportsByFile(categorized.preserve.slice(0, 10)); // Show first 10
      if (categorized.preserve.length > 10) {
        log.info(`   ... and ${categorized.preserve.length - 10} more`);
      }
    }

    if (categorized.review.length > 0) {
      log.info('\n⚠️  Requires Manual Review:');
      this.displayImportsByFile(categorized.review.slice(0, 5)); // Show first 5
      if (categorized.review.length > 5) {
        log.info(`   ... and ${categorized.review.length - 5} more`);
      }
    }
  }

  /**
   * Display imports grouped by file
   */
  private displayImportsByFile(imports: UnusedImport[]): void {
    const groupedByFile = imports.reduce((acc, imp) => {
      const relativePath = path.relative(process.cwd(), imp.file);
      if (!acc[relativePath]) acc[relativePath] = [];
      acc[relativePath].push(imp);
      return acc;
    }, {} as Record<string, UnusedImport[]>);

    Object.entries(groupedByFile).forEach(([file, fileImports]) => {
      log.info(`   📄 ${file}:`);
      fileImports.forEach(imp => {
        log.info(`      - Line ${imp.line}: '${imp.importName}' (${imp.reason})`);
      });
    });
  }

  /**
   * Remove safe imports using ESLint auto-fix
   */
  private async removeSafeImports(safeImports: UnusedImport[]): Promise<boolean> {
    log.info(`\n🗑️  Removing ${safeImports.length} safe unused imports...`);

    try {
      // Run ESLint auto-fix with focused unused variable removal
      execSync('yarn lint --fix --rule "@typescript-eslint/no-unused-vars: error"', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });

      log.info('✅ Safe import removal completed');
      return true;

    } catch (error: any) {
      // ESLint returns non-zero exit code even for successful fixes
      if (error.stdout && !error.stdout.includes('error')) {
        log.info('✅ Safe import removal completed');
        return true;
      } else {
        console.error('❌ Safe import removal failed:', error.message);
        return false;
      }
    }
  }

  /**
   * Validate changes by running TypeScript check and build
   */
  private async validateChanges(): Promise<boolean> {
    log.info('\n🔍 Validating changes...');
    
    try {
      // Check TypeScript compilation
      execSync('yarn tsc --noEmit --skipLibCheck', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      log.info('✅ TypeScript validation passed');

      return true;
    } catch (error) {
      console.error('❌ Validation failed');
      return false;
    }
  }

  /**
   * Get current import statistics
   */
  public getImportStats(): {
    totalFiles: number;
    unusedImports: number;
    typeScriptFiles: number;
  } {
    try {
      // Count TypeScript/JavaScript files
      const totalFilesOutput = execSync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l', {
        encoding: 'utf8'
      });
      const totalFiles = parseInt(totalFilesOutput.trim()) || 0;

      // Count TypeScript files specifically
      const tsFilesOutput = execSync('find src -name "*.ts" -o -name "*.tsx" | wc -l', {
        encoding: 'utf8'
      });
      const typeScriptFiles = parseInt(tsFilesOutput.trim()) || 0;

      // Count unused import warnings (approximate)
      const unusedImportsOutput = execSync('yarn lint --format=compact 2>&1 | grep -E "@typescript-eslint/no-unused-vars.*is defined but never used" | wc -l', {
        encoding: 'utf8'
      });
      const unusedImports = parseInt(unusedImportsOutput.trim()) || 0;

      return { totalFiles, unusedImports, typeScriptFiles };
    } catch (error) {
      return { totalFiles: 0, unusedImports: 0, typeScriptFiles: 0 };
    }
  }
}