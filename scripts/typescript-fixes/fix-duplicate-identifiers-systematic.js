#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

class DuplicateIdentifierFixer {
  constructor(dryRun = true) {
    this.dryRun = dryRun;
    this.changes = [];
    this.errors = [];
    this.processedFiles = new Set();
  }

  async run() {
    console.log(`🔧 Running Duplicate Identifier Fixer (dry-run: ${this.dryRun})`);
    
    try {
      // Get TypeScript errors
      const errors = await this.getDuplicateErrors();
      console.log(`📊 Found ${errors.length} duplicate identifier errors`);
      
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
      console.error('❌ Error during duplicate fixing:', error.message);
      process.exit(1);
    }
  }

  async getDuplicateErrors() {
    try {
      await execAsync('yarn tsc --noEmit', { 
        cwd: path.resolve(__dirname, '../..'), 
        maxBuffer: 1024 * 1024 * 50  // Increased from 10MB to 50MB
      });
      return [];
    } catch (error) {
      const errorOutput = error.stderr || error.stdout || '';
      return this.parseDuplicateErrors(errorOutput);
    }
  }

  parseDuplicateErrors(output) {
    const lines = output.split('\n');
    const errors = [];
    
    for (const line of lines) {
      // Look for duplicate identifier and import conflict patterns
      if (line.includes('TS2300') || // Duplicate identifier
          line.includes('TS2305') || // Module has no exported member  
          line.includes('TS2307') || // Cannot find module
          line.includes('TS2339') || // Property does not exist
          line.includes('TS2502') || // Referenced is declared but never read
          line.includes('TS2749') || // Refers to value but being used as type
          line.includes('Import declaration conflicts') ||
          line.includes('has no exported member') ||
          line.includes('An import path can only end with')) {
        
        // Extract file path and error details
        const fileMatch = line.match(/^(.+?)\(\d+,\d+\):/);
        if (fileMatch) {
          const filePath = fileMatch[1];
          const message = line.split(': ').slice(2).join(': ');
          
          errors.push({
            file: filePath,
            message: message.trim(),
            fullLine: line,
            category: this.categorizeError(message)
          });
        }
      }
    }
    
    return errors;
  }

  categorizeError(message) {
    if (message.includes('Duplicate identifier')) return 'duplicate-identifier';
    if (message.includes('Import declaration conflicts')) return 'import-conflict';
    if (message.includes('has no exported member')) return 'missing-export';
    if (message.includes('Cannot find module')) return 'missing-module';
    if (message.includes('Property') && message.includes('does not exist')) return 'missing-property';
    if (message.includes('An import path can only end with')) return 'file-extension';
    return 'other';
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

      // Focus on the most common patterns
      const duplicateIdentifiers = fileErrors.filter(e => e.category === 'duplicate-identifier');
      const importConflicts = fileErrors.filter(e => e.category === 'import-conflict');
      const fileExtensionErrors = fileErrors.filter(e => e.category === 'file-extension');

      // Fix file extension issues first (easiest fix)
      if (fileExtensionErrors.length > 0) {
        const extensionFix = this.fixFileExtensions(newContent);
        if (extensionFix.changed) {
          newContent = extensionFix.content;
          hasChanges = true;
          console.log(`  🔧 Fixed ${fileExtensionErrors.length} file extension issues`);
          this.changes.push({
            file: filePath,
            type: 'file-extensions',
            count: fileExtensionErrors.length
          });
        }
      }

      // Fix duplicate identifiers
      if (duplicateIdentifiers.length > 0) {
        const duplicateFix = this.fixDuplicateIdentifiers(newContent, duplicateIdentifiers);
        if (duplicateFix.changed) {
          newContent = duplicateFix.content;
          hasChanges = true;
          console.log(`  🔧 Fixed ${duplicateIdentifiers.length} duplicate identifier issues`);
          this.changes.push({
            file: filePath,
            type: 'duplicate-identifiers',
            count: duplicateIdentifiers.length
          });
        }
      }

      // Fix import conflicts
      if (importConflicts.length > 0) {
        const conflictFix = this.fixImportConflicts(newContent, importConflicts);
        if (conflictFix.changed) {
          newContent = conflictFix.content;
          hasChanges = true;
          console.log(`  🔧 Fixed ${importConflicts.length} import conflict issues`);
          this.changes.push({
            file: filePath,
            type: 'import-conflicts',
            count: importConflicts.length
          });
        }
      }

      if (hasChanges && !this.dryRun) {
        await fs.writeFile(filePath, newContent);
        console.log(`  ✅ Applied fixes to ${path.basename(filePath)}`);
      } else if (hasChanges) {
        console.log(`  📝 Would apply fixes to ${path.basename(filePath)}`);
      }

    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  fixFileExtensions(content) {
    const lines = content.split('\n');
    let changed = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('import') && line.includes('.ts"')) {
        lines[i] = line.replace(/\.ts"/g, '"');
        changed = true;
      }
      if (line.includes('import') && line.includes(".ts'")) {
        lines[i] = line.replace(/\.ts'/g, "'");
        changed = true;
      }
    }
    
    return { content: lines.join('\n'), changed };
  }

  fixDuplicateIdentifiers(content, duplicateErrors) {
    const lines = content.split('\n');
    let changed = false;
    
    // Common duplicate identifiers to fix
    const duplicatePatterns = [
      'ElementalProperties',
      'AstrologicalState', 
      'Recipe',
      'Element',
      'PlanetaryPosition',
      'CelestialPosition',
      'AlchemicalProperties'
    ];
    
    // Remove duplicate import lines
    const importLines = [];
    const seenImports = new Set();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('import')) {
        // Extract the import signature for deduplication
        const importSignature = this.getImportSignature(line);
        
        if (seenImports.has(importSignature)) {
          lines[i] = ''; // Remove duplicate import
          changed = true;
        } else {
          seenImports.add(importSignature);
        }
      }
    }
    
