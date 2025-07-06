#!/usr/bin/env node

/**
 * Fix TS2724 Module Export Script
 * 
 * Fixes module export/import issues and namespace conflicts
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  maxFiles: 15
};

// Common module export patterns and fixes
const EXPORT_FIXES = {
  // Missing default export
  'missing_default': {
    pattern: /^(export\s+(?:interface|type|class|function|const|let|var))\s+(\w+)/gm,
    replacement: '$1 $2',
    description: 'Add missing default export'
  },
  
  // Namespace conflicts
  'namespace_conflict': {
    pattern: /namespace\s+(\w+)\s*{/g,
    replacement: 'export namespace $1 {',
    description: 'Fix namespace export'
  },
  
  // Missing export keyword
  'missing_export': {
    pattern: /^(\s*)(interface|type|class|function|const|let|var)\s+([A-Z]\w*)/gm,
    replacement: '$1export $2 $3',
    description: 'Add missing export keyword'
  }
};

// Common import fixes
const IMPORT_FIXES = {
  // Type-only imports
  'type_import': {
    pattern: /import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g,
    replacement: 'import type { $1 } from "$2"',
    description: 'Convert to type-only import'
  },
  
  // Namespace imports
  'namespace_import': {
    pattern: /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
    replacement: 'import * as $1 from "$2"',
    description: 'Fix namespace import'
  }
};

class ModuleExportFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.totalFixes = 0;
  }

  async fixFile(filePath, errors) {
    try {
      const originalContent = await fs.readFile(filePath, 'utf8');
      let content = originalContent;
      let fixes = 0;

      // Analyze error messages to determine fix strategy
      const errorMessages = errors.map(e => e.message);
      const hasNamespaceIssues = errorMessages.some(msg => msg.includes('namespace'));
      const hasExportIssues = errorMessages.some(msg => msg.includes('export'));
      const hasImportIssues = errorMessages.some(msg => msg.includes('import'));

      // Apply namespace fixes
      if (hasNamespaceIssues) {
        const namespacePattern = /^(\s*)(namespace\s+\w+\s*{)/gm;
        content = content.replace(namespacePattern, (match, indent, namespace) => {
          fixes++;
          return `${indent}export ${namespace}`;
        });
      }

      // Fix missing exports for interfaces and types
      if (hasExportIssues) {
        // Fix interfaces that should be exported
        const interfacePattern = /^(\s*)(interface\s+[A-Z]\w*)/gm;
        content = content.replace(interfacePattern, (match, indent, interfaceDecl) => {
          if (!match.includes('export')) {
            fixes++;
            return `${indent}export ${interfaceDecl}`;
          }
          return match;
        });

        // Fix types that should be exported
        const typePattern = /^(\s*)(type\s+[A-Z]\w*)/gm;
        content = content.replace(typePattern, (match, indent, typeDecl) => {
          if (!match.includes('export')) {
            fixes++;
            return `${indent}export ${typeDecl}`;
          }
          return match;
        });

        // Fix classes that should be exported
        const classPattern = /^(\s*)(class\s+[A-Z]\w*)/gm;
        content = content.replace(classPattern, (match, indent, classDecl) => {
          if (!match.includes('export')) {
            fixes++;
            return `${indent}export ${classDecl}`;
          }
          return match;
        });
      }

      // Fix import issues
      if (hasImportIssues) {
        // Convert problematic imports to type-only imports for type files
        if (filePath.includes('/types/') || filePath.endsWith('.d.ts')) {
          const importPattern = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g;
          content = content.replace(importPattern, (match, imports, from) => {
            // Check if these are likely type imports
            const typeNames = imports.split(',').map(s => s.trim());
            const hasTypes = typeNames.some(name => 
              name.match(/^[A-Z]/) || name.includes('Type') || name.includes('Interface')
            );
            
            if (hasTypes) {
              fixes++;
              return `import type { ${imports} } from "${from}"`;
            }
            return match;
          });
        }
      }

      // Fix re-export issues
      const reExportPattern = /export\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g;
      content = content.replace(reExportPattern, (match, exports, from) => {
        // Ensure proper re-export syntax
        const cleanExports = exports.split(',').map(s => s.trim()).join(', ');
        fixes++;
        return `export { ${cleanExports} } from "${from}"`;
      });

      // Fix module declaration issues
      const modulePattern = /^(\s*)(module\s+['"]([^'"]+)['"]\s*{)/gm;
      content = content.replace(modulePattern, (match, indent, moduleDecl) => {
        if (!match.includes('declare')) {
          fixes++;
          return `${indent}declare ${moduleDecl}`;
        }
        return match;
      });

      if (content !== originalContent) {
        if (!CONFIG.dryRun) {
          await fs.writeFile(filePath, content);
        }
        this.fixedFiles.add(filePath);
        this.totalFixes += fixes;
        return { fixed: true, fixes };
      }

      return { fixed: false, fixes: 0 };
    } catch (error) {
      console.error(`Error fixing ${filePath}:`, error.message);
      return { fixed: false, fixes: 0, error: error.message };
    }
  }

  async getTS2724Errors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const errorLines = error.stdout.split('\n');
      const errors = [];
      
      errorLines.forEach(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS2724: (.+)$/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: 'TS2724',
            message: match[4]
          });
        }
      });
      
      return errors;
    }
  }

  async run() {
    console.log('🔧 TS2724 Module Export Fixer');
    console.log(`⚙️  Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);

    const allErrors = await this.getTS2724Errors();
    
    // Group errors by file
    const errorsByFile = new Map();
    allErrors.forEach(error => {
      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file).push(error);
    });

    // Sort files by error count (descending)
    const sortedFiles = Array.from(errorsByFile.entries())
      .sort(([, errorsA], [, errorsB]) => errorsB.length - errorsA.length)
      .slice(0, CONFIG.maxFiles);

    console.log(`📁 Processing ${sortedFiles.length} files with TS2724 errors`);
    console.log(`🎯 Total TS2724 errors to fix: ${allErrors.length}`);

    if (CONFIG.dryRun) {
      console.log('📝 Preview mode - no files will be modified');
    }

    let processedFiles = 0;
    let fixedFiles = 0;

    for (const [filePath, errors] of sortedFiles) {
      console.log(`\n🔧 Fixing: ${path.basename(filePath)} (${errors.length} errors)`);
      
      const result = await this.fixFile(filePath, errors);
      
      if (result.fixed) {
        fixedFiles++;
        console.log(`  ✅ Applied ${result.fixes} module export fixes`);
      } else if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      } else {
        console.log(`  ⭐ No applicable fixes found`);
      }

      processedFiles++;

      // Build validation every 5 files
      if (processedFiles % 5 === 0 && !CONFIG.dryRun) {
        console.log('\n🏗️  Validating build...');
        if (this.validateBuild()) {
          console.log('✅ Build validation passed');
        } else {
          console.log('⚠️  Build has errors (some TypeScript errors expected)');
        }
      }
    }

    console.log('\n🏁 Module Export Fixing Complete');
    console.log(`📊 Statistics:`);
    console.log(`  - Files processed: ${processedFiles}`);
    console.log(`  - Files fixed: ${fixedFiles}`);
    console.log(`  - Total fixes applied: ${this.totalFixes}`);

    if (!CONFIG.dryRun) {
      console.log('\n🏗️  Final build validation...');
      if (this.validateBuild()) {
        console.log('✅ Build validation passed');
      } else {
        console.log('⚠️  Some TypeScript errors remain (continuing improvement)');
      }
    }
  }

  validateBuild() {
    try {
      execSync('yarn build', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log(`
TS2724 Module Export Fixer

Usage: node fix-ts2724-module-exports.js [options]

Options:
  --dry-run     Preview changes without modifying files
  --verbose     Show detailed progress information
  --help        Show this help message

Fixes:
  - Missing export keywords for interfaces, types, classes
  - Namespace export issues
  - Module declaration problems
  - Re-export syntax issues
    `);
    return;
  }

  try {
    const fixer = new ModuleExportFixer();
    await fixer.run();
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}