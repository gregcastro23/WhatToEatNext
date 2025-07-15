#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Remaining Syntax Issues Fix Script
 * Purpose: Fix specific syntax patterns preventing build
 * Focus: Double question marks, malformed types, incomplete exports
 * Risk: Low - targeted fixes for specific known issues
 */

class RemainingSyntaxFixer {
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

      // Check if file has patterns we can fix
      if (!this.hasTargetPatterns(content)) {
        return false;
      }

      if (this.verbose) {
        console.log(`🔍 Processing: ${filePath}`);
      }

      // Fix double question marks
      const fixedDoubleQM = this.fixDoubleQuestionMarks(content);
      if (fixedDoubleQM !== content) {
        content = fixedDoubleQM;
        changesMade = true;
        this.errorsFixed += 3;
        if (this.verbose) console.log(`  ✅ Fixed double question marks`);
      }

      // Fix malformed type syntax
      const fixedTypes = this.fixMalformedTypes(content);
      if (fixedTypes !== content) {
        content = fixedTypes;
        changesMade = true;
        this.errorsFixed += 2;
        if (this.verbose) console.log(`  ✅ Fixed malformed types`);
      }

      // Fix incomplete exports
      const fixedExports = this.fixIncompleteExports(content);
      if (fixedExports !== content) {
        content = fixedExports;
        changesMade = true;
        this.errorsFixed += 2;
        if (this.verbose) console.log(`  ✅ Fixed incomplete exports`);
      }

      // Fix duplicate imports
      const fixedDuplicates = this.fixDuplicateImports(content);
      if (fixedDuplicates !== content) {
        content = fixedDuplicates;
        changesMade = true;
        this.errorsFixed += 1;
        if (this.verbose) console.log(`  ✅ Fixed duplicate imports`);
      }

      if (changesMade) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, content, 'utf8');
        }
        this.changes.push({
          file: filePath,
          before: originalContent.length,
          after: content.length,
          description: 'Fixed remaining syntax issues'
        });
        console.log(`✅ Fixed remaining syntax: ${filePath}`);
      }

      this.filesProcessed++;
      return changesMade;
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  hasTargetPatterns(content) {
    const patterns = [
      /\?\?\./,                               // Double question marks
      /\{\s*\{\s*\w+:\s*\w+\s*\}\s*:\s*\w+/, // Malformed type syntax
      /export\s*\{\s*\w+,\s*$/m,             // Incomplete exports
      /import.*calculatePlanetaryPositions.*\n.*import.*calculatePlanetaryPositions/s // Duplicate imports
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  fixDoubleQuestionMarks(content) {
    return content
      // Fix double question marks in optional chaining
      .replace(/(\w+)\?\?\./g, '$1?.')
      
      // Fix patterns like (context??.property)
      .replace(/\((\w+)\?\?\.(\w+)\)/g, '($1?.$2)')
      
      // Fix complex patterns
      .replace(/(\w+)\?\?\.(\w+)\s*\?\?\s*/g, '$1?.$2 ?? ');
  }

  fixMalformedTypes(content) {
    return content
      // Fix malformed object type syntax like { { key: string }: Type }
      .replace(/\{\s*\{\s*(\w+):\s*(\w+)\s*\}\s*:\s*(\w+)\s*\}/g, '{ [$1: $2]: $3 }')
      
      // Fix other malformed type patterns
      .replace(/\{\s*\{\s*(\w+):\s*(\w+)\s*\}\s*\}/g, '{ $1: $2 }');
  }

  fixIncompleteExports(content) {
    return content
      // Fix incomplete export statements that end with comma
      .replace(/export\s*\{\s*([^}]*),\s*$/gm, (match, exports) => {
        // Remove trailing comma and close the export
        const cleanExports = exports.trim().replace(/,$/, '');
        return `export { ${cleanExports} };`;
      })
      
      // Fix export statements missing closing brace
      .replace(/export\s*\{\s*([^}]*)\s*$/gm, (match, exports) => {
        if (!exports.includes('}')) {
          return `export { ${exports.trim()} };`;
        }
        return match;
      });
  }

  fixDuplicateImports(content) {
    const lines = content.split('\n');
    const seenImports = new Set();
    const fixedLines = [];
    
    for (const line of lines) {
      // Check if this is an import line
      const importMatch = line.match(/import\s+.*from\s+['"][^'"]*['"];?/);
      
      if (importMatch) {
        const importStatement = importMatch[0];
        
        // If we've seen this exact import before, comment it out
        if (seenImports.has(importStatement)) {
          fixedLines.push(`// DUPLICATE: ${line}`);
        } else {
          seenImports.add(importStatement);
          fixedLines.push(line);
        }
      } else {
        fixedLines.push(line);
      }
    }
    
    return fixedLines.join('\n');
  }

  async run() {
    console.log('🔧 Starting Remaining Syntax Issues Fix');
    console.log(`📁 Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log(`🔍 Verbose: ${this.verbose ? 'ON' : 'OFF'}`);

    const srcDir = path.join(__dirname, 'src');
    const files = await this.findTypeScriptFiles(srcDir);
    
    console.log(`📊 Found ${files.length} TypeScript files to check`);

    for (const file of files) {
      await this.processFile(file);
    }

    console.log('\n📈 Remaining Syntax Fix Results:');
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
      console.log('1. Run: yarn build (test if build works)');
      console.log('2. Check: yarn tsc --noEmit | grep "error TS" | wc -l');
      console.log('3. Continue with Phase 2 if build succeeds');
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
🔧 Remaining Syntax Issues Fix Script

Fixes specific syntax patterns preventing builds.

Usage:
  node fix-remaining-syntax-issues.js [options]

Options:
  --dry-run    Test the fixes without making changes
  --verbose    Show detailed processing information
  --help       Show this help message

Examples:
  node fix-remaining-syntax-issues.js --dry-run --verbose
  node fix-remaining-syntax-issues.js

This script specifically targets:
- Double question marks (context??.property → context?.property)
- Malformed type syntax ({ { key: string }: Type } → { [key: string]: Type })
- Incomplete export statements
- Duplicate import statements
`);
    return;
  }

  const fixer = new RemainingSyntaxFixer(isDryRun, isVerbose);
  
  try {
    await fixer.run();
    console.log('\n🎉 Remaining syntax fix completed!');
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

main(); 