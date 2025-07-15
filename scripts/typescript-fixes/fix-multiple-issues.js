/**
 * Fix Multiple TypeScript Issues Script
 * 
 * This script addresses multiple TypeScript issues across the codebase:
 * 1. Fixes AlchemicalProperties to use lowercase property names
 * 2. Ensures Season type includes both 'autumn' and 'fall'
 * 3. Adds exactLongitude to PlanetaryPosition
 * 4. Fixes imports and usage of PlanetaryPosition vs CelestialPosition
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');
const VALIDATE = process.argv.includes('--validate');
const VERBOSE = process.argv.includes('--verbose');

// Files to check and update
const FILES_TO_UPDATE = [
  'src/types/alchemy.ts',
  'src/utils/safeAstrology.ts',
  'src/components/PlanetaryPositionInitializer.tsx',
  'src/components/CelestialDisplay/CelestialDisplay.tsx',
  'src/components/PlanetaryDisplay.tsx',
  'src/constants/alchemicalEnergyMapping.ts',
  'src/constants/signEnergyStates.ts',
  'src/scripts/testGasGiantInfluences.ts',
  'src/services/celestialCalculations.ts',
  'src/types/astrology.ts',
  'src/types/celestial.ts',
  'src/utils/alchemicalCalculations.ts',
  'src/utils/astrology/calculations.ts'
];

// Log helper
function log(message, type = 'info') {
  const prefix = type === 'info' ? '📝' : type === 'warn' ? '⚠️' : '❌';
  console.log(`${prefix} ${message}`);
}

// Verbose logging
function verbose(message) {
  if (VERBOSE) {
    console.log(`  🔍 ${message}`);
  }
}

// Main function
async function main() {
  log(`Starting TypeScript issue fixes ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  try {
    // Process each file
    for (const file of FILES_TO_UPDATE) {
      const filePath = path.resolve(process.cwd(), file);
      
      if (!fs.existsSync(filePath)) {
        log(`File not found: ${file}`, 'warn');
        continue;
      }
      
      log(`Processing ${file}...`);
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // === FIX 1: AlchemicalProperties interface ===
      if (file.endsWith('alchemy.ts') && content.includes('export interface AlchemicalProperties')) {
        verbose('Checking AlchemicalProperties interface...');
        const alchemicalRegex = /export\s+interface\s+AlchemicalProperties\s*\{[^}]*\}/s;
        const alchemicalMatch = content.match(alchemicalRegex);
        
        if (alchemicalMatch) {
          const currentDefinition = alchemicalMatch[0];
          
          // Check if it's using lowercase property names
          const hasLowercaseProperties = 
            currentDefinition.includes('Spirit:') && 
            currentDefinition.includes('Essence:') && 
            currentDefinition.includes('Matter:') && 
            currentDefinition.includes('Substance:');
            
          // Check if it's using uppercase property names or elementalProfile
          const hasUppercaseProperties = 
            currentDefinition.includes('Spirit:') || 
            currentDefinition.includes('Essence:') || 
            currentDefinition.includes('Matter:') || 
            currentDefinition.includes('Substance:');
            
          const hasElementalProfile = currentDefinition.includes('elementalProfile:');
          
          if (!hasLowercaseProperties && (hasUppercaseProperties || hasElementalProfile)) {
            log('  - Updating AlchemicalProperties to use lowercase property names');
            
            // Replace with the correct interface
            const updatedInterface = `export interface AlchemicalProperties {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}`;
            
            content = content.replace(currentDefinition, updatedInterface);
            updated = true;
          } else {
            verbose('AlchemicalProperties already has lowercase property names');
          }
        } else {
          verbose('Could not find AlchemicalProperties interface using regex pattern');
        }
      }
      
      // === FIX 2: Season type ===
      if (file.endsWith('alchemy.ts') && content.includes('export type Season =')) {
        verbose('Checking Season type...');
        const seasonRegex = /export\s+type\s+Season\s*=\s*'[^']*'(?:\s*\|\s*'[^']*')*\s*;/;
        const seasonMatch = content.match(seasonRegex);
        
        if (seasonMatch) {
          const currentDefinition = seasonMatch[0];
          const hasAutumn = currentDefinition.includes("'autumn'");
          const hasFall = currentDefinition.includes("'fall'");
          
          if (hasAutumn && !hasFall) {
            log('  - Season type has autumn but not fall, adding fall');
            const updatedDefinition = currentDefinition.replace(
              /(export\s+type\s+Season\s*=\s*(?:.*?))(;)/,
              "$1 | 'fall'$2"
            );
            content = content.replace(currentDefinition, updatedDefinition);
            updated = true;
          } else if (!hasAutumn && hasFall) {
            log('  - Season type has fall but not autumn, adding autumn');
            const updatedDefinition = currentDefinition.replace(
              /(export\s+type\s+Season\s*=\s*(?:.*?))(;)/,
              "$1 | 'autumn'$2"
            );
            content = content.replace(currentDefinition, updatedDefinition);
            updated = true;
          } else if (!hasAutumn && !hasFall) {
            log('  - Season type is missing both autumn and fall, adding both');
            const updatedDefinition = currentDefinition.replace(
              /(export\s+type\s+Season\s*=\s*(?:.*?))(;)/,
              "$1 | 'autumn' | 'fall'$2"
            );
            content = content.replace(currentDefinition, updatedDefinition);
            updated = true;
          } else {
            verbose('Season type already has both autumn and fall');
          }
        } else {
          verbose('Could not find Season type using regex pattern');
        }
      }
      
      // === FIX 3: PlanetaryPosition interface ===
      if (file.endsWith('alchemy.ts') && content.includes('export interface PlanetaryPosition')) {
        verbose('Checking PlanetaryPosition interface...');
        const positionRegex = /export\s+interface\s+PlanetaryPosition\s*\{[^}]*\}/s;
        const positionMatch = content.match(positionRegex);
        
        if (positionMatch) {
          const currentDefinition = positionMatch[0];
          
          // Check if exactLongitude is present
          if (!currentDefinition.includes('exactLongitude')) {
            log('  - Adding exactLongitude to PlanetaryPosition interface');
            
            // Add exactLongitude property
            const updatedInterface = currentDefinition.replace(
              /(\s*\})/,
              "\n  exactLongitude?: number;$1"
            );
            
            content = content.replace(currentDefinition, updatedInterface);
            updated = true;
          } else {
            verbose('PlanetaryPosition already has exactLongitude property');
          }
        } else {
          verbose('Could not find PlanetaryPosition interface using regex pattern');
        }
      }
      
      // === FIX 4: Fix BasicThermodynamicProperties interface if missing ===
      if (file.endsWith('alchemy.ts') && content.includes('export interface EnergyStateProps extends BasicThermodynamicProperties')) {
        verbose('Checking BasicThermodynamicProperties interface...');
        
        if (!content.includes('export interface BasicThermodynamicProperties')) {
          log('  - Adding missing BasicThermodynamicProperties interface');
          
          // Add the missing interface before EnergyStateProps
          const energyStateRegex = /export\s+interface\s+EnergyStateProps\s+extends\s+BasicThermodynamicProperties/;
          const basicThermoInterface = `export interface BasicThermodynamicProperties {
  heat: number;       // Rate of thermal energy transfer to ingredients
  entropy: number;    // Degree of structural breakdown in ingredients
  reactivity: number; // Rate of chemical interactions between ingredients
  energy: number;     // Overall energy transfer efficiency
}

`;
          
          content = content.replace(energyStateRegex, basicThermoInterface + 'export interface EnergyStateProps extends BasicThermodynamicProperties');
          updated = true;
        } else {
          verbose('BasicThermodynamicProperties interface already exists');
        }
      }
      
      // === FIX 5: CelestialPosition usage ===
      if (content.includes('CelestialPosition') && !file.endsWith('alchemy.ts')) {
        verbose('Checking CelestialPosition usage...');
        
        // Add PlanetaryPosition to imports if using CelestialPosition
        const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@\/types\/alchemy['"]/;
        
        if (content.includes('CelestialPosition') && !content.includes('PlanetaryPosition') && importRegex.test(content)) {
          let imports = importRegex.exec(content)[1];
          
          // Add PlanetaryPosition to imports if not already there
          if (!imports.includes('PlanetaryPosition')) {
            log('  - Adding PlanetaryPosition to imports');
            imports = imports.trim();
            if (imports.endsWith(',')) {
              imports += ' PlanetaryPosition,';
            } else {
              imports += ', PlanetaryPosition';
            }
            content = content.replace(importRegex, `import {${imports}} from '@/types/alchemy'`);
            updated = true;
          }
          
          // Replace CelestialPosition with PlanetaryPosition where appropriate
          if (content.includes('Record<string, CelestialPosition>')) {
            log('  - Replacing Record<string, CelestialPosition> with Record<string, PlanetaryPosition>');
            const celestialRegex = /(Record<string,\s*)CelestialPosition(\s*>)/g;
            content = content.replace(celestialRegex, '$1PlanetaryPosition$2');
            updated = true;
          }
          
          // Replace direct CelestialPosition type annotations
          if (content.includes(': CelestialPosition')) {
            log('  - Replacing direct CelestialPosition type annotations with PlanetaryPosition');
            const directCelestialRegex = /:\s*CelestialPosition(\s*[,;)])/g;
            content = content.replace(directCelestialRegex, ': PlanetaryPosition$1');
            updated = true;
          }
        }
      }
      
      // Save the updated file
      if (updated) {
        log(`  - Changes found for ${file}`);
        if (!DRY_RUN) {
          fs.writeFileSync(filePath, content, 'utf8');
          log(`  - Updated ${file}`);
        } else {
          log(`  - Would update ${file} (dry run)`);
        }
      } else {
        log(`  - No changes needed for ${file}`);
      }
    }
    
    // Validate changes if requested
    if (VALIDATE && !DRY_RUN) {
      log('Validating changes with TypeScript compiler...');
      try {
        const output = execSync('yarn tsc --noEmit', { stdio: 'pipe' }).toString();
        log('TypeScript validation successful!');
      } catch (error) {
        log('TypeScript validation found errors. The fixes may not have resolved all issues.', 'warn');
        
        // Count errors and display summary
        try {
          const errorOutput = error.stdout.toString();
          const errorCount = (errorOutput.match(/error TS/g) || []).length;
          log(`TypeScript still has ${errorCount} errors`, 'warn');
        } catch (e) {
          log('Could not determine error count', 'error');
        }
      }
    }
    
    log('TypeScript issue fixes completed successfully!');
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
}

// Run the script
main(); 