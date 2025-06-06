#!/usr/bin/env node

/**
 * fix-celestial-types.js
 * 
 * This script standardizes PlanetaryPositionsType and CelestialPosition types
 * across the codebase to ensure compatibility between different modules.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set this to true to see what would change without actually changing files
const DRY_RUN = process.argv.includes('--dry-run');

// Configure console colors
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Custom logger
const log = (message) => console.log(`${YELLOW}[Celestial Fix]${RESET} ${message}`);
const error = (message) => console.error(`${RED}[Celestial Fix ERROR]${RESET} ${message}`);
const success = (message) => console.log(`${GREEN}[Celestial Fix SUCCESS]${RESET} ${message}`);
const info = (message) => console.log(`${BLUE}[Celestial Fix INFO]${RESET} ${message}`);

// Find files that use CelestialPosition or PlanetaryPosition
async function findAffectedFiles() {
  try {
    // Use grep to find files with CelestialPosition or PlanetaryPosition
    const grepCommand = `grep -r --include="*.ts" --include="*.tsx" "CelestialPosition\\|PlanetaryPosition" src`;
    const output = execSync(grepCommand, { encoding: 'utf8' });
    
    // Extract file paths from grep output
    const files = output.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => line.split(':')[0])
      .filter((value, index, self) => self.indexOf(value) === index); // Unique files
    
    log(`Found ${files.length} files referencing celestial types`);
    return files;
  } catch (err) {
    error(`Error finding affected files: ${err.message}`);
    return [];
  }
}

// Standardize the CelestialPosition interface
async function standardizeCelestialPositionTypes() {
  try {
    const celestialTypesPath = path.resolve(__dirname, '../../src/types/celestial.ts');
    const alchemyTypesPath = path.resolve(__dirname, '../../src/types/alchemy.ts');
    
    // Read the files
    const celestialContent = await fs.readFile(celestialTypesPath, 'utf8');
    const alchemyContent = await fs.readFile(alchemyTypesPath, 'utf8');
    
    // Extract the CelestialPosition definitions
    const celestialPositionRegex = /export interface CelestialPosition \{[\s\S]*?\}/;
    const celestialMatch = celestialContent.match(celestialPositionRegex);
    const alchemyMatch = alchemyContent.match(celestialPositionRegex);
    
    if (!celestialMatch || !alchemyMatch) {
      error('Could not find CelestialPosition definitions in both files');
      return false;
    }
    
    // Get the definitions
    const celestialDef = celestialMatch[0];
    const alchemyDef = alchemyMatch[0];
    
    // Check if exactLongitude property exists in celestial.ts
    if (!celestialDef.includes('exactLongitude')) {
      // Add exactLongitude property to CelestialPosition in celestial.ts
      const updatedCelestialDef = celestialDef.replace(
        /export interface CelestialPosition \{/,
        `export interface CelestialPosition {
  exactLongitude?: number;`
      );
      
      const newCelestialContent = celestialContent.replace(celestialDef, updatedCelestialDef);
      
      if (!DRY_RUN) {
        await fs.writeFile(celestialTypesPath, newCelestialContent, 'utf8');
        success(`Added exactLongitude to CelestialPosition in ${celestialTypesPath}`);
      } else {
        log(`DRY RUN: Would add exactLongitude to CelestialPosition in ${celestialTypesPath}`);
      }
    }
    
    // Create a combined type with all properties from both
    const combinedProps = new Set();
    
    // Extract properties from celestial.ts
    const celestialProps = celestialDef.match(/[a-zA-Z]+\??:/g) || [];
    celestialProps.forEach(prop => combinedProps.add(prop.trim()));
    
    // Extract properties from alchemy.ts
    const alchemyProps = alchemyDef.match(/[a-zA-Z]+\??:/g) || [];
    alchemyProps.forEach(prop => combinedProps.add(prop.trim()));
    
    info(`Combined properties: ${Array.from(combinedProps).join(', ')}`);
    
    return true;
  } catch (err) {
    error(`Error standardizing CelestialPosition types: ${err.message}`);
    return false;
  }
}

// Fix PlanetaryPositionsType inconsistencies
async function fixPlanetaryPositionsType(files) {
  let fixedFiles = 0;
  
  for (const file of files) {
    try {
      const filePath = path.resolve(__dirname, '../../', file);
      let content = await fs.readFile(filePath, 'utf8');
      let updated = false;
      
      // 1. Check for missing imports
      if (content.includes('CelestialPosition') && !content.includes('import') && !content.includes('CelestialPosition')) {
        // Add import for CelestialPosition
        const importStatement = `import { CelestialPosition } from '@/types/celestial';\n`;
        content = importStatement + content;
        updated = true;
        log(`Added CelestialPosition import to ${file}`);
      }
      
      // 2. Fix inconsistent property access (e.g., sign? vs sign)
      const optionalPropAccess = /(\w+)\?\.sign/g;
      if (optionalPropAccess.test(content)) {
        content = content.replace(optionalPropAccess, (match, varName) => {
          updated = true;
          return `${varName}?.sign`;
        });
        log(`Fixed optional property access in ${file}`);
      }
      
      // 3. Fix Record<string, CelestialPosition> usage
      const recordTypeRegex = /Record<string,\s*CelestialPosition>/g;
      if (recordTypeRegex.test(content)) {
        content = content.replace(recordTypeRegex, 'Record<string, CelestialPosition>');
        updated = true;
        log(`Standardized Record<string, CelestialPosition> type in ${file}`);
      }
      
      // 4. Fix PlanetaryAlignment interface usage
      if (content.includes('PlanetaryAlignment') && content.includes('PlanetaryPosition')) {
        // Check if we need to add CelestialPosition to imports
        const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@\/types\/celestial['"]/;
        if (importRegex.test(content) && !content.includes('CelestialPosition')) {
          const importMatch = content.match(importRegex);
          const imports = importMatch[1].trim();
          const newImports = imports.endsWith(',') 
            ? `${imports} CelestialPosition,` 
            : `${imports}, CelestialPosition`;
          
          content = content.replace(importRegex, `import {${newImports}} from '@/types/celestial'`);
          updated = true;
          log(`Added CelestialPosition to imports in ${file}`);
        }
      }
      
      // 5. Fix missing exactLongitude property access
      if (content.includes('.exactLongitude') && content.includes('CelestialPosition')) {
        // Make sure exactLongitude access is safe
        const unsafeAccess = /(\w+)\.exactLongitude/g;
        content = content.replace(unsafeAccess, (match, varName) => {
          // Only replace if it's not already using optional chaining
          if (!match.includes('?.')) {
            updated = true;
            return `${varName}?.exactLongitude`;
          }
          return match;
        });
        
        if (updated) {
          log(`Fixed unsafe exactLongitude access in ${file}`);
        }
      }
      
      if (updated) {
        if (!DRY_RUN) {
          await fs.writeFile(filePath, content, 'utf8');
          success(`Updated ${file}`);
          fixedFiles++;
        } else {
          log(`DRY RUN: Would update ${file}`);
          fixedFiles++;
        }
      }
    } catch (err) {
      error(`Error processing ${file}: ${err.message}`);
    }
  }
  
  return fixedFiles;
}

// Create a consistent type export
async function createPlanetaryPositionsTypeAlias() {
  try {
    const alchemyTypesPath = path.resolve(__dirname, '../../src/types/alchemy.ts');
    let content = await fs.readFile(alchemyTypesPath, 'utf8');
    
    // Check if PlanetaryPositionsType already exists
    if (!content.includes('export type PlanetaryPositionsType')) {
      // Add PlanetaryPositionsType alias after PlanetaryAlignment interface
      const planetaryAlignmentRegex = /export interface PlanetaryAlignment \{[\s\S]*?\}/;
      const match = content.match(planetaryAlignmentRegex);
      
      if (match) {
        const typeAlias = `\n\n// Type alias for consistent planetary positions type
export type PlanetaryPositionsType = Record<string, PlanetaryPosition>;`;
        
        const newContent = content.replace(match[0], match[0] + typeAlias);
        
        if (!DRY_RUN) {
          await fs.writeFile(alchemyTypesPath, newContent, 'utf8');
          success(`Added PlanetaryPositionsType alias to ${alchemyTypesPath}`);
        } else {
          log(`DRY RUN: Would add PlanetaryPositionsType alias to ${alchemyTypesPath}`);
        }
        
        return true;
      } else {
        error('Could not find PlanetaryAlignment interface in alchemy.ts');
        return false;
      }
    } else {
      log('PlanetaryPositionsType alias already exists');
      return false;
    }
  } catch (err) {
    error(`Error creating PlanetaryPositionsType alias: ${err.message}`);
    return false;
  }
}

async function main() {
  log(`Starting celestial types fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  // Step 1: Standardize CelestialPosition interface
  const standardized = await standardizeCelestialPositionTypes();
  
  // Step 2: Create PlanetaryPositionsType alias
  const aliasCreated = await createPlanetaryPositionsTypeAlias();
  
  // Step 3: Find and fix affected files
  const files = await findAffectedFiles();
  const fixedCount = await fixPlanetaryPositionsType(files);
  
  success(`Celestial types fix completed: ${standardized ? 'standardized interfaces, ' : ''}${aliasCreated ? 'created type alias, ' : ''}fixed ${fixedCount} files`);
}

main(); 