#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 9 Comprehensive Hotfix - Fix All Syntax Errors');
console.log('='.repeat(60));

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/utils/recipe/recipeFiltering.ts',
    description: 'Fix all syntax errors from overly broad replacements',
    changes: [
      // Fix function parameter syntax errors
      {
        type: 'replace',
        search: 'criteria.ingredientRequirements?: {',
        replace: 'ingredientRequirements?: {'
      },
      // Fix variable references in function calls
      {
        type: 'replace',
        search: '(criteria.excluded) =>',
        replace: '(excluded) =>'
      },
      {
        type: 'replace',
        search: 'criteria.ingredientRequirements?.avoided.toLowerCase()',
        replace: 'excluded.toLowerCase()'
      },
      // Fix other parameter references
      {
        type: 'replace',
        search: 'options.criteria.excludedIngredients',
        replace: 'options.excludedIngredients'
      },
      {
        type: 'replace',
        search: 'options.criteria.emphasized',
        replace: 'options.emphasized'
      },
      {
        type: 'replace',
        search: 'options.criteria.excluded',
        replace: 'options.excluded'
      },
      // Fix any remaining criteria.ingredientRequirements references
      {
        type: 'replace',
        search: 'criteria.ingredientRequirements',
        replace: 'ingredientRequirements'
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
      if (change.type === 'replace') {
        const regex = new RegExp(change.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        if (matches && matches.length > 0) {
          content = content.replace(regex, change.replace);
          modified = true;
          console.log(`    ✅ Replaced ${matches.length} occurrence(s): ${change.search}`);
        } else {
          console.log(`    ⚠️  Could not find text to replace: ${change.search}`);
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
console.log('✅ Phase 14 Batch 9 Comprehensive Hotfix Complete');

if (DRY_RUN) {
  console.log('\n🔄 To apply these changes, run:');
  console.log('node scripts/typescript-fixes/phase-14-batch-9-comprehensive-hotfix.js');
} 