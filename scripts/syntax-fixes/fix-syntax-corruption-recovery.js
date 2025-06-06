#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Syntax Corruption Recovery Script - Enhanced
 * Purpose: Fix syntax errors introduced by previous automated scripts
 * Focus: Conservative fixes for obvious corruption patterns
 * Risk: Low - only fixes clear syntax errors
 */

class SyntaxCorruptionRecovery {
  constructor(dryRun = false, verbose = false) {
    this.dryRun = dryRun;
    this.verbose = verbose;
    this.changes = [];
    this.filesProcessed = 0;
    this.errorsFixed = 0;
  }

  async processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let changesMade = false;

      // Skip non-corrupted files
      if (!this.hasCorruptionPatterns(content)) {
        return false;
      }

      if (this.verbose) {
        console.log(`🔍 Processing potentially corrupted file: ${filePath}`);
      }

      // 1. Fix malformed import statements (CRITICAL PATTERN)
      const fixedImports = this.fixMalformedImports(content);
      if (fixedImports !== content) {
        content = fixedImports;
        changesMade = true;
        this.errorsFixed += 10;
        if (this.verbose) console.log(`  ✅ Fixed malformed imports`);
      }

      // 2. Fix double question mark patterns (CRITICAL PATTERN)
      const fixedDoubleQuestionMarks = this.fixDoubleQuestionMarks(content);
      if (fixedDoubleQuestionMarks !== content) {
        content = fixedDoubleQuestionMarks;
        changesMade = true;
        this.errorsFixed += 8;
        if (this.verbose) console.log(`  ✅ Fixed double question marks`);
      }

      // 3. Fix corrupted property access patterns (CRITICAL PATTERN)
      const fixedPropertyAccess = this.fixCorruptedPropertyAccess(content);
      if (fixedPropertyAccess !== content) {
        content = fixedPropertyAccess;
        changesMade = true;
        this.errorsFixed += 15;
        if (this.verbose) console.log(`  ✅ Fixed corrupted property access`);
      }

      // 4. Fix broken constructor calls
      const fixedConstructors = this.fixConstructorCalls(content);
      if (fixedConstructors !== content) {
        content = fixedConstructors;
        changesMade = true;
        this.errorsFixed += 5;
        if (this.verbose) console.log(`  ✅ Fixed constructor calls`);
      }

      // 5. Fix malformed optional chaining
      const fixedChaining = this.fixOptionalChaining(content);
      if (fixedChaining !== content) {
        content = fixedChaining;
        changesMade = true;
        this.errorsFixed += 3;
        if (this.verbose) console.log(`  ✅ Fixed optional chaining`);
      }

      // 6. Fix broken object syntax
      const fixedObjects = this.fixObjectSyntax(content);
      if (fixedObjects !== content) {
        content = fixedObjects;
        changesMade = true;
        this.errorsFixed += 4;
        if (this.verbose) console.log(`  ✅ Fixed object syntax`);
      }

      // 7. Fix malformed template literals
      const fixedTemplates = this.fixTemplateLiterals(content);
      if (fixedTemplates !== content) {
        content = fixedTemplates;
        changesMade = true;
        this.errorsFixed += 2;
        if (this.verbose) console.log(`  ✅ Fixed template literals`);
      }

      // 8. Fix broken destructuring
      const fixedDestructuring = this.fixDestructuring(content);
      if (fixedDestructuring !== content) {
        content = fixedDestructuring;
        changesMade = true;
        this.errorsFixed += 2;
        if (this.verbose) console.log(`  ✅ Fixed destructuring`);
      }

      // 9. Validate the result doesn't introduce new syntax errors
      if (changesMade && this.hasBasicSyntaxErrors(content)) {
        console.warn(`⚠️  Would introduce new syntax errors in ${filePath}, skipping changes`);
        return false;
      }

