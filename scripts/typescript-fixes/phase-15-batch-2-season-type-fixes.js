#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 15 Batch 2 - Season Type TS2322 Fixes');
console.log('📊 Targeting Season type mismatches: "fall" and "all" not assignable to Season');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/types/alchemy.ts',
    description: 'Update primary Season type to include "fall" and "all" options',
    changes: [
      {
        from: `export type Season = 'spring' | 'summer' | 'autumn' | 'winter';`,
        to: `export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';`
      }
    ]
  },
  {
    file: 'src/types/seasons.ts',
    description: 'Update seasons type to include "fall" and "all" options for consistency',
    changes: [
      {
        from: `export type Season = 'spring' | 'summer' | 'autumn' | 'winter';`,
        to: `export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';`
      }
    ]
  },
  {
    file: 'src/calculations/alchemicalEngine.ts',
    description: 'Fix specific "fall" usage to use valid Season type',
    changes: [
      {
        from: `      return 'fall';`,
        to: `      return 'autumn';` 
      }
    ]
  }
];

// Helper function to apply changes to a file
function applyChangesToFile(filePath, changes) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changeCount = 0;

  for (const change of changes) {
    if (content.includes(change.from)) {
      content = content.replace(change.from, change.to);
      changeCount++;
      if (DRY_RUN) {
        console.log(`  ✓ Would replace: ${change.from.substring(0, 60)}...`);
      } else {
        console.log(`  ✓ Replaced: ${change.from.substring(0, 60)}...`);
      }
    } else if (!DRY_RUN) {
      console.log(`  ⚠️  Pattern not found: ${change.from.substring(0, 60)}...`);
    }
  }

  if (!DRY_RUN && changeCount > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  return changeCount > 0;
}

// Execute fixes
let totalFiles = 0;
let successfulFiles = 0;

for (const fix of fixes) {
  console.log(`\n🔧 ${DRY_RUN ? 'Would fix' : 'Fixing'}: ${fix.file}`);
  console.log(`📝 ${fix.description}`);
  
  totalFiles++;
  const success = applyChangesToFile(fix.file, fix.changes);
  
  if (success) {
    successfulFiles++;
    console.log(`✅ ${DRY_RUN ? 'Would complete' : 'Completed'}: ${fix.file}`);
  }
}

// Summary
console.log(`\n📊 Phase 15 Batch 2 Summary:`);
console.log(`   ${DRY_RUN ? 'Would process' : 'Processed'}: ${totalFiles} files`);
console.log(`   ${DRY_RUN ? 'Would succeed' : 'Successful'}: ${successfulFiles} files`);
console.log(`   Expected reduction: ~15-20 TS2322 errors (5-6% of total)`);
console.log(`   Target: Season type mismatches with "fall" and "all" values`);

if (DRY_RUN) {
  console.log(`\n🏃 DRY RUN completed. Use 'node scripts/typescript-fixes/phase-15-batch-2-season-type-fixes.js' to apply changes.`);
} else {
  console.log(`\n✅ Phase 15 Batch 2 completed. Run 'yarn build' to verify changes.`);
} 