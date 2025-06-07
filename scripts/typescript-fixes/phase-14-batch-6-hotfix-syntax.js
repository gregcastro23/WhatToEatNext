#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 6 Hotfix: Syntax Error Corrections');
console.log('📍 Fixing: cookingMethodRecommender.ts, recipeFiltering.ts');
if (DRY_RUN) console.log('🏃 DRY RUN MODE - No files will be modified');

// Target files with syntax errors
const targetFiles = [
  'src/utils/cookingMethodRecommender.ts',
  'src/utils/recipe/recipeFiltering.ts'
];

let totalChanges = 0;

async function fixFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changes = 0;

  console.log(`\n📁 Processing: ${filePath}`);

  // Fix cookingMethodRecommender.ts syntax error
  if (filePath.includes('cookingMethodRecommender.ts')) {
    // Fix the malformed property line
    if (content.includes('preferences?.seasonalPreference || false?: string[];')) {
      console.log('  🔧 Fixing malformed property syntax');
      content = content.replace(
        'preferences?.seasonalPreference || false?: string[];',
        'seasonalRecommendations?: string[];'
      );
      changes++;
      console.log('  ✅ Fixed malformed property syntax');
    }
    
    // Fix any other problematic preference replacements
    const problematicPattern = /preferences\?\.\w+\s+\|\|\s+\w+\?\:\s*\w+/g;
    if (content.match(problematicPattern)) {
      content = content.replace(problematicPattern, (match) => {
        console.log(`  🔧 Fixing problematic pattern: ${match}`);
        return 'false'; // Replace with simple fallback
      });
      changes++;
    }
  }

  // Fix recipeFiltering.ts syntax error
  if (filePath.includes('recipeFiltering.ts')) {
    // Fix the missing closing parenthesis
    if (content.includes('recipe.season.includes(options.currentSeason) ? 1 : 0.5;')) {
      console.log('  🔧 Fixing missing closing parenthesis');
      content = content.replace(
        'score *= (recipe.season && recipe.season.includes(options.currentSeason) ? 1 : 0.5;',
        'score *= (recipe.season && recipe.season.includes(options.currentSeason)) ? 1 : 0.5;'
      );
      changes++;
      console.log('  ✅ Fixed missing closing parenthesis');
    }
  }

  // Apply changes if any were made
  if (changes > 0) {
    if (DRY_RUN) {
      console.log(`  🔍 Would make ${changes} changes to ${filePath}`);
    } else {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✅ Applied ${changes} syntax fixes to ${filePath}`);
    }
    totalChanges += changes;
  } else {
    console.log(`  ⚪ No syntax errors found in ${filePath}`);
  }
}

// Process all target files
async function main() {
  console.log('\n🚀 Starting Phase 14 Batch 6 Hotfix...');
  
  for (const file of targetFiles) {
    await fixFile(file);
  }

  console.log('\n📊 Hotfix Summary:');
  console.log(`   📁 Files processed: ${targetFiles.length}`);
  console.log(`   🔧 Total fixes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - No files were modified');
    console.log('💡 Run without --dry-run to apply fixes');
  } else {
    console.log('\n✅ HOTFIX COMPLETE - Syntax errors resolved');
    console.log('🔍 Next: Run "yarn build" to verify fix');
  }
}

main().catch(console.error); 