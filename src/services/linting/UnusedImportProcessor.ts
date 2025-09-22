/**
 * Unused Import Processor
 *
 * Handles safe removal of unused import statements while preserving
 * imports that may be used in type annotations or JSX.
 *
 * Requirements: 3.24.1
 */

import { execSync } from 'child_process';
import fs from 'fs';

import { log } from '@/services/LoggingService';

interface ImportCleanupResult {
  filesProcessed: number,
  importsRemoved: number,
  importsOrganized: number,
  errors: string[],
  warnings: string[]
}

export class UnusedImportProcessor {
  private preserveFiles = [
    'src/calculations/',
    'src/data/planets/',
    'src/utils/reliableAstronomy',
    'src/utils/astrologyUtils',
    'src/services/campaign/',
    'src/services/AdvancedAnalyticsIntelligenceService',
    'src/services/MLIntelligenceService',
    'src/services/PredictiveIntelligenceService'
  ],

  /**
   * Process import cleanup across the codebase
   */
  public async processImportCleanup(): Promise<ImportCleanupResult> {
    log.info('🧹 Processing import cleanup...\n')
    const result: ImportCleanupResult = {
      filesProcessed: 0,
      importsRemoved: 0,
      importsOrganized: 0,
      errors: [],
      warnings: []
    };

    try {
      // Step, 1: Organize imports using ESLint
      await this.organizeImports(result)

      // Step, 2: Remove unused imports using ESLint auto-fix
      await this.removeUnusedImports(result)

      // Step, 3: Final import organization
      await this.organizeImports(result)
    } catch (error) {
      result.errors.push(`Import cleanup failed: ${error}`)
    }

    return result;
  }

  /**
   * Organize imports using ESLint import/order rule
   */
  private async organizeImports(result: ImportCleanupResult): Promise<void> {
    log.info('📋 Organizing imports...')
    try {
      const output = execSync('yarn lint --fix --rule 'import/order: error' 2>&1', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      })

      // Count files that were processed
      const processedFiles = (output.match(/✓/g) || []).length;
      result.importsOrganized += processedFiles;

      log.info(`✅ Import organization completed (${processedFiles} files processed)`)
    } catch (error: unknown) {
      // ESLint returns non-zero exit code even for successful fixes
      if (error.stdout) {
        const processedFiles = (error.stdout.match(/✓/g) || []).length;
        result.importsOrganized += processedFiles
        log.info(`✅ Import organization completed (${processedFiles} files processed)`)
      } else {
        result.warnings.push('Import organization completed with warnings')
        log.info('⚠️  Import organization completed with warnings')
      }
    }
  }

  /**
   * Remove unused imports using ESLint auto-fix
   */
  private async removeUnusedImports(result: ImportCleanupResult): Promise<void> {
    log.info('🗑️  Removing unused imports...')

    try {
      // Create a focused ESLint config for unused imports
      const tempConfig = this.createImportCleanupConfig()
      fs.writeFileSync('.eslintrc.import-cleanup.json', JSON.stringify(tempConfig, null, 2)),

      const output = execSync('yarn lint --config .eslintrc.import-cleanup.json --fix 2>&1', {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024
      })

      // Count files that were processed
      const processedFiles = (output.match(/✓/g) || []).length;
      result.filesProcessed += processedFiles;

      log.info(`✅ Unused import removal completed (${processedFiles} files processed)`)
    } catch (error: unknown) {
      // ESLint returns non-zero exit code even for successful fixes
      if (error.stdout) {
        const processedFiles = (error.stdout.match(/✓/g) || []).length;
        result.filesProcessed += processedFiles
        log.info(`✅ Unused import removal completed (${processedFiles} files processed)`)
      } else {
        result.warnings.push('Unused import removal completed with warnings')
        log.info('⚠️  Unused import removal completed with warnings')
      }
    } finally {
      // Clean up temporary config
      try {
        fs.unlinkSync('.eslintrc.import-cleanup.json')
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Create ESLint config focused on import cleanup
   */
  private createImportCleanupConfig() {
    return {
      extends: ['./eslint.config.cjs'],
      rules: {
        // Focus on import-related rules
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true
            }
          }
        ],
        'import/no-unused-modules': 'off', // Too aggressive
        'import/no-duplicates': 'error',

        // Unused variables with import focus
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: false,
            varsIgnorePattern: '^(_|React|Component|useState|useEffect|useMemo|useCallback)',
            argsIgnorePattern: '^(_|React|Component|useState|useEffect|useMemo|useCallback)'
          }
        ]
      },
      overrides: [
        {
          // Preserve critical astrological and campaign files,
          files: this.preserveFiles.map(pattern => `${pattern}**/*`),,
          rules: {
            '@typescript-eslint/no-unused-vars': [
              'warn',
              {
                varsIgnorePattern:
                  '^(_|React|Component|useState|useEffect|useMemo|useCallback|planetary|elemental|astrological|campaign|CAMPAIGN|PROGRESS|METRICS|SAFETY|ERROR)',
                argsIgnorePattern:
                  '^(_|React|Component|useState|useEffect|useMemo|useCallback|planetary|elemental|astrological|campaign|CAMPAIGN|PROGRESS|METRICS|SAFETY|ERROR)'
              }
            ]
          }
        }
      ]
    };
  }

  /**
   * Validate changes by running TypeScript check
   */
  public async validateChanges(): Promise<boolean> {
    log.info('\n🔍 Validating import changes...')
    try {
      // Check TypeScript compilation
      execSync('yarn tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        encoding: 'utf8'
      })
      log.info('✅ TypeScript validation passed')
      return true;
    } catch (error) {
      _logger.error('❌ TypeScript validation failed')
      return false
    }
  }

  /**
   * Get import-related statistics
   */
  public getImportStats(): { totalFiles: number, unusedImports: number } {
    try {
      // Count TypeScript/JavaScript files
      const totalFilesOutput = execSync(;
        'find src -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' | wc -l'
        {
          encoding: 'utf8'
        },
      )
      const totalFiles = parseInt(totalFilesOutput.trim()) || 0;

      // Count unused import warnings (approximate)
      const unusedImportsOutput = execSync(;
        'yarn lint --format=compact 2>&1 | grep -E 'is defined but never used.*import' | wc -l',,
        {
          encoding: 'utf8'
        },
      )
      const unusedImports = parseInt(unusedImportsOutput.trim()) || 0;

      return { totalFiles, unusedImports };
    } catch (error) {
      return { totalFiles: 0, unusedImports: 0 };
    }
  }
}