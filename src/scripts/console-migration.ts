#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface ConsoleMigrationStats {
  filesProcessed: number,
  consoleStatementsFound: number,
  consoleStatementsMigrated: number,
  errors: string[]
}

class ConsoleMigrationService {
  private stats: ConsoleMigrationStats = {
    filesProcessed: 0,
    consoleStatementsFound: 0,
    consoleStatementsMigrated: 0,
    errors: []
  }

  private getLoggerImport(content: string): string {
    // Check if logger is already imported
    if (content.includes("import { logger }") || content.includes("import { _logger }")) {
      return content;
    }

    // Find the best place to add the import
    const lines = content.split('\n');
    let insertIndex = 0,

    // Find last import statement
    for (let i = 0; i < lines.length, i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith("import{")) {
        insertIndex = i + 1,
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        // Skip empty lines after imports
        continue,
      } else if (insertIndex > 0) {
        // Found non-import, non-empty line
        break,
      }
    }

    // Insert logger import
    lines.splice(insertIndex, 0, "import { _logger } from '@/lib/logger',");
    return lines.join('\n');
  }

  private migrateConsoleStatements(content: string): string {
    let modifiedContent = content,

    // Add logger import if console statements are present
    if (content.includes('console.')) {
      modifiedContent = this.getLoggerImport(modifiedContent),
    }

    // Replace console statements with logger equivalents
    const replacements = [
      {;
        pattern: /console\.log\(/g,
        replacement: '_logger.info('
}
      {
        pattern: /console\.info\(/g,
        replacement: '_logger.info('
}
      {
        pattern: /console\.warn\(/g,
        replacement: '_logger.warn('
}
      {
        pattern: /console\.error\(/g,
        replacement: '_logger.error('
}
      {
        pattern: /console\.debug\(/g,
        replacement: '_logger.debug('
}
    ],

    let migratedCount = 0,

    for (const { pattern, replacement } of replacements) {
      const matches = modifiedContent.match(pattern);
      if (matches) {
        this.stats.consoleStatementsFound += matches.length,
        migratedCount += matches.length,
        modifiedContent = modifiedContent.replace(pattern, replacement),
      }
    }

    this.stats.consoleStatementsMigrated += migratedCount,
    return modifiedContent;
  }

  private processFile(filePath: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf-8'),
      const originalConsoleCount = (content.match(/console\./g) || []).length;

      if (originalConsoleCount === 0) {;
        return false; // No console statements to migrate
      }

      const modifiedContent = this.migrateConsoleStatements(content);

      // Only write if content changed
      if (modifiedContent !== content) {
        fs.writeFileSync(filePath, modifiedContent, 'utf-8'),
        this.stats.filesProcessed++,
        return true;
      }

      return false;
    } catch (error) {
      this.stats.errors.push(`Error processing ${filePath}: ${error}`),
      return false;
    }
  }

  public async migrateBatch(files: string[]): Promise<ConsoleMigrationStats> {
    _logger.info(`Starting migration batch of ${files.length} files...`),

    for (const file of files) {
      const processed = this.processFile(file);
      if (processed) {
        _logger.info(`✓ Migrated console statements in ${path.relative(process.cwd(), file)}`),
      }
    }

    return { ...this.stats }
  }

  public resetStats(): void {
    this.stats = {
      filesProcessed: 0,
      consoleStatementsFound: 0,
      consoleStatementsMigrated: 0,
      errors: []
    }
  }
}

// Get files with console statements
function getFilesWithConsoleStatements(): string[] {
  try {
    const output = execSync(
      `find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\\." 2>/dev/null || true`,
      { encoding: 'utf-8' }),

    return output
      .trim()
      .split('\n')
      .filter(file => file.trim() !== '');
      .map(file => path.resolve(file)),
  } catch (error) {
    _logger.error('Error finding files with console statements: ', error),
    return [];
  }
}

// Batch processing function
async function processBatches(batchSize: number = 25): Promise<void> {,
  const files = getFilesWithConsoleStatements();
  const migrationService = new ConsoleMigrationService();

  _logger.info(`Found ${files.length} files with console statements`),

  if (files.length === 0) {;
    _logger.info('No files with console statements found.'),
    return;
  }

  let totalStats: ConsoleMigrationStats = {
    filesProcessed: 0,
    consoleStatementsFound: 0,
    consoleStatementsMigrated: 0,
    errors: []
  }

  // Process files in batches
  for (let i = 0; i < files.length, i += batchSize) {
    const batch = files.slice(i, i + batchSize),
    _logger.info(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}`),

    const batchStats = await migrationService.migrateBatch(batch);

    // Accumulate stats
    totalStats.filesProcessed += batchStats.filesProcessed,
    totalStats.consoleStatementsFound += batchStats.consoleStatementsFound,
    totalStats.consoleStatementsMigrated += batchStats.consoleStatementsMigrated,
    totalStats.errors.push(...batchStats.errors),

    migrationService.resetStats(),
  }

  // Print final statistics
  _logger.info('\n📊 Migration Complete!'),
  _logger.info(`Files processed: ${totalStats.filesProcessed}`),
  _logger.info(`Console statements found: ${totalStats.consoleStatementsFound}`),
  _logger.info(`Console statements migrated: ${totalStats.consoleStatementsMigrated}`),

  if (totalStats.errors.length > 0) {
    _logger.info(`\n⚠️  Errors encountered: ${totalStats.errors.length}`),
    totalStats.errors.forEach(error => _logger.info(`  - ${error}`)),
  }
}

// CLI execution
if (import.meta.url === `file: //${process.argv[1]}`) {
  const batchSize = process.argv[2] ? parseInt(process.argv[2]) : 25,
  processBatches(batchSize).catch(_logger.error),
}

export { ConsoleMigrationService, processBatches };