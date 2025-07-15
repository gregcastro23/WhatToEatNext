#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Fixing Astronomy Utilities and Type Assertions...\n');

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

// 1. Fix astrological-test.tsx type assertion issues
function fixAstrologicalTestFile() {
  console.log('1️⃣ Fixing astrological-test.tsx type assertions...');
  
  const filePath = 'pages/astrological-test.tsx';
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Add proper type guards for planetary alignment access
    const typeGuardCode = `
// Type guard for CelestialPosition
function isCelestialPosition(value: any): value is CelestialPosition {
  return value && typeof value === 'object' && 
         typeof value.sign === 'string' && 
         typeof value.degree === 'number';
}

// Type guard for planetary alignment property access
function getPlanetaryProperty(alignment: PlanetaryAlignment, planet: string, property: string): any {
  const planetData = alignment[planet];
  if (isCelestialPosition(planetData)) {
    return (planetData as any)[property];
  }
  return undefined;
}`;

    // Insert type guards at the top of the file after imports
    const importEndIndex = content.lastIndexOf('import');
    const nextLineIndex = content.indexOf('\n', importEndIndex);
    if (nextLineIndex !== -1) {
      content = content.slice(0, nextLineIndex + 1) + typeGuardCode + content.slice(nextLineIndex + 1);
    }
    
    // Replace problematic property access with type-safe access
    content = content.replace(
      /alignment\[planet\]\.sign/g,
      'getPlanetaryProperty(alignment, planet, "sign")'
    );
    content = content.replace(
      /alignment\[planet\]\.degree/g,
      'getPlanetaryProperty(alignment, planet, "degree")'
    );
    content = content.replace(
      /alignment\[planet\]\.minutes/g,
      'getPlanetaryProperty(alignment, planet, "minutes")'
    );
    content = content.replace(
      /alignment\[planet\]\.exactLongitude/g,
      'getPlanetaryProperty(alignment, planet, "exactLongitude")'
    );
    content = content.replace(
      /alignment\[planet\]\.isRetrograde/g,
      'getPlanetaryProperty(alignment, planet, "isRetrograde")'
    );
    
    updateFile(filePath, content, 'Fixed type assertions with proper type guards');
  } catch (error) {
    console.error(`❌ Error fixing astrological-test.tsx:`, error.message);
  }
}

