#!/usr/bin/env node

/**
 * Fix TS2304 Name Resolution Script
 * 
 * Fixes "Cannot find name" errors by adding missing imports and type declarations
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  maxFiles: 15
};

// Common missing imports and their sources
const COMMON_IMPORTS = {
  'React': "import React from 'react';",
  'ElementalProperties': "import type { ElementalProperties } from '@/types/alchemy';",
  'Recipe': "import type { Recipe } from '@/types/recipe';",
  'Ingredient': "import type { Ingredient } from '@/types/alchemy';",
  'Element': "import type { Element } from '@/types/alchemy';",
  'Season': "import type { Season } from '@/types/alchemy';",
  'ZodiacSign': "import type { ZodiacSign } from '@/types/alchemy';",
  'CookingMethod': "import type { CookingMethod } from '@/types/alchemy';",
  'AlchemicalResult': "import type { AlchemicalResult } from '@/types/alchemy';",
  'PlanetaryPosition': "import type { PlanetaryPosition } from '@/types/celestial';",
  'CelestialAlignment': "import type { CelestialAlignment } from '@/types/alchemy';",
  'ThermodynamicProperties': "import type { ThermodynamicProperties } from '@/types/alchemy';",
  'FilterOptions': "import type { FilterOptions } from '@/types/alchemy';",
  'FlavorProfile': "import type { FlavorProfile } from '@/types/alchemy';",
  'CuisineType': "import type { CuisineType } from '@/types/alchemy';",
  'NutritionalProfile': "import type { NutritionalProfile } from '@/types/alchemy';",
  'AlchemicalProperty': "import type { AlchemicalProperty } from '@/types/celestial';",
  'ElementalCharacter': "import type { ElementalCharacter } from '@/constants/planetaryElements';",
  'Modality': "import type { Modality } from '@/types/celestial';"
};

// Variable declarations for commonly used undefined variables
const VARIABLE_DECLARATIONS = {
  'window': '// Note: window is available in browser environment',
  'document': '// Note: document is available in browser environment',
  'process': '// Note: process is available in Node.js environment',
  'console': '// Note: console is globally available',
  'Buffer': '// Note: Buffer is available in Node.js environment'
};

// Common variable fixes for underscore-prefixed variables (from previous fixes)
const UNDERSCORE_FIXES = {
  '_message': 'message',
  '_season': 'season',
  '_element': 'element',
  '_zodiacSign': 'zodiacSign',
  '_lunarPhase': 'lunarPhase',
  '_planetaryPositions': 'planetaryPositions',
  '_elementalProperties': 'elementalProperties',
  '_astrologicalState': 'astrologicalState'
};

class NameResolutionFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.totalFixes = 0;
  }

  async fixFile(filePath, errors) {
    try {
      const originalContent = await fs.readFile(filePath, 'utf8');
      let content = originalContent;
      let fixes = 0;

      // Collect all missing names from errors
      const missingNames = new Set();
      errors.forEach(error => {
        const nameMatch = error.message.match(/Cannot find name '(\w+)'/);
        if (nameMatch) {
          missingNames.add(nameMatch[1]);
        }
      });

      // Check if file already has imports section
      const hasImports = content.includes('import ');
      let importsToAdd = [];

      // Find missing imports
      for (const name of missingNames) {
        if (COMMON_IMPORTS[name]) {
          // Check if import already exists
          if (!content.includes(name) || !content.includes('import')) {
            importsToAdd.push(COMMON_IMPORTS[name]);
            fixes++;
          }
        }
      }

      // Add missing imports at the top
      if (importsToAdd.length > 0) {
        const lines = content.split('\n');
        
        // Find where to insert imports
        let insertIndex = 0;
        
        // Look for existing imports
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
          } else if (lines[i].trim() === '' && insertIndex > 0) {
            insertIndex = i;
            break;
          } else if (lines[i].trim() !== '' && !lines[i].startsWith('//') && !lines[i].startsWith('/*') && insertIndex === 0) {
            insertIndex = i;
            break;
          }
        }

        // Insert new imports
        const newImports = [...new Set(importsToAdd)]; // Remove duplicates
        for (let i = newImports.length - 1; i >= 0; i--) {
          lines.splice(insertIndex, 0, newImports[i]);
        }

        content = lines.join('\n');
      }

      // Fix underscore-prefixed variables (from previous automated fixes)
      for (const varName of missingNames) {
        if (UNDERSCORE_FIXES[varName]) {
          // Replace underscore-prefixed variable with correct name
          const pattern = new RegExp(`\\b${varName}\\b`, 'g');
          const newContent = content.replace(pattern, UNDERSCORE_FIXES[varName]);
          if (newContent !== content) {
            content = newContent;
            fixes++;
          }
        }
      }

      // Handle variable declarations for global variables
      const globalVars = ['window', 'document', 'process'];
      for (const varName of missingNames) {
        if (globalVars.includes(varName) && !content.includes(`declare`)) {
          // Add declaration comment
          const lines = content.split('\n');
          lines.splice(0, 0, VARIABLE_DECLARATIONS[varName] || `// ${varName} is globally available`);
          content = lines.join('\n');
          fixes++;
        }
      }

      if (content !== originalContent) {
        if (!CONFIG.dryRun) {
          await fs.writeFile(filePath, content);
        }
        this.fixedFiles.add(filePath);
        this.totalFixes += fixes;
        return { fixed: true, fixes, missingNames: Array.from(missingNames) };
      }

      return { fixed: false, fixes: 0, missingNames: Array.from(missingNames) };
    } catch (error) {
      console.error(`Error fixing ${filePath}:`, error.message);
      return { fixed: false, fixes: 0, error: error.message };
    }
  }

  async getTS2304Errors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const errorLines = error.stdout.split('\n');
      const errors = [];
      
      errorLines.forEach(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS2304: (.+)$/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: 'TS2304',
            message: match[4]
          });
        }
      });
      
      return errors;
    }
  }

  async run() {
    console.log('🔧 TS2304 Name Resolution Fixer');
    console.log(`⚙️  Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);

    const allErrors = await this.getTS2304Errors();
    
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

    console.log(`📁 Processing ${sortedFiles.length} files with TS2304 errors`);
    console.log(`🎯 Total TS2304 errors to fix: ${allErrors.length}`);

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
        console.log(`  ✅ Applied ${result.fixes} import/declaration fixes`);
        if (CONFIG.verbose && result.missingNames) {
          console.log(`  📋 Missing names: ${result.missingNames.join(', ')}`);
        }
      } else if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      } else {
        console.log(`  ⭐ No applicable fixes found`);
        if (CONFIG.verbose && result.missingNames) {
          console.log(`  📋 Unresolved names: ${result.missingNames.join(', ')}`);
        }
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

    console.log('\n🏁 Name Resolution Fixing Complete');
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
TS2304 Name Resolution Fixer

Usage: node fix-ts2304-name-resolution.js [options]

Options:
  --dry-run     Preview changes without modifying files
  --verbose     Show detailed progress information
  --help        Show this help message

Fixes:
  - Missing type imports from @/types/alchemy
  - Missing React imports
  - Missing component imports  
  - Global variable declarations
    `);
    return;
  }

  try {
    const fixer = new NameResolutionFixer();
    await fixer.run();
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}