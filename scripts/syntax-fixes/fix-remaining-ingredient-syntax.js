#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔧 Fix Remaining Ingredient Syntax Corruption ${DRY_RUN ? '(DRY RUN)' : ''}`);
console.log('='.repeat(60));

// Specific files and their exact corruption patterns from build errors
const fixes = [
  {
    file: 'src/data/ingredients/fruits/index.ts',
    patterns: [
      {
        search: /Object\.\(entries\(fruits\)\?\s*\|\|\s*\[\]\)/g,
        replace: 'Object.entries(fruits || {})',
        description: 'Fix Object.entries corruption'
      }
    ]
  },
  {
    file: 'src/data/ingredients/proteins/index.ts',
    patterns: [
      {
        search: /value\.\(affinities\?\s*\|\|\s*\[\]\)/g,
        replace: '(value.affinities || [])',
        description: 'Fix value.affinities access'
      },
      {
        search: /protein\.\(Array\.isArray\(affinities\?\)\s*\?\s*affinities\?\.\w+\([^)]+\)\s*:\s*affinities\?\s*===\s*\w+\)/g,
        replace: 'Array.isArray(protein.affinities) ? protein.affinities.includes(affinity) : protein.affinities === affinity',
        description: 'Fix protein affinity check'
      }
    ]
  },
  {
    file: 'src/data/ingredients/seasonings/index.ts',
    patterns: [
      {
        search: /value\.\(culinaryApplications\)\?\s*\|\|\s*\[\]/g,
        replace: 'value.culinaryApplications || {}',
        description: 'Fix culinaryApplications access'
      }
    ]
  },
  {
    file: 'src/data/ingredients/spices/index.ts',
    patterns: [
      {
        search: /value\.\(Array\.isArray\(origin\)\s*\?\s*origin\.includes\(origin\)\s*:\s*origin\s*===\s*origin\)/g,
        replace: 'Array.isArray(value.origin) ? value.origin.includes(origin) : value.origin === origin',
        description: 'Fix origin comparison logic'
      }
    ]
  }
];

let totalChanges = 0;

for (const { file, patterns } of fixes) {
  const filePath = path.resolve(file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileChanges = 0;
  
  console.log(`\n📁 Processing: ${file}`);
  
  for (const { search, replace, description } of patterns) {
    const matches = content.match(search);
    if (matches) {
      console.log(`  🔍 Found ${matches.length} instances: ${description}`);
      
      if (!DRY_RUN) {
        content = content.replace(search, replace);
        fileChanges += matches.length;
      } else {
        console.log(`    Would replace: ${matches[0]}`);
        console.log(`    With: ${replace}`);
      }
    }
  }
  
  if (fileChanges > 0 && !DRY_RUN) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Applied ${fileChanges} fixes`);
    totalChanges += fileChanges;
  } else if (fileChanges === 0) {
    console.log(`  ℹ️  No changes needed`);
  }
}

console.log(`\n${'='.repeat(60)}`);
if (DRY_RUN) {
  console.log('🔍 DRY RUN COMPLETE - No files were modified');
  console.log('Run without --dry-run to apply fixes');
} else {
  console.log(`✅ COMPLETE - Applied ${totalChanges} fixes total`);
} 