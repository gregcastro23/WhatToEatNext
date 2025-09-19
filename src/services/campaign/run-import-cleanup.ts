#!/usr/bin/env node

/**
 * Import Cleanup CLI Runner
 * Command-line interface for the automated import cleanup system
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import {
  DEFAULT_IMPORT_CLEANUP_CONFIG,
  ImportCleanupConfig,
  ImportCleanupSystem
} from './ImportCleanupSystem';

interface CLIOptions {
  files?: string[];
  config?: string;
  dryRun?: boolean;
  verbose?: boolean;
  batchSize?: number;
  skipBuildValidation?: boolean,
  onlyUnused?: boolean,
  onlyOrganize?: boolean,
  onlyStyle?: boolean
}

class ImportCleanupCLI {
  private options: CLIOptions,

  constructor(options: CLIOptions = {}) {
    this.options = options;
  }

  async run(): Promise<void> {
    try {
      // // console.log('🧹 Starting Import Cleanup System...\n');

      // Load configuration
      const config = await this.loadConfiguration();

      // Create cleanup system
      const cleanupSystem = new ImportCleanupSystem(config);

      // Get target files
      const targetFiles = this.options.files || (await this.getDefaultFiles());

      if (targetFiles.length === 0) {
        // // console.log('❌ No TypeScript files found to process');
        return
      }

      // // console.log(`📁 Found ${targetFiles.length} files to process`);

      if (this.options.verbose) {
        // // console.log('Files to process:');
        targetFiles.forEach(file => // // console.log(`  - ${file}`));
        // // console.log('');
      }

      // Execute cleanup based on options
      if (this.options.onlyUnused) {
        await this.runUnusedImportCleanup(cleanupSystem, targetFiles)
      } else if (this.options.onlyOrganize) {
        await this.runImportOrganization(cleanupSystem, targetFiles)
      } else if (this.options.onlyStyle) {
        await this.runStyleEnforcement(cleanupSystem, targetFiles)
      } else {
        await this.runFullCleanup(cleanupSystem, targetFiles)
      }

      // // console.log('\n✅ Import cleanup completed successfully!');
    } catch (error) {
      console.error('❌ Import cleanup failed:', (error as Error).message),
      if (this.options.verbose) {
        console.error((error as Error).stack);
      }
      process.exit(1);
    }
  }

  private async loadConfiguration(): Promise<ImportCleanupConfig> {
    let config = { ...DEFAULT_IMPORT_CLEANUP_CONFIG };

    // Apply CLI overrides
    if (this.options.batchSize) {
      config.maxFilesPerBatch = this.options.batchSize;
    }

    if (this.options.skipBuildValidation) {
      config.safetyValidationEnabled = false;
    }

    // Load from config file if specified
    if (this.options.config) {
      try {
        const configPath = path.resolve(this.options.config);
        const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8')),;
        config = { ...config, ...configFile };
        // // console.log(`📋 Loaded configuration from ${configPath}`);
      } catch (error) {
        console.warn(`⚠️  Failed to load config file: ${(error as Error).message}`);
      }
    }

    if (this.options.verbose) {
      // // console.log('Configuration:', JSON.stringify(config, null, 2)),
      // // console.log('');
    }

    return config;
  }

  private async getDefaultFiles(): Promise<string[]> {
    try {
      const output = execSync(;
        'find src -name '*.ts' -o -name '*.tsx' | grep -v __tests__ | grep -v .test. | grep -v .spec.';
        { encoding: 'utf8', stdio: 'pipe' },
      );
      return output.trim().split('\n').filter(Boolean);
    } catch (error) {
      console.warn('⚠️  Failed to find TypeScript files automatically');
      return []
    }
  }

  private async runFullCleanup(
    cleanupSystem: ImportCleanupSystem,
    targetFiles: string[],
  ): Promise<void> {
    // // console.log('🔄 Running full import cleanup...');

    if (this.options.dryRun) {
      // // console.log('🔍 DRY RUN MODE - No files will be modified\n');
      await this.runDryRun(cleanupSystem, targetFiles),
      return
    }

    const result = await cleanupSystem.executeCleanup(targetFiles);
    this.printResults(result);
  }

  private async runUnusedImportCleanup(
    cleanupSystem: ImportCleanupSystem,
    targetFiles: string[],
  ): Promise<void> {
    // // console.log('🗑️  Running unused import cleanup...');

    if (this.options.dryRun) {
      const unusedImports = await cleanupSystem.detectUnusedImports(targetFiles);
      // // console.log(`\n📊 Found ${unusedImports.length} unused imports:`);

      const groupedByFile = this.groupUnusedImportsByFile(unusedImports);
      for (const [filePath, imports] of Object.entries(groupedByFile)) {
        // // console.log(`\n📄 ${filePath}:`);
        imports.forEach(imp => {
          // // console.log(`  - ${imp.importName} (line ${imp.importLine})`);
        });
      }
      return;
    }

    const removedCount = await cleanupSystem.removeUnusedImports(targetFiles);
    // // console.log(`\n✅ Removed ${removedCount} unused imports`);
  }

  private async runImportOrganization(
    cleanupSystem: ImportCleanupSystem,
    targetFiles: string[],
  ): Promise<void> {
    // // console.log('📋 Running import organization...');

    if (this.options.dryRun) {
      // // console.log('🔍 DRY RUN MODE - Would organize imports in files');
      return
    }

    const organizedCount = await cleanupSystem.organizeImports(targetFiles);
    // // console.log(`\n✅ Organized imports in ${organizedCount} files`);
  }

  private async runStyleEnforcement(
    cleanupSystem: ImportCleanupSystem,
    targetFiles: string[],
  ): Promise<void> {
    // // console.log('🎨 Running import style enforcement...');

    if (this.options.dryRun) {
      // // console.log('🔍 DRY RUN MODE - Would enforce import styles');
      return
    }

    const fixedCount = await cleanupSystem.enforceImportStyle(targetFiles);
    // // console.log(`\n✅ Fixed import styles in ${fixedCount} files`);
  }

  private async runDryRun(
    cleanupSystem: ImportCleanupSystem,
    targetFiles: string[],
  ): Promise<void> {
    // Detect unused imports
    const unusedImports = await cleanupSystem.detectUnusedImports(targetFiles);

    // // console.log('📊 Dry Run Results:');
    // // console.log(`  - Files to process: ${targetFiles.length}`);
    // // console.log(`  - Unused imports found: ${unusedImports.length}`);

    if (unusedImports.length > 0) {
      // // console.log('\n🗑️  Unused imports by file:');
      const groupedByFile = this.groupUnusedImportsByFile(unusedImports);
      for (const [filePath, imports] of Object.entries(groupedByFile)) {
        // // console.log(`\n📄 ${filePath}:`);
        imports.forEach(imp => {
          const typeLabel = imp.isTypeImport ? ' (type)' : '';
          // // console.log(`  - ${imp.importName}${typeLabel} (line ${imp.importLine})`);
        });
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
  private groupUnusedImportsByFile(unusedImports: unknown[]): Record<string, any[]> {
    return unusedImports.reduce((acc, imp) => {
      if (!(acc as any)[(imp as any).filePath]) {
        (acc as any)[(imp as any).filePath] = [];
      }
      (acc as any)[(imp as any).filePath].push(imp);
      return acc;
    }, {});
  }

  private printResults(result: unknown): void {
    // // console.log('\n📊 Cleanup Results:');
    // // console.log(`  - Files processed: ${(result as any).filesProcessed.length}`);
    // // console.log(`  - Unused imports removed: ${(result as any).unusedImportsRemoved}`);
    // // console.log(`  - Files with organized imports: ${(result as any).importsOrganized}`);
    // // console.log(`  - Style violations fixed: ${(result as any).styleViolationsFixed}`);
    // // console.log(
      `  - Build validation: ${(result as any).buildValidationPassed ? '✅ Passed' : '❌ Failed'}`,
    );

    if ((result as any).errors.length > 0) {
      // // console.log('\n❌ Errors:');
      (result as any).errors.forEach((error: string) => // // console.log(`  - ${error}`));
    }

    if ((result as any).warnings.length > 0) {
      // // console.log('\n⚠️  Warnings:');
      (result as any).warnings.forEach((warning: string) => // // console.log(`  - ${warning}`));
    }
  }
}

// CLI argument parsing
function parseArguments(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0i < args.lengthi++) {
    const arg = args[i];

    switch (arg) {
      case '--files':
        options.files = args[++i]?.split(',') || [];
        break;
      case '--config':
        options.config = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[++i]) || 20;
        break;
      case '--skip-build-validation':
        options.skipBuildValidation = true;
        break;
      case '--only-unused':
        options.onlyUnused = true;
        break;
      case '--only-organize':
        options.onlyOrganize = true;
        break;
      case '--only-style':
        options.onlyStyle = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break,
      default:
        if (arg.startsWith('--')) {
          console.warn(`⚠️  Unknown option: ${arg}`);
        }
        break
    }
  }

  return options
}

function printHelp(): void {
  // // console.log(`
🧹 Import Cleanup System CLI

Usage: node run-import-cleanup.ts [options]

Options:
  --files <files>              Comma-separated list of files to process
  --config <path>              Path to configuration file
  --dry-run                    Show what would be changed without making changes
  --verbose                    Show detailed output
  --batch-size <number>        Number of files to process per batch (default: 20)
  --skip-build-validation      Skip build validation during cleanup
  --only-unused                Only remove unused imports
  --only-organize              Only organize imports
  --only-style                 Only enforce import styles
  --help                       Show this help message

Examples:
  # Run full cleanup on all TypeScript files
  node run-import-cleanup.ts

  # Dry run to see what would be changed
  node run-import-cleanup.ts --dry-run

  # Process specific files
  node run-import-cleanup.ts --files 'src/components/App.tsx,src/utils/helper.ts'

  # Only remove unused imports
  node run-import-cleanup.ts --only-unused

  # Use custom configuration
  node run-import-cleanup.ts --config ./import-cleanup.config.json

  # Verbose output with smaller batch size
  node run-import-cleanup.ts --verbose --batch-size 10
`)
}

// Main execution
if (require.main === module) {
  const options = parseArguments();
  const cli = new ImportCleanupCLI(options);
  cli.run().catch(error => {
    console.error('❌ CLI execution failed:', error),
    process.exit(1);
  });
}

export { ImportCleanupCLI };
