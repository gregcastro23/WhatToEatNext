#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

class ImportExportFixer {
  constructor(dryRun = true) {
    this.dryRun = dryRun;
    this.changes = [];
    this.errors = [];
    this.processedFiles = new Set();
  }

  async run() {
    console.log(`🔧 Running Import/Export Fixer (dry-run: ${this.dryRun})`);
    
    try {
      // Get TypeScript errors related to imports/exports
      const errors = await this.getImportExportErrors();
      console.log(`📊 Found ${errors.length} import/export related errors`);
      
      // Group errors by file for efficient processing
      const errorsByFile = this.groupErrorsByFile(errors);
      
      // Process each file
      for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
        await this.processFile(filePath, fileErrors);
      }
      
      // Apply changes
      await this.applyChanges();
      
      console.log(`✅ Summary: ${this.changes.length} changes, ${this.errors.length} errors`);
      
    } catch (error) {
      console.error('❌ Error during import/export fixing:', error.message);
      process.exit(1);
    }
  }

  async getImportExportErrors() {
    try {
      await execAsync('yarn tsc --noEmit', { 
        cwd: path.resolve(__dirname, '../..'), 
        maxBuffer: 1024 * 1024 * 10
      });
      return [];
    } catch (error) {
      const errorOutput = error.stderr || error.stdout || '';
      return this.parseImportExportErrors(errorOutput);
    }
  }

  parseImportExportErrors(output) {
    const lines = output.split('\n');
    const errors = [];
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
      
      if (match) {
        const [, filePath, lineNum, colNum, errorCode, message] = match;
        
        // Filter for import/export related errors
        if (this.isImportExportError(message, errorCode)) {
          errors.push({
            file: filePath,
            line: parseInt(lineNum),
            column: parseInt(colNum),
            code: errorCode,
            message: message.trim(),
            category: this.categorizeError(message, errorCode)
          });
        }
      }
    }
    
    return errors;
  }

  isImportExportError(message, code) {
    const importExportCodes = ['TS2307', 'TS2339', 'TS2300', 'TS2440', 'TS2724', 'TS5097'];
    const importExportMessages = [
      'has no exported member',
      'Cannot find module',
      'Module not found',
      'Relative import paths need explicit file extensions',
      'Duplicate identifier',
      'Import declaration conflicts',
      'An import path can only end with',
      'Did you mean'
    ];
    
    return importExportCodes.includes(code) || 
           importExportMessages.some(msg => message.includes(msg));
  }

  categorizeError(message, code) {
    if (message.includes('has no exported member')) return 'missing-export';
    if (message.includes('Cannot find module')) return 'missing-module';
    if (message.includes('Duplicate identifier')) return 'duplicate-import';
    if (message.includes('Import declaration conflicts')) return 'conflicting-import';
    if (message.includes('An import path can only end with')) return 'file-extension';
    if (message.includes('Did you mean')) return 'typo-suggestion';
    return 'other-import';
  }

  groupErrorsByFile(errors) {
    const grouped = {};
    for (const error of errors) {
      if (!grouped[error.file]) {
        grouped[error.file] = [];
      }
      grouped[error.file].push(error);
    }
    return grouped;
  }

  async processFile(filePath, fileErrors) {
    if (this.processedFiles.has(filePath)) return;
    this.processedFiles.add(filePath);

    try {
      console.log(`\n📂 Processing: ${filePath}`);
      const content = await fs.readFile(filePath, 'utf8');
      let newContent = content;
      let hasChanges = false;

      for (const error of fileErrors) {
        const fix = await this.generateFix(error, content);
        if (fix) {
          console.log(`  🔧 ${error.category}: ${error.message}`);
          newContent = this.applyFix(newContent, fix);
          hasChanges = true;
          
          this.changes.push({
            file: filePath,
            error: error.message,
            fix: fix.description,
            line: error.line
          });
        }
      }

      if (hasChanges && !this.dryRun) {
        await fs.writeFile(filePath, newContent);
        console.log(`  ✅ Fixed ${fileErrors.length} issues in ${path.basename(filePath)}`);
      } else if (hasChanges) {
        console.log(`  📝 Would fix ${fileErrors.length} issues in ${path.basename(filePath)}`);
      }

    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  async generateFix(error, content) {
    const { message, category, line } = error;
    
    switch (category) {
      case 'missing-export':
        return this.fixMissingExport(error, content);
      
      case 'duplicate-import':
        return this.fixDuplicateImport(error, content);
      
      case 'conflicting-import':
        return this.fixConflictingImport(error, content);
      
      case 'file-extension':
        return this.fixFileExtension(error, content);
      
      case 'typo-suggestion':
        return this.fixTypoSuggestion(error, content);
      
      case 'missing-module':
        return this.fixMissingModule(error, content);
      
      default:
        return null;
    }
  }

  fixMissingExport(error, content) {
    // Extract the missing member from error message
    const match = error.message.match(/has no exported member '(.+?)'/);
    if (!match) return null;
    
    const missingMember = match[1];
    const lines = content.split('\n');
    const errorLine = lines[error.line - 1];
    
    // Common fixes for missing exports
    const commonFixes = {
      'ElementalProperties': 'ElementalProperties',
      'AstrologicalState': 'AstrologicalState', 
      'CelestialPosition': 'PlanetaryPosition',
      'PlanetPosition': 'PlanetaryPosition',
      'Element': 'Element',
      'Recipe': 'Recipe'
    };
    
    if (commonFixes[missingMember]) {
      const replacement = commonFixes[missingMember];
      if (replacement !== missingMember) {
        return {
          type: 'replace',
          lineNumber: error.line,
          oldText: missingMember,
          newText: replacement,
          description: `Replace '${missingMember}' with '${replacement}'`
        };
      }
    }
    
    return null;
  }

  fixDuplicateImport(error, content) {
    const match = error.message.match(/Duplicate identifier '(.+?)'/);
    if (!match) return null;
    
    const duplicateId = match[1];
    const lines = content.split('\n');
    
    // Find all import lines with this identifier
    const importLines = [];
    lines.forEach((line, index) => {
      if (line.includes('import') && line.includes(duplicateId)) {
        importLines.push({ line: line.trim(), index: index + 1 });
      }
    });
    
    // If we have multiple imports, remove duplicates
    if (importLines.length > 1) {
      // Keep the first import, remove others
      const linesToRemove = importLines.slice(1);
      
      return {
        type: 'remove-lines',
        lines: linesToRemove.map(l => l.index),
        description: `Remove duplicate import of '${duplicateId}'`
      };
    }
    
    return null;
  }

  fixConflictingImport(error, content) {
    // Similar to duplicate import but more specific handling
    return this.fixDuplicateImport(error, content);
  }

  fixFileExtension(error, content) {
    const lines = content.split('\n');
    const errorLine = lines[error.line - 1];
    
    // Fix .ts extension in imports
    if (errorLine.includes('.ts"') || errorLine.includes(".ts'")) {
      const newLine = errorLine.replace(/\.ts(['"])/g, '$1');
      
      return {
        type: 'replace-line',
        lineNumber: error.line,
        oldText: errorLine,
        newText: newLine,
        description: 'Remove .ts extension from import path'
      };
    }
    
    return null;
  }

  fixTypoSuggestion(error, content) {
    const match = error.message.match(/Did you mean '(.+?)'\?/);
    if (!match) return null;
    
    const suggestion = match[1];
    const lines = content.split('\n');
    const errorLine = lines[error.line - 1];
    
    // Extract the incorrect identifier from the error context
    const propertyMatch = error.message.match(/Property '(.+?)' does not exist/);
    if (propertyMatch) {
      const wrongProperty = propertyMatch[1];
      const newLine = errorLine.replace(wrongProperty, suggestion);
      
      return {
        type: 'replace-line',
        lineNumber: error.line,
        oldText: errorLine,
        newText: newLine,
        description: `Replace '${wrongProperty}' with '${suggestion}'`
      };
    }
    
    return null;
  }

  fixMissingModule(error, content) {
    const lines = content.split('\n');
    const errorLine = lines[error.line - 1];
    
    // Common module path fixes
    const modulePathFixes = {
      '../utils/ingredientMapping': '../utils/ingredient/ingredientUtils',
      '../utils/recipeFiltering': '../utils/recipe/recipeFiltering'
    };
    
    for (const [oldPath, newPath] of Object.entries(modulePathFixes)) {
      if (errorLine.includes(oldPath)) {
        const newLine = errorLine.replace(oldPath, newPath);
        return {
          type: 'replace-line',
          lineNumber: error.line,
          oldText: errorLine,
          newText: newLine,
          description: `Update import path from '${oldPath}' to '${newPath}'`
        };
      }
    }
    
    return null;
  }

  applyFix(content, fix) {
    const lines = content.split('\n');
    
    switch (fix.type) {
      case 'replace':
        lines[fix.lineNumber - 1] = lines[fix.lineNumber - 1].replace(fix.oldText, fix.newText);
        break;
      
      case 'replace-line':
        lines[fix.lineNumber - 1] = fix.newText;
        break;
      
      case 'remove-lines':
        // Mark lines for removal (we'll filter them out)
        fix.lines.forEach(lineNum => {
          lines[lineNum - 1] = null;
        });
        return lines.filter(line => line !== null).join('\n');
      
      default:
        console.warn(`Unknown fix type: ${fix.type}`);
        return content;
    }
    
    return lines.join('\n');
  }

  async applyChanges() {
    if (this.dryRun) {
      console.log('\n📋 DRY RUN - Changes that would be made:');
      this.changes.forEach((change, index) => {
        console.log(`${index + 1}. ${path.basename(change.file)}:${change.line}`);
        console.log(`   Error: ${change.error}`);
        console.log(`   Fix: ${change.fix}\n`);
      });
      return;
    }
    
    console.log(`\n✅ Applied ${this.changes.length} fixes across ${this.processedFiles.size} files`);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (args.includes('--help')) {
  console.log(`
Import/Export Fixer

Fixes TypeScript import/export errors systematically.

Usage:
  node fix-import-exports-targeted.js [options]

Options:
  --dry-run    Preview changes without applying them (default)
  --execute    Apply the fixes to files
  --help       Show this help message

Examples:
  node fix-import-exports-targeted.js                    # Dry run
  node fix-import-exports-targeted.js --execute          # Apply fixes
`);
  process.exit(0);
}

// Run the fixer
const fixer = new ImportExportFixer(dryRun);
fixer.run().catch(error => {
  console.error('❌ Import/Export fixing failed:', error);
  process.exit(1);
}); 