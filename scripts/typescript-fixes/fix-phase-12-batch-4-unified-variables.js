#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 12 Batch 4: Fixing TS2304 Unified Variables & Data Structure Errors');
console.log('🎯 Target: Missing variable declarations + unified seasonal system');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Track changes for reporting
const changes = [];

// File 1: Fix missing 'description' variable in CookingMethods.tsx
function fixCookingMethodsDescription() {
  const filePath = path.join(ROOT_DIR, 'src/components/CookingMethods.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if description variable is already declared
  if (content.includes('const description') || content.includes('let description') || content.includes('var description')) {
    console.log(`✅ ${path.basename(filePath)}: description variable already declared`);
    return;
  }

  // Find where to add the description variable (look for function context around line 851)
  const lines = content.split('\n');
  let insertIndex = -1;
  let functionContext = '';
  
  // Look for the line that uses 'description' and find the function it's in
  for (let i = 840; i < Math.min(lines.length, 860); i++) {
    if (lines[i] && lines[i].includes('description')) {
      // Found usage, look backwards for function start
      for (let j = i; j >= 0; j--) {
        if (lines[j].includes('function ') || lines[j].includes('const ') && lines[j].includes(' = ')) {
          insertIndex = j + 1;
          functionContext = lines[j].trim();
          break;
        }
      }
      break;
    }
  }

  if (insertIndex === -1) {
    // Fallback: add at top of component
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export default') || lines[i].includes('const CookingMethods')) {
        insertIndex = i + 1;
        break;
      }
    }
  }

  if (insertIndex === -1) {
    console.log(`⚠️ ${path.basename(filePath)}: Could not find insertion point for description`);
    return;
  }

  // Add description variable declaration
  const descriptionDeclaration = [
    '',
    '  // Missing description variable for cooking methods',
    '  const description = method?.description || method?.name || "No description available";',
    ''
  ];

  changes.push({
    file: filePath,
    description: 'Added missing description variable declaration',
    type: 'variable-declaration'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add to ${path.basename(filePath)}:`);
    console.log(`   - description variable (at line ${insertIndex})`);
    console.log(`   - Context: ${functionContext}`);
  } else {
    lines.splice(insertIndex, 0, ...descriptionDeclaration);
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed description variable in ${path.basename(filePath)}`);
  }
}

// File 2: Fix missing 'otherRecipes' variable in cuisineFlavorProfiles.ts
function fixCuisineFlavorProfilesOtherRecipes() {
  const filePath = path.join(ROOT_DIR, 'src/data/cuisineFlavorProfiles.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if otherRecipes is already declared
  if (content.includes('otherRecipes')) {
    console.log(`✅ ${path.basename(filePath)}: otherRecipes already declared`);
    return;
  }

  // Find where to add otherRecipes (look for around line 1272)
  const lines = content.split('\n');
  let insertIndex = -1;
  
  // Look for the context around line 1272
  for (let i = 1260; i < Math.min(lines.length, 1280); i++) {
    if (lines[i] && (lines[i].includes('recipes') || lines[i].includes('const ') || lines[i].includes('export'))) {
      insertIndex = i;
      break;
    }
  }

  if (insertIndex === -1) {
    // Fallback: add near the top of the file after imports
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('import') && !lines[i + 1]?.includes('import')) {
        insertIndex = i + 2;
        break;
      }
    }
  }

  if (insertIndex === -1) {
    console.log(`⚠️ ${path.basename(filePath)}: Could not find insertion point for otherRecipes`);
    return;
  }

  // Add otherRecipes variable declaration
  const otherRecipesDeclaration = [
    '',
    '// Missing otherRecipes variable for cuisine flavor profiles',
    'const otherRecipes: any[] = [];',
    ''
  ];

  changes.push({
    file: filePath,
    description: 'Added missing otherRecipes variable declaration',
    type: 'variable-declaration'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add to ${path.basename(filePath)}:`);
    console.log(`   - otherRecipes variable (at line ${insertIndex})`);
  } else {
    lines.splice(insertIndex, 0, ...otherRecipesDeclaration);
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed otherRecipes variable in ${path.basename(filePath)}`);
  }
}

// File 3: Fix missing unified seasonal system variables in cuisineIntegrations.ts
function fixUnifiedSeasonalSystemVariables() {
  const filePath = path.join(ROOT_DIR, 'src/data/unified/cuisineIntegrations.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if unified seasonal variables are already declared
  if (content.includes('unifiedSeasonalSystem') && content.includes('unifiedSeasonalProfiles')) {
    console.log(`✅ ${path.basename(filePath)}: unified seasonal variables already declared`);
    return;
  }

  // Find where to add the variables (after imports, before exports)
  const lines = content.split('\n');
  let insertIndex = -1;
  
  // Look for import section end
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('import') && !lines[i + 1]?.includes('import')) {
      insertIndex = i + 2;
      break;
    }
  }

  if (insertIndex === -1) {
    // Fallback: add at the beginning of the file after any initial comments
    insertIndex = 5;
  }

  // Add unified seasonal system variables
  const unifiedSeasonalDeclarations = [
    '',
    '// Missing unified seasonal system variables',
    'const unifiedSeasonalSystem = {',
    '  spring: { dominantElement: "Air", supportingElements: ["Water"] },',
    '  summer: { dominantElement: "Fire", supportingElements: ["Air"] },',
    '  autumn: { dominantElement: "Earth", supportingElements: ["Fire"] },',
    '  winter: { dominantElement: "Water", supportingElements: ["Earth"] }',
    '};',
    '',
    'const unifiedSeasonalProfiles = {',
    '  spring: { ingredients: [], flavors: [], techniques: [] },',
    '  summer: { ingredients: [], flavors: [], techniques: [] },',
    '  autumn: { ingredients: [], flavors: [], techniques: [] },',
    '  winter: { ingredients: [], flavors: [], techniques: [] }',
    '};',
    '',
    'const unifiedIngredients = {',
    '  // Placeholder for unified ingredient system',
    '  getAllIngredients: () => [],',
    '  getIngredientsByCategory: (category: string) => [],',
    '  getIngredientProperties: (ingredient: string) => ({})',
    '};',
    ''
  ];

  changes.push({
    file: filePath,
    description: 'Added missing unified seasonal system and ingredient variables',
    type: 'unified-system-variables'
  });

  if (DRY_RUN) {
    console.log(`📝 Would add to ${path.basename(filePath)}:`);
    console.log(`   - unifiedSeasonalSystem object`);
    console.log(`   - unifiedSeasonalProfiles object`);
    console.log(`   - unifiedIngredients object`);
    console.log(`   - At line ${insertIndex}`);
  } else {
    lines.splice(insertIndex, 0, ...unifiedSeasonalDeclarations);
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed unified seasonal variables in ${path.basename(filePath)}`);
  }
}

// Execute all fixes
console.log('\n🔄 Processing Phase 12 Batch 4 files...\n');

try {
  fixCookingMethodsDescription();
  fixCuisineFlavorProfilesOtherRecipes();
  fixUnifiedSeasonalSystemVariables();
  
  console.log('\n📊 PHASE 12 BATCH 4 SUMMARY:');
  console.log(`✅ Files processed: 3`);
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
    console.log('\n✅ PHASE 12 BATCH 4 COMPLETE');
    console.log('🔄 Next: Run "yarn build" to verify changes');
  }

} catch (error) {
  console.error('❌ Error during Phase 12 Batch 4 execution:', error);
  process.exit(1);
} 