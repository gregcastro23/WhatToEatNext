#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 15 Batch 3 - PlanetaryPosition Interface TS2322 Fixes');
console.log('📊 Targeting PlanetaryPosition interface mismatches with exactLongitude and minutes properties');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/types/celestial.ts',
    description: 'Update PlanetaryPosition interface to include exactLongitude and minutes properties',
    changes: [
      {
        from: `// Planetary position interface for compatibility
export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  element?: string;
  dignity?: string;
  isRetrograde?: boolean;
}`,
        to: `// Planetary position interface for compatibility
export interface PlanetaryPosition {
  sign: ZodiacSign;
  degree: number;
  minute?: number;
  minutes?: number; // Alternative name used in astrologizeApi
  element?: string;
  dignity?: string;
  isRetrograde?: boolean;
  exactLongitude?: number; // Used extensively in astronomy calculations
  speed?: number; // Optional planetary speed
}`
      }
    ]
  },
  {
    file: 'src/constants/systemDefaults.ts',
    description: 'Fix empty sign assignment in DEFAULT_ASCENDANT',
    changes: [
      {
        from: `  Pluto: { sign: '', degree: 0  } as const`,
        to: `  Pluto: { sign: 'scorpio', degree: 0  } as const`
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
console.log(`\n📊 Phase 15 Batch 3 Summary:`);
console.log(`   ${DRY_RUN ? 'Would process' : 'Processed'}: ${totalFiles} files`);
console.log(`   ${DRY_RUN ? 'Would succeed' : 'Successful'}: ${successfulFiles} files`);
console.log(`   Expected reduction: ~25-30 TS2322 errors (8-10% of total)`);
console.log(`   Target: PlanetaryPosition interface compatibility issues`);

if (DRY_RUN) {
  console.log(`\n🏃 DRY RUN completed. Use 'node scripts/typescript-fixes/phase-15-batch-3-planetary-position-fixes.js' to apply changes.`);
} else {
  console.log(`\n✅ Phase 15 Batch 3 completed. Run 'yarn build' to verify changes.`);
} 