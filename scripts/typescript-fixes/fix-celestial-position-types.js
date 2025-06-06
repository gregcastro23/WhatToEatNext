#!/usr/bin/env node

/**
 * Fix CelestialPosition Type Inconsistencies
 * 
 * This script addresses the issue where multiple files define CelestialPosition
 * differently, causing TypeScript errors when exactLongitude is missing.
 */

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

console.log(`🔧 Fixing CelestialPosition type inconsistencies ${DRY_RUN ? '(DRY RUN)' : ''}`);

// Helper functions
function log(message) {
  console.log(`📝 ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function error(message) {
  console.log(`❌ ${message}`);
}

function verbose(message) {
  if (VERBOSE) {
    console.log(`🔍 ${message}`);
  }
}

// Main fix function
async function fixCelestialPositionTypes() {
  try {
    let fixesApplied = 0;

    // 1. First, standardize the main CelestialPosition interface in celestial.ts
    const celestialTypesPath = 'src/types/celestial.ts';
    if (fs.existsSync(celestialTypesPath)) {
      let content = fs.readFileSync(celestialTypesPath, 'utf8');
      const originalContent = content;

      // Ensure the CelestialPosition interface has all necessary properties
      const celestialPositionRegex = /export interface CelestialPosition \{[\s\S]*?\}/;
      const match = content.match(celestialPositionRegex);

      if (match) {
        const currentInterface = match[0];
        
        // Define the complete interface
        const standardInterface = `export interface CelestialPosition {
  sign?: string;
  degree?: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
  minutes?: number;
  speed?: number;
  element?: Element;
  dignity?: DignityType;
}`;

        // Only update if different
        if (currentInterface !== standardInterface) {
          content = content.replace(celestialPositionRegex, standardInterface);
          verbose('Updated CelestialPosition interface in celestial.ts');
        }
      }

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(celestialTypesPath, content, 'utf8');
          success('Fixed CelestialPosition interface in celestial.ts');
          fixesApplied++;
        } else {
          log('Would fix CelestialPosition interface in celestial.ts');
        }
      }
    }

    // 2. Fix conflicting CelestialPosition interface in alchemy.ts
    const alchemyTypesPath = 'src/types/alchemy.ts';
    if (fs.existsSync(alchemyTypesPath)) {
      let content = fs.readFileSync(alchemyTypesPath, 'utf8');
      const originalContent = content;

      // Check if there's a conflicting CelestialPosition interface
      const celestialPositionRegex = /export interface CelestialPosition \{[\s\S]*?\}/;
      if (celestialPositionRegex.test(content)) {
        // Remove the duplicate interface and add import from celestial.ts
        content = content.replace(celestialPositionRegex, '');
        
        // Add import at the top if not already present
        if (!content.includes("import type { CelestialPosition }")) {
          const importRegex = /import type \{([^}]+)\} from ['"]\.\/celestial['"]/;
          if (importRegex.test(content)) {
            // Add to existing import
            content = content.replace(importRegex, (match, imports) => {
              if (!imports.includes('CelestialPosition')) {
                const newImports = imports.trim() + ', CelestialPosition';
                return `import type {${newImports}} from './celestial'`;
              }
              return match;
            });
          } else {
            // Add new import
            const firstImportMatch = content.match(/import[^;]+;/);
            if (firstImportMatch) {
              const insertIndex = content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
              content = content.slice(0, insertIndex) + 
                       '\nimport type { CelestialPosition } from \'./celestial\';' + 
                       content.slice(insertIndex);
            }
          }
        }

        verbose('Removed duplicate CelestialPosition interface from alchemy.ts');
      }

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(alchemyTypesPath, content, 'utf8');
          success('Fixed duplicate CelestialPosition in alchemy.ts');
          fixesApplied++;
        } else {
          log('Would fix duplicate CelestialPosition in alchemy.ts');
        }
      }
    }

    // 3. Fix usage in safeAstrology.ts to remove exactLongitude from literals
    const safeAstrologyPath = 'src/utils/safeAstrology.ts';
    if (fs.existsSync(safeAstrologyPath)) {
      let content = fs.readFileSync(safeAstrologyPath, 'utf8');
      const originalContent = content;

      // Fix the problematic object literals by removing exactLongitude
      content = content.replace(
        /(\w+):\s*\{\s*sign:\s*'(\w+)',\s*degree:\s*([\d.]+),\s*exactLongitude:\s*[\d.]+,\s*isRetrograde:\s*(true|false)\s*\}/g,
        "$1: { sign: '$2', degree: $3, isRetrograde: $4 }"
      );

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(safeAstrologyPath, content, 'utf8');
          success('Fixed exactLongitude usage in safeAstrology.ts');
          fixesApplied++;
        } else {
          log('Would fix exactLongitude usage in safeAstrology.ts');
        }
      }
    }

    // 4. Fix PlanetaryAspect interface issues
    const servicesTypesPath = 'src/types/alchemy.ts';
    if (fs.existsSync(servicesTypesPath)) {
      let content = fs.readFileSync(servicesTypesPath, 'utf8');
      const originalContent = content;

      // Fix PlanetaryAspect interface to ensure it has all required properties
      const aspectRegex = /export interface PlanetaryAspect \{[\s\S]*?\}/;
      const aspectMatch = content.match(aspectRegex);

      if (aspectMatch && (!aspectMatch[0].includes('type:') || !aspectMatch[0].includes('strength:'))) {
        const updatedAspectInterface = `export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
  strength: number;
  influence: number;
  planets: string[];
  additionalInfo?: { aspectType: AspectType };
}`;
        
        content = content.replace(aspectRegex, updatedAspectInterface);
        verbose('Updated PlanetaryAspect interface');
      }

      if (content !== originalContent) {
        if (!DRY_RUN) {
          fs.writeFileSync(servicesTypesPath, content, 'utf8');
          success('Fixed PlanetaryAspect interface');
          fixesApplied++;
        } else {
          log('Would fix PlanetaryAspect interface');
        }
      }
    }

    return fixesApplied;
  } catch (err) {
    error(`Error fixing CelestialPosition types: ${err.message}`);
    return 0;
  }
}

// Run the fix
(async () => {
  try {
    const fixes = await fixCelestialPositionTypes();
    
    if (fixes > 0) {
      success(`Applied ${fixes} fixes to CelestialPosition types`);
    } else {
      log('No fixes needed or all issues already resolved');
    }
    
    log('✨ CelestialPosition type fixing complete!');
  } catch (err) {
    error(`Script failed: ${err.message}`);
    process.exit(1);
  }
})(); 