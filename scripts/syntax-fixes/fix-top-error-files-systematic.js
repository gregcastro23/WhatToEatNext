#!/usr/bin/env node

/**
 * TARGETED SYNTAX FIX FOR TOP ERROR FILES
 * Target: Top 10 files with highest error counts
 * Patterns: Specific build-blocking syntax corruptions identified in analysis
 * Methodology: Single-file iterations, specific patterns, immediate verification
 */

import { promises as fs } from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const MAX_FIXES_PER_PATTERN = 10;

// Top error files to fix systematically
const TARGET_FILES = [
  'src/utils/foodRecommender.ts',              // 133 errors
  'src/services/ConsolidatedIngredientService.ts', // 127 errors
  'src/utils/ingredientRecommender.ts',        // 118 errors
  'src/utils/cookingMethodRecommender.ts',     // 105 errors
  'src/utils/recommendation/ingredientRecommendation.ts', // 100 errors
  'src/utils/alchemicalPillarUtils.ts',       // 100 errors
  'src/components/SauceRecommender.tsx',      // 98 errors
  'src/utils/recipe/recipeEnrichment.ts',     // 90 errors
  'src/scripts/updateCookingMethodTypes.ts',  // 80 errors
  'src/components/CookingMethods.tsx'         // 80 errors
];

// SPECIFIC patterns - exact matches to avoid corruption
const CORRUPTION_PATTERNS = [
  {
    // Fix object.(property)? || [] pattern
    pattern: /(\w+)\.(\()([^)]+)(\))\?\s*\|\|\s*\[\]/g,
    replacement: "$1.$3 || []",
    description: 'Fix object.(property)? || [] corruption',
    maxMatches: 15
  },
  {
    // Fix Array.isArray((variable) ? (variable.includes(value) : (variable === value))
    pattern: /Array\.isArray\(\(([^)]+)\)\s*\?\s*\(([^)]+)\.includes\(([^)]+)\)\s*:\s*\(([^)]+)\s*===\s*([^)]+)\)\)/g,
    replacement: "Array.isArray($1) ? $1.includes($3) : $1 === $3",
    description: 'Fix Array.isArray ternary operator corruption',
    maxMatches: 20
  },
  {
    // Fix missing closing parenthesis in if statements  
    pattern: /if\s*\(Array\.isArray\(\(([^)]+)\)\s*\?\s*\(([^)]+)\.includes\(([^)]+)\)\s*:\s*\(([^)]+)\s*===\s*([^)]+)\)\)\s*(\w+)/g,
    replacement: "if (Array.isArray($1) ? $1.includes($3) : $1 === $3) $6",
    description: 'Fix missing closing parenthesis in Array.isArray if statements',
    maxMatches: 15
  },
  {
    // Fix object.elementalState)? || [] patterns
    pattern: /(\w+)\.(\w+)\)\?\s*\|\|\s*\[\]/g,
    replacement: "$1.$2 || []",
    description: 'Fix object.property)? || [] corruption',
    maxMatches: 10
  },
  {
    // Fix (variable)? || [] patterns 
    pattern: /\((\w+)\)\?\s*\|\|\s*\[\]/g,
    replacement: "$1 || []",
    description: 'Fix (variable)? || [] corruption',
    maxMatches: 15
  },
  {
    // Fix object.(Array.isArray(property) ? property.includes(value) : property === value)
    pattern: /(\w+)\.(\()Array\.isArray\(([^)]+)\)\s*\?\s*([^)]+)\.includes\(([^)]+)\)\s*:\s*([^)]+)\s*===\s*([^)]+)(\))/g,
    replacement: "Array.isArray($1.$3) ? $1.$3.includes($5) : $1.$3 === $5",
    description: 'Fix object.(Array.isArray...) corruption',
    maxMatches: 10
  },
  {
    // Fix incomplete elemental properties object
    pattern: /const\s+elementalProps:\s*ElementalProperties\s*=\s*{\s*Fire:\s*0,\s*Water:\s*0,\s*Earth:\s*0,\s*Air:\s*0\s*\n\s*};/g,
    replacement: "const elementalProps: ElementalProperties = {\n    Fire: 0,\n    Water: 0,\n    Earth: 0,\n    Air: 0\n  };",
    description: 'Fix incomplete elemental properties object',
    maxMatches: 5
  },
  {
    // Fix Object.keys(standardized.(property)? || [])
    pattern: /Object\.keys\((\w+)\.(\()([^)]+)(\))\?\s*\|\|\s*\[\]\)/g,
    replacement: "Object.keys($1.$3 || {})",
    description: 'Fix Object.keys corruption',
    maxMatches: 10
  },
  {
    // Fix object?.property || [].length patterns
    pattern: /(\w+)\.(\w+)\s*\|\|\s*\[\]\.length/g,
    replacement: "($1.$2 || []).length",
    description: 'Fix property || [].length corruption',
    maxMatches: 10
  },
  {
    // Fix ingredient?.astrologicalPropertiesProfile?.rulingPlanets patterns
    pattern: /(\w+)\?\.\?\astrologicalPropertiesProfile\?\.\?rulingPlanets/g,
    replacement: "$1?.astrologicalProfile?.rulingPlanets",
    description: 'Fix astrologicalPropertiesProfile corruption',
    maxMatches: 10
  }
];

async function fixTargetFile(filePath) {
  console.log(`\n🎯 FIXING: ${filePath}`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    let modifiedContent = content;
    let totalFixes = 0;
    
    for (const { pattern, replacement, description, maxMatches } of CORRUPTION_PATTERNS) {
      let matches = 0;
      
      modifiedContent = modifiedContent.replace(pattern, (match, ...args) => {
        if (matches >= maxMatches) return match;
        matches++;
        totalFixes++;
        console.log(`  ✅ ${description}: ${matches}/${maxMatches}`);
        return replacement;
      });
      
      if (matches === 0) {
        console.log(`     No matches for: ${description}`);
      }
    }
    
    console.log(`📊 SUMMARY: ${totalFixes} fixes applied to ${filePath}`);
    
    if (DRY_RUN) {
      console.log(`🧪 DRY RUN - Changes not applied`);
      return totalFixes;
    } else {
      await fs.writeFile(filePath, modifiedContent, 'utf-8');
      console.log(`✅ APPLIED`);
      return totalFixes;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

async function fixAllTargetFiles() {
  console.log(`🔧 TARGETED SYNTAX FIX FOR TOP ERROR FILES`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Files to process: ${TARGET_FILES.length}`);
  
  let totalFixesAll = 0;
  let processedFiles = 0;
  
  for (const filePath of TARGET_FILES) {
    try {
      // Check if file exists
      await fs.access(filePath);
      const fixes = await fixTargetFile(filePath);
      totalFixesAll += fixes;
      processedFiles++;
    } catch (error) {
      console.error(`❌ File not found or error: ${filePath}`);
    }
  }
  
  console.log(`\n📈 OVERALL SUMMARY:`);
  console.log(`Files processed: ${processedFiles}/${TARGET_FILES.length}`);
  console.log(`Total fixes applied: ${totalFixesAll}`);
  
  if (DRY_RUN) {
    console.log(`\n🧪 DRY RUN COMPLETE - Run without --dry-run to apply changes`);
  } else {
    console.log(`\n✅ FIXES APPLIED - Run 'yarn build' to verify`);
  }
}

fixAllTargetFiles(); 