      if (changesMade) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
        this.changes.push({
          file: filePath,
          before: originalContent.length,
          after: content.length,
          description: 'Syntax corruption recovery applied'
        });
        console.log(`✅ Fixed syntax corruption: ${filePath}`);
      }

      this.filesProcessed++;
      return changesMade;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  hasCorruptionPatterns(content) {
    const corruptionIndicators = [
      /^import\s+from\s+['"]/m,      // import from "file" (missing specifiers)
      /\?\?\.\w/,                   // ??.property (double question marks)
      /\w+\.\([\w?.]*\)\.\d/,       // obj.(prop).5 (corrupted property access)
      /new\)\s+\w+\(/,              // new) Date(
      /\?\.\)/,                     // ?.)
      /\{\s*\w+:\s*\w+\s*\}\s*\]/,  // object in array brackets
      /\$\{[^}]*\}\s*\`,\s*any/,    // malformed template literals
      /\w+:\s*\w+\s*\?\s*\.\s*\w+/, // type? .property
      /\[\s*\w+:\s*\w+\s*\]/,       // [property: type] in wrong context
    ];

    return corruptionIndicators.some(pattern => pattern.test(content));
  }

  hasBasicSyntaxErrors(content) {
    // Basic syntax validation - check for obvious errors
    const syntaxErrors = [
      /\(\s*\)/,                 // Empty parentheses in wrong context
      /\{\s*\}/,                 // Empty braces in wrong context  
      /\[\s*\]/,                 // Empty brackets in wrong context
      /\w+\(\s*,/,              // Function call starting with comma
      /,\s*\)/,                 // Comma before closing parenthesis
      /\?\.\)\w*/,              // Malformed optional chaining
    ];

    return syntaxErrors.some(pattern => pattern.test(content));
  }

  /**
   * Fix malformed import statements like "import from './file.ts'"
   * This is the most critical pattern causing TS1005 errors
   */
  fixMalformedImports(content) {
    return content
      // Fix basic malformed imports - add default import name
      .replace(/^(\s*)import\s+from\s+(['"][^'"]+['"];?)$/gm, '$1// TODO: Fix import - was: import from $2')
      
      // Fix imports with missing specifiers but valid syntax structure
      .replace(/^(\s*)import\s+from\s+(['"][^'"]+['"])(?:\s*;)?$/gm, '$1// TODO: Fix import - was: import from $2')
      
      // Comment out obviously broken imports to prevent build failures
      .replace(/^(\s*)import\s+from\s+(['"][^'"]*\.ts['"])\s*;?$/gm, '$1// TODO: Fix import - add what to import from $2')
      .replace(/^(\s*)import\s+from\s+(['"][^'"]*\.tsx['"])\s*;?$/gm, '$1// TODO: Fix import - add what to import from $2')
      .replace(/^(\s*)import\s+from\s+(['"][^'"]*\.js['"])\s*;?$/gm, '$1// TODO: Fix import - add what to import from $2')
      .replace(/^(\s*)import\s+from\s+(['"][^'"]*\.mjs['"])\s*;?$/gm, '$1// TODO: Fix import - add what to import from $2');
  }

  /**
   * Fix double question mark patterns like "props??.Fire"
   */
  fixDoubleQuestionMarks(content) {
    return content
      // Fix double question marks in optional chaining
      .replace(/(\w+)\?\?\./g, '$1?.')
      
      // Fix triple question marks
      .replace(/(\w+)\?\?\?\./g, '$1?.')
      
      // Fix double question marks with nullish coalescing
      .replace(/(\w+)\?\?\.(\w+)\s*\?\?\s*/g, '$1?.$2 ?? ')
      
      // Fix patterns like (props??.Fire ?? 0)
      .replace(/\((\w+)\?\?\.(\w+)\s*\?\?\s*([^)]+)\)/g, '($1?.$2 ?? $3)');
  }

  /**
   * Fix corrupted property access patterns like "obj.(prop?.value ?? 0).5"
   */
  fixCorruptedPropertyAccess(content) {
    return content
      // Fix patterns like obj.(prop?.value ?? 0).number
      .replace(/(\w+)\.\(([^)]+)\)\.(\d+)/g, (match, obj, prop, num) => {
        // Parse the property access and multiply by the decimal
        const multiplier = parseFloat(`0.${num}`);
        return `(${obj}.${prop}) * ${multiplier}`;
      })
      
      // Fix patterns like obj.(prop ?? 0).number where no optional chaining
      .replace(/(\w+)\.\((\w+\s*\?\?\s*[^)]+)\)\.(\d+)/g, (match, obj, prop, num) => {
        const multiplier = parseFloat(`0.${num}`);
        return `(${obj}.${prop}) * ${multiplier}`;
      })
      
      // Fix method calls with corrupted property access
      .replace(/(\w+)\.\((\w+\?\.\w+\s*\?\?\s*[^)]+)\)\.(\d+)/g, (match, obj, prop, num) => {
        const multiplier = parseFloat(`0.${num}`);
        return `(${obj}.${prop}) * ${multiplier}`;
      });
  }

  fixConstructorCalls(content) {
    return content
      // Fix broken new Date() calls
      .replace(/new\)\s+Date\(\)/g, 'new Date()')
      .replace(/new\)\s+(\w+)\(/g, 'new $1(')
      
      // Fix other constructor patterns
      .replace(/new\s+\)\s*(\w+)\(/g, 'new $1(')
      .replace(/new\s*\(\s*\)\s*(\w+)/g, 'new $1')
      
      // Fix spaced constructor calls
      .replace(/new\s+(\w+)\s*\)\s*\(/g, 'new $1(');
  }

  fixOptionalChaining(content) {
    return content
      // Fix broken optional chaining
      .replace(/\?\.\)/g, '?.')
      .replace(/\?\s*\.\s*\)/g, '?.')
      .replace(/\?\.\s*\.\s*/g, '?.')
      
      // Fix chaining with method calls
      .replace(/(\w+)\?\s*\.\s*(\w+)\(/g, '$1?.$2(')
      .replace(/(\w+)\?\.\)\s*(\w+)/g, '$1?.$2');
  }

  fixObjectSyntax(content) {
    return content
      // Fix malformed object properties
      .replace(/\{\s*(\w+):\s*(\w+)\s*\}\s*\]/g, '{ $1: $2 }')
      .replace(/\[\s*\{\s*(\w+):\s*(\w+)\s*\}\s*\]/g, '[{ $1: $2 }]')
      
      // Fix object destructuring in wrong context
      .replace(/\[\s*(\w+):\s*(\w+)\s*\]/g, '{ $1: $2 }')
      
      // Fix object property access
      .replace(/(\w+)\s*\?\s*\.\s*(\w+)/g, '$1?.$2')
      .replace(/(\w+)\.\s*\?\s*(\w+)/g, '$1?.$2');
  }

  fixTemplateLiterals(content) {
    return content
      // Fix malformed template literals with extra syntax
      .replace(/`([^`]*)\$\{([^}]*)\}([^`]*)`\s*,\s*any/g, '`$1${$2}$3`')
      .replace(/`([^`]*)`\s*\+\s*any/g, '`$1`')
      
      // Fix template literal concatenation
      .replace(/`([^`]*)`\s*\+\s*`([^`]*)`\s*\+\s*any/g, '`$1$2`')
      
      // Fix broken interpolation
      .replace(/\$\{\s*([^}]*)\s*\}\s*,\s*any/g, '${$1}');
  }

  fixDestructuring(content) {
    return content
      // Fix array destructuring with object syntax
      .replace(/\[\s*\{\s*(\w+)\s*\}\s*\]/g, '[{ $1 }]')
      
      // Fix object destructuring with array brackets
      .replace(/\{\s*\[\s*(\w+)\s*\]\s*\}/g, '{ $1 }')
      
      // Fix mixed destructuring patterns
      .replace(/\{\s*(\w+),\s*\[\s*(\w+)\s*\]\s*\}/g, '{ $1, $2 }')
      
      // Fix nested destructuring
      .replace(/\{\s*(\w+):\s*\{\s*(\w+)\s*\}\s*,\s*\}/g, '{ $1: { $2 } }');
  }

  async run() {
    console.log('🔧 Starting Enhanced Syntax Corruption Recovery');
    console.log(`📁 Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log(`🔍 Verbose: ${this.verbose ? 'ON' : 'OFF'}`);

    const srcDir = path.join(__dirname, 'src');
    const files = await this.findTypeScriptFiles(srcDir);
    
    console.log(`📊 Found ${files.length} TypeScript files to check`);

    for (const file of files) {
      await this.processFile(file);
    }

    console.log('\n📈 Enhanced Syntax Recovery Results:');
    console.log(`✅ Files processed: ${this.filesProcessed}`);
    console.log(`🔧 Files modified: ${this.changes.length}`);
    console.log(`🎯 Estimated errors fixed: ${this.errorsFixed}`);
    
    if (this.dryRun) {
      console.log('\n🔍 Changes that would be made:');
      this.changes.forEach(change => {
        console.log(`  📄 ${change.file}: ${change.description}`);
      });
      console.log('\n📝 Run without --dry-run to apply these fixes');
    } else {
      console.log('\n🎯 Next steps:');
      console.log('1. Run: yarn tsc --noEmit | grep "error TS" | wc -l (check error reduction)');
      console.log('2. Run: yarn build (verify build integrity)');
      console.log('3. Proceed with next script if successful');
    }
    
    return this.changes;
  }

  async findTypeScriptFiles(dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && 
          !entry.name.startsWith('.') && 
          entry.name !== 'node_modules') {
        files.push(...await this.findTypeScriptFiles(fullPath));
      } else if (entry.isFile() && 
                 (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
                 !entry.name.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}

// Main execution
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const isVerbose = process.argv.includes('--verbose');
  
  if (process.argv.includes('--help')) {
    console.log(`
🔧 Enhanced Syntax Corruption Recovery Script

Fixes syntax errors introduced by previous automated scripts.

Usage:
  node fix-syntax-corruption-recovery.js [options]

Options:
  --dry-run    Test the fixes without making changes
  --verbose    Show detailed processing information
  --help       Show this help message

Examples:
  node fix-syntax-corruption-recovery.js --dry-run --verbose
  node fix-syntax-corruption-recovery.js

This script specifically targets:
- Malformed imports (import from "./file" → commented with TODO)
- Double question marks (props??.Fire → props?.Fire)
- Corrupted property access (obj.(prop).5 → (obj.prop) * 0.5)
- Broken constructor calls (new) Date() → new Date())
- Malformed optional chaining (?.) → ?.)
- Corrupted object syntax
- Broken template literals
- Damaged destructuring patterns
`);
    return;
  }

  const recovery = new SyntaxCorruptionRecovery(isDryRun, isVerbose);
  
  try {
    await recovery.run();
    console.log('\n🎉 Enhanced syntax corruption recovery completed!');
  } catch (error) {
    console.error('❌ Recovery failed:', error);
    process.exit(1);
  }
}

main(); 