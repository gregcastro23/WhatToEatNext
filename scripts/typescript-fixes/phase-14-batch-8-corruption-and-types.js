#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 8 - Fix Corruption Patterns and Types');
console.log('='.repeat(60));

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/services/ConsolidatedIngredientService.ts',
    description: 'Fix corruption patterns and variable scope issues',
    changes: [
      {
        type: 'replace',
        search: 'const categoriesToInclude = filter.categories && (ingredient.$2 || []).length > 0',
        replace: 'const categoriesToInclude = filter.categories && (filter.categories || []).length > 0'
      },
      {
        type: 'replace',
        search: 'if (filter.currentSeason && (ingredient.$2 || []).length > 0) {',
        replace: 'if (filter.currentSeason) {'
      },
      {
        type: 'replace',
        search: 'if (filter.excludeIngredients && (ingredient.$2 || []).length > 0) {',
        replace: 'if (filter.excludeIngredients && (filter.excludeIngredients || []).length > 0) {'
      },
      {
        type: 'replace',
        search: 'if (Array.isArray(ingredient.$3) ? ingredient.$3.includes($5) : ingredient.$3 === $5) {',
        replace: 'if (Array.isArray(ingredient.currentSeason) ? ingredient.currentSeason.includes(currentSeason) : ingredient.currentSeason === currentSeason) {'
      },
      {
        type: 'replace',
        search: 'if (!includeExotic && Array.isArray(ingredient.$3) ? ingredient.$3.includes($5) : ingredient.$3 === $5) {',
        replace: 'if (!includeExotic && ingredient.isExotic) {'
      },
      {
        type: 'replace',
        search: 'const results = filtered?.slice(0, ingredient || []).map(item => ({',
        replace: 'const results = filtered?.slice(0, maxResults || 10).map(item => ({'
      },
      {
        type: 'replace',
        search: 'if (filter.vitamins && (ingredient.$2 || []).length > 0) {',
        replace: 'if (filter.vitamins && (filter.vitamins || []).length > 0) {'
      },
      {
        type: 'replace',
        search: 'if (filter.minerals && (ingredient.$2 || []).length > 0) {',
        replace: 'if (filter.minerals && (filter.minerals || []).length > 0) {'
      }
    ]
  },
  {
    file: 'src/services/AlchemicalRecommendationService.ts',
    description: 'Add missing AlchemicalEngine import and fix variable scope',
    changes: [
      {
        type: 'add_import',
        after: 'import { Element } from "@/types/alchemy";',
        content: `import alchemicalEngine, { AlchemicalEngine } from '@/calculations/core/alchemicalEngine';`
      },
      {
        type: 'replace',
        search: '// Convert thermodynamic properties to elemental properties// Determine dominant element',
        replace: `// Convert thermodynamic properties to elemental properties
    const elementalBalance = this.deriveElementalProperties(thermodynamics);
    
    // Determine dominant element`
      }
    ]
  },
  {
    file: 'src/services/ConsolidatedRecommendationService.ts', 
    description: 'Add missing service imports',
    changes: [
      {
        type: 'add_import',
        after: '// Import consolidated services',
        content: `import { ConsolidatedRecipeService } from './ConsolidatedRecipeService';
import { ConsolidatedIngredientService } from './ConsolidatedIngredientService';`
      }
    ]
  },
  {
    file: 'src/utils/recipe/recipeAdapter.ts',
    description: 'Add missing RecipeData and Ingredient imports',
    changes: [
      {
        type: 'add_import',
        after: 'import { Element } from "@/types/alchemy";',
        content: `import { RecipeData } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';`
      }
    ]
  }
];

function readFileContent(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFileContent(filePath, content) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (DRY_RUN) {
    console.log(`  Would write to: ${filePath}`);
    return;
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✅ Fixed: ${filePath}`);
}

function processFile(fix) {
  console.log(`\n📁 Processing: ${fix.file}`);
  console.log(`   ${fix.description}`);
  
  try {
    let content = readFileContent(fix.file);
    let modified = false;
    
    for (const change of fix.changes) {
      if (change.type === 'add_import') {
        // Find the line after which to add the import
        const lines = content.split('\n');
        const afterIndex = lines.findIndex(line => line.includes(change.after));
        
        if (afterIndex !== -1) {
          lines.splice(afterIndex + 1, 0, change.content);
          content = lines.join('\n');
          modified = true;
          console.log(`    ✅ Added import after: ${change.after}`);
        } else {
          console.log(`    ⚠️  Could not find reference line: ${change.after}`);
        }
      } else if (change.type === 'replace') {
        if (content.includes(change.search)) {
          content = content.replace(change.search, change.replace);
          modified = true;
          console.log(`    ✅ Replaced: ${change.search.substring(0, 50)}...`);
        } else {
          console.log(`    ⚠️  Could not find text to replace: ${change.search.substring(0, 50)}...`);
        }
      }
    }
    
    if (modified) {
      writeFileContent(fix.file, content);
    } else {
      console.log(`    ℹ️  No changes needed`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing ${fix.file}:`, error.message);
  }
}

// Process all fixes
console.log('\nProcessing files...\n');

for (const fix of fixes) {
  processFile(fix);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Phase 14 Batch 8 - Corruption Patterns and Types Fix Complete');

if (DRY_RUN) {
  console.log('\n🔄 To apply these changes, run:');
  console.log('node scripts/typescript-fixes/phase-14-batch-8-corruption-and-types.js');
} 