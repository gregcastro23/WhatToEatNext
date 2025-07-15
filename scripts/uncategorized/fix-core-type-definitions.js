#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing Core Type Definition Issues...\n');

// Track changes for dry run
let changes = [];
const DRY_RUN = process.argv.includes('--dry-run');

function logChange(file, description, before, after) {
  changes.push({ file, description, before, after });
  if (DRY_RUN) {
    console.log(`📝 ${file}: ${description}`);
  }
}

function updateFile(filePath, content, description) {
  if (DRY_RUN) {
    logChange(filePath, description, 'original', 'updated');
    return;
  }
  
  try {
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${filePath}: ${description}`);
  } catch (error) {
    console.error(`❌ Failed to update ${filePath}:`, error.message);
  }
}

// 1. Fix CelestialPosition interface to ensure exactLongitude is properly defined
function fixCelestialPositionInterface() {
  console.log('1️⃣ Fixing CelestialPosition interface...');
  
  const celestialTypesPath = 'src/types/celestial.ts';
  try {
    let content = readFileSync(celestialTypesPath, 'utf8');
    
    // Ensure exactLongitude is properly defined in CelestialPosition
    const celestialPositionRegex = /export interface CelestialPosition \{[\s\S]*?\}/;
    const match = content.match(celestialPositionRegex);
    
    if (match) {
      const updatedInterface = `export interface CelestialPosition {
  sign?: string;
  degree?: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
  minutes?: number;
  speed?: number;
  element?: Element;
  dignity?: DignityType;
}`;
      
      content = content.replace(celestialPositionRegex, updatedInterface);
      updateFile(celestialTypesPath, content, 'Fixed CelestialPosition interface with exactLongitude');
    }
  } catch (error) {
    console.error(`❌ Error fixing CelestialPosition interface:`, error.message);
  }
}

// 2. Fix PlanetaryAspect interface conflicts
function fixPlanetaryAspectInterface() {
  console.log('2️⃣ Fixing PlanetaryAspect interface conflicts...');
  
  const alchemyTypesPath = 'src/types/alchemy.ts';
  try {
    let content = readFileSync(alchemyTypesPath, 'utf8');
    
    // Update PlanetaryAspect interface to include all required properties
    const aspectRegex = /export interface PlanetaryAspect \{[\s\S]*?\}/;
    const updatedInterface = `export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
  strength: number;
  planets?: string[];
  influence?: number;
  additionalInfo?: Record<string, unknown>;
}`;
    
    content = content.replace(aspectRegex, updatedInterface);
    updateFile(alchemyTypesPath, content, 'Fixed PlanetaryAspect interface with all required properties');
  } catch (error) {
    console.error(`❌ Error fixing PlanetaryAspect interface:`, error.message);
  }
}

// 3. Fix LunarPhase type conflicts
function fixLunarPhaseTypes() {
  console.log('3️⃣ Fixing LunarPhase type conflicts...');
  
  const alchemyTypesPath = 'src/types/alchemy.ts';
  try {
    let content = readFileSync(alchemyTypesPath, 'utf8');
    
    // Ensure LunarPhase is consistently defined
    const lunarPhaseRegex = /export type LunarPhase = LunarPhaseWithSpaces;/;
    if (!content.match(lunarPhaseRegex)) {
      // Add the type definition if it doesn't exist
      const insertPoint = content.indexOf('// Default LunarPhase type');
      if (insertPoint !== -1) {
        const beforeInsert = content.substring(0, insertPoint);
        const afterInsert = content.substring(insertPoint);
        content = beforeInsert + '// Default LunarPhase type - use the format with spaces as the primary representation\nexport type LunarPhase = LunarPhaseWithSpaces;\n\n' + afterInsert;
        updateFile(alchemyTypesPath, content, 'Fixed LunarPhase type definition');
      }
    }
  } catch (error) {
    console.error(`❌ Error fixing LunarPhase types:`, error.message);
  }
}

// 4. Fix Recipe type conflicts between alchemy.ts and recipe.ts
function fixRecipeTypeConflicts() {
  console.log('4️⃣ Fixing Recipe type conflicts...');
  
  const recipeTypesPath = 'src/types/recipe.ts';
  try {
    let content = readFileSync(recipeTypesPath, 'utf8');
    
    // Ensure Recipe interface has consistent servingSize vs numberOfServings
    content = content.replace(/numberOfServings: number;/g, 'servingSize: number; // Standardized from numberOfServings');
    
    // Fix RecipeIngredient element property to be optional for compatibility
    content = content.replace(/element: string;/g, 'element?: string;');
    
    updateFile(recipeTypesPath, content, 'Fixed Recipe type conflicts and RecipeIngredient element property');
  } catch (error) {
    console.error(`❌ Error fixing Recipe type conflicts:`, error.message);
  }
}

// 5. Fix missing exports and imports
function fixMissingExports() {
  console.log('5️⃣ Fixing missing exports...');
  
  // Fix missing Recipe export in celestial.ts
  const celestialTypesPath = 'src/types/celestial.ts';
  try {
    let content = readFileSync(celestialTypesPath, 'utf8');
    
    // Add Recipe re-export from alchemy types
    if (!content.includes('export type { Recipe }')) {
      content += '\n// Re-export Recipe type from alchemy for compatibility\nexport type { Recipe } from \'./alchemy\';\n';
      updateFile(celestialTypesPath, content, 'Added Recipe re-export');
    }
  } catch (error) {
    console.error(`❌ Error fixing missing exports:`, error.message);
  }
}

// 6. Fix duplicate identifier issues
function fixDuplicateIdentifiers() {
  console.log('6️⃣ Fixing duplicate identifier issues...');
  
  const testFilePath = 'src/__tests__/data/ingredients.test.ts';
  try {
    let content = readFileSync(testFilePath, 'utf8');
    
    // Remove duplicate validateIngredient imports
    const lines = content.split('\n');
    const uniqueLines = [];
    const seenImports = new Set();
    
    for (const line of lines) {
      if (line.includes('validateIngredient')) {
        const importKey = line.trim();
        if (!seenImports.has(importKey)) {
          seenImports.add(importKey);
          uniqueLines.push(line);
        }
      } else {
        uniqueLines.push(line);
      }
    }
    
    const updatedContent = uniqueLines.join('\n');
    if (updatedContent !== content) {
      updateFile(testFilePath, updatedContent, 'Removed duplicate validateIngredient imports');
    }
  } catch (error) {
    console.error(`❌ Error fixing duplicate identifiers:`, error.message);
  }
}

// Main execution
async function main() {
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No files will be modified\n');
  }
  
  fixCelestialPositionInterface();
  fixPlanetaryAspectInterface();
  fixLunarPhaseTypes();
  fixRecipeTypeConflicts();
  fixMissingExports();
  fixDuplicateIdentifiers();
  
  if (DRY_RUN) {
    console.log(`\n📊 Summary: ${changes.length} changes would be made`);
    changes.forEach(change => {
      console.log(`  - ${change.file}: ${change.description}`);
    });
    console.log('\n🚀 Run without --dry-run to apply changes');
  } else {
    console.log(`\n✅ Core type definition fixes completed!`);
    console.log('🔍 Run yarn tsc --noEmit to check remaining errors');
  }
}

main().catch(console.error); 