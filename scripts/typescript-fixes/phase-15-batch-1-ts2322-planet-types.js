#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 15 Batch 1 - TS2322 Planet Type Assignment Fixes');
console.log('📊 Targeting top 3 files: PlanetaryHourCalculator.ts (63 errors), chakra.ts (39 errors), safeAstrology.ts (14 errors)');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/lib/PlanetaryHourCalculator.ts',
    description: 'Fix Planet type assignments - convert lowercase string planets to capitalized Planet type',
    changes: [
      {
        from: `    private static planetaryHours: Record<string, Planet[]> = {
        Sunday:    ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars'],
        Monday:    ['moon', 'saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury'],
        Tuesday:   ['mars', 'sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter'],
        Wednesday: ['mercury', 'moon', 'saturn', 'jupiter', 'mars', 'sun', 'venus'],
        Thursday:  ['jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon', 'saturn'],
        Friday:    ['venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars', 'sun'],
        Saturday:  ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon']
    };`,
        to: `    private static planetaryHours: Record<string, Planet[]> = {
        Sunday:    ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'],
        Monday:    ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury'],
        Tuesday:   ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'],
        Wednesday: ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus'],
        Thursday:  ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'],
        Friday:    ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun'],
        Saturday:  ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon']
    };`
      },
      {
        from: `    // Planetary rulers for each day of the week (0 = Sunday)
    private static dayRulers: Planet[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];`,
        to: `    // Planetary rulers for each day of the week (0 = Sunday)
    private static dayRulers: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];`
      },
      {
        from: `    // Minute rulers - each planet rules approximately 8.57 minutes in sequence
    private static minuteRulers: Planet[] = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars'];`,
        to: `    // Minute rulers - each planet rules approximately 8.57 minutes in sequence
    private static minuteRulers: Planet[] = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];`
      },
      {
        from: `    private readonly planetaryRulers = [
        'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'
    ];`,
        to: `    private readonly planetaryRulers = [
        'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
    ];`
      }
    ]
  },
  {
    file: 'src/types/chakra.ts',
    description: 'Fix Planet type assignments in chakra definitions - convert lowercase string planets to capitalized Planet type',
    changes: [
      {
        from: `    planet: 'saturn'`,
        to: `    planet: 'Saturn'`
      },
      {
        from: `    planet: 'jupiter'`,
        to: `    planet: 'Jupiter'`
      },
      {
        from: `    planet: 'mars'`,
        to: `    planet: 'Mars'`
      },
      {
        from: `    planet: 'venus'`,
        to: `    planet: 'Venus'`
      },
      {
        from: `    planet: 'mercury'`,
        to: `    planet: 'Mercury'`
      },
      {
        from: `    planet: 'moon'`,
        to: `    planet: 'Moon'`
      },
      {
        from: `    planet: 'sun'`,
        to: `    planet: 'Sun'`
      },
      {
        from: `    planet: 'neptune'`,
        to: `    planet: 'Neptune'`
      }
    ]
  },
  {
    file: 'src/utils/safeAstrology.ts',
    description: 'Fix Planet type assignments in astrological utilities - convert lowercase string planets to capitalized Planet type',
    changes: [
      {
        from: `export function getReliablePlanetaryPositions(): Record<string, CelestialPosition> {
  const positions: Record<string, CelestialPosition> = {
    sun: { sign: 'aries', degree: 8.63, exactLongitude: 8.63, isRetrograde: false },
    moon: { sign: 'aries', degree: 3.48, exactLongitude: 3.48, isRetrograde: false },
    mercury: { sign: 'aries', degree: 0.75, exactLongitude: 0.75, isRetrograde: true },
    venus: { sign: 'pisces', degree: 29.0, exactLongitude: 359.0, isRetrograde: true },
    mars: { sign: 'cancer', degree: 22.67, exactLongitude: 112.67, isRetrograde: false },
    jupiter: { sign: 'gemini', degree: 15.53, exactLongitude: 75.53, isRetrograde: false },
    saturn: { sign: 'pisces', degree: 24.13, exactLongitude: 354.13, isRetrograde: false },
    uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
    neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
    pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
    northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
    southNode: { sign: 'virgo', degree: 26.88, exactLongitude: 176.88, isRetrograde: true },
    ascendant: { sign: 'scorpio', degree: 13.88, exactLongitude: 223.88, isRetrograde: false }
  };`,
        to: `export function getReliablePlanetaryPositions(): Record<string, CelestialPosition> {
  const positions: Record<string, CelestialPosition> = {
    Sun: { sign: 'aries', degree: 8.63, exactLongitude: 8.63, isRetrograde: false },
    Moon: { sign: 'aries', degree: 3.48, exactLongitude: 3.48, isRetrograde: false },
    Mercury: { sign: 'aries', degree: 0.75, exactLongitude: 0.75, isRetrograde: true },
    Venus: { sign: 'pisces', degree: 29.0, exactLongitude: 359.0, isRetrograde: true },
    Mars: { sign: 'cancer', degree: 22.67, exactLongitude: 112.67, isRetrograde: false },
    Jupiter: { sign: 'gemini', degree: 15.53, exactLongitude: 75.53, isRetrograde: false },
    Saturn: { sign: 'pisces', degree: 24.13, exactLongitude: 354.13, isRetrograde: false },
    Uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
    Neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
    Pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
    northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
    southNode: { sign: 'virgo', degree: 26.88, exactLongitude: 176.88, isRetrograde: true },
    Ascendant: { sign: 'scorpio', degree: 13.88, exactLongitude: 223.88, isRetrograde: false }
  };`
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
  if (fix.changes.length === 0) {
    console.log(`⏭️  Skipping ${fix.file} - needs manual examination`);
    continue;
  }

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
console.log(`\n📊 Phase 15 Batch 1 Summary:`);
console.log(`   ${DRY_RUN ? 'Would process' : 'Processed'}: ${totalFiles} files`);
console.log(`   ${DRY_RUN ? 'Would succeed' : 'Successful'}: ${successfulFiles} files`);
console.log(`   Expected reduction: ~116 TS2322 errors (25.5% of total)`);

if (DRY_RUN) {
  console.log(`\n🏃 DRY RUN completed. Use 'node scripts/typescript-fixes/phase-15-batch-1-ts2322-planet-types.js' to apply changes.`);
} else {
  console.log(`\n✅ Phase 15 Batch 1 completed. Run 'yarn build' to verify changes.`);
} 