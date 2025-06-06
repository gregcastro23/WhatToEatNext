#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing Planetary Type Conflicts for Phase 6');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Standardized Planet types - following project's capitalized conventions  
const STANDARD_PLANET_TYPE = `/**
 * Standard Planet type - capitalized format for consistency
 * Used for planetary influences in astrological calculations
 */
export type Planet = 
  | 'Sun' 
  | 'Moon' 
  | 'Mercury' 
  | 'Venus' 
  | 'Mars' 
  | 'Jupiter' 
  | 'Saturn' 
  | 'Uranus' 
  | 'Neptune' 
  | 'Pluto'
  | 'Ascendant';

/**
 * Extended Planet type including traditional Vedic nodes
 */
export type ExtendedPlanet = Planet | 'Rahu' | 'Ketu' | 'Chiron';

/**
 * Planet Name alias for backward compatibility
 */
export type PlanetName = Planet;`;

const STANDARD_ZODIAC_TYPE = `/**
 * Standard ZodiacSign type - lowercase format for consistency
 */
export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'scorpio' 
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';`;

const STANDARD_LUNAR_PHASE_TYPE = `/**
 * Standard LunarPhase type - spaces format for display
 */
export type LunarPhase = 
  | 'new moon' | 'waxing crescent' | 'first quarter' | 'waxing gibbous' 
  | 'full moon' | 'waning gibbous' | 'last quarter' | 'waning crescent';`;

// Files that need planetary type standardization
const filesToFix = [
  {
    path: 'src/types/alchemy.ts',
    strategy: 'remove_conflicts_add_reexport'
  },
  {
    path: 'src/types/astrology.ts', 
    strategy: 'remove_conflicts_add_reexport'
  },
  {
    path: 'src/constants/planetaryFoodAssociations.ts',
    strategy: 'update_to_extended'
  }
];

// Helper function to remove conflicting type definitions
function removeConflictingTypes(content, filePath) {
  // Remove existing Planet type definitions
  const planetRegex = /export type Planet\s*=[\s\S]*?;/gs;
  const planetNameRegex = /export type PlanetName\s*=[\s\S]*?;/gs;
  const zodiacRegex = /export type ZodiacSign\s*=[\s\S]*?;/gs;
  const lunarRegex = /export type LunarPhase\s*=[\s\S]*?;/gs;
  
  let updatedContent = content;
  updatedContent = updatedContent.replace(planetRegex, '');
  updatedContent = updatedContent.replace(planetNameRegex, '');
  
  // Only remove zodiac and lunar if not in celestial.ts (source of truth)
  if (!filePath.includes('celestial.ts')) {
    updatedContent = updatedContent.replace(zodiacRegex, '');
    updatedContent = updatedContent.replace(lunarRegex, '');
  }
  
  return updatedContent;
}

// Helper function to add standard imports
function addStandardImports(content, filePath) {
  const importLines = [];
  
  if (!content.includes('import { Planet')) {
    importLines.push('Planet');
  }
  if (!content.includes('import { PlanetName')) {
    importLines.push('PlanetName');
  }
  if (!content.includes('import { ZodiacSign')) {
    importLines.push('ZodiacSign');
  }
  if (!content.includes('import { LunarPhase')) {
    importLines.push('LunarPhase');
  }
  
  if (importLines.length > 0) {
    const importStatement = `import { ${importLines.join(', ')} } from '@/types/celestial';\n`;
    
    // Find existing imports and add after them
    if (content.includes('import {')) {
      // Add after existing imports
      const lines = content.split('\n');
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import {') || lines[i].includes('import ')) {
          lastImportIndex = i;
        }
      }
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, importStatement.trim());
        content = lines.join('\n');
      }
    } else {
      content = importStatement + '\n' + content;
    }
  }
  
  return content;
}

// Main fix function
function fixPlanetaryTypesInFile(filePath, strategy) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    if (strategy === 'update_celestial_source') {
      // For celestial.ts - update existing types to be standard
      const planetRegex = /export type Planet\s*=[\s\S]*?;/gs;
      if (content.match(planetRegex)) {
        updatedContent = content.replace(planetRegex, STANDARD_PLANET_TYPE);
      }
      
      const zodiacRegex = /export type ZodiacSign\s*=[\s\S]*?;/gs;
      if (content.match(zodiacRegex)) {
        updatedContent = updatedContent.replace(zodiacRegex, STANDARD_ZODIAC_TYPE);
      }
      
      const lunarRegex = /export type LunarPhase\s*=[\s\S]*?;/gs;
      if (content.match(lunarRegex)) {
        updatedContent = updatedContent.replace(lunarRegex, STANDARD_LUNAR_PHASE_TYPE);
      }
      
    } else if (strategy === 'remove_conflicts_add_reexport') {
      // Remove conflicting definitions and add re-exports
      updatedContent = removeConflictingTypes(updatedContent, filePath);
      updatedContent = addStandardImports(updatedContent, filePath);
      
      // Add re-exports for compatibility
      const reExports = '\n\n// Re-export standard types from celestial\nexport { Planet, PlanetName, ZodiacSign, LunarPhase } from "@/types/celestial";\n';
      if (!updatedContent.includes('export { Planet') && !updatedContent.includes('Re-export standard types')) {
        updatedContent += reExports;
      }
      
    } else if (strategy === 'update_to_extended') {
      // For planetaryFoodAssociations - update to use ExtendedPlanet
      const planetRegex = /export type Planet\s*=[\s\S]*?;/gs;
      if (content.match(planetRegex)) {
        const extendedPlanetType = `/**
 * Extended Planet type for planetary food associations
 */
export type Planet = 
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' 
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'
  | 'Rahu' | 'Ketu';`;
        updatedContent = content.replace(planetRegex, extendedPlanetType);
      }
    }
    
    return updatedContent !== content ? updatedContent : null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Handle celestial.ts first (source of truth)
console.log('\n📁 Processing celestial.ts (source of truth)');
const celestialPath = path.join(ROOT_DIR, 'src/types/celestial.ts');

if (fs.existsSync(celestialPath)) {
  const updatedContent = fixPlanetaryTypesInFile(celestialPath, 'update_celestial_source');
  
  if (updatedContent) {
    if (DRY_RUN) {
      console.log(`✅ Would update: src/types/celestial.ts`);
      console.log(`📝 Changes: Standardized Planet, ZodiacSign, LunarPhase types`);
    } else {
      fs.writeFileSync(celestialPath, updatedContent, 'utf8');
      console.log(`✅ Updated: src/types/celestial.ts`);
    }
  } else {
    console.log(`ℹ️ No changes needed: src/types/celestial.ts`);
  }
}

// Process other files
let changesCount = 0;

for (const { path: filePath, strategy } of filesToFix) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    continue;
  }
  
  console.log(`\n📁 Processing: ${filePath}`);
  
  const updatedContent = fixPlanetaryTypesInFile(fullPath, strategy);
  
  if (updatedContent) {
    if (DRY_RUN) {
      console.log(`✅ Would update: ${filePath}`);
      console.log(`📝 Changes: Fixed planetary type conflicts`);
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
console.log(`\n🎯 Phase 6 Planetary Types Fix Summary:`);
console.log(`📊 Files processed: ${filesToFix.length + 1}`);
console.log(`✨ Files updated: ${DRY_RUN ? 'DRY RUN' : changesCount + 1}`);

if (DRY_RUN) {
  console.log('\n🚀 Run without --dry-run to apply changes');
} else {
  console.log('\n✅ Planetary type conflicts resolved!');
  console.log('🔧 Next: Check for remaining celestial calculation errors');
} 