#!/usr/bin/env node

/**
 * Planet Casing Standardization Script
 * 
 * Standardizes all Planet references to use PascalCase for consistency
 * with the Planet type definition in src/types/celestial.ts
 * 
 * Usage: node scripts/elemental-fixes/fix-planet-casing-standardization.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

const DRY_RUN = process.argv.includes('--dry-run');

// Planet casing mappings
const PLANET_CASING_MAPPINGS = {
  // Lowercase to PascalCase
  'sun': 'Sun',
  'moon': 'Moon', 
  'mercury': 'Mercury',
  'venus': 'Venus',
  'mars': 'Mars',
  'jupiter': 'Jupiter',
  'saturn': 'Saturn',
  'uranus': 'Uranus',
  'neptune': 'Neptune',
  'pluto': 'Pluto',
  'ascendant': 'Ascendant'
};

// Files to process (prioritized by importance)
const TARGET_FILES = [
  // Core type definitions and services
  'src/services/AstrologyService.ts',
  'src/services/ElementalCalculator.ts',
  'src/services/FoodAlchemySystem.ts',
  'src/services/celestialCalculations.ts',
  'src/services/astrologizeApi.ts',
  'src/services/astrologyApi.ts',
  'src/services/ConsolidatedRecipeService.ts',
  'src/services/initializationService.ts',
  'src/services/ServicesManager.ts',
  'src/services/DirectRecipeService.ts',
  'src/services/RecommendationService.ts',
  'src/services/RecommendationAdapter.ts',
  'src/services/AlchemicalTransformationService.ts',
  'src/services/UnifiedIngredientService.ts',
  
  // Data files
  'src/data/planets/types.ts',
  'src/data/unified/constants/elementalCore.js',
  'src/data/unified/types/chakra.js',
  'src/data/unified/utils/validation.js',
  
  // Component files
  'src/components/AstrologyChart/AstrologyChart.tsx',
  'src/components/CelestialDisplay/CelestialDisplay.tsx',
  'src/components/PlanetaryPositionInitializer.tsx',
  'src/components/PlanetaryPositionValidation.tsx',
  
  // Hook files
  'src/hooks/useAstrologicalState.ts',
  'src/hooks/useCurrentChart.ts',
  'src/hooks/useElementalState.ts',
  'src/hooks/useAstrologicalInfluence.ts',
  
  // Utility files
  'src/utils/astrologyUtils.ts',
  'src/utils/elementalUtils.ts',
  'src/utils/celestialUtils.ts',
  'src/utils/alchemicalUtils.ts'
];

function standardizePlanetCasing(content, filePath) {
  let modified = false;
  let newContent = content;
  
  // Fix object property keys (e.g., sun: -> Sun:)
  for (const [lowercase, pascalCase] of Object.entries(PLANET_CASING_MAPPINGS)) {
    const regex = new RegExp(`\\b${lowercase}:`, 'g');
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, `${pascalCase}:`);
      modified = true;
    }
  }
  
  // Fix string literals in arrays and objects (e.g., ['sun', 'moon'] -> ['Sun', 'Moon'])
  for (const [lowercase, pascalCase] of Object.entries(PLANET_CASING_MAPPINGS)) {
    const regex = new RegExp(`'${lowercase}'`, 'g');
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, `'${pascalCase}'`);
      modified = true;
    }
    
    const doubleQuoteRegex = new RegExp(`"${lowercase}"`, 'g');
    if (doubleQuoteRegex.test(newContent)) {
      newContent = newContent.replace(doubleQuoteRegex, `"${pascalCase}"`);
      modified = true;
    }
  }
  
  // Fix template literals and string concatenation
  for (const [lowercase, pascalCase] of Object.entries(PLANET_CASING_MAPPINGS)) {
    const regex = new RegExp(`\`${lowercase}\``, 'g');
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, `\`${pascalCase}\``);
      modified = true;
    }
  }
  
  // Fix variable names and function parameters (but be careful with context)
  // Only fix when it's clearly a planet reference
  for (const [lowercase, pascalCase] of Object.entries(PLANET_CASING_MAPPINGS)) {
    // Fix planet names in variable assignments and comparisons
    const planetVarRegex = new RegExp(`\\b${lowercase}\\b(?=\\s*[=:])`, 'g');
    if (planetVarRegex.test(newContent)) {
      newContent = newContent.replace(planetVarRegex, pascalCase);
      modified = true;
    }
  }
  
  return { modified, content: newContent };
}

function processFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  console.log(`🔍 Checking: ${fullPath}`);
  console.log(`   Exists: ${fs.existsSync(fullPath)}`);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const { modified, content: newContent } = standardizePlanetCasing(content, filePath);
    
    if (modified) {
      if (DRY_RUN) {
        console.log(`🔍 Would modify: ${filePath}`);
        // Show a sample of changes
        const lines = content.split('\n');
        const newLines = newContent.split('\n');
        let changeCount = 0;
        for (let i = 0; i < Math.min(lines.length, newLines.length); i++) {
          if (lines[i] !== newLines[i]) {
            console.log(`   Line ${i + 1}: "${lines[i].trim()}" -> "${newLines[i].trim()}"`);
            changeCount++;
            if (changeCount >= 3) break; // Show max 3 changes per file
          }
        }
      } else {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`✅ Modified: ${filePath}`);
      }
    } else {
      console.log(`✓ No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log(`🚀 Planet Casing Standardization ${DRY_RUN ? '(DRY RUN)' : ''}`);
  console.log(`📁 Project root: ${projectRoot}`);
  console.log(`📁 Processing ${TARGET_FILES.length} files...\n`);
  
  let processedCount = 0;
  let modifiedCount = 0;
  
  for (const filePath of TARGET_FILES) {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      processFile(filePath);
      processedCount++;
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Files found: ${processedCount}`);
  
  if (DRY_RUN) {
    console.log(`\n💡 To apply changes, run without --dry-run flag`);
  } else {
    console.log(`\n✅ Standardization complete!`);
    console.log(`💡 Run 'yarn build' to verify changes`);
  }
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main(); 