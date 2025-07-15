#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 12 Batch 5: Fixing TS2304 otherRecipes Variable Error');
console.log('🎯 Target: Missing otherRecipes variable in cuisineFlavorProfiles.ts');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Track changes for reporting
const changes = [];

// Fix missing 'otherRecipes' variable in cuisineFlavorProfiles.ts
function fixOtherRecipesVariable() {
  const filePath = path.join(ROOT_DIR, 'src/data/cuisineFlavorProfiles.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Find the exact line where otherRecipes is used (around line 1272)
  let problemLineIndex = -1;
  let problemLine = '';
  
  for (let i = 1265; i < Math.min(lines.length, 1280); i++) {
    if (lines[i] && lines[i].includes('otherRecipes')) {
      problemLineIndex = i;
      problemLine = lines[i].trim();
      break;
    }
  }
  
  if (problemLineIndex === -1) {
    console.log(`⚠️ ${path.basename(filePath)}: Could not find otherRecipes usage around line 1272`);
    return;
  }
  
  console.log(`📍 Found otherRecipes usage at line ${problemLineIndex + 1}: ${problemLine}`);
  
  // Check if otherRecipes is declared anywhere in the file
  if (content.includes('const otherRecipes') || content.includes('let otherRecipes') || content.includes('var otherRecipes')) {
    console.log(`✅ ${path.basename(filePath)}: otherRecipes variable already declared somewhere`);
    return;
  }

  // Find where to insert the declaration (look for the function that contains this usage)
  let functionStartIndex = -1;
  let functionName = '';
  
  // Look backwards from the problem line to find the function start
  for (let i = problemLineIndex; i >= 0; i--) {
    if (lines[i].includes('export const ') || lines[i].includes('export function ') || 
        lines[i].includes('function ') || (lines[i].includes('const ') && lines[i].includes(' = ('))) {
      functionStartIndex = i;
      functionName = lines[i].trim();
      break;
    }
  }
  
  if (functionStartIndex === -1) {
    console.log(`⚠️ ${path.basename(filePath)}: Could not find function containing otherRecipes usage`);
    return;
  }
  
  console.log(`📍 Found containing function at line ${functionStartIndex + 1}: ${functionName}`);
  
  // Find insertion point inside the function (after opening brace)
  let insertIndex = functionStartIndex + 1;
  
  // Look for the opening brace and insert after it
  for (let i = functionStartIndex; i < problemLineIndex; i++) {
    if (lines[i].includes('{')) {
      insertIndex = i + 1;
      break;
    }
  }

  // Add otherRecipes declaration at the beginning of the function
  const otherRecipesDeclaration = [
    '  // Missing otherRecipes variable declaration',
    '  const otherRecipes = recipes || [];',
    ''
  ];

  changes.push({
    file: filePath,
    description: 'Added missing otherRecipes variable declaration in function scope',
    type: 'function-variable-declaration',
    line: insertIndex + 1
  });

  if (DRY_RUN) {
    console.log(`📝 Would add to ${path.basename(filePath)}:`);
    console.log(`   - otherRecipes variable declaration`);
    console.log(`   - At line ${insertIndex + 1} (inside function: ${functionName.slice(0, 50)}...)`);
  } else {
    lines.splice(insertIndex, 0, ...otherRecipesDeclaration);
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed otherRecipes variable in ${path.basename(filePath)}`);
  }
}

// Execute the fix
console.log('\n🔄 Processing Phase 12 Batch 5 files...\n');

try {
  fixOtherRecipesVariable();
  
  console.log('\n📊 PHASE 12 BATCH 5 SUMMARY:');
  console.log(`✅ Files processed: 1`);
  console.log(`🔧 Changes planned: ${changes.length}`);
  
  if (changes.length > 0) {
    console.log('\n📋 Changes by type:');
    const changeTypes = changes.reduce((acc, change) => {
      acc[change.type] = (acc[change.type] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(changeTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} files`);
    });
  }
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ PHASE 12 BATCH 5 COMPLETE');
    console.log('🔄 Next: Run "yarn build" to verify changes');
  }

} catch (error) {
  console.error('❌ Error during Phase 12 Batch 5 execution:', error);
  process.exit(1);
} 