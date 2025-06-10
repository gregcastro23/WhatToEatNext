#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Safety check for dry run
const DRY_RUN = process.argv.includes('--dry-run');

// Target file
const targetFile = 'src/utils/recipeMatching.ts';

const fixes = [
  {
    description: 'Add preferredComplexity to MatchFilters interface',
    search: `interface MatchFilters {
  maxCookingTime?: number;
  dietaryRestrictions?: string[];
  season?: Season;
  servings?: number;
  excludeIngredients?: string[];
  cookingMethods?: string[];
  nutritionalGoals?: Record<string, unknown>;
  astrologicalSign?: string;
  mealType?: string;
  preferHigherContrast?: boolean;
}`,
    replace: `interface MatchFilters {
  maxCookingTime?: number;
  dietaryRestrictions?: string[];
  season?: Season;
  servings?: number;
  excludeIngredients?: string[];
  cookingMethods?: string[];
  nutritionalGoals?: Record<string, unknown>;
  astrologicalSign?: string;
  mealType?: string;
  preferHigherContrast?: boolean;
  preferredComplexity?: number | string;
}`
  },
  {
    description: 'Fix calculateEnergyMatch function parameters',
    search: `let calculateEnergyMatch = (
  recipeEnergy: unknown,
  currentEnergy: unknown
) => {`,
    replace: `interface EnergyData {
  zodiacEnergy?: string;
  lunarEnergy?: string;
  planetaryEnergy?: string | string[];
  zodiac?: string;
  lunar?: string;
  planetary?: string | string[];
}

let calculateEnergyMatch = (
  recipeEnergy: EnergyData,
  currentEnergy: EnergyData
) => {`
  },
  {
    description: 'Fix calculateAstrologicalMatch function parameter',
    search: `function calculateAstrologicalMatch(
  recipeInfluence: unknown,
  userSign: string
): number {`,
    replace: `interface AstrologicalInfluence {
  zodiacCompatibility?: Record<string, number>;
  planetaryAlignment?: Record<string, number>;
  lunarInfluence?: Record<string, number>;
}

function calculateAstrologicalMatch(
  recipeInfluence: AstrologicalInfluence,
  userSign: string
): number {`
  },
  {
    description: 'Fix unknown type assertions in calculateEnergyMatch',
    search: `  // Check if we're in Aries season
  let isAriesSeason = currentEnergy.zodiacEnergy === 'aries';

  // Zodiac energy match with increased weight for Mars during Aries season
  if (recipeEnergy.zodiac === currentEnergy.zodiacEnergy) {`,
    replace: `  // Check if we're in Aries season
  let isAriesSeason = currentEnergy.zodiacEnergy === 'aries';

  // Zodiac energy match with increased weight for Mars during Aries season
  if (recipeEnergy.zodiac === currentEnergy.zodiacEnergy) {`
  },
  {
    description: 'Fix array includes checks with proper typing',
    search: `      recipeEnergy.planetary &&
      recipeEnergy.planetary.includes('Mars')`,
    replace: `      recipeEnergy.planetary &&
      (Array.isArray(recipeEnergy.planetary) ? recipeEnergy.planetary.includes('Mars') : recipeEnergy.planetary === 'Mars')`
  }
];

function applyFixes() {
  console.log(`🔧 Fixing typing issues in ${targetFile}`);
  
  try {
    // Read the file
    const content = readFileSync(targetFile, 'utf8');
    let updatedContent = content;
    let changeCount = 0;
    
    // Apply fixes
    for (const fix of fixes) {
      if (updatedContent.includes(fix.search)) {
        updatedContent = updatedContent.replace(fix.search, fix.replace);
        console.log(`✅ Applied: ${fix.description}`);
        changeCount++;
      }
    }
    
    console.log(`\n📊 Total changes: ${changeCount}`);
    
    if (DRY_RUN) {
      console.log('\n📋 DRY RUN - Would apply these fixes:');
      fixes.forEach(fix => {
        if (content.includes(fix.search)) {
          console.log(`  - ${fix.description}`);
        }
      });
      return;
    }
    
    // Write the updated content
    writeFileSync(targetFile, updatedContent, 'utf8');
    console.log(`✅ Successfully updated ${targetFile}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Safety checks
if (!DRY_RUN) {
  console.log('⚠️  This script will modify TypeScript interfaces and function signatures.');
  console.log(`📁 Target: ${targetFile}`);
  console.log('🛡️  Running safety checks...');
  
  // Check if target file exists
  try {
    readFileSync(targetFile, 'utf8');
    console.log('✅ Target file exists');
  } catch (error) {
    console.error(`❌ Target file not found: ${targetFile}`);
    process.exit(1);
  }
}

console.log('\n🚀 Starting recipe matching type fixes...');
applyFixes();
console.log('\n✨ Done!'); 