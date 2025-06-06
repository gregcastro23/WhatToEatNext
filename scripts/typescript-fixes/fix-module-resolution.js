#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔍 Module Resolution Fix Script ${DRY_RUN ? '(DRY RUN)' : ''}`);

// Files to check for problematic exports
const filesToCheck = [
  'src/types/index.ts',
  'src/types/celestial.ts',
  'src/types/alchemy.ts',
  'src/types/utils.ts'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let hasChanges = false;

  // Check for problematic export patterns
  const problematicPatterns = [
    // Duplicate exports
    /export \* from '\.\/utils';\s*export \* from '\.\/utils';/g,
    // Missing file exports
    /export \* from '\.\/nonexistent';/g,
    // Circular imports
    /export \* from '\.\/index';/g
  ];

  problematicPatterns.forEach((pattern, index) => {
    if (pattern.test(newContent)) {
      console.log(`🔧 Found problematic pattern ${index + 1} in ${filePath}`);
      newContent = newContent.replace(pattern, '');
      hasChanges = true;
    }
  });

  // Check for specific issues in types/index.ts
  if (filePath.includes('types/index.ts')) {
    // Remove duplicate utils exports
    const utilsExports = newContent.match(/export \* from '\.\/utils';/g);
    if (utilsExports && utilsExports.length > 1) {
      console.log(`🔧 Removing duplicate utils exports in ${filePath}`);
      // Keep only the first one
      let count = 0;
      newContent = newContent.replace(/export \* from '\.\/utils';/g, () => {
        count++;
        return count === 1 ? "export * from './utils';" : '';
      });
      hasChanges = true;
    }

    // Remove duplicate cuisine exports
    const cuisineExports = newContent.match(/export \* from '\.\/cuisine';/g);
    if (cuisineExports && cuisineExports.length > 1) {
      console.log(`🔧 Removing duplicate cuisine exports in ${filePath}`);
      let count = 0;
      newContent = newContent.replace(/export \* from '\.\/cuisine';/g, () => {
        count++;
        return count === 1 ? "export * from './cuisine';" : '';
      });
      hasChanges = true;
    }
  }

  if (hasChanges) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed ${filePath}`);
    } else {
      console.log(`📝 Would fix ${filePath}`);
    }
  } else {
    console.log(`✓ No issues found in ${filePath}`);
  }
}

// Check if all required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'src/types/utils.ts',
    'src/types/cuisine.ts',
    'src/types/zodiacAffinity.ts',
    'src/types/elemental.ts',
    'src/types/nutrition.ts',
    'src/types/spoonacular.ts',
    'src/types/recipe.ts',
    'src/types/zodiac.ts',
    'src/types/time.ts',
    'src/types/seasons.ts',
    'src/types/seasonal.ts',
    'src/types/chakra.ts',
    'src/types/astrology.ts',
    'src/types/astrological.ts',
    'src/types/lunar.ts',
    'src/types/food.ts',
    'src/types/ingredient.ts',
    'src/types/cookingMethod.ts',
    'src/types/recipeIngredient.ts',
    'src/types/recipes.ts',
    'src/types/ingredient-compatibility.ts',
    'src/types/validation.ts'
  ];

  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.log(`⚠️  Missing files that are being exported:`);
    missingFiles.forEach(file => console.log(`   - ${file}`));
    
    // Create empty files for missing ones
    missingFiles.forEach(file => {
      if (!DRY_RUN) {
        const dir = path.dirname(file);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(file, '// Empty file created to resolve module imports\n');
        console.log(`📄 Created empty file: ${file}`);
      } else {
        console.log(`📝 Would create empty file: ${file}`);
      }
    });
  } else {
    console.log(`✅ All required files exist`);
  }
}

// Main execution
console.log('🔍 Checking for missing files...');
checkRequiredFiles();

console.log('\n🔍 Checking files for problematic exports...');
filesToCheck.forEach(fixFile);

console.log(`\n${DRY_RUN ? '📝 Dry run complete' : '✅ Module resolution fix complete'}`);
console.log('💡 Run "yarn build" to test the fixes'); 