#!/usr/bin/env node

/**
 * Import Issues Fix Script
 * 
 * This script fixes import issues in the codebase including:
 * 1. Breaking up imports from @/data/planets into individual imports
 * 2. Adding missing imports for hooks and types
 * 3. Fixing other common import pattern issues
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// Base path for our operations
const BASE_PATH = process.cwd();

/**
 * Logger function with verbosity control
 */
function log(message, type = 'info') {
  const prefix = {
    info: '\x1b[34m[INFO]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    warning: '\x1b[33m[WARNING]\x1b[0m',
    error: '\x1b[31m[ERROR]\x1b[0m',
  }[type] || '\x1b[34m[INFO]\x1b[0m';
  
  if (type === 'error' || type === 'success' || VERBOSE) {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Extracts valid module imports from a file
 */
function extractValidImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(?:{([^}]+)}\s+from\s+['"]([^'"]+)['"]|([^;\n]+)\s+from\s+['"]([^'"]+)['"])/g;
    
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1] && match[2]) {
        // Named imports: import { a, b } from 'module'
        imports.push({
          type: 'named',
          names: match[1].split(',').map(n => n.trim()),
          source: match[2]
        });
      } else if (match[3] && match[4]) {
        // Default import or namespace import: import x from 'module' or import * as x from 'module'
        imports.push({
          type: 'default',
          name: match[3].trim(),
          source: match[4]
        });
      }
    }
    
    return imports;
  } catch (error) {
    log(`Error extracting imports from ${filePath}: ${error.message}`, 'error');
    return [];
  }
}