// 2. Fix test files with CelestialPosition type issues
function fixTestFiles() {
  console.log('2️⃣ Fixing test files with CelestialPosition issues...');
  
  const testFiles = [
    'src/__tests__/culinaryAstrology.test.ts',
    'src/__tests__/ingredientRecommender.test.ts'
  ];
  
  testFiles.forEach(filePath => {
    try {
      let content = readFileSync(filePath, 'utf8');
      
      // Fix CelestialPosition type issues by adding missing properties
      content = content.replace(
        /\{ sign: ['"]([^'"]+)['"], degree: (\d+(?:\.\d+)?), sunSign: ['"]([^'"]+)['"] \}/g,
        '{ sign: "$1", degree: $2 } as CelestialPosition'
      );
      
      // Fix AstrologicalState import conflicts
      content = content.replace(
        /import.*AstrologicalState.*from ['"]@\/types\/celestial['"]/g,
        'import { AstrologicalState } from "@/types/alchemy"'
      );
      
      updateFile(filePath, content, 'Fixed CelestialPosition and AstrologicalState types');
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
  });
}

// 3. Fix RecipeIngredient element property issues in test files
function fixRecipeIngredientTests() {
  console.log('3️⃣ Fixing RecipeIngredient element property issues...');
  
  const testFilePath = 'src/__tests__/services/recipeIngredientService.test.ts';
  try {
    let content = readFileSync(testFilePath, 'utf8');
    
    // Add missing element property to test ingredients
    content = content.replace(
      /\{\s*name: ['"]([^'"]+)['"],\s*amount: (\d+),\s*unit: ['"]([^'"]+)['"],\s*category: ['"]([^'"]+)['"],\s*elementalProperties:/g,
      '{ name: "$1", amount: $2, unit: "$3", element: "Earth", category: "$4", elementalProperties:'
    );
    
    // Add element property to ingredients missing it
    content = content.replace(
      /\{\s*name: ['"]([^'"]+)['"],\s*amount: (\d+),\s*unit: ['"]([^'"]+)['"],\s*category: ['"]([^'"]+)['"]\s*\}/g,
      '{ name: "$1", amount: $2, unit: "$3", element: "Earth", category: "$4" }'
    );
    
    updateFile(testFilePath, content, 'Added missing element property to test ingredients');
  } catch (error) {
    console.error(`❌ Error fixing RecipeIngredient tests:`, error.message);
  }
}

// 4. Fix Recipe type conflicts in test files
function fixRecipeTestConflicts() {
  console.log('4️⃣ Fixing Recipe type conflicts in tests...');
  
  const testFilePath = 'src/__tests__/services/RecipeElementalService.test.ts';
  try {
    let content = readFileSync(testFilePath, 'utf8');
    
    // Fix Recipe type by adding missing required properties
    content = content.replace(
      /\{\s*cuisine: ['"]([^'"]+)['"],\s*cookingMethod: ['"]([^'"]+)['"],\s*ingredients: \[[\s\S]*?\]\s*\}/g,
      (match) => {
        // Add required Recipe properties
        return match.replace(
          /\{\s*cuisine:/,
          '{ id: "test-recipe", name: "Test Recipe", description: "Test description", servingSize: 4, cuisine:'
        );
      }
    );
    
    updateFile(testFilePath, content, 'Fixed Recipe type with required properties');
  } catch (error) {
    console.error(`❌ Error fixing Recipe test conflicts:`, error.message);
  }
}

// 5. Fix duplicate validateIngredient imports
function fixDuplicateImports() {
  console.log('5️⃣ Fixing duplicate validateIngredient imports...');
  
  const testFilePath = 'src/__tests__/data/ingredients.test.ts';
  try {
    let content = readFileSync(testFilePath, 'utf8');
    
    // Remove duplicate imports by keeping only the first occurrence
    const lines = content.split('\n');
    const seenImports = new Set();
    const filteredLines = [];
    
    for (const line of lines) {
      if (line.includes('validateIngredient') && line.includes('import')) {
        const importStatement = line.trim();
        if (!seenImports.has(importStatement)) {
          seenImports.add(importStatement);
          filteredLines.push(line);
        }
        // Skip duplicate imports
      } else {
        filteredLines.push(line);
      }
    }
    
    const updatedContent = filteredLines.join('\n');
    if (updatedContent !== content) {
      updateFile(testFilePath, updatedContent, 'Removed duplicate validateIngredient imports');
    }
  } catch (error) {
    console.error(`❌ Error fixing duplicate imports:`, error.message);
  }
}

// 6. Fix missing astrologicalProfile property in ingredient tests
function fixAstrologicalProfileIssues() {
  console.log('6️⃣ Fixing astrologicalProfile property issues...');
  
  const testFilePath = 'src/__tests__/ingredientRecommender.test.ts';
  try {
    let content = readFileSync(testFilePath, 'utf8');
    
    // Add astrologicalProfile property to test ingredients
    content = content.replace(
      /const mockIngredient[^=]*= \{[\s\S]*?\};/g,
      (match) => {
        if (!match.includes('astrologicalProfile')) {
          return match.replace(
            /(\s*\});/,
            ',\n      astrologicalProfile: {\n        elementalAffinity: { base: "Earth" },\n        rulingPlanets: ["Saturn"]\n      }$1'
          );
        }
        return match;
      }
    );
    
    updateFile(testFilePath, content, 'Added missing astrologicalProfile to test ingredients');
  } catch (error) {
    console.error(`❌ Error fixing astrologicalProfile issues:`, error.message);
  }
}

// Main execution
async function main() {
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No files will be modified\n');
  }
  
  fixAstrologicalTestFile();
  fixTestFiles();
  fixRecipeIngredientTests();
  fixRecipeTestConflicts();
  fixDuplicateImports();
  fixAstrologicalProfileIssues();
  
  if (DRY_RUN) {
    console.log(`\n📊 Summary: ${changes.length} changes would be made`);
    changes.forEach(change => {
      console.log(`  - ${change.file}: ${change.description}`);
    });
    console.log('\n🚀 Run without --dry-run to apply changes');
  } else {
    console.log(`\n✅ Astronomy utilities and type assertion fixes completed!`);
    console.log('🔍 Run yarn tsc --noEmit to check remaining errors');
  }
}

main().catch(console.error); 