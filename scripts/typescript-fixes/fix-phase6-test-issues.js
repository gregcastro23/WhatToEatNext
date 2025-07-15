#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🧪 Fixing Phase 6 Test Issues');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Test files that need fixes
const testFiles = [
  'src/__tests__/chakraSystem.test.ts',
  'src/__tests__/culinaryAstrology.test.ts',
  'src/__tests__/ingredientRecommender.test.ts',
  'src/__tests__/astrologize-integration.test.ts',
  'src/__tests__/data/ingredients.test.ts',
  'src/__tests__/services/recipeData.test.ts'
];

// Fix functions for specific issues
function fixZodiacCasing(content) {
  // Fix capitalized zodiac signs to lowercase
  const zodiacMap = {
    '"Libra"': '"libra"',
    '"Scorpio"': '"scorpio"',
    '"Aries"': '"aries"',
    '"Taurus"': '"taurus"',
    '"Gemini"': '"gemini"',
    '"Cancer"': '"cancer"',
    '"Leo"': '"leo"',
    '"Virgo"': '"virgo"',
    '"Sagittarius"': '"sagittarius"',
    '"Capricorn"': '"capricorn"',
    '"Aquarius"': '"aquarius"',
    '"Pisces"': '"pisces"'
  };
  
  let updatedContent = content;
  for (const [oldSign, newSign] of Object.entries(zodiacMap)) {
    updatedContent = updatedContent.replace(new RegExp(oldSign, 'g'), newSign);
  }
  
  return updatedContent;
}

function fixAstrologizeRequest(content) {
  // Fix 'minutes' property to 'minute' in astrologize requests
  return content.replace(/minutes:/g, 'minute:');
}

function addMissingImports(content, filePath) {
  let updatedContent = content;
  
  // Add RecipeIngredient import if needed
  if (content.includes('RecipeIngredient') && !content.includes('import.*RecipeIngredient')) {
    const importStatement = "import { RecipeIngredient } from '@/types/recipeIngredient';\n";
    updatedContent = importStatement + updatedContent;
  }
  
  // Add Recipe import if needed
  if (content.includes(': Recipe') && !content.includes('import.*Recipe')) {
    if (!updatedContent.includes("import { Recipe }")) {
      const importStatement = "import { Recipe } from '@/types/recipe';\n";
      updatedContent = importStatement + updatedContent;
    }
  }
  
  // Add PlanetaryPosition import if needed
  if (content.includes('PlanetaryPosition') && !content.includes('import.*PlanetaryPosition')) {
    if (!updatedContent.includes("import { PlanetaryPosition }")) {
      const importStatement = "import { PlanetaryPosition } from '@/types/celestial';\n";
      updatedContent = importStatement + updatedContent;
    }
  }
  
  return updatedContent;
}

function fixElementStringType(content) {
  // Fix Element type assignment issues
  return content.replace(/Element\.(\w+)/g, '"$1"');
}

function removeIncompatibleProperties(content) {
  // Remove planetaryPositions from AstrologicalState objects that don't support it
  // This is more complex, so we'll make planetaryPositions optional in the interface instead
  return content;
}

// Main fix function
function fixTestFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    
    // Apply fixes based on file type
    if (filePath.includes('chakraSystem.test.ts')) {
      updatedContent = fixZodiacCasing(updatedContent);
    }
    
    if (filePath.includes('astrologize-integration.test.ts')) {
      updatedContent = fixAstrologizeRequest(updatedContent);
      updatedContent = addMissingImports(updatedContent, filePath);
    }
    
    if (filePath.includes('culinaryAstrology.test.ts') || filePath.includes('ingredientRecommender.test.ts')) {
      // These files have planetaryPositions that we made optional in the interface
      updatedContent = addMissingImports(updatedContent, filePath);
    }
    
    if (filePath.includes('ingredients.test.ts') || filePath.includes('recipeData.test.ts')) {
      updatedContent = addMissingImports(updatedContent, filePath);
    }
    
    // Apply general fixes to all test files
    updatedContent = fixElementStringType(updatedContent);
    
    return updatedContent !== content ? updatedContent : null;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Process all test files
let changesCount = 0;

for (const filePath of testFiles) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    continue;
  }
  
  console.log(`\n🧪 Processing: ${filePath}`);
  
  const updatedContent = fixTestFile(fullPath);
  
  if (updatedContent) {
    if (DRY_RUN) {
      console.log(`✅ Would update: ${filePath}`);
      console.log(`📝 Changes: Fixed test-specific TypeScript issues`);
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
console.log(`\n🎯 Phase 6 Test Fixes Summary:`);
console.log(`📊 Files processed: ${testFiles.length}`);
console.log(`✨ Files updated: ${DRY_RUN ? 'DRY RUN' : changesCount}`);

if (DRY_RUN) {
  console.log('\n🚀 Run without --dry-run to apply changes');
} else {
  console.log('\n✅ Test-specific TypeScript issues resolved!');
  console.log('🔧 Next: Run yarn tsc --noEmit to verify fixes');
} 