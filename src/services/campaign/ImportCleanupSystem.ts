/**
 * Import Cleanup System
 * Automated import detection, removal, and organization system
 * Part of the Kiro Optimization Campaign System
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import { logger } from '../../utils/logger';

export interface ImportCleanupConfig {
  maxFilesPerBatch: number;
  safetyValidationEnabled: boolean;
  buildValidationFrequency: number;
  importStyleEnforcement: boolean;
  organizationRules: ImportOrganizationRules;
}

export interface ImportOrganizationRules {
  groupExternalImports: boolean;
  groupInternalImports: boolean;
  sortAlphabetically: boolean;
  separateTypeImports: boolean;
  enforceTrailingCommas: boolean;
  maxLineLength: number;
}

export interface ImportCleanupResult {
  filesProcessed: string[];
  unusedImportsRemoved: number;
  importsOrganized: number;
  styleViolationsFixed: number;
  buildValidationPassed: boolean;
  errors: string[];
  warnings: string[];
}

export interface UnusedImport {
  filePath: string;
  importName: string;
  importLine: number;
  importStatement: string;
  isTypeImport: boolean;
}

export class ImportCleanupSystem {
  private config: ImportCleanupConfig;
  private processedFiles: Set<string> = new Set();

  constructor(config: ImportCleanupConfig) {
    this.config = config;
  }

  /**
   * Execute comprehensive import cleanup
   */
  async executeCleanup(targetFiles?: string[]): Promise<ImportCleanupResult> {
    const startTime = Date.now();
    logger.info('Starting import cleanup system execution');

    try {
      // Get files to process
      const filesToProcess = targetFiles || await this.getTypeScriptFiles();
      const batchedFiles = this.batchFiles(filesToProcess);

      let totalResult: ImportCleanupResult = {
        filesProcessed: [],
        unusedImportsRemoved: 0,
        importsOrganized: 0,
        styleViolationsFixed: 0,
        buildValidationPassed: true,
        errors: [],
        warnings: []
      };

      // Process files in batches
      for (let i = 0; i < batchedFiles.length; i++) {
        const batch = batchedFiles[i];
        logger.info(`Processing batch ${i + 1}/${batchedFiles.length} (${batch.length} files)`);

        const batchResult = await this.processBatch(batch);
        totalResult = this.mergeBatchResults(totalResult, batchResult);

        // Validate build after each batch if enabled
        if (this.config.safetyValidationEnabled && 
            (i + 1) % this.config.buildValidationFrequency === 0) {
          const buildValid = await this.validateBuild();
          if (!buildValid) {
            totalResult.buildValidationPassed = false;
            totalResult.errors.push(`Build validation failed after batch ${i + 1}`);
            break;
          }
        }
      }

      const executionTime = Date.now() - startTime;
      logger.info(`Import cleanup completed in ${executionTime}ms`, {
        filesProcessed: totalResult.filesProcessed.length,
        unusedImportsRemoved: totalResult.unusedImportsRemoved,
        importsOrganized: totalResult.importsOrganized
      });

      return totalResult;

    } catch (error) {
      logger.error('Import cleanup system failed', error);
      return {
        filesProcessed: [],
        unusedImportsRemoved: 0,
        importsOrganized: 0,
        styleViolationsFixed: 0,
        buildValidationPassed: false,
        errors: [error.message],
        warnings: []
      };
    }
  }

  /**
   * Detect unused imports across the codebase
   */
  async detectUnusedImports(filePaths?: string[]): Promise<UnusedImport[]> {
    const files = filePaths || await this.getTypeScriptFiles();
    const unusedImports: UnusedImport[] = [];

    for (const filePath of files) {
      try {
        const fileUnusedImports = await this.detectUnusedImportsInFile(filePath);
        unusedImports.push(...fileUnusedImports);
      } catch (error) {
        logger.warn(`Failed to analyze imports in ${filePath}`, error);
      }
    }

    return unusedImports;
  }

  /**
   * Remove unused imports from files
   */
  async removeUnusedImports(filePaths: string[]): Promise<number> {
    let removedCount = 0;

    for (const filePath of filePaths) {
      try {
        const removed = await this.removeUnusedImportsFromFile(filePath);
        removedCount += removed;
        this.processedFiles.add(filePath);
      } catch (error) {
        logger.error(`Failed to remove unused imports from ${filePath}`, error);
      }
    }

    return removedCount;
  }

  /**
   * Organize imports according to style rules
   */
  async organizeImports(filePaths: string[]): Promise<number> {
    let organizedCount = 0;

    for (const filePath of filePaths) {
      try {
        const organized = await this.organizeImportsInFile(filePath);
        if (organized) {
          organizedCount++;
          this.processedFiles.add(filePath);
        }
      } catch (error) {
        logger.error(`Failed to organize imports in ${filePath}`, error);
      }
    }

    return organizedCount;
  }

  /**
   * Enforce import style consistency
   */
  async enforceImportStyle(filePaths: string[]): Promise<number> {
    let fixedCount = 0;

    for (const filePath of filePaths) {
      try {
        const fixed = await this.enforceImportStyleInFile(filePath);
        if (fixed) {
          fixedCount++;
          this.processedFiles.add(filePath);
        }
      } catch (error) {
        logger.error(`Failed to enforce import style in ${filePath}`, error);
      }
    }

    return fixedCount;
  }

  // Private implementation methods

  private async processBatch(filePaths: string[]): Promise<ImportCleanupResult> {
    const result: ImportCleanupResult = {
      filesProcessed: [],
      unusedImportsRemoved: 0,
      importsOrganized: 0,
      styleViolationsFixed: 0,
      buildValidationPassed: true,
      errors: [],
      warnings: []
    };

    // Step 1: Remove unused imports
    try {
      result.unusedImportsRemoved = await this.removeUnusedImports(filePaths);
    } catch (error) {
      result.errors.push(`Unused import removal failed: ${error.message}`);
    }

    // Step 2: Organize imports
    if (this.config.organizationRules.groupExternalImports || 
        this.config.organizationRules.groupInternalImports) {
      try {
        result.importsOrganized = await this.organizeImports(filePaths);
      } catch (error) {
        result.errors.push(`Import organization failed: ${error.message}`);
      }
    }

    // Step 3: Enforce style consistency
    if (this.config.importStyleEnforcement) {
      try {
        result.styleViolationsFixed = await this.enforceImportStyle(filePaths);
      } catch (error) {
        result.errors.push(`Import style enforcement failed: ${error.message}`);
      }
    }

    result.filesProcessed = Array.from(this.processedFiles);
    return result;
  }

  private async detectUnusedImportsInFile(filePath: string): Promise<UnusedImport[]> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const unusedImports: UnusedImport[] = [];

    // Parse import statements
    const importRegex = /^import\s+(?:type\s+)?(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"];?/;
    const typeImportRegex = /^import\s+type\s+/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(importRegex);
      
      if (match) {
        const isTypeImport = typeImportRegex.test(line);
        const importStatement = line;
        
        // Extract imported names
        let importedNames: string[] = [];
        if (match[1]) {
          // Named imports: { name1, name2 }
          importedNames = match[1].split(',').map(name => name.trim());
        } else if (match[2]) {
          // Namespace import: * as name
          importedNames = [match[2]];
        } else if (match[3]) {
          // Default import: name
          importedNames = [match[3]];
        }

        // Check if each imported name is used
        for (const importName of importedNames) {
          if (!this.isImportUsed(content, importName, i)) {
            unusedImports.push({
              filePath,
              importName,
              importLine: i + 1,
              importStatement,
              isTypeImport
            });
          }
        }
      }
    }

    return unusedImports;
  }

  private isImportUsed(content: string, importName: string, importLineIndex: number): boolean {
    const lines = content.split('\n');
    
    // Remove the import line from consideration
    const contentWithoutImport = lines
      .filter((_, index) => index !== importLineIndex)
      .join('\n');

    // Check for usage patterns
    const usagePatterns = [
      new RegExp(`\\b${importName}\\b`, 'g'), // Direct usage
      new RegExp(`\\b${importName}\\.`, 'g'), // Property access
      new RegExp(`\\b${importName}\\(`, 'g'), // Function call
      new RegExp(`<${importName}\\b`, 'g'), // JSX component
      new RegExp(`extends\\s+${importName}\\b`, 'g'), // Class extension
      new RegExp(`implements\\s+${importName}\\b`, 'g'), // Interface implementation
      new RegExp(`:\\s*${importName}\\b`, 'g'), // Type annotation
    ];

    return usagePatterns.some(pattern => pattern.test(contentWithoutImport));
  }

  private async removeUnusedImportsFromFile(filePath: string): Promise<number> {
    const unusedImports = await this.detectUnusedImportsInFile(filePath);
    if (unusedImports.length === 0) {
      return 0;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let removedCount = 0;

    // Group unused imports by line
    const unusedByLine = new Map<number, UnusedImport[]>();
    for (const unused of unusedImports) {
      const lineIndex = unused.importLine - 1;
      if (!unusedByLine.has(lineIndex)) {
        unusedByLine.set(lineIndex, []);
      }
      unusedByLine.get(lineIndex)!.push(unused);
    }

    // Process lines in reverse order to maintain line numbers
    const sortedLines = Array.from(unusedByLine.keys()).sort((a, b) => b - a);
    
    for (const lineIndex of sortedLines) {
      const lineUnused = unusedByLine.get(lineIndex)!;
      const originalLine = lines[lineIndex];
      
      // If all imports on this line are unused, remove the entire line
      const allImportsOnLine = this.extractAllImportsFromLine(originalLine);
      const allUnused = allImportsOnLine.every(imp => 
        lineUnused.some(unused => unused.importName === imp)
      );

      if (allUnused) {
        lines.splice(lineIndex, 1);
        removedCount += lineUnused.length;
      } else {
        // Remove only specific unused imports from the line
        let modifiedLine = originalLine;
        for (const unused of lineUnused) {
          modifiedLine = this.removeImportFromLine(modifiedLine, unused.importName);
          removedCount++;
        }
        lines[lineIndex] = modifiedLine;
      }
    }

    // Write the modified content back
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    return removedCount;
  }

  private extractAllImportsFromLine(line: string): string[] {
    const importRegex = /^import\s+(?:type\s+)?(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from/;
    const match = line.match(importRegex);
    
    if (!match) return [];
    
    if (match[1]) {
      // Named imports
      return match[1].split(',').map(name => name.trim());
    } else if (match[2]) {
      // Namespace import
      return [match[2]];
    } else if (match[3]) {
      // Default import
      return [match[3]];
    }
    
    return [];
  }

  private removeImportFromLine(line: string, importName: string): string {
    // Handle different import patterns
    const patterns = [
      // Remove from named imports: { name1, name2, name3 } -> { name1, name3 }
      {
        regex: new RegExp(`\\{([^}]*?)\\b${importName}\\b,?([^}]*?)\\}`, 'g'),
        replacement: (match: string, before: string, after: string) => {
          const cleanBefore = before.replace(/,\s*$/, '').trim();
          const cleanAfter = after.replace(/^\s*,/, '').trim();
          const combined = [cleanBefore, cleanAfter].filter(Boolean).join(', ');
          return `{${combined}}`;
        }
      }
    ];

    let modifiedLine = line;
    for (const pattern of patterns) {
      modifiedLine = modifiedLine.replace(pattern.regex, pattern.replacement as any);
    }

    return modifiedLine;
  }

  private async organizeImportsInFile(filePath: string): Promise<boolean> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Find import section
    const importLines: { line: string; index: number; isExternal: boolean; isType: boolean }[] = [];
    const importRegex = /^import\s+/;
    const typeImportRegex = /^import\s+type\s+/;
    const externalImportRegex = /from\s+['"](?![@./])/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (importRegex.test(line)) {
        importLines.push({
          line: lines[i],
          index: i,
          isExternal: externalImportRegex.test(line),
          isType: typeImportRegex.test(line)
        });
      } else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
        // Stop at first non-import, non-comment line
        break;
      }
    }

    if (importLines.length === 0) {
      return false;
    }

    // Organize imports according to rules
    const organizedImports = this.organizeImportLines(importLines);
    
    // Check if organization changed anything
    const originalImportSection = importLines.map(imp => imp.line).join('\n');
    const organizedImportSection = organizedImports.join('\n');
    
    if (originalImportSection === organizedImportSection) {
      return false;
    }

    // Replace import section
    const firstImportIndex = importLines[0].index;
    const lastImportIndex = importLines[importLines.length - 1].index;
    
    const newLines = [
      ...lines.slice(0, firstImportIndex),
      ...organizedImports,
      ...lines.slice(lastImportIndex + 1)
    ];

    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    return true;
  }

  private organizeImportLines(importLines: { line: string; isExternal: boolean; isType: boolean }[]): string[] {
    const { organizationRules } = this.config;
    const organized: string[] = [];

    // Separate imports by type
    const externalImports = importLines.filter(imp => imp.isExternal);
    const internalImports = importLines.filter(imp => !imp.isExternal);

    // Sort function
    const sortImports = (imports: typeof importLines) => {
      if (organizationRules.sortAlphabetically) {
        return imports.sort((a, b) => a.line.localeCompare(b.line));
      }
      return imports;
    };

    // Separate type imports if configured
    if (organizationRules.separateTypeImports) {
      const externalTypeImports = sortImports(externalImports.filter(imp => imp.isType));
      const externalValueImports = sortImports(externalImports.filter(imp => !imp.isType));
      const internalTypeImports = sortImports(internalImports.filter(imp => imp.isType));
      const internalValueImports = sortImports(internalImports.filter(imp => !imp.isType));

      // Add external imports
      if (organizationRules.groupExternalImports) {
        organized.push(...externalTypeImports.map(imp => imp.line));
        if (externalTypeImports.length > 0 && externalValueImports.length > 0) {
          organized.push(''); // Empty line between type and value imports
        }
        organized.push(...externalValueImports.map(imp => imp.line));
        
        if ((externalTypeImports.length > 0 || externalValueImports.length > 0) && 
            (internalTypeImports.length > 0 || internalValueImports.length > 0)) {
          organized.push(''); // Empty line between external and internal
        }
      }

      // Add internal imports
      if (organizationRules.groupInternalImports) {
        organized.push(...internalTypeImports.map(imp => imp.line));
        if (internalTypeImports.length > 0 && internalValueImports.length > 0) {
          organized.push(''); // Empty line between type and value imports
        }
        organized.push(...internalValueImports.map(imp => imp.line));
      }
    } else {
      // Don't separate type imports
      if (organizationRules.groupExternalImports) {
        organized.push(...sortImports(externalImports).map(imp => imp.line));
        if (externalImports.length > 0 && internalImports.length > 0) {
          organized.push(''); // Empty line between external and internal
        }
      }

      if (organizationRules.groupInternalImports) {
        organized.push(...sortImports(internalImports).map(imp => imp.line));
      }
    }

    return organized;
  }

  private async enforceImportStyleInFile(filePath: string): Promise<boolean> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^import\s+/.test(line.trim())) {
        const styledLine = this.applyImportStyle(line);
        if (styledLine !== line) {
          lines[i] = styledLine;
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    }

    return modified;
  }

  private applyImportStyle(line: string): string {
    const { organizationRules } = this.config;
    let styledLine = line;

    // Enforce trailing commas in multi-line imports
    if (organizationRules.enforceTrailingCommas) {
      styledLine = styledLine.replace(/\{\s*([^}]+[^,])\s*\}/g, (match, imports) => {
        if (imports.includes(',')) {
          return `{ ${imports.trim()}, }`;
        }
        return match;
      });
    }

    // Enforce line length limits
    if (organizationRules.maxLineLength && styledLine.length > organizationRules.maxLineLength) {
      // Break long import lines
      const importMatch = styledLine.match(/^(\s*import\s+(?:type\s+)?\{)([^}]+)(\}\s+from\s+.+)$/);
      if (importMatch) {
        const [, prefix, imports, suffix] = importMatch;
        const importList = imports.split(',').map(imp => imp.trim());
        
        if (importList.length > 1) {
          const formattedImports = importList.map(imp => `  ${imp}`).join(',\n');
          styledLine = `${prefix}\n${formattedImports}\n${suffix}`;
        }
      }
    }

    return styledLine;
  }

  private async getTypeScriptFiles(): Promise<string[]> {
    try {
      const output = execSync(
        'find src -name "*.ts" -o -name "*.tsx" | grep -v __tests__ | grep -v .test. | grep -v .spec.',
        { encoding: 'utf8', stdio: 'pipe' }
      );
      return output.trim().split('\n').filter(Boolean);
    } catch (error) {
      logger.error('Failed to get TypeScript files', error);
      return [];
    }
  }

  private batchFiles(files: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < files.length; i += this.config.maxFilesPerBatch) {
      batches.push(files.slice(i, i + this.config.maxFilesPerBatch));
    }
    return batches;
  }

  private async validateBuild(): Promise<boolean> {
    try {
      execSync('yarn tsc --noEmit --skipLibCheck', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 30000 
      });
      return true;
    } catch (error) {
      logger.warn('Build validation failed during import cleanup', error);
      return false;
    }
  }

  private mergeBatchResults(total: ImportCleanupResult, batch: ImportCleanupResult): ImportCleanupResult {
    return {
      filesProcessed: [...total.filesProcessed, ...batch.filesProcessed],
      unusedImportsRemoved: total.unusedImportsRemoved + batch.unusedImportsRemoved,
      importsOrganized: total.importsOrganized + batch.importsOrganized,
      styleViolationsFixed: total.styleViolationsFixed + batch.styleViolationsFixed,
      buildValidationPassed: total.buildValidationPassed && batch.buildValidationPassed,
      errors: [...total.errors, ...batch.errors],
      warnings: [...total.warnings, ...batch.warnings]
    };
  }
}

/**
 * Default configuration for import cleanup
 */
export const DEFAULT_IMPORT_CLEANUP_CONFIG: ImportCleanupConfig = {
  maxFilesPerBatch: 20,
  safetyValidationEnabled: true,
  buildValidationFrequency: 5,
  importStyleEnforcement: true,
  organizationRules: {
    groupExternalImports: true,
    groupInternalImports: true,
    sortAlphabetically: true,
    separateTypeImports: true,
    enforceTrailingCommas: true,
    maxLineLength: 100
  }
};