#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing AstrologicalState interface conflicts for Phase 6');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Standard AstrologicalState interface that combines all needed properties
const STANDARD_ASTROLOGICAL_STATE = `/**
 * Standardized AstrologicalState interface for Phase 6
 * Combines all properties needed across the application
 */
export interface AstrologicalState {
  // Primary zodiac properties
  sunSign?: ZodiacSign;
  moonSign?: ZodiacSign;
  currentZodiac?: ZodiacSign;
  
  // Lunar properties  
  lunarPhase?: LunarPhase;
  moonPhase?: LunarPhase;
  
  // Planetary information
  activePlanets?: string[];
  dominantPlanets?: Planet[];
  planetaryHour?: Planet;
  currentPlanetaryAlignment?: PlanetaryAlignment;
  planetaryPositions?: Record<string, CelestialPosition>;
  
  // Time and state properties
  isDaytime?: boolean;
  timeOfDay?: string;
  
  // Elemental properties
  dominantElement?: Element;
  dominantModality?: Modality;
  
  // Aspect information
  aspects?: PlanetaryAspect[];
  activeAspects?: PlanetaryAspect[];
  
  // Error handling
  loading?: boolean;
  error?: string;
  calculationError?: boolean;
  isReady?: boolean;
  renderCount?: number;
  
  // Additional properties for compatibility
  alchemicalValues?: AlchemicalProperties;
  tarotElementBoosts?: Record<string, number>;
  tarotPlanetaryBoosts?: Record<string, number>;
  planetaryHours?: string;
  zodiacSign?: string; // Deprecated, use currentZodiac
}`;

// Files that need AstrologicalState interface fixes
const filesToFix = [
  'src/types/alchemy.ts',
  'src/contexts/AlchemicalContext/types.ts',
  'src/services/AstrologicalService.ts',
  'src/context/AstrologicalContext.tsx',
  'src/utils/cuisineRecommender.ts'
];

// Helper function to remove conflicting interface definitions
function removeConflictingInterfaces(content, filePath) {
  // Remove existing AstrologicalState interface definitions
  const interfaceRegex = /export interface AstrologicalState \{[^}]*\}(?:\s*[^}]*\})*\s*/gs;
  const localInterfaceRegex = /interface AstrologicalState \{[^}]*\}(?:\s*[^}]*\})*\s*/gs;
  
  let updatedContent = content.replace(interfaceRegex, '');
  updatedContent = updatedContent.replace(localInterfaceRegex, '');
  
  return updatedContent;
}

// Helper function to add standard imports
function addStandardImports(content, filePath) {
  // Check if imports already exist and add missing ones
  const importLines = [];
  
  if (!content.includes("import { ZodiacSign")) {
    importLines.push("ZodiacSign");
  }
  if (!content.includes("import { LunarPhase")) {
    importLines.push("LunarPhase");
  }
  if (!content.includes("import { Planet")) {
    importLines.push("Planet");
  }
  if (!content.includes("import { Element")) {
    importLines.push("Element");
  }
  if (!content.includes("import { Modality")) {
    importLines.push("Modality");
  }
  if (!content.includes("import { PlanetaryAlignment")) {
    importLines.push("PlanetaryAlignment");
  }
  if (!content.includes("import { CelestialPosition")) {
    importLines.push("CelestialPosition");
  }
  if (!content.includes("import { PlanetaryAspect")) {
    importLines.push("PlanetaryAspect");
  }
  if (!content.includes("import { AlchemicalProperties")) {
    importLines.push("AlchemicalProperties");
  }
  
  if (importLines.length > 0) {
    // Add import statement if needed
    const importStatement = `import { ${importLines.join(', ')} } from '@/types/celestial';\n`;
    
    if (content.includes("'use client';")) {
      content = content.replace("'use client';", "'use client';\n\n" + importStatement);
    } else {
      content = importStatement + "\n" + content;
    }
  }
  
  return content;
}

// Main fix function
function fixAstrologicalStateInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // Remove conflicting interface definitions
    updatedContent = removeConflictingInterfaces(updatedContent, filePath);
    
    // Add standard imports for celestial.ts only (since it's the source)
    if (filePath.includes('celestial.ts')) {
      // For celestial.ts, we update the existing interface instead of removing it
      const interfaceRegex = /export interface AstrologicalState \{[^}]*\}(?:\s*[^}]*\})*/gs;
      updatedContent = content.replace(interfaceRegex, STANDARD_ASTROLOGICAL_STATE);
    } else if (filePath.includes('alchemy.ts')) {
      // For alchemy.ts, add import and remove conflicting interface
      updatedContent = addStandardImports(updatedContent, filePath);
      
      // Add re-export for compatibility
      if (!updatedContent.includes('export { AstrologicalState }')) {
        updatedContent += '\n\n// Re-export AstrologicalState from celestial types\nexport { AstrologicalState } from "@/types/celestial";\n';
      }
    } else {
      // For other files, add imports for AstrologicalState
      if (!updatedContent.includes('import { AstrologicalState }') && 
          !updatedContent.includes('import type { AstrologicalState }')) {
        
        const importStatement = `import { AstrologicalState } from '@/types/celestial';\n`;
        
        if (updatedContent.includes("'use client';")) {
          updatedContent = updatedContent.replace("'use client';", "'use client';\n\n" + importStatement);
        } else {
          updatedContent = importStatement + "\n" + updatedContent;
        }
      }
    }
    
    return updatedContent !== content ? updatedContent : null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Process all files
let changesCount = 0;

for (const filePath of filesToFix) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    continue;
  }
  
  console.log(`\n📁 Processing: ${filePath}`);
  
  const updatedContent = fixAstrologicalStateInFile(fullPath);
  
  if (updatedContent) {
    if (DRY_RUN) {
      console.log(`✅ Would update: ${filePath}`);
      console.log(`📝 Changes: Standardized AstrologicalState interface`);
    } else {
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      changesCount++;
    }
  } else {
    console.log(`ℹ️ No changes needed: ${filePath}`);
  }
}

// Summary
console.log(`\n🎯 Phase 6 AstrologicalState Fix Summary:`);
console.log(`📊 Files processed: ${filesToFix.length}`);
console.log(`✨ Files updated: ${DRY_RUN ? 'DRY RUN' : changesCount}`);

if (DRY_RUN) {
  console.log('\n🚀 Run without --dry-run to apply changes');
} else {
  console.log('\n✅ AstrologicalState interface conflicts resolved!');
  console.log('🔧 Next: Run yarn build to check for remaining errors');
} 