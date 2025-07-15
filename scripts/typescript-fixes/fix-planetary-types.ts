/**
 * Fix Planetary Position Types Script
 * 
 * This script addresses type issues between different implementations of planetary positions
 * across the codebase.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

const DRY_RUN = process.argv.includes('--dry-run');
const VALIDATE = process.argv.includes('--validate');

// Files to update with specific fixes
const FILES_TO_UPDATE = [
  'src/types/alchemy.ts',
  'src/utils/safeAstrology.ts',
  'src/utils/astrology/safeAstrology.ts',
  'src/components/PlanetaryPositionInitializer.tsx',
  'src/utils/astrology/astrologerService.ts'
];

// Log helper
function log(message: string, type: 'info' | 'warn' | 'error' = 'info') {
  const prefix = type === 'info' ? '📝' : type === 'warn' ? '⚠️' : '❌';
  console.log(`${prefix} ${message}`);
}

// Find all TypeScript files in src directory
function findTypeScriptFiles(dir: string, fileList: string[] = []): string[] {
  const files = fsSync.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fsSync.statSync(filePath).isDirectory()) {
      findTypeScriptFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check if file needs fixing
function fileNeedsFixing(filePath: string): boolean {
  const content = fsSync.readFileSync(filePath, 'utf8');
  
  // Check for specific issues we're fixing
  const usesPositionsWithoutExactLongitude = 
    content.includes('PlanetaryPosition') && 
    !content.includes('exactLongitude') &&
    (content.includes('interface PlanetaryPosition') || 
     content.includes('type PlanetaryPosition'));
     
  const usesCelestialPositionInsteadOfPlanetary = 
    content.includes('CelestialPosition') && 
    content.includes('position') &&
    !content.includes('PlanetaryPosition');
    
  return usesPositionsWithoutExactLongitude || usesCelestialPositionInsteadOfPlanetary;
}

// Main function
async function main() {
  log(`Starting planetary types fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  try {
    // Step 1: Process the known files that need updates
    for (const file of FILES_TO_UPDATE) {
      const filePath = path.resolve(ROOT_DIR, file);
      
      if (!fsSync.existsSync(filePath)) {
        log(`File not found: ${file}`, 'warn');
        continue;
      }
      
      log(`Processing ${file}...`);
      let content = fsSync.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // Fix PlanetaryPosition interface in alchemy.ts
      if (file.endsWith('alchemy.ts')) {
        // More flexible regex pattern to find the interface
        const regex = /export\s+interface\s+PlanetaryPosition\s*\{[^}]*?\n\}/s;
        
        // Check if exactLongitude is already present
        if (content.includes('PlanetaryPosition') && !content.includes('exactLongitude')) {
          const updatedInterface = `export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  element?: string;
  dignity?: string;
  isRetrograde?: boolean;
  exactLongitude?: number;
}`;
          
          if (regex.test(content)) {
            content = content.replace(regex, updatedInterface);
            updated = true;
            log('  - Updated PlanetaryPosition interface with exactLongitude property');
          } else {
            log('  - Could not find PlanetaryPosition interface using regex pattern', 'warn');
          }
        } else {
          log('  - PlanetaryPosition already has exactLongitude or interface not found');
        }
        
        // Also check for Season type to make sure it includes both 'autumn' and 'fall'
        if (content.includes('export type Season =') && 
            (content.includes('autumn') && !content.includes('fall') ||
             content.includes('fall') && !content.includes('autumn'))) {
          const seasonRegex = /export\s+type\s+Season\s*=\s*[^;]+;/;
          const updatedSeason = `export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';`;
          
          if (seasonRegex.test(content)) {
            content = content.replace(seasonRegex, updatedSeason);
            updated = true;
            log('  - Updated Season type to include both autumn and fall');
          }
        }
      }
      
      // Fix safeAstrology.ts and similar files
      if (file.includes('safeAstrology') || file.includes('astrologerService') || file.includes('PlanetaryPositionInitializer')) {
        // Add PlanetaryPosition to imports if using CelestialPosition
        const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@\/types\/alchemy['"]/;
        
        if (content.includes('CelestialPosition') && !content.includes('PlanetaryPosition') && importRegex.test(content)) {
          let imports = importRegex.exec(content)![1];
          
          // Add PlanetaryPosition to imports if not already there
          if (!imports.includes('PlanetaryPosition')) {
            imports = imports.trim();
            if (imports.endsWith(',')) {
              imports += ' PlanetaryPosition,';
            } else {
              imports += ', PlanetaryPosition';
            }
            content = content.replace(importRegex, `import {${imports}} from '@/types/alchemy'`);
            updated = true;
            log('  - Added PlanetaryPosition to imports');
          }
          
          // Replace CelestialPosition with PlanetaryPosition where it's being used for exact data
          const celestialRegex = /(Record<string,\s*)CelestialPosition(\s*>)/g;
          const updatedContent = content.replace(celestialRegex, '$1PlanetaryPosition$2');
          
          if (updatedContent !== content) {
            content = updatedContent;
            updated = true;
            log('  - Updated CelestialPosition usage to PlanetaryPosition');
          }
          
          // Also check for direct CelestialPosition usage in type annotations
          const directCelestialRegex = /:\s*CelestialPosition(\s*[,;)])/g;
          const updatedDirectContent = content.replace(directCelestialRegex, ': PlanetaryPosition$1');
          
          if (updatedDirectContent !== content) {
            content = updatedDirectContent;
            updated = true;
            log('  - Updated direct CelestialPosition type annotations to PlanetaryPosition');
          }
        }
      }
      
      // Save the updated file
      if (updated) {
        log(`  - Changes found for ${file}`);
        if (!DRY_RUN) {
          fsSync.writeFileSync(filePath, content, 'utf8');
          log(`  - Updated ${file}`);
        } else {
          log(`  - Would update ${file} (dry run)`);
        }
      } else {
        log(`  - No changes needed for ${file}`);
      }
    }
    
    // Step 2: Find other TypeScript files that might need the same fixes
    log('Scanning for additional files that might need fixes...');
    const srcPath = path.resolve(ROOT_DIR, 'src');
    const allTsFiles = findTypeScriptFiles(srcPath);
    const additionalFilesToCheck = allTsFiles.filter(file => 
      !FILES_TO_UPDATE.includes(path.relative(ROOT_DIR, file)) && 
      fileNeedsFixing(file)
    );
    
    if (additionalFilesToCheck.length > 0) {
      log(`Found ${additionalFilesToCheck.length} additional files that might need fixes:`);
      additionalFilesToCheck.forEach(file => {
        const relativePath = path.relative(ROOT_DIR, file);
        log(`  - ${relativePath}`);
      });
      log('Consider adding these files to FILES_TO_UPDATE in the script');
    } else {
      log('No additional files found that need the same fixes');
    }
    
    // Step 3: Validate changes if requested
    if (VALIDATE && !DRY_RUN) {
      log('Validating changes with TypeScript compiler...');
      try {
        execSync('yarn tsc --noEmit', { stdio: 'pipe' });
        log('TypeScript validation successful!');
      } catch (error) {
        log('TypeScript validation found errors. The fixes may not have resolved all issues.', 'warn');
        if (error instanceof Error) {
          log(error.message, 'error');
        }
      }
    }
    
    log('Planetary types fix completed successfully!');
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
}

// Run the script
main(); 