    return { content: lines.join('\n'), changed };
  }

  fixImportConflicts(content, importConflicts) {
    const lines = content.split('\n');
    let changed = false;
    
    // Look for conflicting import patterns and resolve them
    const importMap = new Map();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('import')) {
        // Check for specific conflicts we can resolve automatically
        
        // Fix specific known conflicts
        if (line.includes('ElementalProperties') && line.includes('@/types/alchemy')) {
          // Keep the alchemy import, remove others
          const existingAlchemyImport = Array.from(lines.entries()).find(([idx, l]) => 
            l.includes('ElementalProperties') && l.includes('@/types/alchemy') && idx < i
          );
          
          if (existingAlchemyImport) {
            lines[i] = ''; // Remove this duplicate
            changed = true;
          }
        }
        
        // Similar fixes for other common conflicts
        if (line.includes('AstrologicalState') && line.includes('@/types/celestial')) {
          const existingCelestialImport = Array.from(lines.entries()).find(([idx, l]) => 
            l.includes('AstrologicalState') && l.includes('@/types/celestial') && idx < i
          );
          
          if (existingCelestialImport) {
            lines[i] = ''; // Remove this duplicate
            changed = true;
          }
        }
      }
    }
    
    return { content: lines.join('\n'), changed };
  }

  getImportSignature(importLine) {
    // Create a normalized signature for import comparison
    const cleaned = importLine.replace(/\s+/g, ' ').trim();
    
    // Extract the imported items and source
    const fromMatch = cleaned.match(/from ['"](.+?)['"]/);
    const importMatch = cleaned.match(/import\s+(.+?)\s+from/);
    
    if (fromMatch && importMatch) {
      const source = fromMatch[1];
      const imports = importMatch[1].replace(/[{}]/g, '').split(',').map(s => s.trim()).sort();
      return `${imports.join(',')}:${source}`;
    }
    
    return cleaned;
  }

  async applyChanges() {
    if (this.dryRun) {
      console.log('\n📋 DRY RUN - Changes that would be made:');
      this.changes.forEach((change, index) => {
        console.log(`${index + 1}. ${path.basename(change.file)}`);
        console.log(`   Type: ${change.type}`);
        console.log(`   Count: ${change.count} fixes\n`);
      });
      return;
    }
    
    console.log(`\n✅ Applied ${this.changes.length} sets of fixes across ${this.processedFiles.size} files`);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

if (args.includes('--help')) {
  console.log(`
Duplicate Identifier Fixer

Fixes TypeScript duplicate identifier and import conflict errors systematically.

Usage:
  node fix-duplicate-identifiers-systematic.js [options]

Options:
  --dry-run    Preview changes without applying them (default)
  --execute    Apply the fixes to files
  --help       Show this help message

Examples:
  node fix-duplicate-identifiers-systematic.js                    # Dry run
  node fix-duplicate-identifiers-systematic.js --execute          # Apply fixes
`);
  process.exit(0);
}

// Run the fixer
const fixer = new DuplicateIdentifierFixer(dryRun);
fixer.run().catch(error => {
  console.error('❌ Duplicate identifier fixing failed:', error);
  process.exit(1);
}); 