/**
 * Process a file to fix import issues
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modifications = [];

    // Fix 1: Fix planet data imports
    const planetImportFixes = [
      // Convert combined planet data imports to individual imports
      {
        pattern: /import\s+{([^}]+)}\s+from\s+['"]@\/data\/planets['"]/g,
        replacement: (match, importedItems) => {
          // Parse the imported items
          const items = importedItems.split(',').map(item => item.trim());
          
          // Check if we need to refactor (only refactor if it contains planet data)
          const planetDataNames = ['sunData', 'moonData', 'venusData', 'marsData', 'jupiterData', 'saturnData', 'mercuryData', 'uranusData', 'neptuneData', 'plutoData'];
          const hasPlanetData = items.some(item => planetDataNames.includes(item));
          
          if (hasPlanetData) {
            // Create individual imports
            const nonPlanetImports = items.filter(item => !planetDataNames.includes(item));
            const planetImports = items.filter(item => planetDataNames.includes(item));
            
            let result = '';
            
            // Keep non-planet imports together if any
            if (nonPlanetImports.length > 0) {
              result += `import { ${nonPlanetImports.join(', ')} } from '@/data/planets';\n`;
            }
            
            // Create individual imports for planet data
            planetImports.forEach(planet => {
              // Extract planet name without "Data" suffix
              const planetName = planet.replace('Data', '');
              result += `import { ${planet} } from '@/data/planets/${planetName}';\n`;
            });
            
            modifications.push(`Refactored planet data imports`);
            return result;
          }
          
          // Return the original if not refactoring
          return match;
        }
      }
    ];

    // Fix 2: Add missing hook imports
    const hookImportFixes = [
      // Find usage of hooks without imports
      {
        pattern: /\b(use[A-Z]\w+)\(/g,
        replacement: (match, hookName) => {
          // Check if the hook is already imported
          const hasImport = content.includes(`import { ${hookName} }`) || 
                           content.includes(`import ${hookName} `);
          
          if (!hasImport) {
            // Determine the most likely import path based on hook name
            let importPath;
            
            if (hookName.includes('Element') || hookName.includes('Alchemy') || hookName.includes('Astro')) {
              importPath = '@/hooks/alchemicalHooks';
            } else if (hookName.includes('Recipe')) {
              importPath = '@/hooks/recipeHooks';
            } else if (hookName.includes('User') || hookName.includes('Auth')) {
              importPath = '@/hooks/authHooks';
            } else {
              importPath = '@/hooks';
            }
            
            // Add the import at the top of the file
            const importStatement = `import { ${hookName} } from '${importPath}';\n`;
            
            // Find where imports end to add our new import
            const lastImportIndex = content.lastIndexOf('import ');
            const lastImportEndIndex = content.indexOf('\n', lastImportIndex);
            
            if (lastImportIndex !== -1 && lastImportEndIndex !== -1) {
              content = content.slice(0, lastImportEndIndex + 1) + 
                      importStatement + 
                      content.slice(lastImportEndIndex + 1);
              
              modifications.push(`Added missing import for ${hookName}`);
            }
          }
          
          // Return the original hook usage
          return match;
        }
      }
    ];

    // Fix 3: Fix type imports
    const typeImportFixes = [
      // Find type usage without imports
      {
        pattern: /:\s*(\w+)(?:<|\[\]|\s*\|\s*|\s*&\s*|[,);=])/g,
        replacement: (match, typeName) => {
          // Skip basic types and generics
          const basicTypes = ['string', 'number', 'boolean', 'any', 'unknown', 'void', 'null', 'undefined', 'T', 'U', 'V', 'K'];
          if (basicTypes.includes(typeName)) {
            return match;
          }
          
          // Check if the type is already imported
          const hasImport = content.includes(`import { ${typeName} }`) || 
                           content.includes(`import type { ${typeName} }`) ||
                           content.includes(`import ${typeName} `);
          
          // Check if it's defined in the file
          const isDefinedInFile = content.includes(`interface ${typeName}`) || 
                                 content.includes(`type ${typeName}`) ||
                                 content.includes(`enum ${typeName}`) ||
                                 content.includes(`class ${typeName}`);
          
          if (!hasImport && !isDefinedInFile) {
            // Determine the most likely import path based on type name
            let importPath;
            
            if (typeName.includes('Element') || typeName.includes('Alchemy') || typeName.includes('Elemental')) {
              importPath = '@/types/alchemy';
            } else if (typeName.includes('Recipe')) {
              importPath = '@/types/recipe';
            } else if (typeName.includes('User') || typeName.includes('Auth')) {
              importPath = '@/types/auth';
            } else if (typeName.includes('Chakra')) {
              importPath = '@/types/chakra';
            } else if (typeName.includes('Zodiac') || typeName.includes('Planet') || typeName.includes('Astro')) {
              importPath = '@/types/zodiac';
            } else {
              importPath = '@/types';
            }
            
            // Add the import at the top of the file
            const importStatement = `import type { ${typeName} } from '${importPath}';\n`;
            
            // Find where imports end to add our new import
            const lastImportIndex = content.lastIndexOf('import ');
            const lastImportEndIndex = content.indexOf('\n', lastImportIndex);
            
            if (lastImportIndex !== -1 && lastImportEndIndex !== -1) {
              content = content.slice(0, lastImportEndIndex + 1) + 
                      importStatement + 
                      content.slice(lastImportEndIndex + 1);
              
              modifications.push(`Added missing type import for ${typeName}`);
            }
          }
          
          // Return the original type usage
          return match;
        }
      }
    ];

    // Apply all fixes
    const allFixes = [...planetImportFixes, ...hookImportFixes, ...typeImportFixes];
    
    allFixes.forEach(fix => {
      content = content.replace(fix.pattern, fix.replacement);
    });

    // Write changes if content was modified and we're not in dry run mode
    if (content !== originalContent) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
        log(`Fixed import issues in: ${path.relative(BASE_PATH, filePath)}`, 'success');
        
        if (VERBOSE) {
          modifications.forEach(mod => log(`  - ${mod}`, 'info'));
        }
      } else {
        log(`Would fix import issues in: ${path.relative(BASE_PATH, filePath)}`, 'info');
        
        if (VERBOSE) {
          modifications.forEach(mod => log(`  - ${mod}`, 'info'));
        }
      }
      return 1; // Return 1 to indicate a file was modified
    }
    return 0; // Return 0 to indicate no changes were made
  } catch (error) {
    log(`Error processing ${filePath}: ${error.message}`, 'error');
    return 0;
  }
}

/**
 * Find all TypeScript files in the codebase
 */
async function findTsFiles() {
  return glob('src/**/*.{ts,tsx}', { ignore: ['**/node_modules/**', '**/.next/**'] });
}

/**
 * Main function
 */
async function main() {
  log('Starting import issues fix script' + (DRY_RUN ? ' (DRY RUN)' : ''), 'info');
  
  const tsFiles = await findTsFiles();
  log(`Found ${tsFiles.length} TypeScript files to process`, 'info');
  
  let modifiedCount = 0;
  
  for (const file of tsFiles) {
    modifiedCount += processFile(file);
  }
  
  if (DRY_RUN) {
    log(`Dry run completed. Would modify ${modifiedCount} files.`, 'success');
  } else {
    log(`Import issues fixes completed. Modified ${modifiedCount} files.`, 'success');
  }
}

// Run the script
main().catch(error => {
  log(`Unhandled error: ${error.message}`, 'error');
  process.exit(1);
}); 