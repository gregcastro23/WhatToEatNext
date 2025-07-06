#!/usr/bin/env node

/**
 * Fix Unknown Property Access Script
 * 
 * Specifically targets TS2339 errors where properties are accessed on 'unknown' types
 * Uses safe type assertions and optional chaining
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  maxFiles: 10
};

// Specific property fixes for common unknown type access patterns
const PROPERTY_FIXES = [
  {
    property: 'astrologicalProfile',
    typeCast: '{ astrologicalProfile?: unknown }',
    description: 'Astrological profile property access'
  },
  {
    property: 'elementalProperties',
    typeCast: '{ elementalProperties?: Record<string, number> }',
    description: 'Elemental properties access'
  },
  {
    property: 'nutritionalProfile',
    typeCast: '{ nutritionalProfile?: unknown }',
    description: 'Nutritional profile access'
  },
  {
    property: 'seasonality',
    typeCast: '{ seasonality?: string[] }',
    description: 'Seasonality property access'
  },
  {
    property: 'cookingMethods',
    typeCast: '{ cookingMethods?: string[] }',
    description: 'Cooking methods property access'
  },
  {
    property: 'category',
    typeCast: '{ category?: string }',
    description: 'Category property access'
  },
  {
    property: 'name',
    typeCast: '{ name?: string }',
    description: 'Name property access'
  },
  {
    property: 'id',
    typeCast: '{ id?: string }',
    description: 'ID property access'
  }
];

class UnknownPropertyFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.totalFixes = 0;
  }

  async fixFile(filePath, targetErrors) {
    try {
      const originalContent = await fs.readFile(filePath, 'utf8');
      let content = originalContent;
      let fixes = 0;

      // Group errors by line number for efficient processing
      const errorsByLine = new Map();
      targetErrors.forEach(error => {
        if (!errorsByLine.has(error.line)) {
          errorsByLine.set(error.line, []);
        }
        errorsByLine.get(error.line).push(error);
      });

      const lines = content.split('\n');

      // Process each line with errors
      for (const [lineNum, lineErrors] of errorsByLine) {
        const lineIndex = lineNum - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          const originalLine = lines[lineIndex];
          let modifiedLine = originalLine;

          // Apply fixes for each error on this line
          for (const error of lineErrors) {
            const propertyMatch = error.message.match(/Property '(\w+)' does not exist on type 'unknown'/);
            if (propertyMatch) {
              const property = propertyMatch[1];
              const fix = PROPERTY_FIXES.find(f => f.property === property);
              
              if (fix) {
                modifiedLine = this.applyPropertyFix(modifiedLine, property, fix);
                fixes++;
              }
            }
          }

          if (modifiedLine !== originalLine) {
            lines[lineIndex] = modifiedLine;
            if (CONFIG.verbose) {
              console.log(`  Line ${lineNum}: ${fixes} fixes applied`);
            }
          }
        }
      }

      const newContent = lines.join('\n');
      
      if (newContent !== originalContent) {
        if (!CONFIG.dryRun) {
          await fs.writeFile(filePath, newContent);
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

  applyPropertyFix(line, property, fix) {
    // Pattern 1: Direct property access on unknown object
    // obj.property -> (obj as { property?: type })?.property
    const directPattern = new RegExp(`(\\w+)\\.${property}(?!\\w)`, 'g');
    line = line.replace(directPattern, (match, objName) => {
      // Skip if already has type cast
      if (line.includes(`${objName} as `)) {
        return match;
      }
      return `(${objName} as ${fix.typeCast})?.${property}`;
    });

    // Pattern 2: Nested property access
    // obj.property.subprop -> (obj as { property?: type })?.property?.subprop
    const nestedPattern = new RegExp(`(\\w+)\\.${property}\\.(\\w+)`, 'g');
    line = line.replace(nestedPattern, (match, objName, subProp) => {
      if (line.includes(`${objName} as `)) {
        return match;
      }
      return `(${objName} as ${fix.typeCast})?.${property}?.${subProp}`;
    });

    // Pattern 3: Optional chaining that needs type cast
    // obj?.property -> (obj as { property?: type })?.property
    const optionalPattern = new RegExp(`(\\w+)\\?\\.${property}(?!\\w)`, 'g');
    line = line.replace(optionalPattern, (match, objName) => {
      if (line.includes(`${objName} as `)) {
        return match;
      }
      return `(${objName} as ${fix.typeCast})?.${property}`;
    });

    return line;
  }

  async getTS2339ErrorsForFiles() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const errorLines = error.stdout.split('\n');
      const errors = [];
      
      errorLines.forEach(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS2339: (.+)$/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: 'TS2339',
            message: match[4]
          });
        }
      });
      
      return errors;
    }
  }

  async run() {
    console.log('🔧 Unknown Property Access Fixer');
    console.log(`⚙️  Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);

    const allErrors = await this.getTS2339ErrorsForFiles();
    
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

    console.log(`📁 Processing ${sortedFiles.length} files with highest error counts`);

    if (CONFIG.dryRun) {
      console.log('📝 Preview mode - no files will be modified');
    }

    let processedFiles = 0;
    let fixedFiles = 0;

    for (const [filePath, errors] of sortedFiles) {
      console.log(`\\n🔧 Fixing: ${path.basename(filePath)} (${errors.length} errors)`);
      
      const result = await this.fixFile(filePath, errors);
      
      if (result.fixed) {
        fixedFiles++;
        console.log(`  ✅ Applied ${result.fixes} property access fixes`);
      } else if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      } else {
        console.log(`  ⭐ No applicable fixes found`);
      }

      processedFiles++;

      // Build validation every 5 files
      if (processedFiles % 5 === 0 && !CONFIG.dryRun) {
        console.log('\\n🏗️  Validating build...');
        if (this.validateBuild()) {
          console.log('✅ Build validation passed');
        } else {
          console.log('⚠️  Build has errors (some TypeScript errors expected)');
        }
      }
    }

    console.log('\\n🏁 Property Access Fixing Complete');
    console.log(`📊 Statistics:`);
    console.log(`  - Files processed: ${processedFiles}`);
    console.log(`  - Files fixed: ${fixedFiles}`);
    console.log(`  - Total fixes applied: ${this.totalFixes}`);

    if (!CONFIG.dryRun) {
      console.log('\\n🏗️  Final build validation...');
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
Unknown Property Access Fixer

Usage: node fix-unknown-property-access.js [options]

Options:
  --dry-run     Preview changes without modifying files
  --verbose     Show detailed progress information
  --help        Show this help message

Targets:
  - TS2339 errors for property access on 'unknown' types
  - Common properties: astrologicalProfile, elementalProperties, etc.
  - Uses safe type assertions and optional chaining
    `);
    return;
  }

  try {
    const fixer = new UnknownPropertyFixer();
    await fixer.run();
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}