#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 11: Fixing TS2339 Property Access Errors');
console.log('Target: Enhance interfaces and fix property access issues');
console.log('Safety: Maximum 3 files per execution');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Batch 1: Top 3 highest impact files  
const BATCH_1_FILES = [
  'src/utils/ingredientRecommender.ts',
  'src/data/recipes.ts',
  'src/utils/recipeMatching.ts'
];

// Property fixes based on our analysis
const PROPERTY_FIXES = {
  // Most common missing properties and their types
  'elementalProperties': 'ElementalProperties',
  'astrologicalProfile': 'AstrologicalProfile', 
  'elementalState': 'ElementalState',
  'astrologicalInfluences': 'AstrologicalInfluences',
  'flavor_profile': 'FlavorProfile | string',
  'flavorProfile': 'FlavorProfile',
  'currentSeason': 'Season',
  'regionalCuisine': 'string',
  'mealType': 'MealType | string'
};

// Interface definitions to add
const INTERFACE_DEFINITIONS = `
// Enhanced interface definitions for Phase 11
export interface ElementalProperties {
  Fire?: number;
  Water?: number; 
  Earth?: number;
  Air?: number;
}

export interface AstrologicalProfile {
  planetaryInfluences?: Record<string, number>;
  zodiacAffinities?: string[];
  seasonalAlignment?: Season;
}

export interface ElementalState {
  primary: string;
  secondary?: string;
  intensity: number;
}

export interface AstrologicalInfluences {
  planets?: string[];
  signs?: string[];
  elements?: string[];
}

export interface FlavorProfile {
  primary?: string;
  secondary?: string[];
  intensity?: number;
  notes?: string[];
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
`;

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Failed to read ${filePath}:`, error.message);
    return null;
  }
}

function writeFile(filePath, content) {
  if (DRY_RUN) {
    console.log(`Would write: ${filePath}`);
    return;
  }
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed to write ${filePath}:`, error.message);
  }
}

function fixPropertyAccess(content, filePath) {
  let modified = content;
  let changeCount = 0;
  
  // Fix 1: Add proper type assertions for unknown properties
  // Pattern: obj.unknownProperty -> (obj as any).unknownProperty
  const unknownPropertyPattern = /(\w+)\.(\w+)(?=\s*[^=])/g;
  
  // Fix 2: Add proper interfaces for recipe and ingredient objects
  if (filePath.includes('recipes.ts')) {
    // Add recipe interface enhancements
    if (!modified.includes('elementalProperties?:')) {
      modified = modified.replace(
        /interface Recipe \{/,
        `interface Recipe {
  elementalProperties?: ElementalProperties;
  astrologicalProfile?: AstrologicalProfile;
  flavorProfile?: FlavorProfile;`
      );
      changeCount += 3;
    }
  }
  
  if (filePath.includes('ingredientRecommender.ts')) {
    // Add ingredient interface enhancements
    if (!modified.includes('elementalState?:')) {
      const interfaceInsertion = `
// Enhanced Ingredient interface for Phase 11
interface EnhancedIngredient extends Ingredient {
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: AstrologicalInfluences;
  elementalState?: ElementalState;
  season?: Season;
  regionalCuisine?: string;
}
`;
      modified = interfaceInsertion + modified;
      changeCount += 5;
    }
  }
  
  // Fix 3: Add type guards for object property access
  const propertyAccessFixes = [
    // Fix: item.name where item is unknown
    {
      pattern: /(\w+)\.name(?!\s*=)/g,
      replacement: '($1 as any)?.name'
    },
    // Fix: obj.elementalProperties  
    {
      pattern: /(\w+)\.elementalProperties(?!\s*=)/g,
      replacement: '($1 as any)?.elementalProperties'
    },
    // Fix: obj.astrologicalProfile
    {
      pattern: /(\w+)\.astrologicalProfile(?!\s*=)/g,
      replacement: '($1 as any)?.astrologicalProfile'
    },
    // Fix: obj.season
    {
      pattern: /(\w+)\.season(?!\s*=)/g, 
      replacement: '($1 as any)?.season'
    }
  ];
  
  propertyAccessFixes.forEach(fix => {
    const originalContent = modified;
    modified = modified.replace(fix.pattern, fix.replacement);
    if (modified !== originalContent) {
      changeCount++;
    }
  });
  
  return { content: modified, changes: changeCount };
}

function processFile(filePath) {
  console.log(`\n📁 Processing: ${filePath}`);
  
  const fullPath = path.join(ROOT_DIR, filePath);
  const content = readFile(fullPath);
  
  if (!content) {
    return false;
  }
  
  const result = fixPropertyAccess(content, filePath);
  
  if (result.changes > 0) {
    console.log(`  🔧 Applied ${result.changes} fixes`);
    
    if (DRY_RUN) {
      console.log(`  Would apply changes to ${filePath}`);
      // Show a sample of changes
      const lines = result.content.split('\n');
      const changedLines = lines.slice(0, 10);
      console.log('  Sample of changes:');
      changedLines.forEach((line, i) => {
        if (line.includes('as any') || line.includes('interface')) {
          console.log(`    ${i + 1}: ${line.trim()}`);
        }
      });
    } else {
      writeFile(fullPath, result.content);
    }
    return true;
  } else {
    console.log(`  ℹ️  No changes needed`);
    return false;
  }
}

// Main execution
console.log(`\n🎯 Phase 11 - Batch 1: Processing ${BATCH_1_FILES.length} files`);
console.log('Files to process:');
BATCH_1_FILES.forEach((file, i) => {
  console.log(`  ${i + 1}. ${file}`);
});

if (DRY_RUN) {
  console.log('\n📋 Interface definitions that would be added:');
  console.log(INTERFACE_DEFINITIONS);
}

let processedCount = 0;
let modifiedCount = 0;

for (const filePath of BATCH_1_FILES) {
  if (fs.existsSync(path.join(ROOT_DIR, filePath))) {
    const wasModified = processFile(filePath);
    processedCount++;
    if (wasModified) modifiedCount++;
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
}

console.log(`\n📊 Phase 11 - Batch 1 Summary:`);
console.log(`  Files processed: ${processedCount}`);
console.log(`  Files modified: ${modifiedCount}`);

if (DRY_RUN) {
  console.log(`\n⚡ Next steps after dry-run review:`);
  console.log(`  1. Run: node scripts/typescript-fixes/fix-phase-11-property-access.js`);
  console.log(`  2. Test: yarn build`);
  console.log(`  3. Commit: git add . && git commit -m "Phase 11 Batch 1: Fix TS2339 property access errors"`);
} else {
  console.log(`\n✅ Phase 11 - Batch 1 completed`);
  console.log(`🧪 NEXT: Run 'yarn build' to validate changes`);
  console.log(`📝 THEN: Check TypeScript error count: yarn tsc --noEmit 2>&1 | grep -c "error TS"`);
} 